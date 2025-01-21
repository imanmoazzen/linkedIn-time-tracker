import * as fs from "fs/promises";
import * as path from "path";
import * as readline from "readline/promises";

import esbuild from "esbuild";
import { exec } from "child_process";

const SOURCE_DIRECTORY = "./extension_code";
const BUILD_DIRECTORY = "./build";
const OUTPUT_DIRECTORY = "./out";

const MANIFEST_PATH = "./manifest.json";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout) => {
      if (err) reject(err);
      resolve(stdout);
    });
  });
}

async function loadJSON(path) {
  return JSON.parse(await fs.readFile(path, "utf8"));
}

async function incrementManifestVersions(versionBumpChoice) {
  const manifest = await loadJSON(MANIFEST_PATH);
  const newVersion = incrementVersion(manifest.version, versionBumpChoice);
  manifest.version = newVersion;
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest));
  await execPromise(`npx prettier "${MANIFEST_PATH}" --write`);
  return newVersion;
}

// Versions are split into MAJOR.MINOR.PATCH.
// versionBumpChoice can be one of ["m","n","p"],
// increment the major, minor, or patch numbers respectively.
// ADDITIONALLY: If bumping the patch number would result in a number greater than 10,
// bump the minor number instead.
function incrementVersion(semverString, versionBumpChoice) {
  const [major, minor, patch] = semverString.split(".").map((part) => Number(part));
  if (versionBumpChoice === "p" && patch + 1 >= 10) {
    console.log("Patch number would be greater than or equal to 10, bumping minor number instead.");
    versionBumpChoice = "n";
  }
  if (versionBumpChoice === "m") {
    return `${major + 1}.0.0`;
  } else if (versionBumpChoice === "n") {
    return `${major}.${minor + 1}.0`;
  } else {
    return `${major}.${minor}.${patch + 1}`;
  }
}

function build() {
  return esbuild.build({
    entryPoints: [path.join(SOURCE_DIRECTORY, "background.js"), path.join(SOURCE_DIRECTORY, "content.js")],
    bundle: true,
    minify: false,
    loader: { ".js": "jsx", ".png": "dataurl", ".webp": "dataurl" },
    jsx: "automatic",
    outdir: BUILD_DIRECTORY,
    sourcemap: true,
  });
}

async function copyManifest() {
  return await fs.copyFile(MANIFEST_PATH, path.join(BUILD_DIRECTORY, "manifest.json"));
}

function handleError(err) {
  console.error("An error occurred while building: ", err);
  process.exit(1);
}

async function copyAssets() {
  const copyCssPromise = fs.readdir(SOURCE_DIRECTORY).then((filePaths) => {
    const cssPaths = filePaths.filter((filePath) => filePath.endsWith(".css"));
    const copyPromises = cssPaths.map((filePath) =>
      fs.copyFile(path.join(SOURCE_DIRECTORY, filePath), path.join(BUILD_DIRECTORY, path.basename(filePath)))
    );
    return Promise.all(copyPromises);
  });

  await Promise.all([
    copyCssPromise,
    fs.cp(path.join(SOURCE_DIRECTORY, "assets"), path.join(BUILD_DIRECTORY, "assets"), { recursive: true }),
  ]);
}

async function createZip() {
  await execPromise(`cd ${BUILD_DIRECTORY} && npx bestzip .${OUTPUT_DIRECTORY}/prod-chrome-ext.zip * && cd ..`);
}

// helper function to prompt the command line user for input
// if `options` is an array of strings, only allow the user to pick between them.
// if `options` is an null, allow any input string
async function prompt(message, options = null) {
  while (true) {
    const response = await rl.question(message);
    if (options && options.includes(response)) return response;
    if (!options) return response;
    console.log(`"${response}" is not a valid option. The valid options are: ${options.join(", ")}`);
  }
}

async function run() {
  await fs.rm(BUILD_DIRECTORY, { force: true, recursive: true });
  await fs.mkdir(BUILD_DIRECTORY);

  await build();
  await copyManifest();
  await copyAssets();
  await createZip();
  console.log("Completed build");
}

console.time("Execution time");
try {
  const versionBumpChoice = await prompt("Is this a (m)ajor, mi(n)or, or (p)atch release?\n", ["m", "n", "p"]);
  await fs.rm(OUTPUT_DIRECTORY, { force: true, recursive: true });
  await fs.mkdir(OUTPUT_DIRECTORY);
  const version = await incrementManifestVersions(versionBumpChoice);
  console.log("Incremented manifest versions to: " + version);
  await run();
  console.log("Finished preparing zip files.");
} catch (err) {
  handleError(err);
} finally {
  rl.close();
}
console.timeEnd("Execution time");

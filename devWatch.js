import * as fs from "fs/promises";
import * as path from "path";

import esbuild from "esbuild";

const SOURCE_DIRECTORY = "./extension_code";
const DEV_MANIFEST = "./manifest.json";
const DEV_DIRECTORY = "./dev-build";

async function copyFiles() {
  const copyCssPromise = fs.readdir(SOURCE_DIRECTORY).then((filePaths) => {
    const cssPaths = filePaths.filter((filePath) => filePath.endsWith(".css"));
    const copyPromises = cssPaths.map((filePath) =>
      fs.copyFile(
        path.join(SOURCE_DIRECTORY, filePath),
        path.join(DEV_DIRECTORY, path.basename(filePath))
      )
    );
    return Promise.all(copyPromises);
  });
  await Promise.all([
    copyCssPromise,
    fs.cp(
      path.join(SOURCE_DIRECTORY, "assets"),
      path.join(DEV_DIRECTORY, "assets"),
      { recursive: true }
    ),
    fs.copyFile(DEV_MANIFEST, path.join(DEV_DIRECTORY, "manifest.json")),
  ]);
}

await fs.rm(DEV_DIRECTORY, { force: true, recursive: true });
await fs.mkdir(DEV_DIRECTORY);
await copyFiles();

const ctx = await esbuild.context({
  entryPoints: [
    path.join(SOURCE_DIRECTORY, "background.js"),
    path.join(SOURCE_DIRECTORY, "content.js"),
  ],
  bundle: true,
  loader: {
    ".js": "jsx",
    ".png": "dataurl",
    ".webp": "dataurl",
  },
  jsx: "automatic",
  outdir: "dev-build",
  sourcemap: true,
  define: {
    "process.env.NODE_ENV": '"development"',
  },
});

await ctx.watch({});
console.log("Watching...");

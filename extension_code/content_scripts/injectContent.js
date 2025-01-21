import { Panel } from "./Panel.js";
import ReactDOM from "react-dom/client";

export const SHADOW_HOST_ID = "linkedin-tracker-shadow-host";
const UI_CONTAINER_ID = "linkedin-tracker-extension-container";

export default async function injectContent() {
  const shadowHost = document.createElement("div");
  shadowHost.id = SHADOW_HOST_ID;
  shadowHost.style.position = "fixed";
  shadowHost.style.width = "0px";
  shadowHost.style.height = "0px";
  shadowHost.style.top = "0px";
  shadowHost.style.left = "0px";
  shadowHost.style.zIndex = "99999";
  shadowHost.style.overflow = "visible";
  document.body.appendChild(shadowHost);

  const shadowRoot = shadowHost.attachShadow({ mode: "closed" });
  const container = document.createElement("div");
  container.id = UI_CONTAINER_ID;
  container.style.opacity = 0;
  shadowRoot.appendChild(container);

  // because of dynamic fetching, they need to be declared in web accessible resources.
  const stylesheetUrl = chrome.runtime.getURL("content.css");
  const globalStylesheetUrl = chrome.runtime.getURL("content-global.css");
  const fontStylesheetUrl = chrome.runtime.getURL("font-declarations.css");
  const styleSheetPromise = injectCSS(shadowRoot, stylesheetUrl);
  const globalStyleSheetPromise = injectCSS(shadowRoot, globalStylesheetUrl);

  // An exception: @font-face doesn't work inside a Shadow DOM, so this is injected
  // into the document instead.
  const fontStylesheetPromise = injectCSS(document.body, fontStylesheetUrl);

  const reactRoot = ReactDOM.createRoot(container);
  reactRoot.render(<Panel />);

  // wait until either:
  //   - 500ms has passed
  //   - all of the stylesheets have either loaded or failed to load
  await Promise.any([
    timeoutPromise(500),
    Promise.allSettled([
      styleSheetPromise,
      globalStyleSheetPromise,
      fontStylesheetPromise,
    ]),
  ]);

  container.style.opacity = 1;
}

// Returns a promise which resolves when the stylesheet has loaded,
// and rejects if there was an error
function injectCSS(target, url) {
  const stylesheetElement = document.createElement("link");
  stylesheetElement.rel = "stylesheet";
  stylesheetElement.setAttribute("href", url);
  target.appendChild(stylesheetElement);
  return new Promise((resolve, reject) => {
    stylesheetElement.onload = () => resolve();
    stylesheetElement.onerror = () => reject();
  });
}

// Returns a promise which resolves after 'time' milliseconds has passed.
function timeoutPromise(time) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), time);
  });
}

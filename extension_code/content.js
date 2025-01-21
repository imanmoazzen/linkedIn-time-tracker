import injectContent from "./content_scripts/injectContent.js";

if (window.location.href.includes("linkedin.com")) {
  chrome.runtime.sendMessage({ action: "startTracking" });
  injectContent();

  window.addEventListener("beforeunload", () => {
    chrome.runtime.sendMessage({ action: "stopTracking" });
  });
}

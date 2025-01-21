let activeTabId = null;
let startTime = null;

// Function to start tracking when a LinkedIn tab is activated
function startTracking(tabId) {
  if (!startTime) {
    startTime = Date.now();
    activeTabId = tabId;
  }
}

// Function to stop tracking when the user leaves LinkedIn
function stopTracking() {
  if (startTime) {
    const duration = (Date.now() - startTime) / 1000;
    saveSession(duration);
    startTime = null;
    activeTabId = null;
  }
}

// Function to save session duration
function saveSession(duration) {
  const timestamp = new Date().toISOString();
  chrome.storage.local.get({ linkedinSessions: [] }, (data) => {
    const sessions = data.linkedinSessions;
    sessions.push({ timestamp, duration });
    chrome.storage.local.set({ linkedinSessions: sessions });
  });
}

// Listen for tab activations
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url && tab.url.includes("linkedin.com")) {
      startTracking(activeInfo.tabId);
    } else {
      stopTracking();
    }
  });
});

// Listen for tab updates (including navigation within LinkedIn)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && tab.url.includes("linkedin.com")) {
    // Continue tracking, even if the user navigates within LinkedIn
    startTracking(tabId);
  } else if (activeTabId === tabId && changeInfo.status === "complete") {
    // Stop tracking only if user leaves LinkedIn
    stopTracking();
  }
});

// Listen for tab closure
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === activeTabId) {
    stopTracking();
  }
});

// Listen for window focus changes (e.g., minimizing the window)
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    stopTracking();
  }
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "startTracking") {
    startTracking(sender.tab.id); // Start tracking for this tab
  } else if (message.action === "stopTracking") {
    stopTracking();
  }
});

chrome.action.onClicked.addListener((tab) => {
  console.log("Extension clicked!");
});

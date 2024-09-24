chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("cleanupBookmarks", { periodInMinutes: 60 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "cleanupBookmarks") {
    chrome.storage.local.get({ tempBookmarks: [] }, ({ tempBookmarks }) => {
      const now = Date.now();
      const updatedBookmarks = tempBookmarks.filter(
        (bookmark) => bookmark.expiration > now
      );

      chrome.storage.local.set({ tempBookmarks: updatedBookmarks });
    });
  }
});

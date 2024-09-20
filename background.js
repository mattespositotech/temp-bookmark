chrome.runtime.onInstalled.addListener(function () {
  chrome.alarms.create("cleanupBookmarks", { periodInMinutes: 60 });
});

chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name === "cleanupBookmarks") {
    chrome.storage.local.get({ tempBookmarks: [] }, function (result) {
      let tempBookmarks = result.tempBookmarks;
      let now = Date.now();
      let updatedBookmarks = tempBookmarks.filter(
        (bookmark) => bookmark.expiration > now
      );

      chrome.storage.local.set({ tempBookmarks: updatedBookmarks });
    });
  }
});

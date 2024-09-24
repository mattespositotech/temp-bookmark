const hourInMilliseconds = 60 * 60 * 1000;
const dayInMilliseconds = hour * 24;

document.addEventListener("DOMContentLoaded", function () {
  const daysElement = document.getElementById("days");

  document.getElementById("saveBtn").addEventListener("click", () => saveBookmark(daysElement));
  document.getElementById("increase").addEventListener("click", () => increaseDays(daysElement));
  document.getElementById("decrease").addEventListener("click", () => decreaseDays(daysElement));
  document.getElementById("bookmarks").addEventListener("click", handleBookmarkActions);

  loadBookmarks();
});

function increaseDays(daysElement) {
  const currentDays = parseInt(daysElement.innerText);
  daysElement.innerText = Math.min(currentDays + 1, 99);
}

function decreaseDays(daysElement) {
  const currentDays = parseInt(daysElement.innerText);
  daysElement.innerText = Math.max(currentDays - 1, 1);
}

function saveBookmark(daysElement) {
  const days = parseInt(daysElement.innerText);

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs[0];
    const bookmarkData = {
      title: tab.title,
      url: tab.url,
      expiration: Date.now() + days * dayInMilliseconds,
    };

    chrome.storage.local.get({ tempBookmarks: [] }, function (result) {
      const tempBookmarks = result.tempBookmarks;
      tempBookmarks.push(bookmarkData);
      chrome.storage.local.set({ tempBookmarks: tempBookmarks }, loadBookmarks);
    });
  });
}

function loadBookmarks() {
  chrome.storage.local.get({ tempBookmarks: [] }, function (result) {
    const bookmarksContainer = document.getElementById("bookmarks");
    bookmarksContainer.innerHTML = "";

    const tempBookmarks = result.tempBookmarks;
    const now = Date.now();

    if (tempBookmarks.length === 0) {
      bookmarksContainer.innerHTML = "<p>No temporary bookmarks.</p>";
      return;
    }

    tempBookmarks.forEach(function (bookmark, index) {
      const timeLeft = bookmark.expiration - now;
      if (timeLeft > 0) {
        const daysLeft = Math.floor(timeLeft / dayInMilliseconds);
        const hoursLeft = Math.floor((timeLeft % dayInMilliseconds) / hourInMilliseconds);

        const bookmarkElement = document.createElement("div");
        bookmarkElement.className = "bookmark-item";
        bookmarkElement.innerHTML = `
          <div class="bookmark-info">
            <div class="bookmark-link" title="${bookmark.title}">
              <a href="${bookmark.url}" target="_blank">${bookmark.title}</a>
            </div>
            <div class="bookmark-timer">Time left: ${daysLeft} days, ${hoursLeft} hours</div>
          </div>
          <div class="action-buttons">
            <div class="svg-container" data-action="addDay" data-index="${index}">
              <svg class="bookmark-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <title>Add Another Day</title>
                <path fill="green" d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM151.2 217.4c-4.6 4.2-7.2 10.1-7.2 16.4c0 12.3 10 22.3 22.3 22.3h41.7v96c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32v-96h41.7c12.3 0 22.3-10 22.3-22.3c0-6.2-2.6-12.1-7.2-16.4l-91-84c-3.8-3.5-8.7-5.4-13.9-5.4s-10.1 1.9-13.9 5.4l-91 84z"/>
              </svg>
            </div>
            <div class="svg-container" data-action="deleteBookmark" data-index="${index}">
              <svg class="bookmark-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <title>Delete Bookmark</title>
                <path fill="darkred" d="M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3C434.9 335.9 448 297.5 448 256c0-106-86-192-192-192c-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"/>
              </svg>
            </div>
          </div>`;

        bookmarksContainer.appendChild(bookmarkElement);
      }
    });
  });
}

function handleBookmarkActions(event) {
  const target = event.target.closest(".svg-container");
  if (!target) return;

  const action = target.dataset.action;
  const index = parseInt(target.dataset.index);

  if (action === "addDay") {
    addDay(index);
  } else if (action === "deleteBookmark") {
    deleteBookmark(index);
  }
}

function addDay(index) {
  chrome.storage.local.get({ tempBookmarks: [] }, function (result) {
    const tempBookmarks = result.tempBookmarks;
    tempBookmarks[index].expiration += dayInMilliseconds; 
    chrome.storage.local.set({ tempBookmarks: tempBookmarks }, loadBookmarks); 
  });
}

function deleteBookmark(index) {
  chrome.storage.local.get({ tempBookmarks: [] }, function (result) {
    const tempBookmarks = result.tempBookmarks;
    tempBookmarks.splice(index, 1);
    chrome.storage.local.set({ tempBookmarks: tempBookmarks }, loadBookmarks);
  });
}

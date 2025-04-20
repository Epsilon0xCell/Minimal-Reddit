chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    const url = new URL(details.url);

    // Only act on direct subreddit pages (e.g., /r/something)
    const subredditMatch = url.pathname.match(/^\/r\/([^\/]+)\/?$/);
    if (subredditMatch) {
      const subreddit = subredditMatch[1];
      const newUrl = `https://www.reddit.com/r/${subreddit}/wiki/index`;
      return { redirectUrl: newUrl };
    }

    return {}; // do nothing for other URLs
  },
  { urls: ["*://www.reddit.com/r/*"], types: ["main_frame"] },
  ["blocking"]
);

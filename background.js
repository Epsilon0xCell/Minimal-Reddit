chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    const url = new URL(details.url);

    // Match subreddit root (e.g., /r/something)
    const subredditMatch = url.pathname.match(/^\/r\/([^\/]+)\/?$/);
    if (subredditMatch) {
      const subreddit = subredditMatch[1];
      const redirectUrl = `https://www.reddit.com/r/${subreddit}/wiki/index`;
      return { redirectUrl };
    }

    return {};
  },
  { urls: ["*://www.reddit.com/r/*"], types: ["main_frame"] },
  ["blocking"]
);

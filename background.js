// This listener has to run before the request leaves the browser, and
// it has to be able to change where the request goes. That is why the
// extension is manifest version 2 with webRequestBlocking: version 3
// removed blocking webRequest for ordinary extensions, so this design
// cannot be ported to MV3 as a settings change, only as a rewrite.
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    const url = new URL(details.url);

    // The pattern is anchored at both ends and allows one optional
    // trailing slash, so it matches a subreddit root and nothing below
    // it: /r/name/comments/... has more path after the name and cannot
    // match, which is what keeps post and comment pages out of this.
    const subredditMatch = url.pathname.match(/^\/r\/([^\/]+)\/?$/);
    if (subredditMatch) {
      const subreddit = subredditMatch[1];
      // url.search is carried over on purpose. Dropping it (the old
      // behaviour) silently lost feed and sorting parameters the user
      // had in the original link.
      const redirectUrl = `https://www.reddit.com/r/${subreddit}/wiki/index${url.search}`;
      return { redirectUrl };
    }

    // Returning an empty object, rather than nothing, is the documented
    // "no change" answer for a blocking listener.
    return {};
  },
  // The filter does the first cut before the regex ever runs: only
  // top-level page loads (main_frame) on www.reddit.com subreddit paths
  // reach the listener at all, so images, XHR, and other hosts cost
  // nothing here.
  { urls: ["*://www.reddit.com/r/*"], types: ["main_frame"] },
  ["blocking"]
);

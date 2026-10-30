// I keep this extension on manifest version 2 on purpose. My listener
// has to run before the request leaves the browser and has to change
// where the request goes, and that needs webRequestBlocking. Version 3
// took blocking webRequest away from ordinary extensions, so moving to
// MV3 is a rewrite of how this works, not a settings change.
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    // I parse the URL instead of splitting the string myself so the
    // path, the query, and the fragment stay in separate boxes. My
    // regex below only ever sees the clean path, and the query is still
    // intact further down when I carry it over.
    const url = new URL(details.url);

    // I anchor this pattern at both ends and allow one optional
    // trailing slash, so it matches a subreddit root and nothing below
    // it. /r/name/comments/... has more path after the name and cannot
    // match, which is what keeps post and comment pages out of this.
    // The name segment also cannot contain a slash, so a captured name
    // can never smuggle an extra path step into my redirect target.
    const subredditMatch = url.pathname.match(/^\/r\/([^\/]+)\/?$/);
    if (subredditMatch) {
      const subreddit = subredditMatch[1];
      // I append url.search on purpose. I used to drop it, and that
      // silently lost the feed and sorting parameters a link carried.
      // The wiki path I build here has extra segments after the name,
      // so it fails my own anchored pattern when the browser runs this
      // listener on the redirect itself. That is what stops a loop.
      const redirectUrl = `https://www.reddit.com/r/${subreddit}/wiki/index${url.search}`;
      return { redirectUrl };
    }

    // I return an empty object rather than nothing because that is the
    // documented "no change" answer for a blocking listener.
    return {};
  },
  // I let the filter do the first cut before my regex ever runs: only
  // top-level page loads (main_frame) on www.reddit.com subreddit paths
  // reach the listener at all, so images, scripts, XHR, and other hosts
  // cost me nothing here. It also means old.reddit.com is out of scope
  // by design, not by accident.
  { urls: ["*://www.reddit.com/r/*"], types: ["main_frame"] },
  ["blocking"]
);

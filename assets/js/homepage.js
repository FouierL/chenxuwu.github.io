(function () {
  var nav = document.getElementById("site-navigation");
  if (!nav) return;

  // Keep section navigation on this project page and clear the sticky header.
  nav.addEventListener("click", function (event) {
    var link = event.target.closest('a[href^="#"]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var target = document.getElementById(link.getAttribute("href").slice(1));
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    history.replaceState(null, "", location.pathname + location.search + link.getAttribute("href"));
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    });
  }, true);
}());

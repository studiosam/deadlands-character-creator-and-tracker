/**
 * Static-app boot sequence.
 *
 * index.html loads classic scripts in dependency order, then this file performs
 * the first render pass and reveals the shell. Keep boot work idempotent so
 * reloads, direct-file use, and hosted GitHub Pages runs behave the same way.
 */
function revealAppAfterBoot() {
  const reveal = () => document.body.classList.remove("app-booting");
  if (document.readyState === "complete") {
    reveal();
    return;
  }
  window.addEventListener("load", reveal, { once: true });
}

try {
  catalogs();
  updatePreviews();
  render();
  renderLandingPage();
  renderDemoExperience();
} finally {
  revealAppAfterBoot();
}

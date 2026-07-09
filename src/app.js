/**
 * Static-app boot sequence.
 *
 * index.html loads classic scripts in dependency order, then this file performs
 * the first render pass and reveals the shell. Keep boot work idempotent so
 * reloads, direct-file use, and hosted GitHub Pages runs behave the same way.
 */
function revealAppAfterBoot() {
  document.body.classList.remove("app-booting");
}

function performInitialRender() {
  initializeAppTheme();
  installUndoHistoryInteractionTracking();
  syncUndoHistoryForActiveCharacter();
  catalogs();
  updatePreviews();
  render();
  if (setupResumeOnBoot) {
    setLandingVisible(false);
    setAppTab("character", { history: false });
    renderDemoExperience();
    return;
  }
  renderLandingPage();
  renderDemoExperience();
}

function bootAppAfterPageLoad() {
  try {
    performInitialRender();
  } finally {
    revealAppAfterBoot();
  }
}

if (document.readyState === "complete") {
  bootAppAfterPageLoad();
} else {
  window.addEventListener("load", bootAppAfterPageLoad, { once: true });
}

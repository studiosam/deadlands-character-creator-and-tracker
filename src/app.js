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

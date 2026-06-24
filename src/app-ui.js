let activeDialogResolve = null;

function appToast(message, tone = "info") {
  const region = document.getElementById("toastRegion");
  if (!region || !message) return;
  const toast = document.createElement("div");
  toast.className = `toast ${tone}`;
  toast.textContent = message;
  region.appendChild(toast);
  window.setTimeout(() => toast.classList.add("show"), 20);
  window.setTimeout(() => {
    toast.classList.remove("show");
    window.setTimeout(() => toast.remove(), 180);
  }, 4200);
}

function resetAppDialog() {
  const choices = document.getElementById("appDialogChoices");
  const inputLabel = document.getElementById("appDialogInputLabel");
  const input = document.getElementById("appDialogInput");
  const confirmButton = document.getElementById("appDialogConfirmBtn");
  const cancelButton = document.getElementById("appDialogCancelBtn");

  choices.innerHTML = "";
  choices.classList.add("hidden");
  input.value = "";
  input.type = "text";
  inputLabel.classList.add("hidden");
  confirmButton.classList.remove("danger");
  confirmButton.classList.remove("hidden");
  cancelButton.textContent = "Cancel";
  confirmButton.textContent = "Confirm";
}

function resolveAppDialog(value) {
  const dialog = document.getElementById("appDialog");
  const resolver = activeDialogResolve;
  activeDialogResolve = null;
  if (dialog?.open) dialog.close();
  if (resolver) resolver(value);
}

function openAppDialog(options) {
  const dialog = document.getElementById("appDialog");
  const title = document.getElementById("appDialogTitle");
  const message = document.getElementById("appDialogMessage");
  const inputLabel = document.getElementById("appDialogInputLabel");
  const inputText = document.getElementById("appDialogInputText");
  const input = document.getElementById("appDialogInput");
  const choices = document.getElementById("appDialogChoices");
  const confirmButton = document.getElementById("appDialogConfirmBtn");
  const cancelButton = document.getElementById("appDialogCancelBtn");

  if (!dialog) return Promise.resolve(options.fallbackValue ?? false);
  if (activeDialogResolve) resolveAppDialog(false);
  resetAppDialog();

  title.textContent = options.title || "Confirm action";
  message.textContent = options.message || "";
  cancelButton.textContent = options.cancelText || "Cancel";
  confirmButton.textContent = options.confirmText || "Confirm";
  confirmButton.classList.toggle("danger", Boolean(options.danger));

  if (options.input) {
    inputLabel.classList.remove("hidden");
    inputText.textContent = options.inputLabel || options.title || "Value";
    input.type = options.inputType || "text";
    input.value = options.defaultValue || "";
  }

  if (Array.isArray(options.choices) && options.choices.length) {
    confirmButton.classList.add("hidden");
    choices.classList.remove("hidden");
    options.choices.forEach((choice) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = choice.label;
      button.className = choice.danger ? "danger" : choice.ghost ? "ghost" : "";
      button.onclick = () => resolveAppDialog(choice.value);
      choices.appendChild(button);
    });
  }

  confirmButton.onclick = (event) => {
    event.preventDefault();
    resolveAppDialog(options.input ? input.value : true);
  };
  cancelButton.onclick = (event) => {
    event.preventDefault();
    resolveAppDialog(null);
  };
  dialog.oncancel = (event) => {
    event.preventDefault();
    resolveAppDialog(null);
  };

  return new Promise((resolve) => {
    activeDialogResolve = resolve;
    if (dialog.showModal) dialog.showModal();
    else dialog.setAttribute("open", "");
    if (options.input) input.focus();
    else if (!confirmButton.classList.contains("hidden")) confirmButton.focus();
  });
}

async function appConfirm(message, options = {}) {
  const result = await openAppDialog({
    title: options.title || "Confirm action",
    message,
    confirmText: options.confirmText || "Continue",
    cancelText: options.cancelText || "Cancel",
    danger: Boolean(options.danger),
  });
  return result === true;
}

async function appPrompt(message, defaultValue = "", options = {}) {
  const result = await openAppDialog({
    title: options.title || "Enter value",
    message,
    confirmText: options.confirmText || "Save",
    cancelText: options.cancelText || "Cancel",
    input: true,
    inputType: options.inputType || "text",
    inputLabel: options.inputLabel || "Value",
    defaultValue,
  });
  return result === null ? null : String(result);
}

async function appChoice(message, choices, options = {}) {
  return openAppDialog({
    title: options.title || "Choose an action",
    message,
    cancelText: options.cancelText || "Cancel",
    choices,
  });
}

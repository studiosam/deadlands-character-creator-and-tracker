/**
 * Snapshot-based undo and redo for player-facing tracker changes.
 *
 * The tracker mutates many independent systems: wounds, ammo, inventory,
 * powers, setup, advancement, notes, and profile data. Full character
 * snapshots are intentionally less clever than operation-specific inverse
 * patches, but they are safer and cover the whole app consistently.
 */
const UNDO_HISTORY_KEY = "deadlands-tracker-undo-v1";
const UNDO_HISTORY_LIMIT = 40;
const UNDO_INPUT_GROUP_MS = 1200;

let undoForceNextBoundary = false;
let undoApplyingHistory = false;

function emptyUndoHistoryState() {
  return {
    schemaVersion: APP_SCHEMA_VERSION,
    historiesByCharacterId: {},
  };
}

function loadUndoHistoryState() {
  const stored = storageAdapter.readJson(UNDO_HISTORY_KEY, null);
  if (!stored || typeof stored !== "object") return emptyUndoHistoryState();
  return {
    schemaVersion: APP_SCHEMA_VERSION,
    historiesByCharacterId:
      stored.historiesByCharacterId &&
      typeof stored.historiesByCharacterId === "object"
        ? stored.historiesByCharacterId
        : {},
  };
}

function saveUndoHistoryState(state) {
  storageAdapter.writeJson(UNDO_HISTORY_KEY, {
    schemaVersion: APP_SCHEMA_VERSION,
    historiesByCharacterId: state.historiesByCharacterId || {},
  });
}

function activeUndoCharacterId() {
  return characterLibrary?.activeCharacterId || "";
}

function undoSnapshotForCharacter(data = character) {
  return JSON.stringify(serializeCharacterForStorage(data));
}

function normalizeUndoHistory(history) {
  const source = history && typeof history === "object" ? history : {};
  return {
    undo: Array.isArray(source.undo) ? source.undo.filter(Boolean) : [],
    redo: Array.isArray(source.redo) ? source.redo.filter(Boolean) : [],
    currentSnapshot: source.currentSnapshot || "",
    groupExpiresAt: Number(source.groupExpiresAt) || 0,
  };
}

function undoHistoryForCharacter(id = activeUndoCharacterId()) {
  if (!id) return null;
  const state = loadUndoHistoryState();
  const history = normalizeUndoHistory(state.historiesByCharacterId[id]);
  state.historiesByCharacterId[id] = history;
  return { state, history, id };
}

function trimUndoStack(stack) {
  while (stack.length > UNDO_HISTORY_LIMIT) stack.shift();
}

function pushUndoSnapshot(stack, snapshot) {
  if (!snapshot) return;
  if (stack[stack.length - 1] === snapshot) return;
  stack.push(snapshot);
  trimUndoStack(stack);
}

function resetUndoHistoryForCharacter(
  id = activeUndoCharacterId(),
  data = character,
) {
  if (!id) return;
  const state = loadUndoHistoryState();
  state.historiesByCharacterId[id] = normalizeUndoHistory({
    currentSnapshot: undoSnapshotForCharacter(data),
  });
  saveUndoHistoryState(state);
}

function syncUndoHistoryForActiveCharacter(data = character) {
  const id = activeUndoCharacterId();
  if (!id) return;
  const loaded = undoHistoryForCharacter(id);
  if (!loaded) return;
  loaded.history.currentSnapshot = undoSnapshotForCharacter(data);
  loaded.history.groupExpiresAt = 0;
  saveUndoHistoryState(loaded.state);
  renderUndoControls();
}

function recordUndoSnapshotBeforeCommit(data = character, options = {}) {
  if (undoApplyingHistory || isUnsavedCharacterDraft()) return;
  const loaded = undoHistoryForCharacter();
  if (!loaded) return;

  const nextSnapshot = undoSnapshotForCharacter(data);
  const previousSnapshot =
    loaded.history.currentSnapshot ||
    undoSnapshotForCharacter(activeCharacterSlot()?.character || data);
  if (previousSnapshot === nextSnapshot) {
    loaded.history.currentSnapshot = nextSnapshot;
    saveUndoHistoryState(loaded.state);
    renderUndoControls();
    return;
  }

  const now = Date.now();
  const grouped =
    !options.forceBoundary &&
    !undoForceNextBoundary &&
    loaded.history.groupExpiresAt &&
    now <= loaded.history.groupExpiresAt;

  if (!grouped) {
    pushUndoSnapshot(loaded.history.undo, previousSnapshot);
  }

  loaded.history.redo = [];
  loaded.history.currentSnapshot = nextSnapshot;
  loaded.history.groupExpiresAt = now + UNDO_INPUT_GROUP_MS;
  undoForceNextBoundary = false;
  saveUndoHistoryState(loaded.state);
  renderUndoControls();
}

function undoHistoryCounts() {
  const loaded = undoHistoryForCharacter();
  if (!loaded) return { undo: 0, redo: 0 };
  return {
    undo: loaded.history.undo.length,
    redo: loaded.history.redo.length,
  };
}

function renderUndoControls() {
  if (!els?.undoBtn || !els?.redoBtn) return;
  const counts = undoHistoryCounts();
  els.undoBtn.disabled = counts.undo <= 0 || isUnsavedCharacterDraft();
  els.redoBtn.disabled = counts.redo <= 0 || isUnsavedCharacterDraft();
  els.undoBtn.textContent = counts.undo ? `Undo (${counts.undo})` : "Undo";
  els.redoBtn.textContent = counts.redo ? `Redo (${counts.redo})` : "Redo";
}

function applyUndoSnapshot(snapshot) {
  undoApplyingHistory = true;
  try {
    character = normalize(JSON.parse(snapshot));
    saveCharacterSlot(character, { skipUndo: true });
  } finally {
    undoApplyingHistory = false;
  }
}

function applyUndoHistoryStep(direction) {
  const loaded = undoHistoryForCharacter();
  if (!loaded) return false;
  const sourceStack =
    direction === "redo" ? loaded.history.redo : loaded.history.undo;
  const targetStack =
    direction === "redo" ? loaded.history.undo : loaded.history.redo;
  let targetSnapshot = sourceStack.pop();
  const currentSnapshot = undoSnapshotForCharacter(character);

  while (targetSnapshot && targetSnapshot === currentSnapshot) {
    targetSnapshot = sourceStack.pop();
  }

  if (!targetSnapshot) {
    loaded.history.currentSnapshot = currentSnapshot;
    saveUndoHistoryState(loaded.state);
    renderUndoControls();
    return false;
  }

  pushUndoSnapshot(targetStack, currentSnapshot);
  loaded.history.currentSnapshot = targetSnapshot;
  loaded.history.groupExpiresAt = 0;
  saveUndoHistoryState(loaded.state);
  applyUndoSnapshot(targetSnapshot);
  render();
  renderDemoExperience();
  renderUndoControls();
  appToast(direction === "redo" ? "Redo applied." : "Undo applied.", "success");
  return true;
}

function undoLastCharacterChange() {
  return applyUndoHistoryStep("undo");
}

function redoLastCharacterChange() {
  return applyUndoHistoryStep("redo");
}

function clearUndoHistoryForActiveCharacter() {
  resetUndoHistoryForCharacter(activeUndoCharacterId(), character);
  renderUndoControls();
}

function markUndoBoundary() {
  undoForceNextBoundary = true;
}

function installUndoHistoryInteractionTracking() {
  document.addEventListener(
    "click",
    (event) => {
      if (event.target?.closest?.("#undoBtn, #redoBtn")) return;
      markUndoBoundary();
    },
    true,
  );
  document.addEventListener(
    "change",
    () => {
      markUndoBoundary();
    },
    true,
  );
}

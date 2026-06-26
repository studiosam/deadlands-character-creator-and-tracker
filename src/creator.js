const DICE = [4, 6, 8, 10, 12];
const CONCEPTS = [
  "Blessed",
  "Bounty Hunter",
  "Chi Master",
  "Common Folk",
  "Deserter",
  "Drifter",
  "Escort",
  "Explorer",
  "Grifter",
  "Huckster",
  "Immigrant",
  "Indian Shaman",
  "Indian Warrior",
  "Law Dog",
  "Mad Scientist",
  "Muckraker",
  "Outlaw",
  "Prospector",
  "Soldier",
  "Custom",
];
const HINDRANCE_PRESETS = [
  "Bad Luck",
  "Cursed",
  "Elderly",
  "Heroic",
  "Small",
  "Vow",
  "Code of Honor",
  "Curious",
  "Greedy",
  "Mean",
  "Overconfident",
  "Outsider",
  "Poverty",
  "Quirk",
  "Stubborn",
  "Yellow",
  "Custom",
];
const EDGE_PRESETS = [
  "Alertness",
  "Ambidextrous",
  "Attractive",
  "Brawny",
  "Brave",
  "Charismatic",
  "Command",
  "Healer",
  "Investigator",
  "Luck",
  "Quick",
  "Rich",
  ...ARCANE_BACKGROUND_LIST.map((background) => background.edgeName),
  "Custom",
];
const AB_SKILLS = Object.fromEntries(
  ARCANE_BACKGROUND_LIST.map((background) => [
    background.edgeName,
    background.arcaneSkill,
  ]),
);
const SKILL_DEFS = [
  ["Academics", "smarts"],
  ["Athletics", "agility", true],
  ["Battle", "smarts"],
  ["Boating", "agility"],
  ["Common Knowledge", "smarts", true],
  ["Driving", "agility"],
  ["Faith", "spirit"],
  ["Fighting", "agility"],
  ["Focus", "spirit"],
  ["Gambling", "smarts"],
  ["Healing", "smarts"],
  ["Intimidation", "spirit"],
  ["Language", "smarts"],
  ["Notice", "smarts", true],
  ["Occult", "smarts"],
  ["Performance", "spirit"],
  ["Persuasion", "spirit", true],
  ["Piloting", "agility"],
  ["Psionics", "smarts"],
  ["Repair", "smarts"],
  ["Research", "smarts"],
  ["Riding", "agility"],
  ["Science", "smarts"],
  ["Shooting", "agility"],
  ["Spellcasting", "smarts"],
  ["Stealth", "agility", true],
  ["Survival", "smarts"],
  ["Taunt", "smarts"],
  ["Thievery", "agility"],
  ["Trade", "smarts"],
  ["Weird Science", "smarts"],
];
const SAMPLE_CHARACTERS = [
  {
    id: "dusty-mccaw",
    name: "Dusty McCaw",
    summary:
      "Built-in drifter sample with weapons, armor, gear, reminders, and table-ready combat state.",
    source: "built-in",
  },
  {
    id: "lehi-larson",
    name: "Lehi Larson",
    summary:
      "Savaged.us Blessed import sample for arcane tools, powers, import warnings, and resources.",
    source:
      "docs/Sample Characters/savaged-us-json-export-character-Lehi Larson.json",
  },
];

var creationDraft = loadCreationDraft();

function dieIndex(die) {
  return DICE.indexOf(Number(String(die || "").replace("d", "")));
}

function dieFromIndex(index) {
  return index >= 0 ? `d${DICE[clamp(index, 0, DICE.length - 1)]}` : "";
}

function dieSides(die) {
  return DICE[Math.max(0, dieIndex(die))] || 0;
}

function emptyDraft() {
  return {
    mode: "creation",
    name: "",
    player: "",
    rank: "Novice",
    ancestry: "Human",
    concept: "Drifter",
    customConcept: "",
    description: "",
    background: "",
    worstNightmare: "",
    attributes: {
      agility: "d4",
      smarts: "d4",
      spirit: "d4",
      strength: "d4",
      vigor: "d4",
    },
    skills: SKILL_DEFS.filter((skill) => skill[2])
      .map((skill) => ({
        name: skill[0],
        die: "d4",
        linkedAttribute: skill[1],
        notes: "",
        core: true,
      }))
      .concat([
        {
          name: "Language (English)",
          die: "d4",
          linkedAttribute: "smarts",
          notes: "Default language",
          core: false,
          language: true,
        },
      ]),
    hindrances: [],
    edges: [],
    creation: {
      normalAttributePointsAvailable: 5,
      normalSkillPointsAvailable: 12,
      extraSkillPointsFromHindrances: 0,
      extraMoneyFromHindrances: 0,
      extraAttributeRaisesFromHindrances: 0,
      extraEdgesFromHindrances: 0,
      finalized: false,
      allowIncomplete: false,
      allowDebt: false,
    },
    arcaneBackground: null,
    powerPoints: { enabled: false, current: 0, max: 0, source: "", notes: "" },
    powers: [],
    hucksterDeal: null,
    inventory: [
      {
        id: "clothing",
        name: "Clothing",
        count: 1,
        note: "Starting clothing.",
        weight: 0,
        costCents: 0,
        book: "Deadlands",
      },
    ],
    weapons: [],
    ammo: {},
    armorInventory: [],
    vehicles: [],
    notes: "",
  };
}

function normalizeDraft(data) {
  const defaults = emptyDraft();
  const draft = {
    ...defaults,
    ...migrateCreationDraftPayload(data || defaults),
  };
  draft.schemaVersion = APP_SCHEMA_VERSION;
  draft.attributes = { ...defaults.attributes, ...(draft.attributes || {}) };
  draft.creation = { ...defaults.creation, ...(draft.creation || {}) };
  [
    "skills",
    "hindrances",
    "edges",
    "inventory",
    "weapons",
    "armorInventory",
    "vehicles",
    "powers",
  ].forEach((key) => {
    if (!Array.isArray(draft[key])) draft[key] = defaults[key];
  });
  if (!draft.ammo || typeof draft.ammo !== "object") draft.ammo = {};
  if (!draft.powerPoints) draft.powerPoints = clone(defaults.powerPoints);
  const arcaneEdge = draft.edges.find((edge) =>
    isArcaneBackgroundEdge(edge.name),
  );
  const arcaneConfig = arcaneEdge
    ? arcaneBackgroundConfigFromEdge(arcaneEdge.name)
    : null;
  draft.arcaneBackground =
    draft.arcaneBackground ||
    (arcaneConfig ? makeArcaneBackgroundState(arcaneConfig) : null);
  if (arcaneConfig && !draft.powerPoints.enabled) {
    draft.powerPoints = {
      enabled: true,
      current: arcaneConfig.startingPowerPoints,
      max: arcaneConfig.startingPowerPoints,
      source: arcaneConfig.edgeName,
      notes: `${arcaneConfig.displayName} uses ${arcaneConfig.arcaneSkill}.`,
    };
  }
  draft.powers = draft.powers.map((power, index) =>
    normalizePowerRecord(power, index, draft.arcaneBackground?.edgeName),
  );
  if (arcaneConfig && !draft.powers.length)
    draft.powers = makeStartingPowers(arcaneConfig);
  draft.hucksterDeal = normalizeHucksterDeal(draft.hucksterDeal);
  if (arcaneConfig?.key === "huckster" && !draft.hucksterDeal)
    draft.hucksterDeal = makeHucksterDeal();
  draft.ancestry = "Human";
  return draft;
}

function loadCreationDraft() {
  return normalizeDraft(storageAdapter.readJson(CREATION_KEY, emptyDraft()));
}

function saveCreationDraft() {
  storageAdapter.writeJson(
    CREATION_KEY,
    serializeCreationDraftForStorage(creationDraft),
  );
}

function hindranceStats() {
  const total = creationDraft.hindrances.reduce(
    (sum, hindrance) => sum + (hindrance.severity === "Major" ? 2 : 1),
    0,
  );
  const spendable = Math.min(4, total);
  const spent =
    creationDraft.creation.extraAttributeRaisesFromHindrances * 2 +
    creationDraft.creation.extraEdgesFromHindrances * 2 +
    creationDraft.creation.extraSkillPointsFromHindrances +
    creationDraft.creation.extraMoneyFromHindrances;
  return { total, spendable, spent, remaining: spendable - spent };
}

function attrSpent() {
  return Object.values(creationDraft.attributes).reduce(
    (sum, die) => sum + Math.max(0, dieIndex(die)),
    0,
  );
}

function skillCost(skill) {
  const definition =
    SKILL_DEFS.find((item) => item[0] === skill.name) ||
    SKILL_DEFS.find((item) => skill.name.startsWith(`${item[0]} (`));
  const linkedAttribute = skill.linkedAttribute || definition?.[1] || "smarts";
  const attribute = dieSides(creationDraft.attributes[linkedAttribute]);
  const target = dieIndex(skill.die);
  const base = skill.core ? 0 : -1;
  let cost = 0;
  for (let index = base + 1; index <= target; index += 1)
    cost += DICE[index] > attribute ? 2 : 1;
  return Math.max(0, cost);
}

function skillStats() {
  const spent = creationDraft.skills.reduce(
    (sum, skill) => sum + skillCost(skill),
    0,
  );
  const available =
    creationDraft.creation.normalSkillPointsAvailable +
    creationDraft.creation.extraSkillPointsFromHindrances;
  return { spent, avail: available, remaining: available - spent };
}

function creationArmorBonus() {
  return creationDraft.armorInventory
    .filter((armor) => armor.equipped && armor.count > 0)
    .reduce((max, armor) => Math.max(max, Number(armor.armor) || 0), 0);
}

function creationDerived() {
  const fighting = creationDraft.skills.find(
    (skill) => skill.name === "Fighting",
  );
  const vigor = dieSides(creationDraft.attributes.vigor);
  const fightingDie = fighting ? dieSides(fighting.die) : 0;
  const armor = creationArmorBonus();
  return {
    pace: 6,
    parry: 2 + Math.floor(fightingDie / 2),
    baseToughness: 2 + Math.floor(vigor / 2),
    armor,
    toughness: 2 + Math.floor(vigor / 2) + armor,
  };
}

function draftArcaneConfig() {
  const edge = creationDraft.edges.find((item) =>
    isArcaneBackgroundEdge(item.name),
  );
  return edge ? arcaneBackgroundConfigFromEdge(edge.name) : null;
}

function skillDefinition(name) {
  return SKILL_DEFS.find((skill) => skill[0] === name);
}

function ensureDraftSkill(name) {
  if (creationDraft.skills.some((skill) => skill.name === name)) return;
  const definition = skillDefinition(name);
  creationDraft.skills.push({
    name,
    die: "d4",
    linkedAttribute: definition?.[1] || "smarts",
    notes: "Added for Arcane Background.",
    core: false,
  });
}

function applyArcaneBackgroundToDraft(edgeName, source, notes) {
  const config = arcaneBackgroundConfigFromEdge(edgeName);
  if (!config) return false;

  creationDraft.edges = creationDraft.edges.filter(
    (edge) => !isArcaneBackgroundEdge(edge.name),
  );
  creationDraft.edges.push({
    name: config.edgeName,
    source,
    notes: notes || config.requirementsText,
    requirements: config.requirementsText,
  });
  creationDraft.arcaneBackground = makeArcaneBackgroundState(config);
  creationDraft.powerPoints = {
    enabled: true,
    current: config.startingPowerPoints,
    max: config.startingPowerPoints,
    source: config.edgeName,
    notes: `${config.displayName} uses ${config.arcaneSkill}.`,
  };
  creationDraft.powers = makeStartingPowers(config);
  creationDraft.hucksterDeal =
    config.key === "huckster" ? makeHucksterDeal() : null;
  ensureDraftSkill(config.arcaneSkill);
  return true;
}

function clearDraftArcaneBackground() {
  creationDraft.arcaneBackground = null;
  creationDraft.powerPoints = {
    enabled: false,
    current: 0,
    max: 0,
    source: "",
    notes: "",
  };
  creationDraft.powers = [];
  creationDraft.hucksterDeal = null;
}

function draftSkillDie(name) {
  return creationDraft.skills.find((skill) => skill.name === name)?.die || "";
}

function meetsDie(actual, required) {
  return dieIndex(actual) >= dieIndex(required);
}

function arcaneRequirementItems(config) {
  if (!config) return [];
  const items = [
    {
      ok: creationDraft.powerPoints.enabled,
      text: `${config.displayName} Power Points enabled.`,
      blocking: false,
    },
    {
      ok:
        Number(creationDraft.powerPoints.max) === config.startingPowerPoints ||
        creationDraft.creation.allowIncomplete,
      text: `${config.displayName} starts with ${config.startingPowerPoints} Power Points.`,
      blocking: false,
    },
    {
      ok: creationDraft.powers.length === config.startingPowersCount,
      text: `${config.displayName} has ${config.startingPowersCount} starting power slots.`,
      blocking: false,
    },
  ];

  Object.entries(config.requirements.attributes || {}).forEach(
    ([attribute, die]) => {
      items.push({
        ok: meetsDie(creationDraft.attributes[attribute], die),
        text: `${config.displayName} requirement: ${attribute} ${die}+.`,
        blocking: false,
      });
    },
  );
  Object.entries(config.requirements.skills || {}).forEach(([skill, die]) => {
    items.push({
      ok: meetsDie(draftSkillDie(skill), die),
      text: `${config.displayName} requirement: ${skill} ${die}+.`,
      blocking: false,
    });
  });
  (config.requirements.edges || []).forEach((edgeName) => {
    items.push({
      ok: creationDraft.edges.some((edge) => edge.name === edgeName),
      text: `${config.displayName} requirement: ${edgeName} Edge.`,
      blocking: false,
    });
  });
  if (config.key === "huckster") {
    items.push({
      ok: Boolean(creationDraft.hucksterDeal?.enabled),
      text: "Huckster Dealing with the Devil helper enabled.",
      blocking: false,
    });
  }
  return items;
}

function optionTags(items, selected = "") {
  return items
    .map(
      (item) =>
        `<option value="${esc(item)}"${item === selected ? " selected" : ""}>${esc(item)}</option>`,
    )
    .join("");
}

function catalogOptions(items) {
  return `<option value="">Choose…</option>${items.map((item) => `<option value="${esc(item.id)}">${esc(item.name)} — ${money(item.costCents)}</option>`).join("")}`;
}

function catalogByName(items) {
  return [...items].sort((left, right) =>
    left.name.localeCompare(right.name, undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  );
}

function setAppTab(tabName) {
  const panelMap = {
    play: "#playPanel",
    character: "#characterPanel",
    catalog: "#catalogPanel",
    inventory: "#inventoryPanel",
    arcane: "#arcanePanel",
    notes: "#notesPanel",
    settings: "#settingsPanel",
    sourcesRulesets: "#sourcesRulesetsPanel",
    library: "#libraryPanel",
    creation: "#creationPanel",
  };
  const nextTab = panelMap[tabName] ? tabName : "play";

  document.querySelectorAll("[data-app-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.appTab === nextTab);
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.add("hidden");
    panel.classList.remove("active");
  });

  const panel = $(panelMap[nextTab]);
  panel.classList.remove("hidden");
  panel.classList.add("active");
  if (nextTab === "creation") renderCreator();
}

function setCreatorMode(on) {
  setAppTab(on ? "creation" : "play");
}

function coreSetupSkills() {
  return ["Athletics", "Common Knowledge", "Notice", "Persuasion", "Stealth"].map(
    (name) => ({
      name,
      die: "d4",
      linkedAttribute: setupSkillAttributeKey(
        SKILL_LINKED_ATTRIBUTES[name] || "smarts",
      ),
      notes: "",
      core: true,
    }),
  );
}

function newSetupCharacterPayload() {
  const attributes = {
    agility: "d4",
    smarts: "d4",
    spirit: "d4",
    strength: "d4",
    vigor: "d4",
  };
  const skills = coreSetupSkills();
  const creation = {
    normalAttributePointsAvailable: 5,
    normalSkillPointsAvailable: 12,
    extraSkillPointsFromHindrances: 0,
    extraMoneyFromHindrances: 0,
    extraAttributeRaisesFromHindrances: 0,
    extraEdgesFromHindrances: 0,
    finalized: false,
    allowIncomplete: false,
    allowDebt: false,
  };

  return {
    source: "created",
    setupStatus: "needsReview",
    name: "Untitled Character",
    rank: "Novice",
    ancestry: "Human",
    archetype: "",
    gender: "",
    age: "",
    player: "",
    description: "",
    background: "",
    worstNightmare: "",
    attributes,
    skills,
    creation,
    creationBaseline: {
      attributes: clone(attributes),
      skills: clone(skills),
    },
    hindrances: [],
    edges: [],
    advances: [],
    arcaneBackground: null,
    powers: [],
    resources: [],
    hucksterDeal: null,
    moneyCents: 25000,
    ammo: {},
    weapons: [],
    armorInventory: [],
    inventory: [
      {
        id: "clothing",
        name: "Clothing",
        count: 1,
        note: "Starting clothing.",
        weight: 0,
        costCents: 0,
        book: "Deadlands",
      },
    ],
    consumables: [],
    vehicles: [],
    damage: { wounds: 0, maxWounds: 3, fatigue: 0, maxFatigue: 2 },
    bennies: { current: 3, starting: 3, normalStarting: 3 },
    conviction: 0,
    derived: {
      pace: 6,
      parry: 2,
      baseToughness: 4,
      toughness: 4,
      armor: 0,
    },
    armorStrength: "d4",
    weaponStrength: "d4",
    selectedArmorLocation: "best",
    reminders: [],
    notes: "",
  };
}

async function startCharacterSetupCreation() {
  if (
    !(await resolveUnsavedCharacterDraft(
      "Save or discard the current character draft before starting another one.",
    ))
  )
    return;
  if (activeCharacterSlot()) saveCharacterSlot(character);
  characterSetupReviewOpen = false;
  character = normalize(newSetupCharacterPayload());
  characterDraftMode = true;
  characterSetupStep = "concept";
  storageAdapter.writeFlag(DEMO_MODE_KEY, false);
  storageAdapter.writeFlag(WELCOME_DISMISSED_KEY, true);
  $("#demoWelcomePanel")?.classList.add("hidden");
  setLandingVisible(false);
  render();
  setAppTab("character");
  renderDemoExperience();
  $("#characterSetupPanel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  setSaveState("Draft not saved");
  appToast("Unsaved character draft started in Character Setup.", "success");
}

function setLandingVisible(visible) {
  $("#landingPage")?.classList.toggle("hidden", !visible);
  $(".shell")?.classList.toggle("hidden", visible);
}

function renderLandingPage() {
  const landing = $("#landingPage");
  if (!landing) return;
  setLandingVisible(true);

  const entries = characterLibraryEntries();
  const activeId = characterLibrary?.activeCharacterId || "";
  const hasSavedCharacters = Boolean(entries.length);

  els.landingCharacterPicker?.classList.toggle("hidden", !hasSavedCharacters);
  $("#landingLoadSampleBtn")?.classList.toggle("hidden", hasSavedCharacters);

  if (els.landingCharacterSelect) {
    const options = entries.map((entry) => {
      const option = document.createElement("option");
      option.value = entry.id;
      option.textContent =
        entry.name || entry.character?.name || "Unnamed Character";
      return option;
    });
    els.landingCharacterSelect.replaceChildren(...options);
    if (hasSavedCharacters) {
      els.landingCharacterSelect.value = entries.some(
        (entry) => entry.id === activeId,
      )
        ? activeId
        : entries[0].id;
    }
  }

  updateLandingPrimaryLabel();
}

function closeLandingPage(tabName = "play") {
  setLandingVisible(false);
  setAppTab(tabName);
  $(".shell")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function openLandingPage() {
  if (
    !(await resolveUnsavedCharacterDraft(
      "Save this character draft before returning to the main menu?",
    ))
  )
    return;
  renderLandingPage();
  $("#landingPage")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function landingCharacterName(entry) {
  return entry?.name || entry?.character?.name || "Character";
}

function selectedLandingCharacterSlot() {
  const id =
    els.landingCharacterSelect?.value ||
    characterLibrary?.activeCharacterId ||
    "";
  return characterLibrary?.charactersById?.[id] || null;
}

function updateLandingPrimaryLabel() {
  const label = $("#landingContinueLabel");
  if (!label) return;
  const selected = selectedLandingCharacterSlot();
  label.textContent = selected
    ? `Continue as ${landingCharacterName(selected)}`
    : "Open Tracker";
}

async function openLandingCharacter(id) {
  if (!characterLibrary?.charactersById?.[id]) return;
  if (
    !(await resolveUnsavedCharacterDraft(
      "Save this character draft before opening another saved character?",
    ))
  )
    return;
  if (activeCharacterSlot()) saveCharacterSlot(character);
  if (!activateCharacterSlot(id)) return;
  render();
  closeLandingPage("play");
}

async function continueFromLandingPage() {
  const selected = selectedLandingCharacterSlot();
  if (selected) await openLandingCharacter(selected.id);
  else closeLandingPage("play");
}

function populateSampleCharacterSelect() {
  const select = $("#sampleCharacterSelect");
  if (!select) return;
  select.innerHTML = SAMPLE_CHARACTERS.map(
    (sample) =>
      `<option value="${esc(sample.id)}">${esc(sample.name)}</option>`,
  ).join("");
}

function sampleById(id) {
  return (
    SAMPLE_CHARACTERS.find((sample) => sample.id === id) || SAMPLE_CHARACTERS[0]
  );
}

function renderDemoExperience(forceShow = false) {
  populateSampleCharacterSelect();
  const welcome = $("#demoWelcomePanel");
  const banner = $("#demoModeBanner");
  const isDemoMode = storageAdapter.readFlag(DEMO_MODE_KEY);
  if (banner) banner.classList.toggle("hidden", !isDemoMode);
  if (!welcome) return;
  const landingVisible = !$("#landingPage")?.classList.contains("hidden");

  const shouldShow =
    forceShow ||
    welcome.dataset.manualOpen === "true" ||
    (!landingVisible &&
      !characterLibraryEntries().length &&
      !storageAdapter.has(STORAGE_KEY) &&
      !storageAdapter.readFlag(WELCOME_DISMISSED_KEY));
  welcome.classList.toggle("hidden", !shouldShow);
}

async function loadSampleCharacter(sample) {
  if (sample.source === "built-in") return normalize(clone(defaultCharacter));

  const response = await fetch(encodeURI(sample.source));
  if (!response.ok) throw new Error(`Could not load ${sample.name}.`);
  const data = await response.json();
  const sampleCharacter = normalize(isSavagedUsExport(data) ? fromSavagedUs(data) : data);
  sampleCharacter.setupStatus = "complete";
  return normalize(sampleCharacter);
}

async function loadSelectedSampleCharacter() {
  if (
    !(await resolveUnsavedCharacterDraft(
      "Save this character draft before loading a sample character?",
    ))
  )
    return;
  const select = $("#sampleCharacterSelect");
  const sample = sampleById(select?.value);

  try {
    const sampleCharacter = await loadSampleCharacter(sample);
    const entry = addCharacterSlot(sampleCharacter, {
      source: "sample",
      isDemo: true,
      sampleId: sample.id,
      preferredId: `sample-${sample.id}`,
      replacePreferred: true,
    });
    characterSetupReviewOpen = false;
    character = normalize(entry.character);
    storageAdapter.writeFlag(DEMO_MODE_KEY, true);
    storageAdapter.writeFlag(WELCOME_DISMISSED_KEY, true);
    setLandingVisible(false);
    $("#demoWelcomePanel")?.classList.add("hidden");
    if ($("#demoWelcomePanel"))
      $("#demoWelcomePanel").dataset.manualOpen = "false";
    render();
    setCreatorMode(false);
    renderDemoExperience();
    appToast(`${sample.name} loaded in demo mode.`, "success");
  } catch (error) {
    appToast(
      error?.message ||
        "Could not load that sample. Use Import JSON if you opened the app directly from disk.",
      "danger",
    );
  }
}

function statusPill(ok, warn = false) {
  const className = ok ? "ok" : warn ? "warn" : "err";
  const text = ok ? "Valid" : warn ? "Warning" : "Invalid";
  return `<span class="creator-status ${className}">${text}</span>`;
}

function renderCreator() {
  const panel = $("#creationPanel");
  const hindrances = hindranceStats();
  const skills = skillStats();
  const derived = creationDerived();
  const attributesSpent = attrSpent();
  const attributesAvailable =
    5 + creationDraft.creation.extraAttributeRaisesFromHindrances;
  const concept =
    creationDraft.concept === "Custom"
      ? creationDraft.customConcept
      : creationDraft.concept;
  const gearSpent = creationGearSpent();
  const moneyAvailable =
    25000 + creationDraft.creation.extraMoneyFromHindrances * 50000;
  const remaining = moneyAvailable - gearSpent;
  const checks = creationChecks();

  panel.innerHTML = `
    <section class="creator-section creator-wide">
      <div class="section-title">
        <div>
          <h2>Character Creation</h2>
          <p>Build a Deadlands character, save a draft, then finalize into the tracker.</p>
        </div>
        <span class="pill">Human ancestry locked: one free Novice Edge</span>
      </div>
      <div class="creator-actions">
        <button data-cc="saveDraft">Save Draft</button>
        <button data-cc="finalize" class="ghost">Finalize Character</button>
        <button data-cc="resetDraft" class="danger">Reset Character Creation</button>
        <button data-cc="exportDraft">Export Character JSON</button>
        <label class="ghost file-label" for="creatorImportFile">Import Character JSON</label>
        <input id="creatorImportFile" class="creator-file" type="file" accept="application/json">
        <button data-cc="exportFull">Export Full App State</button>
      </div>
    </section>
    ${renderBasics(concept)}
    ${renderHindrances(hindrances)}
    ${renderAttributes(attributesSpent, attributesAvailable)}
    ${renderSkills(skills)}
    ${renderEdges()}
    ${renderGear(moneyAvailable, gearSpent, remaining)}
    ${renderReview(checks, derived, remaining)}
  `;
  bindCreatorInputs();
}

function renderBasics(concept) {
  return `
    <section class="creator-section">
      <h2>1. Character Basics ${statusPill(Boolean(creationDraft.name), true)}</h2>
      <div class="creator-grid">
        <label>Character name<input data-cf="name" value="${esc(creationDraft.name)}"></label>
        <label>Player name<input data-cf="player" value="${esc(creationDraft.player)}"></label>
        <label>Rank<input data-cf="rank" value="${esc(creationDraft.rank)}"></label>
        <label>Race / ancestry<input value="Human" disabled></label>
        <label>Concept<select data-cf="concept">${optionTags(CONCEPTS, creationDraft.concept)}</select></label>
        <label>Custom concept<input data-cf="customConcept" value="${esc(creationDraft.customConcept)}" ${creationDraft.concept === "Custom" ? "" : "disabled"}></label>
        <label class="creator-wide">Short description<textarea data-cf="description">${esc(creationDraft.description)}</textarea></label>
        <label class="creator-wide">Background notes<textarea data-cf="background">${esc(creationDraft.background)}</textarea></label>
        <label class="creator-wide">Worst nightmare<textarea data-cf="worstNightmare">${esc(creationDraft.worstNightmare)}</textarea></label>
      </div>
      <p class="creator-note">Current concept: ${esc(concept || "—")}</p>
    </section>`;
}

function renderHindrances(stats) {
  return `
    <section class="creator-section">
      <h2>2. Hindrances ${statusPill(stats.remaining >= 0, stats.total > 0)}</h2>
      <div class="creator-points">
        <span class="pill">Selected ${stats.total}</span>
        <span class="pill">Spendable ${stats.spendable} / 4</span>
        <span class="pill">Spent ${stats.spent}</span>
        <span class="pill">Remaining ${stats.remaining}</span>
      </div>
      ${stats.total > 4 ? '<p class="creator-note">More than 4 Hindrance points selected; only 4 count for benefits.</p>' : ""}
      <div class="creator-grid">
        <select id="ccHindranceName">${optionTags(HINDRANCE_PRESETS)}</select>
        <select id="ccHindranceSeverity"><option>Minor</option><option>Major</option></select>
        <input id="ccHindranceNotes" placeholder="Notes">
        <button data-cc="addHindrance">Add Hindrance</button>
      </div>
      <div class="creator-grid">
        <label>Attribute raises (2 pts each)<input class="creator-small" type="number" min="0" data-cn="extraAttributeRaisesFromHindrances" value="${creationDraft.creation.extraAttributeRaisesFromHindrances}"></label>
        <label>Extra Edges (2 pts each)<input class="creator-small" type="number" min="0" data-cn="extraEdgesFromHindrances" value="${creationDraft.creation.extraEdgesFromHindrances}"></label>
        <label>Extra skill points (1 pt each)<input class="creator-small" type="number" min="0" data-cn="extraSkillPointsFromHindrances" value="${creationDraft.creation.extraSkillPointsFromHindrances}"></label>
        <label>+$500 money buys (1 pt each)<input class="creator-small" type="number" min="0" data-cn="extraMoneyFromHindrances" value="${creationDraft.creation.extraMoneyFromHindrances}"></label>
      </div>
      <div class="creator-list">
        ${
          creationDraft.hindrances
            .map(
              (hindrance, index) =>
                `<div class="creator-row"><div><strong>${esc(hindrance.name)}</strong><span class="meta">${hindrance.severity} • ${hindrance.severity === "Major" ? 2 : 1} point(s)</span>${hindrance.notes ? `<p class="creator-note">${esc(hindrance.notes)}</p>` : ""}</div><button data-cc="removeHindrance" data-i="${index}" class="delete-small">×</button></div>`,
            )
            .join("") || '<p class="empty-state">No Hindrances selected.</p>'
        }
      </div>
    </section>`;
}

function renderAttributes(spent, available) {
  return `
    <section class="creator-section">
      <h2>3. Attributes ${statusPill(spent === available, spent <= available)}</h2>
      <div class="creator-points"><span class="pill">Normal 5</span><span class="pill">Extra ${creationDraft.creation.extraAttributeRaisesFromHindrances}</span><span class="pill">Spent ${spent} / ${available}</span></div>
      <div class="creator-list">
        ${Object.entries(creationDraft.attributes)
          .map(
            ([key, value]) =>
              `<div class="creator-row"><div><strong>${key[0].toUpperCase() + key.slice(1)}</strong><span class="meta">${value}</span></div><div class="creator-actions"><button data-cc="decAttr" data-k="${key}">−</button><button data-cc="incAttr" data-k="${key}">+</button></div></div>`,
          )
          .join("")}
      </div>
    </section>`;
}

function renderSkills(stats) {
  const available = SKILL_DEFS.filter(
    (definition) =>
      !creationDraft.skills.some(
        (skill) =>
          skill.name === definition[0] ||
          skill.name.startsWith(`${definition[0]} (`),
      ),
  );
  return `
    <section class="creator-section">
      <h2>4. Skills ${statusPill(stats.spent <= stats.avail, stats.remaining >= 0)}</h2>
      <div class="creator-points"><span class="pill">Normal 12</span><span class="pill">Extra ${creationDraft.creation.extraSkillPointsFromHindrances}</span><span class="pill">Spent ${stats.spent} / ${stats.avail}</span><span class="pill">Remaining ${stats.remaining}</span></div>
      <div class="creator-grid">
        <select id="ccSkillName">${available.map((skill) => `<option value="${esc(skill[0])}">${esc(skill[0])} (${skill[1]})</option>`).join("")}</select>
        <input id="ccSkillNotes" placeholder="Specialty, e.g. Trade: Mining or Language">
        <button data-cc="addSkill">Add Skill</button>
      </div>
      <div class="creator-list">
        ${creationDraft.skills
          .map(
            (skill, index) =>
              `<div class="creator-row"><div><strong>${esc(skill.name)}</strong><span class="meta">${skill.die} • ${skill.linkedAttribute} • cost ${skillCost(skill)}</span>${skill.notes ? `<p class="creator-note">${esc(skill.notes)}</p>` : ""}</div><div class="creator-actions"><button data-cc="decSkill" data-i="${index}">−</button><button data-cc="incSkill" data-i="${index}">+</button>${skill.core ? '<span class="pill">Core</span>' : `<button data-cc="removeSkill" data-i="${index}" class="delete-small">×</button>`}</div></div>`,
          )
          .join("")}
      </div>
    </section>`;
}

function renderCreationPowers(config) {
  return `
    <div class="creator-list">
      <h3>Starting Powers</h3>
      ${
        creationDraft.powers
          .map(
            (power, index) =>
              `<div class="creator-row power-editor"><div><strong>${esc(power.name || "Player choice power")}</strong><span class="meta">${esc(power.source || config.edgeName)}</span></div><div class="creator-grid creator-wide"><label>Name<input data-cp="${index}" data-cpf="name" value="${esc(power.name)}" ${power.fixed ? "readonly" : ""}></label><label>Base cost<input data-cp="${index}" data-cpf="baseCost" value="${esc(power.baseCost)}"></label><label>Duration<input data-cp="${index}" data-cpf="duration" value="${esc(power.duration)}"></label><label>Trapping / device<input data-cp="${index}" data-cpf="trapping" value="${esc(power.trapping)}"></label><label class="creator-wide">Notes<input data-cp="${index}" data-cpf="notes" value="${esc(power.notes)}"></label><label class="checkline"><input type="checkbox" data-cp="${index}" data-cpf="active" ${power.active ? "checked" : ""}> Starts active</label></div></div>`,
          )
          .join("") || '<p class="empty-state">No powers configured.</p>'
      }
    </div>`;
}

function renderCreationHuckster(config) {
  if (config.key !== "huckster") return "";
  const deal = creationDraft.hucksterDeal || makeHucksterDeal();
  return `
    <div class="add-panel">
      <h3>Dealing with the Devil Helper</h3>
      <p class="creator-note">This records temporary deal points separately from the normal 10-point Huckster pool.</p>
      <div class="creator-grid">
        <label>Selected power<input data-hd="selectedPower" value="${esc(deal.selectedPower)}"></label>
        <label>Required PP<input type="number" min="0" data-hd="requiredPowerPoints" value="${deal.requiredPowerPoints}"></label>
        <label>Gambling result<input data-hd="gamblingRollResult" value="${esc(deal.gamblingRollResult)}"></label>
        <label>Cards drawn<input type="number" min="0" data-hd="cardsDrawn" value="${deal.cardsDrawn}"></label>
        <label>Poker hand<input data-hd="pokerHand" value="${esc(deal.pokerHand)}"></label>
        <label>Temporary PP<input type="number" min="0" data-hd="temporaryPowerPoints" value="${deal.temporaryPowerPoints}"></label>
        <label>Shortage penalty<input type="number" min="0" data-hd="shortagePenalty" value="${deal.shortagePenalty}"></label>
        <label>Leftover PP<input type="number" min="0" data-hd="leftoverPowerPoints" value="${deal.leftoverPowerPoints}"></label>
        <label class="checkline"><input type="checkbox" data-hd="anteBennySpent" ${deal.anteBennySpent ? "checked" : ""}> Ante Benny spent</label>
        <label class="checkline"><input type="checkbox" data-hd="usedJoker" ${deal.usedJoker ? "checked" : ""}> Joker used</label>
        <label class="checkline"><input type="checkbox" data-hd="backfireTriggered" ${deal.backfireTriggered ? "checked" : ""}> Backfire triggered</label>
        <label class="creator-wide">Notes<textarea data-hd="notes">${esc(deal.notes)}</textarea></label>
      </div>
    </div>`;
}

function renderEdges() {
  const arcaneConfig = draftArcaneConfig();
  return `
    <section class="creator-section">
      <h2>5. Edges ${statusPill(creationDraft.edges.length > 0, true)}</h2>
      <p class="creator-note">Humans receive one free Novice Edge. Prerequisites are warnings, not full rules enforcement.</p>
      <div class="creator-grid">
        <select id="ccEdgeName">${optionTags(EDGE_PRESETS)}</select>
        <select id="ccEdgeSource"><option>Human free Edge</option><option>Hindrance purchased Edge</option><option>Later Advance</option></select>
        <input id="ccEdgeNotes" placeholder="Notes or requirements">
        <button data-cc="addEdge">Add Edge</button>
      </div>
      ${
        arcaneConfig
          ? `<div class="add-panel"><strong>Arcane Background: ${esc(arcaneConfig.displayName)}</strong><p class="creator-note">${esc(arcaneConfig.requirementsText)}. ${esc(arcaneConfig.displayName)} uses ${esc(arcaneConfig.arcaneSkill)} (${esc(arcaneConfig.linkedAttribute)}), starts with ${arcaneConfig.startingPowerPoints} Power Points, and has ${arcaneConfig.startingPowersCount} starting powers.</p><div class="creator-grid"><label>Power Points max<input type="number" min="0" data-pp="max" value="${creationDraft.powerPoints.max}"></label><label>Power Points current<input type="number" min="0" data-pp="current" value="${creationDraft.powerPoints.current}"></label><label class="creator-wide">Notes<input data-pp="notes" value="${esc(creationDraft.powerPoints.notes)}"></label></div>${renderCreationPowers(arcaneConfig)}${renderCreationHuckster(arcaneConfig)}</div>`
          : '<p class="creator-note">Select one Arcane Background Edge to enable Power Points.</p>'
      }
      <div class="creator-list">
        ${
          creationDraft.edges
            .map(
              (edge, index) =>
                `<div class="creator-row"><div><strong>${esc(edge.name)}</strong><span class="meta">${esc(edge.source)}</span>${edge.notes ? `<p class="creator-note">${esc(edge.notes)}</p>` : ""}</div><button data-cc="removeEdge" data-i="${index}" class="delete-small">×</button></div>`,
            )
            .join("") || '<p class="empty-state">No Edges selected.</p>'
        }
      </div>
    </section>`;
}

function creationGearSpent() {
  const gear = [
    ...creationDraft.inventory,
    ...creationDraft.weapons,
    ...creationDraft.armorInventory,
    ...creationDraft.vehicles,
  ].reduce(
    (sum, item) =>
      sum + (Number(item.costCents) || 0) * (Number(item.count) || 1),
    0,
  );
  const ammo = Object.values(creationDraft.ammo).reduce(
    (sum, item) =>
      sum + (Number(item.costCents) || 0) * (Number(item.count) || 0),
    0,
  );
  return gear + ammo;
}

function renderGear(available, spent, remaining) {
  return `
    <section class="creator-section">
      <h2>6. Gear and Starting Money ${statusPill(remaining >= 0 || creationDraft.creation.allowDebt, remaining < 0)}</h2>
      <div class="creator-points"><span class="pill">Starting ${money(25000)}</span><span class="pill">Hindrance money ${money(creationDraft.creation.extraMoneyFromHindrances * 50000)}</span><span class="pill">Spent ${money(spent)}</span><span class="pill">Remaining ${money(remaining)}</span></div>
      <label class="checkline"><input type="checkbox" data-cb="allowDebt" ${creationDraft.creation.allowDebt ? "checked" : ""}> Allow debt/overspending</label>
      <div class="add-panel">
        <h3>Buy Starting Equipment</h3>
        <div class="creator-grid"><select id="ccGearType"><option value="gear">Gear</option><option value="weapon">Weapon</option><option value="ammo">Ammunition</option><option value="armor">Armor</option><option value="vehicle">Vehicle</option></select><select id="ccGearId"></select><input id="ccGearQty" class="creator-small" type="number" min="1" value="1"><button data-cc="buyGear">Buy</button></div>
      </div>
      <div class="creator-list">${renderPurchased("Weapons", creationDraft.weapons)}${renderPurchased("Armor", creationDraft.armorInventory)}${renderAmmoPurchased()}${renderPurchased("Inventory", creationDraft.inventory)}${renderPurchased("Vehicles", creationDraft.vehicles)}</div>
    </section>`;
}

function renderPurchased(label, items) {
  return `<div><h3>${label}</h3>${items.map((item, index) => `<div class="creator-row"><div><strong>${esc(item.name)}</strong><span class="meta">Qty ${item.count || 1} • ${money(item.costCents || 0)} each</span>${item.note ? `<p class="creator-note">${esc(item.note)}</p>` : ""}</div><button data-cc="removePurchase" data-list="${label}" data-i="${index}" class="delete-small">×</button></div>`).join("") || '<p class="empty-state">None.</p>'}</div>`;
}

function renderAmmoPurchased() {
  const rows = Object.entries(creationDraft.ammo)
    .map(
      ([key, ammo]) =>
        `<div class="creator-row"><div><strong>${esc(ammo.label)}</strong><span class="meta">Reserve ${ammo.count} • ${money(ammo.costCents || 0)} each</span></div><button data-cc="removeAmmoPurchase" data-k="${esc(key)}" class="delete-small">×</button></div>`,
    )
    .join("");
  return `<div><h3>Ammunition</h3>${rows || '<p class="empty-state">None.</p>'}</div>`;
}

function renderReview(checks, derived) {
  return `
    <section class="creator-section creator-wide">
      <h2>7. Final Review ${statusPill(checks.valid, checks.warnings.length && !checks.errors.length)}</h2>
      <div class="creator-points"><span class="pill">Pace ${derived.pace}</span><span class="pill">Parry ${derived.parry}</span><span class="pill">Toughness ${derived.baseToughness}${derived.armor ? ` + ${derived.armor} armor = ${derived.toughness}` : ""}</span></div>
      <div class="creator-review">${checks.items.map((check) => `<div>${check.ok ? "✓" : "⚠"} ${esc(check.text)}</div>`).join("")}</div>
      <label class="checkline"><input type="checkbox" data-cb="allowIncomplete" ${creationDraft.creation.allowIncomplete ? "checked" : ""}> Allow incomplete character finalization</label>
      <div class="creator-actions"><button data-cc="finalize" ${checks.valid || creationDraft.creation.allowIncomplete ? "" : "disabled"}>Finalize Character</button><button data-cc="saveDraft">Save Draft</button></div>
    </section>`;
}

function creationChecks() {
  const hindrances = hindranceStats();
  const skills = skillStats();
  const attributesSpent = attrSpent();
  const attributesAvailable =
    5 + creationDraft.creation.extraAttributeRaisesFromHindrances;
  const arcaneBackgrounds = creationDraft.edges.filter((edge) =>
    isArcaneBackgroundEdge(edge.name),
  );
  const arcaneConfig = draftArcaneConfig();
  const derived = creationDerived();
  const remainingMoney =
    25000 +
    creationDraft.creation.extraMoneyFromHindrances * 50000 -
    creationGearSpent();
  const purchasedEdges = creationDraft.edges.filter(
    (edge) => edge.source === "Hindrance purchased Edge",
  ).length;
  const freeEdges = creationDraft.edges.filter(
    (edge) => edge.source === "Human free Edge",
  ).length;
  const items = [
    { ok: Boolean(creationDraft.name), text: "Character has a name." },
    { ok: creationDraft.ancestry === "Human", text: "Race is Human." },
    {
      ok:
        attributesSpent === attributesAvailable ||
        creationDraft.creation.allowIncomplete,
      text: `Attributes spend ${attributesSpent} / ${attributesAvailable}.`,
    },
    {
      ok: skills.spent <= skills.avail,
      text: `Skills spend ${skills.spent} / ${skills.avail}.`,
    },
    {
      ok: hindrances.spent <= hindrances.spendable,
      text: `Hindrance benefits spend ${hindrances.spent} / ${hindrances.spendable}.`,
    },
    { ok: freeEdges <= 1, text: "No more than one Human free Edge selected." },
    {
      ok: purchasedEdges <= creationDraft.creation.extraEdgesFromHindrances,
      text: `Hindrance-purchased Edges ${purchasedEdges} / ${creationDraft.creation.extraEdgesFromHindrances}.`,
    },
    {
      ok: arcaneBackgrounds.length <= 1,
      text: "Only one Arcane Background selected.",
    },
    {
      ok:
        !arcaneBackgrounds[0] ||
        creationDraft.skills.some(
          (skill) =>
            skill.name ===
            arcaneBackgroundConfigFromEdge(arcaneBackgrounds[0].name)
              ?.arcaneSkill,
        ),
      text: arcaneBackgrounds[0]
        ? `${arcaneBackgroundConfigFromEdge(arcaneBackgrounds[0].name)?.arcaneSkill} skill present for ${arcaneBackgrounds[0].name}.`
        : "No Arcane Background selected.",
      blocking: false,
    },
    ...arcaneRequirementItems(arcaneConfig),
    {
      ok: remainingMoney >= 0 || creationDraft.creation.allowDebt,
      text: "Gear spending within available money or debt allowed.",
    },
    {
      ok: derived.parry > 0 && derived.baseToughness > 0,
      text: "Derived stats calculated.",
    },
  ];
  const errors = items.filter(
    (item) =>
      !item.ok &&
      !creationDraft.creation.allowIncomplete &&
      item.blocking !== false,
  );
  const warnings = items.filter((item) => !item.ok);
  return { items, errors, warnings, valid: errors.length === 0 };
}

function bindCreatorInputs() {
  document.querySelectorAll("[data-cf]").forEach((input) => {
    input.oninput = () => {
      creationDraft[input.dataset.cf] = input.value;
      if (input.dataset.cf === "concept") renderCreator();
      saveCreationDraft();
    };
  });
  document.querySelectorAll("[data-cn]").forEach((input) => {
    input.oninput = () => {
      const previous = creationDraft.creation[input.dataset.cn];
      creationDraft.creation[input.dataset.cn] = Math.max(
        0,
        Math.floor(Number(input.value) || 0),
      );
      if (hindranceStats().remaining < 0)
        creationDraft.creation[input.dataset.cn] = previous;
      saveCreationDraft();
      renderCreator();
    };
  });
  document.querySelectorAll("[data-cb]").forEach((input) => {
    input.onchange = () => {
      creationDraft.creation[input.dataset.cb] = input.checked;
      saveCreationDraft();
      renderCreator();
    };
  });
  document.querySelectorAll("[data-pp]").forEach((input) => {
    input.oninput = () => {
      const key = input.dataset.pp;
      creationDraft.powerPoints[key] =
        key === "notes"
          ? input.value
          : Math.max(0, Math.floor(Number(input.value) || 0));
      if (
        key === "max" &&
        creationDraft.powerPoints.current > creationDraft.powerPoints.max
      )
        creationDraft.powerPoints.current = creationDraft.powerPoints.max;
      saveCreationDraft();
    };
  });
  document.querySelectorAll("[data-cp]").forEach((input) => {
    const apply = () => {
      const power = creationDraft.powers[Number(input.dataset.cp)];
      if (!power) return;
      const field = input.dataset.cpf;
      power[field] = input.type === "checkbox" ? input.checked : input.value;
      saveCreationDraft();
      if (field === "name" || field === "active") renderCreator();
    };
    input.oninput = apply;
    input.onchange = apply;
  });
  document.querySelectorAll("[data-hd]").forEach((input) => {
    const apply = () => {
      if (!creationDraft.hucksterDeal)
        creationDraft.hucksterDeal = makeHucksterDeal();
      const field = input.dataset.hd;
      creationDraft.hucksterDeal[field] =
        input.type === "checkbox"
          ? input.checked
          : input.type === "number"
            ? Math.max(0, Math.floor(Number(input.value) || 0))
            : input.value;
      creationDraft.hucksterDeal = normalizeHucksterDeal(
        creationDraft.hucksterDeal,
      );
      saveCreationDraft();
    };
    input.oninput = apply;
    input.onchange = apply;
  });

  const typeSelect = $("#ccGearType");
  const itemSelect = $("#ccGearId");
  if (typeSelect && itemSelect) {
    const fill = () => {
      const type = typeSelect.value;
      const items =
        type === "weapon"
          ? WEAPON_CATALOG
          : type === "ammo"
            ? GEAR_CATALOG.filter(isAmmo)
            : type === "armor"
              ? ARMOR_CATALOG
              : type === "vehicle"
                ? VEHICLE_CATALOG
                : catalogByName(GEAR_CATALOG);
      itemSelect.innerHTML = catalogOptions(items);
    };
    typeSelect.onchange = fill;
    fill();
  }

  const file = $("#creatorImportFile");
  if (file) {
    file.onchange = (event) => {
      const imported = event.target.files[0];
      if (!imported) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          const payload = unwrapImportPayload(data);
          creationDraft = normalizeDraft(payload.creationDraft || data);
          saveCreationDraft();
          renderCreator();
          appToast("Character creation draft imported.", "success");
        } catch {
          appToast(
            "That file was not valid character creation JSON.",
            "danger",
          );
        }
      };
      reader.readAsText(imported);
    };
  }
}

function creatorBuy() {
  const type = $("#ccGearType").value;
  const id = $("#ccGearId").value;
  const quantity = Math.max(1, Math.floor(Number($("#ccGearQty").value) || 1));
  if (!id) return;

  const source =
    type === "weapon"
      ? WEAPON_CATALOG
      : type === "ammo"
        ? GEAR_CATALOG.filter(isAmmo)
        : type === "armor"
          ? ARMOR_CATALOG
          : type === "vehicle"
            ? VEHICLE_CATALOG
            : GEAR_CATALOG;
  const item = source.find((entry) => entry.id === id);
  if (!item) return;

  if (type === "weapon") {
    for (let index = 0; index < quantity; index += 1) {
      creationDraft.weapons.push({
        id: `${item.id}-${Date.now()}-${index}`,
        name: item.name,
        count: 1,
        damage: item.damage || "—",
        range: item.range || "—",
        ap: item.ap || 0,
        rof: item.rof || "—",
        shotsMax: item.shotsMax || null,
        shotsLoaded: 0,
        ammoType: item.ammoType || null,
        notes: item.notes || "",
        weight: item.weight,
        costCents: item.costCents,
        minStr: item.minStr,
        book: item.book || "Deadlands",
      });
    }
  } else if (type === "ammo") {
    const key = savagedAmmoKey(item);
    if (!creationDraft.ammo[key])
      creationDraft.ammo[key] = {
        label: item.name,
        count: 0,
        weight: item.weight,
        costCents: item.costCents,
      };
    creationDraft.ammo[key].count += quantity;
  } else if (type === "armor") {
    creationDraft.armorInventory.push({
      id: `${item.id}-${Date.now()}`,
      name: item.name,
      count: quantity,
      armor: item.armor || 0,
      weight: item.weight,
      minStr: item.minStr,
      costCents: item.costCents,
      book: item.book || "Deadlands",
      location: item.location || "torso",
      equipped: true,
      note: "Starting armor.",
    });
  } else if (type === "vehicle") {
    creationDraft.vehicles.push({
      id: `${item.id}-${Date.now()}`,
      name: item.name,
      count: quantity,
      note: "Starting vehicle.",
      costCents: item.costCents,
      book: item.book || "Deadlands",
    });
  } else {
    creationDraft.inventory.push({
      id: `${item.id}-${Date.now()}`,
      name: item.name,
      count: quantity,
      note: "Starting gear.",
      weight: item.weight,
      costCents: item.costCents,
      book: item.book || "Deadlands",
    });
  }

  saveCreationDraft();
  renderCreator();
}

function finalizeCreation() {
  const checks = creationChecks();
  if (!checks.valid && !creationDraft.creation.allowIncomplete) {
    appToast(
      "Character is not valid yet. Check the final review or enable incomplete finalization.",
      "danger",
    );
    return;
  }

  const derived = creationDerived();
  const concept =
    creationDraft.concept === "Custom"
      ? creationDraft.customConcept
      : creationDraft.concept;
  const arcaneConfig = draftArcaneConfig();
  const resources = creationDraft.powerPoints.enabled
    ? [
        {
          id: "power-points",
          name: "Power Points",
          current: creationDraft.powerPoints.current,
          max: creationDraft.powerPoints.max,
          source: creationDraft.powerPoints.source || "Arcane Background",
          note: creationDraft.powerPoints.notes || "Imported from creator.",
        },
      ]
    : [];
  const reminders = [
    ...creationDraft.hindrances.map((hindrance) => ({
      type: "Hindrance",
      name: hindrance.name,
      text: hindrance.notes || hindrance.severity,
    })),
    ...creationDraft.edges.map((edge) => ({
      type: "Edge",
      name: edge.name,
      text: edge.notes || edge.source,
    })),
    ...(arcaneConfig ? [makeArcaneReminder(arcaneConfig)] : []),
  ];
  const notes = [
    creationDraft.description,
    creationDraft.background ? `Background: ${creationDraft.background}` : "",
    creationDraft.worstNightmare
      ? `Worst nightmare: ${creationDraft.worstNightmare}`
      : "",
    `Player: ${creationDraft.player || "—"}`,
    `Attributes: ${Object.entries(creationDraft.attributes)
      .map(([key, value]) => `${key} ${value}`)
      .join(", ")}`,
    `Skills: ${creationDraft.skills.map((skill) => `${skill.name} ${skill.die}`).join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n");

  character = normalize({
    ...clone(defaultCharacter),
    source: "created",
    name: creationDraft.name,
    player: creationDraft.player,
    rank: creationDraft.rank || "Novice",
    ancestry: "Human",
    archetype: concept || "",
    description: creationDraft.description,
    background: creationDraft.background,
    worstNightmare: creationDraft.worstNightmare,
    attributes: clone(creationDraft.attributes),
    skills: clone(creationDraft.skills),
    creationBaseline: {
      attributes: clone(creationDraft.attributes),
      skills: clone(creationDraft.skills),
    },
    hindrances: clone(creationDraft.hindrances),
    edges: clone(creationDraft.edges),
    creation: { ...clone(creationDraft.creation), finalized: true },
    arcaneBackground: creationDraft.arcaneBackground
      ? clone(creationDraft.arcaneBackground)
      : arcaneConfig
        ? makeArcaneBackgroundState(arcaneConfig)
        : null,
    powerPoints: clone(creationDraft.powerPoints),
    powers: clone(creationDraft.powers),
    hucksterDeal: clone(creationDraft.hucksterDeal),
    resources,
    damage: { wounds: 0, maxWounds: 3, fatigue: 0, maxFatigue: 2 },
    bennies: { current: 3, starting: 3, normalStarting: 3 },
    derived: {
      pace: derived.pace,
      parry: derived.parry,
      baseToughness: derived.baseToughness,
      toughness: derived.toughness,
      armor: derived.armor,
    },
    armorStrength: creationDraft.attributes.strength,
    weaponStrength: creationDraft.attributes.strength,
    selectedArmorLocation: "best",
    moneyCents:
      25000 +
      creationDraft.creation.extraMoneyFromHindrances * 50000 -
      creationGearSpent(),
    ammo: clone(creationDraft.ammo),
    weapons: clone(creationDraft.weapons),
    armorInventory: clone(creationDraft.armorInventory),
    inventory: clone(creationDraft.inventory),
    vehicles: clone(creationDraft.vehicles),
    reminders,
    notes,
  });
  storageAdapter.writeFlag(DEMO_MODE_KEY, false);
  addCharacterSlot(character, { source: "created" });
  render();
  setCreatorMode(false);
  renderDemoExperience();
  appToast("Character finalized into the tracker.", "success");
}

async function creatorAction(actionName, target) {
  if (actionName === "saveDraft") {
    saveCreationDraft();
    appToast("Character creation draft saved.", "success");
  } else if (actionName === "finalize") {
    finalizeCreation();
  } else if (actionName === "resetDraft") {
    if (
      await appConfirm("This clears the current creator draft only.", {
        title: "Reset character creation draft?",
        confirmText: "Reset Draft",
        danger: true,
      })
    ) {
      creationDraft = emptyDraft();
      saveCreationDraft();
      renderCreator();
      appToast("Character creation draft reset.", "success");
    }
  } else if (actionName === "exportDraft") {
    exportJson(
      `${slugify(creationDraft.name || "character")}-creation-draft.json`,
      serializeCreationDraftExport(creationDraft),
    );
  } else if (actionName === "exportFull") {
    if (!isUnsavedCharacterDraft()) saveCharacterSlot(character);
    exportJson(
      "deadlands-tracker-full-state.json",
      serializeFullStateExport(character, creationDraft, characterLibrary),
    );
  } else if (actionName === "addHindrance") {
    const severity = $("#ccHindranceSeverity").value;
    creationDraft.hindrances.push({
      name: $("#ccHindranceName").value,
      severity,
      points: severity === "Major" ? 2 : 1,
      notes: $("#ccHindranceNotes").value,
    });
    saveCreationDraft();
    renderCreator();
  } else if (actionName === "removeHindrance") {
    creationDraft.hindrances.splice(Number(target.dataset.i), 1);
    saveCreationDraft();
    renderCreator();
  } else if (actionName === "incAttr" || actionName === "decAttr") {
    const key = target.dataset.k;
    const index = dieIndex(creationDraft.attributes[key]);
    if (
      actionName === "incAttr" &&
      index < 4 &&
      attrSpent() <
        5 + creationDraft.creation.extraAttributeRaisesFromHindrances
    )
      creationDraft.attributes[key] = dieFromIndex(index + 1);
    if (actionName === "decAttr" && index > 0)
      creationDraft.attributes[key] = dieFromIndex(index - 1);
    saveCreationDraft();
    renderCreator();
  } else if (actionName === "addSkill") {
    const name = $("#ccSkillName").value;
    const definition = SKILL_DEFS.find((skill) => skill[0] === name);
    const notes = $("#ccSkillNotes").value;
    const finalName =
      name === "Language" && notes
        ? `Language (${notes})`
        : name === "Trade" && notes
          ? `Trade (${notes})`
          : name;
    creationDraft.skills.push({
      name: finalName,
      die: "d4",
      linkedAttribute: definition?.[1] || "smarts",
      notes,
      core: false,
      language: name === "Language",
    });
    saveCreationDraft();
    renderCreator();
  } else if (actionName === "incSkill" || actionName === "decSkill") {
    const skill = creationDraft.skills[Number(target.dataset.i)];
    const index = dieIndex(skill.die);
    if (actionName === "incSkill" && index < 4)
      skill.die = dieFromIndex(index + 1);
    if (actionName === "decSkill" && index > 0)
      skill.die = dieFromIndex(index - 1);
    saveCreationDraft();
    renderCreator();
  } else if (actionName === "removeSkill") {
    creationDraft.skills.splice(Number(target.dataset.i), 1);
    saveCreationDraft();
    renderCreator();
  } else if (actionName === "addEdge") {
    let name = $("#ccEdgeName").value;
    if (name === "Custom") name = $("#ccEdgeNotes").value || "Custom Edge";
    if (
      isArcaneBackgroundEdge(name) &&
      creationDraft.edges.some((edge) => isArcaneBackgroundEdge(edge.name))
    ) {
      appToast("Only one Arcane Background can be selected.", "danger");
      return;
    }
    if (isArcaneBackgroundEdge(name)) {
      applyArcaneBackgroundToDraft(
        name,
        $("#ccEdgeSource").value,
        $("#ccEdgeNotes").value,
      );
      saveCreationDraft();
      renderCreator();
      return;
    }
    creationDraft.edges.push({
      name,
      source: $("#ccEdgeSource").value,
      notes: $("#ccEdgeNotes").value,
      requirements: "",
    });
    saveCreationDraft();
    renderCreator();
  } else if (actionName === "removeEdge") {
    const edge = creationDraft.edges.splice(Number(target.dataset.i), 1)[0];
    if (edge && isArcaneBackgroundEdge(edge.name)) clearDraftArcaneBackground();
    saveCreationDraft();
    renderCreator();
  } else if (actionName === "buyGear") {
    creatorBuy();
  } else if (actionName === "removePurchase") {
    const map = {
      Weapons: "weapons",
      Armor: "armorInventory",
      Inventory: "inventory",
      Vehicles: "vehicles",
    };
    creationDraft[map[target.dataset.list]].splice(Number(target.dataset.i), 1);
    saveCreationDraft();
    renderCreator();
  } else if (actionName === "removeAmmoPurchase") {
    delete creationDraft.ammo[target.dataset.k];
    saveCreationDraft();
    renderCreator();
  }
}

document.addEventListener("click", (event) => {
  const actionName = event.target?.dataset?.cc;
  if (actionName) creatorAction(actionName, event.target);
});

document.querySelectorAll("[data-app-tab]").forEach((button) => {
  button.onclick = () => setAppTab(button.dataset.appTab);
});
$("#loadSampleBtn").onclick = () => {
  const panel = $("#demoWelcomePanel");
  if (panel) {
    panel.dataset.manualOpen = "true";
    renderDemoExperience(true);
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};
$("#loadSelectedSampleBtn").onclick = loadSelectedSampleCharacter;
$("#startCreatorWelcomeBtn").onclick = () => {
  startCharacterSetupCreation();
};
$("#importWelcomeBtn").onclick = () => {
  storageAdapter.writeFlag(WELCOME_DISMISSED_KEY, true);
  $("#demoWelcomePanel")?.classList.add("hidden");
  openPasteImportPanel();
};
$("#dismissWelcomeBtn").onclick = () => {
  storageAdapter.writeFlag(WELCOME_DISMISSED_KEY, true);
  const panel = $("#demoWelcomePanel");
  if (panel) {
    panel.dataset.manualOpen = "false";
    panel.classList.add("hidden");
  }
};
$("#exitDemoModeBtn").onclick = () => {
  storageAdapter.writeFlag(DEMO_MODE_KEY, false);
  renderDemoExperience();
  appToast(
    "Demo mode banner dismissed. Current character data remains saved.",
    "success",
  );
};
$("#landingContinueBtn").onclick = continueFromLandingPage;
if (els.landingCharacterSelect)
  els.landingCharacterSelect.onchange = updateLandingPrimaryLabel;
$("#landingLoadSampleBtn").onclick = loadSelectedSampleCharacter;
$("#landingCreateBtn").onclick = startCharacterSetupCreation;
$("#landingImportBtn").onclick = () => openPasteImportPanel("landing");
$("#landingSourcesRulesetsBtn").onclick = () =>
  closeLandingPage("sourcesRulesets");
$("#mainMenuBtn").onclick = openLandingPage;
$("#creatorModeBtn").onclick = startCharacterSetupCreation;

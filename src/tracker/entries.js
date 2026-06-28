function normalizeEdgeEntry(entry) {
  if (typeof entry === "string") {
    return {
      id: generateStableEntryId("edge", entry),
      name: entry,
      type: "edge",
      category: "Unknown",
      rank: "Unknown",
      requirements: "",
      shortSummary: "",
      notes: "",
      source: "Imported",
      subchoice: "",
      isCustom: false,
    };
  }

  const source = entry && typeof entry === "object" ? entry : {};
  return {
    ...source,
    id: source.id || generateStableEntryId("edge", source.name || "edge"),
    name: source.name || "Unnamed Edge",
    type: source.type || "edge",
    category: source.category || "Unknown",
    rank: source.rank || "Unknown",
    requirements: source.requirements || "",
    shortSummary: source.shortSummary || source.summary || "",
    notes: source.notes || source.text || "",
    source: source.source || "Imported",
    subchoice: source.subchoice || "",
    isCustom: Boolean(source.isCustom),
  };
}

function canonicalHindranceSeverity(value) {
  const severity = String(value || "")
    .trim()
    .toLowerCase();
  if (severity === "major") return "Major";
  if (severity === "minor") return "Minor";
  return "";
}

function hindranceBaseName(name) {
  return String(name || "").replace(/\s*\((?:minor|major)\b.*$/i, "");
}

function inferHindranceSeverity(source) {
  const explicit = canonicalHindranceSeverity(source?.severity);
  if (explicit) return explicit;

  if (typeof source?.major === "boolean") {
    return source.major ? "Major" : "Minor";
  }

  if (typeof source?.minor === "boolean") {
    return source.minor ? "Minor" : "";
  }

  const name = String(source?.name || "");
  if (/\bmajor\b/i.test(name)) return "Major";
  if (/\bminor\b/i.test(name)) return "Minor";

  const catalog =
    typeof HINDRANCE_CATALOG !== "undefined" ? HINDRANCE_CATALOG : [];
  const baseName = plainEntryName(hindranceBaseName(name));
  const catalogEntry = catalog.find(
    (item) => plainEntryName(item.name) === baseName,
  );
  return canonicalHindranceSeverity(catalogEntry?.severity);
}

function normalizeHindranceEntry(entry) {
  if (typeof entry === "string") {
    return {
      id: generateStableEntryId("hindrance", entry),
      name: entry,
      type: "hindrance",
      severity: inferHindranceSeverity({ name: entry }) || "Unknown",
      shortSummary: "",
      notes: "",
      source: "Imported",
      isCustom: false,
    };
  }

  const source = entry && typeof entry === "object" ? entry : {};
  return {
    ...source,
    id:
      source.id ||
      generateStableEntryId("hindrance", source.name || "hindrance"),
    name: source.name || "Unnamed Hindrance",
    type: source.type || "hindrance",
    severity: inferHindranceSeverity(source) || "Unknown",
    shortSummary: source.shortSummary || source.summary || "",
    notes: source.notes || source.text || "",
    source: source.source || "Imported",
    isCustom: Boolean(source.isCustom),
  };
}

function normalizeEdges(entries) {
  const used = new Set();
  return (Array.isArray(entries) ? entries : []).map((entry) => {
    const normalized = normalizeEdgeEntry(entry);
    normalized.id = uniqueEntryId(normalized.id, used);
    return normalized;
  });
}

function normalizeHindrances(entries) {
  const used = new Set();
  return (Array.isArray(entries) ? entries : []).map((entry) => {
    const normalized = normalizeHindranceEntry(entry);
    normalized.id = uniqueEntryId(normalized.id, used);
    return normalized;
  });
}

function plainEntryName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function entryTextValue(value) {
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object") return JSON.stringify(value);
  return String(value ?? "");
}

function selectKnownValue(select, value, fallback) {
  const text = compactText(value, fallback);
  select.value = [...select.options].some((option) => option.value === text)
    ? text
    : fallback;
}

function edgeDisplayMeta(edge) {
  return [
    edge.rank && edge.rank !== "Unknown" ? edge.rank : "",
    edge.category && edge.category !== "Unknown" ? edge.category : "",
    edge.requirements ? `Req: ${entryTextValue(edge.requirements)}` : "",
    edge.subchoice ? `Choice: ${edge.subchoice}` : "",
  ]
    .filter(Boolean)
    .join(" • ");
}

function hindranceDisplayMeta(hindrance) {
  return hindrance.severity && hindrance.severity !== "Unknown"
    ? hindrance.severity
    : "";
}

function sourceMeta(entry) {
  if (!entry.source || entry.source === "Manual") return "";
  return `Source: ${entry.source}`;
}

function getEdgeWarnings(currentCharacter, draftEdge, editingId = "") {
  const warnings = [];
  if (!draftEdge.name.trim()) warnings.push("Edge name is blank.");

  if (isArcaneBackgroundEdge(draftEdge.name)) {
    const hasOtherArcaneBackground = currentCharacter.edges.some(
      (edge) => edge.id !== editingId && isArcaneBackgroundEdge(edge.name),
    );
    if (hasOtherArcaneBackground)
      warnings.push("This character already has an Arcane Background Edge.");
  }

  const draftName = plainEntryName(draftEdge.name);
  const hasTenderfoot = currentCharacter.hindrances.some(
    (hindrance) => plainEntryName(hindrance.name) === "tenderfoot",
  );
  if (draftName === "dont get im riled" && hasTenderfoot) {
    warnings.push("Tenderfoot conflicts with Don’t Get ’im Riled!.");
  }

  return warnings;
}

function getHindranceWarnings(
  currentCharacter,
  draftHindrance,
  editingId = "",
) {
  const warnings = [];
  if (!draftHindrance.name.trim()) warnings.push("Hindrance name is blank.");
  if (!draftHindrance.severity || draftHindrance.severity === "Unknown")
    warnings.push("Hindrance severity is not selected.");

  const draftName = plainEntryName(draftHindrance.name);
  const hasRiled = currentCharacter.edges.some(
    (edge) => plainEntryName(edge.name) === "dont get im riled",
  );
  if (draftName === "tenderfoot" && hasRiled) {
    warnings.push("Tenderfoot conflicts with Don’t Get ’im Riled!.");
  }

  return warnings;
}

function upsertEdge(currentCharacter, edge) {
  const normalized = normalizeEdgeEntry(edge);
  const index = currentCharacter.edges.findIndex(
    (item) => item.id === normalized.id,
  );
  if (index >= 0) currentCharacter.edges[index] = normalized;
  else currentCharacter.edges.push(normalized);
  currentCharacter.edges = normalizeEdges(currentCharacter.edges);
}

function removeEdge(currentCharacter, edgeId) {
  currentCharacter.edges = currentCharacter.edges.filter(
    (edge) => edge.id !== edgeId,
  );
}

function upsertHindrance(currentCharacter, hindrance) {
  const normalized = normalizeHindranceEntry(hindrance);
  const index = currentCharacter.hindrances.findIndex(
    (item) => item.id === normalized.id,
  );
  if (index >= 0) currentCharacter.hindrances[index] = normalized;
  else currentCharacter.hindrances.push(normalized);
  currentCharacter.hindrances = normalizeHindrances(
    currentCharacter.hindrances,
  );
}

function removeHindrance(currentCharacter, hindranceId) {
  currentCharacter.hindrances = currentCharacter.hindrances.filter(
    (hindrance) => hindrance.id !== hindranceId,
  );
}

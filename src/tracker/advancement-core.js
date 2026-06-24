function generateStableEntryId(type, name) {
  return `${type}-${slugify(name || type)}`;
}

function uniqueEntryId(id, used) {
  const base = id || "entry";
  let candidate = base;
  let index = 2;
  while (used.has(candidate)) {
    candidate = `${base}-${index}`;
    index += 1;
  }
  used.add(candidate);
  return candidate;
}

function generateAdvanceId(number, type, targetName) {
  return `advance-${slugify(number || "x")}-${slugify(type || "advance")}-${slugify(targetName || "entry")}`;
}

function inferAdvanceTypeFromText(text) {
  const value = String(text || "").trim();
  if (/^raise attribute:/i.test(value)) return "Increase Attribute";
  if (/^raise skills:/i.test(value)) return "Increase Two Skills";
  if (/^raise skill:/i.test(value)) return "Increase Skill";
  if (/^edge:\s*new powers/i.test(value)) return "New Powers";
  if (/^edge:\s*power points/i.test(value)) return "Power Points";
  if (/^edge:/i.test(value)) return "New Edge";
  return "";
}

function inferAdvanceTargetName(text, type) {
  const value = String(text || "").trim();
  if (!value) return "";
  const [, afterColon = ""] = value.match(/^[^:]+:\s*(.+)$/) || [];
  if (type === "Power Points") return "+5 Power Points";
  if (type === "New Powers") {
    const powers = afterColon.match(/\((.+)\)/);
    return powers?.[1] || afterColon.replace(/^New Powers\s*/i, "").trim();
  }
  return afterColon || "";
}

function getAdvanceRankFromCount(count) {
  const total = Math.max(0, Math.floor(Number(count) || 0));
  if (total >= 16) return "Legendary";
  if (total >= 12) return "Heroic";
  if (total >= 8) return "Veteran";
  if (total >= 4) return "Seasoned";
  return "Novice";
}

function getDieStepIndex(value) {
  const text = String(value || "").trim().toLowerCase();
  return DIE_STEPS.indexOf(text);
}

function compareDieSteps(left, right) {
  return getDieStepIndex(left) - getDieStepIndex(right);
}

function getNextDieStep(value) {
  const index = getDieStepIndex(value);
  if (index < 0) return "";
  return DIE_STEPS[Math.min(index + 1, DIE_STEPS.length - 1)];
}

function isValidDieStep(value) {
  return getDieStepIndex(value) >= 0;
}

function findCharacterSkillByName(currentCharacter, skillName) {
  const text = plainEntryName(skillName);
  return (currentCharacter?.skills || []).find(
    (item) => plainEntryName(item.name) === text,
  );
}

function getDeadlandsSkillDefinition(skillName) {
  const text = plainEntryName(skillName);
  const match = Object.entries(SKILL_LINKED_ATTRIBUTES).find(
    ([name]) => plainEntryName(name) === text,
  );
  return match
    ? {
        name: match[0],
        linkedAttribute: match[1],
      }
    : null;
}

function getLinkedAttributeForSkill(skillName, currentCharacter = character) {
  const skill = findCharacterSkillByName(currentCharacter, skillName);
  const linked = skill?.linkedAttribute || skill?.attribute || "";
  if (linked) return displayNameFromKey(plainEntryName(linked));
  return getDeadlandsSkillDefinition(skillName)?.linkedAttribute || "";
}

function getAttributeDie(currentCharacter, attributeName) {
  const text = plainEntryName(attributeName);
  const key = ATTRIBUTE_ORDER.find(
    (attribute) => attribute === text || plainEntryName(displayNameFromKey(attribute)) === text,
  );
  return key ? currentCharacter.attributes?.[key] || "d4" : "";
}

function getSkillDie(currentCharacter, skillName) {
  const skill = findCharacterSkillByName(currentCharacter, skillName);
  return skill?.die || skill?.value || "";
}

function canUseSingleSkillAdvance(currentCharacter, skillName) {
  const skillDie = getSkillDie(currentCharacter, skillName);
  const linkedAttribute = getLinkedAttributeForSkill(skillName, currentCharacter);
  const attributeDie = getAttributeDie(currentCharacter, linkedAttribute);
  const skillIndex = getDieStepIndex(skillDie);
  const attributeIndex = getDieStepIndex(attributeDie);
  return {
    ok:
      skillIndex >= 0 &&
      attributeIndex >= 0 &&
      skillIndex < DIE_STEPS.length - 1 &&
      skillIndex >= attributeIndex,
    skillDie,
    linkedAttribute,
    attributeDie,
    reason:
      skillIndex === DIE_STEPS.length - 1
        ? "This skill is already at d12."
        : skillIndex < 0
          ? "Select an existing trained skill."
          : attributeIndex < 0
            ? "Linked attribute is unknown."
            : skillIndex < attributeIndex
              ? "This skill is below its linked attribute, so use Increase Two Skills instead."
              : "",
  };
}

function canUseTwoSkillAdvance(currentCharacter, skillName) {
  const skillDie = getSkillDie(currentCharacter, skillName);
  const linkedAttribute = getLinkedAttributeForSkill(skillName, currentCharacter);
  const attributeDie = getAttributeDie(currentCharacter, linkedAttribute);
  const skillIndex = getDieStepIndex(skillDie);
  const attributeIndex = getDieStepIndex(attributeDie);
  const unskilled = skillIndex < 0;
  return {
    ok:
      attributeIndex >= 0 &&
      (unskilled || skillIndex < attributeIndex) &&
      skillIndex < DIE_STEPS.length - 1 &&
      Boolean(skillName),
    skillDie,
    linkedAttribute,
    attributeDie,
    unskilled,
    reason:
      skillIndex === DIE_STEPS.length - 1
        ? "This skill is already at d12."
        : attributeIndex < 0
          ? "Linked attribute is unknown."
          : skillIndex >= attributeIndex
            ? `This skill is not below ${linkedAttribute} ${attributeDie}.`
            : "",
  };
}

function isSupportedAppliedAdvance(type) {
  return ADVANCE_APPLY_TYPES.includes(type);
}

function targetTypeForAdvanceType(type) {
  if (type === "New Edge") return "edge";
  if (type === "Increase Skill" || type === "Increase Two Skills") return "skill";
  if (type === "Increase Attribute") return "attribute";
  if (type === "New Powers") return "power";
  if (type === "Power Points") return "power-points";
  return "custom";
}

function normalizeAdvanceTarget(target) {
  const source = target && typeof target === "object" ? target : {};
  const amount =
    source.amount === undefined || source.amount === ""
      ? undefined
      : Math.max(1, Math.floor(Number(source.amount) || 1));
  return {
    ...source,
    targetType: source.targetType || "",
    targetName: source.targetName || source.name || "",
    targetId: source.targetId || source.id || "",
    catalogId: source.catalogId || "",
    before: source.before || "",
    after: source.after || "",
    ...(amount === undefined ? {} : { amount }),
  };
}

function normalizeAdvanceEntry(entry, index = 0) {
  const raw =
    typeof entry === "string"
      ? { summary: entry }
      : entry && typeof entry === "object"
        ? entry
        : {};
  const sourceText = raw.summary || raw.description || raw.name || "";
  const number = Math.max(
    1,
    Math.floor(Number(raw.number ?? raw.advanceNumber ?? index + 1) || index + 1),
  );
  const type =
    raw.type ||
    raw.advanceType ||
    raw.advancementType ||
    inferAdvanceTypeFromText(sourceText);
  const summary = raw.summary || raw.description || raw.name || "";
  const rank = raw.rank || raw.rankAtAdvance || raw.selectedRank || "";
  const targetName =
    raw.targetName || raw.target || inferAdvanceTargetName(sourceText, type);
  const targetType = raw.targetType || raw.targetKind || targetTypeForAdvanceType(type);
  const source = raw.source || "manual";
  const targets = Array.isArray(raw.targets)
    ? raw.targets.map(normalizeAdvanceTarget)
    : [];

  return {
    ...raw,
    id: raw.id || generateAdvanceId(number, type, targetName || summary),
    number,
    rank: ADVANCE_RANKS.includes(rank)
      ? rank
      : getAdvanceRankFromCount(Math.max(0, number - 1)),
    type: ADVANCE_TYPES.includes(type) ? type : type || "",
    summary,
    targetName,
    targetType: ADVANCE_TARGET_TYPES.includes(targetType) ? targetType : "",
    targetId: raw.targetId || "",
    catalogId: raw.catalogId || "",
    targets,
    notes: raw.notes || "",
    dateAdded: raw.dateAdded || "",
    source: ADVANCE_SOURCES.includes(source) ? source : source || "manual",
    applied: Boolean(raw.applied),
    appliedByApp: Boolean(raw.appliedByApp),
    appliedAt: raw.appliedAt || "",
    appliedChanges: Array.isArray(raw.appliedChanges)
      ? raw.appliedChanges
      : [],
  };
}

function normalizeAdvances(entries) {
  const used = new Set();
  return (Array.isArray(entries) ? entries : []).map((entry, index) => {
    const normalized = normalizeAdvanceEntry(entry, index);
    normalized.id = uniqueEntryId(normalized.id, used);
    return normalized;
  });
}

function getCharacterAdvanceSummary(currentCharacter) {
  const advances = normalizeAdvances(currentCharacter.advances || []);
  const count = advances.length;
  const derivedRank = getAdvanceRankFromCount(count);
  const recordedRank = currentCharacter.rank || "";
  return {
    count,
    derivedRank,
    recordedRank,
    rankMismatch:
      Boolean(recordedRank) &&
      ADVANCE_RANKS.includes(recordedRank) &&
      recordedRank !== derivedRank,
  };
}

function advanceDisplaySummary(advance) {
  const summary = compactText(advance.summary, "");
  if (summary) return summary;
  const targets = Array.isArray(advance.targets) ? advance.targets : [];
  if (targets.length) {
    const names = targets.map((target) => target.targetName).filter(Boolean);
    if (names.length) return `${compactText(advance.type, "Advance")}: ${names.join(", ")}`;
  }
  const target = compactText(advance.targetName, "");
  if (target) return `${compactText(advance.type, "Advance")}: ${target}`;
  if (advance.type === "Power Points") return "Power Points: +5 Power Points";
  return compactText(advance.type, "Advance recorded");
}

function advanceWarnings(currentCharacter, advance, editingId = "") {
  const warnings = [];
  const type = compactText(advance.type, "");
  if (!type) warnings.push("Advance type is missing.");
  const targets = Array.isArray(advance.targets) ? advance.targets : [];

  const needsTarget = [
    "New Edge",
    "Increase Skill",
    "Increase Two Skills",
    "Increase Attribute",
    "New Powers",
    "Power Points",
  ].includes(type);
  if (needsTarget && !compactText(advance.targetName, "") && !targets.length)
    warnings.push("Target name is missing for this advance type.");
  if (
    (type === "Increase Skill" || type === "Increase Two Skills") &&
    targets.some((target) => target.before === "d12" || target.after === "d12" && target.before === target.after)
  )
    warnings.push("Selected skill is already at d12 and cannot increase.");
  if (type === "Increase Skill" && targets[0]?.targetName) {
    const check = canUseSingleSkillAdvance(currentCharacter, targets[0].targetName);
    if (!check.ok) warnings.push(check.reason || "Selected skill cannot use Increase Skill.");
  }
  if (type === "Increase Two Skills") {
    const names = targets.map((target) => plainEntryName(target.targetName)).filter(Boolean);
    if (names.length === 2 && names[0] === names[1])
      warnings.push("Select two different skills.");
    targets.forEach((target) => {
      if (!target.targetName) return;
      const check = canUseTwoSkillAdvance(currentCharacter, target.targetName);
      if (!check.ok)
        warnings.push(
          `${target.targetName} cannot be selected for Increase Two Skills because ${check.reason || "it is not eligible"}`,
        );
    });
  }
  if (
    type === "Increase Attribute" &&
    targets.some((target) => target.before === "d12" || target.after === target.before)
  )
    warnings.push("Selected attribute is already at d12 and cannot increase.");

  const duplicate = (currentCharacter.advances || []).some(
    (item) => item.id !== editingId && Number(item.number) === Number(advance.number),
  );
  if (duplicate) warnings.push(`Advance #${advance.number} is already used.`);

  const expectedRank = getAdvanceRankFromCount(Math.max(0, Number(advance.number) - 1));
  if (
    advance.rank &&
    ADVANCE_RANKS.includes(advance.rank) &&
    advance.rank !== expectedRank
  )
    warnings.push(`Selected rank differs from expected rank ${expectedRank}.`);

  return warnings;
}

function getAdvanceApplicationWarnings(currentCharacter, advance) {
  if (!isSupportedAppliedAdvance(advance.type)) return [];
  const targets = advanceTargetsForLegacy(advance);
  const warnings = [];

  if (advance.type === "New Edge" && !targets[0]?.targetName)
    warnings.push("Select an Edge before applying.");
  if (advance.type === "New Powers" && !targets.length)
    warnings.push("Select at least one power before applying.");
  if (advance.type === "Power Points" && parsePowerPointAdvanceAmount(advance) < 1)
    warnings.push("Power Point increase must be at least 1.");
  if (advance.type === "Increase Skill") {
    const target = targets[0];
    if (!target?.targetName) warnings.push("Select a skill before applying.");
    else {
      const check = canUseSingleSkillAdvance(currentCharacter, target.targetName);
      if (!check.ok)
        warnings.push(
          check.reason || "This skill is not eligible for Increase Skill.",
        );
    }
  }
  if (advance.type === "Increase Two Skills") {
    if (targets.length !== 2) warnings.push("Select two skills before applying.");
    const names = targets.map((target) => plainEntryName(target.targetName)).filter(Boolean);
    if (names.length === 2 && names[0] === names[1])
      warnings.push("Select two different skills.");
    targets.forEach((target) => {
      if (!target.targetName) return;
      const check = canUseTwoSkillAdvance(currentCharacter, target.targetName);
      if (!check.ok)
        warnings.push(
          `${target.targetName} cannot be selected for Increase Two Skills because ${check.reason || "it is not eligible"}`,
        );
    });
  }
  if (advance.type === "Increase Attribute") {
    const target = targets[0];
    if (!target?.targetName) warnings.push("Select an attribute before applying.");
    else if (target.before === "d12" || target.after === target.before)
      warnings.push("Selected attribute is already at d12 and cannot increase.");
  }
  return warnings;
}

function upsertAdvance(currentCharacter, advance) {
  const normalized = normalizeAdvanceEntry(advance);
  const index = currentCharacter.advances.findIndex(
    (item) => item.id === normalized.id,
  );
  if (index >= 0) currentCharacter.advances[index] = normalized;
  else currentCharacter.advances.push(normalized);
  currentCharacter.advances = normalizeAdvances(currentCharacter.advances);
}

function removeAdvance(currentCharacter, advanceId) {
  currentCharacter.advances = currentCharacter.advances.filter(
    (advance) => advance.id !== advanceId,
  );
}

function findEdgeCatalogEntryByName(name) {
  const text = plainEntryName(name);
  if (!text) return null;
  return EDGE_CATALOG.find((edge) => plainEntryName(edge.name) === text) || null;
}

function findPowerCatalogEntryByLooseName(name) {
  if (typeof findPowerCatalogEntryByName !== "function") return null;
  return findPowerCatalogEntryByName(name);
}

function splitAdvanceTargets(value) {
  return String(value || "")
    .split(/[,;/]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeAttributeKey(name) {
  const text = plainEntryName(name);
  return ATTRIBUTE_ORDER.find((key) => key === text) || "";
}

function findSkillByName(name) {
  return findCharacterSkillByName(character, name);
}

function parsePowerPointAdvanceAmount(advance) {
  const structuredAmount = (advance.targets || []).find(
    (target) => target.targetType === "power-points" && target.amount,
  )?.amount;
  const match = `${advance.targetName || ""} ${advance.summary || ""} ${advance.notes || ""}`.match(
    /[+]?(\d+)/,
  );
  return Math.max(
    1,
    Math.floor(Number(advance.powerPointAmount || structuredAmount || match?.[1] || 5)),
  );
}

function skillValue(skill) {
  return skill?.die || skill?.value || "";
}

function skillTargetForName(name) {
  const skill = findSkillByName(name);
  const rawBefore = skillValue(skill);
  const before = isValidDieStep(rawBefore) ? rawBefore : "";
  const after = before ? getNextDieStep(before) : "d4";
  const linkedAttribute = getLinkedAttributeForSkill(name, character);
  const linkedAttributeDie = getAttributeDie(character, linkedAttribute);
  const single = canUseSingleSkillAdvance(character, name);
  const two = canUseTwoSkillAdvance(character, name);
  return {
    targetType: "skill",
    targetName: name,
    targetId: slugify(name),
    before,
    after,
    linkedAttribute,
    linkedAttributeDie,
    unskilled: !before,
    eligibleForSingleSkillAdvance: single.ok,
    eligibleForTwoSkillAdvance: two.ok,
  };
}

function attributeTargetForKey(attributeKey) {
  const before = character.attributes?.[attributeKey] || "d4";
  return {
    targetType: "attribute",
    targetName: displayNameFromKey(attributeKey),
    targetId: attributeKey,
    before,
    after: getNextDieStep(before),
  };
}

function advanceTargetsForLegacy(advance) {
  const type = advance.type;
  if (Array.isArray(advance.targets) && advance.targets.length)
    return advance.targets;
  if (type === "New Edge" && advance.targetName) {
    return [
      {
        targetType: "edge",
        targetName: advance.targetName,
        targetId: advance.targetId || advance.catalogId || "",
        catalogId: advance.catalogId || "",
      },
    ];
  }
  if ((type === "Increase Skill" || type === "Increase Two Skills") && advance.targetName) {
    return splitAdvanceTargets(advance.targetName).map(skillTargetForName);
  }
  if (type === "Increase Attribute" && advance.targetName) {
    const key = normalizeAttributeKey(advance.targetName);
    return key ? [attributeTargetForKey(key)] : [];
  }
  if (type === "New Powers" && advance.targetName) {
    return splitAdvanceTargets(advance.targetName).map((name) => {
      const catalogEntry = findPowerCatalogEntryByLooseName(name);
      return {
        targetType: "power",
        targetName: catalogEntry?.name || name,
        targetId: catalogEntry?.id || slugify(name),
        catalogId: catalogEntry?.id || "",
      };
    });
  }
  if (type === "Power Points") {
    return [
      {
        targetType: "power-points",
        targetName: "Power Points",
        amount: parsePowerPointAdvanceAmount(advance),
      },
    ];
  }
  return [];
}

function createAdvanceEdge(advance, target = null) {
  const catalogEntry =
    chosen(EDGE_CATALOG, target?.catalogId || target?.targetId || advance.catalogId) ||
    findEdgeCatalogEntryByName(target?.targetName || advance.targetName);
  const name = target?.targetName || advance.targetName || catalogEntry?.name;
  if (!name) throw new Error("Target Edge name is required.");
  const id = uniqueEntryId(
    generateStableEntryId("edge", name),
    new Set(character.edges.map((edge) => edge.id)),
  );
  const edge = normalizeEdgeEntry({
    ...(catalogEntry || {}),
    id,
    name,
    type: "edge",
    source: "advancement",
    catalogId: catalogEntry?.id || advance.catalogId || "",
    createdByAdvanceId: advance.id,
    isCustom: !catalogEntry,
  });
  character.edges.push(edge);
  character.edges = normalizeEdges(character.edges);
  return {
    kind: "edge-added",
    entityId: edge.id,
    catalogId: edge.catalogId || "",
    name: edge.name,
    createdByAdvanceId: advance.id,
  };
}

function createAdvancePower(advance, name, target = null) {
  const catalogEntry =
    ((target?.catalogId || target?.targetId || advance.catalogId) && typeof findPowerCatalogEntryById === "function"
      ? findPowerCatalogEntryById(target?.catalogId || target?.targetId || advance.catalogId)
      : null) || findPowerCatalogEntryByLooseName(name);
  const id = uniqueEntryId(
    `power-${slugify(catalogEntry?.name || name)}`,
    new Set(character.powers.map((power) => power.id)),
  );
  const rawPower = catalogEntry
    ? createKnownPowerFromCatalog(catalogEntry, character, {
        id,
        addedReason: "advancement",
      })
    : {
        id,
        name,
        source: "advancement",
        rank: advance.rank || "Novice",
        active: false,
        addedReason: "advancement",
        isCustom: true,
      };
  rawPower.source = "advancement";
  rawPower.createdByAdvanceId = advance.id;
  const power = normalizePowerRecord(
    rawPower,
    character.powers.length,
    character.arcaneBackground?.edgeName,
  );
  power.createdByAdvanceId = advance.id;
  character.powers.push(power);
  return {
    kind: "power-added",
    entityId: power.id,
    catalogId: power.catalogId || "",
    name: power.name,
    createdByAdvanceId: advance.id,
  };
}

function increaseSkillForAdvance(advance, skillTarget) {
  const skillName =
    typeof skillTarget === "string" ? skillTarget : skillTarget?.targetName;
  if (!skillName) throw new Error("Skill name is required.");
  if (!Array.isArray(character.skills)) character.skills = [];
  const skill = findSkillByName(skillName);
  const rawBefore = skill?.die || skill?.value || "";
  const before = isValidDieStep(rawBefore) ? rawBefore : "";
  const after = before ? getNextDieStep(before) : "d4";
  if (!after || after === before)
    throw new Error(`${skillName} cannot increase beyond ${before || "unknown"}.`);
  if (skill) skill.die = after;
  else {
    const linkedAttribute = getLinkedAttributeForSkill(skillName, character);
    character.skills.push({
      name: skillName,
      die: after,
      linkedAttribute: linkedAttribute ? plainEntryName(linkedAttribute) : "",
      notes: "",
    });
  }
  return {
    kind: "skill-increased",
    skillName,
    before,
    after,
  };
}

function increaseAttributeForAdvance(attributeTarget) {
  const attributeName =
    typeof attributeTarget === "string"
      ? attributeTarget
      : attributeTarget?.targetId || attributeTarget?.targetName;
  const attributeKey = normalizeAttributeKey(attributeName);
  if (!attributeKey) throw new Error("Attribute must be Agility, Smarts, Spirit, Strength, or Vigor.");
  if (!character.attributes || typeof character.attributes !== "object")
    character.attributes = {};
  const before = character.attributes?.[attributeKey] || "d4";
  const after = getNextDieStep(before);
  if (!after || after === before)
    throw new Error(`${displayNameFromKey(attributeKey)} cannot increase beyond ${before}.`);
  character.attributes[attributeKey] = after;
  if (attributeKey === "strength") {
    character.armorStrength = after;
    character.weaponStrength = after;
  }
  return {
    kind: "attribute-increased",
    attributeName: displayNameFromKey(attributeKey),
    attributeKey,
    before,
    after,
  };
}

function increasePowerPointsForAdvance(advance) {
  let resource = powerPointResource();
  if (!resource) {
    resource = makePowerPointResource(null, {
      current: 0,
      max: 0,
      source: "advancement",
      note: "Created by advancement application.",
    });
    character.resources.push(resource);
  }
  const amount = parsePowerPointAdvanceAmount(advance);
  const before = Math.max(0, Math.floor(Number(resource.max) || 0));
  resource.max = before + amount;
  resource.current = Math.min(Math.max(0, Math.floor(Number(resource.current) || 0)), resource.max);
  return {
    kind: "power-points-increased",
    field: "maxPowerPoints",
    before,
    after: resource.max,
    amount,
  };
}

function applyAdvanceToCharacter(advance) {
  if (advance.applied) return advance;
  if (!isSupportedAppliedAdvance(advance.type)) return advance;
  const normalized = normalizeAdvanceEntry(advance);
  const targets = advanceTargetsForLegacy(normalized);
  const applicationWarnings = getAdvanceApplicationWarnings(character, normalized);
  if (applicationWarnings.length) throw new Error(applicationWarnings.join(" "));
  const changes = [];

  if (normalized.type === "New Edge") {
    changes.push(createAdvanceEdge(normalized, targets[0]));
  } else if (normalized.type === "New Powers") {
    if (!targets.length) throw new Error("At least one power name is required.");
    targets.forEach((target) =>
      changes.push(createAdvancePower(normalized, target.targetName, target)),
    );
  } else if (normalized.type === "Power Points") {
    changes.push(increasePowerPointsForAdvance(normalized));
  } else if (normalized.type === "Increase Skill") {
    changes.push(increaseSkillForAdvance(normalized, targets[0] || normalized.targetName));
  } else if (normalized.type === "Increase Two Skills") {
    if (targets.length !== 2)
      throw new Error("Select exactly two skills.");
    const names = targets.map((target) => plainEntryName(target.targetName));
    if (names[0] && names[0] === names[1])
      throw new Error("Select two different skills.");
    const invalid = targets
      .map((target) => findSkillByName(target.targetName))
      .filter((skill) => skill && getNextDieStep(skill.die || skill.value) === (skill.die || skill.value));
    if (invalid.length)
      throw new Error(`${invalid.map((skill) => skill.name).join(", ")} cannot increase further.`);
    targets.forEach((target) => changes.push(increaseSkillForAdvance(normalized, target)));
  } else if (normalized.type === "Increase Attribute") {
    changes.push(increaseAttributeForAdvance(targets[0] || normalized.targetName));
  }

  return {
    ...normalized,
    applied: true,
    appliedByApp: true,
    appliedAt: new Date().toISOString(),
    appliedChanges: changes,
  };
}

function canUndoAdvanceChange(advance, change) {
  if (change.kind === "edge-added") {
    const edge = character.edges.find((item) => item.id === change.entityId);
    const safe =
      edge &&
      edge.name === change.name &&
      (!change.catalogId || edge.catalogId === change.catalogId) &&
      (edge.createdByAdvanceId === advance.id ||
        change.createdByAdvanceId === advance.id);
    return {
      safe,
      message: safe
        ? `Remove Edge ${change.name}.`
        : `Cannot safely remove Edge ${change.name}; it was changed or is missing.`,
    };
  }

  if (change.kind === "power-added") {
    const power = character.powers.find((item) => item.id === change.entityId);
    const safe =
      power &&
      power.name === change.name &&
      (!change.catalogId || power.catalogId === change.catalogId) &&
      (power.createdByAdvanceId === advance.id ||
        change.createdByAdvanceId === advance.id);
    return {
      safe,
      message: safe
        ? `Remove Power ${change.name}.`
        : `Cannot safely remove Power ${change.name}; it was changed or is missing.`,
    };
  }

  if (change.kind === "skill-increased") {
    const skill = findSkillByName(change.skillName);
    const current = skill?.die || skill?.value || "";
    const safe =
      skill &&
      DIE_STEPS.includes(change.before) &&
      DIE_STEPS.includes(change.after) &&
      current === change.after;
    return {
      safe,
      message: safe
        ? `Revert ${change.skillName} from ${change.after} to ${change.before || "untrained"}.`
        : `Cannot safely revert ${change.skillName}; current value is ${current || "missing"}.`,
    };
  }

  if (change.kind === "attribute-increased") {
    const key = change.attributeKey || normalizeAttributeKey(change.attributeName);
    const current = character.attributes?.[key] || "";
    const safe =
      key &&
      DIE_STEPS.includes(change.before) &&
      DIE_STEPS.includes(change.after) &&
      current === change.after;
    return {
      safe,
      message: safe
        ? `Revert ${displayNameFromKey(key)} from ${change.after} to ${change.before}.`
        : `Cannot safely revert ${change.attributeName}; current value is ${current || "missing"}.`,
    };
  }

  if (change.kind === "power-points-increased") {
    const resource = powerPointResource();
    const currentMax = Math.max(0, Math.floor(Number(resource?.max) || 0));
    const safe = resource && currentMax === change.after;
    const clampNote =
      resource && resource.current > change.before
        ? ` Current Power Points will be clamped from ${resource.current} to ${change.before}.`
        : "";
    return {
      safe,
      message: safe
        ? `Revert max Power Points from ${change.after} to ${change.before}.${clampNote}`
        : `Cannot safely revert Power Points; current max is ${currentMax}.`,
    };
  }

  return {
    safe: false,
    message: `Cannot safely undo unknown change ${change.kind || "unknown"}.`,
  };
}

function getAdvanceUndoPlan(advance) {
  const changes = Array.isArray(advance.appliedChanges)
    ? advance.appliedChanges
    : [];
  const checks = changes.map((change) => canUndoAdvanceChange(advance, change));
  return {
    safe: Boolean(changes.length) && checks.every((check) => check.safe),
    messages: checks.map((check) => check.message),
  };
}

function undoAdvanceChange(change) {
  if (change.kind === "edge-added") {
    character.edges = character.edges.filter((edge) => edge.id !== change.entityId);
  } else if (change.kind === "power-added") {
    character.powers = character.powers.filter((power) => power.id !== change.entityId);
  } else if (change.kind === "skill-increased") {
    const skill = findSkillByName(change.skillName);
    if (skill) {
      if (change.before) skill.die = change.before;
      else character.skills = character.skills.filter((item) => item !== skill);
    }
  } else if (change.kind === "attribute-increased") {
    const key = change.attributeKey || normalizeAttributeKey(change.attributeName);
    if (key) {
      character.attributes[key] = change.before;
      if (key === "strength") {
        character.armorStrength = change.before;
        character.weaponStrength = change.before;
      }
    }
  } else if (change.kind === "power-points-increased") {
    const resource = powerPointResource();
    if (resource) {
      resource.max = change.before;
      resource.current = Math.min(resource.current, resource.max);
    }
  }
}

function undoAdvanceChanges(advance) {
  (advance.appliedChanges || []).forEach(undoAdvanceChange);
}

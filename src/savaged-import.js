function arr(value) {
  return Array.isArray(value) ? value : value ? [value] : [];
}

function cents(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 100) : undefined;
}

function savagedMoney(data) {
  if (Number.isFinite(Number(data.wealth))) return cents(data.wealth);

  const parsed = Number(
    String(data.wealthFormatted || "").replace(/[^0-9.-]/g, ""),
  );
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}

function savagedBook(item) {
  return item.bookName && item.bookName !== "Custom"
    ? item.bookName
    : "Deadlands";
}

function savagedAmmoKey(item) {
  const text = `${item?.name || ""} ${item?.notes || ""}`.toLowerCase();
  if (/shotgun|shell/.test(text)) return "shotgun-shells";
  if (/arrow/.test(text)) return "arrow";
  if (/cap/.test(text)) return "percussion-caps";
  if (/rifle.*small/.test(text))
    return ammoKey("rifle", caliberFromText(text) || ".44");
  if (/rifle.*large/.test(text))
    return ammoKey("rifle", caliberFromText(text) || ".50");
  if (/pistol.*large/.test(text))
    return ammoKey("pistol", caliberFromText(text) || ".44");
  if (/pistol.*small/.test(text))
    return ammoKey("pistol", caliberFromText(text) || ".38");
  return slugify(item?.name || "ammo");
}

function isSavagedAmmo(item) {
  return /ammunition|ammo|shell|arrow|percussion cap/i.test(
    `${item?.name || ""} ${item?.notes || ""}`,
  );
}

function savagedWeaponAmmo(weapon) {
  const text = `${weapon?.name || ""} ${weapon?.notes || ""}`.toLowerCase();
  if (/shotgun|scattergun/.test(text)) return "shotgun-shells";
  if (/bow/.test(text)) return "arrow";
  if (/\.22|\.32|\.36|\.38/.test(text))
    return ammoKey("pistol", caliberFromText(text) || ".38");
  if (
    /\.40|\.41|\.44|\.45|\.50|44-40/.test(text) &&
    !/rifle|winchester|sharps|spencer|ballard|bullard|musket|carbine/.test(text)
  )
    return ammoKey("pistol", caliberFromText(text) || ".44");
  if (
    /rifle|winchester|sharps|spencer|ballard|bullard|musket|carbine/.test(text)
  ) {
    if (/\.50|\.56|\.57|\.58/.test(text))
      return ammoKey("rifle", caliberFromText(text) || ".50");
    return ammoKey("rifle", caliberFromText(text) || ".44");
  }
  return "";
}

function armorLocationFromSavaged(armor) {
  const checks = [
    ["head", "coversHead"],
    ["face", "coversFace"],
    ["torso", "coversTorso"],
    ["arms", "coversArms"],
    ["legs", "coversLegs"],
  ];
  const match = checks.find(([, key]) => armor?.[key]);
  return match ? match[0] : "torso";
}

function flattenSavagedGear(items, path = "", output = []) {
  arr(items).forEach((gear) => {
    output.push({ ...gear, containerPath: path });
    const nextPath = path ? `${path} > ${gear.name}` : gear.name;
    flattenSavagedGear(gear?.contains?.gear, nextPath, output);
  });
  return output;
}

function savagedInventoryItem(item) {
  const count = Math.max(1, Math.floor(Number(item.quantity) || 1));
  const contents = arr(item?.contains?.gear).map(savagedInventoryItem);
  return {
    id: slugify(item.uuid || item.name),
    uuid: item.uuid,
    source: "savaged.us",
    name: item.name || "Gear",
    count,
    location: "carried",
    note: item.notes || item.summary || "",
    weight: item.weight,
    totalWeight: parseWeight(item.weight),
    costCents: cents(item.costBuy ?? item.cost),
    book: savagedBook(item),
    isContainer: Boolean(item.container || contents.length),
    contents,
  };
}

function savagedReminder(type, item) {
  return {
    type,
    name: item.name || type,
    text: item.description || item.summary || item.notes || "",
  };
}

function savagedPowerNotes(arcaneBackground) {
  const powers = arr(arcaneBackground.powers)
    .map(
      (power) =>
        `${power.name}${Number.isFinite(Number(power.powerPoints)) ? ` (${power.powerPoints} PP)` : ""}`,
    )
    .join(", ");

  return [
    `${arcaneBackground.name || "Arcane Background"}${arcaneBackground.arcaneSkill ? ` • ${arcaneBackground.arcaneSkill}` : ""}`,
    powers ? `Powers: ${powers}` : "",
  ]
    .filter(Boolean)
    .join(". ");
}

function savagedArcaneBackgroundConfig(data) {
  const candidates = [
    ...arr(data.abs).map(
      (background) => background.name || background.edgeName,
    ),
    ...arr(data.edges).map((edge) => edge.name),
  ];
  const key = candidates.map(arcaneBackgroundKeyFromText).find(Boolean);
  return key ? ARCANE_BACKGROUNDS[key] : null;
}

function savagedHasArcaneBackgroundObject(data) {
  return arr(data.abs).some(
    (background) =>
      background?.name ||
      background?.hasPowerPointPool ||
      arr(background?.powers).length,
  );
}

function savagedHasArcaneBackgroundEdge(data) {
  return arr(data.edges).some((edge) => isArcaneBackgroundEdge(edge.name));
}

function savagedExplicitPowerPointValue(data) {
  const explicit = Number(
    data.powerPoints ?? data.powerPointsMax ?? data.pp ?? data.ppMax,
  );
  if (Number.isFinite(explicit) && explicit > 0) {
    return {
      current: Number(data.powerPoints) || explicit,
      max: Number(data.powerPointsMax) || explicit,
      note: "Imported from Savaged.us.",
    };
  }

  const abilityText = arr(data.abilities)
    .map((ability) => `${ability.name || ""} ${ability.description || ""}`)
    .join(" ");
  const match = abilityText.match(/Power Points:\s*(\d+)/i);
  if (match) {
    return {
      current: Number(match[1]),
      max: Number(match[1]),
      note: "Imported from Savaged.us abilities.",
    };
  }

  return null;
}

function shouldEnablePowerPointsFromImport(data) {
  return Boolean(
    savagedHasArcaneBackgroundEdge(data) ||
    savagedExplicitPowerPointValue(data) ||
    savagedHasArcaneBackgroundObject(data),
  );
}

function savagedResources(data) {
  const resources = [];
  const importConfig = savagedArcaneBackgroundConfig(data);

  arr(data.abs)
    .filter(
      (arcaneBackground) =>
        arcaneBackground.hasPowerPointPool ||
        Number(arcaneBackground.powerPointsMax) > 0 ||
        Number(arcaneBackground.powerPointsCurrent) > 0,
    )
    .forEach((arcaneBackground, index) => {
      const max =
        Number(arcaneBackground.powerPointsMax) ||
        Number(arcaneBackground.powerPointsCurrent) ||
        0;
      const current = Number(arcaneBackground.powerPointsCurrent);
      resources.push({
        id: index ? `power-points-${index}` : "power-points",
        name: arcaneBackground.powerPointsName || "Power Points",
        current: Number.isFinite(current) ? current : max,
        max,
        source:
          arcaneBackgroundConfigFromEdge(arcaneBackground.name)?.edgeName ||
          importConfig?.edgeName ||
          arcaneBackground.name ||
          "Savaged.us Arcane Background",
        note: savagedPowerNotes(arcaneBackground),
      });
    });

  if (data.usesSanity) {
    resources.push({
      id: "sanity",
      name: "Sanity",
      current: Number(data.sanity) || 0,
      max: Number(data.sanity) || 0,
      note: "Imported from Savaged.us.",
    });
  }
  if (data.usesStrain) {
    resources.push({
      id: "strain",
      name: "Strain",
      current: Number(data.strainCurrent) || 0,
      max: Number(data.strainMax) || 0,
      note: "Imported from Savaged.us.",
    });
  }
  if (data.usesRippersReason) {
    resources.push({
      id: "rippers-reason",
      name: "Reason",
      current: Number(data.ripperReason) || 0,
      max: Number(data.ripperReason) || 0,
      note: "Rippers resource imported from Savaged.us.",
    });
  }
  if (data.usesRippersStatus) {
    resources.push({
      id: "rippers-status",
      name: "Status",
      current: Number(data.ripperStatus) || 0,
      max: Number(data.ripperStatus) || 0,
      note: "Rippers resource imported from Savaged.us.",
    });
  }

  const explicit = savagedExplicitPowerPointValue(data);
  if (
    !resources.some((resource) => resource.id === "power-points") &&
    explicit
  ) {
    resources.push({
      ...makePowerPointResource(importConfig, {
        ...explicit,
        source: importConfig?.edgeName || "Savaged.us explicit Power Points",
      }),
    });
  }

  if (
    !resources.some((resource) => resource.id === "power-points") &&
    importConfig &&
    shouldEnablePowerPointsFromImport(data)
  ) {
    resources.push(makePowerPointResource(importConfig));
  }

  return resources;
}

function savagedDieSides(value) {
  return Number(String(value || "").match(/\d+/)?.[0]) || 0;
}

function savagedHasTrainedArcaneSkill(data) {
  return arr(data.skills).some(
    (skill) =>
      ARCANE_SKILLS.includes(skill.name) && savagedDieSides(skill.value) >= 4,
  );
}

function savagedPowers(data, config) {
  const imported = arr(data.abs).flatMap((background) =>
    arr(background.powers).map((power, index) =>
      normalizePowerRecord(
        {
          id: power.uuid || power.id || `${background.name}-power-${index}`,
          name: power.name || power.bookPowerName || power.aspectOnlyName || "",
          rank: power.rank || "Novice",
          baseCost: power.powerPoints || "",
          duration: power.duration || "",
          active: false,
          source:
            arcaneBackgroundConfigFromEdge(background.name)?.edgeName ||
            config?.edgeName ||
            background.name ||
            "Savaged.us Arcane Background",
          trapping: power.trappings || "",
          notes: power.summary || power.description || "",
          modifiers: power.powerModifiers || [],
        },
        index,
        config?.edgeName,
      ),
    ),
  );
  if (imported.length) return imported;
  return config && shouldEnablePowerPointsFromImport(data)
    ? makeStartingPowers(config)
    : [];
}

function savagedImportWarnings(data, resources, config) {
  const warnings = [];
  const fallbackText =
    `${data.name || ""} ${data.professionOrTitle || ""} ${data.raceGenderAndProfession || ""}`.toLowerCase();
  const hasPowerPoints = resources.some(
    (resource) => resource.id === "power-points",
  );

  if (
    !hasPowerPoints &&
    !data.noPowerPoints &&
    (savagedHasTrainedArcaneSkill(data) ||
      /(melchizedek|priesthood|preacher|elder|blessed|miracle|miracles|shaman)/.test(
        fallbackText,
      ))
  ) {
    warnings.push({
      type: "Import Warning",
      name: "Possible Power Points",
      text: "This character looks like it may be intended as an arcane character, but the imported JSON does not include an Arcane Background, powers, or Power Points. Confirm manually before enabling Power Points.",
    });
  }
  if (!hasPowerPoints && /harrowed/i.test(fallbackText)) {
    warnings.push({
      type: "Import Warning",
      name: "Harrowed",
      text: "Harrowed are not Power Point Arcane Background characters. Track Dominion and Harrowed-specific rules separately.",
    });
  }
  if (config && hasPowerPoints) warnings.push(makeArcaneReminder(config));

  return warnings;
}

function fromSavagedUs(data) {
  const strength =
    arr(data.attributes).find((attribute) => attribute.name === "strength")
      ?.value || "d4";
  const ammo = {};
  const inventory = [];
  const consumables = [];

  arr(data.gear).forEach((item) => {
    const count = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const isContainer = Boolean(item.container || arr(item?.contains?.gear).length);

    if (isContainer) {
      inventory.push(savagedInventoryItem(item));
      return;
    }

    if (isSavagedAmmo(item)) {
      const key = savagedAmmoKey(item);
      if (!ammo[key])
        ammo[key] = {
          label: ammoReserveForKey(key, { label: item.name || "Ammo" }).label,
          count: 0,
          weight: parseWeight(item.weight) / count,
          itemLocation: "carried",
          costCents: cents(item.costBuy ?? item.cost),
        };
      ammo[key].count += count;
      return;
    }

    if (/ration/i.test(item.name))
      consumables.push({
        id: slugify(item.uuid || item.name),
        uuid: item.uuid,
        source: "savaged.us",
        name: item.name,
        count,
        unit: "days",
        weight: parseWeight(item.weight) / count,
        itemLocation: "carried",
      });
    else if (/match/i.test(item.name))
      consumables.push({
        id: slugify(item.uuid || item.name),
        uuid: item.uuid,
        source: "savaged.us",
        name: "Matches",
        count: count * (/100/.test(item.name) ? 100 : 1),
        unit: "matches",
        weight: parseWeight(item.weight) / (count * (/100/.test(item.name) ? 100 : 1)),
        itemLocation: "carried",
      });
    else if (/elixir|oil|tobacco/i.test(item.name))
      consumables.push({
        id: slugify(item.uuid || item.name),
        uuid: item.uuid,
        source: "savaged.us",
        name: item.name,
        count,
        unit: /oil/i.test(item.name)
          ? "uses"
          : /tobacco/i.test(item.name)
            ? "pouch"
            : "dose",
        weight: parseWeight(item.weight) / count,
        itemLocation: "carried",
      });
    else
      inventory.push({
        id: slugify(item.uuid || item.name),
        uuid: item.uuid,
        source: "savaged.us",
        name: item.name || "Gear",
        count,
        location: item.equipped ? "equipped" : "carried",
        note: item.notes || item.summary || "",
        weight: item.weight,
        totalWeight: parseWeight(item.weight),
        costCents: cents(item.costBuy ?? item.cost),
        book: savagedBook(item),
      });
  });

  const weapons = [];
  arr(data.weapons)
    .filter(
      (weapon) => !weapon.innate && weapon.name && weapon.name !== "Unarmed",
    )
    .forEach((weapon, weaponIndex) => {
      const quantity = Math.max(1, Math.floor(Number(weapon.quantity) || 1));
      for (let index = 0; index < quantity; index += 1) {
        const capacity = Math.max(0, Math.floor(Number(weapon.shots) || 0));
        const ammoType = capacity ? savagedWeaponAmmo(weapon) : "";
        weapons.push({
          id: slugify(weapon.uuid || `${weapon.name}-${weaponIndex}-${index}`),
          name: weapon.name,
          damage: weapon.damage || weapon.damageWithBrackets || "—",
          range: weapon.range || "—",
          ap: weapon.ap ?? "—",
          rof: weapon.rof || weapon.rof === 0 ? String(weapon.rof) : "—",
          shotsMax: capacity && ammoType ? capacity : null,
          shotsLoaded: capacity && ammoType ? capacity : null,
          ammoType: capacity && ammoType ? ammoType : null,
          notes: weapon.notes || "",
          weight: weapon.weight,
          itemLocation: "carried",
          costCents: cents(weapon.costBuy ?? weapon.cost),
          minStr: weapon.minStr || "—",
          book: savagedBook(weapon),
        });
      }
    });

  weapons.forEach((weapon) => {
    if (weapon.ammoType && !ammo[weapon.ammoType]) {
      ammo[weapon.ammoType] = {
        ...ammoReserveForKey(weapon.ammoType),
        count: 0,
      };
    }
  });

  const armorInventory = arr(data.armor)
    .filter(
      (armor) =>
        armor.name &&
        armor.name !== "(Unarmored)" &&
        (Number(armor.armor) || 0) > 0,
    )
    .map((armor, index) => ({
      id: slugify(armor.uuid || `${armor.name}-${index}`),
      name: armor.name,
      count: Math.max(1, Math.floor(Number(armor.quantity) || 1)),
      armor: Math.max(0, Math.floor(Number(armor.armor) || 0)),
      weight: armor.weight,
      itemLocation: armor.equipped ? "equipped" : "carried",
      minStr: armor.minStr || strength,
      costCents: cents(armor.costBuy ?? armor.cost),
      book: savagedBook(armor),
      location: armorLocationFromSavaged(armor),
      equipped: Boolean(armor.equipped),
      note: armor.notes || "",
    }));

  arr(data.shields)
    .filter((shield) => shield.name)
    .forEach((shield, index) => {
      armorInventory.push({
        id: slugify(shield.uuid || `${shield.name}-${index}`),
        name: shield.name,
        count: Math.max(1, Math.floor(Number(shield.quantity) || 1)),
        armor: Math.max(0, Math.floor(Number(shield.armor) || 0)),
        weight: shield.weight,
        itemLocation: shield.equipped ? "equipped" : "carried",
        minStr: shield.minStr || strength,
        costCents: cents(shield.costBuy ?? shield.cost),
        book: savagedBook(shield),
        location: "shield",
        equipped: Boolean(shield.equipped),
        note: shield.notes || "Shield / carried.",
      });
    });

  const attrs = arr(data.attributes).map(
    (attribute) =>
      `${attribute.label || attribute.name}: ${attribute.value}${attribute.mod ? ` (${attribute.mod > 0 ? "+" : ""}${attribute.mod})` : ""}`,
  );
  const skills = arr(data.skills)
    .filter((skill) => skill.name && skill.name !== "(Unskilled)")
    .map((skill) => `${skill.name} ${skill.value}`);
  const notes = [
    data.playerName ? `Player: ${data.playerName}` : "",
    data.savagedUsShareURL ? `Savaged.us: ${data.savagedUsShareURL}` : "",
    `Load: ${data.load ?? 0} / ${data.loadLimit ?? "—"}`,
    attrs.length ? `Attributes: ${attrs.join(", ")}` : "",
    skills.length ? `Skills: ${skills.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const arcaneConfig = savagedArcaneBackgroundConfig(data);
  const resources = savagedResources(data);
  const powers = savagedPowers(data, arcaneConfig);

  return normalize({
    source: "savaged.us",
    setupStatus: "needsReview",
    sourceId: data.uuid || data.id || data.saveID,
    name: data.name || "Imported Character",
    rank: data.rankName || data.rank || "Novice",
    ancestry: data.race || "—",
    archetype: data.professionOrTitle || "",
    attributes: Object.fromEntries(
      arr(data.attributes)
        .filter((attribute) => attribute.name && attribute.value)
        .map((attribute) => [attribute.name, attribute.value]),
    ),
    skills: arr(data.skills)
      .filter((skill) => skill.name && skill.name !== "(Unskilled)")
      .map((skill) => ({
        name: skill.name,
        die: skill.value,
        linkedAttribute: skill.attribute || skill.linkedAttribute || "",
        notes: skill.mod ? `Modifier ${skill.mod}` : "",
      })),
    hindrances: arr(data.hindrances).map((hindrance) => ({
      name: hindrance.name || "Hindrance",
      severity: hindrance.severity || "",
      major: hindrance.major,
      notes:
        hindrance.description || hindrance.summary || hindrance.notes || "",
    })),
    edges: arr(data.edges).map((edge) => ({
      name: edge.name || "Edge",
      source: savagedBook(edge),
      importNote: edge.note || "",
      notes: edge.description || edge.summary || edge.notes || "",
    })),
    bennies: {
      current: Number(data.bennies) || Number(data.benniesMax) || 3,
      starting: Number(data.benniesMax) || Number(data.bennies) || 3,
      normalStarting: 3,
    },
    conviction: 0,
    damage: {
      wounds: Number(data.wounds) || 0,
      maxWounds: Number(data.woundsMax) || 3,
      fatigue: Number(data.fatigue) || 0,
      maxFatigue: Number(data.fatigueMax) || 2,
    },
    derived: {
      pace: Number(data.paceTotal) || 6,
      parry: Number(data.parryTotal) || 2,
      baseToughness:
        Number(data.toughnessTotalNoArmor) || Number(data.toughnessBase) || 0,
      toughness:
        Number(data.toughnessTotal) || Number(data.toughnessTotalNoArmor) || 0,
      armor: Math.max(
        0,
        (Number(data.toughnessTotal) || 0) -
          (Number(data.toughnessTotalNoArmor) || 0),
      ),
    },
    armorStrength: strength,
    weaponStrength: strength,
    selectedArmorLocation: "best",
    moneyCents: savagedMoney(data),
    ammo,
    weapons,
    armorInventory,
    arcaneBackground: arcaneConfig
      ? makeArcaneBackgroundState(arcaneConfig)
      : null,
    resources,
    powers,
    advances: Array.isArray(data.advances) ? data.advances : [],
    hucksterDeal: arcaneConfig?.key === "huckster" ? makeHucksterDeal() : null,
    conditions: clone(defaultCharacter.conditions),
    temporaryConditions: clone(defaultCharacter.temporaryConditions),
    consumables,
    inventory,
    vehicles: arr(data.vehicles).map((vehicle, index) => ({
      id: slugify(vehicle.uuid || `${vehicle.name || "vehicle"}-${index}`),
      name: vehicle.name || "Vehicle",
      count: Math.max(1, Math.floor(Number(vehicle.quantity) || 1)),
      note: vehicle.notes || vehicle.summary || "",
      costCents: cents(vehicle.costBuy ?? vehicle.cost),
      book: savagedBook(vehicle),
    })),
    reminders: [
      ...savagedImportWarnings(data, resources, arcaneConfig),
      ...arr(data.hindrances).map((item) => savagedReminder("Hindrance", item)),
      ...arr(data.edges).map((item) => savagedReminder("Edge", item)),
    ],
    notes,
  });
}

function isSavagedUsExport(data) {
  return Boolean(
    data &&
    typeof data === "object" &&
    ("appVersion" in data || "savagedUsShareURL" in data) &&
    "attributes" in data &&
    "skills" in data,
  );
}

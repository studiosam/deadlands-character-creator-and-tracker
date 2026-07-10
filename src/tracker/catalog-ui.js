/**
 * Read-only catalog and picker UI helpers.
 *
 * Catalog data is treated as app metadata used for selection, preview, and
 * setup validation. This module should not mutate character state directly
 * except through explicit caller-owned actions.
 */
function ammoOptions(selected = "") {
  const ammoMap = character?.ammo || {};
  const selectedMissing = selected && !ammoMap[selected];
  return [
    `<option value=""${!selected ? " selected" : ""}>No ammunition tracking</option>`,
    selectedMissing
      ? `<option value="${esc(selected)}" selected>${esc(ammoReserveForKey(selected).label)} (no reserve)</option>`
      : "",
    ...Object.entries(ammoMap).map(
      ([key, ammo]) =>
        `<option value="${esc(key)}"${key === selected ? " selected" : ""}>${esc(ammo.label)}</option>`,
    ),
  ].join("");
}

function entryCatalogOptions(items, placeholder) {
  return [
    `<option value="">${placeholder}</option>`,
    ...items
      .map(
        (item) =>
          `<option value="${esc(item.id)}">${esc(item.name)}${item.rank ? ` • ${esc(item.rank)}` : ""}${item.severity ? ` • ${esc(item.severity)}` : ""}${item.source ? ` • ${esc(item.source)}` : ""}</option>`,
      )
      .join(""),
  ].join("");
}

function catalogs() {
  els.gearSelect.innerHTML = optionList(
    byName(GEAR_CATALOG),
    "Choose gear from catalog…",
    (item) => `${wt(item.weight)} lb • ${money(item.costCents)}`,
  );
  els.armorCatalogSelect.innerHTML = optionList(
    ARMOR_CATALOG,
    "Choose armor from catalog…",
    (item) =>
      `+${item.armor} • ${wt(item.weight)} lb • ${money(item.costCents)}`,
  );
  els.weaponCatalogSelect.innerHTML = optionList(
    WEAPON_CATALOG,
    "Choose weapon from catalog…",
    (item) => `${wt(item.weight)} lb • ${money(item.costCents)}`,
  );
  els.vehicleCatalogSelect.innerHTML = optionList(
    VEHICLE_CATALOG,
    "Choose vehicle from catalog…",
    (item) => money(item.costCents),
  );
  els.edgeCatalogSelect.innerHTML = entryCatalogOptions(
    EDGE_CATALOG.filter(isUserFacingEdgeCatalogEntry),
    "Manual Edge or choose from catalog…",
  );
  els.hindranceCatalogSelect.innerHTML = entryCatalogOptions(
    HINDRANCE_CATALOG,
    "Manual Hindrance or choose from catalog…",
  );
  els.armorLocationSelect.innerHTML = ARMOR_LOCATIONS.map(
    (location) =>
      `<option value="${esc(location.id)}">${esc(location.label)}</option>`,
  ).join("");
  els.weaponAmmoTypeSelect.innerHTML = ammoOptions();
}

function chosen(items, id) {
  return items.find((item) => item.id === id);
}

var catalogBrowserType = "edges";

function catalogBrowserTypes() {
  return {
    edges: {
      label: "Edges",
      empty: "No matching Edges.",
      records: () => (EDGE_CATALOG || []).filter(isUserFacingEdgeCatalogEntry),
    },
    hindrances: {
      label: "Hindrances",
      empty: "No matching Hindrances.",
      records: () => HINDRANCE_CATALOG || [],
    },
    powers: {
      label: "Powers",
      empty: "No matching Powers.",
      records: () =>
        Array.isArray(window.POWER_CATALOG) ? window.POWER_CATALOG : [],
    },
  };
}

function catalogBrowserConfig(type = catalogBrowserType) {
  const configs = catalogBrowserTypes();
  return configs[type] || configs.edges;
}

function catalogText(value) {
  return String(value ?? "").trim();
}

function catalogSearchText(value) {
  return catalogText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function catalogUniqueValues(values) {
  return [...new Set(values.map(catalogText).filter(Boolean))].sort(
    (left, right) =>
      left.localeCompare(right, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
  );
}

function catalogOptionList(values, selected, placeholder = "All") {
  return [
    `<option value="">${esc(placeholder)}</option>`,
    ...values.map(
      (value) =>
        `<option value="${esc(value)}"${value === selected ? " selected" : ""}>${esc(value)}</option>`,
    ),
  ].join("");
}

function catalogPowerBackgroundNames() {
  return catalogUniqueValues(
    Object.values(window.ARCANE_BACKGROUND_POWER_PROFILES || {}).map(
      (profile) => profile.name,
    ),
  );
}

function catalogPowerRestrictionsText(power) {
  const restrictions = Object.entries(power?.restrictionsByBackground || {});
  return restrictions.length
    ? restrictions.map(([name, text]) => `${name}: ${text}`).join("; ")
    : "";
}

function catalogPowerRequiredText(power) {
  return (power?.requiredForBackgrounds || []).join(", ");
}

function catalogItemSearchFields(item, type) {
  if (type === "powers") {
    return [
      item.name,
      item.rank,
      item.powerPoints,
      item.range,
      item.duration,
      item.source,
      item.shortSummary,
      item.variableCostNotes,
      (item.allowedBackgrounds || []).join(" "),
      catalogPowerRequiredText(item),
      catalogPowerRestrictionsText(item),
      (item.tags || []).join(" "),
    ];
  }
  if (type === "hindrances") {
    return [item.name, item.severity, item.source, item.shortSummary];
  }
  return [
    item.name,
    item.category,
    item.rank,
    item.requirements,
    item.source,
    item.shortSummary,
    item.subchoice,
  ];
}

function catalogItemMatchesSearch(item, type, query) {
  if (!query) return true;
  return catalogSearchText(
    catalogItemSearchFields(item, type).join(" "),
  ).includes(query);
}

function catalogCurrentFilters() {
  return {
    edgeCategory: $("#catalogEdgeCategoryFilter")?.value || "",
    edgeRank: $("#catalogEdgeRankFilter")?.value || "",
    hindranceSeverity: $("#catalogHindranceSeverityFilter")?.value || "",
    powerRank: $("#catalogPowerRankFilter")?.value || "",
    powerBackground: $("#catalogPowerBackgroundFilter")?.value || "",
  };
}

function catalogRenderFilters(type, filters) {
  if (!els.catalogFilterFields) return;
  if (type === "edges") {
    const categories = catalogUniqueValues(
      catalogBrowserConfig(type)
        .records()
        .map((item) => item.category),
    );
    const ranks = catalogUniqueValues(
      catalogBrowserConfig(type)
        .records()
        .map((item) => item.rank),
    );
    els.catalogFilterFields.innerHTML = `
      <label>Category<select id="catalogEdgeCategoryFilter" data-catalog-filter="edgeCategory">${catalogOptionList(categories, filters.edgeCategory, "All categories")}</select></label>
      <label>Rank<select id="catalogEdgeRankFilter" data-catalog-filter="edgeRank">${catalogOptionList(ranks, filters.edgeRank, "All ranks")}</select></label>
    `;
    return;
  }
  if (type === "hindrances") {
    const severities = catalogUniqueValues(
      catalogBrowserConfig(type)
        .records()
        .map((item) => item.severity),
    );
    els.catalogFilterFields.innerHTML = `
      <label>Severity<select id="catalogHindranceSeverityFilter" data-catalog-filter="hindranceSeverity">${catalogOptionList(severities, filters.hindranceSeverity, "All severities")}</select></label>
    `;
    return;
  }

  const ranks = catalogUniqueValues(
    catalogBrowserConfig(type)
      .records()
      .map((item) => item.rank),
  );
  els.catalogFilterFields.innerHTML = `
    <label>Rank<select id="catalogPowerRankFilter" data-catalog-filter="powerRank">${catalogOptionList(ranks, filters.powerRank, "All ranks")}</select></label>
    <label>Arcane Background<select id="catalogPowerBackgroundFilter" data-catalog-filter="powerBackground">${catalogOptionList(catalogPowerBackgroundNames(), filters.powerBackground, "All backgrounds")}</select></label>
  `;
}

function catalogFilterItems(items, type, filters, query) {
  return byName(items).filter((item) => {
    if (!catalogItemMatchesSearch(item, type, query)) return false;
    if (
      type === "edges" &&
      filters.edgeCategory &&
      item.category !== filters.edgeCategory
    )
      return false;
    if (type === "edges" && filters.edgeRank && item.rank !== filters.edgeRank)
      return false;
    if (
      type === "hindrances" &&
      filters.hindranceSeverity &&
      item.severity !== filters.hindranceSeverity
    )
      return false;
    if (
      type === "powers" &&
      filters.powerRank &&
      item.rank !== filters.powerRank
    )
      return false;
    if (
      type === "powers" &&
      filters.powerBackground &&
      !(item.allowedBackgrounds || []).includes(filters.powerBackground)
    )
      return false;
    return true;
  });
}

function catalogResultMeta(item, type) {
  if (type === "powers")
    return `${item.rank || "Unknown"} • ${item.powerPoints || "?"} PP • ${item.source || "Unknown source"}`;
  if (type === "hindrances")
    return `${item.severity || "Unknown"} • ${item.source || "Unknown source"}`;
  return `${item.category || "Unknown"} • ${item.rank || "Unknown"} • ${item.source || "Unknown source"}`;
}

function catalogRenderRestrictionList(power) {
  const restrictions = Object.entries(power?.restrictionsByBackground || {});
  if (!restrictions.length) return "None";
  return restrictions.map(([name, text]) => `${name}: ${text}`).join("; ");
}

function catalogResultDetailRows(item, type) {
  if (type === "powers") {
    return [
      ["Range", item.range],
      ["Duration", item.duration],
      [
        "Allowed Backgrounds",
        (item.allowedBackgrounds || []).join(", ") || "None recorded",
      ],
      ["Restrictions", catalogRenderRestrictionList(item)],
      item.variableCostNotes ? ["Variable PP", item.variableCostNotes] : null,
    ].filter(Boolean);
  }
  if (type === "hindrances") return [];
  return [["Requirements", item.requirements || "None"]];
}

function catalogRenderResult(item, type) {
  const detailRows = catalogResultDetailRows(item, type);
  const tags = type === "powers" ? item.tags || [] : [];
  return `<article class="catalog-result">
    <div class="catalog-result-heading">
      <strong>${esc(item.name)}</strong>
      <span class="pill">${esc(type === "hindrances" ? item.severity || "Unknown" : item.rank || item.category || "Unknown")}</span>
    </div>
    <span class="catalog-result-meta">${esc(catalogResultMeta(item, type))}</span>
    ${item.shortSummary ? `<p>${esc(item.shortSummary)}</p>` : ""}
    ${
      detailRows.length
        ? `<dl class="catalog-result-details">${detailRows
            .map(
              ([label, value]) =>
                `<div><dt>${esc(label)}</dt><dd>${esc(value || "None recorded")}</dd></div>`,
            )
            .join("")}</dl>`
        : ""
    }
    ${
      tags.length
        ? `<div class="catalog-chip-list">${tags
            .map((tag) => `<span>${esc(tag)}</span>`)
            .join("")}</div>`
        : ""
    }
  </article>`;
}

function catalogSetType(type) {
  if (!catalogBrowserTypes()[type]) return;
  catalogBrowserType = type;
  renderCatalogBrowser();
}

function renderCatalogBrowser() {
  if (
    !els.catalogSearchInput ||
    !els.catalogFilterFields ||
    !els.catalogResultsList
  )
    return;

  const type = catalogBrowserTypes()[catalogBrowserType]
    ? catalogBrowserType
    : "edges";
  catalogBrowserType = type;
  const config = catalogBrowserConfig(type);
  const filters = catalogCurrentFilters();
  const query = catalogSearchText(els.catalogSearchInput.value);
  catalogRenderFilters(type, filters);

  document.querySelectorAll("[data-catalog-type]").forEach((button) => {
    const active = button.dataset.catalogType === type;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });

  const results = catalogFilterItems(config.records(), type, filters, query);
  els.catalogResultSummary.textContent = results.length
    ? `${results.length} ${config.label}`
    : "No matches";
  els.catalogResultsList.innerHTML = results.length
    ? results.map((item) => catalogRenderResult(item, type)).join("")
    : emptyState(config.empty);
}

function updatePreviews() {
  if (typeof renderInventoryLocationOptions === "function")
    renderInventoryLocationOptions();
  const gear = chosen(GEAR_CATALOG, els.gearSelect.value);
  const consumableConversion = consumableConversionForGear(gear);
  els.inventoryUnitsField.classList.toggle(
    "hidden",
    !consumableConversion?.unitsLabel,
  );
  if (consumableConversion?.unitsLabel) {
    els.inventoryUnitsLabel.textContent = consumableConversion.unitsLabel;
    els.inventoryUnitsInput.placeholder = String(
      consumableConversion.multiplier,
    );
  } else {
    els.inventoryUnitsInput.value = "";
  }
  const packageCount = Math.max(
    1,
    Math.floor(Number(els.inventoryCountInput.value) || 1),
  );
  const unitsPerPackage = Math.max(
    1,
    Math.floor(
      Number(els.inventoryUnitsInput.value) ||
        consumableConversion?.multiplier ||
        1,
    ),
  );
  els.gearPreview.textContent = gear
    ? consumableConversion
      ? `${gear.name} - Adds ${packageCount * unitsPerPackage} ${consumableConversion.unit} to Consumables`
      : `${gear.name} - ${gear.category || "Gear"} - Weight ${wt(gear.weight)} - Cost ${money(gear.costCents)} each`
    : "Choose gear from the catalog or type custom gear.";

  const armor = chosen(ARMOR_CATALOG, els.armorCatalogSelect.value);
  els.armorCatalogPreview.textContent = armor
    ? `${armor.name} • +${armor.armor} armor • ${armorLabel(armor.location)} • Min Str ${armor.minStr} • ${money(armor.costCents)}`
    : "Choose armor from the catalog or type custom armor.";
  if (armor) {
    els.armorValueInput.value = armor.armor;
    els.armorLocationSelect.value = armor.location;
  }

  const weapon = chosen(WEAPON_CATALOG, els.weaponCatalogSelect.value);
  els.weaponCatalogPreview.textContent = weapon
    ? `${weapon.name} • Min Str ${weapon.minStr} • Weight ${wt(weapon.weight)} • Cost ${money(weapon.costCents)}. Fill blank combat stats manually.`
    : "Choose a weapon from the catalog or type custom weapon.";
  if (weapon) {
    els.weaponDamageInput.value = weapon.damage || "";
    els.weaponRangeInput.value = weapon.range || "";
    els.weaponApInput.value = weapon.ap !== undefined ? weapon.ap : "";
    els.weaponRofInput.value = weapon.rof || "";
    els.weaponCapacityInput.value = weapon.shotsMax || "";
    els.weaponAmmoTypeSelect.innerHTML = ammoOptions(
      exactAmmoTypeForWeapon(weapon),
    );
  }

  const vehicle = chosen(VEHICLE_CATALOG, els.vehicleCatalogSelect.value);
  els.vehicleCatalogPreview.textContent = vehicle
    ? `${vehicle.name} - ${vehicle.category || "Vehicle"} - Size ${vehicle.size || "-"} - Handling ${vehicle.handling || "-"} - Top Speed ${vehicle.topSpeed ?? "-"} MPH - Toughness ${vehicle.toughness || "-"} - Crew ${vehicle.crew || "-"} - Cost ${money(vehicle.costCents)} each`
    : "Choose a vehicle from the catalog or type a custom vehicle.";
}

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

function caliberOptionsForAmmo(item, selected = "") {
  const options = AMMO_CALIBERS_BY_CATALOG_ID[item?.id] || [];
  if (!options.length) {
    return '<option value="">No caliber selection</option>';
  }
  const selectedCaliber =
    normalizeCaliber(selected) ||
    caliberFromText(els.ammoLabelInput.value) ||
    LEGACY_AMMO_KEY_DEFAULTS[item.id]?.caliber ||
    options[0];
  return options
    .map(
      (caliber) =>
        `<option value="${esc(caliber)}"${caliber === selectedCaliber ? " selected" : ""}>${esc(caliber)}</option>`,
    )
    .join("");
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
  els.ammoGearSelect.innerHTML = optionList(
    GEAR_CATALOG.filter(isAmmo),
    "Choose ammunition from catalog…",
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
    EDGE_CATALOG,
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
  els.ammoCaliberSelect.innerHTML = caliberOptionsForAmmo();
}

function chosen(items, id) {
  return items.find((item) => item.id === id);
}

var catalogBrowserType = "edges";
var catalogBrowserSelectedIds = {
  edges: "",
  hindrances: "",
  powers: "",
};

function catalogBrowserTypes() {
  return {
    edges: {
      label: "Edges",
      empty: "No matching Edges.",
      records: () => EDGE_CATALOG || [],
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
  return [...new Set(values.map(catalogText).filter(Boolean))].sort((left, right) =>
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
    return [
      item.name,
      item.severity,
      item.source,
      item.shortSummary,
    ];
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
  return catalogSearchText(catalogItemSearchFields(item, type).join(" ")).includes(
    query,
  );
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
      catalogBrowserConfig(type).records().map((item) => item.category),
    );
    const ranks = catalogUniqueValues(
      catalogBrowserConfig(type).records().map((item) => item.rank),
    );
    els.catalogFilterFields.innerHTML = `
      <label>Category<select id="catalogEdgeCategoryFilter" data-catalog-filter="edgeCategory">${catalogOptionList(categories, filters.edgeCategory, "All categories")}</select></label>
      <label>Rank<select id="catalogEdgeRankFilter" data-catalog-filter="edgeRank">${catalogOptionList(ranks, filters.edgeRank, "All ranks")}</select></label>
    `;
    return;
  }
  if (type === "hindrances") {
    const severities = catalogUniqueValues(
      catalogBrowserConfig(type).records().map((item) => item.severity),
    );
    els.catalogFilterFields.innerHTML = `
      <label>Severity<select id="catalogHindranceSeverityFilter" data-catalog-filter="hindranceSeverity">${catalogOptionList(severities, filters.hindranceSeverity, "All severities")}</select></label>
    `;
    return;
  }

  const ranks = catalogUniqueValues(
    catalogBrowserConfig(type).records().map((item) => item.rank),
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
    if (type === "powers" && filters.powerRank && item.rank !== filters.powerRank)
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

function catalogRenderResult(item, type, selectedId) {
  const selected = item.id === selectedId;
  return `<button class="catalog-result ${selected ? "active" : ""}" type="button" data-catalog-result-id="${esc(item.id)}"${selected ? ' aria-current="true"' : ""}>
    <strong>${esc(item.name)}</strong>
    <span>${esc(catalogResultMeta(item, type))}</span>
    ${item.shortSummary ? `<small>${esc(item.shortSummary)}</small>` : ""}
  </button>`;
}

function catalogDetailGrid(rows) {
  return `<div class="catalog-detail-grid">${rows
    .map(
      ([label, value]) =>
        `<div><span>${esc(label)}</span><strong>${esc(value || "None recorded")}</strong></div>`,
    )
    .join("")}</div>`;
}

function edgeChoiceText(edge) {
  if (edge?.subchoice === true) return "Required choice";
  const text = catalogText(edge?.subchoice);
  return text || "None recorded";
}

function catalogRenderEdgeDetail(edge) {
  return `<article class="catalog-detail-card">
    <div class="catalog-detail-heading">
      <div>
        <p class="eyebrow">Edge</p>
        <h3>${esc(edge.name)}</h3>
      </div>
      <span class="pill">${esc(edge.rank || "Unknown")}</span>
    </div>
    ${catalogDetailGrid([
      ["Category", edge.category],
      ["Rank", edge.rank],
      ["Requirements", edge.requirements || "None"],
      ["Required Choice", edgeChoiceText(edge)],
      ["Source", edge.source],
    ])}
    ${edge.shortSummary ? `<p>${esc(edge.shortSummary)}</p>` : ""}
  </article>`;
}

function catalogRenderHindranceDetail(hindrance) {
  return `<article class="catalog-detail-card">
    <div class="catalog-detail-heading">
      <div>
        <p class="eyebrow">Hindrance</p>
        <h3>${esc(hindrance.name)}</h3>
      </div>
      <span class="pill">${esc(hindrance.severity || "Unknown")}</span>
    </div>
    ${catalogDetailGrid([
      ["Severity", hindrance.severity],
      ["Source", hindrance.source],
    ])}
    ${hindrance.shortSummary ? `<p>${esc(hindrance.shortSummary)}</p>` : ""}
  </article>`;
}

function catalogRenderRestrictionList(power) {
  const restrictions = Object.entries(power?.restrictionsByBackground || {});
  if (!restrictions.length) return "None";
  return restrictions.map(([name, text]) => `${name}: ${text}`).join("; ");
}

function catalogRenderPowerDetail(power) {
  const tags = power.tags || [];
  return `<article class="catalog-detail-card">
    <div class="catalog-detail-heading">
      <div>
        <p class="eyebrow">Power</p>
        <h3>${esc(power.name)}</h3>
      </div>
      <span class="pill">${esc(power.rank || "Unknown")}</span>
    </div>
    ${catalogDetailGrid([
      ["Rank", power.rank],
      ["Power Points", power.powerPoints],
      ["Range", power.range],
      ["Duration", power.duration],
      ["Allowed Arcane Backgrounds", (power.allowedBackgrounds || []).join(", ")],
      ["Required Arcane Backgrounds", catalogPowerRequiredText(power) || "None"],
      ["Restrictions", catalogRenderRestrictionList(power)],
      ["Source", power.source],
    ])}
    ${power.shortSummary ? `<p>${esc(power.shortSummary)}</p>` : ""}
    ${
      power.variableCostNotes
        ? `<p class="muted"><strong>Variable PP:</strong> ${esc(power.variableCostNotes)}</p>`
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

function catalogRenderDetail(item, type) {
  if (!item) return emptyState("Choose a catalog entry to view details.");
  if (type === "powers") return catalogRenderPowerDetail(item);
  if (type === "hindrances") return catalogRenderHindranceDetail(item);
  return catalogRenderEdgeDetail(item);
}

function catalogSetType(type) {
  if (!catalogBrowserTypes()[type]) return;
  catalogBrowserType = type;
  renderCatalogBrowser();
}

function catalogSelectResult(id) {
  if (!id) return;
  catalogBrowserSelectedIds[catalogBrowserType] = id;
  renderCatalogBrowser();
}

function renderCatalogBrowser() {
  if (
    !els.catalogSearchInput ||
    !els.catalogFilterFields ||
    !els.catalogResultsList ||
    !els.catalogDetailPanel
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
  let selectedId = catalogBrowserSelectedIds[type];
  if (!results.some((item) => item.id === selectedId))
    selectedId = results[0]?.id || "";
  catalogBrowserSelectedIds[type] = selectedId;
  const selected = results.find((item) => item.id === selectedId) || null;

  els.catalogResultSummary.textContent = results.length
    ? `${results.length} ${config.label}`
    : "No matches";
  els.catalogResultsList.innerHTML = results.length
    ? results
        .map((item) => catalogRenderResult(item, type, selectedId))
        .join("")
    : emptyState(config.empty);
  els.catalogDetailPanel.innerHTML = catalogRenderDetail(selected, type);
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
    els.inventoryUnitsInput.placeholder = String(consumableConversion.multiplier);
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
      ? `${gear.name} • Adds ${packageCount * unitsPerPackage} ${consumableConversion.unit} to Consumables`
      : `${gear.name} • Weight ${wt(gear.weight)} • Cost ${money(gear.costCents)} each`
    : "Choose gear from the catalog or type custom gear.";

  const ammo = chosen(GEAR_CATALOG, els.ammoGearSelect.value);
  els.ammoGearPreview.textContent = ammo
    ? `${ammo.name} • Weight ${wt(ammo.weight)} • Cost ${money(ammo.costCents)} each`
    : "Choose ammunition from the catalog or type custom ammo.";
  els.ammoCaliberSelect.innerHTML = caliberOptionsForAmmo(
    ammo,
    els.ammoCaliberSelect.value,
  );
  els.ammoCaliberSelect.disabled = !(
    ammo && AMMO_CALIBERS_BY_CATALOG_ID[ammo.id]
  );

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
    ? `${vehicle.name} • Cost ${money(vehicle.costCents)} each`
    : "Choose a vehicle from the catalog or type a custom vehicle.";
}

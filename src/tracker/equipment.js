/**
 * Equipment tab rendering for weapons, ammo, armor, and vehicles.
 *
 * This file owns tracker-facing equipment lists and add/remove controls after
 * records have already been normalized. Physical location and load rules are
 * delegated to inventory-model.js and encumbrance.js.
 */
function renderArmor() {
  els.armorLocationList.innerHTML = ARMOR_LOCATIONS.filter(
    (location) => location.id !== "shield",
  )
    .map((location) => {
      const equipped = character.armorInventory.filter(
        (armor) =>
          armor.equipped &&
          armor.itemLocation !== "dropped" &&
          armor.itemLocation !== "stored" &&
          armor.itemLocation !== "container" &&
          armor.count > 0 &&
          armor.location === location.id,
      );
      return `<div class="loc-card"><strong>${esc(location.label)} (${armorValue(location.id)})</strong><span>${equipped.map((armor) => `${esc(armor.name)} (+${armor.armor})`).join("<br>") || "—"}</span></div>`;
    })
    .join("");

  els.armorInventoryList.innerHTML = "";
  if (!character.armorInventory.length) {
    els.armorInventoryList.innerHTML = emptyState("No armor tracked yet.");
    return;
  }

  character.armorInventory.forEach((armor) => {
    const row = document.createElement("div");
    row.className = "row";
    const entry = {
      type: "armor",
      id: armor.id,
      label: armor.name,
      item: armor,
    };
    const equipAction = armor.equipped ? "Unequip" : "Equip";
    row.innerHTML = `<div><strong>${esc(armor.name)}</strong><span>+${armor.armor} • ${armorLabel(armor.location)} • ${esc(physicalItemLocationLabel(entry))} • Min Str ${esc(armor.minStr)} • Weight ${formatWeightPounds(physicalItemWeight(entry))} • Cost ${armor.costCents !== undefined ? money(armor.costCents) : "—"} each</span>${armor.note ? `<span>${esc(armor.note)}</span>` : ""}</div><div class="controls"><button class="armor-equip-toggle" type="button" aria-label="${esc(`${equipAction} ${armor.name}`)}">${equipAction}</button><button>&minus;</button><strong>${armor.count}</strong><button>+</button>${physicalMoveControl("armor", armor.id)}<button class="delete-small">×</button></div>`;
    const buttons = row.querySelectorAll("button");
    buttons[0].onclick = () => {
      armor.equipped = !armor.equipped;
      armor.itemLocation = armor.equipped ? "equipped" : "carried";
      render();
      save();
    };
    buttons[1].onclick = () => {
      armor.count = Math.max(0, armor.count - 1);
      if (!armor.count) armor.equipped = false;
      render();
      save();
    };
    buttons[2].onclick = () => {
      armor.count += 1;
      render();
      save();
    };
    buttons[3].onclick = () => {
      character.armorInventory = character.armorInventory.filter(
        (item) => item.id !== armor.id,
      );
      render();
      save();
    };
    bindPhysicalMoveControls(row);
    els.armorInventoryList.appendChild(row);
  });
}

function renderWeapons() {
  els.weaponList.innerHTML = "";
  if (!character.weapons.length) {
    els.weaponList.innerHTML = emptyState("No weapons tracked yet.");
    return;
  }

  character.weapons.forEach((weapon) => {
    const fragment = els.weaponTemplate.content.cloneNode(true);
    const query = (selector) => fragment.querySelector(selector);
    query(".weapon-name").textContent = weapon.name;
    const weaponEntry = {
      type: "weapon",
      id: weapon.id,
      label: weapon.name,
      item: weapon,
    };
    const requiredAmmo = requiredAmmoLabelForWeapon(
      weapon,
      catalogWeaponForRecord(weapon),
    );
    query(".weapon-details").textContent = [
      `Damage ${weapon.damage || "—"}`,
      `Range ${weapon.range || "—"}`,
      `AP ${weapon.ap ?? "—"}`,
      `ROF ${weapon.rof ?? "—"}`,
      requiredAmmo ? `Ammo ${requiredAmmo}` : "",
      physicalItemLocationLabel(weaponEntry),
      `Weight ${formatWeightPounds(physicalItemWeight(weaponEntry))}`,
      `Min Str ${weapon.minStr || "—"}`,
      `Cost ${weapon.costCents !== undefined ? money(weapon.costCents) : "—"}`,
    ]
      .filter(Boolean)
      .join(" • ");

    const fire = query(".fire-btn");
    const load = query(".load-btn");
    const reload = query(".reload-btn");
    const unload = query(".unload-btn");
    const remove = query(".remove-btn");
    const ammoPurchase = query(".weapon-ammo-purchase");
    remove.insertAdjacentHTML(
      "beforebegin",
      physicalMoveControl("weapon", weapon.id),
    );
    const strengthInfo = getWeaponStrengthUsageInfo(
      effectiveStrengthForScope(
        character,
        character.weaponStrength,
        "minimum-strength",
      ),
      weapon,
    );
    const warning = query(".weapon-warning");
    warning.textContent = strengthInfo.message;
    warning.classList.toggle("hidden", !strengthInfo.message);

    if (isTrackedWeapon(weapon)) {
      const reserve = character.ammo[weapon.ammoType];
      const reserveCount = reserve?.count || 0;
      const reserveEntry = reserve
        ? {
            type: "ammo",
            id: weapon.ammoType,
            label: reserve.label,
            item: reserve,
          }
        : null;
      query(".loaded").textContent =
        `Loaded ${weapon.shotsLoaded} / ${weapon.shotsMax}`;
      query(".weapon-notes").textContent =
        `${reserve?.label || "Ammo"} reserve: ${reserveCount}${reserveEntry ? ` • ${physicalItemLocationLabel(reserveEntry)}` : ""}.`;
      renderWeaponAmmoPurchase(ammoPurchase, weapon, reserve);
      fire.disabled = weapon.shotsLoaded <= 0;
      load.disabled =
        weapon.shotsLoaded >= weapon.shotsMax || reserveCount <= 0;
      reload.disabled = load.disabled;
      unload.disabled = weapon.shotsLoaded <= 0;
      fire.onclick = () => {
        weapon.shotsLoaded -= 1;
        render();
        save();
      };
      load.onclick = () => {
        if (!reserve) return;
        weapon.shotsLoaded += 1;
        reserve.count -= 1;
        render();
        save();
      };
      reload.onclick = () => {
        if (!reserve) return;
        const amount = Math.min(
          weapon.shotsMax - weapon.shotsLoaded,
          reserve.count,
        );
        weapon.shotsLoaded += amount;
        reserve.count -= amount;
        render();
        save();
      };
      unload.onclick = () => {
        if (!reserve) return;
        reserve.count += weapon.shotsLoaded;
        weapon.shotsLoaded = 0;
        render();
        save();
      };
    } else {
      query(".loaded").textContent = "No ammo";
      query(".weapon-notes").textContent =
        weapon.notes || "No ammunition tracking.";
      ammoPurchase.classList.add("hidden");
      ammoPurchase.innerHTML = "";
      [fire, load, reload, unload].forEach(
        (button) => (button.disabled = true),
      );
    }

    remove.onclick = () => {
      if (isTrackedWeapon(weapon) && weapon.shotsLoaded > 0) {
        ensureAmmoReserve(weapon.ammoType);
        character.ammo[weapon.ammoType].count += weapon.shotsLoaded;
      }
      character.weapons = character.weapons.filter(
        (item) => item.id !== weapon.id,
      );
      render();
      save();
    };
    bindPhysicalMoveControls(fragment);
    els.weaponList.appendChild(fragment);
  });
}

function weaponAmmoPurchaseInfo(weapon) {
  const key = exactAmmoTypeForWeapon(weapon);
  const catalogWeapon = catalogWeaponForRecord(weapon);
  const catalogItem = key ? catalogAmmoForKey(key, weapon) : null;
  if (!key || !catalogItem || !isAmmo(catalogItem)) return null;
  const keyed = String(key).match(/^(pistol|rifle)-(\d{2}(?:-\d{2})?)-ammo$/);
  const caliber = keyed?.[2]
    ? `.${keyed[2]}`
    : normalizeCaliber(weapon.caliber) || "";
  const unitCostCents = Math.max(0, Number(catalogItem.costCents) || 0);
  return {
    key,
    catalogItem,
    label:
      requiredAmmoLabelForWeapon(weapon, catalogWeapon) || catalogItem.name,
    caliber,
    kind: keyed?.[1] || AMMO_KIND_BY_CATALOG_ID[catalogItem.id],
    unitCostCents,
  };
}

function renderWeaponAmmoPurchase(container, weapon, reserve) {
  const info = weaponAmmoPurchaseInfo(weapon);
  if (!info) {
    container.classList.add("hidden");
    container.innerHTML = "";
    return;
  }

  const defaultQuantity = Math.max(1, Math.floor(Number(weapon.shotsMax) || 1));
  container.classList.remove("hidden");
  container.innerHTML = `<div class="weapon-ammo-purchase-row">
    <label>
      <span>Buy ${esc(info.label)}</span>
      <input class="weapon-ammo-buy-qty" type="number" min="1" step="1" value="${esc(defaultQuantity)}" aria-label="Ammo quantity for ${esc(weapon.name)}">
    </label>
    <button class="weapon-ammo-buy-btn" type="button">Buy Ammo</button>
    <small>${esc(money(info.unitCostCents))} each${reserve ? ` • ${reserve.count || 0} reserve` : ""}</small>
  </div>`;
  const input = container.querySelector(".weapon-ammo-buy-qty");
  const button = container.querySelector(".weapon-ammo-buy-btn");
  button.onclick = () => {
    addAmmoForWeapon(weapon.id, input.value);
  };
}

function addAmmoForWeapon(weaponId, rawQuantity = 1) {
  const weapon = character.weapons.find((entry) => entry.id === weaponId);
  if (!weapon) return;
  const info = weaponAmmoPurchaseInfo(weapon);
  if (!info) {
    appToast("No catalog ammunition is matched to that weapon.", "danger");
    return;
  }
  const quantity = Math.max(1, Math.floor(Number(rawQuantity) || 1));
  const totalCost = info.unitCostCents * quantity;
  if (totalCost > Math.max(0, Number(character.moneyCents) || 0)) {
    appToast(`Not enough money. Ammo costs ${money(totalCost)}.`, "danger");
    return;
  }

  const fallback = {
    label: info.label,
    count: 0,
    caliber: info.caliber || undefined,
    kind: info.kind,
    note: "Purchased ammunition.",
    weight: info.catalogItem.weight,
    costCents: info.catalogItem.costCents,
    itemLocation: "carried",
  };
  ensureAmmoReserve(info.key, fallback);
  const ammo = character.ammo[info.key];
  ammo.label = ammo.label || fallback.label;
  ammo.caliber = ammo.caliber || fallback.caliber;
  ammo.kind = ammo.kind || fallback.kind;
  ammo.weight = ammo.weight ?? fallback.weight;
  ammo.costCents = ammo.costCents ?? fallback.costCents;
  ammo.itemLocation = ammo.itemLocation || "carried";
  ammo.count = Math.max(0, Number(ammo.count) || 0) + quantity;
  character.moneyCents = Math.max(
    0,
    Math.round((Number(character.moneyCents) || 0) - totalCost),
  );
  render();
  save();
  appToast(`${quantity} ${info.label} purchased.`, "success");
}

function renderAmmo() {
  els.weaponAmmoTypeSelect.innerHTML = ammoOptions(
    els.weaponAmmoTypeSelect.value,
  );
}

async function removeAmmoCategory(key) {
  const ammo = character.ammo[key];
  if (!ammo) return;
  const linkedWeapons = character.weapons.filter(
    (weapon) => weapon.ammoType === key,
  );
  const linkedText = linkedWeapons.length
    ? `\n\nThis ammo is assigned to ${linkedWeapons.length} weapon(s): ${linkedWeapons
        .map((weapon) => weapon.name || "Unnamed weapon")
        .join(", ")}.\nRemoving it will clear ammo tracking for those weapons.`
    : "";
  if (
    !(await appConfirm(linkedText.trim(), {
      title: `Remove ammo category "${ammo.label || key}"?`,
      confirmText: "Remove Ammo",
      danger: true,
    }))
  )
    return;
  linkedWeapons.forEach((weapon) => {
    weapon.ammoType = null;
    weapon.shotsMax = null;
    weapon.shotsLoaded = null;
  });
  delete character.ammo[key];
  render();
  save();
}

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
    row.innerHTML = `<div><strong>${esc(armor.name)}</strong><span>+${armor.armor} • ${armorLabel(armor.location)} • ${esc(physicalItemLocationLabel(entry))} • Min Str ${esc(armor.minStr)} • Weight ${formatWeightPounds(physicalItemWeight(entry))} • Cost ${armor.costCents !== undefined ? money(armor.costCents) : "—"} each</span>${armor.note ? `<span>${esc(armor.note)}</span>` : ""}</div><div class="controls"><button>${armor.equipped ? "Equipped" : "Equip"}</button><button>&minus;</button><strong>${armor.count}</strong><button>+</button>${physicalMoveControl("armor", armor.id)}<button class="delete-small">×</button></div>`;
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
    query(".weapon-details").textContent =
      `Damage ${weapon.damage || "—"} • Range ${weapon.range || "—"} • AP ${weapon.ap ?? "—"} • ROF ${weapon.rof ?? "—"} • ${physicalItemLocationLabel(weaponEntry)} • Weight ${formatWeightPounds(physicalItemWeight(weaponEntry))} • Min Str ${weapon.minStr || "—"} • Cost ${weapon.costCents !== undefined ? money(weapon.costCents) : "—"}`;

    const fire = query(".fire-btn");
    const load = query(".load-btn");
    const reload = query(".reload-btn");
    const unload = query(".unload-btn");
    const remove = query(".remove-btn");
    remove.insertAdjacentHTML(
      "beforebegin",
      physicalMoveControl("weapon", weapon.id),
    );
    const strengthInfo = getWeaponStrengthUsageInfo(
      character.weaponStrength,
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

function renderAmmo() {
  els.ammoReserves.innerHTML = "";
  if (!Object.keys(character.ammo).length) {
    els.ammoReserves.innerHTML = emptyState("No ammo categories recorded.");
    els.weaponAmmoTypeSelect.innerHTML = ammoOptions(
      els.weaponAmmoTypeSelect.value,
    );
    return;
  }
  Object.entries(character.ammo).forEach(([key, ammo]) => {
    const row = document.createElement("div");
    row.className = "row";
    const entry = { type: "ammo", id: key, label: ammo.label, item: ammo };
    row.innerHTML = `<div><strong>${ammo.count}</strong><span>${esc(ammo.label)} • ${esc(physicalItemLocationLabel(entry))} • Weight ${formatWeightPounds(physicalItemWeight(entry))}</span></div><div class="controls"><button type="button">&minus;</button><button type="button">+</button>${physicalMoveControl("ammo", key)}<button class="delete-small" type="button" title="Remove ammo category">×</button></div>`;
    const buttons = row.querySelectorAll("button");
    buttons[0].onclick = () => {
      ammo.count = Math.max(0, ammo.count - 1);
      render();
      save();
    };
    buttons[1].onclick = () => {
      ammo.count += 1;
      render();
      save();
    };
    buttons[2].onclick = () => removeAmmoCategory(key);
    bindPhysicalMoveControls(row);
    els.ammoReserves.appendChild(row);
  });
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

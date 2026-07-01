const {
  test,
  expect,
  useAppTestHooks,
  enterTracker,
  reloadIntoTracker,
  openArcane,
} = require("./helpers");

useAppTestHooks();

async function seedMadScientistCharacter(page) {
  await enterTracker(page);
  await page.evaluate(() => {
    const config = ARCANE_BACKGROUNDS.madScientist;
    const catalogPower = findPowerCatalogEntryById("power-barrier");
    const baseCharacter = {
      arcaneBackground: makeArcaneBackgroundState(config),
    };
    const power = normalizePowerRecord(
      createKnownPowerFromCatalog(catalogPower, baseCharacter, {
        id: "mad-science-barrier-power",
        addedReason: "test-known-power",
      }),
      0,
      config.edgeName,
    );
    const edge = EDGE_CATALOG.find(
      (item) => item.id === "dl-edge-arcane-background-mad-scientist",
    );
    const characterData = normalize({
      source: "test",
      setupStatus: "complete",
      name: "Mad Science Device Tester",
      rank: "Novice",
      ancestry: "Human",
      archetype: "Inventor",
      attributes: {
        agility: "d6",
        smarts: "d8",
        spirit: "d6",
        strength: "d6",
        vigor: "d6",
      },
      skills: [
        { name: "Science", die: "d6", linkedAttribute: "smarts" },
        { name: "Weird Science", die: "d6", linkedAttribute: "smarts" },
      ],
      edges: [
        {
          ...edge,
          id: "mad-scientist-edge",
          catalogId: edge.id,
          source: "Test",
        },
      ],
      hindrances: [],
      powers: [power],
      resources: [
        {
          id: "power-points",
          name: "Power Points",
          current: 15,
          max: 15,
          source: "Mad Scientist test",
        },
      ],
      arcaneBackground: makeArcaneBackgroundState(config),
      advances: [],
    });
    const entry = addCharacterSlot(characterData, {
      source: "test",
      preferredId: "mad-science-device-test",
    });
    character = normalize(entry.character);
    characterSetupReviewOpen = false;
    characterDraftMode = false;
    render();
    renderDemoExperience();
  });
}

async function seedOrganizationCharacter(page) {
  await enterTracker(page);
  await page.evaluate(() => {
    const edgeIds = [
      "dl-edge-agent",
      "dl-edge-grade-2",
      "dl-edge-territorial-ranger",
      "dl-edge-lieutenant",
    ];
    const edges = edgeIds.map((id) => {
      const edge = EDGE_CATALOG.find((item) => item.id === id);
      return {
        ...edge,
        id: `${id}-test`,
        catalogId: edge.id,
        source: "Test",
      };
    });
    const characterData = normalize({
      source: "test",
      setupStatus: "complete",
      name: "Organization Bookkeeping Tester",
      rank: "Seasoned",
      ancestry: "Human",
      archetype: "Badge Carrier",
      attributes: {
        agility: "d6",
        smarts: "d8",
        spirit: "d6",
        strength: "d6",
        vigor: "d6",
      },
      skills: [],
      edges,
      hindrances: [],
      advances: [],
    });
    const entry = addCharacterSlot(characterData, {
      source: "test",
      preferredId: "organization-bookkeeping-test",
    });
    character = normalize(entry.character);
    characterSetupReviewOpen = false;
    characterDraftMode = false;
    render();
    renderDemoExperience();
  });
}

test("Mad Scientist devices track status notes and round-trip", async ({
  page,
}) => {
  await seedMadScientistCharacter(page);
  await openArcane(page);

  await expect(page.locator("#madScienceDevicesPanel")).toBeVisible();
  await page
    .locator("#madScienceDevicePowerSelect")
    .selectOption("mad-science-barrier-power");
  await page.locator("#addMadScienceDeviceBtn").click();

  const device = page.locator(".mad-science-device-card").filter({
    has: page.getByRole("heading", { name: "Barrier Device" }),
  });
  await expect(device).toContainText("Linked power: Barrier");
  await expect(device).toContainText("Critical Failure reminder");

  await device
    .locator("[data-mad-device-field='status']")
    .selectOption("damaged");
  await expect(device).toContainText("Damaged");
  await device
    .locator("[data-mad-device-field='fuelNotes']")
    .fill("Ghost rock core half full.");
  await device
    .locator("[data-mad-device-field='repairNotes']")
    .fill("Needs a Weird Science repair check after the scene.");

  await reloadIntoTracker(page);
  await openArcane(page);
  const reloadedDevice = page.locator(".mad-science-device-card").filter({
    has: page.getByRole("heading", { name: "Barrier Device" }),
  });
  await expect(reloadedDevice).toContainText("Damaged");
  await expect(
    reloadedDevice.locator("[data-mad-device-field='fuelNotes']"),
  ).toHaveValue("Ghost rock core half full.");
  await expect(
    reloadedDevice.locator("[data-mad-device-field='repairNotes']"),
  ).toHaveValue("Needs a Weird Science repair check after the scene.");

  const roundTrip = await page.evaluate(() => {
    const exported = serializeTrackerExport(character);
    importJsonText(JSON.stringify(exported));
    const deviceRecord = character.madScienceDevices[0];
    return {
      count: character.madScienceDevices.length,
      name: deviceRecord.name,
      status: deviceRecord.status,
      linkedPowerName: deviceRecord.linkedPowerName,
      fuelNotes: deviceRecord.fuelNotes,
      repairNotes: deviceRecord.repairNotes,
      malfunctionReminder: deviceRecord.malfunctionReminder,
    };
  });
  expect(roundTrip).toEqual({
    count: 1,
    name: "Barrier Device",
    status: "damaged",
    linkedPowerName: "Barrier",
    fuelNotes: "Ghost rock core half full.",
    repairNotes: "Needs a Weird Science repair check after the scene.",
    malfunctionReminder: true,
  });
});

test("Agent and Ranger organizations track favors and round-trip", async ({
  page,
}) => {
  await seedOrganizationCharacter(page);
  await page.getByRole("button", { name: "Character", exact: true }).click();

  await expect(page.locator("#organizationBookkeepingPanel")).toBeVisible();
  await page.getByRole("button", { name: "Add Agency" }).click();
  await page.getByRole("button", { name: "Add Territorial Rangers" }).click();

  const agency = page.locator(".organization-card").filter({
    has: page.getByRole("heading", { name: "Agency" }),
  });
  const rangers = page.locator(".organization-card").filter({
    has: page.getByRole("heading", { name: "Territorial Rangers" }),
  });
  await expect(agency).toContainText("Grade 2");
  await expect(agency).toContainText("Favors 3 / 3");
  await expect(rangers).toContainText("Lieutenant");
  await expect(rangers).toContainText("Favors 3 / 3");

  await agency.getByRole("button", { name: "Spend Favor" }).click();
  await expect(agency).toContainText("Favors 2 / 3");
  await expect(agency).toContainText("Spent favor");
  await agency
    .locator("[data-organization-field='grantedGearNotes']")
    .fill("Badge, papers, and mnemomizer issued.");
  await rangers
    .locator("[data-organization-field='payNotes']")
    .fill("Marshal confirms pay and favor refresh between jobs.");

  await reloadIntoTracker(page);
  await page.getByRole("button", { name: "Character", exact: true }).click();
  const reloadedAgency = page.locator(".organization-card").filter({
    has: page.getByRole("heading", { name: "Agency" }),
  });
  const reloadedRangers = page.locator(".organization-card").filter({
    has: page.getByRole("heading", { name: "Territorial Rangers" }),
  });
  await expect(reloadedAgency).toContainText("Favors 2 / 3");
  await expect(
    reloadedAgency.locator("[data-organization-field='grantedGearNotes']"),
  ).toHaveValue("Badge, papers, and mnemomizer issued.");
  await expect(
    reloadedRangers.locator("[data-organization-field='payNotes']"),
  ).toHaveValue("Marshal confirms pay and favor refresh between jobs.");

  const roundTrip = await page.evaluate(() => {
    const exported = serializeTrackerExport(character);
    importJsonText(JSON.stringify(exported));
    return character.organizations.map((record) => ({
      name: record.name,
      rankLabel: record.rankLabel,
      favorsCurrent: record.favorsCurrent,
      favorsMax: record.favorsMax,
      grantedGearNotes: record.grantedGearNotes,
      payNotes: record.payNotes,
      historyTypes: record.history.map((entry) => entry.type),
    }));
  });
  expect(roundTrip).toEqual([
    {
      name: "Agency",
      rankLabel: "Grade 2",
      favorsCurrent: 2,
      favorsMax: 3,
      grantedGearNotes: "Badge, papers, and mnemomizer issued.",
      payNotes: "Record pay, authority, and favor refresh notes here.",
      historyTypes: ["spend"],
    },
    {
      name: "Territorial Rangers",
      rankLabel: "Lieutenant",
      favorsCurrent: 3,
      favorsMax: 3,
      grantedGearNotes:
        "Record badge, organization gear, and Marshal-approved issue here.",
      payNotes: "Marshal confirms pay and favor refresh between jobs.",
      historyTypes: [],
    },
  ]);
});

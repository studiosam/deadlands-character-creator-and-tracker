"use strict";

const path = require("node:path");
const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");
const { version } = require("./package.json");

const outputDirectory =
  process.env.DEADLANDS_FORGE_OUT_DIR || `release-v${version}`;
const iconPath = path.join(
  __dirname,
  "electron",
  "build-resources",
  "deadlands-tracker.ico",
);
const loadingGifPath = path.join(
  __dirname,
  "electron",
  "build-resources",
  "studiosam-loading.gif",
);

module.exports = {
  outDir: outputDirectory,
  packagerConfig: {
    asar: true,
    executableName: "DeadlandsCharacterTracker",
    icon: iconPath,
    ignore: [
      /^\/(?:release|release-v[^/]+|dist|build)(?:\/|$)/,
      /^\/(?:\.git|\.github|\.vscode|test-results|playwright-report)(?:\/|$)/,
      /^\/(?:tests|scripts)(?:\/|$)/,
      /^\/assets\/studiosam\.(?:gif|png)$/,
      /^\/electron\/build-resources(?:\/|$)/,
      /^\/(?:\.gitignore|\.prettierignore|\.prettierrc|forge\.config\.cjs|playwright\.config\.cjs)$/,
    ],
    win32metadata: {
      CompanyName: "Studio Sam",
      FileDescription: "Deadlands Character Tracker",
      InternalName: "DeadlandsCharacterTracker",
      OriginalFilename: "DeadlandsCharacterTracker.exe",
      ProductName: "Deadlands Character Tracker",
    },
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "DeadlandsCharacterTracker",
        authors: "Studio Sam",
        description:
          "Unofficial local-first Deadlands/SWADE character creator and table tracker.",
        setupExe: `Deadlands-Character-Tracker-${version}-Setup.exe`,
        setupIcon: iconPath,
        loadingGif: loadingGifPath,
        noMsi: true,
      },
    },
  ],
  plugins: [
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

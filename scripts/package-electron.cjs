"use strict";

const { spawn, spawnSync } = require("node:child_process");
const {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
} = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const releaseDirectory = path.join(projectRoot, "release");
const temporaryOutput = mkdtempSync(
  path.join(os.tmpdir(), "deadlands-electron-"),
);
const forgeCli = require.resolve("@electron-forge/cli/dist/electron-forge.js");
const cleanupScript = path.join(
  projectRoot,
  "scripts",
  "cleanup-after-vscode.ps1",
);
const generatedResourcesDirectory = path.join(
  projectRoot,
  "electron",
  "build-resources",
);
const environment = {
  ...process.env,
  DEADLANDS_FORGE_OUT_DIR: temporaryOutput,
};
delete environment.ELECTRON_RUN_AS_NODE;

function scheduleLockedBuildCleanup() {
  const child = spawn(
    "powershell.exe",
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      cleanupScript,
      "-Watch",
      "-SkipEditorWait",
    ],
    {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    },
  );
  child.unref();
}

function removeDirectory(directory) {
  try {
    rmSync(directory, { recursive: true, force: true });
    return true;
  } catch (error) {
    console.warn(`Could not remove ${directory}: ${error.message}`);
    return false;
  }
}

const build = spawnSync(process.execPath, [forgeCli, "make", "--arch=x64"], {
  cwd: projectRoot,
  env: environment,
  stdio: "inherit",
});

if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status ?? 1);

const makerDirectory = path.join(
  temporaryOutput,
  "make",
  "squirrel.windows",
  "x64",
);
const artifactNames = readdirSync(makerDirectory).filter(
  (name) =>
    name.endsWith("-Setup.exe") ||
    name.endsWith(".nupkg") ||
    name === "RELEASES",
);

if (!artifactNames.some((name) => name.endsWith("-Setup.exe"))) {
  throw new Error(
    "Electron Forge completed without producing a Squirrel installer EXE.",
  );
}

mkdirSync(releaseDirectory, { recursive: true });
let releaseCleanupSucceeded = true;
for (const name of readdirSync(releaseDirectory)) {
  releaseCleanupSucceeded =
    removeDirectory(path.join(releaseDirectory, name)) &&
    releaseCleanupSucceeded;
}

if (!releaseCleanupSucceeded) {
  scheduleLockedBuildCleanup();
  throw new Error(
    "Old release files are locked. A background cleanup helper has been started.",
  );
}

for (const name of artifactNames) {
  copyFileSync(
    path.join(makerDirectory, name),
    path.join(releaseDirectory, name),
  );
  console.log(`Created release/${name}`);
}

const temporaryOutputRemoved = removeDirectory(temporaryOutput);
const generatedResourcesRemoved = removeDirectory(generatedResourcesDirectory);
if (!temporaryOutputRemoved || !generatedResourcesRemoved) {
  scheduleLockedBuildCleanup();
  console.warn(
    "A background cleanup helper will retry the locked generated build files.",
  );
}

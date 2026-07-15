const { spawnSync } = require("node:child_process");
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
const builderCli = require.resolve("electron-builder/out/cli/cli.js");
const environment = { ...process.env };
delete environment.ELECTRON_RUN_AS_NODE;

const build = spawnSync(
  process.execPath,
  [
    builderCli,
    "--win",
    "nsis",
    `--config.directories.output=${temporaryOutput}`,
  ],
  {
    cwd: projectRoot,
    env: environment,
    stdio: "inherit",
  },
);

if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status ?? 1);

mkdirSync(releaseDirectory, { recursive: true });
for (const name of readdirSync(releaseDirectory)) {
  if (
    name.endsWith("-Setup.exe") ||
    name.endsWith(".exe.blockmap") ||
    name === "latest.yml"
  ) {
    rmSync(path.join(releaseDirectory, name), { force: true });
  }
}

const artifactNames = readdirSync(temporaryOutput).filter(
  (name) =>
    name.endsWith("-Setup.exe") ||
    name.endsWith(".exe.blockmap") ||
    name === "latest.yml",
);

if (!artifactNames.some((name) => name.endsWith("-Setup.exe"))) {
  throw new Error(
    "Electron Builder completed without producing an installer EXE.",
  );
}

for (const name of artifactNames) {
  copyFileSync(
    path.join(temporaryOutput, name),
    path.join(releaseDirectory, name),
  );
  console.log(`Created release/${name}`);
}

try {
  rmSync(temporaryOutput, { recursive: true, force: true });
} catch (error) {
  console.warn(`Could not remove temporary build output: ${error.message}`);
}

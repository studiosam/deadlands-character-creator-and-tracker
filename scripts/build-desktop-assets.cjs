"use strict";

const { spawnSync } = require("node:child_process");
const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const projectRoot = path.resolve(__dirname, "..");
const sourcePath = path.join(projectRoot, "favicon", "apple-touch-icon.png");
const loadingGifPath = path.join(projectRoot, "assets", "studiosam.gif");
const outputDirectory = path.join(projectRoot, "electron", "build-resources");
const iconPath = path.join(outputDirectory, "deadlands-tracker.ico");
const squirrelLoadingGifPath = path.join(
  outputDirectory,
  "studiosam-loading.gif",
);
const iconSizes = [16, 24, 32, 48, 64, 128, 256];
const squirrelLoadingSize = 256;
const squirrelLoadingCornerRadius = 32;

function icoFromPngFrames(frames) {
  const headerSize = 6;
  const entrySize = 16;
  const directorySize = headerSize + frames.length * entrySize;
  const totalSize =
    directorySize + frames.reduce((sum, frame) => sum + frame.buffer.length, 0);
  const output = Buffer.alloc(totalSize);

  output.writeUInt16LE(0, 0);
  output.writeUInt16LE(1, 2);
  output.writeUInt16LE(frames.length, 4);

  let imageOffset = directorySize;
  frames.forEach((frame, index) => {
    const entryOffset = headerSize + index * entrySize;
    output.writeUInt8(frame.size === 256 ? 0 : frame.size, entryOffset);
    output.writeUInt8(frame.size === 256 ? 0 : frame.size, entryOffset + 1);
    output.writeUInt8(0, entryOffset + 2);
    output.writeUInt8(0, entryOffset + 3);
    output.writeUInt16LE(1, entryOffset + 4);
    output.writeUInt16LE(32, entryOffset + 6);
    output.writeUInt32LE(frame.buffer.length, entryOffset + 8);
    output.writeUInt32LE(imageOffset, entryOffset + 12);
    frame.buffer.copy(output, imageOffset);
    imageOffset += frame.buffer.length;
  });

  return output;
}

async function main() {
  await fs.mkdir(outputDirectory, { recursive: true });

  const frames = await Promise.all(
    iconSizes.map(async (size) => ({
      size,
      buffer: await sharp(sourcePath)
        .resize(size, size)
        .ensureAlpha()
        .png()
        .toBuffer(),
    })),
  );
  await fs.writeFile(iconPath, icoFromPngFrames(frames));

  const sourceLoadingGif = await sharp(loadingGifPath, {
    animated: true,
  }).metadata();
  if (sourceLoadingGif.format !== "gif" || (sourceLoadingGif.pages || 1) < 2) {
    throw new Error("assets/studiosam.gif must be an animated GIF.");
  }

  const roundedLoadingMask = Buffer.from(`
    <svg width="${squirrelLoadingSize}" height="${squirrelLoadingSize}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${squirrelLoadingSize}" height="${squirrelLoadingSize}" rx="${squirrelLoadingCornerRadius}" ry="${squirrelLoadingCornerRadius}" fill="#fff" />
    </svg>
  `);
  const squirrelLoadingFrames = [];
  for (let page = 0; page < sourceLoadingGif.pages; page += 1) {
    squirrelLoadingFrames.push(
      await sharp(loadingGifPath, { page, pages: 1 })
        .resize(squirrelLoadingSize, squirrelLoadingSize, { fit: "fill" })
        .ensureAlpha()
        .composite([{ input: roundedLoadingMask, blend: "dest-in" }])
        .png()
        .toBuffer(),
    );
  }

  await sharp(squirrelLoadingFrames, { join: { animated: true } })
    .gif({
      loop: 0,
      delay: sourceLoadingGif.delay?.[0] || 50,
      colours: 128,
      dither: 0.6,
      interFrameMaxError: 1,
      keepDuplicateFrames: true,
    })
    .toFile(squirrelLoadingGifPath);

  const squirrelLoadingGif = await sharp(squirrelLoadingGifPath, {
    animated: true,
  }).metadata();
  if (
    squirrelLoadingGif.format !== "gif" ||
    squirrelLoadingGif.width !== squirrelLoadingSize ||
    squirrelLoadingGif.pageHeight !== squirrelLoadingSize ||
    squirrelLoadingGif.pages !== sourceLoadingGif.pages
  ) {
    throw new Error(
      "Generated Squirrel loading GIF failed metadata validation.",
    );
  }

  const wpfValidation = spawnSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      [
        '$ErrorActionPreference = "Stop"',
        "Add-Type -AssemblyName PresentationCore",
        "$iconUri = [Uri]::new($env:DEADLANDS_SQUIRREL_ICON, [UriKind]::Relative)",
        "$iconFrame = [Windows.Media.Imaging.BitmapFrame]::Create($iconUri)",
        'if ($iconFrame.PixelWidth -lt 1) { throw "Setup icon could not be decoded." }',
        "$uri = [Uri]::new($env:DEADLANDS_SQUIRREL_GIF, [UriKind]::Absolute)",
        "$frame = [Windows.Media.Imaging.BitmapFrame]::Create($uri)",
        "$stream = [IO.File]::OpenRead($env:DEADLANDS_SQUIRREL_GIF)",
        "try {",
        "  $decoder = New-Object Windows.Media.Imaging.GifBitmapDecoder($stream, [Windows.Media.Imaging.BitmapCreateOptions]::PreservePixelFormat, [Windows.Media.Imaging.BitmapCacheOption]::OnLoad)",
        '  if ($decoder.Frames.Count -lt 2) { throw "Loading GIF is not animated." }',
        "} finally { $stream.Dispose() }",
      ].join("; "),
    ],
    {
      env: {
        ...process.env,
        DEADLANDS_SQUIRREL_ICON: iconPath,
        DEADLANDS_SQUIRREL_GIF: squirrelLoadingGifPath,
      },
      encoding: "utf8",
    },
  );
  if (wpfValidation.error) throw wpfValidation.error;
  if (wpfValidation.status !== 0) {
    throw new Error(
      `Generated desktop assets are not compatible with Squirrel's WPF decoder.\n${wpfValidation.stderr || wpfValidation.stdout}`,
    );
  }

  process.stdout.write(
    `Generated WPF-compatible ${path.relative(projectRoot, iconPath)} and ${path.relative(projectRoot, squirrelLoadingGifPath)}.\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});

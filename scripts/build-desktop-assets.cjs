"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const projectRoot = path.resolve(__dirname, "..");
const sourcePath = path.join(projectRoot, "assets", "studiosam.png");
const loadingGifPath = path.join(projectRoot, "assets", "studiosam.gif");
const outputDirectory = path.join(projectRoot, "electron", "build-resources");
const iconPath = path.join(outputDirectory, "studiosam.ico");
const iconSizes = [16, 24, 32, 48, 64, 128, 256];

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
      buffer: await sharp(sourcePath).resize(size, size).png().toBuffer(),
    })),
  );
  await fs.writeFile(iconPath, icoFromPngFrames(frames));

  const loadingGif = await sharp(loadingGifPath, { animated: true }).metadata();
  if (loadingGif.format !== "gif" || (loadingGif.pages || 1) < 2) {
    throw new Error("assets/studiosam.gif must be an animated GIF.");
  }

  process.stdout.write(
    `Generated ${path.relative(projectRoot, iconPath)} and validated assets/studiosam.gif.\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});

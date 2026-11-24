import { mkdirSync, writeFileSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "Dear judge, my agent spent forty minutes hunting a bug, then announced it found one — in the test it wrote to prove there was no bug.";

function validate(line) {
  if (typeof line !== "string" || line.length === 0) {
    throw new Error("line must not be empty");
  }
  if (line.length > 200) {
    throw new Error(`line too long: ${line.length} characters (max 200)`);
  }
  if (line.trim().length === 0) {
    throw new Error("line must not be only whitespace");
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("line must be a single line");
  }
  // Reject control characters (other than the trailing newline we add).
  for (const ch of line) {
    if (ch.charCodeAt(0) < 0x20 && ch !== "\t") {
      throw new Error("line must not contain control characters");
    }
  }
}

function main() {
  validate(LINE);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, LINE + "\n", "utf8");
  const back = readFileSync(outPath, "utf8");
  if (back !== LINE + "\n") {
    throw new Error("round-trip check failed: file does not match the line");
  }
  const size = statSync(outPath).size;
  const expected = Buffer.byteLength(LINE, "utf8") + 1;
  if (size !== expected) {
    throw new Error(`size check failed: ${size} bytes, expected ${expected}`);
  }
  console.log(`wrote ${LINE.length} characters (${size} bytes) to ${outPath}`);
  console.log(LINE);
}

main();

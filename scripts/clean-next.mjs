import { rmSync } from "node:fs";
import { join } from "node:path";

const targets = [".next", join("node_modules", ".cache")];

for (const target of targets) {
  rmSync(target, { recursive: true, force: true });
  console.log(`Removed ${target}`);
}

import { execSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const projectNeedle = projectRoot.toLowerCase();

const DEV_MARKERS = ["next dev", "start-server.js", "dev:clean", "next start"];

function listNodeProcesses() {
  if (process.platform === "win32") {
    try {
      const raw = execSync(
        "powershell -NoProfile -Command \"Get-CimInstance Win32_Process -Filter \\\"name='node.exe'\\\" | Select-Object ProcessId, CommandLine | ConvertTo-Json -Compress\"",
        {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"],
        }
      ).trim();

      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  }

  try {
    const raw = execSync("ps -ax -o pid=,command=", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });

    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/^(\d+)\s+(.*)$/);
        if (!match) return null;
        return { ProcessId: Number(match[1]), CommandLine: match[2] };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function isProjectDevProcess(commandLine = "") {
  const normalized = commandLine.toLowerCase();
  if (!normalized.includes(projectNeedle)) return false;
  return DEV_MARKERS.some((marker) => normalized.includes(marker));
}

function killProcess(pid) {
  if (process.platform === "win32") {
    execSync(`taskkill /PID ${pid} /F /T`, { stdio: "ignore" });
    return;
  }

  process.kill(pid, "SIGTERM");
}

const targets = listNodeProcesses().filter((processInfo) =>
  isProjectDevProcess(processInfo.CommandLine ?? "")
);

if (targets.length === 0) {
  console.log("No hay servidores dev de este proyecto en ejecución.");
  process.exit(0);
}

for (const { ProcessId } of targets) {
  try {
    killProcess(ProcessId);
    console.log(`Detenido proceso Node (PID ${ProcessId}).`);
  } catch {
    console.warn(`No se pudo detener PID ${ProcessId}.`);
  }
}

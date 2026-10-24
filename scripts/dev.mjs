import net from "node:net";
import { spawn } from "node:child_process";
let port = Number(process.env.PORT || 3000);
const available = (p) =>
  new Promise((resolve) => {
    const s = net.createServer();
    s.once("error", () => resolve(false));
    s.listen(p, "127.0.0.1", () => s.close(() => resolve(true)));
  });
while (!(await available(port))) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`, {
      signal: AbortSignal.timeout(2000),
    });
    const health = await response.json();
    if (health.app === "actionos-local") {
      console.log(
        `\nACTIONOS is already running. Open http://localhost:${port}/\n`,
      );
      process.exit(0);
    }
  } catch {
    /* Another local app may occupy this port. */
  }
  port++;
}
console.log(`\nACTIONOS is starting at http://localhost:${port}/\n`);
const child = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "dev",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(port),
  ],
  { stdio: "inherit" },
);
child.on("exit", (code) => process.exit(code ?? 0));

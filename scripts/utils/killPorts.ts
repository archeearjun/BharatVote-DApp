import { exec } from "child_process";

/**
 * Check if a port is currently in use
 */
export async function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const command = `powershell -Command "Test-NetConnection -ComputerName localhost -Port ${port} -WarningAction SilentlyContinue | Select-Object -ExpandProperty TcpTestSucceeded"`;
    exec(command, (error, stdout) => {
      if (error) {
        console.error(`Error checking port ${port}:`, error);
        return resolve(false);
      }
      resolve(stdout.trim() === "True");
    });
  });
}

/**
 * Kills Vite if it's running, verifies Hardhat node
 */
export async function setupPorts(): Promise<void> {
  await new Promise((r) => setTimeout(r, 1000));

  const isHardhatRunning = await isPortInUse(8545);
  if (!isHardhatRunning) {
    throw new Error("Hardhat node is not running. Please start it.");
  }

  const isViteRunning = await isPortInUse(5173);
  if (isViteRunning) {
    const cmd = `powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue).OwningProcess -Force -ErrorAction SilentlyContinue"`;
    await new Promise((resolve) => {
      exec(cmd, () => {
        console.log("✓ Vite process killed");
        resolve(null);
      });
    });
  }
}

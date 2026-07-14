import { execSync } from "child_process";

try {
  const port = process.env.PORT || 5000;
  console.log(`Checking for processes using port ${port}...`);
  
  let output;
  if (process.platform === "win32") {
    try {
      output = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" });
    } catch (e) {
      // findstr exits with code 1 if no matches are found, which is normal
      console.log(`Port ${port} is free.`);
      process.exit(0);
    }
    
    const lines = output.split("\n").map(line => line.trim()).filter(Boolean);
    const pids = new Set();
    
    for (const line of lines) {
      const parts = line.split(/\s+/);
      const lastPart = parts[parts.length - 1];
      const pid = parseInt(lastPart, 10);
      if (pid && pid !== process.pid) {
        pids.add(pid);
      }
    }
    
    for (const pid of pids) {
      try {
        console.log(`Killing process ${pid} using port ${port}...`);
        execSync(`taskkill /F /PID ${pid}`);
      } catch (err) {
        console.warn(`Failed to kill process ${pid}: ${err.message}`);
      }
    }
  } else {
    try {
      execSync(`npx kill-port ${port}`);
    } catch (e) {
      console.log(`Port ${port} is free.`);
    }
  }
} catch (error) {
  console.error("Error in kill-port script:", error.message);
}

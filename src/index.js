const http = require("http");
const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);

const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const app = require("./app");
const { connectDatabase } = require("./config/connectDatabase");
const { logError } = require("./utils/utils");
const seedDatabase = require("./scripts/seedDatabase");
const { connectSocket } = require("./config/connectSocket");

// =========== Server Setup ============
const BASE_PORT = process.env.PORT || 3535;
const RESTART_DELAY = 3000;
const MAX_RESTART_ATTEMPTS = 5;
const FORCE_PORT_KILL = true;

let serverRestartCount = 0;
let isShuttingDown = false;
let serverInstance = null;

// Function to kill process using a specific port
const killProcessOnPort = async (port) => {
  try {
    console.log(`Attempting to kill process on port ${port}...`);

    // For Windows
    if (process.platform === "win32") {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      const lines = stdout.trim().split("\n");

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== "0") {
          await execAsync(`taskkill /PID ${pid} /F`);
          console.log(`Killed process ${pid} on port ${port}`);
        }
      }
    } else {
      // For Linux/Mac
      const { stdout } = await execAsync(`lsof -ti:${port}`);
      const pids = stdout
        .trim()
        .split("\n")
        .filter((pid) => pid);

      for (const pid of pids) {
        await execAsync(`kill -9 ${pid}`);
        console.log(`Killed process ${pid} on port ${port}`);
      }
    }

    // Wait a moment for the port to be released
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return true;
  } catch (error) {
    console.log(
      `No process found on port ${port} or failed to kill:`,
      error.message
    );
    return false;
  }
};

// Main function to start the server
const startServer = async () => {
  try {
    const dbConnected = await connectDatabase();

    if (dbConnected) {
      try {
        await seedDatabase();
      } catch (error) {
        logError("Database seeding", error);
        console.log("Continuing without seeding...");
      }
    }

    await attemptToStartServer(BASE_PORT);
  } catch (error) {
    logError("Startup Error", error);
    retryStartup();
  }
};

// Attempts to start server on specific port, kills existing process if needed
const attemptToStartServer = async (port) => {
  return new Promise(async (resolve, reject) => {
    const server = http.createServer(app);

    connectSocket(server);

    serverInstance = server;

    server.listen(port);

    server.on("listening", () => {
      console.log(`Server running at http://localhost:${port}`);
      serverRestartCount = 0;
      setupGracefulShutdown(server);
      resolve(server);
    });

    server.on("error", async (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use.`);

        if (FORCE_PORT_KILL) {
          console.log("Attempting to kill existing process and retry...");
          const killed = await killProcessOnPort(port);

          if (killed) {
            // Try again after killing the process
            setTimeout(() => {
              attemptToStartServer(port).then(resolve).catch(reject);
            }, 2000);
          } else {
            reject(new Error(`Could not free port ${port}`));
          }
        } else {
          reject(
            new Error(`Port ${port} is in use and FORCE_PORT_KILL is disabled`)
          );
        }
      } else {
        logError("Server error", error);
        reject(error);
      }
    });
  });
};

// Retry with delay on startup failure
const retryStartup = () => {
  if (serverRestartCount >= MAX_RESTART_ATTEMPTS) {
    console.error("Too many restart attempts. Manual intervention required.");
    process.exit(1);
  }

  serverRestartCount++;
  console.log(
    `Retrying server startup in ${
      RESTART_DELAY / 1000
    }s... (Attempt ${serverRestartCount}/${MAX_RESTART_ATTEMPTS})`
  );

  setTimeout(() => {
    startServer();
  }, RESTART_DELAY);
};

// Graceful shutdown handler
const setupGracefulShutdown = (server) => {
  const shutdown = async (signal) => {
    if (isShuttingDown) {
      console.log("Shutdown already in progress...");
      return;
    }

    isShuttingDown = true;
    console.log(`Received ${signal}. Shutting down gracefully...`);

    const timeout = setTimeout(() => {
      console.error("Forcing shutdown after timeout");
      process.exit(1);
    }, 15000);

    server.close(async () => {
      console.log("HTTP server closed.");
      try {
        await sequelize.close();
        console.log("Database connection closed.");
      } catch (err) {
        logError("Database closure", err);
      }
      clearTimeout(timeout);
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  process.on("uncaughtException", (err) => {
    logError("Uncaught Exception", err);

    if (!isShuttingDown && serverRestartCount < MAX_RESTART_ATTEMPTS) {
      console.log("Attempting to restart server due to uncaught exception...");
      if (serverInstance) {
        serverInstance.close(() => {
          retryStartup();
        });
      } else {
        retryStartup();
      }
    } else {
      console.error("Cannot recover from uncaught exception. Exiting.");
      process.exit(1);
    }
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    logError("Unhandled Promise Rejection", reason);
  });
};

// Start the server
startServer().catch((error) => {
  console.error("Fatal error during startup:", error);
  process.exit(1);
});

module.exports = app;

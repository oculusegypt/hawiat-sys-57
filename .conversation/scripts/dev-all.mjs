import { spawn } from "node:child_process";

const processes = [
  {
    name: "api",
    command: "pnpm",
    args: ["--filter", "@workspace/api-server", "run", "start"],
    env: { PORT: "8080", NODE_ENV: "development" },
  },
  {
    name: "sabaik-almasa",
    command: "pnpm",
    args: ["--filter", "@workspace/cleanflow-services", "run", "dev"],
    env: { PORT: "19770", BASE_PATH: "/", NODE_ENV: "development" },
  },
  {
    name: "sabaik-platform",
    command: "pnpm",
    args: ["--filter", "@workspace/cleanflow-platform", "run", "dev"],
    env: {
      PORT: "19040",
      BASE_PATH: "/cleanflow-platform/",
      NODE_ENV: "development",
    },
  },
];

const children = processes.map(({ name, command, args, env }) => {
  const child = spawn(command, args, {
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const log = (stream, chunk) => {
    for (const line of chunk.toString().split(/\r?\n/)) {
      if (line) process.stdout.write(`[${name}] ${line}\n`);
    }
  };

  child.stdout.on("data", (chunk) => log("stdout", chunk));
  child.stderr.on("data", (chunk) => log("stderr", chunk));
  child.on("exit", (code, signal) => {
    if (code !== 0 && signal !== "SIGTERM") {
      console.error(`[${name}] exited with code ${code ?? "unknown"}${signal ? ` (${signal})` : ""}`);
    }
  });

  return child;
});

const shutdown = () => {
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("exit", shutdown);
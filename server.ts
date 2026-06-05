import { createServer } from "vite";

async function start() {
  const server = await createServer({
    server: { port: 3000, host: "0.0.0.0" },
    appType: "spa",
  });
  await server.listen();
  console.log(`Server running on http://localhost:${server.config.server.port}`);
}

start();

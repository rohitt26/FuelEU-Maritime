import "dotenv/config";
import { initDatabase } from "./db";
import { createApp } from "./app";

const app = createApp();

const PORT = process.env.PORT || 3000;

async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(error => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
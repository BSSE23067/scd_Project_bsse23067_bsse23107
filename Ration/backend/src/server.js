import { createApp } from "./app.js";

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    const app = await createApp();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();

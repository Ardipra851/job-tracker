import pool from "./applications/db";
import app from "./applications/app";
import logger from "./applications/logging";

app.listen(3000, () => {
  logger.info("Server started on port 3000");
});
logger.info(process.env.JWT_SECRET);
const startServer = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    logger.info("Database connection successful");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  }
};

startServer();

import { type SQLiteDatabase, openDatabaseSync } from "expo-sqlite";

const DATABASE_NAME = "hushchat.db";

export const db: SQLiteDatabase = openDatabaseSync(DATABASE_NAME);

export const initDatabase = async () => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS pending_messages (
        id TEXT PRIMARY KEY NOT NULL,
        conversation_id INTEGER NOT NULL,
        message_text TEXT NOT NULL,
        created_at TEXT NOT NULL,
        status TEXT NOT NULL,
        parent_message_id INTEGER
      );
    `);
    console.log("Database initialized");
  } catch (error) {
    console.error("Error initializing database", error);
  }
};

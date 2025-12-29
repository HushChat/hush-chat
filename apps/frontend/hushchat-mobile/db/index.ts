import { type SQLiteDatabase, openDatabaseAsync } from "expo-sqlite";

const DATABASE_NAME = "hushchat.db";

// Singleton instance variable
let dbInstance: SQLiteDatabase | null = null;

// Get the DB instance (opens it if not already open)
export const getDB = async (): Promise<SQLiteDatabase> => {
  if (dbInstance) {
    return dbInstance;
  }

  // Use Async here to prevent the "Sync operation timeout" on Web
  dbInstance = await openDatabaseAsync(DATABASE_NAME);
  return dbInstance;
};

export const initDatabase = async () => {
  try {
    // Await the DB connection
    const db = await getDB();

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

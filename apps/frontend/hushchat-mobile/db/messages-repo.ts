import { db } from "./index";

export interface PendingMessage {
  id: string;
  conversation_id: number;
  message_text: string;
  created_at: string;
  status: "pending" | "failed";
  parent_message_id?: number | null;
}

export const MessagesRepo = {
  savePendingMessage: async (message: PendingMessage) => {
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO pending_messages (id, conversation_id, message_text, created_at, status, parent_message_id) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          message.id,
          message.conversation_id,
          message.message_text,
          message.created_at,
          message.status,
          message.parent_message_id ?? null,
        ]
      );
    } catch (error) {
      console.error("Error saving pending message:", error);
      throw error;
    }
  },

  getPendingMessages: async (): Promise<PendingMessage[]> => {
    try {
      const result = await db.getAllAsync<PendingMessage>(
        `SELECT * FROM pending_messages ORDER BY created_at ASC`
      );
      return result;
    } catch (error) {
      console.error("Error getting pending messages:", error);
      return [];
    }
  },

  deletePendingMessage: async (id: string) => {
    try {
      await db.runAsync(`DELETE FROM pending_messages WHERE id = ?`, [id]);
    } catch (error) {
      console.error("Error deleting pending message:", error);
    }
  },
};

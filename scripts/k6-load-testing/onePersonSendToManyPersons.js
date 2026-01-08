import http from "k6/http";

const CONVERSATION_IDS = [754, 502];
const BASE_URL = "https://api.gethush.chat";
/*
 * within 2 minutes max duration, one person send 500 messages to each conversation id
 */
export const options = {
  scenarios: {
    rush_chat: {
      executor: "per-vu-iterations",
      vus: CONVERSATION_IDS.length,
      iterations: 500,
      maxDuration: "2m",
    },
  },
};

export default function () {
  const index = __VU - 1;

  if (index >= CONVERSATION_IDS.length) return;

  const conversationId = CONVERSATION_IDS[index];

  const messageNum = __ITER + 1;
  const messageText = `message ${messageNum} for ${conversationId}`;

  const url = `${BASE_URL}/conversations/${conversationId}/messages`;

  const payload = JSON.stringify({
    messageText: messageText,
  });

  const params = {
    headers: {
      "X-Tenant": "localhost",
      Authorization: "Bearer <token>",
      "Content-Type": "application/json",
    },
  };

  const response = http.post(url, payload, params);

  if (response.status !== 200 && response.status !== 201) {
    console.error(
      `${conversationId} [Msg ${messageNum}] FAILED: ${response.status} - ${response.body}`
    );
  } else {
    console.log(`${conversationId} [Msg ${messageNum}] OK`);
  }
}

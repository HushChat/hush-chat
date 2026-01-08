import http from "k6/http";

const BASE_URL = "https://api.gethush.chat";

// Each entry represents a unique person and the specific conversation ID they share with the target user
const SENDERS = [
  {
    note: "John", // sender name
    conversationId: 754, // sender-receiver conversation id
    token: "<accessToken>",
  },
  {
    note: "jane",
    conversationId: 202,
    token: "",
  },
  // add more as needed
];

/*
 * within 2 minutes max duration, each person send 500 messages to same person
 */
export const options = {
  scenarios: {
    many_persons_one_target: {
      executor: "per-vu-iterations",
      vus: SENDERS.length,
      iterations: 500,
      maxDuration: "2m",
    },
  },
};

export default function () {
  const index = __VU - 1;

  if (index >= SENDERS.length) return;

  const currentUser = SENDERS[index];

  const messageNum = __ITER + 1;

  const messageText = `Message ${messageNum} from ${currentUser.note}`;

  const url = `${BASE_URL}/conversations/${currentUser.conversationId}/messages`;

  const payload = JSON.stringify({
    messageText: messageText,
  });

  const params = {
    headers: {
      "x-tenant": "localhost",
      "Content-Type": "application/json",
      Authorization: `Bearer ${currentUser.token}`,
    },
  };

  const response = http.post(url, payload, params);

  if (response.status !== 200 && response.status !== 201) {
    console.error(
      `[${currentUser.note}] to Conv ${currentUser.conversationId} FAILED: ${response.status} - ${response.body}`
    );
  } else {
    console.log(`Sender ${currentUser.note} [Msg ${messageNum}] OK`);
  }
}

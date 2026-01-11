import http from "k6/http";

// NOTE - set BASE_URL and ACCESS_TOKEN

const TARGET_CONVERSATION_ID = 0;
const BASE_URL = "<baseURL>";

const SENDERS = [
  {
    note: "john",
    token: "<accessToken>",
  },
  {
    note: "jane",
    token: "",
  },
  // add more as needed
];

/*
 * within 4 minutes max duration, send each sender 1000 messages for given group conversation
 */
export const options = {
  scenarios: {
    many_to_one: {
      executor: "per-vu-iterations",
      vus: SENDERS.length,
      iterations: 1000,
      maxDuration: "4m",
    },
  },
};

export default function () {
  const index = __VU - 1;

  if (index >= SENDERS.length) return;

  const currentUser = SENDERS[index];

  const messageNum = __ITER + 1;

  const messageText = `Message ${messageNum} from ${currentUser.note}`;

  const url = `${BASE_URL}/conversations/${TARGET_CONVERSATION_ID}/messages`;

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
      `Sender ${currentUser.note} [Msg ${messageNum}] FAILED: ${response.status} - ${response.body}`
    );
  } else {
    console.log(`Sender ${currentUser.note} [Msg ${messageNum}] OK`);
  }
}

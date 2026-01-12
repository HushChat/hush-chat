import http from "k6/http";
import { SharedArray } from "k6/data";

// NOTE - set BASE_URL and ACCESS_TOKEN

const TARGET_CONVERSATION_ID = 0;
const BASE_URL = "<baseURL>";
const TENANT = "<tenant>";

const ALL_TOKENS = new SharedArray("tokens", function () {
  return JSON.parse(open("./tokens.json"));
});

/*
 * within 4 minutes max duration, send each sender 1000 messages for given group conversation
 */
export const options = {
  scenarios: {
    many_to_one: {
      executor: "per-vu-iterations",
      vus: ALL_TOKENS.length,
      iterations: 1000,
      maxDuration: "4m",
    },
  },
};

export default function () {
  const index = __VU - 1;
  const currentUser = ALL_TOKENS[index];

  if (!currentUser) return;

  const messageNum = __ITER + 1;
  const url = `${BASE_URL}/conversations/${TARGET_CONVERSATION_ID}/messages`;

  const payload = JSON.stringify({
    messageText: `Message ${messageNum} from ${currentUser.note}`,
  });

  const params = {
    headers: {
      "x-tenant": TENANT,
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

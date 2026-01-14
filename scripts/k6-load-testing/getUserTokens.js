require("dotenv").config();
const fs = require("fs");

const BASE_URL = process.env.BASE_URL;
const TENANT = process.env.TENANT;

const USERS = require("./users.json");

async function getTokens() {
  console.log(`Starting login for ${USERS.length} users...`);
  const validTokens = [];

  for (const user of USERS) {
    try {
      const response = await fetch(`${BASE_URL}/public/user/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant": TENANT,
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
        }),
      });

      if (!response.ok) {
        console.error(`Failed to login ${user.email}: ${response.status}`);
        continue;
      }

      const data = await response.json();

      if (data.idToken) {
        validTokens.push({
          note: user.note || user.email,
          token: data.idToken,
        });
        console.log(`Logged in: ${user.email}`);
      } else {
        console.error(`No token found for ${user.email}`);
      }
    } catch (error) {
      console.error(`Error logging in ${user.email}:`, error.message);
    }
  }

  fs.writeFileSync("tokens.json", JSON.stringify(validTokens, null, 2));
  console.log(`Saved ${validTokens.length} tokens to tokens.json`);
}

getTokens();

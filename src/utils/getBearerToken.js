require("dotenv").config();

const USERNAME = process.env.API_USERNAME; // V.Kamlomo
const PASSWORD = process.env.API_PASSWORD; // LCCuser2
const API_KEY = process.env.API_KEY; // your X-API-Key
const ORIGIN = "https://xcvsapp.web.app";

async function getBearerToken() {
  if (!USERNAME || !PASSWORD || !API_KEY) {
    throw new Error("Missing USERNAME, PASSWORD or API_KEY in .env");
  }

  // Basic Auth
  const basicAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString("base64");

  const response = await fetch(
    "https://dashboard.e-parking.africa/control/auth/login",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "X-API-Key": API_KEY,
        Origin: ORIGIN,
        Accept: "application/json",
        "Content-Length": "0",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.access_token) {
    throw new Error("No access_token returned from API");
  }

  console.log("New Bearer Token:", data.access_token);
  return data.access_token;
}

module.exports = { getBearerToken };

const { calculateOutstanding } = require("../utils/calculateOutstanding");
const { getBearerToken } = require("../utils/getBearerToken");
require("dotenv").config();

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY missing in .env");
  process.exit(1);
}

// Use in-memory token
let BEARER_TOKEN = process.env.BEARER_TOKEN || "";

async function checkPlateService(license) {
  const url = `https://dashboard.e-parking.africa/control/history?license=${license}`;

  // Inner function to fetch plate data with retry if token expired
  async function fetchPlate(token, retry = true) {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Api-Key": API_KEY,
        Accept: "application/json",
      },
    });

    // If token expired or invalid, refresh and retry once
    if (response.status === 401 && retry) {
      console.log("Bearer token expired, fetching new token...");
      const newToken = await getBearerToken();
      BEARER_TOKEN = newToken; // update in-memory
      return fetchPlate(newToken, false); // retry once
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const records = await response.json(); // already JSON
    return records;
  }

  const records = await fetchPlate(BEARER_TOKEN);

  const totals = calculateOutstanding(records);

  return {
    license,
    totals,
    records,
  };
}

module.exports = { checkPlateService };

const { calculateOutstanding } = require("../utils/calculateOutstanding");
const { config } = require("../config/api");

const API_KEY = process.env.API_KEY;
const BEARER_TOKEN = process.env.BEARER_TOKEN;

if (!API_KEY || !BEARER_TOKEN) {
  console.error("API_KEY or BEARER_TOKEN missing in .env");
  process.exit(1);
}

async function checkPlateService(license) {
  const url = `https://dashboard.e-parking.africa/control/history?license=${license}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${BEARER_TOKEN}`,
      "X-Api-Key": API_KEY,
      Accept: "application/json",
    },
  });

  // directly parse JSON
  const records = await response.json(); // this is already an array

  // calculate totals
  const totals = calculateOutstanding(records);

  return {
    license,
    totals,
    records,
  };
}

module.exports = { checkPlateService };

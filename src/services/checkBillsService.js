const { getBearerToken } = require("../utils/getBearerToken");
require("dotenv").config();

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY missing in .env");
  process.exit(1);
}

let BEARER_TOKEN = process.env.BEARER_TOKEN || "";

/**
 * Service to fetch and consolidate bill payments
 */
async function checkBillsService(options = {}) {
  const { page = 1, pageSize = 15 } = options;
  
  // Note: Using the report URL provided in your previous message
  const url = `https://eppg.ngazi.co.tz/lcc/v1.0/report/all?page=${page}&pageSize=${pageSize}&order=id,desc`;

  async function fetchBills(token, retry = true) {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Api-Key": API_KEY,
        Accept: "application/json",
      },
    });

    if (response.status === 401 && retry) {
      console.log("Bearer token expired, fetching new token...");
      const newToken = await getBearerToken();
      BEARER_TOKEN = newToken; 
      return fetchBills(newToken, false); 
    }

    if (!response.ok) {
      throw new Error(`Bills API request failed: ${response.status}`);
    }

    return await response.json();
  }

  const rawData = await fetchBills(BEARER_TOKEN);
  const transactions = rawData.transactions || [];

  // --- CONSOLIDATION LOGIC START ---
  const consolidated = transactions.reduce((acc, tx) => {
    if (tx.paymentStatus === "SUCCESS" && tx.paymentType === "BILL") {
      const dateKey = tx.createdAt.split('T')[0];
      const amount = parseInt(tx.amount, 10) || 0;

      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          grandTotal: 0,
          fullTotal: 0,
          recoveryTotal: 0,
          count: 0
        };
      }

      acc[dateKey].grandTotal += amount;
      acc[dateKey].count += 1;

      if (tx.billPaymentMode === "FULL") {
        acc[dateKey].fullTotal += amount;
      } else if (tx.billPaymentMode === "WITH_RECOVERY") {
        acc[dateKey].recoveryTotal += amount;
      }
    }
    return acc;
  }, {});
  // --- CONSOLIDATION LOGIC END ---

  return {
    timestamp: new Date().toISOString(),
    pagination: {
      page: rawData.page,
      totalPages: rawData.totalPages,
      totalItems: rawData.totalItems
    },
    dailyConsolidation: Object.values(consolidated), // Returns as an array for easier frontend mapping
    rawData: transactions // Keeping raw data if needed
  };
}

module.exports = { checkBillsService };

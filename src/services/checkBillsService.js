const { getBearerToken } = require("../utils/getBearerToken");
require("dotenv").config();

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY missing in .env");
  process.exit(1);
}

let BEARER_TOKEN = process.env.BEARER_TOKEN || "";

/**
 * Service to fetch and consolidate bill payments with Date Range Filtering
 */
async function checkBillsService() {
  // Default both dates to today if not provided
  const today = new Date().toISOString().split('T')[0];
  const { 
    page = 1, 
    pageSize = 15, 
    startDate = today,
    endDate = today 
  } = options;
  
  // URL updated with both startDate and endDate parameters
  const url = `https://eppg.ngazi.co.tz/lcc/v1.0/report/all?page=${page}&pageSize=${pageSize}&startDate=${startDate}&endDate=${endDate}&order=id,desc`;

  async function fetchBills(token, retry = true) {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Origin": "https://xcvsapp.web.app",
      },
    });

    if (response.status === 401 && retry) {
      console.log("Token expired. Refreshing...");
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

  // Logic to consolidate amounts
  const consolidated = transactions.reduce((acc, tx) => {
    // Only process Success Bill payments
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

      // Grouping by Mode
      if (tx.billPaymentMode === "FULL") {
        acc[dateKey].fullTotal += amount;
      } else if (tx.billPaymentMode === "WITH_RECOVERY") {
        acc[dateKey].recoveryTotal += amount;
      }
    }
    return acc;
  }, {});

  return {
    timestamp: new Date().toISOString(),
    filterUsed: { startDate, endDate, page, pageSize },
    pagination: {
      page: rawData.page,
      totalPages: rawData.totalPages,
      totalItems: rawData.totalItems
    },
    dailyConsolidation: Object.values(consolidated)
  };
}

module.exports = { checkBillsService };

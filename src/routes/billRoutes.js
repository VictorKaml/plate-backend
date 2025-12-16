const express = require("express");
const router = express.Router();
const { checkBillsService } = require("../services/billService");

/**
 * GET /api/bills/consolidated
 * Fetches and returns consolidated daily totals
 */
router.get("/check-bill", async (req, res) => {
  try {
    // Extract query parameters (e.g., ?page=1&pageSize=15)
    const options = {
      page: req.query.page || 1,
      pageSize: req.query.pageSize || 15
    };

    const result = await checkBillsService(options);

    res.status(200).json({
      success: true,
      message: "Daily consolidation retrieved successfully",
      ...result
    });
  } catch (error) {
    console.error("Route Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve consolidated bill data",
      error: error.message
    });
  }
});

module.exports = router;

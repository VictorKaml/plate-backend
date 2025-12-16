const express = require("express");
const router = express.Router();
const { checkBillsService } = require("../services/checkBillsService");

router.get("/check-bill", async (req, res) => {
  try {
    const { page, pageSize, startDate, endDate } = req.query;

    const result = await checkBillsService({
      page,
      pageSize,
      startDate,
      endDate
    });

    return res.json({
      success: true,
      dailyConsolidation: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;


const express = require("express");
const { checkOutstandingService } = require("../services/outstandingService");

const router = express.Router();

router.post("/check-outstanding", async (req, res) => {
  try {
    const result = await checkOutstandingService();

    return res.json({
      success: true,
      currentHistory: result
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

module.exports = router;

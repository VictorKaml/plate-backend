const express = require("express");
const { checkPlateService } = require("../services/plateService");

const router = express.Router();

router.post("/check-plate", async (req, res) => {
  try {
    const { license } = req.body;

    if (!license) {
      return res.status(400).json({
        success: false,
        error: "license is required"
      });
    }

    const result = await checkPlateService(license);

    return res.json({
      success: true,
      plateHistory: result
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

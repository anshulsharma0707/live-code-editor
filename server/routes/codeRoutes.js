const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/run", async (req, res) => {

  const { code, language } = req.body;

  try {

    const response = await axios.post(
      "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
      {
        source_code: code,
        language_id: language
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      error: "Code execution failed"
    });

  }

});

module.exports = router;
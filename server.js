const express = require("express");
const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Google Sheets Config
const sheetId = "1OZXopBefudwPE9pgzMnwbx4RogGbr4gTQ6uPQAtBiBo";

// Function to authenticate with Google Sheets API
async function getSheetsClient() {
  const auth = new GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

// Routes
app.get("/", (req, res) => {
  res.send('Server is working');
});

app.post("/add-data", async (req, res) => {
  try {
    const sheets = await getSheetsClient();
    const { values } = req.body;

    if (!values || !Array.isArray(values)) {
      return res.status(400).json({ 
        error: "Invalid request body. Expected an array of values." 
      });
    }

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Sheet2",
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });

    res.json({ 
      success: true, 
      message: "Data added successfully", 
      data: response.data 
    });
  } catch (error) {
    console.error("Error adding data:", error);
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

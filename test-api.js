import axios from "axios";
import https from "https";
import fs from "fs";

const agent = new https.Agent({
  rejectUnauthorized: false,
});

const logFile = "api-debug.log";

function log(message) {
  console.log(message);
  fs.appendFileSync(logFile, message + "\n");
}

// Clear log file
fs.writeFileSync(logFile, "");

async function testEndpoints() {
  log("--- STARTING API PROBE ---");

  // 1. Test Public Translators
  try {
    log("Testing GET /api/public/translators...");
    const res = await axios.get(
      "https://localhost:7207/api/public/translators",
      { httpsAgent: agent },
    );
    log(`[SUCCESS] translators -> ${res.status}`);
    log("Data: " + JSON.stringify(res.data, null, 2));
  } catch (err) {
    log(
      `[FAILED] translators -> ${err.response ? err.response.status : err.message}`,
    );
    if (err.response) {
      log("Error Data: " + JSON.stringify(err.response.data, null, 2));
    }
  }

  // 2. Test Product
  try {
    log("Testing GET /api/Product...");
    const res = await axios.get("https://localhost:7207/api/Product", {
      httpsAgent: agent,
    });
    log(`[SUCCESS] Product -> ${res.status}`);
  } catch (err) {
    log(
      `[FAILED] Product -> ${err.response ? err.response.status : err.message}`,
    );
    if (err.response) {
      log("Error Data: " + JSON.stringify(err.response.data, null, 2));
    }
  }

  log("--- END API PROBE ---");
}

testEndpoints();

import axios from "axios";
import https from "https";

const agent = new https.Agent({ rejectUnauthorized: false });

(async () => {
  try {
    const res = await axios.get(
      "https://localhost:7207/api/public/translators",
      { httpsAgent: agent },
    );
    console.log(`STATUS: ${res.status}`);
    console.log(`DATA LENGTH: ${res.data?.items?.length}`);
  } catch (err) {
    console.log(`ERROR: ${err.response ? err.response.status : err.message}`);
  }
})();

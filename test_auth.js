import axios from "axios";
import fs from "fs";

async function run() {
  const output = {};
  try {
    const loginRes = await axios.post("http://localhost:5216/api/auth/login", {
      email: "test@test.com",
      password: "password123",
    });
    output.login = "Success";
  } catch (e) {
    output.login = e.response ? e.response.data : e.message;
  }

  try {
    const regRes = await axios.post("http://localhost:5216/api/auth/register", {
      fullName: "Test User",
      email: "test@test.com",
      password: "password123",
      gender: "Erkek", // Or 1 if enum? Let's check the error
    });
    output.register = "Success";
  } catch (e) {
    output.register = e.response ? e.response.data : e.message;
  }

  fs.writeFileSync("test-out.json", JSON.stringify(output, null, 2));
}
run();

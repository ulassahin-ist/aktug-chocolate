import { sendAuthCode } from "./utils/email.js";

async function run() {
  try {
    await sendAuthCode("ulas.sahin.ist@gmail.com", "999999");
    console.log("Email sent!");
  } catch (err) {
    console.error("Email failed:", err);
  }
}

run();

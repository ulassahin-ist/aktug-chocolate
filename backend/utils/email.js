import nodemailer from "nodemailer";
import "dotenv/config";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

export async function sendAuthCode(to, code) {
  return await transporter.sendMail({
    from: "no-reply@aktugchocolate.com",
    to,
    subject: "Your Authentication Code",
    text: `Your code is: ${code}`,
  });
}

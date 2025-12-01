// utils/emailService.js
const nodemailer = require("nodemailer");
require("dotenv").config();
console.log("BREVO_SMTP_USER:", process.env.BREVO_SMTP_USER);
console.log(
  "BREVO_SMTP_PASS length:",
  process.env.BREVO_SMTP_PASS ? process.env.BREVO_SMTP_PASS.length : "MISSING"
);
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

/**
 * Send verification email to pending user
 * @param {string} to - Email address
 * @param {string} name - User's name
 * @param {string} verificationUrl - Full verification URL
 */
async function sendVerificationEmail(to, name, verificationUrl) {
  const textContent = `
  Merhaba ${name || "Değerli Müşterimiz"},

  Aktug Chocolatier hesabınızı doğrulamak için bu linke tıklayın:
  ${verificationUrl}

  Bu bağlantı 24 saat geçerlidir.

  Sevgiler,
  Aktug Chocolatier
  `;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #f9f7f4 0%, #f7d5a3 100%);
      padding: 40px 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(62, 44, 39, 0.15);
    }
    .header {
      background: linear-gradient(135deg, #3e2c27 0%, #5a4038 100%);
      padding: 40px 30px;
      text-align: center;
    }
    a,button{
      color: #ffffff!important;
      text-decoration: none;}
    .logo {
      width: 80px;
      height: 80px;
      background: #c9a227;
      border-radius: 50%;
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: bold;
      color: #3e2c27;
      box-shadow: 0 4px 12px rgba(201, 162, 39, 0.4);
    }
    .header h1 {
      color: #f9f7f4;
      font-size: 28px;
      margin: 0;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 40px 30px;
      color: #3e2c27;
      line-height: 1.8;
    }
    .greeting {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #3e2c27;
    }
    .message {
      font-size: 16px;
      color: #5a4038;
      margin-bottom: 30px;
    }
    .button-container {
      text-align: center;
      margin: 40px 0;
    }
    .verify-button {
      display: inline-block;
      padding: 18px 50px;
      background: linear-gradient(135deg, #c9a227 0%, #a47e3b 100%);
      color: #ffffff;
      text-decoration: none;
      border-radius: 50px;
      font-size: 18px;
      font-weight: 600;
      box-shadow: 0 6px 20px rgba(201, 162, 39, 0.4);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .verify-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(201, 162, 39, 0.5);
    }
    .alternative {
      margin-top: 30px;
      padding: 20px;
      background: #f7d5a3;
      border-radius: 12px;
      border-left: 4px solid #c9a227;
    }
    .alternative p {
      font-size: 14px;
      color: #3e2c27;
      margin-bottom: 10px;
    }
    .alternative a {
      color: #5a4038;
      word-break: break-all;
      text-decoration: none;
      font-weight: 500;
    }
    .footer {
      background: #f9f7f4;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e0d5c7;
    }
    .footer p {
      font-size: 14px;
      color: #8a7a6f;
      margin: 5px 0;
    }
    .footer .brand {
      color: #c9a227;
      font-weight: 600;
      font-size: 16px;
    }
    .divider {
      height: 2px;
      background: linear-gradient(90deg, transparent, #c9a227, transparent);
      margin: 30px 0;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .greeting {
        font-size: 20px;
      }
      .verify-button {
        padding: 15px 40px;
        font-size: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">AC</div>
      <h1>Aktug Chocolatier</h1>
    </div>
    
    <div class="content">
      <div class="greeting">Merhaba ${name || "Değerli Müşterimiz"}! 👋</div>
      
      <div class="message">
        <p>Aktug Chocolatier ailesine hoş geldiniz! Hesabınızı oluşturduğunuz için teşekkür ederiz.</p>
        <br>
        <p>Siparişlerinize başlamak için lütfen e-posta adresinizi doğrulayın. Aşağıdaki butona tıklayarak hesabınızı aktifleştirebilirsiniz:</p>
      </div>

      <div class="button-container">
        <a href="${verificationUrl}" class="verify-button">
          Hesabımı Doğrula
        </a>
      </div>

      <div class="divider"></div>

      <div class="alternative">
        <p><strong>Buton çalışmıyor mu?</strong></p>
        <p>Aşağıdaki linki tarayıcınıza kopyalayıp yapıştırabilirsiniz:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
      </div>

      <div style="margin-top: 30px; padding: 15px; background: #fff3e0; border-radius: 8px; font-size: 14px; color: #5a4038;">
        <strong>⏰ Önemli:</strong> Bu doğrulama linki 72 saat geçerlidir. Süre dolmadan önce lütfen hesabınızı aktifleştirin.
      </div>
    </div>

    <div class="footer">
      <p class="brand">Aktug Chocolatier</p>
      <p>L'amour dans chaque bouchée...</p>
      <p style="margin-top: 15px;">Bu e-postayı siz talep etmediyseniz herhangi bir işlem yapmanıza gerek yoktur.</p>
      <p style="font-size: 12px; color: #a8998e; margin-top: 10px;">
        © 2025 Aktug Chocolatier. Tüm hakları saklıdır.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  await transporter.sendMail({
    from: '"Aktug Chocolatier" <no-reply@aktugchocolate.com>',
    to,
    subject: "✨ Hesabınızı Doğrulayın - Aktug Chocolatier",
    text: textContent,
    html: htmlContent,
  });
}

module.exports = { sendVerificationEmail };

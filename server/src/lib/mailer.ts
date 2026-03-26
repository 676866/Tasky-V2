import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
});

const from = process.env.SMTP_FROM || "Tasky <noreply@tasky.io>";

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  await transporter.sendMail({
    from,
    to,
    subject: "Your Tasky verification code",
    text: `Your verification code is: ${otp}\n\nIt expires in 10 minutes.`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tasky Verification Code</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border-top: 4px solid #007bff; /* Tasky brand color */
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #007bff;
            font-size: 28px;
            margin: 0;
        }
        .content {
            text-align: center;
            padding: 20px 0;
        }
        .content p {
            font-size: 16px;
            margin-bottom: 25px;
        }
        .otp-code {
            display: inline-block;
            background-color: #e9ecef;
            color: #333333;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 4px;
            padding: 15px 30px;
            border-radius: 6px;
            margin-bottom: 30px;
        }
        .footer {
            text-align: center;
            font-size: 13px;
            color: #888888;
            margin-top: 30px;
            border-top: 1px solid #eeeeee;
            padding-top: 20px;
        }
        .footer p {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Tasky</h1>
        </div>
        <div class="content">
            <p>Hi there,</p>
            <p>Your one-time verification code for Tasky is:</p>
            <div class="otp-code">${otp}</div>
            <p>This code is valid for the next <strong>10 minutes</strong>. Please do not share this code with anyone.</p>
        </div>
        <div class="footer">
            <p>If you didn\'t request this code, please ignore this email.</p>
            <p>&copy; 2026 Tasky. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
  });
}

import path from "path";

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import ejs from "ejs";

import { config } from "../../../lib/config";

const ses = new SESClient({
  region: config.aws_region,
  credentials: {
    accessKeyId: config.aws_ses_access_key,
    secretAccessKey: config.aws_ses_secret_access_key,
  },
});

export const sendOtpEmail = async (toEmail: string, otp: string) => {
  const templatePath = path.join(__dirname, "./otpEmail.ejs");
  const htmlBody = await ejs.renderFile(templatePath, { otp });

  const params = {
    Source: config.sorce_email,
    Destination: {
      ToAddresses: [toEmail],
    },
    Message: {
      Subject: {
        Data: "Your OTP Code",
      },
      Body: {
        Html: {
          Data: htmlBody,
        },
        Text: {
          Data: `Your OTP is: ${otp}`,
        },
      },
    },
  };

  const command = new SendEmailCommand(params);

  try {
    const response = await ses.send(command);
    console.log("✅ Email sent! Message ID:", response.MessageId);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    throw error;
  }
};

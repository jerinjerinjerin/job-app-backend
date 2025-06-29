import path from "path";

import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import ejs from "ejs";

import { config } from "../../lib/config";

const sns = new SNSClient({
  region: config.aws_region,
  credentials: {
    accessKeyId: config.aws_access_key,
    secretAccessKey: config.aws_secret_access_key,
  },
});

/**
 * Sends an OTP via SMS using AWS SNS and EJS template
 * @param phone Phone number in E.164 format (e.g. +14155550123)
 * @param otp The OTP code to send
 */
export async function sendOtpToPhone(
  phone: string,
  otp: string,
): Promise<boolean> {
  const templatePath = path.join(__dirname, "./otpTemplate.ejs");

  const message = await ejs.renderFile(templatePath, {
    otp,
    validityMinutes: 5,
  });

  try {
    await sns.send(
      new PublishCommand({
        Message: message,
        PhoneNumber: phone,
        MessageAttributes: {
          "AWS.SNS.SMS.SMSType": {
            DataType: "String",
            StringValue: "Transactional",
          },
        },
      }),
    );

    console.log(`✅ OTP sent to ${phone}`);

    return true;
  } catch (error) {
    console.error("❌ Error sending OTP:", error);

    return false;
  }
}

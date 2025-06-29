import { redis } from "../index"; // adjust path if needed

export const companyOtpService = {
  async createCompany(
    phone: string,
    otp: string,
    inputData: Record<string, any>,
  ) {
    const otpKey = `otp:${phone}`;
    const attemptsKey = `otp_attempts:${phone}`;
    const dataKey = `company_draft:${phone}`;

    await redis.del(otpKey);
    await redis.del(attemptsKey);
    await redis.del(dataKey);

    await redis.set(otpKey, otp, { ex: 300 });
    console.log("OTP set in Redis:", otp);
    await redis.set(attemptsKey, "0", { ex: 300 });
    await redis.set(dataKey, JSON.stringify(inputData), { ex: 300 });
  },

  async otpVerify(phone: string, otp: string) {
    const otpKey = `otp:${phone}`;
    const attemptsKey = `otp_attempts:${phone}`;

    const [storedOtpRaw, attemptStr] = await Promise.all([
      redis.get(otpKey),
      redis.get(attemptsKey),
    ]);

    const storedOtp = storedOtpRaw?.toString().trim();
    const attempts = parseInt(attemptStr?.toString() || "0");

    if (!storedOtp) {
      throw new Error("OTP not found or expired");
    }

    if (attempts >= 3) {
      throw new Error("Too many incorrect attempts. OTP locked.");
    }

    if (otp.trim() !== storedOtp) {
      await redis.incr(attemptsKey);
      await redis.expire(attemptsKey, 300);
      throw new Error(`Incorrect OTP. Attempt ${attempts + 1} of 3`);
    }

    // OTP is correct
    await redis.del(otpKey);
    await redis.del(attemptsKey);

    return true;
  },
};

import { redis } from "../index"; // adjust path if needed

export const identityOtpService = {
  async signUp(email: string, otp: string, userData: Record<string, any>) {
    const otpKey = `otp:${email}`;
    const attemptsKey = `otp_attempts:${email}`;
    const userDraftKey = `user_draft:${email}`;

    await redis.del(otpKey, attemptsKey, userDraftKey);

    await redis.set(otpKey, otp, { ex: 300 });
    await redis.set(attemptsKey, "0", { ex: 300 });
    await redis.set(userDraftKey, JSON.stringify(userData), { ex: 300 });
  },

  async otpVerify(email: string, otp: string) {
    const otpKey = `otp:${email}`;
    const attemptsKey = `otp_attempts:${email}`;

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

    await redis.del(otpKey);
    await redis.del(attemptsKey);

    return true;
  },
};

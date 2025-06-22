import crypto from "crypto";

export const generateOtp = () => (crypto.randomInt(1000, 10000)).toString();

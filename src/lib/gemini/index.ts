import { GoogleGenerativeAI } from "@google/generative-ai";

import { config } from "../config";

const genAI = new GoogleGenerativeAI(config.gemini_api_key);

export const generateResumeFromGemini = async (
  prompt: string,
): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(prompt);
  const response = await result.response;

  return response.text();
};

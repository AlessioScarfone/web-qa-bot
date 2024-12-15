import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import * as dotenv from 'dotenv'

dotenv.config()

export const googleModel = new ChatGoogleGenerativeAI({
    modelName: "gemini-2.0-flash-exp",
    maxOutputTokens: 2048,
});
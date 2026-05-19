
import OpenAI from "openai";
import { NextResponse } from "next/server";
console.log(process.env.OPENROUTER_API_KEY);
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const extractedText = body.text;

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",

      messages: [
        {
          role: "system",
          content:
`
You are an expert AI legal assistant for Indian citizens.

Analyze the uploaded legal document carefully.

Write a DETAILED and EASY-TO-UNDERSTAND explanation.

The summary should:
- clearly explain what the document means
- explain important clauses
- mention obligations, payments, deadlines, or penalties if present
- explain possible concerns
- be at least 5-8 lines long
- use simple language for normal people

Then provide a risk level and suggested action.

Respond ONLY in this format:

SUMMARY:
(detailed explanation)

RISK:
(Low / Medium / High)

ACTION:
(clear action for the user)
`,

        },
        {
          role: "user",
          content: extractedText,
        },
      ],
    });

    return NextResponse.json({
      result: completion.choices[0].message.content,
    });

  } catch (error: any) {

    console.error("API ERROR:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const text = body.text;

    const completion = await openai.chat.completions.create({

      model: "openai/gpt-3.5-turbo",

      messages: [

        {
          role: "system",

          content: `
You are a friendly Tamil assistant.

Convert the given English legal explanation into VERY NATURAL and EASY Tamil.

Rules:
- Use conversational Tamil
- Make it sound human
- Avoid literal translation
- Avoid difficult legal words
- Explain clearly for common people
          `,
        },

        {
          role: "user",
          content: text,
        },
      ],
    });

    return NextResponse.json({
      result: completion.choices[0].message.content,
    });

  } catch (error: any) {

    console.error("TRANSLATE API ERROR:", error);

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
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Lấy API Key từ biến môi trường (.env)
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY chưa được cấu hình trong biến môi trường (.env)" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp 'prompt' trong body yêu cầu." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    // Gọi API chính thức từ Google
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reply = response.text();

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Đã xảy ra lỗi hệ thống khi gọi API Gemini.";
    console.error("Lỗi khi gọi API Gemini:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

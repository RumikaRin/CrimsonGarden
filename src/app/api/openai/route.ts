import { NextResponse } from "next/server";
import { OpenAI } from "openai";

// Lấy API Key OpenAI từ biến môi trường (.env)
const apiKey = process.env.OPENAI_API_KEY || "";

const client = new OpenAI({
  apiKey: apiKey,
  baseURL: "http://localhost:8787/v1", // Định tuyến qua Headroom Proxy
});

export async function POST(request: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY chưa được cấu hình trong biến môi trường (.env)" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { prompt, messages } = body;

    let formattedMessages = [];
    if (messages && Array.isArray(messages)) {
      formattedMessages = messages;
    } else if (prompt) {
      formattedMessages = [{ role: "user", content: prompt }];
    } else {
      return NextResponse.json(
        { error: "Vui lòng cung cấp 'messages' hoặc 'prompt' trong body yêu cầu." },
        { status: 400 }
      );
    }

    // Gọi API OpenAI qua Headroom Proxy nén token
    const response = await client.chat.completions.create({
      model: "gpt-5.5", // Điền giống trong ảnh theo yêu cầu của bạn
      messages: formattedMessages,
      temperature: body.temperature ?? 0.7,
    });

    const reply = response.choices[0]?.message?.content || "";

    return NextResponse.json({ reply, raw: response });
  } catch (error: any) {
    console.error("Lỗi khi gọi API OpenAI qua Headroom:", error);
    return NextResponse.json(
      { error: error.message || "Đã xảy ra lỗi hệ thống khi gọi API OpenAI." },
      { status: 500 }
    );
  }
}

// Script test API Next.js qua Headroom Proxy
// Để chạy: Mở một terminal mới và gõ: node test_api.js

async function testGeminiAPI() {
  const PORT = 3000; // Thay đổi cổng nếu Next.js chạy ở cổng khác (ví dụ: 3001, 3002)
  const url = `http://localhost:${PORT}/api/gemini`;

  console.log(`Đang gửi yêu cầu test đến: ${url}`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: "Hãy viết 1 câu khẩu hiệu ngắn gọn cho Crimson Garden.",
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("\n✅ Kết quả phản hồi từ Gemini Pro (qua Headroom):");
      console.log(data.reply);
    } else {
      console.error("\n❌ Lỗi phản hồi API:", data.error || data);
    }
  } catch (error) {
    console.error("\n❌ Lỗi kết nối đến server Next.js:", error.message);
    console.log("Đảm bảo rằng bạn đã chạy 'npm run dev' và server Next.js đang hoạt động.");
  }
}

testGeminiAPI();

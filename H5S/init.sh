#!/bin/bash
# H5S Harness Bootstrap Script
# Dùng để cấu hình ban đầu và xác minh môi trường chạy cho Agent.

echo "============================================="
echo "   H5S Repository Harness Initializing...    "
echo "============================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/scripts/h5s_guard.py" ]; then
    H5S_GUARD="$SCRIPT_DIR/scripts/h5s_guard.py"
elif [ -f "H5S/scripts/h5s_guard.py" ]; then
    H5S_GUARD="H5S/scripts/h5s_guard.py"
else
    H5S_GUARD=""
fi

# 1. Kiểm tra tính toàn vẹn H5S nếu có Python
if [ -n "$H5S_GUARD" ] && command -v python &> /dev/null; then
    python "$H5S_GUARD" bootstrap
elif [ -n "$H5S_GUARD" ] && command -v python3 &> /dev/null; then
    python3 "$H5S_GUARD" bootstrap
else
    echo "⚠️ Cảnh báo: Chưa tìm thấy Python hoặc h5s_guard.py, bỏ qua H5S guard bootstrap."
fi

# 2. Kiểm tra môi trường Node.js & npm
if ! command -v node &> /dev/null; then
    echo "❌ Lỗi: Node.js chưa được cài đặt trên hệ thống."
    exit 1
fi
echo "✓ Node.js version: $(node -v)"

# 3. Cài đặt các thư viện cần thiết nếu có package.json
if [ -f "package.json" ]; then
    echo "📦 Đang cài đặt thư viện phụ thuộc (npm install)..."
    npm install
else
    echo "⚠️ Cảnh báo: Chưa tìm thấy tệp tin package.json ở thư mục gốc."
fi

# 4. Kiểm tra môi trường chạy database (Prisma)
if [ -f "prisma/schema.prisma" ]; then
    echo "🗄️ Phát hiện cấu hình Prisma DB. Đang tạo client và đồng bộ..."
    npx prisma generate
    npx prisma migrate status
else
    echo "ℹ️ Chưa có cấu hình Prisma DB."
fi

# 5. Xác minh chất lượng ban đầu
echo "🧪 Chạy thử nghiệm ban đầu..."
if [ -f "package.json" ]; then
    npm run check
    if [ $? -eq 0 ]; then
        echo "✅ Khởi động Harness thành công! Dự án sạch và sẵn sàng để phát triển."
    else
        echo "❌ Cảnh báo: Có lỗi xảy ra trong pipeline kiểm tra (npm run check)."
    fi
else
    echo "✅ Khởi động Harness thành công (Chế độ thiết lập tài liệu)."
fi

echo "============================================="

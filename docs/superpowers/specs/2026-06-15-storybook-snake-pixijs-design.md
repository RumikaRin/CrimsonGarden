# Illustrated Storybook Vocabulary Snake Design

## Mục tiêu

Nâng cấp game Rắn Săn Từ Vựng thành trải nghiệm 2D chất lượng cao theo phong cách sách minh họa, sử dụng PixiJS 8 và WebGL. Gameplay học từ vựng, dữ liệu Zustand, import chủ đề, điểm số và leaderboard hiện tại phải tiếp tục hoạt động.

Mục tiêu ưu tiên là đồ họa tối đa trên thiết bị mạnh, đồng thời tự giảm chất lượng khi FPS thấp kéo dài.

## Quyết định kỹ thuật

### Renderer

- Dùng PixiJS 8 với WebGL renderer production.
- Không dùng Phaser vì game không cần scene manager, physics engine và hệ thống game đầy đủ của Phaser.
- Không tiếp tục mở rộng renderer Canvas 2D hiện tại vì các hiệu ứng ánh sáng, texture, particle và nhiều lớp nền sẽ tạo tải CPU lớn.
- Không dùng WebGPU làm mặc định vì mức hỗ trợ và hành vi trình duyệt chưa ổn định bằng WebGL.

### Phân tách trách nhiệm

- `VocabularySnake.tsx`: giao diện React bên ngoài sân chơi, chọn chủ đề, tốc độ, điểm số, hướng dẫn, import và kết quả.
- `SnakeGameEngine`: logic TypeScript thuần cho lưới, hướng di chuyển, hàng đợi input, va chạm, sinh táo, điểm và trạng thái thắng/thua.
- `StorybookSnakeRenderer`: quản lý PixiJS application, scene graph, texture, animation, camera, particle và hiệu ứng.
- `SnakeInputController`: hợp nhất bàn phím, nút điều khiển mobile và thao tác vuốt.
- Zustand tiếp tục quản lý gói từ vựng, âm thanh, điểm số và leaderboard.

Game engine không được phụ thuộc React hoặc PixiJS để có thể kiểm thử độc lập.

## Vòng lặp game

- Logic game chạy theo fixed timestep dựa trên độ khó để bảo đảm va chạm theo ô chính xác.
- PixiJS ticker chạy theo `requestAnimationFrame` và nội suy vị trí giữa hai bước logic.
- Đổi hướng vẫn bị chặn quay ngược 180 độ và dùng hàng đợi input giới hạn.
- Khi tab bị ẩn hoặc cửa sổ mất focus, game tự chuyển sang trạng thái tạm dừng.
- Khi component unmount, renderer, ticker, listener, texture tạm và audio phải được giải phóng.

## Ngôn ngữ hình ảnh

### Illustrated Storybook

- Nền giấy kem ấm, có grain nhẹ và nét mực vẽ tay.
- Sân chơi giống một trang sách minh họa sống động.
- Nền nhiều lớp parallax gồm cỏ, lá, hoa và chi tiết trang sách.
- Viền, bóng và texture mang cảm giác minh họa thủ công, không dùng giao diện neon hoặc hiệu ứng kỹ thuật giả lập.

### Rắn

- Đầu rắn hoạt hình biểu cảm, mắt nhìn theo hướng di chuyển.
- Thân rắn nối mềm và thu nhỏ dần về phía đuôi.
- Logic vẫn di chuyển theo ô nhưng hình ảnh lướt mềm giữa các ô.
- Đầu rắn hơi nảy khi đổi hướng; thân và đuôi kéo theo tự nhiên.
- Có animation ngắn khi ăn táo, va chạm, thắng và thua.

### Táo và từ vựng

- Mọi đáp án trên sân chơi tiếp tục dùng hình quả táo.
- Từ tiếng Anh nằm trên nhãn giấy nhỏ cạnh quả táo.
- Không hiển thị trực tiếp đáp án đúng.
- Táo đúng có tín hiệu thị giác rất nhẹ, không đủ để người chơi đoán chắc.
- Nhãn tự điều chỉnh vị trí để không bị cắt khỏi sân chơi và hạn chế đè lên vật thể khác.

### Chướng ngại vật

- Dùng đá, gốc cây và chồng sách minh họa.
- Các biến thể có cùng hitbox theo ô để không ảnh hưởng gameplay.
- Asset được chọn ngẫu nhiên nhưng phải giữ độ tương phản đủ để nhận biết.

## Hiệu ứng phản hồi

### Ăn đúng

- Táo co nhẹ rồi vỡ thành lá, sao giấy và particle.
- Hiển thị `+20` gần vị trí táo.
- Có hiệu ứng squash-and-stretch ngắn trên đầu rắn.
- Phát âm thanh xác nhận tích cực.

### Ăn sai

- Hiệu ứng mực crimson loang nhanh tại vị trí táo.
- Camera rung nhẹ, thời lượng ngắn.
- Hiển thị `-10` và phát âm thanh cảnh báo.
- Không dùng rung mạnh hoặc flash toàn màn hình gây khó chịu.

### Va chạm, thắng và thua

- Va chạm tạo bụi giấy và animation dừng mềm.
- Thắng tạo mưa lá và sao giấy.
- Màn kết quả dùng cùng phong cách sách minh họa, hiển thị điểm, thời gian, số từ đã thu thập và nút chơi lại.

## Asset Pipeline

- Dùng texture atlas cho rắn, táo, chướng ngại vật và particle.
- Asset raster xuất ở độ phân giải đủ cho màn hình mật độ cao.
- Các lớp nền lớn được tối ưu kích thước và tái sử dụng.
- Asset phải có fallback rõ ràng khi tải lỗi.
- Màn chơi chỉ bắt đầu sau khi asset bắt buộc đã tải xong.
- Khi tải lỗi, hiển thị thông báo và nút thử lại; không vào game với asset thiếu.

## Hiệu năng và chất lượng

### Chế độ chất lượng

- Mặc định `Ultra`: đầy đủ parallax, shadow, particle và hiệu ứng.
- Đo FPS sau 5 giây khởi động; tự giảm xuống `High` nếu trung bình dưới 50 FPS liên tục trong 3 giây.
- `High` giảm particle, lớp parallax và cường độ hiệu ứng nhưng không thay đổi gameplay.
- Sau khi tự giảm, giữ `High` đến hết lượt chơi để tránh chất lượng thay đổi qua lại.

### Tối ưu bắt buộc

- Giới hạn resolution theo `devicePixelRatio` để tránh render vượt mức cần thiết.
- Dùng texture atlas và batching để giảm draw calls.
- Dùng object pooling cho particle và hiệu ứng ngắn.
- Không tạo texture, gradient hoặc object lớn mới trong mỗi frame.
- React state chỉ cập nhật cho HUD và sự kiện quan trọng; không cập nhật theo từng frame.
- Renderer phải resize đúng khi thay đổi kích thước viewport và xoay màn hình.

## Điều khiển

- Desktop: phím mũi tên, WASD và Space/Escape để pause/resume.
- Mobile: nút điều hướng và vuốt trực tiếp trên sân chơi.
- Swipe cần ngưỡng tối thiểu để tránh đổi hướng do chạm nhầm.
- Input được hợp nhất qua một controller trước khi gửi vào engine.
- Không cho đổi hướng ngược trực tiếp.

## Âm thanh

- Tái sử dụng một `AudioContext` thay vì tạo mới cho mỗi hiệu ứng.
- Có âm thanh bắt đầu, ăn đúng, ăn sai, đổi hướng, va chạm, thắng và thua.
- Ambience nhẹ là tùy chọn và phải tôn trọng thiết lập âm thanh hiện tại.
- Âm thanh không được chặn luồng render hoặc tạo độ trễ input.

## Dữ liệu và tương thích

- Giữ nguyên cấu trúc gói từ vựng và quy trình import CSV/TXT.
- Giữ nguyên cách lưu game score và leaderboard.
- Giữ nguyên ba mức tốc độ hiện tại trong phiên bản đầu tiên.
- Không thay đổi quy tắc điểm: đúng `+20`, sai `-10`.
- Không thêm power-up, boss, nhiều màn hoặc multiplayer trong phạm vi này.

## Xử lý lỗi

- Nếu WebGL không khởi tạo được, hiển thị thông báo thiết bị không hỗ trợ và cho phép thử lại.
- Nếu asset lỗi, giữ người chơi ở màn loading có nút thử lại.
- Nếu audio không khả dụng, game vẫn chơi bình thường ở chế độ im lặng.
- Lỗi lưu điểm không được làm gián đoạn hoặc đóng màn kết quả.

## Kiểm thử

### Unit test cho engine

- Di chuyển theo fixed timestep.
- Hàng đợi input và chặn quay ngược.
- Va chạm tường, thân rắn và chướng ngại vật.
- Ăn táo đúng, táo sai và cập nhật điểm.
- Sinh táo không trùng rắn, chướng ngại vật hoặc táo khác.
- Điều kiện thắng và trạng thái kết thúc.

### Integration test

- React HUD nhận đúng sự kiện từ engine.
- Pause/resume khi tab ẩn hoặc mất focus.
- Điều khiển bàn phím, nút mobile và swipe.
- Đổi chủ đề, tốc độ và âm thanh trước khi chơi.
- Lưu điểm và leaderboard sau thắng/thua.
- Renderer được giải phóng khi rời trang.

### Visual và hiệu năng

- Kiểm tra desktop 1440px và mobile 375px.
- Kiểm tra dark, cozy và garden theme.
- Đo FPS ở `Ultra` và xác nhận tự giảm xuống `High`.
- Kiểm tra resize, xoay màn hình và thiết bị mật độ điểm ảnh cao.
- Kiểm tra nhãn từ vựng dài không bị cắt hoặc che vật thể quan trọng.

## Tiêu chí hoàn thành

- Gameplay hiện tại hoạt động đầy đủ với renderer PixiJS.
- Chuyển động rắn mượt, logic va chạm vẫn chính xác theo ô.
- Phong cách Illustrated Storybook nhất quán trên sân chơi, HUD và màn kết quả.
- Táo vẫn là vật phẩm đại diện cho mọi đáp án.
- Không có cập nhật React theo frame.
- Không rò rỉ ticker, listener, WebGL context hoặc audio khi rời trang.
- Production build và toàn bộ kiểm thử liên quan vượt qua.

## Tài liệu tham khảo

- PixiJS Render Loop: https://pixijs.com/8.x/guides/concepts/render-loop
- PixiJS Renderers: https://pixijs.com/8.x/guides/components/renderers
- Phaser Overview: https://docs.phaser.io/phaser/getting-started/what-is-phaser
- MDN OffscreenCanvas: https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas
- MDN requestAnimationFrame: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame

# 🎤 Remix Karaoke Video Maker - Studio 60 FPS & 3D Visualizer

> **Trình tạo video karaoke remix, sóng nhạc visualizer 3D và hiệu ứng động 60 FPS chuyên nghiệp trực tiếp trên nền tảng Web.**

[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![WebCodecs](https://img.shields.io/badge/Render-WebCodecs_60FPS-orange?logo=googlechrome&logoColor=white)](https://w3c.github.io/webcodecs/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 Giới thiệu

**Remix Karaoke Video Maker** là một bộ công cụ sản xuất video âm nhạc và karaoke bán tự động mạnh mẽ chạy hoàn toàn trên trình duyệt. Ứng dụng kết hợp sức mạnh xử lý đồ họa **HTML5 Canvas 2D/3D**, phân tích tần số âm thanh thời gian thực (**Web Audio API FFT**), công nghệ mã hóa video phần cứng (**WebCodecs & MP4/WebM Muxer**) cùng trí tuệ nhân tạo **Gemini AI** để giúp các nhà sáng tạo nội dung nhanh chóng tạo ra các video âm nhạc chất lượng cao chuẩn định dạng **TikTok (9:16), YouTube (16:9), Instagram (1:1)**.

---
<img width="1287" height="2048" alt="image" src="https://github.com/user-attachments/assets/ef35bb85-1f10-4468-afb6-858b84b63e47" />
<img width="1295" height="3120" alt="image" src="https://github.com/user-attachments/assets/ddd97276-7308-4db5-9975-03c5d41de5b0" />

## ✨ Tính năng nổi bật

### 1. 🎬 Công cụ Kết xuất & Xuất Video (Hardware Accelerated Export)
* **WebCodecs 60 FPS**: Xuất video siêu tốc với tần số quét 60 khung hình/giây mượt mà, hỗ trợ tăng tốc phần cứng GPU.
* **Định dạng MP4 & WebM**: Xuất video MP4 (H.264/AAC) tương thích tốt trên mọi thiết bị và nền tảng mạng xã hội.
* **Đa tỉ lệ khung hình**:
  * `9:16` Dọc (TikTok, Shorts, Reels)
  * `16:9` Ngang (YouTube, Facebook Video)
  * `1:1` Vuông (Instagram, Square Feeds)
* **Độ phân giải linh hoạt**: 720p, 1080p Full HD hoặc tùy chỉnh bitrate lên đến 12–16 Mbps.

### 2. 🎵 Đồng bộ Lời bài hát & Âm thanh
* **Hỗ trợ định dạng LRC & SRT**: Tự động phân tích cú pháp thời gian chính xác tới từng milli-giây.
* **Timeline Editor trực quan**:
  * Kéo thả và tinh chỉnh thời gian xuất hiện của từng câu hát.
  * Thêm/xóa dòng, chèn tiền tố / hậu tố hàng loạt.
  * Tự động lọc bỏ nhãn thừa (*Verse, Chorus, Intro...*).
* **Audio Timeline Trimmer**: Cắt chọn đoạn nhạc điệp khúc (Hook/Chorus) nhanh chóng mà không cần phần mềm bên thứ ba.
* **16+ Hiệu ứng hoạt họa chữ (Lyric Animations)**:
  * `Elastic Pop`: Nẩy 3D phong cách TikTok viral.
  * `Kinetic Bounce`: Nhún nhảy theo nhịp điệu beat.
  * `Karaoke Word Sweep`: Quét mượt từng chữ theo thời gian thực.
  * `Cinema Shimmer`, `RGB Pulse`, `Flip 3D`, `Wave Float`, `Typewriter`, `Glitch`, `Slide`, `Blur`...

### 3. 🌊 Động cơ Sóng nhạc (Audio Visualizer Engine)
* **15+ Mẫu sóng nhạc tích hợp sẵn**:
  * *Bars*, *Reflected Bars*, *Liquid Gold*, *Stardust Orbit*, *Neon Perspective*, *Audio Ring*, *Cosmic Mandala*, *Aurora*, *Cyber Matrix*, *DNA Helix*, *Neon Lines*...
* **Custom Visualizer Studio**: Cho phép tự viết mã JavaScript Canvas API tương tác trực tiếp với dữ liệu tần số âm thanh `freqData` và `timeData`.
* **Trợ lý AI tạo Visualizer**: Tích hợp Gemini AI & OpenRouter hỗ trợ viết mã Visualizer tự động qua câu lệnh ngôn ngữ tự nhiên.
* **Thư viện Cộng đồng (Community Gallery)**: Khám phá, chia sẻ và áp dụng các mẫu visualizer độc đáo từ cộng đồng.

### 4. 🎆 Hiệu ứng Hạt (Particles) & Hậu kỳ VFX Điện ảnh
* **15+ Hiệu ứng hạt tương tác**: Tuyết rơi, mưa rơi, sao đêm, bụi sáng (ambient dust), tia lửa (sparks), kim tuyến (glitter), cánh hoa rơi, mã ma trận (digital matrix), bong bóng, pha lê prism, tia sét arc...
* **VFX Post-Processing chuyên nghiệp**:
  * `Chromatic Aberration`: Quang sai tách kênh RGB giật theo tiếng Bass.
  * `VHS Retro 90s`: Hiệu ứng băng từ, scanlines và nhiễu sóng cổ điển.
  * `Film Grain 35mm`: Màng phim điện ảnh Kodak chất lượng cao.
  * `Anamorphic Lens Flare`: Vệt tia sáng ống kính chuẩn Hollywood.
  * `Neon Glow Bloom`: Khuếch tán phát quang đa tầng Cyberpunk.
  * `Vignette Focus`: Bo góc tối tập trung điểm nhìn vào ca sĩ và lời bài hát.
  * `Vintage Light Leak`: Vệt sáng hoàng hôn ấm áp lãng mạn.

### 5. 🔤 Kiểu chữ & Tùy biến Đồ họa
* **Bộ font chữ tiếng Việt chọn lọc**: Tích hợp sẵn hàng chục font chữ nghệ thuật, serif, sans-serif và viết tay đẹp mắt.
* **Hỗ trợ Google Font tùy chỉnh**: Dễ dàng dán link Google Font để nạp trực tiếp vào dự án.
* **Logo & Watermark**: Chèn logo thương hiệu, đĩa nhạc quay (Vinyl Spin), thanh phát nhạc mini và văn bản tùy biến.
* **Tạo ảnh nền AI**: Sinh ảnh nền chất lượng cao tương ứng với giai điệu và tâm trạng bài hát bằng Google Gemini AI Imagen.

### 6. 📱 Progressive Web App (PWA)
* Cài đặt như một ứng dụng độc lập trên Windows, macOS, Android và iOS.
* Giao diện Dark Studio hiện đại, tối ưu không gian làm việc.

---

## 🛠️ Công nghệ sử dụng

| Lớp kiến trúc | Công nghệ |
| :--- | :--- |
| **Frontend Core** | React 19, TypeScript, Vite |
| **Giao diện & Styling** | Tailwind CSS, FontAwesome Icons |
| **Đồ họa & Âm thanh** | HTML5 Canvas API, Web Audio API (AnalyserNode FFT) |
| **Mã hóa & Xuất Video** | WebCodecs API, `mp4-muxer`, `webm-muxer` |
| **Backend Service** | Express 5, Node.js (`tsx` runtime) |
| **Trí tuệ nhân tạo (AI)** | `@google/genai` (Google Gemini 2.5/3.x SDK) |
| **Lưu trữ & Cộng đồng** | Firebase Firestore (tùy chọn) |

---

## 🚀 Hướng dẫn cài đặt & Chạy cục bộ (Local Development)

### 1. Yêu cầu hệ thống
* **Node.js**: Phiên bản `18.x` hoặc `20.x` trở lên
* **Trình duyệt**: Google Chrome, Microsoft Edge hoặc các trình duyệt nhân Chromium hỗ trợ WebCodecs API (để xuất video tốt nhất).

### 2. Clone mã nguồn
```bash
git clone https://github.com/your-username/remix-karaoke-video-maker.git
cd remix-karaoke-video-maker
```

### 3. Cài đặt thư viện (Dependencies)
Sử dụng `npm`:
```bash
npm install
```
Hoặc sử dụng `bun`:
```bash
bun install
```

### 4. Cấu hình Biến môi trường (.env)
Sao chép file cấu hình mẫu `.env.example` thành `.env`:
```bash
cp .env.example .env
```
Điền các API key của bạn vào file `.env`:
```env
# Gemini API Key (Dùng cho tính năng tạo ảnh nền & prompt AI phía server)
GEMINI_API_KEY=your_gemini_api_key_here

# OpenRouter API Key (Tùy chọn cho tính năng sinh code visualizer qua OpenRouter)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Cấu hình Firebase (Tùy chọn - chỉ cần khi muốn kích hoạt tính năng Gallery cộng đồng)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_FIRESTORE_DATABASE_ID=
```

> **Lưu ý**: Bạn có thể lấy Gemini API Key miễn phí tại [Google AI Studio](https://aistudio.google.com/). Ứng dụng vẫn hoạt động bình thường với đầy đủ tính năng tạo video ngay cả khi không cấu hình Firebase.

### 5. Chạy môi trường phát triển (Development Mode)
```bash
npm run dev
```
Mở trình duyệt và truy cập: **`http://localhost:3000`**

### 6. Đóng gói triển khai (Build for Production)
```bash
npm run build
npm start
```

---

## 📂 Cấu trúc thư mục dự án

```text
├── components/                       # Các React components giao diện
│   ├── AudioTimelineTrimmer.tsx      # Bộ công cụ cắt ghép âm thanh
│   ├── CommunityVisualizerGalleryModal.tsx # Modal thư viện sóng nhạc cộng đồng
│   ├── FontSelector.tsx              # Bộ chọn và xem trước font chữ
│   ├── PWAInstallButton.tsx          # Nút cài đặt ứng dụng PWA
│   ├── TimelineEditor.tsx            # Trình chỉnh sửa lời bài hát trực quan
│   └── VideoPreview.tsx              # Khung canvas preview và render thời gian thực
├── services/                         # Tầng dịch vụ và tích hợp ngoài
│   ├── communityVisualizerService.ts # Xử lý dữ liệu Firebase Firestore
│   ├── firebase.ts                   # Khởi tạo và kết nối Firebase an toàn
│   ├── geminiService.ts              # Dịch vụ gọi Google Gemini AI
│   └── webcodecsExporter.ts          # Bộ giải mã và xuất video WebCodecs
├── utils/                            # Các module tiện ích và thuật toán đồ họa
│   ├── backgroundPresets.ts          # Danh mục preset hình nền
│   ├── customVisualizerPresets.ts    # Thư viện mẫu Visualizer và prompt AI
│   ├── fontLoader.ts                 # Trình nạp font chữ Google linh hoạt
│   ├── imageCropper.ts               # Xử lý cắt và xoay ảnh đĩa quay
│   ├── introOutroRenderer.ts         # Vẽ intro/outro và watermark
│   ├── lrcParser.ts                  # Xử lý cú pháp LRC & SRT
│   ├── musicPlayerRenderer.ts        # Render trình phát nhạc đĩa than (Vinyl Player)
│   ├── vfxPostProcessing.ts          # Thuật toán xử lý hiệu ứng hậu kỳ điện ảnh
│   └── visualizerEngines.ts          # Các thuật toán sóng nhạc 2D/3D Canvas
├── public/                           # Icons, favicon, PWA assets
├── server.ts                         # Backend Express API proxy (Bảo mật API keys)
├── types.ts                          # Định nghĩa kiểu dữ liệu TypeScript
└── vite.config.ts                    # Cấu hình Vite & PWA plugin
```

---

## 💡 Hướng dẫn sử dụng nhanh

1. **Tải lên Âm thanh**: Nhấp chọn hoặc kéo thả file âm thanh (`.mp3`, `.wav`, `.m4a`).
2. **Nạp Lời bài hát**: Dán nội dung lời bài hát hoặc tải file `.lrc` / `.srt`.
3. **Tùy chỉnh Giao diện**:
   * Chọn hình nền từ kho mẫu, ảnh tải lên từ máy tính hoặc tạo ảnh bằng AI.
   * Chọn kiểu sóng nhạc (Visualizer), hiệu ứng hạt rơi (Particles) và bộ lọc điện ảnh (VFX).
   * Lựa chọn Font chữ tiếng Việt và hiệu ứng chuyển động chữ karaoke mong muốn.
4. **Xem trước (Live Preview)**: Bấm nút **Phát** để kiểm tra đồng bộ nhạc, lời và sóng nhạc trực tiếp ở 60 FPS.
5. **Xuất Video**: Chọn chất lượng (720p / 1080p, 60 FPS, tỉ lệ 9:16 hoặc 16:9), bấm **Bắt đầu Xuất** để trình duyệt kết xuất file video `.mp4` hoặc `.webm`.

---

## 🤝 Đóng góp phát triển (Contributing)

Mọi đóng góp, đề xuất tính năng mới và báo cáo lỗi đều rất được hoan nghênh!
1. Fork dự án
2. Tạo nhánh tính năng mới (`git checkout -b feature/AmazingFeature`)
3. Commit các thay đổi của bạn (`git commit -m 'Add some AmazingFeature'`)
4. Push nhánh của bạn (`git push origin feature/AmazingFeature`)
5. Mở một **Pull Request**

---

## 📄 Giấy phép (License)

Dự án được phân phối dưới giấy phép mã nguồn mở **MIT License**. Xem chi tiết tại [LICENSE](LICENSE).

---

<div align="center">
  <sub>Được xây dựng với niềm đam mê âm nhạc và công nghệ web đồ họa hiện đại.</sub>
</div>

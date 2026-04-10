# MoodBook 🎨✨

A cozy, retro, pixel-art drawing and guessing game built for the web! 

![MoodBook Preview](https://img.shields.io/badge/Status-Live_on_Vercel-success?style=for-the-badge&logo=vercel)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 📖 About the Project
**MoodBook** is an interactive, highly stylized web application that lets players select a secret mood and draw it out on a beautiful 8-bit canvas. 

Featuring algorithmic Web Audio API chiptune music, a fully custom pointer-driven drawing engine, and a stunning nostalgic UI themed entirely around a retro diary/book. Whether you are scribbling in solo mode or generating a room code to draw with a partner, MoodBook provides a comfy, relaxed digital environment.

## 🌟 Key Features
- **🖌️ Custom HTML5 Canvas Engine:** A buttery smooth, pointer-event-driven drawing canvas. Features a pixelated crosshair, distinct pen colors, adjustable brush sizes, and an eraser logic system.
- **🎵 Algorithmic Chiptune Audio:** A lightweight, procedurally generated 8-bit synthesizer loop built directly on the Web Audio API. No heavy `.mp3` downloads required—just endlessly cozy C-major/A-minor arpeggio ambiance!
- **🎮 Social & Solo Modes:** Supports Solo offline drawing or generating unique 4-character Room Codes to share with friends.
- **🎨 Nostalgic UI/UX:** Meticulously crafted custom CSS styling featuring pressed pixel-buttons, distinct typography (`Press Start 2P`, `Pixelify Sans`), and immersive screen transitions powered by Framer Motion.
- **⏳ Dynamic Countdown Timer:** A fully integrated React-driven 30-second timer that visually glitters and speeds up audio cues when time is running out.

## 🛠️ Technology Stack
- **Frontend Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling framework:** Tailwind CSS v4 + Vanilla CSS Variables
- **State Management:** Zustand (for complex global phases and canvas strokes)
- **Animations:** Framer Motion

## 🚀 Running Locally

To run this project on your own machine:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jaggutech24-maker/moodbook-pixel-app.git
   cd moodbook-pixel-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Play!**
   Open `http://localhost:5173/` in your browser.

## 💡 Future Roadmap
- Finish `socket.io` or `Supabase` integration to fully sync multiplayer strokes across different browsers in real-time.
- Add an interactive chat/guessing box for partners to decode the mood being drawn.
- Implement a post-game "Gallery" phase to save your masterpiece as a `.png` file.

---
*Built with ❤️ and pixels.*

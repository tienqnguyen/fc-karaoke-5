import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Global CORS & media streaming headers
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Range, Authorization");
    res.header("Access-Control-Expose-Headers", "Content-Range, Accept-Ranges, Content-Length");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json());

  // Static serving for root audio/media files (e.g. /tinhdau.mp3, /music.png)
  app.get("/tinhdau.mp3", (req, res) => {
    const filePath = path.join(process.cwd(), "tinhdau.mp3");
    if (fs.existsSync(filePath)) {
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Accept-Ranges", "bytes");
      return res.sendFile(filePath);
    }
    res.status(404).send("Audio not found");
  });

  app.get("/tinhdau.lrc", (req, res) => {
    const filePath = path.join(process.cwd(), "tinhdau.lrc");
    if (fs.existsSync(filePath)) {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.sendFile(filePath);
    }
    res.status(404).send("LRC not found");
  });

  app.get("/music.png", (req, res) => {
    const filePath = path.join(process.cwd(), "music.png");
    if (fs.existsSync(filePath)) {
      res.setHeader("Content-Type", "image/png");
      return res.sendFile(filePath);
    }
    res.status(404).send("Image not found");
  });

  // Media Proxy for external audio files to bypass remote CORS restrictions
  app.get("/api/proxy-audio", async (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).json({ error: "Missing audio url parameter" });
    }

    try {
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          ...(req.headers.range ? { Range: req.headers.range } : {})
        }
      });

      if (!response.ok && response.status !== 206) {
        throw new Error(`Upstream audio fetch failed: ${response.status} ${response.statusText}`);
      }

      res.status(response.status);
      const contentType = response.headers.get("content-type") || "audio/mpeg";
      const contentLength = response.headers.get("content-length");
      const contentRange = response.headers.get("content-range");
      const acceptRanges = response.headers.get("accept-ranges");

      res.setHeader("Content-Type", contentType);
      if (contentLength) res.setHeader("Content-Length", contentLength);
      if (contentRange) res.setHeader("Content-Range", contentRange);
      if (acceptRanges) res.setHeader("Accept-Ranges", acceptRanges);

      if (response.body) {
        const reader = (response.body as any).getReader();
        const pump = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                res.end();
                break;
              }
              res.write(Buffer.from(value));
            }
          } catch (streamErr) {
            res.end();
          }
        };
        pump();
      } else {
        const arrayBuffer = await response.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
      }
    } catch (err: any) {
      console.error("Audio proxy error:", err);
      res.status(502).json({ error: err.message || "Failed to proxy audio" });
    }
  });

  // API Route for OpenRouter & Gemini to generate creative prompts
  app.post("/api/generate-prompt", async (req, res) => {
    try {
      const { title, lyric, theme, typography, fontSize, provider = 'openrouter', model, openRouterKey } = req.body;

      const promptText = `Act as an expert Midjourney and DALL-E prompt engineer.
Create a highly detailed, comma-separated image generation prompt for a cinematic music poster.
Song Title: "${title || 'Melody & Harmony'}"
Lyric Quote: "${lyric || ''}"
Theme: ${theme || 'cinematic and atmospheric'}
Typography Style: ${typography || 'glowing gold or vibrant white'}
Title Size/Placement: ${fontSize || 'largest focal point'}

IMPORTANT: The output must be ONLY the raw prompt text, ready to be copy-pasted into Midjourney or Stable Diffusion. End it with --ar 16:9. Do not include any conversational text, quotes, or markdown code blocks.
Example format: A cinematic music poster, neon cyberpunk city at night, rain on the streets, typography overlay with the text "${title}" in huge glowing neon pink letters as the focal point, below it the lyrics "${lyric}" in a clean modern sans-serif font, highly detailed, 8k resolution, atmospheric lighting --ar 16:9`;

      if (provider === 'openrouter') {
        const effectiveKey = openRouterKey || process.env.OPENROUTER_API_KEY;
        const selectedModel = model || "nvidia/nemotron-3.5-lightning:free";

        if (!effectiveKey) {
          // If no OpenRouter key is configured, fallback to Gemini if available, or return clear message
          const geminiApiKey = process.env.GEMINI_API_KEY;
          if (geminiApiKey) {
            const ai = new GoogleGenAI({ apiKey: geminiApiKey });
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: promptText,
            });
            return res.json({ 
              prompt: response.text?.trim(), 
              provider: 'gemini', 
              note: 'Auto-switched to Gemini (OpenRouter key not set)' 
            });
          }
          return res.status(400).json({ 
            error: "Vui lòng nhập OpenRouter API Key hoặc cấu hình OPENROUTER_API_KEY." 
          });
        }

        const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${effectiveKey.trim()}`,
            "HTTP-Referer": "https://karaoke-studio.app",
            "X-Title": "Karaoke Studio Master",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              {
                role: "system",
                content: "You are an expert Midjourney and DALL-E prompt engineer. Respond with ONLY the raw prompt text ending with --ar 16:9. No conversation, no explanations, no markdown blocks."
              },
              {
                role: "user",
                content: promptText
              }
            ],
            temperature: 0.7,
            max_tokens: 350
          })
        });

        if (!orResponse.ok) {
          const errorText = await orResponse.text();
          throw new Error(`OpenRouter (${orResponse.status}): ${errorText}`);
        }

        const orData = await orResponse.json();
        let generatedPrompt = orData.choices?.[0]?.message?.content?.trim() || "";
        
        // Clean markdown backticks if model wrapped in ```
        if (generatedPrompt.startsWith('```')) {
          generatedPrompt = generatedPrompt.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
        }

        return res.json({ 
          prompt: generatedPrompt, 
          provider: 'openrouter', 
          model: selectedModel 
        });
      }

      // Default: Gemini API
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "API key is not configured on the server." });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptText,
      });

      const generatedPrompt = response.text?.trim() || "";
      res.json({ prompt: generatedPrompt, provider: 'gemini' });
    } catch (error: any) {
      console.error("Error generating prompt:", error);
      res.status(500).json({ error: error.message || "Failed to generate prompt" });
    }
  });

  // API Route for Gemini to generate images
  app.post("/api/generate-image", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "API key is not configured on the server." });
      }

      const { prompt } = req.body;
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image',
        contents: {
          parts: [
            {
              text: `An aesthetic, artistic, vertical cinematic background for a song with the following vibe: ${prompt}. High resolution, no text, colorful, moody, perfect for a tiktok video background.`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "9:16",
            imageSize: "1K"
          }
        }
      });
      
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return res.json({ imageBase64: `data:image/png;base64,${part.inlineData.data}` });
        }
      }
      throw new Error("No image part found in Gemini response");
    } catch (error: any) {
      console.error("Error generating image:", error);
      res.status(500).json({ error: error.message || "Failed to generate image" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

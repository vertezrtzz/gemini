import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables (.env files)
dotenv.config();

const PORT = 3000;
const app = express();

app.use(express.json());

// Helper to safely initialize and retrieve GenAI client
let genAIInstance: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey.trim() === "AQ.Ab8RN6KmoU_EeLYdbXiJgeGFZuKZ2Y-bfPur-ixGi2EzJdtzzQ") {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please add it in Settings > Secrets."
    );
  }
  if (!genAIInstance) {
    genAIInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIInstance;
}

// 1. API: Streaming Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, modelId, config } = req.body;

    if (!message) {
      return res.status(400).json({ error: "El mensaje es obligatorio." });
    }

    // Initialize Gemini AI, catching key issues
    let ai;
    try {
      ai = getGenAI();
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }

    // Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Format history for Gemini API.
    // We Map history from our Message interface into standard Gemini content format:
    // { role: 'user' | 'model', parts: [{ text: string }] }
    const contents = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.role === "model" ? "model" as const : "user" as const,
          parts: msg.parts.map((p: any) => ({ text: p.text })),
        });
      }
    }

    // Append the current message
    contents.push({
      role: "user" as const,
      parts: [{ text: message }],
    });

    // Extract parameters
    const temperature = typeof config.temperature === "number" ? config.temperature : 1.0;
    const maxOutputTokens = typeof config.maxOutputTokens === "number" && config.maxOutputTokens > 0 
      ? config.maxOutputTokens 
      : undefined;
    const topP = typeof config.topP === "number" ? config.topP : undefined;
    const topK = typeof config.topK === "number" ? config.topK : undefined;
    const systemInstruction = config.systemInstruction && config.systemInstruction.trim() !== ""
      ? config.systemInstruction
      : undefined;

    // Call generateContentStream
    const selectedModel = modelId || "gemini-3.5-flash";
    const responseStream = await ai.models.generateContentStream({
      model: selectedModel,
      contents: contents,
      config: {
        temperature: temperature,
        maxOutputTokens: maxOutputTokens,
        topP: topP,
        topK: topK,
        systemInstruction: systemInstruction,
      },
    });

    for await (const chunk of responseStream) {
      const textChunk = chunk.text || "";
      res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    // If headers haven't been sent, return HTTP 500 JSON.
    // Otherwise, close SSE stream with an error payload.
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || "Error al procesar la solicitud con Gemini." });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message || "Error intermedio en el stream." })}\n\n`);
      res.end();
    }
  }
});

// 2. Serve public APIs check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    hasApiKey: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY",
  });
});

// 3. Vite development vs Production static setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

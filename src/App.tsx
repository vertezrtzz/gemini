/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import SettingsPanel from "./components/SettingsPanel";
import { ChatSession, Message, ModelParameters } from "./types";
import { motion, AnimatePresence } from "motion/react";

// Platform user details (pre-filled from runner metadata)
const USER_EMAIL = "vertezrtzz@gmail.com";

// Helper to generate unique identifier string across browsers
function generateId() {
  if (typeof window !== "undefined" && window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return "session_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

const DEFAULT_PARAMS: ModelParameters = {
  modelId: "gemini-3.5-flash",
  temperature: 1.0,
  maxOutputTokens: 2048,
  topP: 0.95,
  topK: 64,
  systemInstruction: "",
};

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Load chat sessions from local storage on first mount
  useEffect(() => {
    const saved = localStorage.getItem("gemini_playground_sessions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ChatSession[];
        setSessions(parsed);
        if (parsed.length > 0) {
          setCurrentSessionId(parsed[0].id);
        } else {
          // If empty array, create a fresh default session
          initDefaultSession();
        }
      } catch (err) {
        console.error("Error reading sessions from localStorage:", err);
        initDefaultSession();
      }
    } else {
      initDefaultSession();
    }

    // On mobile devices, start with collapsed sidebar by default
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  // 2. Persist sessions state to local storage when changed
  const saveSessionsToLocalStorage = (updated: ChatSession[]) => {
    localStorage.setItem("gemini_playground_sessions", JSON.stringify(updated));
  };

  const initDefaultSession = () => {
    const defaultSession: ChatSession = {
      id: generateId(),
      title: "Nuevo chat de Gemini",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      ...DEFAULT_PARAMS,
    };
    const updated = [defaultSession];
    setSessions(updated);
    setCurrentSessionId(defaultSession.id);
    saveSessionsToLocalStorage(updated);
  };

  // Find active session
  const activeSession = sessions.find((s) => s.id === currentSessionId) || null;

  // Retrieve current parameters (merge with default params)
  const currentParameters: ModelParameters = activeSession
    ? {
        modelId: activeSession.modelId || DEFAULT_PARAMS.modelId,
        temperature: typeof activeSession.temperature === "number" ? activeSession.temperature : DEFAULT_PARAMS.temperature,
        maxOutputTokens: activeSession.maxOutputTokens || DEFAULT_PARAMS.maxOutputTokens,
        topP: typeof activeSession.topP === "number" ? activeSession.topP : DEFAULT_PARAMS.topP,
        topK: typeof activeSession.topK === "number" ? activeSession.topK : DEFAULT_PARAMS.topK,
        systemInstruction: activeSession.systemInstruction || DEFAULT_PARAMS.systemInstruction,
      }
    : DEFAULT_PARAMS;

  // Update session parameters immediately (stored on current session block)
  const handleUpdateParameters = (newParams: ModelParameters) => {
    const updated = sessions.map((s) => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          modelId: newParams.modelId,
          temperature: newParams.temperature,
          maxOutputTokens: newParams.maxOutputTokens,
          topP: newParams.topP,
          topK: newParams.topK,
          systemInstruction: newParams.systemInstruction,
          updatedAt: new Date().toISOString(),
        };
      }
      return s;
    });
    setSessions(updated);
    saveSessionsToLocalStorage(updated);
  };

  // Create a clean new session
  const handleCreateSession = () => {
    const newSession: ChatSession = {
      id: generateId(),
      title: "Nuevo chat de Gemini",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      ...DEFAULT_PARAMS,
    };
    const updated = [newSession, ...sessions];
    setSessions(updated);
    setCurrentSessionId(newSession.id);
    saveSessionsToLocalStorage(updated);
  };

  // Delete session
  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    saveSessionsToLocalStorage(updated);

    if (currentSessionId === id) {
      if (updated.length > 0) {
        setCurrentSessionId(updated[0].id);
      } else {
        const defaultSession: ChatSession = {
          id: generateId(),
          title: "Nuevo chat de Gemini",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [],
          ...DEFAULT_PARAMS,
        };
        setSessions([defaultSession]);
        setCurrentSessionId(defaultSession.id);
        saveSessionsToLocalStorage([defaultSession]);
      }
    }
  };

  // Rename session title
  const handleRenameSession = (id: string, newTitle: string) => {
    const updated = sessions.map((s) => {
      if (s.id === id) {
        return { ...s, title: newTitle, updatedAt: new Date().toISOString() };
      }
      return s;
    });
    setSessions(updated);
    saveSessionsToLocalStorage(updated);
  };

  // Select another session
  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
  };

  // Call proxy endpoint and decode server-sent events for responsive typing
  const handleSendMessage = async (text: string) => {
    if (!activeSession || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      parts: [{ text }],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // 1. Append user message locally
    const currentMessages = [...activeSession.messages, userMessage];
    
    // Auto rename default session title based on the first prompt!
    let updatedTitle = activeSession.title;
    if (activeSession.messages.length === 0) {
      updatedTitle = text.length > 25 ? text.substring(0, 25) + "..." : text;
    }

    let updatedSessions = sessions.map((s) => {
      if (s.id === activeSession.id) {
        return {
          ...s,
          title: updatedTitle,
          messages: currentMessages,
          updatedAt: new Date().toISOString(),
        };
      }
      return s;
    });

    setSessions(updatedSessions);
    saveSessionsToLocalStorage(updatedSessions);
    setIsLoading(true);

    // 2. Setup receiver model block
    const assistantMessageId = generateId();
    const assistantPlaceholderMessage: Message = {
      id: assistantMessageId,
      role: "model",
      parts: [{ text: "" }],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Insert placeholder
    let streamedMessages = [...currentMessages, assistantPlaceholderMessage];
    setSessions(
      updatedSessions.map((s) => {
        if (s.id === activeSession.id) {
          return { ...s, messages: streamedMessages };
        }
        return s;
      })
    );

    let assistantAccumulatedText = "";

    try {
      // 3. Post to full-stack API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          history: activeSession.messages, // Sends past history in the thread
          modelId: currentParameters.modelId,
          config: currentParameters,
        }),
      });

      if (!response.ok) {
        // Retrieve backend error
        const errObj = await response.json().catch(() => ({}));
        throw new Error(errObj.error || `Error del servidor (HTTP ${response.status})`);
      }

      // Check stream reader
      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (!reader) {
        throw new Error("No se pudo iniciar el decodificador de respuesta.");
      }

      let done = false;
      let sseBuffer = "";

      // 4. Read reader buffer chunk-by-chunk
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          sseBuffer += decoder.decode(value, { stream: !doneReading });
          const lines = sseBuffer.split("\n");
          
          // Re-contain last incomplete stream segment
          sseBuffer = lines.pop() || "";

          for (const line of lines) {
            const cleanLine = line.trim();
            if (!cleanLine.startsWith("data: ")) continue;
            
            const rawContent = cleanLine.slice(6);
            if (rawContent === "[DONE]") continue;

            try {
              const dataPayload = JSON.parse(rawContent);
              if (dataPayload.error) {
                throw new Error(dataPayload.error);
              }
              if (typeof dataPayload.text === "string") {
                assistantAccumulatedText += dataPayload.text;
                
                // Live visual updating of state
                setSessions((prevSessions) =>
                  prevSessions.map((s) => {
                    if (s.id === activeSession.id) {
                      return {
                        ...s,
                        messages: s.messages.map((m) => {
                          if (m.id === assistantMessageId) {
                            return {
                              ...m,
                              parts: [{ text: assistantAccumulatedText }],
                            };
                          }
                          return m;
                        }),
                      };
                    }
                    return s;
                  })
                );
              }
            } catch (err: any) {
              console.error("Failed to parse SSE payload", err);
              // Check if we passed a direct error structure from stream
              if (err.message) {
                throw err;
              }
            }
          }
        }
      }

      // Finally, persist accumulated text to disk
      saveSessionsToLocalStorage(
        sessions.map((s) => {
          if (s.id === activeSession.id) {
            return {
              ...s,
              title: updatedTitle,
              updatedAt: new Date().toISOString(),
              messages: [
                ...currentMessages,
                {
                  ...assistantPlaceholderMessage,
                  parts: [{ text: assistantAccumulatedText }],
                },
              ],
            };
          }
          return s;
        })
      );

    } catch (apiError: any) {
      console.error("Stream reader exception:", apiError);
      
      const errorText = `⚠️ **Error de Conexión:** ${apiError.message || "No se pudo completar la respuesta con el modelo."}\n\n*Por favor, comprueba que has guardado tu llave \`GEMINI_API_KEY\` en el menú superior derecho **Settings > Secrets** o recarga la página.*`;
      
      // Update assistant bubble with the clear error statement
      setSessions((prevSessions) =>
        prevSessions.map((s) => {
          if (s.id === activeSession.id) {
            return {
              ...s,
              messages: s.messages.map((m) => {
                if (m.id === assistantMessageId) {
                  return {
                    ...m,
                    parts: [{ text: errorText }],
                  };
                }
                return m;
              }),
            };
          }
          return s;
        })
      );

      // Save crash state to local storage safely
      saveSessionsToLocalStorage(
        sessions.map((s) => {
          if (s.id === activeSession.id) {
            return {
              ...s,
              messages: s.messages.map((m) => {
                if (m.id === assistantMessageId) {
                  return { ...m, parts: [{ text: errorText }] };
                }
                return m;
              }),
            };
          }
          return s;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#131314] text-[#e3e3e3] font-sans antialiased" id="playground-root-container">
      
      {/* Sidebar: Collapsible Left Panel */}
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onToggleSettings={() => setSettingsOpen(!isSettingsOpen)}
        isSettingsOpen={isSettingsOpen}
      />

      {/* Main interaction content view */}
      <div className="flex-1 flex flex-row h-full relative overflow-hidden">
        
        {/* Chat Feed Panel */}
        <ChatArea
          messages={activeSession ? activeSession.messages : []}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          parameters={currentParameters}
          onChangeParameters={handleUpdateParameters}
          onToggleSettings={() => setSettingsOpen(!isSettingsOpen)}
          isSidebarOpen={isSidebarOpen}
          setSidebarOpen={setSidebarOpen}
          userEmail={USER_EMAIL}
        />

        {/* Slidin Parameters Drawer panel */}
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute lg:relative top-0 right-0 h-full z-40"
            >
              <SettingsPanel
                parameters={currentParameters}
                onChangeParameters={handleUpdateParameters}
                isOpen={isSettingsOpen}
                onClose={() => setSettingsOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Click-away overlay for mobile when panel slide out */}
        {isSettingsOpen && (
          <div
            id="settings-overlay-backdrop"
            onClick={() => setSettingsOpen(false)}
            className="fixed inset-0 bg-black/45 z-30 lg:hidden"
          />
        )}
      </div>
    </div>
  );
}

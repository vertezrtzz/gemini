import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Sparkles, 
  User, 
  Copy, 
  Check, 
  SlidersHorizontal,
  Bot,
  Zap,
  HelpCircle,
  Menu,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { Message, ModelParameters } from "../types";
import Markdown from "react-markdown";
import { motion } from "motion/react";

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  parameters: ModelParameters;
  onChangeParameters: (newParams: ModelParameters) => void;
  onToggleSettings: () => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  userEmail: string;
}

const SUGGESTIONS = [
  {
    icon: "✍️",
    text: "Escribe un correo electrónico formal justificando un retraso en un proyecto.",
    actionText: "Escribe un correo electrónico formal justificando un retraso en un proyecto a mi mánager."
  },
  {
    icon: "🧠",
    text: "Explícame de forma ultra sencilla la paradoja de Schrödinger.",
    actionText: "Explícame de forma ultra sencilla y para principiantes la paradoja del gato de Schrödinger."
  },
  {
    icon: "💻",
    text: "Genera una función TypeScript para validar correos sin usar regex complejas.",
    actionText: "Dame código y documentación para una función sencilla en TypeScript que valide direcciones de correo, sin usar expresiones regulares complejas."
  },
  {
    icon: "🏝️",
    text: "Planifica un itinerario de 3 días para viajar por Madrid con presupuesto ajustado.",
    actionText: "Hazme una propuesta de itinerario de 3 días para visitar Madrid con presupuesto bajo, incluyendo lugares emblemáticos y consejos de comida económica."
  }
];

export default function ChatArea({
  messages,
  isLoading,
  onSendMessage,
  parameters,
  onChangeParameters,
  onToggleSettings,
  isSidebarOpen,
  setSidebarOpen,
  userEmail,
}: ChatAreaProps) {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (input.trim() === "" || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const username = userEmail ? userEmail.split("@")[0] : "visitante";
  const userInitials = username.substring(0, 2).toUpperCase();

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleParamChange = (key: keyof ModelParameters, value: any) => {
    onChangeParameters({
      ...parameters,
      [key]: value,
    });
  };

  const handleResetParams = () => {
    onChangeParameters({
      modelId: parameters.modelId,
      temperature: 1.0,
      maxOutputTokens: 2048,
      topP: 0.95,
      topK: 64,
      systemInstruction: parameters.systemInstruction,
    });
  };

  // Human friendly display name for current model
  const getModelName = (id: string) => {
    if (id === "gemini-3.5-flash") return "Gemini 3.5 Flash";
    if (id === "gemini-3.1-flash-lite") return "Gemini 3.1 Flash Lite";
    if (id === "gemini-3.1-pro-preview") return "Gemini 3.1 Pro (Preview)";
    return id;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#131314] relative overflow-hidden" id="chat-viewport">
      
      {/* Top Navigation Header styled exactly like Sleek Interface design template */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-[#333537] bg-[#131314] shrink-0 z-10 select-none">
        <div className="flex items-center gap-4">
          
          {/* Mobile expand drawer button */}
          {!isSidebarOpen && (
            <button
              id="btn-sidebar-reveal"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 text-[#9aa0a6] hover:text-white hover:bg-[#1e1f20] border border-[#333537] rounded-lg transition shrink-0"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
          )}

          {/* Model Switcher Box activator */}
          <button
            id="btn-model-switcher-header"
            onClick={onToggleSettings}
            className="flex items-center bg-[#1e1f20] border border-[#333537] hover:border-[#8ab4f8] rounded-full px-4 py-1.5 cursor-pointer transition duration-200 shadow-sm"
          >
            <span className="text-sm font-medium mr-2 text-white">{getModelName(parameters.modelId)}</span>
            <ChevronRight className="w-4 h-4 text-[#9aa0a6] transform rotate-90" />
          </button>

          <div className="h-4 w-[1px] bg-[#333537] hidden sm:block"></div>
          <span className="text-[10px] text-[#9aa0a6] uppercase tracking-widest font-bold hidden sm:block">
            Gemini Playground Workbench
          </span>
        </div>

        {/* Right side Metadata Profile area */}
        <div className="flex items-center gap-4">
          {userEmail && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#1e1f20] rounded-full border border-[#333537] text-xs text-[#c4c7c5]">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
              <span className="font-mono text-[10px]" title={userEmail}>
                {userEmail}
              </span>
            </div>
          )}
          <button
            id="btn-trigger-settings-header"
            onClick={onToggleSettings}
            className="text-[#8ab4f8] hover:text-indigo-300 text-xs font-semibold cursor-pointer select-none transition"
          >
            Ajustes
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-[#333537] flex items-center justify-center text-xs font-bold text-white uppercase select-none">
            {username.charAt(0)}
          </div>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-[10%] lg:px-[12%] xl:px-[15%] py-8 space-y-8 flex flex-col justify-between">
        
        {messages.length === 0 ? (
          /* Welcome panel when chat is empty */
          <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center py-8">
            <div className="mb-8">
              <h1 className="font-display font-semibold text-3xl sm:text-4xl tracking-tight text-white mb-2 leading-tight">
                <span className="bg-gradient-to-r from-[#8ab4f8] via-indigo-300 to-purple-400 bg-clip-text text-transparent capitalize">
                  Hola, {username}
                </span>
              </h1>
              <h2 className="font-display text-lg sm:text-xl text-[#9aa0a6] font-medium leading-relaxed">
                ¿Qué se te ocurre hoy? Ajusta los parámetros de temperatura y respuesta en cada interacción.
              </h2>
            </div>

            {/* Quick Suggestions grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4" id="suggestions-grid">
              {SUGGESTIONS.map((s, i) => (
                <div
                  key={i}
                  id={`suggestion-card-${i}`}
                  onClick={() => {
                    setInput(s.actionText);
                  }}
                  className="p-5 bg-[#1e1f20] hover:bg-[#2d2f31] border border-[#333537] hover:border-[#8ab4f8]/50 rounded-2xl cursor-pointer transition-all duration-200 group flex flex-col justify-between h-36 relative"
                >
                  <p className="text-[#c4c7c5] text-sm font-sans leading-relaxed group-hover:text-white line-clamp-3">
                    {s.text}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xl shrink-0">{s.icon}</span>
                    <span className="p-1 px-2.5 bg-[#131314] text-[10px] text-[#8ab4f8] hover:text-white rounded-lg transition-colors font-medium">
                      Probar
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Hint parameter explanation */}
            <div className="mt-8 p-4 bg-[#1e1f20] rounded-2xl border border-[#333537] flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-[#8ab4f8] shrink-0 mt-0.5" />
              <div className="text-xs text-[#c4c7c5] leading-relaxed">
                <span className="font-semibold text-white block mb-0.5">Control de temperatura y respuesta</span>
                Para tareas analíticas o de programación se recomienda bajar la <span className="font-bold text-[#8ab4f8]">Temperatura</span>. Para brainstormings creativos o poesías, increméntala para mayor libertad aleatoria.
              </div>
            </div>
          </div>
        ) : (
          /* Real conversation thread styled exactly like Sleek Interface */
          <div className="max-w-4xl mx-auto w-full space-y-8 flex-1">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              const textContent = msg.parts?.[0]?.text || "";

              return (
                <div
                  key={msg.id}
                  id={`message-block-${msg.id}`}
                  className="flex gap-4 sm:gap-6 items-start"
                >
                  {/* Left avatar */}
                  {isUser ? (
                    <div className="w-8 h-8 rounded-full bg-indigo-700 flex-shrink-0 flex items-center justify-center text-xs font-semibold text-white select-none uppercase">
                      {userInitials}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a73e8] to-[#d93025] flex-shrink-0 flex items-center justify-center p-1.5 shadow-md">
                      <svg className="text-white w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
                      </svg>
                    </div>
                  )}

                  {/* Message body */}
                  <div className="flex-1 space-y-2 min-w-0">
                    {/* Message Header info for Bot */}
                    {!isUser && (
                      <div className="flex items-center gap-1.5 text-[10px] text-[#9aa0a6] uppercase tracking-wider font-bold">
                        <span>Gemini Assistant</span>
                        <span>•</span>
                        <span className="text-[#8ab4f8]">{getModelName(parameters.modelId)}</span>
                      </div>
                    )}

                    {isUser ? (
                      /* User message with beautiful sleek quote layout style */
                      <p className="text-sm text-[#e3e3e3] leading-relaxed italic border-l-2 border-[#3c4043] pl-4 select-text selection:bg-[#8ab4f8]/35">
                        "{textContent}"
                      </p>
                    ) : (
                      /* Assistant bot markdown container */
                      <div className="text-sm text-[#e3e3e3] leading-relaxed space-y-2 select-text selection:bg-[#8ab4f8]/35 pt-0.5">
                        <div className="markdown-body prose prose-invert max-w-none">
                          <Markdown>{textContent}</Markdown>
                        </div>
                      </div>
                    )}

                    {/* Action buttons list */}
                    <div className="flex items-center gap-4 text-[#9aa0a6] pt-1">
                      <button
                        id={`btn-copy-${msg.id}`}
                        onClick={() => handleCopyMessage(msg.id, textContent)}
                        className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider hover:text-white transition-colors cursor-pointer select-none"
                        title="Copiar texto"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                      <span className="text-[10px] opacity-40">{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Is answering loader stream effect styled in Sleek Interface layout */}
            {isLoading && (
              <div className="flex gap-4 sm:gap-6 items-start" id="ai-loading-indicator">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a73e8] to-[#d93025] flex-shrink-0 flex items-center justify-center p-1.5 animate-pulse">
                  <svg className="text-white w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
                  </svg>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="text-[10px] text-[#9aa0a6] uppercase tracking-wider font-bold">
                    Generando respuesta...
                  </div>
                  <div className="flex items-center gap-1.5 py-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#8ab4f8] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-1.5 w-1.5 rounded-full bg-[#8ab4f8] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-1.5 w-1.5 rounded-full bg-[#8ab4f8] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Footer Area with inline Sliders and rounded Input exactly as the model template */}
      <div className="p-6 shrink-0 bg-[#131314] border-t border-[#333537]/50">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* Interactive Parameters Bar exactly from Sleek Interface design HTML */}
          <div className="bg-[#1e1f20] border border-[#333537]/80 rounded-xl px-5 py-3 flex flex-wrap items-center justify-between shadow-2xl gap-4">
            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              
              {/* Temperature Slider */}
              <div className="flex flex-col gap-1 min-w-[110px]">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] text-[#9aa0a6] uppercase font-bold tracking-wider">Temperatura</label>
                  <span className="text-[9px] text-[#8ab4f8] font-bold">{parameters.temperature.toFixed(2)}</span>
                </div>
                <input 
                  type="range" 
                  className="w-28 sm:w-32 h-1 bg-[#3c4043] rounded-lg appearance-none cursor-pointer accent-[#8ab4f8] focus:outline-none" 
                  min="0" 
                  max="2" 
                  step="0.05" 
                  value={parameters.temperature}
                  onChange={(e) => handleParamChange("temperature", parseFloat(e.target.value))}
                />
              </div>

              {/* Top P Slider */}
              <div className="flex flex-col gap-1 min-w-[110px]">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] text-[#9aa0a6] uppercase font-bold tracking-wider">Top P</label>
                  <span className="text-[9px] text-[#8ab4f8] font-bold">{parameters.topP.toFixed(2)}</span>
                </div>
                <input 
                  type="range" 
                  className="w-28 sm:w-32 h-1 bg-[#3c4043] rounded-lg appearance-none cursor-pointer accent-[#8ab4f8] focus:outline-none" 
                  min="0.1" 
                  max="1" 
                  step="0.05" 
                  value={parameters.topP}
                  onChange={(e) => handleParamChange("topP", parseFloat(e.target.value))}
                />
              </div>

              {/* Max Output Tokens Slider */}
              <div className="flex flex-col gap-1 min-w-[110px]">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] text-[#9aa0a6] uppercase font-bold tracking-wider">Max Output</label>
                  <span className="text-[9px] text-[#8ab4f8] font-bold">{parameters.maxOutputTokens}</span>
                </div>
                <input 
                  type="range" 
                  className="w-28 sm:w-32 h-1 bg-[#3c4043] rounded-lg appearance-none cursor-pointer accent-[#8ab4f8] focus:outline-none" 
                  min="100" 
                  max="8192" 
                  step="100" 
                  value={parameters.maxOutputTokens}
                  onChange={(e) => handleParamChange("maxOutputTokens", parseInt(e.target.value))}
                />
              </div>

            </div>

            {/* Parameter reset matching Sleek Interface spec */}
            <div className="flex items-center">
              <button
                type="button"
                id="btn-parameters-inline-reset"
                onClick={handleResetParams}
                className="flex items-center gap-1 text-[11px] text-[#c4c7c5] hover:text-white cursor-pointer select-none transition"
                title="Restaurar parámetros originales"
              >
                <RefreshCw className="w-3 h-3 text-[#8ab4f8]" />
                <span>Restaurar</span>
              </button>
            </div>
          </div>

          {/* Main User Input area */}
          <form onSubmit={handleSubmit} className="relative bg-[#1e1f20] border border-[#333537] rounded-3xl p-1 shadow-sm focus-within:ring-2 focus-within:ring-[#8ab4f8]/50 focus-within:border-[#8ab4f8]/70 transition-all">
            <textarea 
              id="chat-user-textbox"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              rows={1}
              disabled={isLoading}
              className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-[#9aa0a6] px-5 py-3.5 resize-none h-[54px] text-sm focus:outline-none leading-relaxed overflow-y-auto max-h-32"
              placeholder={`Preguntar a Gemini... (${parameters.modelId === "gemini-3.1-pro-preview" ? "Pro" : "Flash"})`}
            />
            <div className="flex justify-between items-center px-4 pb-2 pt-1">
              <div className="flex gap-3 text-[#8ab4f8] select-none text-xs items-center font-semibold">
                <Sparkles className="w-4 h-4 text-[#8ab4f8] shrink-0" />
                <span className="text-[10px] text-[#9aa0a6] tracking-wide normal-case">Modelo Listo</span>
              </div>
              <button 
                type="submit"
                id="btn-send-message"
                disabled={input.trim() === "" || isLoading}
                className={`rounded-full p-2.5 transition-all cursor-pointer ${
                  input.trim() === "" || isLoading
                    ? "bg-[#333537] text-[#9aa0a6] cursor-not-allowed"
                    : "bg-white text-black hover:bg-[#e3e3e3] hover:scale-105 active:scale-95 shadow-md"
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

          <p className="text-[10px] text-center text-[#9aa0a6] opacity-50 select-none">
            Gemini puede mostrar información inexacta, incluyendo sobre personas, así que verifica sus respuestas. Tu privacidad y las aplicaciones Gemini.
          </p>
        </div>
      </div>
    </div>
  );
}

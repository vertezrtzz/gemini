import { ModelOption, ModelParameters } from "../types";
import { Sliders, HelpCircle, RotateCcw, Bot, Sparkles, Zap, ShieldAlert } from "lucide-react";

const GOOGLE_MODELS: ModelOption[] = [
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    description: "Modelo insignia para velocidad, eficiencia y tareas generales.",
    recommendedTask: "Excelente para conversaciones, redacción guiada, resúmenes rápidos y soporte general.",
    tag: "Recommended",
  },
  {
    id: "gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash Lite",
    description: "Modelo ultraligero diseñado para respuestas instantáneas de bajísima latencia.",
    recommendedTask: "Ideal para consultas básicas repetitivas donde la velocidad y costo son máxima prioridad.",
    tag: "Ultra-Fast",
  },
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro (Preview)",
    description: "Modelo avanzado con inteligencia superior para razonamiento complejo y análisis profundo.",
    recommendedTask: "Excelente para generar y auditar código fuente, resolver matemáticas e investigar.",
    tag: "Reasoning",
  },
];

interface SettingsPanelProps {
  parameters: ModelParameters;
  onChangeParameters: (params: ModelParameters) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({
  parameters,
  onChangeParameters,
  isOpen,
  onClose,
}: SettingsPanelProps) {
  if (!isOpen) return null;

  const handleModelSelect = (modelId: string) => {
    onChangeParameters({
      ...parameters,
      modelId,
    });
  };

  const handleParamChange = (key: keyof ModelParameters, value: any) => {
    onChangeParameters({
      ...parameters,
      [key]: value,
    });
  };

  const resetToDefaults = () => {
    onChangeParameters({
      modelId: "gemini-3.5-flash",
      temperature: 1.0,
      maxOutputTokens: 2048,
      topP: 0.95,
      topK: 64,
      systemInstruction: "",
    });
  };

  return (
    <div
      id="side-settings-panel"
      className="fixed inset-y-0 right-0 z-40 w-96 bg-[#1e1f20] border-l border-[#333537] flex flex-col shadow-2xl transition-all duration-300 transform translate-x-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#333537] min-h-[64px]">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-[#8ab4f8]" />
          <h2 className="font-display font-semibold text-white text-sm uppercase tracking-wider">
            Ajustes de Modelo
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="btn-parameters-reset"
            onClick={resetToDefaults}
            title="Restaurar de fábrica"
            className="p-1.5 hover:bg-[#333537] text-[#9aa0a6] hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            id="btn-parameters-close"
            onClick={onClose}
            className="px-3 py-1 bg-[#333537] hover:bg-[#3d3f42] text-[#e3e3e3] hover:text-white rounded-md text-xs font-semibold transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Content scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Model Selection */}
        <div className="space-y-3" id="model-selector-group">
          <label className="text-xs font-semibold text-[#9aa0a6] uppercase tracking-widest block">
            1. Modelo de Google
          </label>
          <div className="space-y-2.5">
            {GOOGLE_MODELS.map((model) => {
              const isSelected = parameters.modelId === model.id;
              return (
                <div
                  key={model.id}
                  id={`model-btn-${model.id}`}
                  onClick={() => handleModelSelect(model.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "bg-[#2d2f31] border-[#8ab4f8] shadow-md ring-1 ring-[#8ab4f8]/30"
                      : "bg-[#131314] border-[#333537] hover:border-[#8ab4f8]/50 hover:bg-[#1a1b1c]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-medium text-sm text-[#e3e3e3] flex items-center gap-1.5">
                      {model.name}
                      {model.tag === "Recommended" && (
                        <Sparkles className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20 shrink-0" />
                      )}
                      {model.tag === "Ultra-Fast" && (
                        <Zap className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      )}
                      {model.tag === "Reasoning" && (
                        <Bot className="h-3.5 w-3.5 text-[#8ab4f8] shrink-0" />
                      )}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      isSelected
                        ? "bg-[#8ab4f8]/20 text-[#8ab4f8]"
                        : "bg-gray-800 text-[#9aa0a6]"
                    }`}>
                      {model.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#c4c7c5] mt-1.5 leading-relaxed">
                    {model.description}
                  </p>
                  <p className="text-[10px] text-[#8ab4f8] mt-2 italic font-sans">
                    💡 {model.recommendedTask}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Temperature slider */}
        <div className="space-y-2.5" id="param-group-temperature">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              2. Temperatura
              <div className="group/tooltip relative">
                <HelpCircle className="h-3.5 w-3.5 text-gray-500 cursor-pointer hover:text-gray-300" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-[10px] text-gray-300 rounded shadow-xl opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 z-50 text-center font-normal tracking-normal capitalize-none normal-case leading-normal">
                  Controla la creatividad. Valores altos (e.g. 1.2) producen respuestas variadas y originales, valores bajos (e.g. 0.2) dan respuestas lógicas y deterministas.
                </span>
              </div>
            </span>
            <span className="text-xs font-mono font-bold text-[#8ab4f8] bg-[#8ab4f8]/10 px-2 py-0.5 rounded-md border border-[#8ab4f8]/15">
              {parameters.temperature.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={parameters.temperature}
            onChange={(e) => handleParamChange("temperature", parseFloat(e.target.value))}
            className="w-full h-1 bg-[#333537] rounded-lg appearance-none cursor-pointer accent-[#8ab4f8] focus:outline-none"
          />
          <div className="flex justify-between text-[10px] text-[#9aa0a6] font-medium px-0.5">
            <span>Preciso (0.0)</span>
            <span>Estándar (1.0)</span>
            <span>Creativo (2.0)</span>
          </div>
        </div>

        {/* Max Output Tokens slider */}
        <div className="space-y-2.5" id="param-group-tokens">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9aa0a6] uppercase tracking-widest flex items-center gap-1.5">
              3. Límite de Respuesta
              <div className="group/tooltip relative">
                <HelpCircle className="h-3.5 w-3.5 text-gray-500 cursor-pointer hover:text-gray-300" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-[10px] text-gray-300 rounded shadow-xl opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 z-50 text-center font-normal tracking-normal normal-case leading-normal">
                  Número máximo de tokens que el modelo puede generar. Un token equivale aproximadamente a 4 caracteres.
                </span>
              </div>
            </span>
            <span className="text-xs font-mono font-bold text-[#8ab4f8] bg-[#8ab4f8]/10 px-2 py-0.5 rounded-md border border-[#8ab4f8]/15">
              {parameters.maxOutputTokens} tks
            </span>
          </div>
          <input
            type="range"
            min="100"
            max="8192"
            step="50"
            value={parameters.maxOutputTokens}
            onChange={(e) => handleParamChange("maxOutputTokens", parseInt(e.target.value))}
            className="w-full h-1 bg-[#333537] rounded-lg appearance-none cursor-pointer accent-[#8ab4f8] focus:outline-none"
          />
          <div className="flex justify-between text-[10px] text-[#9aa0a6] font-medium px-0.5">
            <span>Corto (100)</span>
            <span>Estándar (2048)</span>
            <span>Extenso (8192)</span>
          </div>
        </div>

        {/* Top P & Top K parameters grouped */}
        <div className="pt-4 border-t border-[#333537] space-y-4">
          <span className="text-xs font-semibold text-[#9aa0a6] uppercase tracking-widest block">
            Ajustes Avanzados de Muestreo
          </span>

          {/* Top P Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-300 flex items-center gap-1">
                Top P (Nucleus)
                <div className="group/tooltip relative">
                  <HelpCircle className="h-3 w-3 text-gray-500 cursor-pointer hover:text-[#e3e3e3]" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 p-2 bg-gray-900 text-[10px] text-gray-300 rounded shadow-xl opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 z-50 text-center leading-normal">
                    Filtra la probabilidad acumulada de los tokens elegidos. Rangos habituales de 0.90 a 0.95.
                  </span>
                </div>
              </span>
              <span className="text-xs font-mono font-medium text-[#9aa0a6] bg-[#131314] px-1.5 py-0.5 rounded">
                {parameters.topP.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={parameters.topP}
              onChange={(e) => handleParamChange("topP", parseFloat(e.target.value))}
              className="w-full h-1 bg-[#333537] rounded appearance-none cursor-pointer accent-[#8ab4f8]"
            />
          </div>

          {/* Top K Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-300 flex items-center gap-1">
                Top K
                <div className="group/tooltip relative">
                  <HelpCircle className="h-3 w-3 text-gray-500 cursor-pointer hover:text-[#e3e3e3]" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 p-2 bg-gray-900 text-[10px] text-gray-300 rounded shadow-xl opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 z-50 text-center leading-normal">
                    Limita la selección a los K tokens más probables en cada paso de generación. El estándar es 40-64.
                  </span>
                </div>
              </span>
              <span className="text-xs font-mono font-medium text-[#9aa0a6] bg-[#131314] px-1.5 py-0.5 rounded">
                {parameters.topK}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={parameters.topK}
              onChange={(e) => handleParamChange("topK", parseInt(e.target.value))}
              className="w-full h-1 bg-[#333537] rounded appearance-none cursor-pointer accent-[#8ab4f8]"
            />
          </div>
        </div>

        {/* System Instructions / Prompt */}
        <div className="pt-4 border-t border-[#333537] space-y-2.5" id="param-group-sys">
          <label className="text-xs font-semibold text-[#9aa0a6] uppercase tracking-widest flex items-center gap-1.5">
            4. Instrucción del Sistema
            <div className="group/tooltip relative">
              <HelpCircle className="h-3.5 w-3.5 text-gray-500 cursor-pointer hover:text-[#e3e3e3]" />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-[10px] text-gray-300 rounded shadow-xl opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 z-50 text-center leading-normal">
                Define el rol, personalidad o reglas de formato permanentes que adoptará el modelo durante la conversación.
              </span>
            </div>
          </label>
          <textarea
            id="system-instruction-textarea"
            className="w-full h-24 bg-[#131314] border border-[#333537] hover:border-[#8ab4f8]/50 focus:border-[#8ab4f8] rounded-xl p-2.5 text-xs text-[#e3e3e3] placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#8ab4f8] transition resize-none leading-relaxed"
            placeholder="Ejemplo: Eres un crítico de cine sarcástico especializado en películas de ciencia ficción de los años 80..."
            value={parameters.systemInstruction}
            onChange={(e) => handleParamChange("systemInstruction", e.target.value)}
          />
        </div>

        {/* Informative advice */}
        <div className="p-3 bg-[#131314] border border-[#333537] rounded-xl flex items-start gap-2.5 text-[10px] text-[#9aa0a6] leading-relaxed">
          <ShieldAlert className="h-4 w-4 text-[#8ab4f8] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-gray-300 block mb-0.5">Parámetros Dinámicos</span>
            Los ajustes se guardan automáticamente para este chat y se aplican en tiempo real en la siguiente respuesta que envíes.
          </div>
        </div>

      </div>
    </div>
  );
}

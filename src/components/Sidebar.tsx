import { useState } from "react";
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  SlidersHorizontal,
  Bot,
  Menu,
  ChevronLeft,
  Settings
} from "lucide-react";
import { ChatSession } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onToggleSettings: () => void;
  isSettingsOpen: boolean;
}

export default function Sidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onRenameSession,
  isSidebarOpen,
  setSidebarOpen,
  onToggleSettings,
  isSettingsOpen,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const startEditing = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const saveRename = (id: string) => {
    if (editTitle.trim() !== "") {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  // Group sessions by date groups (Hoy, Ayer, Previo)
  const getGroupedSessions = () => {
    const today: ChatSession[] = [];
    const yesterday: ChatSession[] = [];
    const older: ChatSession[] = [];

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    sessions.forEach((s) => {
      const date = new Date(s.updatedAt);
      const diffTime = now.getTime() - date.getTime();

      if (diffTime < oneDay && date.getDate() === now.getDate()) {
        today.push(s);
      } else if (diffTime < 2 * oneDay && date.getDate() === now.getDate() - 1) {
        yesterday.push(s);
      } else {
        older.push(s);
      }
    });

    return { today, yesterday, older };
  };

  const groups = getGroupedSessions();

  const renderGroup = (title: string, list: ChatSession[]) => {
    if (list.length === 0) return null;
    return (
      <div className="mb-6" id={`group-${title.toLowerCase().replace(/\s/g, "-")}`}>
        <h3 className="px-3 mb-2 text-xs font-semibold text-[#9aa0a6] tracking-wider uppercase">
          {title}
        </h3>
        <div className="space-y-1">
          {list.map((session) => {
            const isSelected = session.id === currentSessionId;
            const isEditing = session.id === editingId;

            return (
              <motion.div
                key={session.id}
                id={`session-item-${session.id}`}
                layoutId={`session-${session.id}`}
                className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? "bg-[#2d2f31] text-white font-medium shadow-sm" 
                    : "text-[#c4c7c5] hover:bg-[#2d2f31] hover:text-white"
                }`}
                onClick={() => !isEditing && onSelectSession(session.id)}
              >
                <div className="flex items-center min-w-0 flex-1 gap-2.5">
                  <MessageSquare className={`h-4 w-4 shrink-0 ${isSelected ? "text-[#8ab4f8]" : "text-[#9aa0a6]"}`} />
                  {isEditing ? (
                    <input
                      type="text"
                      className="bg-[#333537] text-white px-1.5 py-0.5 rounded text-xs w-full focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveRename(session.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                    />
                  ) : (
                    <span className="truncate text-gray-200 group-hover:text-white">
                      {session.title || "Chat de Gemini"}
                    </span>
                  )}
                </div>

                {/* Session Actions */}
                <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isEditing ? (
                    <>
                      <button
                        title="Guardar"
                        id={`btn-save-rename-${session.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          saveRename(session.id);
                        }}
                        className="p-1 hover:bg-[#4a4d51] rounded text-emerald-400 transition"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        title="Cancelar"
                        id={`btn-cancel-rename-${session.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(null);
                        }}
                        className="p-1 hover:bg-[#4a4d51] rounded text-rose-400 transition"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        title="Renombrar chat"
                        id={`btn-edit-${session.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(session.id, session.title);
                        }}
                        className="p-1 hover:bg-[#333537] rounded text-gray-400 hover:text-white transition"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        title="Borrar chat"
                        id={`btn-delete-${session.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="p-1 hover:bg-[#333537] rounded text-gray-400 hover:text-rose-400 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Toggle floating menu when sidebar is collapsed */}
      {!isSidebarOpen && (
        <button
          id="btn-sidebar-expand-floating"
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-40 p-2.5 bg-[#1e1f20] hover:bg-[#282a2d] border border-[#3c4043] text-gray-200 rounded-full shadow-lg transition"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* Sidebar Container */}
      <div
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-30 flex flex-col w-[260px] bg-[#1e1f20] border-r border-[#333537] transition-transform duration-300 transform lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:w-[260px] lg:shrink-0`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 min-h-[64px] border-b border-[#333537]/40">
          <div className="flex items-center space-x-2">
            <Bot className="h-5.5 w-5.5 text-[#8ab4f8] shrink-0" />
            <span className="font-display font-semibold text-base text-white tracking-tight">
              Gemini Playground
            </span>
          </div>
          <button
            id="btn-sidebar-collapse"
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 hover:bg-[#333537] text-[#9aa0a6] hover:text-white rounded-lg transition"
            title="Contraer menú"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Action button: Nuevo Chat */}
        <div className="p-4">
          <button
            id="btn-new-chat"
            onClick={() => {
              onCreateSession();
              // Auto collapse sidebar on mobile
              if (window.innerWidth < 1024) {
                setSidebarOpen(false);
              }
            }}
            className="flex items-center justify-center gap-3 bg-[#333537] hover:bg-[#3d3f42] text-white px-4 py-3 rounded-full w-full transition-colors text-sm font-medium shadow-sm group cursor-pointer"
          >
            <Plus className="w-5 h-5 text-[#8ab4f8] shrink-0 transition-transform group-hover:scale-110" />
            <span>Nuevo chat</span>
          </button>
        </div>

        {/* Chat List area */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-[#9aa0a6] text-xs font-medium">
              No hay chats guardados
            </div>
          ) : (
            <>
              {renderGroup("Recientes hoy", groups.today)}
              {renderGroup("Ayer", groups.yesterday)}
              {renderGroup("Anteriores", groups.older)}
            </>
          )}
        </div>

        {/* Sidebar Bottom Actions */}
        <div className="p-4 border-t border-[#333537] bg-[#1a1b1c]/40 space-y-4">
          
          {/* System status live indicator matching template design */}
          <div className="flex items-center gap-3 px-2 text-xs text-[#c4c7c5] font-sans">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span>Estado: Óptimo</span>
          </div>

          {/* Toggle Interactive Settings Slider */}
          <button
            id="btn-sidebar-toggle-settings"
            onClick={onToggleSettings}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition duration-200 cursor-pointer ${
              isSettingsOpen 
                ? "bg-[#2d2f31] text-[#8ab4f8] border border-[#8ab4f8]/20" 
                : "text-[#c4c7c5] hover:bg-[#2d2f31] hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className={`h-4 w-4 ${isSettingsOpen ? "text-[#8ab4f8]" : "text-[#9aa0a6]"}`} />
              <span className="font-medium">Parámetros del modelo</span>
            </div>
            <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
              isSettingsOpen ? "bg-[#8ab4f8]/10 text-[#8ab4f8]" : "bg-[#2d2f31] text-[#9aa0a6]"
            }`}>
              {isSettingsOpen ? "Abierto" : "Ajustar"}
            </span>
          </button>

          <div className="flex items-center justify-between px-2 pt-1 text-[9px] text-[#9aa0a6] font-mono opacity-80">
            <span>Servidor: Cloud Run</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          id="sidebar-backdrop"
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { 
  NotebookPen, 
  Search, 
  Plus, 
  Trash2, 
  FileText, 
  Save, 
  Check, 
  Clock,
  Sparkles
} from "lucide-react";

export default function NotesPage() {
  const { data: session } = useSession();

  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedNote, setSelectedNote] = useState<any>(null);
  
  // Editor values
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("Quick Note");

  // Save states
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const loadNotes = async (selectFirst = false) => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/notes?userId=${session.user.id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotes(data);
        if (selectFirst && data.length > 0) {
          handleSelectNote(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadNotes(true);
    }
  }, [session]);

  const handleSelectNote = (note: any) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setType(note.type);
    setSaveStatus("idle");
  };

  const handleCreateNote = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Daily Journal",
          content: "",
          type: "Daily Journal",
          userId: session.user.id
        })
      });

      if (res.ok) {
        const newNote = await res.json();
        await loadNotes(false);
        handleSelectNote(newNote);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Debounced auto-save triggers
  const executeAutoSave = useCallback(
    async (noteId: string, updatedTitle: string, updatedContent: string, updatedType: string) => {
      if (!session?.user?.id) return;
      setSaveStatus("saving");

      try {
        const res = await fetch("/api/notes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: noteId,
            title: updatedTitle,
            content: updatedContent,
            type: updatedType,
            userId: session.user.id
          })
        });

        if (res.ok) {
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 1500);
          
          // Refresh lists to sync titles without changing selection
          const listRes = await fetch(`/api/notes?userId=${session.user.id}`);
          const listData = await listRes.json();
          if (Array.isArray(listData)) {
            setNotes(listData);
          }
        }
      } catch (err) {
        console.error(err);
      }
    },
    [session]
  );

  // Trigger auto-save debounce timer
  useEffect(() => {
    if (!selectedNote) return;

    // Skip initial load triggers
    if (
      title === selectedNote.title &&
      content === selectedNote.content &&
      type === selectedNote.type
    ) {
      return;
    }

    const timer = setTimeout(() => {
      executeAutoSave(selectedNote.id, title, content, type);
    }, 1000); // 1-second auto save interval

    return () => clearTimeout(timer);
  }, [title, content, type, selectedNote, executeAutoSave]);

  const handleDelete = async (noteId: string) => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/notes?id=${noteId}&userId=${session.user.id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setSelectedNote(null);
        setTitle("");
        setContent("");
        await loadNotes(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest block mb-1">
            Logs & Mindset 📝
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight">Notes & Journal</h2>
          <p className="text-muted-foreground text-sm mt-1">Capture thoughts, ideas, and review logs instantly</p>
        </div>

        {/* Auto save badge indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground px-4 py-2 bg-secondary/30 border border-border/40 rounded-xl">
          <Clock className="w-3.5 h-3.5" />
          {saveStatus === "saving" && <span className="text-indigo-400">Auto-Saving changes...</span>}
          {saveStatus === "saved" && <span className="text-emerald-400">Changes Saved.</span>}
          {saveStatus === "idle" && <span>Editor ready.</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SIDEBAR FILE LISTS */}
        <div className={`glass-panel border border-border/40 rounded-3xl p-5 space-y-4 ${
          selectedNote ? "hidden lg:block" : "block"
        }`}>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Documents</span>
            <button
              onClick={handleCreateNote}
              className="p-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/15"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-secondary/35 border border-border rounded-xl text-xs placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
              placeholder="Search documents..."
            />
          </div>

          {/* Files List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <p className="text-xs text-center text-muted-foreground py-10">No notes found</p>
          ) : (
            <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1">
              {filteredNotes.map((n) => {
                const active = selectedNote?.id === n.id;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleSelectNote(n)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${active ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400 font-medium" : "bg-transparent border-transparent hover:bg-secondary/40 text-muted-foreground hover:text-foreground"}`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-4 h-4 shrink-0" />
                      <span className="text-xs truncate">{n.title}</span>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(n.id);
                      }}
                      className="p-1 rounded hover:bg-red-500/20 text-red-400/80 hover:text-red-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* EDITOR AREA */}
        <div className={`lg:col-span-2 glass-panel border border-border/40 rounded-3xl p-6 min-h-[500px] ${
          !selectedNote ? "hidden lg:block" : "block"
        }`}>
          {selectedNote ? (
            <div className="h-full flex flex-col space-y-4">
              
              {/* Back to documents on mobile */}
              <button 
                onClick={() => setSelectedNote(null)}
                className="lg:hidden w-fit px-3 py-1.5 rounded-lg bg-secondary/60 text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 mb-2"
              >
                &larr; Back to Documents
              </button>

              {/* Type toggle */}
              <div className="flex items-center gap-4">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="bg-secondary/35 border border-border rounded-xl text-xs font-semibold px-3 py-1.5 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="Daily Journal">Daily Journal</option>
                  <option value="Quick Note">Quick Note</option>
                  <option value="Custom Notes">Custom Notes</option>
                </select>
              </div>

              {/* Title editor */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent border-none focus:outline-none text-2xl font-bold placeholder-gray-600"
                placeholder="Title..."
              />

              <div className="h-px bg-border/40 w-full"></div>

              {/* Content text */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full flex-1 bg-transparent border-none focus:outline-none text-sm placeholder-gray-500 leading-relaxed resize-none min-h-[350px]"
                placeholder="Type your notes in here... Supports auto save."
              />

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground min-h-[400px]">
              <NotebookPen className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-sm font-medium">No document selected.</p>
              <button
                onClick={handleCreateNote}
                className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
              >
                Create note draft
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { X, Bell } from "lucide-react";

type Announcement = {
  title: string | null;
  text: string | null;
  active: boolean;
};

export function GlobalAnnouncement() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function fetchAnnouncement() {
      try {
        const res = await fetch("/api/announcement");
        const data = await res.json();
        if (data.active && data.text) {
          const lastSeen = localStorage.getItem(`announcement-${data.title || 'default'}`);
          if (!lastSeen) {
            setAnnouncement(data);
            setIsOpen(true);
          }
        }
      } catch (e) {
        console.error("Erro ao buscar aviso:", e);
      }
    }
    fetchAnnouncement();
  }, []);

  if (!announcement || !isOpen) return null;

  const handleClose = () => {
    localStorage.setItem(`announcement-${announcement.title || 'default'}`, 'seen');
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="ice-gradient p-6 text-white relative">
          <Bell className="mb-2" size={32} />
          <h2 className="text-2xl font-bold">{announcement.title || "Aviso Z-ice"}</h2>
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-8">
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            {announcement.text}
          </p>
          <button 
            onClick={handleClose}
            className="btn-primary w-full py-4 text-lg"
          >
            Entendi, obrigado!
          </button>
        </div>
      </div>
    </div>
  );
}

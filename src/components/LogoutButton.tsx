"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  if (!mounted) return <div className="h-10 w-24 bg-white/10 rounded-lg" />;

  return (
    <button onClick={logout} className="btn-outline text-sm flex items-center gap-1">
      <LogOut size={16} /> Sair
    </button>
  );
}

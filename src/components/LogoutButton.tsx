"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };
  return (
    <button onClick={logout} className="btn-outline text-sm flex items-center gap-1">
      <LogOut size={16} /> Sair
    </button>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function CustomerActions({ 
  customerId, 
  customerName, 
  currentPoints 
}: { 
  customerId: string; 
  customerName: string;
  currentPoints: number;
}) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-10 w-full bg-gray-50 rounded-lg animate-pulse" />;

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${customerId}`, { method: "DELETE" });
      if (res.ok) {
        setShowDeleteModal(false);
        router.refresh();
      } else {
        alert("Erro ao excluir usuário");
      }
    } catch (e) {
      alert("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPoints = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${customerId}/reset-points`, { method: "POST" });
      if (res.ok) {
        setShowResetModal(false);
        router.refresh();
      } else {
        alert("Erro ao zerar pontos");
      }
    } catch (e) {
      alert("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setShowResetModal(true)}
        className="flex-1 flex items-center justify-center gap-1 bg-orange-50 hover:bg-orange-100 text-orange-600 py-2 rounded-lg text-xs font-bold transition-colors"
        title="Zerar pontuação"
      >
        🔄 ZERAR PONTOS
      </button>
      <button
        onClick={() => setShowDeleteModal(true)}
        className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors"
        title="Excluir usuário"
      >
        🗑️
      </button>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <span className="text-3xl">⚠️</span>
              <h3 className="text-xl font-bold">Excluir Usuário?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir <strong>{customerName}</strong>? Esta ação é permanente e removerá todo o histórico.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 font-bold hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                NÃO
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                disabled={loading}
              >
                {loading ? "EXCLUINDO..." : "SIM, EXCLUIR"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Reset de Pontos */}
      {showResetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-orange-600 mb-4">
              <span className="text-3xl">🔄</span>
              <h3 className="text-xl font-bold">Zerar Pontos?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Deseja zerar os <strong>{currentPoints} pontos</strong> de <strong>{customerName}</strong>? Ele(a) começará do zero novamente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 font-bold hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                CANCELAR
              </button>
              <button
                onClick={handleResetPoints}
                className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
                disabled={loading}
              >
                {loading ? "ZERANDO..." : "SIM, ZERAR"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

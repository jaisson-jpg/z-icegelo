"use client";

import { useState } from "react";
import { FreezerTransferForm } from "./FreezerTransferForm";

type Lojista = { id: string; businessName: string };
type Freezer = {
  id: string;
  code: string;
  brand: string | null;
  location: string;
  address: string | null;
  notes: string | null;
  active: boolean;
  lojistaId: string;
};

export function FreezerList({
  freezers,
  lojistas,
}: {
  freezers: Freezer[];
  lojistas: Lojista[];
}) {
  const [editingFreezer, setEditingFreezer] = useState<Freezer | null>(null);

  return (
    <>
      <div className="mt-4 space-y-2">
        {freezers.length === 0 && (
          <p className="text-sm text-gray-400">Nenhum freezer alocado ainda.</p>
        )}
        {freezers.map((f) => (
          <div
            key={f.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[var(--zice-ice)] rounded-lg text-sm"
          >
            <div className="flex-1">
              <span>
                <strong>{f.code}</strong> — {f.location}
                {f.brand && ` (${f.brand})`}
              </span>
              <span className={`ml-3 ${f.active ? "text-green-600" : "text-gray-400"}`}>
                {f.active ? "Ativo" : "Inativo"}
              </span>
            </div>
            <button
              onClick={() => setEditingFreezer(f)}
              className="text-xs font-bold text-[var(--zice-dark)] bg-white border border-[var(--zice-medium)] px-3 py-1 rounded-lg hover:bg-[var(--zice-medium)] transition-colors"
            >
              🔄 Trocar / Editar
            </button>
          </div>
        ))}
      </div>

      {editingFreezer && (
        <FreezerTransferForm
          freezer={editingFreezer}
          lojistas={lojistas}
          onClose={() => setEditingFreezer(null)}
        />
      )}
    </>
  );
}

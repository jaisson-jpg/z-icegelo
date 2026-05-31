"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CheckCircle, X } from "lucide-react";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "info" | "success";
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Sim, confirmar",
  cancelLabel = "Não, cancelar",
  variant = "info",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const variants = {
    danger: {
      icon: <AlertCircle className="text-red-500" size={32} />,
      button: "bg-red-600 hover:bg-red-700 text-white shadow-red-200",
      bg: "bg-red-50",
    },
    info: {
      icon: <AlertCircle className="text-blue-500" size={32} />,
      button: "bg-[var(--zice-medium)] hover:bg-[var(--zice-dark)] text-white shadow-blue-200",
      bg: "bg-blue-50",
    },
    success: {
      icon: <CheckCircle className="text-green-500" size={32} />,
      button: "bg-green-600 hover:bg-green-700 text-white shadow-green-200",
      bg: "bg-green-50",
    },
  };

  const currentVariant = variants[variant];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className={`p-6 ${currentVariant.bg} flex items-center gap-4 border-b`}>
          <div className="bg-white p-2 rounded-2xl shadow-sm">
            {currentVariant.icon}
          </div>
          <h3 className="text-xl font-bold text-[var(--zice-dark)]">{title}</h3>
          <button 
            onClick={onCancel}
            className="ml-auto p-2 hover:bg-black/5 rounded-full transition-colors text-gray-400"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8">
          <p className="text-gray-600 leading-relaxed text-center text-lg">
            {message}
          </p>
        </div>

        <div className="p-6 bg-gray-50 flex flex-col sm:flex-row gap-3 border-t">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-200 transition-colors order-2 sm:order-1"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-6 py-3 rounded-2xl font-bold shadow-lg transition-all active:scale-95 order-1 sm:order-2 ${currentVariant.button}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Hook simplificado para usar o modal
export function useConfirm() {
  const [config, setConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "danger" | "info" | "success";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    variant: "info",
    onConfirm: () => {},
  });

  const confirm = (title: string, message: string, variant: "danger" | "info" | "success" = "info") => {
    return new Promise<boolean>((resolve) => {
      setConfig({
        isOpen: true,
        title,
        message,
        variant,
        onConfirm: () => {
          setConfig(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
      });
    });
  };

  const cancel = () => {
    setConfig(prev => ({ ...prev, isOpen: false }));
  };

  const ConfirmComponent = () => (
    <ConfirmModal
      isOpen={config.isOpen}
      title={config.title}
      message={config.message}
      variant={config.variant}
      onConfirm={config.onConfirm}
      onCancel={cancel}
    />
  );

  return { confirm, ConfirmComponent };
}

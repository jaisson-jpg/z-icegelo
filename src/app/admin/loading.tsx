export default function AdminLoading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 bg-gray-50/50 rounded-3xl">
      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-black uppercase tracking-tighter text-xs">
        Painel Administrativo
      </p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="w-full space-y-6">
      <div className="bg-sqrc-gray-800 rounded-lg p-6 shadow-lg border border-sqrc-gray-400">
        <h2 className="text-2xl font-bold text-sqrc-gray-100 mb-4">Dashboard Supervisor</h2>
        <p className="text-sqrc-gray-400">Resumen general del sistema y métricas clave.</p>
        {/* Aquí irán las métricas y gráficos */}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-sqrc-gray-800 p-4 rounded-lg border border-sqrc-gray-400">
          <h3 className="text-lg font-semibold text-sqrc-gray-100 mb-2">Tickets Activos</h3>
          <p className="text-2xl font-bold text-sqrc-primary-500">24</p>
        </div>
        <div className="bg-sqrc-gray-800 p-4 rounded-lg border border-sqrc-gray-400">
          <h3 className="text-lg font-semibold text-sqrc-gray-100 mb-2">Satisfacción</h3>
          <p className="text-2xl font-bold text-sqrc-secondary-500">4.2/5</p>
        </div>
        <div className="bg-sqrc-gray-800 p-4 rounded-lg border border-sqrc-gray-400">
          <h3 className="text-lg font-semibold text-sqrc-gray-100 mb-2">Agentes Online</h3>
          <p className="text-2xl font-bold text-sqrc-success-500">8</p>
        </div>
      </div>
    </div>
  );
}

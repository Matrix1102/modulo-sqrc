import { useState, useRef } from "react";
import { exportToCSV, exportToExcel, exportToJSON, type ExportColumn } from "../../utils/exportData";

// Tipo genérico para los datos de la tabla (se definirá después con las columnas reales)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LogEntry = Record<string, any>;

/**
 * Página de Logs del sistema.
 * Muestra una tabla con registros y un botón para exportar datos.
 * 
 * La exportación es ESCALABLE: funciona automáticamente con cualquier estructura de datos.
 * Cuando definas las columnas reales, solo necesitas actualizar `columns` y el tipo `LogEntry`.
 */
export default function LogsPage() {
  // Estado placeholder para los datos (se conectará al backend después)
  const [logs] = useState<LogEntry[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // ─────────────────────────────────────────────────────────────
  // CONFIGURACIÓN DE COLUMNAS (editar cuando sepas las columnas)
  // Si es undefined, exportará TODAS las columnas automáticamente
  // ─────────────────────────────────────────────────────────────
  const exportColumns: ExportColumn<LogEntry>[] | undefined = undefined;
  // Ejemplo cuando tengas las columnas definidas:
  // const exportColumns: ExportColumn<LogEntry>[] = [
  //   { key: 'id', header: 'ID' },
  //   { key: 'timestamp', header: 'Fecha', formatter: (v) => new Date(v as string).toLocaleString() },
  //   { key: 'level', header: 'Nivel' },
  //   { key: 'message', header: 'Mensaje' },
  //   { key: 'userId', header: 'Usuario' },
  // ];

  // Genera nombre de archivo con timestamp
  const getFilename = () => {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[T:]/g, '-');
    return `logs-${timestamp}`;
  };

  // Handlers de exportación
  const handleExportCSV = () => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      exportToCSV(logs, exportColumns, getFilename());
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      exportToExcel(logs, exportColumns, getFilename());
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = () => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      exportToJSON(logs, getFilename());
    } finally {
      setIsExporting(false);
    }
  };

  // Cerrar menú al hacer click fuera (manejado por el div padre)

  return (
    <div className="min-h-screen bg-light-100 p-6" onClick={() => showExportMenu && setShowExportMenu(false)}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-dark-900 mb-2">
          Logs del Sistema
        </h1>
        <p className="text-light-600">
          Registro de actividad y eventos del sistema
        </p>
      </div>

      {/* Barra de acciones */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* Filtros placeholder - se pueden agregar después */}
          <span className="text-sm text-light-600">
            {logs.length} registro(s) encontrado(s)
          </span>
        </div>

        {/* Botón de exportar con menú desplegable */}
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowExportMenu(!showExportMenu);
            }}
            disabled={isExporting || logs.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Exportando...</span>
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                <span>Exportar Datos</span>
                <svg
                  className={`h-4 w-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>

          {/* Menú desplegable */}
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-light-300 py-1 z-10">
              <button
                onClick={handleExportCSV}
                className="w-full px-4 py-2 text-left text-sm text-dark-700 hover:bg-light-100 flex items-center gap-2"
              >
                <span className="text-success-600">📄</span>
                Exportar como CSV
              </button>
              <button
                onClick={handleExportExcel}
                className="w-full px-4 py-2 text-left text-sm text-dark-700 hover:bg-light-100 flex items-center gap-2"
              >
                <span className="text-success-600">📊</span>
                Exportar como Excel
              </button>
              <button
                onClick={handleExportJSON}
                className="w-full px-4 py-2 text-left text-sm text-dark-700 hover:bg-light-100 flex items-center gap-2"
              >
                <span className="text-primary-600">📋</span>
                Exportar como JSON
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de logs */}
      <div className="bg-white rounded-xl border border-light-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-light-100 border-b border-light-300">
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-700 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-700 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-700 uppercase tracking-wider">
                  Nivel
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-700 uppercase tracking-wider">
                  Mensaje
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-700 uppercase tracking-wider">
                  Usuario
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-200">
              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-light-500"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <svg
                        className="h-12 w-12 text-light-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-sm">
                        No hay registros de logs disponibles
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-light-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 text-sm text-dark-800 font-mono">
                      {log.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-700">
                      {/* Fecha placeholder */}
                      -
                    </td>
                    <td className="px-6 py-4">
                      {/* Badge de nivel placeholder */}
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-light-200 text-dark-600">
                        INFO
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-700 max-w-md truncate">
                      {/* Mensaje placeholder */}
                      -
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-600">
                      {/* Usuario placeholder */}
                      -
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Paginación placeholder */}
        {logs.length > 0 && (
          <div className="px-6 py-4 bg-light-50 border-t border-light-200 flex items-center justify-between">
            <span className="text-sm text-light-600">
              Mostrando {logs.length} registros
            </span>
            <div className="flex items-center gap-2">
              {/* Botones de paginación placeholder */}
              <button
                disabled
                className="px-3 py-1.5 text-sm font-medium text-light-500 bg-white border border-light-300 rounded-md disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                disabled
                className="px-3 py-1.5 text-sm font-medium text-light-500 bg-white border border-light-300 rounded-md disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

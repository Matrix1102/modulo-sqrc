import { useState, useRef, useEffect, useCallback } from "react";
import { exportToCSV, exportToExcel, exportToJSON, type ExportColumn } from "../../utils/exportData";
import { 
  getLogs, 
  getErrorLogs,
  getErrorById,
  type AuditLog, 
  type ErrorLog,
  type LogLevel, 
  type LogCategory, 
  type LogsFilter,
  type ErrorLogsFilter 
} from "./services/logsService";

type TabType = 'audit' | 'errors';

/**
 * Página de Logs del sistema.
 * Muestra una tabla con registros de auditoría y errores con pestañas.
 */
export default function LogsPage() {
  // Tab activa
  const [activeTab, setActiveTab] = useState<TabType>('audit');

  // Estado para los datos de auditoría
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Estado para los errores
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [isLoadingErrors, setIsLoadingErrors] = useState(false);
  const [errorLogsError, setErrorLogsError] = useState<string | null>(null);
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [showErrorDetail, setShowErrorDetail] = useState(false);

  // Paginación auditoría
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 50;

  // Paginación errores
  const [errorCurrentPage, setErrorCurrentPage] = useState(0);
  const [errorTotalPages, setErrorTotalPages] = useState(0);
  const [errorTotalElements, setErrorTotalElements] = useState(0);

  // Filtros auditoría
  const [levelFilter, setLevelFilter] = useState<LogLevel | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<LogCategory | ''>('');
  const [searchFilter, setSearchFilter] = useState('');

  // Filtros errores
  const [errorExceptionFilter, setErrorExceptionFilter] = useState('');
  const [errorSearchFilter, setErrorSearchFilter] = useState('');

  // Configuración de columnas para exportación
  const exportColumns: ExportColumn<AuditLog>[] = [
    { key: 'id', header: 'ID' },
    { key: 'timestamp', header: 'Fecha', formatter: (v) => v ? new Date(v as string).toLocaleString('es-PE') : '-' },
    { key: 'level', header: 'Nivel' },
    { key: 'category', header: 'Categoría' },
    { key: 'action', header: 'Acción' },
    { key: 'httpMethod', header: 'Método HTTP' },
    { key: 'requestUri', header: 'Request URI' },
    { key: 'entityType', header: 'Tipo Entidad' },
    { key: 'entityId', header: 'ID Entidad' },
    { key: 'ipAddress', header: 'IP' },
    { key: 'responseStatus', header: 'Estado' },
    { key: 'durationMs', header: 'Duración (ms)' },
  ];

  // Cargar logs de auditoría
  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: LogsFilter = {
        page: currentPage,
        size: pageSize,
      };
      if (levelFilter) filters.level = levelFilter;
      if (categoryFilter) filters.category = categoryFilter;
      if (searchFilter) filters.search = searchFilter;

      const response = await getLogs(filters);
      setLogs(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Error al cargar los logs. Verifica la conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, levelFilter, categoryFilter, searchFilter]);

  // Cargar logs de errores
  const fetchErrorLogs = useCallback(async () => {
    setIsLoadingErrors(true);
    setErrorLogsError(null);
    try {
      const filters: ErrorLogsFilter = {
        page: errorCurrentPage,
        size: pageSize,
      };
      if (errorExceptionFilter) filters.exceptionType = errorExceptionFilter;
      if (errorSearchFilter) filters.search = errorSearchFilter;

      const response = await getErrorLogs(filters);
      setErrorLogs(response.content);
      setErrorTotalPages(response.totalPages);
      setErrorTotalElements(response.totalElements);
    } catch (err) {
      console.error('Error fetching error logs:', err);
      setErrorLogsError('Error al cargar los errores. Verifica la conexión con el servidor.');
    } finally {
      setIsLoadingErrors(false);
    }
  }, [errorCurrentPage, errorExceptionFilter, errorSearchFilter]);

  // Cargar detalle de un error
  const handleViewErrorDetail = async (errorLog: ErrorLog) => {
    try {
      const fullError = await getErrorById(errorLog.id);
      setSelectedError(fullError);
      setShowErrorDetail(true);
    } catch (err) {
      console.error('Error fetching error detail:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchLogs();
    } else {
      fetchErrorLogs();
    }
  }, [activeTab, fetchLogs, fetchErrorLogs]);

  // Resetear página cuando cambian filtros de auditoría
  useEffect(() => {
    setCurrentPage(0);
  }, [levelFilter, categoryFilter, searchFilter]);

  // Resetear página cuando cambian filtros de errores
  useEffect(() => {
    setErrorCurrentPage(0);
  }, [errorExceptionFilter, errorSearchFilter]);

  // Genera nombre de archivo con timestamp
  const getFilename = () => {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[T:]/g, '-');
    return `logs-${timestamp}`;
  };

  // Helpers para badges
  const getLevelBadgeColor = (level: LogLevel) => {
    switch (level) {
      case 'ERROR': return 'bg-red-100 text-red-700';
      case 'WARN': return 'bg-yellow-100 text-yellow-700';
      case 'INFO': return 'bg-blue-100 text-blue-700';
      case 'DEBUG': return 'bg-gray-100 text-gray-700';
      default: return 'bg-light-200 text-dark-600';
    }
  };

  const getCategoryBadgeColor = (category: LogCategory) => {
    const colors: Record<LogCategory, string> = {
      CLIENTE: 'bg-purple-100 text-purple-700',
      TICKET: 'bg-orange-100 text-orange-700',
      TICKET_WORKFLOW: 'bg-amber-100 text-amber-700',
      ENCUESTA: 'bg-teal-100 text-teal-700',
      ARTICULO: 'bg-indigo-100 text-indigo-700',
      REPORTE: 'bg-cyan-100 text-cyan-700',
      AUTH: 'bg-emerald-100 text-emerald-700',
      ERROR: 'bg-red-100 text-red-700',
      COMUNICACION: 'bg-pink-100 text-pink-700',
      INTEGRACION: 'bg-violet-100 text-violet-700',
    };
    return colors[category] || 'bg-light-200 text-dark-600';
  };

  // Handlers de exportación
  const handleExportCSV = () => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exportToCSV(logs as any, exportColumns as any, getFilename());
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exportToExcel(logs as any, exportColumns as any, getFilename());
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

      {/* Tabs */}
      <div className="flex border-b border-light-300 mb-6">
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-light-600 hover:text-dark-700 hover:border-light-400'
          }`}
        >
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Auditoría
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
              {totalElements}
            </span>
          </span>
        </button>
        <button
          onClick={() => setActiveTab('errors')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'errors'
              ? 'border-red-500 text-red-600'
              : 'border-transparent text-light-600 hover:text-dark-700 hover:border-light-400'
          }`}
        >
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Errores
            <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
              {errorTotalElements}
            </span>
          </span>
        </button>
      </div>

      {/* Contenido según tab activa */}
      {activeTab === 'audit' ? (
        <>
          {/* Barra de acciones - Auditoría */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              {/* Filtro por nivel */}
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as LogLevel | '')}
                className="px-3 py-2 text-sm border border-light-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos los niveles</option>
                <option value="INFO">INFO</option>
                <option value="WARN">WARN</option>
                <option value="ERROR">ERROR</option>
                <option value="DEBUG">DEBUG</option>
              </select>

              {/* Filtro por categoría */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as LogCategory | '')}
                className="px-3 py-2 text-sm border border-light-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todas las categorías</option>
                <option value="CLIENTE">Cliente</option>
                <option value="TICKET">Ticket</option>
                <option value="TICKET_WORKFLOW">Ticket Workflow</option>
                <option value="ENCUESTA">Encuesta</option>
                <option value="ARTICULO">Artículo</option>
                <option value="REPORTE">Reporte</option>
                <option value="AUTH">Autenticación</option>
                <option value="ERROR">Error</option>
                <option value="COMUNICACION">Comunicación</option>
                <option value="INTEGRACION">Integración</option>
              </select>

              {/* Búsqueda */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-light-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-48"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-light-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Botón refrescar */}
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="p-2 text-light-600 hover:text-primary-600 hover:bg-light-100 rounded-lg transition-colors"
            title="Refrescar"
          >
            <svg
              className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <span className="text-sm text-light-600">
            {totalElements} registro(s) encontrado(s)
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
        {/* Error state */}
        {error && (
          <div className="px-6 py-4 bg-red-50 border-b border-red-200 text-red-700 flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
            <button onClick={fetchLogs} className="ml-2 underline">Reintentar</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-light-100 border-b border-light-300">
                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-700 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-700 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-700 uppercase tracking-wider">
                  Nivel
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-700 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-700 uppercase tracking-wider">
                  Acción
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-700 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-700 uppercase tracking-wider">
                  Request URI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="animate-spin h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-sm text-light-600">Cargando logs...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-light-500">
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
                    <td className="px-4 py-3 text-sm text-dark-800 font-mono">
                      {log.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-700 whitespace-nowrap">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString('es-PE') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelBadgeColor(log.level)}`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeColor(log.category)}`}>
                        {log.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-700 max-w-xs truncate" title={log.action || ''}>
                      {log.action || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-600">
                      {log.httpMethod ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          log.httpMethod === 'GET' ? 'bg-blue-100 text-blue-700' :
                          log.httpMethod === 'POST' ? 'bg-green-100 text-green-700' :
                          log.httpMethod === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                          log.httpMethod === 'DELETE' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {log.httpMethod}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-600 font-mono text-xs max-w-xs truncate" title={log.requestUri || ''}>
                      {log.requestUri || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Paginación */}
        <div className="px-6 py-4 bg-light-50 border-t border-light-200 flex items-center justify-between">
          <span className="text-sm text-light-600">
            Página {currentPage + 1} de {Math.max(1, totalPages)} ({totalElements} registros)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0 || isLoading}
              className="px-3 py-1.5 text-sm font-medium text-dark-700 bg-white border border-light-300 rounded-md hover:bg-light-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage >= totalPages - 1 || isLoading}
              className="px-3 py-1.5 text-sm font-medium text-dark-700 bg-white border border-light-300 rounded-md hover:bg-light-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
        </>
      ) : (
        <>
          {/* Barra de acciones - Errores */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              {/* Filtro por tipo de excepción */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tipo de excepción..."
                  value={errorExceptionFilter}
                  onChange={(e) => setErrorExceptionFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-light-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-64"
                />
              </div>

              {/* Búsqueda */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar en errores..."
                  value={errorSearchFilter}
                  onChange={(e) => setErrorSearchFilter(e.target.value)}
                  className="pl-9 pr-3 py-2 text-sm border border-light-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-48"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-light-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Botón refrescar */}
              <button
                onClick={fetchErrorLogs}
                disabled={isLoadingErrors}
                className="p-2 text-light-600 hover:text-primary-600 hover:bg-light-100 rounded-lg transition-colors"
                title="Refrescar"
              >
                <svg
                  className={`h-5 w-5 ${isLoadingErrors ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              <span className="text-sm text-light-600">
                {errorTotalElements} error(es) encontrado(s)
              </span>
            </div>
          </div>

          {/* Tabla de errores */}
          <div className="bg-white rounded-xl border border-light-300 shadow-sm overflow-hidden">
            {/* Error state */}
            {errorLogsError && (
              <div className="px-6 py-4 bg-red-50 border-b border-red-200 text-red-700 flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errorLogsError}
                <button onClick={fetchErrorLogs} className="ml-2 underline">Reintentar</button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-light-100 border-b border-light-300">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-dark-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-dark-700 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-dark-700 uppercase tracking-wider">
                      Tipo Excepción
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-dark-700 uppercase tracking-wider">
                      Mensaje
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-dark-700 uppercase tracking-wider">
                      Método
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-dark-700 uppercase tracking-wider">
                      Request URI
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-dark-700 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-200">
                  {isLoadingErrors ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <svg className="animate-spin h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span className="text-sm text-light-600">Cargando errores...</span>
                        </div>
                      </td>
                    </tr>
                  ) : errorLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-light-500">
                        <div className="flex flex-col items-center gap-3">
                          <svg
                            className="h-12 w-12 text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-sm text-green-600 font-medium">
                            ¡Sin errores registrados!
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    errorLogs.map((errLog) => (
                      <tr
                        key={errLog.id}
                        className="hover:bg-light-50 transition-colors duration-150"
                      >
                        <td className="px-4 py-3 text-sm text-dark-800 font-mono">
                          {errLog.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-dark-700 whitespace-nowrap">
                          {errLog.timestamp ? new Date(errLog.timestamp).toLocaleString('es-PE') : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            {errLog.exceptionType?.split('.').pop() || 'Error'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-dark-700 max-w-xs truncate" title={errLog.message || ''}>
                          {errLog.message || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-dark-600">
                          {errLog.httpMethod ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              errLog.httpMethod === 'GET' ? 'bg-blue-100 text-blue-700' :
                              errLog.httpMethod === 'POST' ? 'bg-green-100 text-green-700' :
                              errLog.httpMethod === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                              errLog.httpMethod === 'DELETE' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {errLog.httpMethod}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-dark-600 font-mono text-xs max-w-xs truncate" title={errLog.requestUri || ''}>
                          {errLog.requestUri || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleViewErrorDetail(errLog)}
                            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                          >
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer / Paginación errores */}
            <div className="px-6 py-4 bg-light-50 border-t border-light-200 flex items-center justify-between">
              <span className="text-sm text-light-600">
                Página {errorCurrentPage + 1} de {Math.max(1, errorTotalPages)} ({errorTotalElements} errores)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setErrorCurrentPage(p => Math.max(0, p - 1))}
                  disabled={errorCurrentPage === 0 || isLoadingErrors}
                  className="px-3 py-1.5 text-sm font-medium text-dark-700 bg-white border border-light-300 rounded-md hover:bg-light-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setErrorCurrentPage(p => p + 1)}
                  disabled={errorCurrentPage >= errorTotalPages - 1 || isLoadingErrors}
                  className="px-3 py-1.5 text-sm font-medium text-dark-700 bg-white border border-light-300 rounded-md hover:bg-light-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal de detalle de error */}
      {showErrorDetail && selectedError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-light-200 flex items-center justify-between bg-red-50">
              <h3 className="text-lg font-semibold text-red-800 flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Detalle del Error #{selectedError.id}
              </h3>
              <button
                onClick={() => setShowErrorDetail(false)}
                className="text-light-500 hover:text-dark-700 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs font-medium text-light-500 uppercase">Fecha</label>
                  <p className="text-sm text-dark-800">
                    {selectedError.timestamp ? new Date(selectedError.timestamp).toLocaleString('es-PE') : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-light-500 uppercase">Tipo Excepción</label>
                  <p className="text-sm text-dark-800 font-mono">{selectedError.exceptionType || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-light-500 uppercase">Método HTTP</label>
                  <p className="text-sm text-dark-800">{selectedError.httpMethod || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-light-500 uppercase">Request URI</label>
                  <p className="text-sm text-dark-800 font-mono">{selectedError.requestUri || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-light-500 uppercase">Usuario</label>
                  <p className="text-sm text-dark-800">{selectedError.userName || '-'} (ID: {selectedError.userId || '-'})</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-light-500 uppercase">IP Address</label>
                  <p className="text-sm text-dark-800 font-mono">{selectedError.ipAddress || '-'}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="text-xs font-medium text-light-500 uppercase">Mensaje</label>
                <p className="text-sm text-dark-800 bg-red-50 p-3 rounded-lg border border-red-200 mt-1">
                  {selectedError.message || 'Sin mensaje'}
                </p>
              </div>

              {selectedError.requestBody && (
                <div className="mb-6">
                  <label className="text-xs font-medium text-light-500 uppercase">Request Body</label>
                  <pre className="text-xs text-dark-800 bg-light-100 p-3 rounded-lg border border-light-300 mt-1 overflow-x-auto">
                    {selectedError.requestBody}
                  </pre>
                </div>
              )}

              {selectedError.stackTrace && (
                <div>
                  <label className="text-xs font-medium text-light-500 uppercase">Stack Trace</label>
                  <pre className="text-xs text-dark-800 bg-dark-900 text-green-400 p-4 rounded-lg mt-1 overflow-x-auto max-h-64 overflow-y-auto font-mono">
                    {selectedError.stackTrace}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

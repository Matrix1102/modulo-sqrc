/**
 * Utilidad genérica para exportar datos a CSV.
 * Funciona con cualquier estructura de datos (columnas dinámicas).
 */

export interface ExportColumn<T> {
  /** Clave del campo en el objeto de datos */
  key: keyof T | string;
  /** Título que aparecerá en el header del CSV */
  header: string;
  /** Función opcional para formatear el valor */
  formatter?: (value: unknown, row: T) => string;
}

/**
 * Exporta datos a un archivo CSV descargable.
 * 
 * @param data - Array de objetos a exportar
 * @param columns - Definición de columnas (si no se provee, usa todas las keys del primer objeto)
 * @param filename - Nombre del archivo (sin extensión)
 * 
 * @example
 * // Uso básico (columnas automáticas)
 * exportToCSV(logs, undefined, 'logs-export');
 * 
 * @example
 * // Uso con columnas personalizadas
 * exportToCSV(logs, [
 *   { key: 'id', header: 'ID' },
 *   { key: 'fecha', header: 'Fecha', formatter: (v) => new Date(v).toLocaleString() },
 *   { key: 'nivel', header: 'Nivel' },
 * ], 'logs-export');
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns?: ExportColumn<T>[],
  filename: string = 'export'
): void {
  if (!data || data.length === 0) {
    console.warn('No hay datos para exportar');
    return;
  }

  // Si no se proveen columnas, generar automáticamente desde el primer objeto
  const exportColumns: ExportColumn<T>[] = columns ?? 
    Object.keys(data[0]).map((key) => ({
      key,
      header: formatHeader(key),
    }));

  // Generar header
  const headerRow = exportColumns.map((col) => escapeCSVValue(col.header)).join(',');

  // Generar filas de datos
  const dataRows = data.map((row) => {
    return exportColumns
      .map((col) => {
        const value = getNestedValue(row, col.key as string);
        const formattedValue = col.formatter 
          ? col.formatter(value, row) 
          : formatValue(value);
        return escapeCSVValue(formattedValue);
      })
      .join(',');
  });

  // Combinar todo
  const csvContent = [headerRow, ...dataRows].join('\n');

  // Crear y descargar archivo
  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Exporta datos a un archivo JSON descargable.
 */
export function exportToJSON<T>(
  data: T[],
  filename: string = 'export'
): void {
  if (!data || data.length === 0) {
    console.warn('No hay datos para exportar');
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
}

/**
 * Exporta datos a Excel (formato XLSX simple via CSV con BOM).
 * Nota: Para Excel real (.xlsx), considera usar una librería como xlsx o exceljs.
 */
export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  columns?: ExportColumn<T>[],
  filename: string = 'export'
): void {
  if (!data || data.length === 0) {
    console.warn('No hay datos para exportar');
    return;
  }

  const exportColumns: ExportColumn<T>[] = columns ?? 
    Object.keys(data[0]).map((key) => ({
      key,
      header: formatHeader(key),
    }));

  // Generar contenido con separador de tabulación para mejor compatibilidad con Excel
  const headerRow = exportColumns.map((col) => col.header).join('\t');

  const dataRows = data.map((row) => {
    return exportColumns
      .map((col) => {
        const value = getNestedValue(row, col.key as string);
        const formattedValue = col.formatter 
          ? col.formatter(value, row) 
          : formatValue(value);
        // Reemplazar tabs y newlines en el valor
        return formattedValue.replace(/[\t\n\r]/g, ' ');
      })
      .join('\t');
  });

  // BOM para que Excel reconozca UTF-8
  const BOM = '\uFEFF';
  const content = BOM + [headerRow, ...dataRows].join('\n');

  downloadFile(content, `${filename}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
}

// ─────────────────────────────────────────────────────────────
// Helpers internos
// ─────────────────────────────────────────────────────────────

function escapeCSVValue(value: string): string {
  // Si contiene comas, comillas o saltos de línea, envolver en comillas
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

function formatHeader(key: string): string {
  // Convierte camelCase o snake_case a título legible
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  // Soporta acceso a propiedades anidadas: 'user.name'
  return path.split('.').reduce((acc: unknown, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Liberar memoria
  URL.revokeObjectURL(url);
}

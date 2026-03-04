import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatFecha = (fecha) => {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-HN");
};

// ── Excel
export const exportarExcel = (datos, columnas, nombreArchivo) => {
  const filas = datos.map((row) => {
    const obj = {};
    columnas.forEach((col) => {
      obj[col.header] = col.accessor(row);
    });
    return obj;
  });

  const ws = XLSX.utils.json_to_sheet(filas);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reporte");

  // Ancho de columnas automático
  const anchos = columnas.map((col) => ({
    wch: Math.max(col.header.length, 15),
  }));
  ws["!cols"] = anchos;

  XLSX.writeFile(wb, `${nombreArchivo}.xlsx`);
};

// ── PDF
export const exportarPDF = (datos, columnas, titulo, nombreArchivo) => {
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Maderas y Suministros Oseguera S.A (MADEYSO) — Departamento de IT", 14, 15);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(titulo, 14, 23);
  doc.text(`Generado: ${new Date().toLocaleDateString("es-HN")}`, 14, 30);

  autoTable(doc, {
    startY: 35,
    head: [columnas.map((c) => c.header)],
    body: datos.map((row) => columnas.map((col) => col.accessor(row) || "—")),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: {
      fillColor: [24, 144, 255],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save(`${nombreArchivo}.pdf`);
};

// ── Definición de reportes
export const REPORTES = {
  equipos: {
    titulo: "Reporte de equipos",
    columnas: [
      { header: "Marca", accessor: (r) => r.marca },
      { header: "Modelo", accessor: (r) => r.modelo },
      { header: "Serie", accessor: (r) => r.serie },
      { header: "Procesador", accessor: (r) => r.procesador },
      { header: "RAM", accessor: (r) => r.ram },
      { header: "Estado", accessor: (r) => r.estado },
      { header: "Descripción", accessor: (r) => r.descripcion },
    ],
  },
  asignaciones: {
    titulo: "Reporte de asignaciones",
    columnas: [
      { header: "Colaborador", accessor: (r) => r.persona_nombre },
      { header: "Departamento", accessor: (r) => r.departamento },
      { header: "Equipo", accessor: (r) => `${r.marca} ${r.modelo}` },
      { header: "Serie", accessor: (r) => r.serie },
      {
        header: "Fecha asignación",
        accessor: (r) => formatFecha(r.fecha_asignacion),
      },
      {
        header: "Fecha devolución",
        accessor: (r) => formatFecha(r.fecha_devolucion),
      },
      { header: "Asignado por", accessor: (r) => r.asignado_por },
      { header: "Estado", accessor: (r) => (r.activa ? "Activa" : "Cerrada") },
    ],
  },
  equiposPorColaborador: {
    titulo: "Equipos por colaborador",
    columnas: [
      { header: "Colaborador", accessor: (r) => r.persona_nombre },
      { header: "Departamento", accessor: (r) => r.departamento },
      { header: "Equipo", accessor: (r) => `${r.marca} ${r.modelo}` },
      { header: "Serie", accessor: (r) => r.serie },
      {
        header: "Fecha asignación",
        accessor: (r) => formatFecha(r.fecha_asignacion),
      },
      { header: "Estado", accessor: (r) => (r.activa ? "Activa" : "Cerrada") },
    ],
  },
  sinDocumento: {
    titulo: "Equipos sin documento firmado",
    columnas: [
      { header: "Colaborador", accessor: (r) => r.persona_nombre },
      { header: "Departamento", accessor: (r) => r.departamento },
      { header: "Equipo", accessor: (r) => `${r.marca} ${r.modelo}` },
      { header: "Serie", accessor: (r) => r.serie },
      {
        header: "Fecha asignación",
        accessor: (r) => formatFecha(r.fecha_asignacion),
      },
      { header: "Asignado por", accessor: (r) => r.asignado_por },
    ],
  },
  historialPersona: {
    titulo: "Historial por persona",
    columnas: [
      { header: "Colaborador", accessor: (r) => r.persona_nombre },
      { header: "Departamento", accessor: (r) => r.departamento },
      { header: "Equipo", accessor: (r) => `${r.marca} ${r.modelo}` },
      { header: "Serie", accessor: (r) => r.serie },
      {
        header: "Fecha asignación",
        accessor: (r) => formatFecha(r.fecha_asignacion),
      },
      {
        header: "Fecha devolución",
        accessor: (r) => formatFecha(r.fecha_devolucion),
      },
      { header: "Estado", accessor: (r) => (r.activa ? "Activa" : "Cerrada") },
    ],
  },
  historialEquipo: {
    titulo: "Historial por equipo",
    columnas: [
      { header: "Equipo", accessor: (r) => `${r.marca} ${r.modelo}` },
      { header: "Serie", accessor: (r) => r.serie },
      { header: "Colaborador", accessor: (r) => r.persona_nombre },
      { header: "Departamento", accessor: (r) => r.departamento },
      {
        header: "Fecha asignación",
        accessor: (r) => formatFecha(r.fecha_asignacion),
      },
      {
        header: "Fecha devolución",
        accessor: (r) => formatFecha(r.fecha_devolucion),
      },
      { header: "Estado", accessor: (r) => (r.activa ? "Activa" : "Cerrada") },
    ],
  },
  historialUsuario: {
    titulo: "Historial por usuario",
    columnas: [
      { header: "Asignado por", accessor: (r) => r.asignado_por },
      { header: "Colaborador", accessor: (r) => r.persona_nombre },
      { header: "Departamento", accessor: (r) => r.departamento },
      { header: "Equipo", accessor: (r) => `${r.marca} ${r.modelo}` },
      { header: "Serie", accessor: (r) => r.serie },
      {
        header: "Fecha asignación",
        accessor: (r) => formatFecha(r.fecha_asignacion),
      },
      { header: "Estado", accessor: (r) => (r.activa ? "Activa" : "Cerrada") },
    ],
  },
};

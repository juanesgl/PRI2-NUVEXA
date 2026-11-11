/* =========================================================
   Nuvexa · Mock data shared by jobs, job-details and tracking
   Exposes window.NuvexaData
   ========================================================= */
(function () {
  'use strict';

  const CATEGORIES = {
    bodega: 'Bodega y logística',
    produccion: 'Producción',
    aseo: 'Aseo y mantenimiento',
    servicio: 'Servicio al cliente',
    construccion: 'Construcción',
    alimentos: 'Alimentos y bebidas',
  };

  const SHIFTS = { diurno: 'Diurno', nocturno: 'Nocturno', rotativo: 'Rotativo' };

  const JOBS = [
    {
      id: 'aux-bodega-funza', title: 'Auxiliar de bodega', company: 'Logística Andina S.A.S.', city: 'Funza',
      category: 'bodega', shift: 'rotativo', contract: 'Obra o labor', duration: '3 meses', salary: 1750000,
      openings: 12, postedDays: 1,
      summary: 'Apoyo en recepción, alistamiento y despacho de mercancía en centro de distribución de consumo masivo.',
      tasks: ['Recibir y verificar mercancía contra remisión', 'Alistar pedidos con terminal portátil', 'Cargar y descargar vehículos', 'Mantener el orden de la zona asignada'],
      requirements: ['Bachiller', '6 meses de experiencia en bodega', 'Disponibilidad para turnos rotativos', 'Curso de manipulación de cargas (deseable)'],
      benefits: ['Pago quincenal', 'Ruta desde Bogotá (Portal 80)', 'Casino subsidiado', 'Dotación completa'],
    },
    {
      id: 'operario-produccion-sibate', title: 'Operario de producción', company: 'Empaques del Sur', city: 'Sibaté',
      category: 'produccion', shift: 'rotativo', contract: 'Temporal', duration: '6 meses', salary: 1680000,
      openings: 20, postedDays: 2,
      summary: 'Operación de líneas de empaque flexible en planta certificada ISO 9001.',
      tasks: ['Alimentar y vigilar la línea de empaque', 'Hacer controles de calidad visuales', 'Registrar novedades de producción', 'Cumplir normas de seguridad industrial'],
      requirements: ['Bachiller', 'Experiencia en manufactura (deseable)', 'Disponibilidad 3 turnos'],
      benefits: ['Recargos nocturnos y dominicales', 'Transporte desde Soacha', 'Bonificación por asistencia'],
    },
    {
      id: 'aseo-clinica-bogota', title: 'Auxiliar de servicios generales', company: 'Clínica Santa Lucía', city: 'Bogotá',
      category: 'aseo', shift: 'diurno', contract: 'Obra o labor', duration: '4 meses', salary: 1450000,
      openings: 6, postedDays: 0,
      summary: 'Limpieza y desinfección de áreas hospitalarias siguiendo protocolos de bioseguridad.',
      tasks: ['Limpieza de habitaciones y áreas comunes', 'Manejo de residuos según protocolo', 'Reporte de daños e insumos faltantes'],
      requirements: ['Experiencia en aseo hospitalario de 6 meses', 'Curso de bioseguridad vigente', 'Esquema de vacunación completo'],
      benefits: ['Horario de lunes a sábado', 'Capacitación certificada', 'Pago quincenal'],
    },
    {
      id: 'asesor-punto-venta-chia', title: 'Asesor de punto de venta', company: 'Almacenes La 14', city: 'Chía',
      category: 'servicio', shift: 'diurno', contract: 'Temporal', duration: 'Temporada (2 meses)', salary: 1600000,
      openings: 15, postedDays: 3,
      summary: 'Atención al cliente, surtido y caja para la temporada de fin de año.',
      tasks: ['Asesorar a clientes en piso de venta', 'Surtir góndolas y revisar precios', 'Apoyar en caja en horas pico'],
      requirements: ['Bachiller', 'Experiencia en ventas o servicio al cliente', 'Buena actitud y comunicación'],
      benefits: ['Comisión por ventas', 'Descuento de empleado', 'Posibilidad de vinculación directa'],
    },
    {
      id: 'ayudante-obra-mosquera', title: 'Ayudante de obra', company: 'Constructora Altavista', city: 'Mosquera',
      category: 'construccion', shift: 'diurno', contract: 'Obra o labor', duration: '5 meses', salary: 1700000,
      openings: 10, postedDays: 4,
      summary: 'Apoyo en actividades de obra gris para proyecto de vivienda de interés social.',
      tasks: ['Preparar mezclas y transportar materiales', 'Apoyar a oficiales en mampostería', 'Mantener el orden y la limpieza de la obra'],
      requirements: ['Experiencia de 3 meses en obra', 'Certificado de trabajo en alturas (deseable)'],
      benefits: ['Almuerzo incluido', 'Elementos de protección personal', 'Pago semanal'],
    },
    {
      id: 'manipulador-alimentos-cota', title: 'Manipulador de alimentos', company: 'Comidas Express Cota', city: 'Cota',
      category: 'alimentos', shift: 'nocturno', contract: 'Temporal', duration: '3 meses', salary: 1720000,
      openings: 8, postedDays: 1,
      summary: 'Preparación y empaque de alimentos para aerolíneas en cocina industrial.',
      tasks: ['Preparar alimentos según ficha técnica', 'Empacar y rotular bandejas', 'Cumplir normas BPM'],
      requirements: ['Curso de manipulación de alimentos vigente', 'Experiencia en cocina industrial (deseable)'],
      benefits: ['Recargo nocturno', 'Alimentación en turno', 'Transporte nocturno'],
    },
    {
      id: 'montacarguista-tocancipa', title: 'Operador de montacargas', company: 'Bebidas de la Sabana', city: 'Tocancipá',
      category: 'bodega', shift: 'rotativo', contract: 'Obra o labor', duration: '6 meses', salary: 2100000,
      openings: 4, postedDays: 5,
      summary: 'Movimiento de estibas y cargue de camiones en planta embotelladora.',
      tasks: ['Operar montacargas eléctrico y a gas', 'Ubicar estibas en estantería selectiva', 'Hacer inspección preoperacional diaria'],
      requirements: ['Licencia de operador de montacargas vigente', '1 año de experiencia', 'Disponibilidad para turnos'],
      benefits: ['Salario por encima del promedio', 'Ruta desde Zipaquirá y Bogotá', 'Bonificación por cumplimiento'],
    },
    {
      id: 'empacador-cajica', title: 'Empacador de flores', company: 'Flores del Campo', city: 'Cajicá',
      category: 'produccion', shift: 'diurno', contract: 'Temporal', duration: 'Temporada San Valentín', salary: 1500000,
      openings: 40, postedDays: 2,
      summary: 'Clasificación y empaque de flor de exportación en poscosecha.',
      tasks: ['Clasificar tallos por calidad y longitud', 'Armar bouquets según especificación', 'Empacar cajas de exportación'],
      requirements: ['No requiere experiencia', 'Agilidad manual', 'Disponibilidad inmediata'],
      benefits: ['Capacitación pagada', 'Horas extra pagas', 'Transporte desde Zipaquirá'],
    },
  ];

  const formatCOP = (n) => '$' + n.toLocaleString('es-CO');

  const getJob = (id) => JOBS.find((j) => j.id === id);

  // "Logística Andina S.A.S." → "LA"; skips lowercase connectors like "del".
  const companyInitials = (company) =>
    company.split(/\s+/).filter((w) => /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]/.test(w)).slice(0, 2).map((w) => w[0]).join('');

  const postedLabel = (days) => (days === 0 ? 'Publicada hoy' : days === 1 ? 'Hace 1 día' : `Hace ${days} días`);

  /* ---------- Application progress ----------
     shortcut: stages advance on accelerated demo time (seconds, not hours) so a live
     presentation shows movement; replace `at` offsets with backend events in a real build. */
  const SLA_MS = 24 * 60 * 60 * 1000;
  const STAGES = [
    { key: 'received',   title: 'Postulación recibida',     desc: 'La empresa ya tiene tu hoja de vida.',                         at: 0 },
    { key: 'documents',  title: 'Documentos validados',     desc: 'Revisamos tu documento de identidad y tu foto.',             at: 20e3 },
    { key: 'references', title: 'Contactando referencias',  desc: 'Escribimos a tus referencias por WhatsApp y correo.',        at: 45e3 },
    { key: 'verified',   title: 'Referencias verificadas',  desc: 'Confirmamos con ellas tu cargo y tu experiencia.',                at: 90e3 },
    { key: 'response',   title: 'Respuesta de la empresa',  desc: 'Te avisaremos por WhatsApp y correo en cuanto responda.',     at: Infinity },
  ];

  function applicationProgress(app, now = Date.now()) {
    const elapsed = now - app.appliedAt;
    const doneCount = STAGES.filter((s) => elapsed >= s.at).length;
    return {
      current: Math.min(doneCount, STAGES.length - 1), // index of the stage in progress
      stages: STAGES.map((s, i) => ({ ...s, done: i < doneCount, doneAt: i < doneCount ? app.appliedAt + s.at : null })),
      deadline: app.appliedAt + SLA_MS,
      // one reference answers at 70s, both by the time the "verified" stage completes
      refsConfirmed: elapsed >= 90e3 ? 2 : elapsed >= 70e3 ? 1 : 0,
    };
  }

  window.NuvexaData = { CATEGORIES, SHIFTS, JOBS, getJob, formatCOP, companyInitials, postedLabel, STAGES, applicationProgress };
})();

/* ============================================================
   TRIAJENET — script.js
   Lógica de: (1) clasificación de pre-triage tipo Manchester
              (2) listado/orden de centros asistenciales
              (3) simulación de cola en vivo con localStorage
   ============================================================ */

(() => {
  "use strict";

  const STORAGE_KEY = "triajenet_estado_v1";

  /* ----------------------------------------------------------
     0. ESTADO PERSISTENTE
     ---------------------------------------------------------- */
  function cargarEstado() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function guardarEstado(estado) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  }

  let estado = cargarEstado();

  /* ----------------------------------------------------------
     1. CENTROS ASISTENCIALES (datos de ejemplo, Concepción/Biobío)
     ---------------------------------------------------------- */
  const CENTROS = [
    {
      id: "hgg",
      nombre: "Hospital Guillermo Grant Benavente",
      tipo: "hospital",
      distanciaKm: 3.2,
      esperaBaseMin: { rojo: 0, naranja: 8, amarillo: 45, verde: 110, azul: 140 },
      saturacion: 0.82,
    },
    {
      id: "sapu-omar",
      nombre: "SAPU Dr. Víctor Manuel Fernández",
      tipo: "sapu",
      distanciaKm: 1.8,
      esperaBaseMin: { rojo: 0, naranja: 12, amarillo: 35, verde: 70, azul: 90 },
      saturacion: 0.55,
    },
    {
      id: "clinica-biobio",
      nombre: "Clínica Bío Bío",
      tipo: "clinica",
      distanciaKm: 4.6,
      esperaBaseMin: { rojo: 0, naranja: 6, amarillo: 25, verde: 50, azul: 60 },
      saturacion: 0.4,
    },
    {
      id: "sapu-pedrodevaldivia",
      nombre: "SAPU Pedro de Valdivia",
      tipo: "sapu",
      distanciaKm: 2.5,
      esperaBaseMin: { rojo: 0, naranja: 10, amarillo: 40, verde: 85, azul: 100 },
      saturacion: 0.68,
    },
    {
      id: "hospital-traumatologico",
      nombre: "Hospital Traumatológico de Concepción",
      tipo: "hospital",
      distanciaKm: 5.1,
      esperaBaseMin: { rojo: 0, naranja: 9, amarillo: 38, verde: 95, azul: 120 },
      saturacion: 0.6,
    },
    {
      id: "clinica-sanagustin",
      nombre: "Clínica San Agustín",
      tipo: "clinica",
      distanciaKm: 6.0,
      esperaBaseMin: { rojo: 0, naranja: 7, amarillo: 22, verde: 45, azul: 55 },
      saturacion: 0.33,
    },
  ];

  const TAG_LABEL = { hospital: "Hospital", sapu: "SAPU", clinica: "Clínica privada" };

  /* ----------------------------------------------------------
     2. CATEGORÍAS DE TRIAGE (Manchester simplificado)
     ---------------------------------------------------------- */
  const CATEGORIAS = {
    rojo: {
      key: "rojo", nombre: "Resucitación", tiempoTexto: "Atención inmediata",
      desc: "Riesgo vital inmediato. Debes ser atendido sin espera. Si aún no estás en un centro de salud, considera llamar al 131 (SAMU).",
    },
    naranja: {
      key: "naranja", nombre: "Emergencia", tiempoTexto: "Hasta 10 minutos",
      desc: "Situación de alto riesgo que requiere evaluación médica muy pronto. Dirígete a un servicio de urgencia lo antes posible.",
    },
    amarillo: {
      key: "amarillo", nombre: "Urgencia", tiempoTexto: "Hasta 60 minutos",
      desc: "Tu cuadro requiere atención médica, pero puede esperar un tiempo acotado sin riesgo inmediato.",
    },
    verde: {
      key: "verde", nombre: "Urgencia menor", tiempoTexto: "Hasta 120 minutos",
      desc: "Tu situación no es de alto riesgo. Puedes esperar más tiempo, o evaluar atención en consultorio/box de menor complejidad.",
    },
    azul: {
      key: "azul", nombre: "No urgente", tiempoTexto: "Sin tiempo crítico",
      desc: "Tu cuadro no presenta señales de urgencia. Te recomendamos atención médica regular (consultorio, médico tratante) en lugar de un servicio de urgencia.",
    },
  };

  const ORDEN_CATS = ["rojo", "naranja", "amarillo", "verde", "azul"];

  /* ----------------------------------------------------------
     3. MOTOR DE CLASIFICACIÓN (simplificado, no es diagnóstico médico)
     ---------------------------------------------------------- */
  function clasificarTriage(datos) {
    const factores = [];
    let score = 0; // mayor score = mayor urgencia

    const signos = datos.signosAlarma || [];
    const SIGNOS_CRITICOS = ["perdida_conciencia", "dificultad_respirar", "sangrado_severo", "convulsion"];
    const SIGNOS_ALTOS = ["dolor_pecho", "confusion", "trauma_severo", "embarazo_riesgo"];

    signos.forEach((s) => {
      if (SIGNOS_CRITICOS.includes(s)) { score += 40; }
      else if (SIGNOS_ALTOS.includes(s)) { score += 28; }
    });
    if (signos.length) {
      factores.push(`${signos.length} signo(s) de alarma marcado(s)`);
    }

    // Dolor (0-10)
    const dolor = Number(datos.dolor || 0);
    if (dolor >= 8) { score += 25; factores.push("Dolor severo (8-10)"); }
    else if (dolor >= 5) { score += 12; factores.push("Dolor moderado (5-7)"); }
    else if (dolor >= 1) { score += 3; }

    // Signos vitales
    const fc = Number(datos.frecCardiaca);
    if (datos.frecCardiaca && (fc > 130 || fc < 40)) { score += 22; factores.push("Frecuencia cardíaca muy alterada"); }
    else if (datos.frecCardiaca && (fc > 110 || fc < 50)) { score += 10; factores.push("Frecuencia cardíaca alterada"); }

    const sat = Number(datos.saturacionO2);
    if (datos.saturacionO2 && sat < 90) { score += 35; factores.push("Saturación de O₂ crítica (<90%)"); }
    else if (datos.saturacionO2 && sat < 94) { score += 15; factores.push("Saturación de O₂ baja"); }

    const pas = Number(datos.presionSistolica);
    if (datos.presionSistolica && (pas < 90 || pas > 180)) { score += 18; factores.push("Presión arterial fuera de rango"); }

    const temp = Number(datos.temperatura);
    if (datos.temperatura && temp >= 39.5) { score += 12; factores.push("Fiebre alta (≥39.5°C)"); }

    // Inicio de síntomas: más reciente + score ya alto = más urgente
    if (datos.inicioSintomas === "menos1h" && score >= 20) { score += 8; factores.push("Inicio súbito (<1h)"); }

    // Edad de riesgo
    const edad = Number(datos.edad || 0);
    if (edad <= 1 || edad >= 75) { score += 8; factores.push(edad <= 1 ? "Lactante" : "Adulto mayor (≥75)"); }

    // Texto libre: heurística simple por palabras clave (no reemplaza juicio clínico)
    const texto = `${datos.sintomas || ""} ${datos.razonUrgencia || ""}`.toLowerCase();
    const PALABRAS_CRITICAS = ["no respira", "inconsciente", "no responde", "convulsion", "convulsión", "paro"];
    if (PALABRAS_CRITICAS.some((p) => texto.includes(p))) { score += 35; factores.push("Descripción sugiere riesgo vital"); }

    // --- Determinar categoría ---
    let cat;
    if (score >= 60) cat = "rojo";
    else if (score >= 38) cat = "naranja";
    else if (score >= 20) cat = "amarillo";
    else if (score >= 8) cat = "verde";
    else cat = "azul";

    if (!factores.length) factores.push("Sin signos de alarma relevantes reportados");

    return { categoria: cat, score, factores };
  }

  /* ----------------------------------------------------------
     4. NAVEGACIÓN ENTRE PANTALLAS
     ---------------------------------------------------------- */
  const screens = {
    1: document.getElementById("screen-triage"),
    2: document.getElementById("screen-centros"),
    3: document.getElementById("screen-cola"),
  };
  const stepButtons = document.querySelectorAll(".stepnav__item");

  function irAPaso(n) {
    Object.entries(screens).forEach(([key, el]) => {
      el.classList.toggle("is-visible", Number(key) === n);
    });
    stepButtons.forEach((btn) => {
      btn.classList.toggle("is-active", Number(btn.dataset.step) === n);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function habilitarPaso(n) {
    const btn = document.querySelector(`.stepnav__item[data-step="${n}"]`);
    if (btn) btn.disabled = false;
  }

  stepButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      irAPaso(Number(btn.dataset.step));
      if (Number(btn.dataset.step) === 2) renderCentros();
      if (Number(btn.dataset.step) === 3) actualizarCola(true);
    });
  });

  /* ----------------------------------------------------------
     5. FORMULARIO DE PRE-TRIAGE
     ---------------------------------------------------------- */
  const form = document.getElementById("form-triage");
  const dolorInput = document.getElementById("f-dolor");
  const dolorOut = document.getElementById("f-dolor-out");

  dolorInput.addEventListener("input", () => { dolorOut.textContent = dolorInput.value; });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const datos = {
      nombre: fd.get("nombre")?.trim(),
      rut: fd.get("rut")?.trim(),
      edad: fd.get("edad"),
      sexo: fd.get("sexo"),
      peso: fd.get("peso"),
      estatura: fd.get("estatura"),
      telefono: fd.get("telefono"),
      contactoEmergencia: fd.get("contactoEmergencia"),
      sintomas: fd.get("sintomas")?.trim(),
      razonUrgencia: fd.get("razonUrgencia")?.trim(),
      signosAlarma: fd.getAll("signoAlarma"),
      dolor: fd.get("dolor"),
      inicioSintomas: fd.get("inicioSintomas"),
      frecCardiaca: fd.get("frecCardiaca"),
      presionSistolica: fd.get("presionSistolica"),
      saturacionO2: fd.get("saturacionO2"),
      temperatura: fd.get("temperatura"),
      alergias: fd.get("alergias")?.trim(),
      antecedentes: fd.get("antecedentes")?.trim(),
    };

    if (!datos.nombre || !datos.rut || !datos.edad || !datos.sexo || !datos.peso || !datos.estatura || !datos.telefono || !datos.sintomas) {
      alert("Por favor completa los campos obligatorios marcados en el formulario (identificación y síntomas).");
      return;
    }

    const resultado = clasificarTriage(datos);

    estado.paciente = datos;
    estado.triage = resultado;
    estado.centroId = null;
    estado.cola = null;
    guardarEstado(estado);

    mostrarResultadoTriage(resultado);
    habilitarPaso(2);
  });

  function mostrarResultadoTriage(resultado) {
    const panel = document.getElementById("triage-result");
    const cat = CATEGORIAS[resultado.categoria];

    panel.hidden = false;
    panel.className = `result-panel cat-${resultado.categoria}`;
    document.getElementById("result-cat").textContent = cat.nombre.toUpperCase();
    document.getElementById("result-time").textContent = cat.tiempoTexto;
    document.getElementById("result-title").textContent = `Categoría: ${cat.nombre}`;
    document.getElementById("result-desc").textContent = cat.desc;

    const factoresEl = document.getElementById("result-factors");
    factoresEl.innerHTML = "";
    resultado.factores.forEach((f) => {
      const li = document.createElement("li");
      li.textContent = f;
      factoresEl.appendChild(li);
    });

    panel.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  document.getElementById("btn-go-centros").addEventListener("click", () => {
    irAPaso(2);
    renderCentros();
  });

  // Si ya había un resultado guardado (recarga de página), lo mostramos
  if (estado.triage) {
    mostrarResultadoTriage(estado.triage);
    habilitarPaso(2);
    if (estado.cola) habilitarPaso(3);
  }

  /* ----------------------------------------------------------
     6. PANTALLA 2 — CENTROS ASISTENCIALES
     ---------------------------------------------------------- */
  const sortSelect = document.getElementById("sort-centros");
  const filterTipo = document.getElementById("filter-tipo");
  const centrosListEl = document.getElementById("centros-list");
  const chipPrioridad = document.getElementById("centros-prioridad-chip");

  function esperaParaCentro(centro, categoria) {
    const base = centro.esperaBaseMin[categoria] ?? 60;
    // saturación amplifica la espera (excepto categorías críticas, que casi no esperan)
    const factorSaturacion = categoria === "rojo" ? 1 : 1 + centro.saturacion * 0.8;
    return Math.round(base * factorSaturacion);
  }

  function renderCentros() {
    const categoria = estado.triage ? estado.triage.categoria : "amarillo";
    chipPrioridad.textContent = CATEGORIAS[categoria].nombre;
    chipPrioridad.className = `chip chip--inline cat-${categoria}`;

    let lista = CENTROS.map((c) => ({
      ...c,
      esperaMin: esperaParaCentro(c, categoria),
    }));

    const tipo = filterTipo.value;
    if (tipo !== "todos") lista = lista.filter((c) => c.tipo === tipo);

    const orden = sortSelect.value;
    if (orden === "espera") lista.sort((a, b) => a.esperaMin - b.esperaMin);
    else if (orden === "distancia") lista.sort((a, b) => a.distanciaKm - b.distanciaKm);
    else {
      // "recomendado": balance entre espera y distancia (espera pesa más para categorías urgentes)
      const pesoEspera = categoria === "rojo" || categoria === "naranja" ? 0.85 : 0.6;
      lista.sort((a, b) => {
        const scoreA = a.esperaMin * pesoEspera + a.distanciaKm * (1 - pesoEspera) * 15;
        const scoreB = b.esperaMin * pesoEspera + b.distanciaKm * (1 - pesoEspera) * 15;
        return scoreA - scoreB;
      });
    }

    centrosListEl.innerHTML = "";
    lista.forEach((centro, idx) => {
      const card = document.createElement("article");
      card.className = "centro-card";
      if (estado.centroId === centro.id) card.classList.add("is-selected");

      const esperaClass = centro.esperaMin <= 15 ? "is-good" : centro.esperaMin <= 50 ? "is-warn" : "is-bad";
      const satPct = Math.round(centro.saturacion * 100);
      const satClass = centro.saturacion >= 0.75 ? "is-bad" : centro.saturacion >= 0.55 ? "is-warn" : "";

      card.innerHTML = `
        <span class="centro-card__rank">${String(idx + 1).padStart(2, "0")}</span>
        <div class="centro-card__main">
          <span class="centro-card__name">${centro.nombre}</span>
          <div class="centro-card__tags">
            <span class="tag tag--${centro.tipo}">${TAG_LABEL[centro.tipo]}</span>
          </div>
        </div>
        <div class="centro-card__stat">
          <span class="centro-card__stat-label">Distancia</span>
          <span class="centro-card__stat-value">${centro.distanciaKm.toFixed(1)} km</span>
        </div>
        <div class="centro-card__stat">
          <span class="centro-card__stat-label">Espera estimada</span>
          <span class="centro-card__stat-value ${esperaClass}">${centro.esperaMin} min</span>
          <span class="centro-card__satbar" title="Ocupación actual del centro">
            <span class="centro-card__satbar-track"><span class="centro-card__satbar-fill ${satClass}" style="width:${satPct}%"></span></span>
            <span class="centro-card__satbar-pct">${satPct}%</span>
          </span>
        </div>
        <div class="centro-card__cta">
          <button type="button" class="btn ${estado.centroId === centro.id ? "btn--ghost" : "btn--primary"}" data-centro="${centro.id}">
            ${estado.centroId === centro.id ? "Centro elegido ✓" : "Elegir este centro"}
          </button>
        </div>
      `;
      centrosListEl.appendChild(card);
    });

    centrosListEl.querySelectorAll("[data-centro]").forEach((btn) => {
      btn.addEventListener("click", () => seleccionarCentro(btn.dataset.centro));
    });
  }

  function seleccionarCentro(centroId) {
    const centro = CENTROS.find((c) => c.id === centroId);
    if (!centro) return;

    const categoria = estado.triage ? estado.triage.categoria : "amarillo";
    const esperaMin = esperaParaCentro(centro, categoria);

    // Generar una posición de cola simulada y razonable según categoría
    const personasAntesBase = {
      rojo: 0, naranja: Math.floor(Math.random() * 2), amarillo: 3 + Math.floor(Math.random() * 5),
      verde: 6 + Math.floor(Math.random() * 8), azul: 9 + Math.floor(Math.random() * 10),
    };
    const personasAntes = personasAntesBase[categoria] ?? 5;

    estado.centroId = centroId;
    estado.cola = {
      centroNombre: centro.nombre,
      categoria,
      personasAntesInicial: personasAntes,
      personasAntes,
      tiempoRestanteInicialMin: esperaMin,
      tiempoRestanteMin: esperaMin,
      numeroOrden: 100 + Math.floor(Math.random() * 800),
      horaInicio: Date.now(),
      eventos: [
        { texto: "Pre-triage completado", estado: "done" },
        { texto: `Te inscribiste en ${centro.nombre}`, estado: "done" },
        { texto: "Esperando llamado a box de atención", estado: "current" },
        { texto: "Atención médica", estado: "pending" },
      ],
    };
    guardarEstado(estado);

    renderCentros();
    habilitarPaso(3);
    irAPaso(3);
    actualizarCola(true);
    iniciarTickerCola();
  }

  sortSelect.addEventListener("change", renderCentros);
  filterTipo.addEventListener("change", renderCentros);

  /* ----------------------------------------------------------
     7. PANTALLA 3 — COLA EN VIVO
     ---------------------------------------------------------- */
  const RING_CIRC = 2 * Math.PI * 86; // ≈ 540, debe calzar con stroke-dasharray en CSS

  let tickerId = null;

  function actualizarCola(forzarRender) {
    if (!estado.cola) return;

    const cola = estado.cola;
    const minutosTranscurridos = (Date.now() - cola.horaInicio) / 60000;

    // El tiempo restante baja con el tiempo real transcurrido (simulado)
    const tiempoRestante = Math.max(0, Math.round(cola.tiempoRestanteInicialMin - minutosTranscurridos));
    // Las personas antes bajan proporcionalmente al tiempo restante
    const proporcion = cola.tiempoRestanteInicialMin > 0
      ? tiempoRestante / cola.tiempoRestanteInicialMin
      : 0;
    const personasAntes = Math.round(cola.personasAntesInicial * proporcion);

    cola.tiempoRestanteMin = tiempoRestante;
    cola.personasAntes = personasAntes;

    if (personasAntes <= 0 && cola.eventos[2].estado === "current") {
      cola.eventos[2].estado = "done";
      cola.eventos[3].estado = "current";
    }

    guardarEstado(estado);

    // --- Render ---
    document.getElementById("cola-personas-antes").textContent = personasAntes;
    document.getElementById("cola-tiempo-restante").textContent =
      tiempoRestante <= 0 ? "Eres el próximo" : `${tiempoRestante} min`;
    document.getElementById("cola-categoria").textContent = CATEGORIAS[cola.categoria].nombre;
    document.getElementById("cola-centro").textContent = cola.centroNombre;
    document.getElementById("cola-numero").textContent = `#${cola.numeroOrden}`;

    const ring = document.getElementById("ring-fg");
    const avance = cola.personasAntesInicial > 0 ? 1 - personasAntes / cola.personasAntesInicial : 1;
    const offset = RING_CIRC - avance * RING_CIRC;
    ring.style.strokeDashoffset = String(Math.max(0, offset));

    const coloresPorCat = { rojo: "var(--rojo)", naranja: "var(--naranja)", amarillo: "var(--amarillo)", verde: "var(--verde)", azul: "var(--azul)" };
    ring.style.stroke = coloresPorCat[cola.categoria] || "var(--teal-600)";

    if (forzarRender) renderTimeline();
  }

  function renderTimeline() {
    const cola = estado.cola;
    if (!cola) return;
    const ul = document.getElementById("timeline-list");
    ul.innerHTML = "";
    const horaBase = new Date(cola.horaInicio);

    cola.eventos.forEach((ev, idx) => {
      const li = document.createElement("li");
      li.className = ev.estado === "done" ? "is-done" : ev.estado === "current" ? "is-current" : "";
      const hora = new Date(horaBase.getTime() + idx * 60000 * 2);
      li.innerHTML = `<strong>${ev.texto}</strong><time>${hora.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}</time>`;
      ul.appendChild(li);
    });
  }

  function iniciarTickerCola() {
    if (tickerId) clearInterval(tickerId);
    tickerId = setInterval(() => actualizarCola(true), 5000);
  }

  document.getElementById("btn-salir-fila").addEventListener("click", () => {
    if (!confirm("¿Seguro que quieres salir de la fila? Perderás tu posición actual.")) return;
    estado.cola = null;
    estado.centroId = null;
    guardarEstado(estado);
    if (tickerId) clearInterval(tickerId);
    document.querySelector('.stepnav__item[data-step="3"]').disabled = true;
    irAPaso(2);
    renderCentros();
  });

  // Si ya hay una cola guardada (recarga de página), restauramos y
  // llevamos directo a esa pantalla, ya que el usuario sigue esperando.
  if (estado.cola) {
    actualizarCola(true);
    iniciarTickerCola();
    irAPaso(3);
  }

  /* ----------------------------------------------------------
     8. PANEL ADMINISTRADOR (vista hospital / gestión de cola)
     ---------------------------------------------------------- */
  const SLA_MIN = { rojo: 0, naranja: 10, amarillo: 60, verde: 120, azul: null };
  const COLOR_VAR = { rojo: "var(--rojo)", naranja: "var(--naranja)", amarillo: "var(--amarillo)", verde: "var(--verde)", azul: "var(--azul)" };

  const ADMIN = {
    centro: "Hospital Guillermo Grant Benavente",
    atendidosHoy: 142,
    boxesTotales: 8,
    camillasTotales: 10,
    camillasOcupadas: 7,
    enfermerasTurno: 5,
    enfermerasRecomendadas: 6,
    medicosTurno: 4,
    medicosRecomendados: 4,
    tendenciaHoras: [
      { hora: "08:00", min: 18 }, { hora: "09:00", min: 24 }, { hora: "10:00", min: 31 },
      { hora: "11:00", min: 39 }, { hora: "12:00", min: 52 }, { hora: "13:00", min: 61 },
      { hora: "14:00", min: 58 }, { hora: "15:00", min: 65 }, { hora: "16:00", min: 70 },
      { hora: "17:00", min: 64 }, { hora: "18:00", min: 57 },
    ],
    pacientes: [
      { id: 1,  nombre: "Rodrigo Iturra",     edad: 58, categoria: "rojo",     estado: "en_box",    box: "Reanimación 1", llegadaHaceMin: 2 },
      { id: 2,  nombre: "Marcela Sepúlveda",   edad: 66, categoria: "naranja",  estado: "en_box",    box: "Box 2",  llegadaHaceMin: 6 },
      { id: 3,  nombre: "Benjamín Toro",       edad: 34, categoria: "naranja",  estado: "en_box",    box: "Box 5",  llegadaHaceMin: 3 },
      { id: 4,  nombre: "Antonia Reyes",       edad: 29, categoria: "naranja",  estado: "esperando", box: null,     llegadaHaceMin: 14 },
      { id: 5,  nombre: "Carlos Huenchullán",  edad: 71, categoria: "amarillo", estado: "en_box",    box: "Box 1",  llegadaHaceMin: 20 },
      { id: 6,  nombre: "Javiera Molina",      edad: 45, categoria: "amarillo", estado: "en_box",    box: "Box 4",  llegadaHaceMin: 35 },
      { id: 7,  nombre: "Francisco Bravo",     edad: 8,  categoria: "amarillo", estado: "esperando", box: null,     llegadaHaceMin: 8 },
      { id: 8,  nombre: "Camila Ortiz",        edad: 52, categoria: "amarillo", estado: "esperando", box: null,     llegadaHaceMin: 22 },
      { id: 9,  nombre: "Sebastián Paillao",   edad: 63, categoria: "amarillo", estado: "esperando", box: null,     llegadaHaceMin: 41 },
      { id: 10, nombre: "Valentina Muñoz",     edad: 19, categoria: "amarillo", estado: "esperando", box: null,     llegadaHaceMin: 55 },
      { id: 11, nombre: "Pedro Contreras",     edad: 77, categoria: "amarillo", estado: "esperando", box: null,     llegadaHaceMin: 68 },
      { id: 12, nombre: "Isidora Vergara",     edad: 33, categoria: "amarillo", estado: "esperando", box: null,     llegadaHaceMin: 12 },
      { id: 13, nombre: "Matías Cid",          edad: 40, categoria: "amarillo", estado: "esperando", box: null,     llegadaHaceMin: 30 },
      { id: 14, nombre: "Rosa Elvira Salinas", edad: 82, categoria: "verde",    estado: "en_box",    box: "Box 3",  llegadaHaceMin: 50 },
      { id: 15, nombre: "Ignacio Sandoval",    edad: 27, categoria: "verde",    estado: "esperando", box: null,     llegadaHaceMin: 25 },
      { id: 16, nombre: "Fernanda Mardones",   edad: 55, categoria: "verde",    estado: "esperando", box: null,     llegadaHaceMin: 60 },
      { id: 17, nombre: "Diego Villalobos",    edad: 15, categoria: "verde",    estado: "esperando", box: null,     llegadaHaceMin: 88 },
      { id: 18, nombre: "Catalina Fuentes",    edad: 48, categoria: "verde",    estado: "esperando", box: null,     llegadaHaceMin: 105 },
      { id: 19, nombre: "Tomás Aguayo",        edad: 90, categoria: "verde",    estado: "esperando", box: null,     llegadaHaceMin: 128 },
      { id: 20, nombre: "Josefina Riquelme",   edad: 36, categoria: "verde",    estado: "esperando", box: null,     llegadaHaceMin: 40 },
      { id: 21, nombre: "Álvaro Concha",       edad: 61, categoria: "verde",    estado: "esperando", box: null,     llegadaHaceMin: 70 },
      { id: 22, nombre: "Daniela Yáñez",       edad: 24, categoria: "azul",     estado: "esperando", box: null,     llegadaHaceMin: 45 },
      { id: 23, nombre: "Nicolás Barría",      edad: 5,  categoria: "azul",     estado: "esperando", box: null,     llegadaHaceMin: 90 },
      { id: 24, nombre: "Constanza Painemal",  edad: 69, categoria: "azul",     estado: "esperando", box: null,     llegadaHaceMin: 150 },
    ],
  };
  ADMIN.pacientes.forEach((p) => { p.horaLlegada = Date.now() - p.llegadaHaceMin * 60000; });

  const screenAdmin = document.getElementById("screen-admin");
  const adminFiltro = document.getElementById("admin-filtro-categoria");
  let adminTickerId = null;

  function minutosDeEspera(p) { return Math.round((Date.now() - p.horaLlegada) / 60000); }

  function esAlerta(p) {
    if (p.estado !== "esperando") return false;
    const sla = SLA_MIN[p.categoria];
    if (sla === null || sla === undefined) return false;
    return minutosDeEspera(p) > sla;
  }

  function boxLibre() {
    const usados = new Set(ADMIN.pacientes.filter((p) => p.estado === "en_box").map((p) => p.box));
    for (let i = 1; i <= ADMIN.boxesTotales; i++) {
      const nombreBox = `Box ${i}`;
      if (!usados.has(nombreBox)) return nombreBox;
    }
    return null;
  }

  function llamarPaciente(id) {
    const p = ADMIN.pacientes.find((x) => x.id === id);
    if (!p) return;
    const box = boxLibre();
    if (!box) { alert("No hay boxes disponibles en este momento. Libera un box antes de llamar a un nuevo paciente."); return; }
    p.estado = "en_box";
    p.box = box;
    renderAdmin();
  }

  function finalizarAtencion(id) {
    const idx = ADMIN.pacientes.findIndex((x) => x.id === id);
    if (idx === -1) return;
    ADMIN.pacientes.splice(idx, 1);
    ADMIN.atendidosHoy += 1;
    renderAdmin();
  }

  function renderAdminKPIs() {
    const enEspera = ADMIN.pacientes.filter((p) => p.estado === "esperando");
    const esperaProm = enEspera.length
      ? Math.round(enEspera.reduce((acc, p) => acc + minutosDeEspera(p), 0) / enEspera.length)
      : 0;
    const enBox = ADMIN.pacientes.filter((p) => p.estado === "en_box").length;
    const saturacion = enBox / ADMIN.boxesTotales;
    const alertas = ADMIN.pacientes.filter(esAlerta).length;

    const kpis = [
      { label: "Pacientes en espera", value: enEspera.length, meta: `${ADMIN.pacientes.length} en el sistema ahora`, cls: enEspera.length > 14 ? "is-warn" : "" },
      { label: "Atendidos hoy", value: ADMIN.atendidosHoy, meta: ADMIN.centro, cls: "" },
      { label: "Espera promedio", value: `${esperaProm} min`, meta: "Meta interna: 45 min", cls: esperaProm > 45 ? "is-warn" : "" },
      { label: "Ocupación de boxes", value: `${Math.round(saturacion * 100)}%`, meta: `${enBox} de ${ADMIN.boxesTotales} boxes ocupados`, cls: saturacion >= 0.9 ? "is-critical" : saturacion >= 0.75 ? "is-warn" : "" },
      { label: "Alertas activas", value: alertas, meta: alertas ? "Superaron su tiempo máximo" : "Todo dentro de meta", cls: alertas ? "is-critical" : "" },
    ];

    document.getElementById("admin-kpis").innerHTML = kpis.map((k) => `
      <div class="kpi-card ${k.cls}">
        <span class="kpi-card__label">${k.label}</span>
        <span class="kpi-card__value">${k.value}</span>
        <span class="kpi-card__meta">${k.meta}</span>
      </div>
    `).join("");
  }

  function renderAdminCategorias() {
    const conteo = {};
    ORDEN_CATS.forEach((c) => { conteo[c] = 0; });
    ADMIN.pacientes.forEach((p) => { conteo[p.categoria] += 1; });
    const max = Math.max(1, ...Object.values(conteo));

    document.getElementById("chart-categorias").innerHTML = `<div class="admin-barchart">${ORDEN_CATS.map((c) => `
      <div class="admin-barchart__row">
        <span class="admin-barchart__label"><span class="dot" style="background:${COLOR_VAR[c]}"></span>${CATEGORIAS[c].nombre}</span>
        <div class="admin-barchart__track"><div class="admin-barchart__fill" style="width:${(conteo[c] / max) * 100}%; background:${COLOR_VAR[c]}"></div></div>
        <span class="admin-barchart__count">${conteo[c]}</span>
      </div>
    `).join("")}</div>`;
  }

  function renderAdminTendencia() {
    const datos = ADMIN.tendenciaHoras;
    const W = 720, H = 220, PAD_L = 34, PAD_B = 26, PAD_T = 14, PAD_R = 10;
    const innerW = W - PAD_L - PAD_R, innerH = H - PAD_T - PAD_B;
    const maxMin = Math.max(...datos.map((d) => d.min)) * 1.15;

    const puntos = datos.map((d, i) => ({
      x: PAD_L + (i / (datos.length - 1)) * innerW,
      y: PAD_T + innerH - (d.min / maxMin) * innerH,
      ...d,
    }));

    const linePath = puntos.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const baseY = (PAD_T + innerH).toFixed(1);
    const areaPath = `${linePath} L${puntos[puntos.length - 1].x.toFixed(1)},${baseY} L${puntos[0].x.toFixed(1)},${baseY} Z`;

    const gridLines = [0, 0.5, 1].map((t) => {
      const y = PAD_T + innerH * (1 - t);
      const val = Math.round(maxMin * t);
      return `<line x1="${PAD_L}" y1="${y.toFixed(1)}" x2="${W - PAD_R}" y2="${y.toFixed(1)}" style="stroke:var(--ink-100); stroke-width:1"/>
              <text x="${PAD_L - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" style="font-family:var(--font-mono); font-size:10.5px; fill:var(--ink-500)">${val}</text>`;
    }).join("");

    const etiquetasEjeX = puntos.filter((_, i) => i % 2 === 0).map((p) => `
      <text x="${p.x.toFixed(1)}" y="${H - 6}" text-anchor="middle" style="font-family:var(--font-mono); font-size:10.5px; fill:var(--ink-500)">${p.hora}</text>
    `).join("");

    const dots = puntos.map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.4" style="fill:var(--teal-600); stroke:var(--card); stroke-width:1.5"/>`).join("");

    document.getElementById("chart-tendencia").innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Tendencia de espera promedio por hora">
        <defs>
          <linearGradient id="tendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style="stop-color:var(--teal-500); stop-opacity:0.28"/>
            <stop offset="100%" style="stop-color:var(--teal-500); stop-opacity:0"/>
          </linearGradient>
        </defs>
        ${gridLines}
        <path d="${areaPath}" style="fill:url(#tendGradient); stroke:none"/>
        <path d="${linePath}" style="fill:none; stroke:var(--teal-600); stroke-width:2.4; stroke-linejoin:round; stroke-linecap:round"/>
        ${dots}
        ${etiquetasEjeX}
      </svg>
    `;
  }

  function renderAdminAlertas() {
    const alertas = ADMIN.pacientes.filter(esAlerta).sort((a, b) => minutosDeEspera(b) - minutosDeEspera(a));
    const cont = document.getElementById("admin-alertas");

    if (!alertas.length) {
      cont.innerHTML = `<li class="admin-alertas__empty">No hay pacientes fuera de su tiempo máximo de espera en este momento.</li>`;
      return;
    }

    cont.innerHTML = alertas.map((p) => {
      const severa = p.categoria === "rojo" || p.categoria === "naranja";
      return `
        <li class="admin-alerta ${severa ? "" : "admin-alerta--naranja"}">
          <span class="admin-alerta__dot"></span>
          <div class="admin-alerta__body">
            <span class="admin-alerta__name">${p.nombre} · ${CATEGORIAS[p.categoria].nombre}</span>
            <span class="admin-alerta__detail">Espera ${minutosDeEspera(p)} min — máximo para su categoría: ${SLA_MIN[p.categoria]} min</span>
          </div>
        </li>
      `;
    }).join("");
  }

  function renderAdminRecursos() {
    const enBox = ADMIN.pacientes.filter((p) => p.estado === "en_box").length;
    const items = [
      { label: "Boxes de atención", num: enBox, den: ADMIN.boxesTotales, cls: enBox / ADMIN.boxesTotales >= 0.9 ? "is-bad" : enBox / ADMIN.boxesTotales >= 0.75 ? "is-warn" : "" },
      { label: "Camillas de espera ocupadas", num: ADMIN.camillasOcupadas, den: ADMIN.camillasTotales, cls: ADMIN.camillasOcupadas / ADMIN.camillasTotales >= 0.9 ? "is-bad" : "" },
      { label: "Enfermería en turno", num: ADMIN.enfermerasTurno, den: ADMIN.enfermerasRecomendadas, cls: ADMIN.enfermerasTurno < ADMIN.enfermerasRecomendadas ? "is-warn" : "" },
      { label: "Personal médico en turno", num: ADMIN.medicosTurno, den: ADMIN.medicosRecomendados, cls: ADMIN.medicosTurno < ADMIN.medicosRecomendados ? "is-warn" : "" },
    ];
    document.getElementById("admin-recursos").innerHTML = items.map((it) => `
      <div class="admin-recurso">
        <span class="admin-recurso__label">${it.label}</span>
        <div class="admin-recurso__row"><span class="admin-recurso__num">${it.num}</span><span class="admin-recurso__den">/ ${it.den}</span></div>
        <div class="admin-recurso__bar"><div class="admin-recurso__bar-fill ${it.cls}" style="width:${Math.min(100, (it.num / it.den) * 100)}%"></div></div>
      </div>
    `).join("");
  }

  function renderAdminTabla() {
    const filtro = adminFiltro.value;
    let lista = [...ADMIN.pacientes].sort((a, b) => {
      const catDiff = ORDEN_CATS.indexOf(a.categoria) - ORDEN_CATS.indexOf(b.categoria);
      if (catDiff !== 0) return catDiff;
      return minutosDeEspera(b) - minutosDeEspera(a);
    });
    if (filtro !== "todas") lista = lista.filter((p) => p.categoria === filtro);

    const tbody = document.getElementById("admin-table-body");
    tbody.innerHTML = lista.map((p, idx) => {
      const alerta = esAlerta(p);
      const espera = p.estado === "en_box" ? "En box" : `${minutosDeEspera(p)} min`;
      const accion = p.estado === "esperando"
        ? `<button type="button" class="btn btn--primary" data-accion="llamar" data-id="${p.id}">Llamar a box</button>`
        : `<button type="button" class="btn btn--ghost" data-accion="finalizar" data-id="${p.id}">Finalizar atención</button>`;
      return `
        <tr class="${alerta ? "is-alerta" : ""}">
          <td>${idx + 1}</td>
          <td>${p.nombre} <span style="color:var(--ink-500)">· ${p.edad} años</span></td>
          <td><span class="admin-cat-pill admin-cat-pill--${p.categoria}"><span class="dot"></span>${CATEGORIAS[p.categoria].nombre}</span></td>
          <td>${new Date(p.horaLlegada).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}</td>
          <td class="${alerta ? "espera-alerta" : ""}">${espera}</td>
          <td>${p.box || "—"}</td>
          <td>${accion}</td>
        </tr>
      `;
    }).join("");

    tbody.querySelectorAll("[data-accion]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        if (btn.dataset.accion === "llamar") llamarPaciente(id);
        else finalizarAtencion(id);
      });
    });
  }

  function renderAdmin() {
    document.getElementById("admin-updated").textContent =
      new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    renderAdminKPIs();
    renderAdminCategorias();
    renderAdminTendencia();
    renderAdminAlertas();
    renderAdminRecursos();
    renderAdminTabla();
  }

  adminFiltro.addEventListener("change", renderAdminTabla);

  function iniciarTickerAdmin() {
    if (adminTickerId) clearInterval(adminTickerId);
    adminTickerId = setInterval(() => {
      if (Math.random() < 0.3) ADMIN.atendidosHoy += 1;
      renderAdmin();
    }, 6000);
  }
  function detenerTickerAdmin() {
    if (adminTickerId) clearInterval(adminTickerId);
    adminTickerId = null;
  }

  document.getElementById("btn-open-admin").addEventListener("click", () => {
    document.body.classList.add("is-admin-mode");
    Object.values(screens).forEach((el) => el.classList.remove("is-visible"));
    screenAdmin.classList.add("is-visible");
    window.scrollTo({ top: 0, behavior: "smooth" });
    renderAdmin();
    iniciarTickerAdmin();
  });

  document.getElementById("btn-close-admin").addEventListener("click", () => {
    document.body.classList.remove("is-admin-mode");
    screenAdmin.classList.remove("is-visible");
    detenerTickerAdmin();
    const activo = document.querySelector(".stepnav__item.is-active");
    irAPaso(activo ? Number(activo.dataset.step) : 1);
  });

  /* ----------------------------------------------------------
     9. INICIALIZACIÓN
     ---------------------------------------------------------- */
  renderCentros();
})();

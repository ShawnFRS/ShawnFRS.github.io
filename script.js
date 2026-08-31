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

    verificarEncuestaSatisfaccion();

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
     8. PANEL ADMINISTRADOR (multi-centro, con login por hospital)
     ---------------------------------------------------------- */
  const SLA_MIN = { rojo: 0, naranja: 10, amarillo: 60, verde: 120, azul: null };
  const COLOR_VAR = { rojo: "var(--rojo)", naranja: "var(--naranja)", amarillo: "var(--amarillo)", verde: "var(--verde)", azul: "var(--azul)" };

  function hashString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) | 0; }
    return h;
  }

  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const NOMBRES_POOL = [
    "Rodrigo Iturra", "Marcela Sepúlveda", "Benjamín Toro", "Antonia Reyes", "Carlos Huenchullán",
    "Javiera Molina", "Francisco Bravo", "Camila Ortiz", "Sebastián Paillao", "Valentina Muñoz",
    "Pedro Contreras", "Isidora Vergara", "Matías Cid", "Rosa Elvira Salinas", "Ignacio Sandoval",
    "Fernanda Mardones", "Diego Villalobos", "Catalina Fuentes", "Tomás Aguayo", "Josefina Riquelme",
    "Álvaro Concha", "Daniela Yáñez", "Nicolás Barría", "Constanza Painemal", "Felipe Aravena",
    "Millaray Curín", "Gabriel Escobar", "Trinidad Poblete", "Cristóbal Lienlaf", "Antonella Rivas",
    "Maximiliano Order", "Consuelo Navarrete", "Joaquín Huaiquil", "Florencia Bustos", "Emilio Tapia",
    "Amanda Cárcamo", "Vicente Marileo", "Renata Godoy", "Agustín Quintana", "Paz Manríquez",
  ];

  const PERFIL_TIPO = {
    hospital: { boxes: 10, camillas: 14, enfermeras: 8, medicos: 6, factorAtendidos: 1.4,
      pesos: { rojo: 0.04, naranja: 0.12, amarillo: 0.34, verde: 0.34, azul: 0.16 } },
    sapu: { boxes: 6, camillas: 8, enfermeras: 5, medicos: 3, factorAtendidos: 0.7,
      pesos: { rojo: 0.01, naranja: 0.06, amarillo: 0.33, verde: 0.40, azul: 0.20 } },
    clinica: { boxes: 7, camillas: 9, enfermeras: 5, medicos: 4, factorAtendidos: 0.6,
      pesos: { rojo: 0.02, naranja: 0.08, amarillo: 0.30, verde: 0.38, azul: 0.22 } },
  };

  const CURVA_HORARIA = [0.55, 0.68, 0.82, 0.95, 1.15, 1.28, 1.20, 1.30, 1.38, 1.22, 1.05];
  const HORAS_ETIQUETA = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

  function elegirCategoria(rng, pesos) {
    const r = rng();
    let acc = 0;
    for (const cat of ORDEN_CATS) {
      acc += pesos[cat];
      if (r <= acc) return cat;
    }
    return "azul";
  }

  // Genera una "fotografía" plausible de la demanda de un centro, a partir
  // de sus propios datos (tipo, saturación, esperaBaseMin) ya definidos en CENTROS.
  // Es determinística por centro (misma semilla = mismos números) hasta que
  // el usuario interactúa (llamar / finalizar atención) o recarga la página.
  function generarDatosAdmin(centro) {
    const perfil = PERFIL_TIPO[centro.tipo] || PERFIL_TIPO.hospital;
    const rng = mulberry32(hashString(centro.id));
    const nombresDisponibles = [...NOMBRES_POOL];

    const totalPacientes = Math.round(12 + centro.saturacion * 22);
    const boxesTotales = perfil.boxes;

    const pacientes = [];
    let boxesUsados = 0;
    for (let i = 0; i < totalPacientes; i++) {
      const categoria = elegirCategoria(rng, perfil.pesos);
      const idxNombre = Math.floor(rng() * nombresDisponibles.length);
      const nombre = nombresDisponibles.splice(idxNombre, 1)[0] || `Paciente ${i + 1}`;
      const edad = Math.round(4 + rng() * 88);

      const baseEspera = centro.esperaBaseMin[categoria] ?? 60;
      const llegadaHaceMin = Math.max(1, Math.round(baseEspera * (0.2 + rng() * 1.3)));

      const puedeEntrarBox = boxesUsados < boxesTotales && rng() < 0.42;
      const estadoPaciente = puedeEntrarBox ? "en_box" : "esperando";
      if (estadoPaciente === "en_box") boxesUsados += 1;

      pacientes.push({
        id: i + 1,
        nombre, edad, categoria, estado: estadoPaciente,
        box: estadoPaciente === "en_box" ? `Box ${boxesUsados}` : null,
        horaLlegada: Date.now() - llegadaHaceMin * 60000,
      });
    }

    const tendenciaHoras = HORAS_ETIQUETA.map((hora, i) => ({
      hora,
      min: Math.round((centro.esperaBaseMin.amarillo ?? 45) * (1 + centro.saturacion * 0.5) * CURVA_HORARIA[i] * (0.9 + rng() * 0.2)),
    }));

    const esperaPromedioTendencia = Math.round(
      tendenciaHoras.reduce((a, d) => a + d.min, 0) / tendenciaHoras.length
    );

    return {
      centroId: centro.id,
      centroNombre: centro.nombre,
      atendidosHoy: Math.round((70 + centro.saturacion * 130) * perfil.factorAtendidos),
      boxesTotales: perfil.boxes,
      camillasTotales: perfil.camillas,
      camillasOcupadas: Math.round(perfil.camillas * (0.4 + centro.saturacion * 0.5)),
      enfermerasTurno: Math.max(1, perfil.enfermeras - Math.round(rng() * 2)),
      enfermerasRecomendadas: perfil.enfermeras,
      medicosTurno: Math.max(1, perfil.medicos - Math.round(rng())),
      medicosRecomendados: perfil.medicos,
      satisfaccionPromedio: Math.round((3.6 + (1 - centro.saturacion) * 1.2) * 10) / 10,
      baselineEsperaPromedio: Math.round(esperaPromedioTendencia * 1.22),
      tendenciaHoras,
      pacientes,
    };
  }

  const ADMIN_LOGINS = CENTROS.map((c) => ({
    centroId: c.id,
    usuario: `admin.${c.id}`,
    clave: `${c.id}2026`,
  }));

  const ADMIN_DATA_CACHE = {};
  function obtenerDatosAdmin(centroId) {
    if (!centroId) return null;
    if (!ADMIN_DATA_CACHE[centroId]) {
      const centro = CENTROS.find((c) => c.id === centroId);
      if (!centro) return null;
      ADMIN_DATA_CACHE[centroId] = generarDatosAdmin(centro);
    }
    return ADMIN_DATA_CACHE[centroId];
  }

  const ADMIN_SESSION_KEY = "triajenet_admin_sesion_v1";
  function obtenerSesionAdmin() {
    try { return JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY) || "null"); } catch (e) { return null; }
  }
  function guardarSesionAdmin(sesion) { localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sesion)); }
  function borrarSesionAdmin() { localStorage.removeItem(ADMIN_SESSION_KEY); }

  let ADMIN_ACTIVA = null;

  const screenAdminLogin = document.getElementById("screen-admin-login");
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

  function boxLibre(datos) {
    const usados = new Set(datos.pacientes.filter((p) => p.estado === "en_box").map((p) => p.box));
    for (let i = 1; i <= datos.boxesTotales; i++) {
      const nombreBox = `Box ${i}`;
      if (!usados.has(nombreBox)) return nombreBox;
    }
    return null;
  }

  function llamarPaciente(id) {
    const datos = obtenerDatosAdmin(ADMIN_ACTIVA);
    if (!datos) return;
    const p = datos.pacientes.find((x) => x.id === id);
    if (!p) return;
    const box = boxLibre(datos);
    if (!box) { alert("No hay boxes disponibles en este momento. Libera un box antes de llamar a un nuevo paciente."); return; }
    p.estado = "en_box";
    p.box = box;
    renderAdmin();
  }

  function finalizarAtencion(id) {
    const datos = obtenerDatosAdmin(ADMIN_ACTIVA);
    if (!datos) return;
    const idx = datos.pacientes.findIndex((x) => x.id === id);
    if (idx === -1) return;
    datos.pacientes.splice(idx, 1);
    datos.atendidosHoy += 1;
    renderAdmin();
  }

  /* ---- Animación de conteo para los KPI (los nodos se reutilizan entre renders) ---- */
  function animarNumero(el, valorFinal) {
    const valorInicial = Number(el.dataset.valor || 0);
    el.dataset.valor = valorFinal;
    if (valorInicial === valorFinal) { el.textContent = valorFinal; return; }
    const duracion = 450;
    const inicio = performance.now();
    function paso(t) {
      const progreso = Math.min(1, (t - inicio) / duracion);
      el.textContent = Math.round(valorInicial + (valorFinal - valorInicial) * progreso);
      if (progreso < 1) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  }

  function renderAdminKPIs() {
    const datos = obtenerDatosAdmin(ADMIN_ACTIVA);
    if (!datos) return;
    const enEspera = datos.pacientes.filter((p) => p.estado === "esperando");
    const esperaProm = enEspera.length
      ? Math.round(enEspera.reduce((acc, p) => acc + minutosDeEspera(p), 0) / enEspera.length)
      : 0;
    const enBox = datos.pacientes.filter((p) => p.estado === "en_box").length;
    const saturacion = enBox / datos.boxesTotales;
    const alertas = datos.pacientes.filter(esAlerta).length;

    const kpis = [
      { id: "enEspera", label: "Pacientes en espera", value: enEspera.length, suffix: "", meta: `${datos.pacientes.length} en el sistema ahora`, cls: enEspera.length > 14 ? "is-warn" : "" },
      { id: "atendidos", label: "Atendidos hoy", value: datos.atendidosHoy, suffix: "", meta: datos.centroNombre, cls: "" },
      { id: "espera", label: "Espera promedio", value: esperaProm, suffix: " min", meta: "Meta interna: 45 min", cls: esperaProm > 45 ? "is-warn" : "" },
      { id: "ocupacion", label: "Ocupación de boxes", value: Math.round(saturacion * 100), suffix: "%", meta: `${enBox} de ${datos.boxesTotales} boxes ocupados`, cls: saturacion >= 0.9 ? "is-critical" : saturacion >= 0.75 ? "is-warn" : "" },
      { id: "alertas", label: "Alertas activas", value: alertas, suffix: "", meta: alertas ? "Superaron su tiempo máximo" : "Todo dentro de meta", cls: alertas ? "is-critical" : "" },
      { id: "satisfaccion", label: "Satisfacción reportada", value: datos.satisfaccionPromedio, suffix: "/5", meta: "Encuesta post-atención", cls: datos.satisfaccionPromedio < 3.8 ? "is-warn" : "", decimal: true },
    ];

    const cont = document.getElementById("admin-kpis");
    if (cont.children.length !== kpis.length || cont.dataset.centro !== ADMIN_ACTIVA) {
      cont.dataset.centro = ADMIN_ACTIVA;
      cont.innerHTML = kpis.map((k) => `
        <div class="kpi-card" data-kpi="${k.id}">
          <span class="kpi-card__label">${k.label}</span>
          <span class="kpi-card__value"><span class="kpi-card__num" data-valor="0">0</span>${k.suffix}</span>
          <span class="kpi-card__meta"></span>
        </div>
      `).join("");
    }

    kpis.forEach((k) => {
      const card = cont.querySelector(`[data-kpi="${k.id}"]`);
      if (!card) return;
      card.className = `kpi-card ${k.cls}`;
      card.querySelector(".kpi-card__meta").textContent = k.meta;
      const numEl = card.querySelector(".kpi-card__num");
      if (k.decimal) { numEl.textContent = k.value.toFixed(1); numEl.dataset.valor = k.value; }
      else animarNumero(numEl, k.value);
    });
  }

  function renderAdminImpacto() {
    const datos = obtenerDatosAdmin(ADMIN_ACTIVA);
    if (!datos) return;
    const enEspera = datos.pacientes.filter((p) => p.estado === "esperando");
    const esperaActual = enEspera.length
      ? Math.round(enEspera.reduce((acc, p) => acc + minutosDeEspera(p), 0) / enEspera.length)
      : 0;
    const reduccion = datos.baselineEsperaPromedio > 0
      ? Math.round(((datos.baselineEsperaPromedio - esperaActual) / datos.baselineEsperaPromedio) * 100)
      : 0;

    document.getElementById("admin-impacto").innerHTML = `
      <div class="admin-impacto__item">
        <span class="admin-impacto__label">Espera promedio antes de TriajeNet</span>
        <span class="admin-impacto__value">${datos.baselineEsperaPromedio} min</span>
        <span class="admin-impacto__note">Estimado histórico del centro</span>
      </div>
      <div class="admin-impacto__item">
        <span class="admin-impacto__label">Espera promedio hoy</span>
        <span class="admin-impacto__value">${esperaActual} min</span>
        <span class="admin-impacto__note">Con priorización y visibilidad en vivo</span>
      </div>
      <div class="admin-impacto__item">
        <span class="admin-impacto__label">Variación</span>
        <span class="admin-impacto__value ${reduccion > 0 ? "is-good" : ""}"><span class="arrow">${reduccion > 0 ? "↓" : "↑"}</span>${Math.abs(reduccion)}%</span>
        <span class="admin-impacto__note">${reduccion > 0 ? "Menos tiempo de espera que el promedio histórico" : "Sobre el promedio histórico del centro"}</span>
      </div>
    `;
  }

  function renderAdminCategorias() {
    const datos = obtenerDatosAdmin(ADMIN_ACTIVA);
    if (!datos) return;
    const conteo = {};
    ORDEN_CATS.forEach((c) => { conteo[c] = 0; });
    datos.pacientes.forEach((p) => { conteo[p.categoria] += 1; });
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
    const datos = obtenerDatosAdmin(ADMIN_ACTIVA);
    if (!datos) return;
    const puntosDatos = datos.tendenciaHoras;
    const W = 720, H = 220, PAD_L = 34, PAD_B = 26, PAD_T = 14, PAD_R = 10;
    const innerW = W - PAD_L - PAD_R, innerH = H - PAD_T - PAD_B;
    const maxMin = Math.max(...puntosDatos.map((d) => d.min)) * 1.15;

    const puntos = puntosDatos.map((d, i) => ({
      x: PAD_L + (i / (puntosDatos.length - 1)) * innerW,
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
    const datos = obtenerDatosAdmin(ADMIN_ACTIVA);
    if (!datos) return;
    const alertas = datos.pacientes.filter(esAlerta).sort((a, b) => minutosDeEspera(b) - minutosDeEspera(a));
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
    const datos = obtenerDatosAdmin(ADMIN_ACTIVA);
    if (!datos) return;
    const enBox = datos.pacientes.filter((p) => p.estado === "en_box").length;
    const items = [
      { label: "Boxes de atención", num: enBox, den: datos.boxesTotales, cls: enBox / datos.boxesTotales >= 0.9 ? "is-bad" : enBox / datos.boxesTotales >= 0.75 ? "is-warn" : "" },
      { label: "Camillas de espera ocupadas", num: datos.camillasOcupadas, den: datos.camillasTotales, cls: datos.camillasOcupadas / datos.camillasTotales >= 0.9 ? "is-bad" : "" },
      { label: "Enfermería en turno", num: datos.enfermerasTurno, den: datos.enfermerasRecomendadas, cls: datos.enfermerasTurno < datos.enfermerasRecomendadas ? "is-warn" : "" },
      { label: "Personal médico en turno", num: datos.medicosTurno, den: datos.medicosRecomendados, cls: datos.medicosTurno < datos.medicosRecomendados ? "is-warn" : "" },
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
    const datos = obtenerDatosAdmin(ADMIN_ACTIVA);
    if (!datos) return;
    const filtro = adminFiltro.value;
    let lista = [...datos.pacientes].sort((a, b) => {
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
    const datos = obtenerDatosAdmin(ADMIN_ACTIVA);
    if (!datos) return;
    const sesion = obtenerSesionAdmin();
    document.getElementById("admin-centro-nombre").textContent = datos.centroNombre;
    document.getElementById("admin-session-user").textContent = sesion ? `Sesión: ${sesion.usuario}` : "";
    document.getElementById("admin-updated").textContent =
      new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    renderAdminKPIs();
    renderAdminImpacto();
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
      const datos = obtenerDatosAdmin(ADMIN_ACTIVA);
      if (datos && Math.random() < 0.3) datos.atendidosHoy += 1;
      renderAdmin();
    }, 6000);
  }
  function detenerTickerAdmin() {
    if (adminTickerId) clearInterval(adminTickerId);
    adminTickerId = null;
  }

  function ocultarTodasLasPantallas() {
    Object.values(screens).forEach((el) => el.classList.remove("is-visible"));
    screenAdminLogin.classList.remove("is-visible");
    screenAdmin.classList.remove("is-visible");
  }

  function mostrarLoginAdmin() {
    document.body.classList.add("is-admin-mode");
    ocultarTodasLasPantallas();
    screenAdminLogin.classList.add("is-visible");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function mostrarDashboardAdmin(sesion) {
    document.body.classList.add("is-admin-mode");
    ocultarTodasLasPantallas();
    screenAdmin.classList.add("is-visible");
    window.scrollTo({ top: 0, behavior: "smooth" });
    ADMIN_ACTIVA = sesion.centroId;
    renderAdmin();
    iniciarTickerAdmin();
  }

  function salirDeAdmin() {
    document.body.classList.remove("is-admin-mode");
    ocultarTodasLasPantallas();
    detenerTickerAdmin();
    const activo = document.querySelector(".stepnav__item.is-active");
    irAPaso(activo ? Number(activo.dataset.step) : 1);
  }

  /* ---- Formulario de login ---- */
  const loginCentroSelect = document.getElementById("login-centro");
  const loginUsuarioInput = document.getElementById("login-usuario");
  const loginClaveInput = document.getElementById("login-clave");
  const loginErrorEl = document.getElementById("login-error");
  const loginDemoListEl = document.getElementById("login-demo-list");
  const formAdminLogin = document.getElementById("form-admin-login");

  loginCentroSelect.innerHTML = CENTROS.map((c) => `<option value="${c.id}">${c.nombre}</option>`).join("");

  loginDemoListEl.innerHTML = ADMIN_LOGINS.map((l) => {
    const centro = CENTROS.find((c) => c.id === l.centroId);
    return `<li data-usuario="${l.usuario}" data-clave="${l.clave}" data-centro="${l.centroId}">${centro.nombre} → ${l.usuario} / ${l.clave}</li>`;
  }).join("");

  loginDemoListEl.querySelectorAll("li").forEach((li) => {
    li.addEventListener("click", () => {
      loginCentroSelect.value = li.dataset.centro;
      loginUsuarioInput.value = li.dataset.usuario;
      loginClaveInput.value = li.dataset.clave;
    });
  });

  formAdminLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    const centroId = loginCentroSelect.value;
    const usuario = loginUsuarioInput.value.trim();
    const clave = loginClaveInput.value;
    const match = ADMIN_LOGINS.find((l) => l.centroId === centroId && l.usuario === usuario && l.clave === clave);
    if (!match) {
      loginErrorEl.textContent = "Usuario, contraseña o centro incorrectos. Revisa las credenciales de demostración.";
      loginErrorEl.hidden = false;
      return;
    }
    loginErrorEl.hidden = true;
    const sesion = { centroId, usuario, desde: Date.now() };
    guardarSesionAdmin(sesion);
    mostrarDashboardAdmin(sesion);
  });

  /* ---- Exportar reporte CSV ---- */
  function descargarReporteCSV() {
    const datos = obtenerDatosAdmin(ADMIN_ACTIVA);
    if (!datos) return;
    const enEspera = datos.pacientes.filter((p) => p.estado === "esperando").length;
    const enBox = datos.pacientes.filter((p) => p.estado === "en_box").length;

    let csv = `Reporte TriajeNet;${datos.centroNombre};${new Date().toLocaleString("es-CL")}\n\n`;
    csv += `Indicador;Valor\n`;
    csv += `Pacientes en espera;${enEspera}\n`;
    csv += `Pacientes en box;${enBox}\n`;
    csv += `Atendidos hoy;${datos.atendidosHoy}\n`;
    csv += `Satisfacción promedio;${datos.satisfaccionPromedio}\n\n`;
    csv += `N°;Paciente;Edad;Categoría;Estado;Espera (min);Box\n`;
    datos.pacientes.forEach((p, idx) => {
      csv += `${idx + 1};${p.nombre};${p.edad};${CATEGORIAS[p.categoria].nombre};${p.estado === "en_box" ? "En box" : "Esperando"};${p.estado === "esperando" ? minutosDeEspera(p) : "-"};${p.box || "-"}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-${datos.centroId}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  document.getElementById("btn-open-admin").addEventListener("click", () => {
    const sesion = obtenerSesionAdmin();
    if (sesion) mostrarDashboardAdmin(sesion);
    else mostrarLoginAdmin();
  });
  document.getElementById("btn-close-admin-login").addEventListener("click", salirDeAdmin);
  document.getElementById("btn-close-admin").addEventListener("click", salirDeAdmin);
  document.getElementById("btn-cerrar-sesion").addEventListener("click", () => {
    borrarSesionAdmin();
    salirDeAdmin();
  });
  document.getElementById("btn-cambiar-centro").addEventListener("click", () => {
    borrarSesionAdmin();
    detenerTickerAdmin();
    mostrarLoginAdmin();
  });
  document.getElementById("btn-descargar-reporte").addEventListener("click", descargarReporteCSV);

  /* ----------------------------------------------------------
     8B. ACCESIBILIDAD — modo de texto grande
     ---------------------------------------------------------- */
  const A11Y_KEY = "triajenet_a11y_v1";
  const btnA11y = document.getElementById("btn-toggle-a11y");
  function aplicarA11y(activo) {
    document.body.classList.toggle("text-lg", activo);
    btnA11y.setAttribute("aria-pressed", String(activo));
  }
  aplicarA11y(localStorage.getItem(A11Y_KEY) === "1");
  btnA11y.addEventListener("click", () => {
    const activo = !document.body.classList.contains("text-lg");
    aplicarA11y(activo);
    localStorage.setItem(A11Y_KEY, activo ? "1" : "0");
  });

  /* ----------------------------------------------------------
     8C. BUSCAR MI FILA (paciente que ya se registró antes)
     Nota: como no hay servidor, esta búsqueda solo encuentra el
     registro guardado en este mismo navegador/dispositivo.
     ---------------------------------------------------------- */
  const btnToggleBuscar = document.getElementById("btn-toggle-buscar");
  const returningLookupEl = document.getElementById("returning-lookup");
  const inputBuscarNombre = document.getElementById("f-buscar-nombre");
  const notaBuscarEl = document.getElementById("returning-lookup__note");

  btnToggleBuscar.addEventListener("click", () => {
    returningLookupEl.hidden = !returningLookupEl.hidden;
    if (!returningLookupEl.hidden) inputBuscarNombre.focus();
  });

  document.getElementById("btn-buscar-fila").addEventListener("click", () => {
    const nombreBuscado = inputBuscarNombre.value.trim().toLowerCase();
    notaBuscarEl.className = "returning-lookup__note";

    if (!nombreBuscado) {
      notaBuscarEl.textContent = "Escribe el nombre con el que te registraste.";
      notaBuscarEl.classList.add("is-error");
      return;
    }

    const nombreGuardado = ((estado.paciente && estado.paciente.nombre) || "").trim().toLowerCase();

    if (nombreGuardado && nombreGuardado === nombreBuscado && estado.cola) {
      notaBuscarEl.textContent = "¡Te encontramos! Abriendo tu fila…";
      notaBuscarEl.classList.add("is-ok");
      setTimeout(() => { irAPaso(3); actualizarCola(true); iniciarTickerCola(); }, 450);
    } else if (nombreGuardado && nombreGuardado === nombreBuscado && estado.triage) {
      notaBuscarEl.textContent = "Encontramos tu pre-triage. Aún no habías elegido un centro asistencial.";
      notaBuscarEl.classList.add("is-ok");
      setTimeout(() => { irAPaso(2); renderCentros(); }, 450);
    } else {
      notaBuscarEl.textContent = "No encontramos un registro con ese nombre en este dispositivo. Completa el formulario de pre-triage para comenzar.";
      notaBuscarEl.classList.add("is-error");
    }
  });

  /* ----------------------------------------------------------
     8D. ENCUESTA DE SATISFACCIÓN (al llegar a atención médica)
     ---------------------------------------------------------- */
  function verificarEncuestaSatisfaccion() {
    const seccionEncuesta = document.getElementById("encuesta-satisfaccion");
    const cola = estado.cola;
    if (!cola || !cola.eventos[3] || cola.eventos[3].estado !== "current") {
      seccionEncuesta.hidden = true;
      return;
    }
    seccionEncuesta.hidden = false;
    if (estado.encuestaRespondida) {
      document.querySelectorAll(".encuesta__opcion").forEach((b) => { b.disabled = true; });
      document.getElementById("encuesta-gracias").hidden = false;
    }
  }

  document.querySelectorAll(".encuesta__opcion").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (estado.encuestaRespondida) return;
      const valor = Number(btn.dataset.valor);
      document.querySelectorAll(".encuesta__opcion").forEach((b) => { b.disabled = true; });
      btn.classList.add("is-selected");
      document.getElementById("encuesta-gracias").hidden = false;
      estado.encuestaRespondida = true;
      guardarEstado(estado);

      // Aporta la respuesta a la satisfacción simulada del centro elegido,
      // si ese centro ya tiene datos de administración generados en esta sesión.
      if (estado.centroId && ADMIN_DATA_CACHE[estado.centroId]) {
        const datosCentro = ADMIN_DATA_CACHE[estado.centroId];
        datosCentro.satisfaccionPromedio = Math.round(((datosCentro.satisfaccionPromedio * 9 + valor) / 10) * 10) / 10;
      }
    });
  });

  /* ----------------------------------------------------------
     9. INICIALIZACIÓN
     ---------------------------------------------------------- */
  renderCentros();
})();

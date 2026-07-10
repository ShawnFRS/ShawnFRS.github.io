<div align="center">

# 🚑 TriajeNet

### La fila del hospital, resuelta antes de que llegues.

**Pre-triage inteligente · Selección de centro en tiempo real · Panel de gestión hospitalaria**

![status](https://img.shields.io/badge/status-en%20construcci%C3%B3n-0F766E?style=for-the-badge)
![stack](https://img.shields.io/badge/stack-HTML%20%2F%20CSS%20%2F%20JS-1C2024?style=for-the-badge)
![dependencias](https://img.shields.io/badge/dependencias%20externas-0-2F7D4F?style=for-the-badge)
![vibe](https://img.shields.io/badge/vibe-urgencia%20sin%20drama-D9690C?style=for-the-badge)

</div>

---

## 🩺 ¿Qué es esto?

Todos los años, miles de personas llegan a un servicio de urgencia sin saber **cuánto van a esperar**, **si ese es el mejor lugar para ir**, ni **qué tan grave es realmente su caso**. Del otro lado, los equipos hospitalarios manejan esa demanda a ciegas: papel, intuición y radio pasillo.

**TriajeNet ataca los dos lados del problema al mismo tiempo.**

Para el paciente: un pre-triage guiado que clasifica su urgencia en segundos, le muestra los centros asistenciales disponibles con tiempo de espera y ocupación real, y le deja seguir su fila en vivo desde el celular — sin ir a preguntar cada 10 minutos en ventanilla.

Para el hospital: un panel de comando con las métricas que de verdad importan — cola por categoría, alertas de espera crítica, personal en turno, y el dato que cierra el negocio: **cuánto mejoró el tiempo de espera desde que existe TriajeNet.**

No es una idea. Está construido. Ábrelo y pruébalo.

---

## ✨ Lo que hace (y no es un mockup)

| | |
|---|---|
| 🧭 **Pre-triage tipo Manchester** | Clasifica automáticamente en 5 niveles de urgencia (Resucitación → No urgente) a partir de síntomas, signos vitales y factores de riesgo. |
| 🏥 **Buscador de centros en vivo** | Compara distancia, espera estimada y % de ocupación entre hospitales, SAPU y clínicas — y recomienda el mejor según tu urgencia. |
| 📍 **Mi fila, en tiempo real** | El paciente ve cuántas personas tiene delante y cuánto le falta, sin recargar ni preguntar. |
| ↩️ **Vuelve directo a tu fila** | Si ya te registraste, buscas tu fila con tu nombre y listo — no repites el formulario. |
| ⭐ **Encuesta de satisfacción** | Un clic al llegar a atención, para que el hospital sepa cómo lo está haciendo. |
| 🔐 **Panel administrador multi-hospital** | Cada centro entra con su propia cuenta y ve **solo sus métricas** — cero curva de aprendizaje. |
| 📊 **KPIs que justifican la suscripción** | Pacientes en espera, ocupación de boxes, personal en turno, alertas de espera crítica y satisfacción — todo en vivo. |
| 📈 **"Impacto de la plataforma"** | Compara la espera de hoy contra el promedio histórico del centro. Así se defiende el precio ante la dirección del hospital. |
| 📥 **Exporta reporte en un clic** | CSV descargable con la cola completa y los indicadores del día. |
| ♿ **Modo texto grande** | Porque el adulto mayor y el paciente crónico también son usuarios, no una nota al pie. |

---

## 🎯 Por qué existe

> El paciente que paga la cuenta no es el mismo que usa la app todos los días.

TriajeNet nace de una idea simple del modelo de negocio: **el hospital es el cliente, el paciente es el usuario.** Por eso cada decisión de diseño tiene dos preguntas detrás:

1. ¿Esto hace que un paciente ansioso, en un mal momento, sienta que tiene el control?
2. ¿Esto le da al hospital un número concreto que justifique pagar por la plataforma?

Si la respuesta a ambas es sí, entra al producto. Si no, se queda afuera.

---

## 🖥️ Pruébalo en 10 segundos

No hay build, no hay `npm install`, no hay excusas.

```bash
git clone <este-repo>
cd triajenet
open index.html   # o simplemente doble clic
```

Eso es todo. Es HTML, CSS y JavaScript puro — **cero dependencias externas**, cero frameworks pesados, cero tiempo de carga innecesario. Si tu hospital tiene wifi de sala de espera del año 2016, esto igual carga.

### 🔑 Acceso al panel administrador

Abre el panel, elige un centro, y usa cualquiera de las credenciales de demostración que aparecen en pantalla (`admin.<centro> / <centro>2026`). Cada hospital de la red tiene su propia sesión y sus propios datos — pruébalos todos y compara.

---

## 🧱 Stack

```
HTML5  +  CSS3 (variables, grid, animaciones)  +  JavaScript vanilla
```

Sin React. Sin build tools. Sin librerías de gráficos de 300kb para dibujar tres barras. Los gráficos del panel administrador están hechos a mano en SVG. ¿Por qué? Porque un proyecto con presupuesto real de hospital regional no necesita pagar peso muerto en dependencias para mostrar un gráfico de barras.

---

## 🗺️ Roadmap (la versión honesta)

- [x] Pre-triage con motor de clasificación de urgencia
- [x] Comparador de centros asistenciales
- [x] Cola en vivo para el paciente
- [x] Panel administrador multi-centro con login
- [x] Reportes exportables + panel de impacto
- [ ] Backend real (porque sí, hoy todo vive en `localStorage` y datos simulados)
- [ ] Autenticación segura de verdad para el panel administrador
- [ ] App móvil nativa
- [ ] Integración con sistemas hospitalarios existentes (HIS/RIS)

Si llegaste hasta acá pensando *"esto está muy bien armado para ser un prototipo"* — esa es exactamente la idea.

---

<div align="center">

**TriajeNet** — porque nadie debería enterarse de lo grave que está solo por lo mucho que esperó.

*Herramienta de orientación. No reemplaza la evaluación de un profesional de salud.*
*Ante una emergencia vital: 131 (SAMU) o 133.*

</div>

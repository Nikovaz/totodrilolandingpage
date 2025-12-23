# AUTOMATIZACIÓN WHATSAPP - TOTODRILO IA
## Descripción Técnica Completa para NotebookLM

---

## 📋 RESUMEN EJECUTIVO

**Nombre del Workflow:** TOTODRILO - Agente WhatsApp  
**Plataforma:** n8n (Automatización de Workflows)  
**Propósito:** Agente conversacional inteligente para WhatsApp que automatiza la atención al cliente, califica leads y gestiona conversaciones para la agencia Totodrilo IA.

**Tecnologías Principales:**
- **n8n** - Orquestación de workflows
- **OpenAI GPT-4o Mini** - Modelo de lenguaje principal
- **Google Gemini 2.5 Pro** - Transcripción de audio
- **PostgreSQL** - Almacenamiento de memoria conversacional
- **Redis** - Buffer temporal de mensajes
- **Chatwoot API** - Plataforma de mensajería
- **Telegram** - Notificaciones a equipo
- **Google Docs** - Base de conocimiento

---

## 🎯 OBJETIVO DEL SISTEMA

Automatizar completamente la atención al cliente en WhatsApp para Totodrilo IA, una agencia especializada en automatización con IA. El sistema:

1. **Responde automáticamente** a consultas de clientes 24/7
2. **Califica leads** según su intención (caliente, demo, queja, etc.)
3. **Gestiona múltiples tipos de contenido** (texto, audio, imágenes)
4. **Notifica al equipo** sobre leads importantes o quejas
5. **Mantiene contexto conversacional** usando memoria persistente
6. **Guía hacia el objetivo** de agendar consultas gratuitas de 30 minutos

---

## 🔄 ARQUITECTURA DEL WORKFLOW

### FASE 1: RECEPCIÓN Y NORMALIZACIÓN
**Nodos involucrados:** Webhook WhatsApp → Normalizar Datos

**Proceso:**
1. **Webhook WhatsApp** recibe eventos de Chatwoot (mensajes entrantes/salientes)
2. **Normalizar Datos** extrae y estructura la información:
   - Tipo de mensaje (incoming/outgoing)
   - ID de conversación
   - Chat ID del cliente
   - Contenido del mensaje
   - Timestamp
   - Nombre y teléfono del cliente
   - Account ID e Inbox ID
   - Estado del bot (On/Off)
   - Source ID
   - Tipo de contenido (texto/imagen/audio)
   - URL de archivos adjuntos

### FASE 2: FILTRADO Y CONTROL
**Nodos involucrados:** Filtrar Mensajes Entrantes → Bot On/Off → Contacto Ignorar → If(Ignorar_Mensaje)

**Proceso:**
1. **Filtrar Mensajes Entrantes:** Separa mensajes del cliente vs. del bot
   - Output "Mensaje del Cliente" → continúa el flujo
   - Output "Mensaje del Bot" → termina (evita loops)

2. **Bot On/Off:** Verifica el estado del bot en atributos personalizados
   - Si está "On" → continúa
   - Si está "Off" → elimina buffer y termina

3. **Contacto Ignorar:** Consulta tabla de contactos a ignorar
   - Busca el número de teléfono en la lista de ignorados

4. **If(Ignorar_Mensaje):** Decide si procesar o ignorar
   - Si está en lista de ignorados → termina
   - Si no está → continúa al siguiente paso

### FASE 3: GESTIÓN DE CONTACTOS
**Nodos involucrados:** Contacto_primeraVez → ¿Es Nuevo Contacto?

**Proceso:**
1. **Contacto_primeraVez:** Busca el contacto en la base de datos
   - Consulta tabla "Contactos" por número de teléfono

2. **¿Es Nuevo Contacto?:** Verifica si existe registro previo
   - **SI es nuevo** → Envía mensaje de bienvenida
   - **NO es nuevo** → Continúa con procesamiento normal

### FASE 4: MENSAJE DE BIENVENIDA (Solo nuevos contactos)
**Nodos involucrados:** Mensaje de Bienvenida → Enviar Bienvenida → Guardar Nuevo Contacto → DeletePrimerMensaje

**Mensaje de Bienvenida:**
```
¡Hola [Nombre]! 👋

Soy el asistente virtual de **Totodrilo IA** 🤖

Somos una agencia especializada en automatización con Inteligencia Artificial. Te ayudamos a:

✅ Automatizar procesos con IA
✅ Crear agentes inteligentes personalizados
✅ Integrar WhatsApp, Instagram, CRM y más
✅ Aumentar tu productividad hasta 10x

¿En qué puedo ayudarte hoy?

💡 Puedes preguntarme sobre:
- Nuestros servicios
- Precios y planes
- Casos de éxito
- Agendar una demo
- Consultoría gratuita
```

**Proceso:**
1. Crea el mensaje personalizado con el nombre del cliente
2. Envía vía Chatwoot API
3. Guarda contacto en tabla "CONTACTOS_TOTODRILO" con:
   - Nombre
   - Teléfono
   - Fecha de primer contacto
   - Status: "nuevo"
4. Limpia el buffer de mensajes

### FASE 5: BUFFER Y AGRUPACIÓN DE MENSAJES
**Nodos involucrados:** push mensaje → Get message buffer → Switch → Wait → Delete3 → Split Out → JSON parse

**Propósito:** Agrupar mensajes rápidos del cliente para responder de forma contextual

**Proceso:**
1. **push mensaje:** Almacena mensaje en Redis con clave `{chat_id}_buffer`
2. **Get message buffer:** Recupera todos los mensajes acumulados
3. **Switch:** Verifica timestamp del último mensaje
   - Si pasaron más de 10 segundos → **Seguir** (procesar ahora)
   - Si no → **Esperar** (dar tiempo para más mensajes)
4. **Wait:** Espera 10 segundos antes de volver a verificar
5. **Delete3:** Elimina el buffer de Redis
6. **Split Out:** Separa cada mensaje individual del array
7. **JSON parse:** Convierte cada mensaje de string a JSON

### FASE 6: PROCESAMIENTO MULTIMODAL
**Nodos involucrados:** Guardar Comentario Original → Switch type → [Audio/Image/Text branches] → Merge

**Proceso:**
1. **Guardar Comentario Original:** Extrae contenido, tipo y URL de archivos

2. **Switch type:** Clasifica el tipo de contenido:
   - **Audio** → Rama de transcripción
   - **Image** → Rama de análisis de imagen
   - **Text** → Rama de texto simple

3. **Rama AUDIO:**
   - **Transcribe a recording (Gemini 2.5 Pro):** Convierte audio a texto
   - **Message a model (GPT-4.1 Mini):** Corrige ortografía y puntuación
   - Prompt: "Eres un corrector experto de transcripciones de audio en español..."

4. **Rama IMAGE:**
   - **Get image:** Descarga la imagen desde URL
   - **Describe image (GPT-4o Mini):** Analiza y describe la imagen
   - Prompt: "Analiza la imagen"

5. **Rama TEXT:**
   - **Text content:** Extrae contenido de texto directamente

6. **Merge:** Unifica todos los tipos de contenido procesados

### FASE 7: CONSULTA DE BASE DE CONOCIMIENTO
**Nodos involucrados:** Get a document → Chat input

**Proceso:**
1. **Get a document:** Obtiene contenido de Google Doc con ID `1_M5yEKHk9EzQEfInhpepD712u91PkIK9Otl6scUKaeo`
   - Este documento contiene la base de conocimiento de Totodrilo IA
   
2. **Chat input:** Prepara el input final para el agente con:
   - Mensaje del cliente (texto/audio transcrito/imagen analizada)
   - Nombre del cliente
   - Contenido de la base de conocimiento

### FASE 8: AGENTE IA CONVERSACIONAL
**Nodos involucrados:** Agente IA Totodrilo → OpenAI GPT-4o Mini → Simple Memory → Calculator

**Configuración del Agente:**

**System Message (Prompt Principal):**
```
1. ROL E IDENTIDAD
SYSTEM MESSAGE PROMPT para Agente IA de WhatsApp [Totodrilo IA]

INSTRUCCIONES DE ALTO NIVEL: 
Eres [Totodrilo IA], un agente conversacional experto. 
Tu único y principal objetivo es agendar la consulta gratuita de 30 minutos con un especialista.

1. ROL, IDENTIDAD Y CONTEXTO
- Nombre: [Totodrilo IA]
- Rol: Experto de una agencia de automatización de mensajería y atención al cliente
- Especialidad: Automatizar la comunicación con IA para e-commerce y servicios de delivery
- Propuesta de Valor: "Nos adaptamos a tu presupuesto"
- Servicio clave: CHATBOT CON IA PARA WHATSAPP
- Tecnología: n8n + OpenAI GPT-4 / Claude

2. OBJETIVO Y REGLAS DE COMUNICACIÓN
- Objetivo: Agendar la Primera consulta completamente gratuita de 30 minutos
- Tono: Amigable pero profesional, simple y claro
- Frases Obligatorias:
  • "Nos adaptamos a tu presupuesto"
  • "Primera consulta completamente gratuita"
  • "En 1-2 semanas puedes tenerlo funcionando"

3. FLUJO CONVERSACIONAL ESTRUCTURADO
1. Saludo y Contexto
2. Calificación (Nicho): ¿E-commerce o mensajería/delivery?
3. Identificación del Dolor: ¿Qué automatizar?
4. Explicación de la Solución WhatsApp
5. Mención de Precio y Planes:
   - Opción 1: Pago Único (desde $250 USD)
   - Opción 2: Plan Mensual (desde $150 USD/mes)
6. Cierre: Agendar consulta gratuita

4. CONOCIMIENTO ESPECÍFICO
- Funcionalidades: Responder preguntas, enviar catálogo, informar precios, 
  explicar métodos de pago, detallar costos de envío, pasar a humano
- Tiempos: 1-2 semanas de implementación
- Costos API: $20-50 USD/mes
- WhatsApp Business API: Gratis hasta 1,000 conversaciones/mes

5. MANEJO DE OBJECIONES
- "Es caro" → Adaptamos a presupuesto, ROI rápido (15h/semana ahorradas)
- "Es técnico" → Nosotros hacemos la parte técnica
- "No funciona" → 30 días de soporte, lo arreglamos hasta que funcione
```

**User Message (Input):**
```
Nombre del Cliente: {{ client_name }}
Mensaje: {{ mensajes }} {{ Mensaje }}
Mensaje audio: {{ audio }}
Análisis de imagen: {{ image_analysis }}
Contexto: El cliente está contactando a Totodrilo
Base de conocimiento: {{ document_content }}
```

**Componentes del Agente:**
- **Modelo:** OpenAI GPT-4o Mini (eficiente y rápido)
- **Memoria:** Simple Memory con session ID = conversation_id
- **Herramientas:** Calculator (para cálculos de ROI, precios, etc.)

### FASE 9: ENVÍO DE RESPUESTA
**Nodos involucrados:** Enviar Respuesta

**Proceso:**
1. Toma el output del agente IA
2. Envía vía Chatwoot API POST a:
   ```
   https://totodrilo.nicovaz.tech/api/v1/accounts/{account_id}/conversations/{conversation_id}/messages
   ```
3. Headers: `api_access_token: npJ8WS2gXSuxNWtFppZVDEgK`
4. Body: `{ "content": "{{ output }}" }`

### FASE 10: CLASIFICACIÓN DE INTENCIÓN
**Nodos involucrados:** Clasificador de Intención → OpenAI Classifier

**Categorías de Intención:**
- `consulta_servicios` - Pregunta sobre qué hacemos
- `consulta_precios` - Pregunta sobre costos
- `solicitud_demo` - Quiere ver demostración
- `lead_caliente` - Listo para contratar
- `soporte_tecnico` - Problema técnico
- `queja` - Insatisfacción
- `seguimiento` - Continuación de conversación
- `otro` - Otros casos

**Prompt del Clasificador:**
```
Clasifica la intención del cliente en UNA de estas categorías:
[lista de categorías]

Responde SOLO con la categoría, sin explicación.

Último mensaje del cliente: {{ mensaje_cliente }}
Mensaje que se va a mandar desde el agente IA: {{ respuesta_agente }}
```

### FASE 11: ACTUALIZACIÓN DE CONTACTO
**Nodos involucrados:** Actualizar Contacto

**Proceso:**
1. Operación: UPSERT en tabla "Contacto Totodrilo"
2. Filtro: Busca por número de teléfono
3. Actualiza:
   - Nombre
   - Teléfono
   - Status (intención clasificada)
   - Último mensaje

### FASE 12: NOTIFICACIONES INTELIGENTES
**Nodos involucrados:** ¿Lead Caliente? → Notificar Lead Caliente / ¿Es Queja? → Notificar Queja

**A) NOTIFICACIÓN DE LEAD CALIENTE**
- **Condición:** Intención = "lead_caliente" OR "solicitud_demo"
- **Canal:** Telegram
- **Mensaje:**
```
🔥 **LEAD CALIENTE - WHATSAPP** 🔥

👤 **Cliente:** {{ client_name }}
📱 **Teléfono:** {{ client_phone }}

💬 **Último Mensaje:**
{{ message_content }}

🎯 **Intención:** {{ intention }}

⚡ **ACCIÓN REQUERIDA: Contactar URGENTE**
```

**B) NOTIFICACIÓN DE QUEJA**
- **Condición:** Intención = "queja"
- **Canal:** Telegram
- **Mensaje:**
```
⚠️ **ALERTA: QUEJA DE CLIENTE - WHATSAPP** ⚠️

👤 **Cliente:** {{ client_name }}
📱 **Teléfono:** {{ client_phone }}

💬 **Mensaje:**
{{ message_content }}

🔴 **REQUIERE ATENCIÓN HUMANA INMEDIATA**
```

---

## 🗄️ ESTRUCTURA DE DATOS

### Tabla: CONTACTOS_TOTODRILO
```
- name (string): Nombre del contacto
- phone (string): Número de teléfono
- first_contact (datetime): Fecha de primer contacto
- status (string): Estado del contacto (nuevo, lead_caliente, etc.)
```

### Tabla: Contacto Totodrilo
```
- name (string): Nombre del contacto
- phone (string): Número de teléfono
- first_contact (datetime): Primer contacto
- last_contact (datetime): Último contacto
- last_intent (string): Última intención detectada
- last_message (string): Último mensaje enviado
- status (string): Estado actual
```

### Tabla: Totodrilo_Ignorar_contacto
```
- Numero (string): Número de teléfono a ignorar
```

### Redis Buffer
```
Clave: {chat_id}_buffer
Valor: Array de mensajes JSON stringificados
TTL: Se elimina después de procesar
```

### PostgreSQL Memory
```
Tabla: Memoria de Conversación
- session_id: conversation_id de Chatwoot
- context_window: 20 mensajes
- Almacena historial completo de conversaciones
```

---

## 🔧 INTEGRACIONES Y CREDENCIALES

### OpenAI
- **Credential ID:** 38K6WniN0oA8BUTF
- **Nombre:** OpenAi NNN
- **Modelos usados:**
  - GPT-4o Mini (agente principal y clasificador)
  - GPT-4.1 Mini (corrección de transcripciones)

### Google Gemini
- **Credential ID:** zCVQeYs0Vplc7Fwt
- **Nombre:** Google Gemini(PaLM) Api NNN
- **Modelo:** gemini-2.5-pro
- **Uso:** Transcripción de audio

### PostgreSQL
- **Credential ID:** CA3yUGaKA28m6VnZ
- **Nombre:** Postgres Totodrilo WhatsApp
- **Uso:** Memoria conversacional persistente

### Redis
- **Credential ID:** KsyQch0EPd0tuwUv
- **Nombre:** Redis account
- **Uso:** Buffer temporal de mensajes

### Google Docs
- **Credential ID:** o6OVfYEtOomdQS67
- **Nombre:** Google Docs NNN
- **Document ID:** 1_M5yEKHk9EzQEfInhpepD712u91PkIK9Otl6scUKaeo
- **Uso:** Base de conocimiento

### Telegram (Leads)
- **Credential ID:** En28ociH3xBLx7jO
- **Nombre:** Telegram Leads cliente Totodrilo
- **Uso:** Notificaciones de leads calientes

### Telegram (Quejas)
- **Credential ID:** zDQsVBJaex0Dzw9G
- **Nombre:** Telegram Queja Totodrilo
- **Uso:** Notificaciones de quejas

### Chatwoot API
- **Base URL:** https://totodrilo.nicovaz.tech/api/v1
- **Token:** npJ8WS2gXSuxNWtFppZVDEgK
- **Account ID:** 4
- **Inbox ID:** 15
- **Inbox Name:** Totodrilo IA WhatsAPP

---

## 📊 MÉTRICAS Y KPIs

### Métricas Rastreadas
1. **Contactos nuevos** - Guardados en CONTACTOS_TOTODRILO
2. **Intenciones clasificadas** - Distribuidas en 8 categorías
3. **Leads calientes** - Notificados vía Telegram
4. **Quejas** - Alertas inmediatas al equipo
5. **Tiempo de respuesta** - Inmediato (< 2 segundos)
6. **Tipos de contenido procesados** - Texto, audio, imagen

### Optimizaciones de Rendimiento
- **Buffer de mensajes:** Agrupa mensajes rápidos (10 seg) para respuestas contextuales
- **Modelo eficiente:** GPT-4o Mini para balance costo/calidad
- **Memoria de ventana:** Solo 20 mensajes recientes para contexto
- **Caché de contactos:** Evita consultas repetidas a DB

---

## 🚀 CASOS DE USO PRINCIPALES

### 1. Cliente Nuevo Pregunta por Servicios
```
Cliente: "Hola, qué servicios ofrecen?"
→ Mensaje de bienvenida automático
→ Agente responde con servicios de Totodrilo
→ Clasificación: consulta_servicios
→ Actualiza contacto en DB
```

### 2. Cliente Interesado en Precios
```
Cliente: "Cuánto cuesta el chatbot de WhatsApp?"
→ Agente menciona opciones ($250 único / $150 mensual)
→ Enfatiza "nos adaptamos a tu presupuesto"
→ Clasificación: consulta_precios
→ Guía hacia agendar consulta gratuita
```

### 3. Lead Caliente Listo para Contratar
```
Cliente: "Quiero contratarlo, cuándo empezamos?"
→ Agente responde con siguiente paso
→ Clasificación: lead_caliente
→ 🔥 NOTIFICACIÓN TELEGRAM AL EQUIPO
→ Equipo contacta urgentemente
```

### 4. Cliente Envía Audio
```
Cliente: [Audio de 30 segundos preguntando por integración con Instagram]
→ Gemini transcribe audio
→ GPT-4.1 corrige transcripción
→ Agente responde sobre integración Instagram
→ Clasificación según contenido
```

### 5. Cliente Envía Imagen
```
Cliente: [Captura de pantalla de su tienda online]
→ GPT-4o Mini analiza imagen
→ Agente responde contextualmente sobre automatización para ese tipo de tienda
→ Clasificación según conversación
```

### 6. Queja de Cliente
```
Cliente: "El bot no funciona bien, estoy muy molesto"
→ Agente responde empáticamente
→ Clasificación: queja
→ ⚠️ ALERTA TELEGRAM AL EQUIPO
→ Atención humana inmediata
```

---

## 🔐 SEGURIDAD Y CONTROL

### Mecanismos de Seguridad
1. **Bot On/Off:** Control manual por atributo personalizado
2. **Lista de ignorados:** Tabla de contactos a no procesar
3. **Validación de mensajes:** Solo procesa "incoming", ignora "outgoing"
4. **API Token:** Autenticación en todas las llamadas a Chatwoot
5. **Session isolation:** Memoria separada por conversation_id

### Prevención de Loops
- Filtro de mensajes salientes (del bot)
- Validación de tipo de mensaje
- Control de estado del bot

---

## 📈 FLUJO DE DATOS COMPLETO (DIAGRAMA TEXTUAL)

```
WEBHOOK WHATSAPP
    ↓
NORMALIZAR DATOS (extrae campos clave)
    ↓
FILTRAR MENSAJES ENTRANTES (solo incoming)
    ↓
BOT ON/OFF (verifica estado)
    ↓
CONTACTO IGNORAR (consulta lista)
    ↓
IF IGNORAR MENSAJE (decide continuar)
    ↓
CONTACTO PRIMERA VEZ (busca en DB)
    ↓
¿ES NUEVO CONTACTO?
    ├─ SÍ → MENSAJE BIENVENIDA → ENVIAR → GUARDAR CONTACTO
    └─ NO → CONTINUAR
    ↓
PUSH MENSAJE (Redis buffer)
    ↓
GET MESSAGE BUFFER
    ↓
SWITCH (verifica timestamp)
    ├─ < 10 seg → WAIT 10 seg → loop
    └─ > 10 seg → CONTINUAR
    ↓
DELETE BUFFER
    ↓
SPLIT OUT (separa mensajes)
    ↓
JSON PARSE
    ↓
GUARDAR COMENTARIO ORIGINAL
    ↓
SWITCH TYPE
    ├─ AUDIO → TRANSCRIBE (Gemini) → CORREGIR (GPT-4.1)
    ├─ IMAGE → GET IMAGE → DESCRIBE (GPT-4o Mini)
    └─ TEXT → TEXT CONTENT
    ↓
MERGE (unifica contenido)
    ↓
GET DOCUMENT (base de conocimiento)
    ↓
CHAT INPUT (prepara prompt)
    ↓
AGENTE IA TOTODRILO (GPT-4o Mini + Memory + Calculator)
    ↓
ENVIAR RESPUESTA (Chatwoot API)
    ↓
CLASIFICADOR DE INTENCIÓN (GPT-4o Mini)
    ↓
ACTUALIZAR CONTACTO (DB)
    ↓
¿LEAD CALIENTE? ─ SÍ → NOTIFICAR TELEGRAM
    ↓
¿ES QUEJA? ─ SÍ → NOTIFICAR TELEGRAM
    ↓
FIN
```

---

## 💡 VENTAJAS COMPETITIVAS DEL SISTEMA

1. **Multimodal:** Procesa texto, audio e imágenes
2. **Contextual:** Memoria persistente de conversaciones
3. **Inteligente:** Clasificación automática de intenciones
4. **Proactivo:** Notificaciones automáticas al equipo
5. **Escalable:** Maneja múltiples conversaciones simultáneas
6. **Personalizado:** Mensaje de bienvenida para nuevos contactos
7. **Eficiente:** Buffer de mensajes para respuestas contextuales
8. **Controlable:** Sistema On/Off y lista de ignorados
9. **Medible:** Tracking de intenciones y estados de contactos
10. **Profesional:** Tono y estructura conversacional optimizada

---

## 🎓 APRENDIZAJES Y MEJORES PRÁCTICAS

### Diseño del Prompt
- System message detallado con flujo conversacional estructurado
- Frases obligatorias para consistencia de marca
- Manejo explícito de objeciones comunes
- Objetivo claro: agendar consulta gratuita

### Gestión de Memoria
- Ventana de 20 mensajes para balance contexto/costo
- Session ID por conversation_id para aislamiento
- PostgreSQL para persistencia a largo plazo

### Procesamiento Multimodal
- Gemini para audio (mejor calidad de transcripción)
- GPT-4o Mini para imágenes (visión + texto)
- Corrección post-transcripción para mejorar calidad

### Optimización de Costos
- GPT-4o Mini en lugar de GPT-4 (90% más barato)
- Buffer de mensajes para reducir llamadas a API
- Memoria de ventana limitada

### UX Conversacional
- Mensaje de bienvenida solo para nuevos contactos
- Respuestas agrupadas para mensajes rápidos
- Clasificación de intención para priorización

---

## 🔮 POSIBLES MEJORAS FUTURAS

1. **Análisis de sentimiento** en tiempo real
2. **A/B testing** de mensajes de bienvenida
3. **Integración con CRM** (HubSpot, Salesforce)
4. **Dashboard de métricas** en tiempo real
5. **Respuestas con multimedia** (imágenes, videos)
6. **Detección de idioma** automática
7. **Handoff inteligente** a humano cuando sea necesario
8. **Seguimiento automatizado** de leads fríos
9. **Integración con calendario** para agendar directamente
10. **Análisis de conversaciones** con BI

---

## 📞 INFORMACIÓN DE CONTACTO Y SOPORTE

**Agencia:** Totodrilo IA  
**Servicio:** Automatización de mensajería con IA  
**Especialidad:** E-commerce y Delivery  
**Propuesta de Valor:** "Nos adaptamos a tu presupuesto"  
**Consulta Gratuita:** 30 minutos  
**Tiempo de Implementación:** 1-2 semanas  
**Precios:**
- Pago Único: desde $250 USD
- Plan Mensual: desde $150 USD/mes

---

## 📝 NOTAS TÉCNICAS ADICIONALES

### Webhook Configuration
- **URL:** https://n8n.nicovaz.tech/webhook/Totodrilo
- **Método:** POST
- **Evento:** message_created (Chatwoot)

### Execution Settings
- **Execution Order:** v1
- **Mode:** Production
- **Active:** true

### Data Tables (n8n)
- CONTACTOS_TOTODRILO
- Contacto Totodrilo (BXLWzH1anuoGtyBh)
- Contactos (UVRs9uazWAc9emdN)
- Totodrilo_Ignorar_contacto (LnZnc4ILwn5AiQpw)

---

**Documento creado para:** NotebookLM - Base de Conocimiento Totodrilo IA  
**Fecha:** 2025  
**Versión del Workflow:** 4f21d93c-41ae-406c-b384-f355d13f1eea  
**Workflow ID:** FWZHoQLIi8r8Paag

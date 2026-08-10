# Copiloto del Gerente — qué hace falta antes de meter un cliente real

> **Esto no es asesoramiento jurídico.** Es el mapa de lo que la herramienta
> hace con los datos, para que puedas llevárselo a tu gestoría o a un abogado
> de protección de datos y que ellos redacten y validen lo que toque.
> Los puntos marcados ⚠️ son los que una plantilla estándar de gestoría
> normalmente **no** cubre sola: si no los mencionas tú, no van a salir.

---

## 1. Quién es quién

Esto determina todo lo demás, así que conviene tenerlo claro antes de hablar
con nadie:

| Papel | Quién | Qué significa |
|---|---|---|
| **Responsable del tratamiento** | La empresa cliente | Es quien decide usar la herramienta con los datos de su plantilla |
| **Encargado del tratamiento** | Loke | Trata esos datos por cuenta del cliente, siguiendo sus instrucciones |
| **Subencargados** | Anthropic, Supabase, Vercel, Resend | Proveedores de Loke que también tocan el dato ⚠️ |

El gerente que escribe no es "el interesado": los interesados son **los
empleados de los que se habla**, que no están presentes en la conversación y
normalmente no saben que existe.

## 2. Qué datos entran de verdad

Importante ser honesto aquí, porque condiciona el nivel de exigencia:

- Nombre o identificación de empleados concretos
- Conducta, rendimiento, absentismo, conflictos con compañeros
- **Datos de salud** cuando el gerente menciona bajas, ansiedad, problemas
  personales → categoría especial, artículo 9 RGPD ⚠️
- **Posibles indicios de acoso o conductas sancionables** → material sensible,
  con consecuencias laborales y a veces penales ⚠️

No es un CRM. Es información delicada sobre personas en situación de
subordinación laboral. Todo lo de abajo se explica por esto.

---

## 3. Lo que hay que preparar

### 3.1 Contrato de Encargado del Tratamiento (uno por empresa cliente)
Obligatorio, artículo 28 RGPD. Sin esto firmado no deberías dar de alta a
ningún gerente. Tu gestoría tendrá plantilla, pero asegúrate de que incluye:

- Finalidad, duración y tipo de datos tratados
- Categorías de interesados (empleados de la empresa cliente)
- **Autorización expresa de los subencargados** con su lista ⚠️ — Anthropic,
  Supabase, Vercel y Resend. Si no están nombrados, técnicamente no puedes
  usarlos.
- Obligación de asistir al cliente si un empleado ejerce sus derechos
- Qué pasa con los datos al terminar el contrato (devolución o borrado)

### 3.2 ⚠️ Transferencias internacionales
Este punto se pasa por alto casi siempre y aquí aplica de lleno:

| Proveedor | Dónde | Situación |
|---|---|---|
| Supabase | Irlanda (eu-west-1) | Dentro de la UE ✅ |
| **Anthropic** | EE. UU. | Transferencia internacional ⚠️ |
| Vercel | EE. UU. (empresa) | Revisar |
| Resend | EE. UU. (empresa) | Revisar |

Hay que **verificar y documentar** el mecanismo de cada uno: adhesión al *EU-US
Data Privacy Framework*, o Cláusulas Contractuales Tipo (SCC) firmadas, o
ambas. Los cuatro publican su DPA — hay que descargarlos, aceptarlos donde
haga falta y guardarlos. Es papeleo, pero es el papeleo que te piden si algún
día hay una inspección o un cliente grande hace due diligence.

**Además, para Anthropic**: comprobar y dejar por escrito que los datos
enviados por API **no se usan para entrenar modelos** (así es por defecto en la
API de pago, a diferencia de los productos de consumo) y cuál es su política de
retención. Esto es justo lo que un cliente te va a preguntar, y la respuesta
juega a favor.

### 3.3 ⚠️ Evaluación de Impacto (EIPD)
Artículo 35 RGPD. Es probable que sea **obligatoria**, no opcional, porque se
juntan varios factores de los que la disparan:

- Datos de categoría especial (salud)
- Interesados en situación de vulnerabilidad (relación laboral)
- Evaluación de aspectos personales de trabajadores
- Uso de inteligencia artificial

Si el abogado concluye que no hace falta, perfecto — pero que quede esa
conclusión por escrito y motivada. Es la diferencia entre "no la hicimos" y
"la valoramos y no procedía".

### 3.4 ⚠️ Información a los empleados
Los empleados de los que se habla tienen derecho a saber que esto existe.
La obligación es del cliente (es el responsable), pero:

- Es Loke quien sabe cómo funciona la herramienta
- Si el cliente no informa, el problema acaba salpicando igualmente

**Prepara un texto tipo** que el cliente pueda incorporar a su información
laboral de protección de datos. Se lo das hecho: le quitas trabajo y te
aseguras de que se hace bien. Va en tu interés.

### 3.5 Política de conservación y borrado
Hay que decidirlo y escribirlo, no dejarlo implícito:

- Cuánto tiempo se guarda una conversación
- Qué pasa cuando un cliente se da de baja
- Cómo se atiende una solicitud de supresión de un empleado concreto

Técnicamente ya está resuelto (borrar la fila de `clientes` arrastra en cascada
gerentes, conversaciones y mensajes — ver el final de `supabase/schema.sql`),
pero **tener el botón no es tener la política**.

### 3.6 Registro de Actividades de Tratamiento
Artículo 30. Como encargado, Loke debe llevar su propio registro de los
tratamientos que hace por cuenta de cada cliente. Suele olvidarse porque se
asocia solo a los responsables, pero aplica a los encargados también.

### 3.7 Medidas de seguridad (documentarlas)
Buena noticia: ya están implementadas, solo hay que ponerlas por escrito.

- Acceso solo por invitación, alta manual, sin registro abierto
- Entrada por código de un solo uso, sin contraseñas almacenadas
- Aislamiento por cliente a nivel de base de datos (RLS): cada gerente solo
  ve lo suyo
- Datos alojados en la UE (Irlanda)
- Cifrado en tránsito y en reposo (lo da Supabase)
- **Acceso de Loke**: actualmente solo Fran, con rol admin, puede leer todas
  las conversaciones. Esto hay que declararlo, no esconderlo.

### 3.8 Política de privacidad
La de loke.es probablemente no cubre esto. Necesita un apartado específico de
la herramienta: qué datos, con qué base jurídica, quién los trata, dónde están
y cuánto duran.

---

## 4. Lo que ya está hecho en la propia herramienta

- Aviso permanente bajo el cuadro de escritura: *"El Copiloto estructura y
  agiliza. La interpretación y la decisión final son tuyas. Loke guarda estas
  conversaciones para el seguimiento de tu servicio."*
  → **Revisar con el abogado si es suficiente** o hay que ampliarlo.
- El prompt tiene instrucción explícita de no dar asesoramiento jurídico y de
  no proponer mediación ante indicios de acoso, derivando a protocolo formal.
- Los avisos por correo no incluyen contenido de las conversaciones.
- Los datos viven en la UE.

## 5. Orden sugerido

1. Contrato de encargado del tratamiento (bloquea dar de alta clientes)
2. DPA y transferencias internacionales de los cuatro proveedores
3. Valoración de si procede EIPD
4. Texto informativo para los empleados
5. Política de conservación + apartado en política de privacidad
6. Registro de actividades

**Mientras tanto**: puedes seguir probándolo tú y con gente de confianza que
sepa que es una prueba. Lo que no conviene es dar de alta a una empresa cliente
real con datos de su plantilla antes de tener al menos el punto 1 y el 2.

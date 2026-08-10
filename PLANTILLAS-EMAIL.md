# Plantillas de correo (Supabase)

Se pegan en **Supabase → Authentication → Emails → Templates**, cada una en la
suya. Están aquí para que queden versionadas: el panel de Supabase no guarda
histórico y si alguien las pisa, no hay forma de recuperarlas.

## Criterios de diseño

- **El código va arriba del todo.** Es lo único que la persona necesita; todo
  lo demás es contexto que puede leer o no.
- **Funciona con las imágenes bloqueadas.** Gmail y Outlook no cargan imágenes
  remotas hasta que el usuario lo autoriza, así que el logo lleva `alt` y
  debajo va el nombre en texto: si la imagen no carga, el correo sigue
  identificándose como Loke.
- **La explicación de qué es el Copiloto va al pie, no arriba.** Esta plantilla
  se envía en *cada* acceso, no solo el primero: al que entra por vigésima vez
  no hay que explicarle qué es la herramienta cada vez, pero al que la recibe
  por primera vez tiene que estar a mano.
- Sin emojis, sin "¡Hola!", sin exclamaciones. Es un correo funcional.

> **Antes de usarlas**: el logo se sirve desde
> `https://copiloto-del-gerente.vercel.app/logo-loke.png`, así que necesita que
> el despliegue con ese archivo esté publicado. Si cambias el dominio de la
> app, hay que cambiar esa URL en las tres plantillas.

---

## 1. Magic Link — código de acceso

**Es la que se usa de verdad.** Se envía cada vez que alguien pide entrar.

**Asunto:**

```
Tu código de acceso — Copiloto del Gerente
```

**Cuerpo:**

```html
<div style="max-width:480px;margin:0 auto;padding:32px 24px;font-family:Arial,Helvetica,sans-serif;color:#2d2a26;">

  <div style="border-bottom:3px solid #ff4713;padding-bottom:16px;margin-bottom:28px;">
    <img src="https://copiloto-del-gerente.vercel.app/logo-loke.png" width="40" height="40" alt="Loke" style="display:block;border:0;margin-bottom:8px;">
    <div style="font-size:18px;font-weight:700;">Loke</div>
    <div style="font-size:13px;color:#6b6560;">Copiloto del Gerente</div>
  </div>

  <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">Tu código para entrar:</p>

  <div style="font-size:32px;font-weight:700;letter-spacing:8px;text-align:center;background:#fff0eb;color:#ff4713;padding:20px;border-radius:8px;margin:0 0 20px;">{{ .Token }}</div>

  <p style="font-size:14px;line-height:1.6;color:#6b6560;margin:0 0 28px;">
    Caduca en unos minutos y solo se puede usar una vez. Si no has pedido este
    código, ignora este correo: no ha pasado nada.
  </p>

  <div style="border-top:1px solid #e8e4df;padding-top:20px;">
    <p style="font-size:13px;line-height:1.6;color:#6b6560;margin:0 0 8px;">
      El Copiloto del Gerente es la herramienta de Loke para ayudarte a decidir
      sobre tu equipo entre sesión y sesión: le cuentas la situación, te hace
      las preguntas que faltan y te devuelve una lectura profesional con un
      plan concreto.
    </p>
    <p style="font-size:13px;line-height:1.6;color:#6b6560;margin:0;">
      ¿Dudas? Escribe a <a href="mailto:fsedano@loke.es" style="color:#ff4713;">fsedano@loke.es</a>.
    </p>
  </div>

</div>
```

---

## 2. Confirm signup

No debería enviarse nunca — al dar de alta a alguien se marca **Auto Confirm
User**, y el registro abierto está desactivado. Se deja traducida y con marca
por si algún día se olvida marcar esa casilla: mejor que reciba esto y no la
plantilla genérica en inglés de Supabase.

**Asunto:**

```
Confirma tu acceso — Copiloto del Gerente
```

**Cuerpo:**

```html
<div style="max-width:480px;margin:0 auto;padding:32px 24px;font-family:Arial,Helvetica,sans-serif;color:#2d2a26;">

  <div style="border-bottom:3px solid #ff4713;padding-bottom:16px;margin-bottom:28px;">
    <img src="https://copiloto-del-gerente.vercel.app/logo-loke.png" width="40" height="40" alt="Loke" style="display:block;border:0;margin-bottom:8px;">
    <div style="font-size:18px;font-weight:700;">Loke</div>
    <div style="font-size:13px;color:#6b6560;">Copiloto del Gerente</div>
  </div>

  <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
    Loke te ha dado acceso al Copiloto del Gerente. Usa este código para
    confirmar tu cuenta:
  </p>

  <div style="font-size:32px;font-weight:700;letter-spacing:8px;text-align:center;background:#fff0eb;color:#ff4713;padding:20px;border-radius:8px;margin:0 0 20px;">{{ .Token }}</div>

  <p style="font-size:14px;line-height:1.6;color:#6b6560;margin:0 0 28px;">
    Si no esperabas este correo, escríbenos antes de usarlo.
  </p>

  <div style="border-top:1px solid #e8e4df;padding-top:20px;">
    <p style="font-size:13px;line-height:1.6;color:#6b6560;margin:0;">
      ¿Dudas? Escribe a <a href="mailto:fsedano@loke.es" style="color:#ff4713;">fsedano@loke.es</a>.
    </p>
  </div>

</div>
```

---

## 3. Invite user

Tampoco se usa: las altas se hacen con *Create new user*, no con invitación
(ver `PASO-A-PASO.md`, paso 6). Igual que la anterior, se deja preparada por si
algún día se pulsa el botón equivocado.

**Asunto:**

```
Te han dado acceso al Copiloto del Gerente
```

**Cuerpo:**

```html
<div style="max-width:480px;margin:0 auto;padding:32px 24px;font-family:Arial,Helvetica,sans-serif;color:#2d2a26;">

  <div style="border-bottom:3px solid #ff4713;padding-bottom:16px;margin-bottom:28px;">
    <img src="https://copiloto-del-gerente.vercel.app/logo-loke.png" width="40" height="40" alt="Loke" style="display:block;border:0;margin-bottom:8px;">
    <div style="font-size:18px;font-weight:700;">Loke</div>
    <div style="font-size:13px;color:#6b6560;">Copiloto del Gerente</div>
  </div>

  <p style="font-size:15px;line-height:1.6;margin:0 0 20px;">
    Loke te ha dado acceso al Copiloto del Gerente, la herramienta que te ayuda
    a decidir sobre tu equipo entre sesión y sesión.
  </p>

  <p style="margin:0 0 28px;">
    <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#ff4713;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 24px;border-radius:8px;">Activar mi acceso</a>
  </p>

  <div style="border-top:1px solid #e8e4df;padding-top:20px;">
    <p style="font-size:13px;line-height:1.6;color:#6b6560;margin:0;">
      ¿Dudas? Escribe a <a href="mailto:fsedano@loke.es" style="color:#ff4713;">fsedano@loke.es</a>.
    </p>
  </div>

</div>
```

---

## Las que no hace falta tocar

**Reset Password** y **Reauthentication** no son alcanzables desde esta app: no
hay contraseñas ni pantalla que las dispare. Se pueden dejar como están.

**Change Email Address** tampoco está expuesta en la interfaz. Si algún día se
añade la opción de cambiar de correo, habrá que traducirla también.

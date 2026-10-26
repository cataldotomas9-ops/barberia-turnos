# Barbería Don Ramón · Turnos por WhatsApp

Sitio de ejemplo de una barbería de barrio (ficticia, en Bahía Blanca). El cliente elige servicio, barbero, día y horario, escribe su nombre y toca "Pedir turno por WhatsApp": se abre WhatsApp con el mensaje armado. Si falta algún dato, el botón dice cuál.

React 18 + Vite. Sin dependencias extra.

## Comandos

```
npm install
npm run dev      # desarrollo
npm test         # pruebas de la lógica (node --test)
npm run build    # genera dist/
```

## Cómo está armado

- `src/config.js`: nombre, dirección, teléfono, horarios, servicios y barberos. Es lo único que hay que cambiar para otra barbería.
- `src/turnos.js`: lógica pura (próximos 6 días, grilla según duración del servicio, ocupados, mensaje y link de WhatsApp).
- `src/turnos.test.js`: pruebas.
- `src/App.jsx` y `src/styles.css`: la página.

## Notas

- Los horarios ocupados salen de una función fija de fecha, barbero y hora, sin azar: en un sitio real vendrían de una agenda. Con "me da igual" un horario figura ocupado solo si los tres barberos lo están.
- El número de WhatsApp es de ejemplo (`5491112345678`). Cambialo en `config.js`.
- El turno no se reserva solo: lo confirma el barbero por WhatsApp.

Sitio de ejemplo hecho por Tomás Cataldo.

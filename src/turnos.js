import { horarios, barberos, PASO, DIAS_VISIBLES } from './config.js'

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

const dosDigitos = (n) => String(n).padStart(2, '0')

// 'YYYY-MM-DD' en hora local, sin pasar por UTC.
export function aFecha(d) {
  return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`
}

export function desdeFecha(fecha) {
  const [y, m, d] = fecha.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function minutosAHora(min) {
  return `${dosDigitos(Math.floor(min / 60))}:${dosDigitos(min % 60)}`
}

export function horaAMinutos(hora) {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

// Los próximos `n` días desde `desde` (inclusive), con si abren o no.
export function proximosDias(desde, n = DIAS_VISIBLES) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate() + i)
    const dow = d.getDay()
    return {
      fecha: aFecha(d),
      dow,
      nombre: DIAS[dow],
      numero: d.getDate(),
      mes: MESES[d.getMonth()],
      cerrado: horarios[dow].length === 0,
    }
  })
}

// Horas de inicio posibles ese día para un servicio de `minutos`: el turno tiene que terminar antes del cierre del bloque.
export function generarHorarios(fecha, minutos) {
  const bloques = horarios[desdeFecha(fecha).getDay()]
  const salida = []
  for (const [ini, fin] of bloques) {
    for (let t = ini * 60; t + minutos <= fin * 60; t += PASO) salida.push(minutosAHora(t))
  }
  return salida
}

// Hash simple y fijo: mismo día, barbero y hora dan siempre el mismo resultado. Ronda el 35 % de ocupados.
function hash(texto) {
  let h = 7
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) % 1000003
  return h
}

export function barberoOcupado(fecha, barberoId, hora) {
  return hash(`${fecha}|${barberoId}|${hora}`) % 100 < 35
}

// Con "me da igual" (barberoId vacío) solo está ocupado si lo están los tres.
export function estaOcupado(fecha, barberoId, hora) {
  if (barberoId) return barberoOcupado(fecha, barberoId, hora)
  return barberos.every((b) => barberoOcupado(fecha, b.id, hora))
}

// Grilla lista para dibujar: [{ hora, ocupado }]. Si es hoy, se descartan los horarios que ya pasaron.
export function grilla(fecha, minutos, barberoId, ahora = null) {
  let horas = generarHorarios(fecha, minutos)
  if (ahora && aFecha(ahora) === fecha) {
    const actual = ahora.getHours() * 60 + ahora.getMinutes()
    horas = horas.filter((h) => horaAMinutos(h) > actual)
  }
  return horas.map((hora) => ({ hora, ocupado: estaOcupado(fecha, barberoId, hora) }))
}

export function formatoPrecio(n) {
  return '$' + n.toLocaleString('es-AR')
}

export function etiquetaDia(fecha) {
  const d = desdeFecha(fecha)
  return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`
}

// Devuelve qué falta completar; lista vacía = se puede pedir.
export function faltantes({ servicio, fecha, hora, nombre }) {
  const f = []
  if (!servicio) f.push('el servicio')
  if (!fecha) f.push('el día')
  if (!hora) f.push('el horario')
  if (!nombre || !nombre.trim()) f.push('tu nombre')
  return f
}

export function textoFaltantes(lista) {
  if (lista.length === 0) return ''
  const y = lista.length > 1 ? `${lista.slice(0, -1).join(', ')} y ${lista[lista.length - 1]}` : lista[0]
  return `Todavía falta: ${y}.`
}

export function mensaje({ servicio, barbero, fecha, hora, nombre }, negocio) {
  const quien = barbero ? barbero.nombre : 'el que esté libre'
  return [
    `Hola, soy ${nombre.trim()}. Quiero sacar un turno en ${negocio.nombre}:`,
    `Servicio: ${servicio.nombre} (${servicio.minutos} min, ${formatoPrecio(servicio.precio)})`,
    `Barbero: ${quien}`,
    `Día: ${etiquetaDia(fecha)}`,
    `Hora: ${hora}`,
    'Quedo atento a la confirmación. Gracias.',
  ].join('\n')
}

export function linkWhatsapp(datos, negocio) {
  return `https://wa.me/${negocio.telefono}?text=${encodeURIComponent(mensaje(datos, negocio))}`
}

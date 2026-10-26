import test from 'node:test'
import assert from 'node:assert/strict'
import {
  proximosDias, generarHorarios, estaOcupado, barberoOcupado, grilla,
  faltantes, textoFaltantes, mensaje, linkWhatsapp, aFecha,
} from './turnos.js'
import { negocio, servicios, barberos } from './config.js'

// 2026-10-26 es lunes
const lunes = new Date(2026, 9, 26)

test('proximosDias da 6 días y marca el domingo como cerrado', () => {
  const dias = proximosDias(new Date(2026, 9, 30)) // viernes
  assert.equal(dias.length, 6)
  assert.deepEqual(dias.map((d) => d.nombre), ['viernes', 'sábado', 'domingo', 'lunes', 'martes', 'miércoles'])
  assert.deepEqual(dias.map((d) => d.cerrado), [false, false, true, false, false, false])
  assert.equal(dias[0].fecha, '2026-10-30')
})

test('lunes: dos bloques y el último turno termina a las 20', () => {
  const h = generarHorarios('2026-10-26', 30)
  assert.equal(h[0], '09:00')
  assert.ok(h.includes('12:30') && !h.includes('13:00') && h.includes('16:00'))
  assert.equal(h[h.length - 1], '19:30')
})

test('un servicio de 60 min no entra en el último medio turno', () => {
  const h = generarHorarios('2026-10-26', 60)
  assert.ok(!h.includes('12:30') && h.includes('12:00'))
  assert.equal(h[h.length - 1], '19:00')
})

test('sábado corta a las 14 y domingo no tiene horarios', () => {
  const sab = generarHorarios('2026-10-31', 30)
  assert.equal(sab[sab.length - 1], '13:30')
  assert.equal(generarHorarios('2026-11-01', 30).length, 0)
})

test('los ocupados son estables: mismo dato, mismo resultado', () => {
  assert.equal(barberoOcupado('2026-10-26', 'hugo', '10:00'), barberoOcupado('2026-10-26', 'hugo', '10:00'))
  const a = grilla('2026-10-26', 30, 'nacho')
  const b = grilla('2026-10-26', 30, 'nacho')
  assert.deepEqual(a, b)
})

test('hay una mezcla razonable de libres y ocupados', () => {
  const g = grilla('2026-10-27', 30, 'chicho')
  const ocupados = g.filter((x) => x.ocupado).length
  assert.ok(ocupados > 0 && ocupados < g.length)
})

test('"me da igual" solo está ocupado si los tres barberos lo están', () => {
  for (const hora of generarHorarios('2026-10-28', 30)) {
    const todos = barberos.every((b) => barberoOcupado('2026-10-28', b.id, hora))
    assert.equal(estaOcupado('2026-10-28', '', hora), todos)
  }
})

test('hoy se descartan los horarios que ya pasaron', () => {
  const ahora = new Date(2026, 9, 26, 17, 10)
  const g = grilla(aFecha(lunes), 30, '', ahora)
  assert.equal(g[0].hora, '17:30')
})

test('faltantes y su texto', () => {
  assert.deepEqual(faltantes({}), ['el servicio', 'el día', 'el horario', 'tu nombre'])
  assert.equal(textoFaltantes(['el horario']), 'Todavía falta: el horario.')
  assert.equal(textoFaltantes(['el día', 'el horario', 'tu nombre']), 'Todavía falta: el día, el horario y tu nombre.')
  assert.deepEqual(faltantes({ servicio: 1, fecha: 'x', hora: 'y', nombre: '  ' }), ['tu nombre'])
  assert.deepEqual(faltantes({ servicio: 1, fecha: 'x', hora: 'y', nombre: 'Leo' }), [])
})

test('el mensaje trae todos los datos y el link está codificado', () => {
  const datos = { servicio: servicios[2], barbero: barberos[0], fecha: '2026-10-27', hora: '10:30', nombre: ' Leo ' }
  const m = mensaje(datos, negocio)
  for (const parte of ['Leo', 'Corte y barba', '60 min', '$15.000', 'Hola, Barbería Rivadavia.', 'Hugo','martes 27 de octubre', '10:30']) {
    assert.ok(m.includes(parte), parte)
  }
  const url = linkWhatsapp(datos, negocio)
  assert.ok(url.startsWith('https://wa.me/5491112345678?text='))
  assert.equal(decodeURIComponent(url.split('?text=')[1]), m)
  assert.ok(mensaje({ ...datos, barbero: null }, negocio).includes('el que esté libre'))
})

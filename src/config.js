// Datos del negocio. Para adaptarlo a otra barbería, cambiá solo este archivo.
export const negocio = {
  nombre: 'Barbería Rivadavia',
  telefono: '5491112345678', // número de ejemplo para wa.me
  telefonoVisible: '(291) 455-0187',
  direccion: 'Rivadavia 640, Bahía Blanca',
  referencia: 'Casi esquina Brown',
  desde: 1974,
}

// Bloques de atención por día de la semana (0 = domingo). Horas en formato decimal.
export const horarios = {
  0: [],
  1: [[9, 13], [16, 20]],
  2: [[9, 13], [16, 20]],
  3: [[9, 13], [16, 20]],
  4: [[9, 13], [16, 20]],
  5: [[9, 13], [16, 20]],
  6: [[9, 14]],
}

export const textoHorarios = [
  ['Lunes a viernes', '9 a 13 y 16 a 20'],
  ['Sábados', '9 a 14'],
  ['Domingos', 'Cerrado'],
]

export const servicios = [
  { id: 'corte', nombre: 'Corte clásico', minutos: 30, precio: 9000 },
  { id: 'barba', nombre: 'Barba con toalla caliente', minutos: 30, precio: 7000 },
  { id: 'combo', nombre: 'Corte y barba', minutos: 60, precio: 15000 },
  { id: 'nino', nombre: 'Corte de nene (hasta 12)', minutos: 30, precio: 7500 },
  { id: 'perfilado', nombre: 'Perfilado y marcado', minutos: 30, precio: 6000 },
]

export const barberos = [
  { id: 'hugo', nombre: 'Hugo' },
  { id: 'chicho', nombre: 'Chicho' },
  { id: 'nacho', nombre: 'Nacho' },
]

export const PASO = 30 // minutos entre turnos en la grilla
export const DIAS_VISIBLES = 6

import React, { useMemo, useState } from 'react'
import { negocio, textoHorarios, servicios, barberos } from './config.js'
import { proximosDias, grilla, faltantes, textoFaltantes, linkWhatsapp, formatoPrecio, etiquetaDia } from './turnos.js'

const ANY = 'cualquiera'

export default function App() {
  const ahora = useMemo(() => new Date(), [])
  const dias = useMemo(() => proximosDias(ahora), [ahora])
  const [servicioId, setServicioId] = useState('')
  const [barberoId, setBarberoId] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [nombre, setNombre] = useState('')
  const [intento, setIntento] = useState(false)

  const servicio = servicios.find((s) => s.id === servicioId)
  const barbero = barberos.find((b) => b.id === barberoId) || null
  const horas = fecha && servicio ? grilla(fecha, servicio.minutos, barberoId, ahora) : []

  // Al cambiar servicio, barbero o día, el horario elegido puede dejar de existir u ocupar otro lugar.
  const libre = (f, s, b, h) => !!h && !!s && grilla(f, s.minutos, b, ahora).some((x) => x.hora === h && !x.ocupado)
  const cambiar = (nuevo) => {
    const n = { servicioId, barberoId, fecha, ...nuevo }
    const s = servicios.find((x) => x.id === n.servicioId)
    if (!libre(n.fecha, s, n.barberoId, hora)) setHora('')
    setServicioId(n.servicioId); setBarberoId(n.barberoId); setFecha(n.fecha)
  }

  const falta = faltantes({ servicio, fecha, hora, nombre })
  const enviar = () => {
    setIntento(true)
    if (falta.length) return
    window.open(linkWhatsapp({ servicio, barbero, fecha, hora, nombre }, negocio), '_blank', 'noopener')
  }

  return (
    <div className="pagina">
      <aside className="cartel">
        <p className="desde">Desde {negocio.desde}</p>
        <h1>{negocio.nombre.split(' ')[0]}<br />{negocio.nombre.split(' ').slice(1).join(' ')}</h1>
        <p className="bajada">Corte, barba y charla. Sacá el turno acá y se confirma por WhatsApp.</p>

        <h2>Horarios</h2>
        <dl className="puntos">
          {textoHorarios.map(([d, h]) => (
            <div key={d}><dt>{d}</dt><dd>{h}</dd></div>
          ))}
        </dl>

        <h2>Dónde estamos</h2>
        <p className="direccion">{negocio.direccion}<br />{negocio.referencia}</p>
        <p className="direccion">Tel. {negocio.telefonoVisible}</p>
        <p className="aviso">Se atiende por orden de turno. Si llegás con más de 10 minutos de demora, se pasa al siguiente.</p>
      </aside>

      <main className="turno">
        <fieldset>
          <legend><span>1 · Servicio</span></legend>
          <ul className="lista">
            {servicios.map((s) => (
              <li key={s.id}>
                <label className={servicioId === s.id ? 'fila on' : 'fila'}>
                  <input type="radio" name="servicio" checked={servicioId === s.id} onChange={() => cambiar({ servicioId: s.id })} />
                  <span className="nom">{s.nombre}</span>
                  <span className="min">{s.minutos} min</span>
                  <span className="pre">{formatoPrecio(s.precio)}</span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        <fieldset>
          <legend><span>2 · Barbero</span></legend>
          <div className="fichas">
            {[{ id: '', nombre: 'Me da igual' }, ...barberos].map((b) => (
              <label key={b.id || ANY} className={barberoId === b.id ? 'ficha on' : 'ficha'}>
                <input type="radio" name="barbero" checked={barberoId === b.id} onChange={() => cambiar({ barberoId: b.id })} />
                {b.nombre}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend><span>3 · Día</span></legend>
          <div className="fichas dias">
            {dias.map((d) => (
              <label key={d.fecha} className={`ficha${fecha === d.fecha ? ' on' : ''}${d.cerrado ? ' cerrado' : ''}`}>
                <input type="radio" name="dia" disabled={d.cerrado} checked={fecha === d.fecha} onChange={() => cambiar({ fecha: d.fecha })} />
                <b>{d.nombre.slice(0, 3)}</b> {d.numero}
                <small>{d.cerrado ? 'cerrado' : d.dow === 6 ? 'hasta las 14' : d.mes.slice(0, 3)}</small>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend><span>4 · Horario</span></legend>
          {!servicio || !fecha ? (
            <p className="nota">Elegí primero el servicio y el día.</p>
          ) : horas.length === 0 ? (
            <p className="nota">Ese día ya no quedan horarios.</p>
          ) : (
            <div className="grilla">
              {horas.map(({ hora: h, ocupado }) => (
                <button key={h} type="button" disabled={ocupado} aria-pressed={hora === h} className={hora === h ? 'hora on' : 'hora'} onClick={() => setHora(h)}>
                  {h}
                </button>
              ))}
            </div>
          )}
          <p className="nota chica">Los tachados ya están tomados.</p>
        </fieldset>

        <fieldset>
          <legend><span>5 · Tu nombre</span></legend>
          <label className="campo" htmlFor="nombre">Nombre y apellido</label>
          <input id="nombre" type="text" autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </fieldset>

        {servicio && fecha && hora && (
          <p className="resumen">{servicio.nombre} con {barbero ? barbero.nombre : 'el que esté libre'}, {etiquetaDia(fecha)} a las {hora}. Total {formatoPrecio(servicio.precio)}, se paga en el local.</p>
        )}
        <button type="button" className="pedir" onClick={enviar}>Pedir turno por WhatsApp</button>
        <p className="error" role="status">{intento && falta.length ? textoFaltantes(falta) : ''}</p>
      </main>

      <footer className="pie">Sitio de ejemplo hecho por Tomás Cataldo.</footer>
    </div>
  )
}

import { useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

interface Equipo {
  id: number
  nombre: string
  serie: string
  categoria: string
  estado: 'Disponible' | 'Prestado' | 'En Mantenimiento'
}

interface Prestamo {
  id: number
  equipoId: number
  matricula: string
  nombre: string
  devolucion: string
}

const equiposIniciales: Equipo[] = [
  { id: 1, nombre: 'Osciloscopio Rigol', serie: 'OSC-001', categoria: 'Osciloscopio', estado: 'Disponible' },
  { id: 2, nombre: 'Laptop Dell', serie: 'LAP-002', categoria: 'Laptop', estado: 'Prestado' },
  { id: 3, nombre: 'Kit Arduino Uno', serie: 'ARD-003', categoria: 'Kit Arduino', estado: 'Disponible' },
  { id: 4, nombre: 'Multímetro Fluke', serie: 'MUL-004', categoria: 'Multímetro', estado: 'En Mantenimiento' },
  { id: 5, nombre: 'Laptop Lenovo', serie: 'LAP-005', categoria: 'Laptop', estado: 'Disponible' },
]

const prestamosIniciales: Prestamo[] = [
  { id: 1, equipoId: 2, matricula: '20090123', nombre: 'Ana Torres', devolucion: '2026-12-01T14:00' },
]

function App() {
  const [vista, setVista] = useState('catalogo')
  const [equipos, setEquipos] = useState<Equipo[]>(equiposIniciales)
  const [prestamos, setPrestamos] = useState<Prestamo[]>(prestamosIniciales)

  const [equipoId, setEquipoId] = useState('')
  const [matricula, setMatricula] = useState('')
  const [nombre, setNombre] = useState('')
  const [devolucion, setDevolucion] = useState('')
  const [error, setError] = useState('')

  const disponibles = equipos.filter((e) => e.estado === 'Disponible')

  function confirmar(e: FormEvent) {
    e.preventDefault()

    if (equipoId === '') {
      setError('Selecciona un equipo')
      return
    }
    if (!/^[0-9]{8,9}$/.test(matricula)) {
      setError('La matrícula debe tener 8 o 9 números')
      return
    }
    if (nombre.trim() === '') {
      setError('Escribe el nombre del estudiante')
      return
    }
    if (devolucion === '') {
      setError('Elige la fecha y hora de devolución')
      return
    }

    const nuevo: Prestamo = {
      id: Date.now(),
      equipoId: Number(equipoId),
      matricula: matricula,
      nombre: nombre,
      devolucion: devolucion,
    }
    setPrestamos([...prestamos, nuevo])
    setEquipos(equipos.map((eq) => (eq.id === nuevo.equipoId ? { ...eq, estado: 'Prestado' } : eq)))

    setEquipoId('')
    setMatricula('')
    setNombre('')
    setDevolucion('')
    setError('')
    setVista('admin')
  }

  function devolver(p: Prestamo) {
    setPrestamos(prestamos.filter((x) => x.id !== p.id))
    setEquipos(equipos.map((eq) => (eq.id === p.equipoId ? { ...eq, estado: 'Disponible' } : eq)))
  }

  return (
    <div>
      <h1>LabTrack TecNM</h1>

      <div className="menu">
        <button onClick={() => setVista('catalogo')}>Catálogo</button>
        <button onClick={() => setVista('formulario')}>Solicitar préstamo</button>
        <button onClick={() => setVista('admin')}>Préstamos activos</button>
      </div>

      {/* INTERFAZ 1: Catálogo */}
      {vista === 'catalogo' && (
        <div>
          <h2>Catálogo de equipos</h2>
          <div className="grid">
            {equipos.map((eq) => (
              <div className="tarjeta" key={eq.id}>
                <h3>{eq.nombre}</h3>
                <p>Serie: {eq.serie}</p>
                <p>Categoría: {eq.categoria}</p>
                {eq.estado === 'Disponible' && <span className="verde">Disponible</span>}
                {eq.estado === 'Prestado' && <span className="rojo">Prestado</span>}
                {eq.estado === 'En Mantenimiento' && <span className="amarillo">En Mantenimiento</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INTERFAZ 2: Formulario */}
      {vista === 'formulario' && (
        <div>
          <h2>Solicitud de préstamo</h2>
          <form onSubmit={confirmar}>
            <label>Equipo:</label>
            <select value={equipoId} onChange={(e) => setEquipoId(e.target.value)}>
              <option value="">-- Selecciona --</option>
              {disponibles.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.nombre} ({eq.serie})
                </option>
              ))}
            </select>

            <label>Matrícula:</label>
            <input type="text" value={matricula} onChange={(e) => setMatricula(e.target.value)} />

            <label>Nombre del estudiante:</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />

            <label>Fecha y hora de devolución:</label>
            <input type="datetime-local" value={devolucion} onChange={(e) => setDevolucion(e.target.value)} />

            {error !== '' && <p className="mensaje-error">{error}</p>}

            <button type="submit">Confirmar Préstamo</button>
          </form>
        </div>
      )}

      {/* INTERFAZ 3: Administración */}
      {vista === 'admin' && (
        <div>
          <h2>Préstamos activos</h2>
          {prestamos.length === 0 ? (
            <p>No hay préstamos activos.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Matrícula</th>
                  <th>Equipo</th>
                  <th>Hora límite</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {prestamos.map((p) => {
                  const eq = equipos.find((x) => x.id === p.equipoId)
                  return (
                    <tr key={p.id}>
                      <td>{p.nombre}</td>
                      <td>{p.matricula}</td>
                      <td>{eq ? eq.nombre : ''}</td>
                      <td>{p.devolucion.replace('T', ' ')}</td>
                      <td>
                        <button onClick={() => devolver(p)}>Registrar Devolución</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

export default App

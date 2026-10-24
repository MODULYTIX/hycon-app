import EntradaBase from '@/shared/ui/atomos/EntradaBase';
import { useEffect, useRef, useState } from 'react';
import type { EmpresaErgo, FichaErgo } from '../../../servicios/ergo.api';
import { actualizarFichaErgo, crearFichaErgo } from '../../../servicios/ergo.api';
import { normalizarFicha, validarFicha, resumenFicha, SECCIONES, type SeccionFicha } from '../../../utilidades/ficha';
import { DialogoErgo, CabeceraSeccion } from '../../ErgoUI';
import { mensajeError } from '../../../utilidades/presentacion';
import Paso1Administrativo from './Paso1Administrativo';
import Paso2Representatividad from './Paso2Representatividad';
import SeccionFactores from './SeccionFactores';
import Paso6Resumen from './Paso6Resumen';

export default function ModalRegistroFicha({ empresa, ficha, inicial = 'datos', onCerrar, onGuardado }: {
  empresa: EmpresaErgo; ficha?: FichaErgo; inicial?: SeccionFicha; onCerrar: () => void; onGuardado: (f: FichaErgo) => void;
}) {
  const [datos, setDatos] = useState(() => normalizarFicha(ficha?.payload));
  const [nombre, setNombre] = useState(ficha?.nombre || '');
  const [seccion, setSeccion] = useState<SeccionFicha>(inicial);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const base = useRef(JSON.stringify({ datos: normalizarFicha(ficha?.payload), nombre: ficha?.nombre || '' }));
  const guardandoRef = useRef(false);
  const contenido = useRef<HTMLDivElement>(null);
  const navegacion = useRef<HTMLElement>(null);
  useEffect(() => {
    const activa = navegacion.current?.querySelector<HTMLElement>('[aria-current="step"]');
    activa?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }, [seccion]);
  const sucio = JSON.stringify({ datos, nombre }) !== base.current;
  const resumen = resumenFicha(datos);
  const actual = SECCIONES.find(s => s.id === seccion)!;
  const ir = (s: SeccionFicha) => { setSeccion(s); contenido.current?.scrollTo({ top: 0 }); };
  const guardar = async () => {
    if (guardandoRef.current) return;
    const invalido = validarFicha(datos);
    if (invalido) { setError(invalido.mensaje); ir(invalido.seccion); return; }
    if (nombre.trim().length === 1) { setError('Usa al menos 2 caracteres para el nombre de la ficha.'); ir('datos'); return; }
    guardandoRef.current = true; setGuardando(true); setError('');
    try {
      const titulo = nombre.trim() || `Ficha · ${datos.paso1.puesto.trim() || 'Puesto por definir'}`.slice(0, 200);
      const payload = normalizarFicha(datos);
      const guardada = ficha
        ? await actualizarFichaErgo(empresa.id, ficha.id, titulo, payload, ficha.actualizada)
        : await crearFichaErgo(empresa.id, titulo, payload);
      onGuardado(guardada);
    } catch (e) {
      setError(mensajeError(e));
      contenido.current?.scrollTo({ top: 0 });
    }
    finally { guardandoRef.current = false; setGuardando(false); }
  };
  return <DialogoErgo titulo={ficha ? 'Editar ficha ergonómica' : 'Nueva ficha ergonómica'} amplio sucio={sucio} bloqueado={guardando} onCerrar={onCerrar}>
    {cerrar => <div className="er-editor">
      <header className="er-editor-header">
        <div><p className="er-eyebrow">{empresa.nombre} / Ficha ergonómica</p><h2>{ficha ? 'Editar ficha' : 'Nueva ficha'}</h2></div>
        <div className="er-actions"><span className="er-tag">{resumen.estado}</span><button type="button" className="er-close" aria-label="Cerrar ficha" disabled={guardando} onClick={cerrar}>×</button></div>
      </header>
      <div className="er-editor-middle">
        <nav ref={navegacion} className="er-sidebar" aria-label="Secciones de la ficha">
          <p>Accede a cualquier sección</p>
          {SECCIONES.map((s, i) => {
            const f = resumen.factores.filter(f => f.grupo === s.id);
            const pendientes = resumen.pendientes.filter(f => f.grupo === s.id).length;
            return <button type="button" className="er-section-button" aria-label={s.titulo} aria-current={s.id === seccion ? 'step' : undefined} key={s.id} onClick={() => ir(s.id)}>
              <span className="er-section-number">{String(i + 1).padStart(2, '0')}</span>
              <span>{s.titulo}<small>{f.length ? `${f.length - pendientes} de ${f.length} registrados` : s.id === 'resumen' ? 'Revisión de la ficha' : 'Información de contexto'}</small></span>
            </button>;
          })}
        </nav>
        <div className="er-editor-content" ref={contenido}>
          {error && <p role="alert" className="er-notice er-notice-error er-editor-error">{error}</p>}
          <CabeceraSeccion titulo={actual.titulo} descripcion={actual.descripcion} />
          <fieldset disabled={guardando}>
            <legend className="sr-only">{actual.titulo}</legend>
            {seccion === 'datos' && <>
              <label className="er-field" style={{ marginBottom: 20 }}>Nombre de la ficha <span className="er-muted" style={{ fontSize: 11 }}>Opcional. Si lo dejas vacío, usaremos el nombre del puesto.</span>
                <EntradaBase  placeholder="Ej. Evaluación del puesto de almacén" maxLength={200} value={nombre} onChange={e => setNombre(e.target.value)} />
              </label>
              <Paso1Administrativo datos={datos.paso1} onChange={paso1 => setDatos({ ...datos, paso1 })} />
            </>}
            {seccion === 'tarea' && <Paso2Representatividad datos={datos.paso2} onChange={paso2 => setDatos({ ...datos, paso2 })} />}
            {(seccion === 'posturas' || seccion === 'cargas' || seccion === 'repetitivos') && <SeccionFactores grupo={seccion} datos={datos} onChange={setDatos} />}
            {seccion === 'resumen' && <Paso6Resumen datos={datos} onEditar={ir} />}
          </fieldset>
        </div>
      </div>
      <footer className="er-editor-footer">
        <p>{sucio ? 'Cambios sin guardar' : ficha ? 'Ficha guardada' : 'Puedes guardar y completar después'}</p>
        <div className="er-actions">
          <button className="er-button" onClick={cerrar} disabled={guardando}>Cerrar</button>
          {seccion !== 'resumen' && <button className="er-button" onClick={() => ir('resumen')}>Ver resumen</button>}
          <button className="er-button er-button-primary" onClick={guardar} disabled={guardando}>{guardando ? 'Guardando…' : ficha ? 'Guardar cambios' : 'Guardar ficha'}</button>
        </div>
      </footer>
    </div>}
  </DialogoErgo>;
}

import { peticion } from '@/shared/utilidades/cliente-http';
import type { FormularioFichaErgonomica } from '../tipos/ficha.tipos';

const BASE = '/api/v1/ergo/empresas';
export interface EmpresaErgo { id: string; nombre: string; fecha: string; totalFichas: number }
export interface FichaErgo { id: string; empresaId: string; nombre: string; fecha: string; actualizada: string; payload: unknown }
export const obtenerEmpresasErgo = (senal?: AbortSignal) => peticion<EmpresaErgo[]>(BASE, { autenticada: true, senal });
export const obtenerEmpresaErgo = (id: string, senal?: AbortSignal) => peticion<EmpresaErgo>(`${BASE}/${id}`, { autenticada: true, senal });
export const crearEmpresaErgo = (nombre: string) => peticion<EmpresaErgo>(BASE, { metodo: 'POST', autenticada: true, cuerpo: { nombre } });
export const obtenerFichasErgo = (id: string, senal?: AbortSignal) => peticion<FichaErgo[]>(`${BASE}/${id}/fichas`, { autenticada: true, senal });
export const obtenerFichaErgo = (id: string, fichaId: string, senal?: AbortSignal) => peticion<FichaErgo>(`${BASE}/${id}/fichas/${fichaId}`, { autenticada: true, senal });
export const crearFichaErgo = (id: string, nombre: string, payload: FormularioFichaErgonomica) =>
  peticion<FichaErgo>(`${BASE}/${id}/fichas`, { metodo: 'POST', autenticada: true, cuerpo: { nombre, description: payload.paso1.resumenPuesto, payload } });
export const actualizarFichaErgo = (id: string, fichaId: string, nombre: string, payload: FormularioFichaErgonomica, version: string) =>
  peticion<FichaErgo>(`${BASE}/${id}/fichas/${fichaId}`, { metodo: 'PUT', autenticada: true, cuerpo: { nombre, description: payload.paso1.resumenPuesto, payload, version } });

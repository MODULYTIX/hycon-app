// src/types/enviarCorreo.type.ts

export type RolFormulario = "ECOMMERCE" | "REPARTIDOR";

export interface EcommercePayload {
  rol: "ECOMMERCE";
  empresa: string;
  solicitante: string;
  telefono: string;
  ciudad: string;
  email: string;
}

export interface RepartidorPayload {
  rol: "REPARTIDOR";
  nombreCompleto: string;
  dni: string;
  telefono: string;
  email: string;
  unidad: "Moto" | "Bici" | "Auto" | "Otro";
  placa?: string;
}

export type HyconPayload = EcommercePayload | RepartidorPayload;

export interface ApiResponse<T = any> {
  ok?: boolean;
  mensaje?: string;
  error?: string;
  data?: T;
}

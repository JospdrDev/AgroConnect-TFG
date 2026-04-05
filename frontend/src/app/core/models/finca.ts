// src/app/core/models/finca.ts
export interface Finca {
    id: number;
    usuario_id: number;
    nombre: string;
    hectareas: number;
    cultivo: string;
    geo_json: any; 
}
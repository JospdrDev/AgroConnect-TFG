import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Finca } from '../models/finca';

@Injectable({
  providedIn: 'root'
})
export class FincaService { // Aunque el archivo sea finca.ts, la clase se suele llamar FincaService

  private fincas: Finca[] = [
    { id: 1, usuario_id: 1, nombre: 'Finca El Limonar', hectareas: 12.5, cultivo: 'Limonero Verna', geo_json: {} },
    { id: 2, usuario_id: 1, nombre: 'Huerta del Segura', hectareas: 5.2, cultivo: 'Naranjo Navel', geo_json: {} },
    { id: 3, usuario_id: 2, nombre: 'Viñedos Altura', hectareas: 45.0, cultivo: 'Uva Monastrell', geo_json: {} },
    { id: 4, usuario_id: 1, nombre: 'Campo Cartagena Sur', hectareas: 28.3, cultivo: 'Brócoli', geo_json: {} },
    { id: 5, usuario_id: 3, nombre: 'Finca La Aljorra', hectareas: 18.1, cultivo: 'Alcachofa', geo_json: {} },
    { id: 6, usuario_id: 1, nombre: 'Olivares del Noroeste', hectareas: 60.4, cultivo: 'Olivo Picual', geo_json: {} },
    { id: 7, usuario_id: 2, nombre: 'Invernaderos Águilas', hectareas: 8.7, cultivo: 'Tomate Cherry', geo_json: {} },
    { id: 8, usuario_id: 1, nombre: 'Almendros Mula', hectareas: 32.0, cultivo: 'Almendro Marcona', geo_json: {} },
    { id: 9, usuario_id: 3, nombre: 'Frutales de Cieza', hectareas: 15.6, cultivo: 'Melocotonero', geo_json: {} },
    { id: 10, usuario_id: 4, nombre: 'La Vega Alta', hectareas: 10.2, cultivo: 'Albaricoquero', geo_json: {} }
  ];

  constructor() {}

  getFincas(): Observable<Finca[]> {
    return of(this.fincas);
  }
}
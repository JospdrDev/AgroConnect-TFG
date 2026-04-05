import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { FincaMap } from './features/fincas/finca-map/finca-map';
import { FincaListComponent } from './features/fincas/finca-list/finca-list';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  
  // Agrupamos todo lo de fincas bajo un mismo concepto
  { 
    path: 'fincas', 
    children: [
      { path: '', component: FincaListComponent }, // localhost:4200/fincas
      { path: 'mapa', component: FincaMap }         // localhost:4200/fincas/mapa
    ]
  },

  { path: '**', redirectTo: 'dashboard' }
];
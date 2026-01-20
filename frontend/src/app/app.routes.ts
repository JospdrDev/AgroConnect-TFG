import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { FincaMap } from './features/fincas/finca-map/finca-map';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'fincas', component: FincaMap },
  { path: '**', redirectTo: 'dashboard' }
];
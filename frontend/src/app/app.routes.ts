import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { Dashboard } from './features/dashboard/dashboard';
import { FincaMap } from './features/fincas/finca-map/finca-map';
import { FincaListComponent } from './features/fincas/finca-list/finca-list';
import { Login } from './features/auth/login/login';

export const routes: Routes = [
  // Página pública - landing del compañero
  { path: '', component: LandingComponent },
  { path: 'landing', redirectTo: '', pathMatch: 'full' },

  // Autenticación
  { path: 'login', component: Login },

  // App privada (tuyas)
  { path: 'dashboard', component: Dashboard },
  {
    path: 'fincas',
    children: [
      { path: '', component: FincaListComponent },
      { path: 'mapa', component: FincaMap }
    ]
  },

  { path: '**', redirectTo: '' }
];

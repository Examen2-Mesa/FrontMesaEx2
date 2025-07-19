import { Routes } from '@angular/router';
import { FullComponent } from './layouts/full/full.component';
import { BlankComponent } from './layouts/blank/blank.component';
import { adminGuard } from './pages/auth/guards/admin.guard';
import { docenteGuard } from './pages/auth/guards/docente.guard';

export const routes: Routes = [
  {
    path: '',
    component: FullComponent,
    children: [
      {
        path: 'admin',
        loadChildren: () =>
          import('./pages/admin/admin.routes').then((m) => m.AdminRoutes),
        canActivate: [adminGuard],
      },
      {
        path: '',
        redirectTo: 'admin',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    component: FullComponent,
    children: [
      {
        path: 'docente',
        loadChildren: () =>
          import('./pages/docente/admin-docente.routes').then((m) => m.AdminDocenteRoutes),
        canActivate: [docenteGuard],
      },
      {
        path: '',
        redirectTo: 'docente',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'auth',
        loadChildren: () =>
          import('./pages/auth/auth.routes').then((m) => m.AuthRoutes),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EstudiantesComponent } from './estudiantes/estudiantes.component';
import { DocentesComponent } from './docentes/docentes.component';
import { GestionesComponent } from './gestiones/gestiones.component';
import { PeriodosComponent } from './periodos/periodos.component';
import { InscripcionesComponent } from './inscripciones/inscripciones.component';
import { CursosComponent } from './cursos/cursos.component';
import { CursoMateriaComponent } from './curso-materia/curso-materia.component';
import { MateriasComponent } from './materias/materias.component';
import { DocenteMateriaComponent } from './docente-materia/docente-materia.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { TipoEvaluacionesComponent } from './tipo-evaluaciones/tipo-evaluaciones.component';
import { EvaluacionesComponent } from './evaluaciones/evaluaciones.component';
import { BoletinComponent } from './boletines/boletines.component';
import { PadresComponent } from './padres/padres.component';

export const AdminRoutes: Routes = [
  {
    path: 'home',
    component: DashboardComponent,
  },
  {
    path: 'usuarios',
    component: UsuariosComponent,
  },
  {
    path: 'docentes',
    component: DocentesComponent,
  },
  {
    path: 'estudiantes',
    component: EstudiantesComponent,
  },
  {
    path: 'inscripciones',
    component: InscripcionesComponent,
  },
  {
    path: 'cursos',
    component: CursosComponent,
  },
  {
    path: 'asignar-materia/:id',
    component: CursoMateriaComponent,
  },
  {
    path: 'materias',
    component: MateriasComponent,
  },
  {
    path: 'asignar-docente/:id',
    component: DocenteMateriaComponent,
  },
  {
    path: 'gestiones',
    component: GestionesComponent,
  },
  {
    path: 'periodos',
    component: PeriodosComponent,
  },
  {
    path: 'tipo-evaluacion',
    component: TipoEvaluacionesComponent,
  },
  {
    path: 'calificaciones',
    component: EvaluacionesComponent,
  },
  {
    path: 'boletines',
    component: BoletinComponent,
  },
  {
    path: 'padres',
    component: PadresComponent,
  },
];

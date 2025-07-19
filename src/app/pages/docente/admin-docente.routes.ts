import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CursosComponent } from './cursos/cursos.component';
import { MateriasComponent } from './materias/materias.component';
import { EstudiantesComponent } from './estudiantes/estudiantes.component';
import { DetalleEstudianteComponent } from './detalle-estudiante/detalle-estudiante.component';
import { PesoTipoEvaluacionComponent } from './peso-tipo-evaluacion/peso-tipo-evaluacion.component';
import { ListaEstudiantesComponent } from './lista-estudiantes/lista-estudiantes.component';
import { CalificacionesComponent } from './calificaciones/calificaciones.component';
import { ConsultarCalificacionesComponent } from './consultar-calificaciones/consultar-calificaciones.component';
import { PrediccionesComponent } from './predicciones/predicciones.component';

export const AdminDocenteRoutes: Routes = [
  {
    path: 'home',
    component: DashboardComponent,
  },
  {
    path: 'estudiantes',
    component: ListaEstudiantesComponent,
  },
  {
    path: 'estudiantes/:docenteId/:cursoId/:materiaId',
    component: EstudiantesComponent,
  },
  {
    path: 'estudiantes/:estudianteId',
    component: DetalleEstudianteComponent,
  },
  {
    path: 'cursos',
    component: CursosComponent
  },
  {
    path: 'materias',
    component: MateriasComponent,
  },
  {
    path: 'peso-tipo-evaluacion',
    component: PesoTipoEvaluacionComponent,
  },
  {
    path: 'calificaciones',
    component: CalificacionesComponent,
  },
  {
    path: 'consulta-calificaciones',
    component: ConsultarCalificacionesComponent,
  },
  {
    path: 'predicciones',
    component: PrediccionesComponent,
  }
];

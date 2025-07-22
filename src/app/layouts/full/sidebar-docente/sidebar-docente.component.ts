import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar-docente',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-docente.component.html',
  styleUrl: './sidebar-docente.component.css',
})
export class SidebarDocenteComponent {
  menuItems = [
    {
      label: 'Inicio',
      route: '/docente/home',
      icon: 'bi bi-house-door',
      isExpanded: false,
    },
    {
      label: 'Mis Estudiantes',
      route: '/docente/estudiantes',
      icon: 'bi bi-people',
      isExpanded: false,
    },
    {
      label: 'Mis Cursos',
      route: '/docente/cursos',
      icon: 'bi bi-tags',
      isExpanded: false,
    },
    {
      label: 'Mis Materias',
      route: '/docente/materias',
      icon: 'bi bi-journal-bookmark',
      isExpanded: false,
    },
    {
      label: 'Evaluaciones',
      icon: 'bi bi-clipboard-check',
      children: [
        {
          label: 'Calificaciones',
          route: '/docente/calificaciones',
        },
        {
          label: 'Consultar Calificaciones',
          route: '/docente/consulta-calificaciones',
        },
        {
          label: 'Tipo de Evaluación',
          route: '/docente/peso-tipo-evaluacion',
        }
      ],
    },
    {
      label: 'Predicciones',
      route: '/docente/predicciones',
      icon: 'bi bi-graph-up',
      isExpanded: false,
    }
  ];

  toggleCollapse(selectedItem: any) {
    this.menuItems.forEach((item) => {
      if (item !== selectedItem) {
        item.isExpanded = false; // Cierra los otros submenús
      }
    });

    // Alternar el submenú actual
    selectedItem.isExpanded = !selectedItem.isExpanded;
  }
}

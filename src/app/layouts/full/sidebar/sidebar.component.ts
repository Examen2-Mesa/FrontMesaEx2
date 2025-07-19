import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  // Lista de items del menú
  menuItems = [
    {
      label: 'Inicio',
      route: '/admin/home',
      icon: 'bi bi-house-door',
      isExpanded: false,
    },
    {
      label: 'Usuarios',
      route: '/admin/usuarios',
      icon: 'bi bi-person',
      isExpanded: false,
    },
    {
      label: 'Docentes',
      route: '/admin/docentes',
      icon: 'bi bi-person',
      isExpanded: false,
    },
    {
      label: 'Estudiantes',
      route: '/admin/estudiantes',
      icon: 'bi bi-people',
      isExpanded: false,
    },
    {
      label: 'Inscripciones',
      route: '/admin/inscripciones',
      icon: 'bi bi-file-earmark-text',
      isExpanded: false,
    },
    {
      label: 'Cursos',
      route: '/admin/cursos',
      icon: 'bi bi-tags',
      isExpanded: false,
    },
    // {
    //   label: 'Cursos',
    //   icon: 'bi bi-tags',
    //   children: [
    //     {
    //       label: 'Cursos',
    //       route: '/admin/cursos',
    //     },
    //     {
    //       label: 'Asignar materia',
    //       route: '/admin/asignar-materia',
    //     },
    //   ],
    // },
    {
      label: 'Materias',
      route: '/admin/materias',
      icon: 'bi bi-journal-bookmark',
      isExpanded: false,
    },
    {
      label: 'Evaluaciones',
      icon: 'bi bi-clipboard-check',
      children: [
      {
        label: 'Calificaciones',
        route: '/admin/calificaciones',
      },
      {
        label: 'Tipo de evaluación',
        route: '/admin/tipo-evaluacion',
      },
      ],
    },
    {
      label: 'Gestiones',
      icon: 'bi bi-calendar3',
      children: [
      {
        label: 'Gestiones',
        route: '/admin/gestiones',
      },
      {
        label: 'Periodos',
        route: '/admin/periodos',
      },
      ]
    },
    // {
    //   label: 'Reportes',
    //   icon: 'bi bi-file-earmark-bar-graph',
    //   children: [
    //     {
    //       label: 'Ventas por fecha',
    //       route: '/admin/reportes/ventas-por-fecha',
    //       icon: 'bi bi-file-earmark-bar-graph',
    //     },
    //     {
    //       label: 'Promedio de calificaciones',
    //       route: '/admin/reportes/promedio-calificaciones',
    //       icon: 'bi bi-file-earmark-bar-graph',
    //     },
    //     {
    //       label: 'Productos más vendidos',
    //       route: '/admin/reportes/productos-mas-vendidos',
    //       icon: 'bi bi-file-earmark-bar-graph',
    //     },
    //     {
    //       label: 'Ingresos por fecha',
    //       route: '/admin/reportes/ingresos-por-fecha',
    //       icon: 'bi bi-file-earmark-bar-graph',
    //     },
    //     {
    //       label: 'Pagos por metodo',
    //       route: '/admin/reportes/pagos-por-metodo',
    //       icon: 'bi bi-file-earmark-bar-graph',
    //     },
    //     {
    //       label: 'Productos con bajo stock',
    //       route: '/admin/reportes/productos-bajo-stock',
    //       icon: 'bi bi-file-earmark-bar-graph',
    //     }
    //   ]
    // },
  ];

  toggleCollapse(selectedItem: any) {
    this.menuItems.forEach(item => {
      if (item !== selectedItem) {
        item.isExpanded = false; // Cierra los otros submenús
      }
    });
  
    // Alternar el submenú actual
    selectedItem.isExpanded = !selectedItem.isExpanded;
  }
}

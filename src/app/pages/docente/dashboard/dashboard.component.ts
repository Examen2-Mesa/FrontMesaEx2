import { Component } from '@angular/core';
import { Dashboard } from './interface/dashboard.interface';
import { AlertsService } from '../../../shared/services/alerts.service';
import { DashboardService } from './services/dashboard.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/services/auth.service';
import { Docente } from '../../admin/docentes/interfaces/docente.interface';
import { LoadingSpinnerComponent } from "../../../shared/components/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  datos?: Dashboard;
  docente: Docente | null = null;
  
  isLoading: boolean = false;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private alertsService: AlertsService
  ) {}

  ngOnInit(): void {
    this.dashboardService.dashboard$.subscribe((datos) => {
      this.datos = datos;
    });

    this.docente = this.authService.getCurrentUser();

    if (this.docente) {
      this.isLoading = true;
      this.dashboardService.obtenerResumen(this.docente.id!).subscribe({
        next: (datos) => {
          
        },
        error: (error) => {
          this.alertsService.toast(error, 'error');
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    }
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}

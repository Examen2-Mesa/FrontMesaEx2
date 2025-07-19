import { Component } from '@angular/core';
import { Dashboard } from './interfaces/dashboard.interface';
import { DashboardService } from './services/dashboard.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from "../../../shared/components/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  datos?: Dashboard;
  isLoading: boolean = false;

  constructor(
    private dashboardService: DashboardService,
    private alertsService: AlertsService
  ) {}

  ngOnInit(): void {
    this.dashboardService.dashboard$.subscribe((datos) => {
      this.datos = datos;
    });

    this.isLoading = true;
    this.dashboardService.obtenerResumen().subscribe({
      next: (datos) => {},
      error: (error) => {
        this.alertsService.toast(error, 'error');
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}

import { Component, signal } from '@angular/core';
import { ProductoService } from '../../../pages/productos/services/producto.service';
import { ProductoStockBajo } from '../../../pages/productos/interfaces/producto.interface';
import { AlertsService } from '../../services/alerts.service';
import { SweetAlertIcon } from 'sweetalert2';

@Component({
  selector: 'app-alertas-stock-bajo',
  imports: [],
  templateUrl: './alertas-stock-bajo.component.html',
  styleUrl: './alertas-stock-bajo.component.css',
})
export class AlertasStockBajoComponent {
  // Usamos Signals para manejar el estado de los productos con stock bajo
  productosConStockBajo = signal<ProductoStockBajo[]>([]);

  constructor(
    private productoService: ProductoService,
    private alertsService: AlertsService
  ) {}

  ngOnInit() {
    // Suscribirse al polling para obtener productos con stock bajo
    this.productoService
      .obtenerProductosConStockBajoConPolling(60000) // 60 segundos
      .subscribe({
        next: (productos) => {
          if (productos.length > 0) {
            this.productosConStockBajo.set(productos); // Actualizamos el estado con Signals
            this.mostrarAlertas(productos); // Mostrar alertas si hay productos con stock bajo
          }
        },
        error: (err) => {
          console.error('Error en el componente:', err);
        },
      });
  }

  async mostrarAlertas(productos: ProductoStockBajo[]) {
    for (const producto of productos) {
      await this.mostrarAlertaConRetraso(
        `¡Alerta! El producto "${producto.nombre}" tiene stock bajo (${producto.stock} unidades).`,
        'error'
      );
    }
  }
  
  // Método auxiliar para mostrar una alerta con un retraso
  mostrarAlertaConRetraso(title: string, icon: SweetAlertIcon): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.alertsService.toastWithCloseButton(title, icon);
        resolve();
      }, 5000); // 5 segundo de retraso entre cada alerta
    });
  }
}

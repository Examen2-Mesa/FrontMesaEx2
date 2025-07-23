import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';

import { BoletinService } from './service/boletin.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EstudianteService } from '../estudiantes/services/estudiante.service';
import { Estudiante } from '../estudiantes/interfaces/estudiante.interface';

import { InformacionAcademica, MateriaResultado, PeriodoResultado } from './interfaces/boletin.interfaces'; // Importa la interfaz que definiste

// Import para exportar a Excel
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

// Import para exportar a PDF
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(<any>pdfMake).addVirtualFileSystem(pdfFonts);

@Component({
  selector: 'app-boletines',
  templateUrl: './boletines.component.html',
  styleUrls: ['./boletines.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, LoadingSpinnerComponent],
})
export class BoletinComponent implements OnInit {
  estudiantes: Estudiante[] = [];
  informacionCompleta: InformacionAcademica | null = null;
  materiasFiltradas: MateriaResultado[] = [];

  EstudiantesForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private informacionService: BoletinService,
    private alertsService: AlertsService,
    private estudiantesService: EstudianteService
  ) {}

  ngOnInit() {
    this.EstudiantesForm = this.fb.group({
      estudiante_id: [null, Validators.required],
      enviar_por_correo: [false], // opción para enviar correo
    });

    this.cargarEstudiantes();
  }

  cargarEstudiantes(): void {
    this.estudiantesService.obtenerEstudiantes().subscribe({
      next: (data: Estudiante[]) => {
        this.estudiantes = data.map(e => ({
          ...e,
          nombreCompleto: `${e.nombre} ${e.apellido}`
        }));
      },
      error: (error) => {
        console.error('Error al obtener estudiantes:', error);
        this.alertsService.toast('Error al cargar estudiantes', 'error');
      }
    });
  }

  onSubmit(): void {
    if (this.EstudiantesForm.invalid) {
      this.EstudiantesForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const estudianteId: number = this.EstudiantesForm.get('estudiante_id')?.value;
    const enviarCorreo: boolean = this.EstudiantesForm.get('enviar_por_correo')?.value;

    this.informacionService.obtenerInformacionCompleta(estudianteId, enviarCorreo).subscribe({
      next: (resp: InformacionAcademica) => {
        this.informacionCompleta = resp;
        this.materiasFiltradas = resp.materias || [];
        this.alertsService.toast(resp.mensaje || 'Información obtenida', 'success');
      },
      error: () => {
        this.alertsService.toast('Error al obtener información académica', 'error');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  obtenerNombreEstudiante(estudianteId: number): string {
    const estudiante = this.estudiantes.find(e => e.id === estudianteId);
    return estudiante ? `${estudiante.nombre} ${estudiante.apellido}` : 'Estudiante no encontrado';
  }

  generarReportePDF(): void {
  if (!this.informacionCompleta) {
    this.alertsService.toast('No hay datos para generar el PDF', 'error');
    return;
  }

  const estudiante = `${this.informacionCompleta.estudiante?.nombre || ''} ${this.informacionCompleta.estudiante?.apellido || ''}`.trim();
  const gestion = this.informacionCompleta.gestion?.anio || 'No disponible';
  const fecha = new Date().toLocaleDateString('es-ES');

  const body: any[][] = [
    [
      { text: '#', bold: true },
      { text: 'Materia', bold: true },
      { text: '1er Trimestre', bold: true },
      { text: '2do Trimestre', bold: true },
      { text: '3er Trimestre', bold: true },
      { text: 'Nota Final', bold: true },
    ],
  ];

  this.materiasFiltradas.forEach((mat: MateriaResultado, i: number) => {
    body.push([
      { text: (i + 1).toString() },
      { text: mat.materia?.nombre || 'N/D' },
      { text: this.getNotaPorTrimestre(mat, '1')?.toString() || 'N/D' },
      { text: this.getNotaPorTrimestre(mat, '2')?.toString() || 'N/D' },
      { text: this.getNotaPorTrimestre(mat, '3')?.toString() || 'N/D' },
     { text: this.calcularPromedio(this.getNotasDeMateria(mat)) },  // ya es string formateado

    ]);
  });

  const docDefinition: any = {
    content: [
      { text: 'Reporte Académico Completo', style: 'header', alignment: 'center' },
      { text: `Estudiante: ${estudiante}`, margin: [0, 10, 0, 5] },
      { text: `Gestión: ${gestion}`, margin: [0, 0, 0, 5] },
      { text: `Fecha: ${fecha}`, margin: [0, 0, 0, 20] },
      {
        table: {
          widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
          body,
        },
        layout: 'lightHorizontalLines',
      },
    ],
    styles: {
      header: { fontSize: 18, bold: true, margin: [0, 0, 0, 15] },
    },
  };

  pdfMake.createPdf(docDefinition).download('Reporte_Academico_Completo.pdf');
}

generarReporteExcel(): void {
  if (!this.informacionCompleta) {
    this.alertsService.toast('No hay datos para generar el Excel', 'error');
    return;
  }

  const estudiante = `${this.informacionCompleta.estudiante.nombre}_${this.informacionCompleta.estudiante.apellido}`;

  const datosExcel = this.materiasFiltradas.map((mat: MateriaResultado, i: number) => {
    // Usamos calcularPromedio sin formatear (debe devolver number | null)
    const promedioRendimientoNum = mat.estadisticas.promedio_rendimiento; // asumo que es number
    const promedioPrediccionNum = mat.estadisticas.promedio_prediccion;   // asumo que es number

    // Aquí aseguramos que si no es número, pongamos '-'
    const promedioRendimiento = typeof promedioRendimientoNum === 'number'
      ? promedioRendimientoNum.toFixed(2)
      : '-';

    const promedioPrediccion = typeof promedioPrediccionNum === 'number'
      ? promedioPrediccionNum.toFixed(2)
      : '-';

    return {
      '#': i + 1,
      'Materia': mat.materia.nombre,
      'Promedio Rendimiento': promedioRendimiento,
      'Promedio Predicción': promedioPrediccion,
    };
  });

  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosExcel);
  const workbook: XLSX.WorkBook = {
    Sheets: { 'Reporte Académico': worksheet },
    SheetNames: ['Reporte Académico'],
  };

  const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

  FileSaver.saveAs(data, `Reporte_Academico_${estudiante}.xlsx`);
}


  isValidField(field: string): boolean | null {
    const control = this.EstudiantesForm.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : null;
  }

  getMessageError(field: string): string | null {
    const control = this.EstudiantesForm.get(field);
    if (!control || !control.errors) return null;

    if (control.errors['required']) {
      return 'Este campo es obligatorio';
    }

    return 'Campo inválido';
  }

  getNotaPorTrimestre(materia: MateriaResultado, trimestre: string): string {
    const nombreTrimestre: Record<string, string> = {
      '1': 'Primer Trimestre',
      '2': 'Segundo Trimestre',
      '3': 'Tercer Trimestre',
    };

    const periodo: PeriodoResultado | undefined = materia.periodos?.find(
      (p) => p.periodo_nombre === nombreTrimestre[trimestre]
    );

    const nota = periodo?.rendimiento?.nota_final;

    return nota !== undefined && nota !== null ? nota.toFixed(2) : '-';
  }

  getNotasDeMateria(materia: MateriaResultado): (number | null)[] {
    const trimestres = ['Primer Trimestre', 'Segundo Trimestre', 'Tercer Trimestre'];
    return trimestres.map(nombre =>
      materia.periodos?.find(p => p.periodo_nombre === nombre)?.rendimiento?.nota_final ?? null
    );
  }

  calcularPromedio(notas: (number | null | undefined)[]): number | string {
  const valores = notas.filter(n => typeof n === 'number') as number[];
  if (valores.length === 0) return '-';
  const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
  return Math.round(promedio * 10) / 10;  // devuelve número con 1 decimal
}


}

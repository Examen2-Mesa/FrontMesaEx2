import { Component } from '@angular/core';

import { Estudiante } from '../estudiantes/interfaces/estudiante.interface';
import { Materia } from '../materias/interfaces/materia.interface';
import { Periodo } from '../periodos/interfaces/periodo.interface';
import { CalificacionResponse } from './interfaces/calificacion-response.interface';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EstudianteService } from '../estudiantes/services/estudiante.service';
import { MateriaService } from '../materias/services/materia.service';
import { PeriodoService } from '../periodos/services/periodo.service';
import { ConsultarCalificacionService } from './services/consultar-calificacion.service';
import { ValidatorsService } from '../../../shared/services/validators.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

// Import para exportar a Excel
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

// Import para exportar a PDF
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(<any>pdfMake).addVirtualFileSystem(pdfFonts);

@Component({
  selector: 'app-evaluaciones',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './evaluaciones.component.html',
  styleUrl: './evaluaciones.component.css',
})
export class EvaluacionesComponent {
  estudiantes: Estudiante[] = [];
  materias: Materia[] = [];
  periodos: Periodo[] = [];

  calificacionResponse: CalificacionResponse[] | null = null;
  evaluacionForm!: FormGroup;

  isLoading: boolean = false;

  constructor(
    private estudiantesService: EstudianteService,
    private materiasService: MateriaService,
    private periodoService: PeriodoService,
    private consultaCalificacionService: ConsultarCalificacionService,
    private validatorsService: ValidatorsService,
    private alertsService: AlertsService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.estudiantesService.estudiantes$.subscribe((data) => {
      this.estudiantes = data.map((e) => ({
        ...e,
        nombreCompleto: `${e.nombre} ${e.apellido}`,
      }));
    });

    this.materiasService.materias$.subscribe((materias) => {
      this.materias = materias;
    });

    this.periodoService.periodos$.subscribe((periodos) => {
      this.periodos = periodos;
    });

    this.evaluacionForm = this.fb.group({
      estudiante_id: [null, Validators.required],
      periodo_id: [null, Validators.required],
    });

    this.periodoService.obtenerPeriodos().subscribe();
    this.estudiantesService.obtenerEstudiantes().subscribe();
    this.materiasService.obtenerMaterias().subscribe();
  }

  onSubmit(): void {
    if (this.evaluacionForm.invalid) {
      this.evaluacionForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.obtenerEvaluaciones();
  }

  generarReportePDF() {
    if (!this.calificacionResponse || this.calificacionResponse.length === 0) {
      this.alertsService.toast('No hay datos para generar el PDF', 'error');
      return;
    }

    const estudianteId = this.evaluacionForm.get('estudiante_id')?.value;
    const periodoId = this.evaluacionForm.get('periodo_id')?.value;

    const estudiante = this.obtenerNombreEstudiante(estudianteId);
    const periodo = this.obtenerNombrePeriodo(periodoId);

    const body: { text: string; bold?: boolean; color?: string }[][] = [
      [
        { text: '#', bold: true },
        { text: 'Materia', bold: true },
        { text: 'Nota Final', bold: true },
      ],
    ];

    this.calificacionResponse.forEach((item: any, index: number) => {
      const materiaNombre = this.obtenerNombreMateria(item.materia_id);
      const notaColor = item.nota_final >= 51 ? 'green' : 'red';

      body.push([
        { text: (index + 1).toString() },
        { text: materiaNombre },
        { text: item.nota_final.toFixed(2), color: notaColor },
      ]);
    });

    const docDefinition: any = {
      content: [
        { text: 'Boletín de Notas', style: 'header', alignment: 'center' },
        {
          text: `Estudiante: ${estudiante}`,
          style: 'subheader',
          alignment: 'right',
          margin: [0, 0, 0, 5],
        },
        {
          text: `Periodo: ${periodo}`,
          alignment: 'right',
          margin: [0, 0, 0, 5],
        },
        {
          text: `Fecha: ${new Date().toLocaleDateString('es-ES')}`,
          alignment: 'right',
          margin: [0, 0, 0, 20],
        },
        {
          table: {
            widths: ['auto', '*', 'auto'],
            body: body,
          },
          layout: 'lightHorizontalLines',
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
      },
    };

    pdfMake.createPdf(docDefinition).download('Reporte_Calificaciones.pdf');
    // pdfMake.createPdf(docDefinition).open();
  }

  generarReporteExcel() {
    if (!this.calificacionResponse || this.calificacionResponse.length === 0) {
      this.alertsService.toast('No hay datos para generar el Excel', 'error');
      return;
    }
    
    const estudianteId = this.evaluacionForm.get('estudiante_id')?.value;
    const estudiante = this.obtenerNombreEstudiante(estudianteId);

    // Preparar los datos para el Excel
    const datosExcel = this.calificacionResponse.map(
      (item: any, index: number) => {
        return {
          '#': index + 1,
          Materia: this.obtenerNombreMateria(item.materia_id),
          'Nota Final': item.nota_final.toFixed(2),
        };
      }
    );

    // Crear la hoja de Excel
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosExcel);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Boletín de Notas': worksheet },
      SheetNames: ['Boletín de Notas'],
    };

    // Generar el archivo y descargarlo
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const data: Blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });

    FileSaver.saveAs(data, `Boletin_Notas_${estudiante}.xlsx`);
  }

  obtenerEvaluaciones(): void {
    const estudianteId = this.evaluacionForm.get('estudiante_id')?.value;
    const periodoId = this.evaluacionForm.get('periodo_id')?.value;

    this.consultaCalificacionService
      .obtenerEvaluaciones(estudianteId, periodoId)
      .subscribe({
        next: (evaluaciones) => {
          console.log('Evaluaciones obtenidas:', evaluaciones);
          this.calificacionResponse = evaluaciones;
        },
        error: (error) => {
          this.alertsService.toast('Error al obtener las evaluaciones', error);
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.evaluacionForm, field);
  }

  getMessageError(field: string): string | null {
    return this.validatorsService.getErrorMessage(this.evaluacionForm, field);
  }

  obtenerNombreMateria(materiaId: number): string {
    const materia = this.materias.find((m) => m.id === materiaId);
    return materia ? materia.nombre : 'Materia no encontrada';
  }

  obtenerNombreEstudiante(estudianteId: number): string {
    const estudiante = this.estudiantes.find((e) => e.id === estudianteId);
    return estudiante
      ? estudiante.nombre + ' ' + estudiante.apellido
      : 'Estudiante no encontrado';
  }

  obtenerNombrePeriodo(periodoId: number): string {
    const periodo = this.periodos.find((p) => p.id === periodoId);
    return periodo ? periodo.nombre : 'Periodo no encontrado';
  }
}

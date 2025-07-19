import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ValidatorsService } from '../../../shared/services/validators.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { Materia as MateriaDocente } from '../materias/interfaces/materia.interface';
import { Materia } from '../../admin/materias/interfaces/materia.interface';
import { Periodo } from '../../admin/periodos/interfaces/periodo.interface';
import { ListaEstudiantes } from '../lista-estudiantes/interfaces/lista-estudiantes.interface';
import { ListaEstudiantesService } from '../lista-estudiantes/services/lista-estudiantes.service';
import { Docente } from '../../admin/docentes/interfaces/docente.interface';
import { AuthService } from '../../auth/services/auth.service';
import { MateriaService } from '../materias/services/materia.service';
import { PeriodoService } from '../../admin/periodos/services/periodo.service';
import { ConsultarCalificacionService } from './services/consultar-calificacion.service';
import { CalificacionResponse } from './interfaces/calificacion-response.interface';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

// Import para exportar a Excel
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

// Import para exportar a PDF
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Gestion } from '../../admin/gestiones/interfaces/gestion.interface';

(<any>pdfMake).addVirtualFileSystem(pdfFonts);

@Component({
  selector: 'app-consultar-calificaciones',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './consultar-calificaciones.component.html',
  styleUrl: './consultar-calificaciones.component.css',
})
export class ConsultarCalificacionesComponent {
  estudiantes: ListaEstudiantes[] = [];
  materias: Materia[] = [];
  materiasDocente: MateriaDocente[] = [];
  periodos: Periodo[] = [];
  gestiones: Gestion[] = [];

  calificacionResponse: CalificacionResponse | null = null;

  // modalVisible: boolean = false;
  evaluacionForm!: FormGroup;
  docente: Docente | null = null;

  isLoading: boolean = false;

  constructor(
    private authServise: AuthService,
    private estudiantesService: ListaEstudiantesService,
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
        nombreCompleto: `${e.estudiante.nombre} ${e.estudiante.apellido}`,
      }));
    });

    this.materiasService.materias$.subscribe((materias) => {
      this.materiasDocente = materias;
    });

    this.periodoService.periodos$.subscribe((periodos) => {
      this.periodos = periodos;
    });

    this.evaluacionForm = this.fb.group({
      materia_id: [null, Validators.required],
      periodo_id: [null, Validators.required],
      estudiante_id: [null, Validators.required],
    });

    this.docente = this.authServise.getCurrentUser();
    this.periodoService.obtenerPeriodos().subscribe();

    if (this.docente) {
      this.estudiantesService.obtenerEstudiantes(this.docente.id!).subscribe();
      this.materiasService.obtenerMaterias(this.docente.id!).subscribe();
    }
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
    if (!this.calificacionResponse) {
      this.alertsService.toast('No hay datos para generar el PDF', 'error');
      return;
    }

    const calificacionResponse = this.calificacionResponse;
    const materia = this.obtenerNombreMateria(
      this.evaluacionForm.get('materia_id')?.value
    );
    const periodo = this.obtenerNombrePeriodo(
      this.evaluacionForm.get('periodo_id')?.value
    );
    const estudiante = this.obtenerNombreEstudiante(
      this.evaluacionForm.get('estudiante_id')?.value
    );

    const docDefinition: any = {
      content: [
        {
          text: 'Reporte de Calificaciones',
          style: 'mainTitle',
          bold: true,
          margin: [0, 0, 0, 5],
        },
        {
          text: `Materia: ${materia}`,
          style: 'infoText',
          bold: true,
          margin: [0, 0, 0, 2],
        },
        {
          text: `Periodo: ${periodo}`,
          style: 'infoText',
          bold: true,
          margin: [0, 0, 0, 2],
        },
        {
          text: `Docente: ${this.docente!.nombre} ${this.docente!.apellido}`,
          style: 'infoText',
          bold: true,
          margin: [0, 0, 0, 2],
        },
        {
          text: `Estudiante: ${estudiante}`,
          style: 'infoText',
          bold: true,
          margin: [0, 0, 0, 20],
        },
        {
          columns: [
            {
              width: 'auto',
              table: {
                body: [
                  [
                    {
                      text: calificacionResponse.promedio_general.toFixed(1),
                      style: this.getPromedioClase(
                        calificacionResponse.promedio_general
                      ),
                      alignment: 'center',
                      fontSize: 24,
                      margin: [10, 10, 10, 10],
                    },
                  ],
                ],
              },
              layout: 'noBorders',
            },
            {
              width: '*',
              stack: [
                {
                  text: 'Promedio General',
                  bold: true,
                  fontSize: 17,
                  margin: [0, 0, 0, 0],
                },
                {
                  text: this.getMensajePromedio(
                    calificacionResponse.promedio_general
                  ),
                  style: 'mensajePromedio',
                },
              ],
              margin: [10, 10, 0, 0],
            },
          ],
          columnGap: 20,
          margin: [0, 0, 0, 20],
        },

        {
          text: 'Detalle por Tipo de Evaluación',
          style: 'subtitle',
          margin: [0, 20, 0, 10],
        },
        ...this.generarDetallePDF(calificacionResponse),
      ],
      styles: {
        mainTitle: { fontSize: 22, bold: true, alignment: 'center' },
        title: { fontSize: 18, bold: true, alignment: 'center' },
        subtitle: { fontSize: 16, bold: true },
        infoText: { fontSize: 12 },
        tableHeader: { bold: true, fillColor: '#f0f0f0' },
        bueno: { fillColor: '#28a745', color: '#fff', bold: true },
        regular: { fillColor: '#ffc107', color: '#fff', bold: true },
        malo: { fillColor: '#dc3545', color: '#fff', bold: true },
        mensajePromedio: { fontSize: 14 },
      },
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 40],
    };

    pdfMake.createPdf(docDefinition).download('Reporte_Calificaciones.pdf');
    // pdfMake.createPdf(docDefinition).open();
  }

  generarDetallePDF(calificacionResponse: CalificacionResponse): any[] {
    const detalleArray: any[] = [];

    for (const key in calificacionResponse.resumen) {
      const resumen = calificacionResponse.resumen[key];

      // 👉 Omitir Asistencia
      if (resumen.nombre.toLowerCase() === 'asistencia') {
        continue;
      }

      const promedioClase = this.getPromedioClase(resumen.promedio || 0);

      detalleArray.push(
        {
          columns: [
            {
              width: 'auto',
              table: {
                body: [
                  [
                    {
                      text:
                        resumen.promedio !== undefined
                          ? resumen.promedio.toFixed(1)
                          : 'N/A',
                      style: promedioClase,
                      alignment: 'center',
                      fontSize: 18,
                      margin: [8, 8, 8, 8],
                    },
                  ],
                ],
              },
              layout: 'noBorders',
            },

            {
              width: '*',
              stack: [
                {
                  text: resumen.nombre,
                  style: 'subtitle',
                  margin: [0, 0, 0, 0],
                },
                {
                  text: `${
                    resumen.total
                  } evaluación(es) · ${this.getMensajePromedio(
                    resumen.promedio || 0
                  )}`,
                  style: 'mensajePromedio',
                },
              ],
              margin: [10, 0, 0, 0],
              fontSize: 12,
            },
          ],
          columnGap: 15,
          margin: [0, 0, 0, 5],
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto'],
            body: [
              [
                { text: 'Fecha', style: 'tableHeader' },
                { text: 'Descripción', style: 'tableHeader' },
                { text: 'Nota', style: 'tableHeader' },
              ],
              ...resumen.detalle.map((d) => [
                {
                  text: new Date(d.fecha).toLocaleDateString(),
                  alignment: 'center',
                },
                d.descripcion,
                { text: d.valor.toString(), alignment: 'center' },
              ]),
            ],
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 30],
        }
      );
    }

    return detalleArray;
  }

  generarReporteExcel() {
    if (!this.calificacionResponse) {
      this.alertsService.toast('No hay datos para generar el Excel', 'error');
      return;
    }

    const calificacionResponse = this.calificacionResponse;
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    // 👉 Generar hoja por cada tipo de evaluación (excepto Asistencia)
    for (const key in calificacionResponse.resumen) {
      const resumen = calificacionResponse.resumen[key];

      if (resumen.nombre.toLowerCase() === 'asistencia') {
        continue;
      }

      const data = [
        ['Fecha', 'Descripción', 'Nota'],
        ...resumen.detalle.map((d) => [
          new Date(d.fecha).toLocaleDateString(),
          d.descripcion,
          d.valor,
        ]),
        [],
        ['Promedio', '', resumen.promedio?.toFixed(1) ?? 'N/A'],
      ];

      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, resumen.nombre);
    }

    // 👉 Hoja de resumen general
    const resumenData = [
      ['Tipo de Evaluación', 'Promedio'],
      ...Object.values(calificacionResponse.resumen)
        .filter((r: any) => r.nombre.toLowerCase() !== 'asistencia')
        .map((r: any) => [r.nombre, r.promedio?.toFixed(1) ?? 'N/A']),
      [],
      ['Promedio General', calificacionResponse.promedio_general.toFixed(1)],
    ];

    const resumenWs: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(resumenData);
    XLSX.utils.book_append_sheet(wb, resumenWs, 'Resumen');

    // 👉 Guardar archivo
    const excelBuffer: any = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });
    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });
    FileSaver.saveAs(blob, 'Reporte_Calificaciones.xlsx');
  }

  obtenerEvaluaciones(): void {
    const estudianteId = this.evaluacionForm.get('estudiante_id')?.value;
    const materiaId = this.evaluacionForm.get('materia_id')?.value;
    const periodoId = this.evaluacionForm.get('periodo_id')?.value;

    this.consultaCalificacionService
      .obtenerEvaluaciones(estudianteId, materiaId, periodoId)
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

  obtenerMateriasPorEstudiante(): any {
    const id = this.evaluacionForm.get('estudiante_id')?.value;

    if (id) {
      const materias = this.estudiantes
        .filter((item) => item.estudiante.id === id)
        .map((item) => item.materia);

      // Si quieres evitar materias repetidas por id:
      const materiasUnicas = materias.filter(
        (materia, index, self) =>
          index === self.findIndex((m) => m.id === materia.id)
      );
      this.materias = materiasUnicas;
    } else {
      this.materias = [];
    }
  }

  getResumenKeys(): string[] {
    return this.calificacionResponse
      ? Object.keys(this.calificacionResponse.resumen).filter(
          (key) =>
            this.calificacionResponse!.resumen[key].nombre.toLowerCase() !==
            'asistencia'
        )
      : [];
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.evaluacionForm, field);
  }

  getMessageError(field: string): string | null {
    return this.validatorsService.getErrorMessage(this.evaluacionForm, field);
  }

  getPromedioClase(promedio: number): string {
    if (promedio < 50) return 'malo';
    else if (promedio < 80) return 'regular';
    else return 'bueno';
  }

  getMensajePromedio(promedio: number): string {
    if (promedio < 30) return 'Muy deficiente';
    else if (promedio < 50) return 'Insuficiente';
    else if (promedio < 70) return 'Debe mejorar';
    else if (promedio < 80) return 'Bueno';
    else if (promedio < 90) return 'Muy bueno';
    else return 'Excelente';
  }

  obtenerNombreMateria(materiaId: number): string {
    const materia = this.materiasDocente.find(
      (m) => m.materia_id === materiaId
    );
    return materia ? materia.materia_nombre : 'Materia no encontrada';
  }

  obtenerNombreEstudiante(estudianteId: number): string {
    const estudiante = this.estudiantes.find(
      (e) => e.estudiante.id === estudianteId
    );
    return estudiante
      ? estudiante.estudiante.nombre + ' ' + estudiante.estudiante.apellido
      : 'Estudiante no encontrado';
  }

  obtenerNombrePeriodo(periodoId: number): string {
    const periodo = this.periodos.find((p) => p.id === periodoId);
    return periodo ? periodo.nombre : 'Periodo no encontrado';
  }
}

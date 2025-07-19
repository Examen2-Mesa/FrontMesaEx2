import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ImagenProducto } from '../../../pages/productos/interfaces/producto.interface';

@Component({
  selector: 'app-file-uploader',
  imports: [CommonModule],
  templateUrl: './file-uploader.component.html',
  styleUrl: './file-uploader.component.css',
})
export class FileUploaderComponent {
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  
  @Output() filesSelected = new EventEmitter<File[]>();

  
  
  // Método para abrir el input de archivos al hacer clic
  openFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  // Método para manejar el evento de selección de archivos
  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      this.addFiles(Array.from(files));
    }
  }

  // Método para manejar el drag-and-drop
  onDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files) {
      this.addFiles(Array.from(files));
    }
  }

  // Método para manejar el drag-over
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  // Método para agregar archivos al arreglo
  addFiles(files: File[]) {
    this.selectedFiles.push(...files);
    this.generatePreviews();
    this.filesSelected.emit(this.selectedFiles); // Emitir los archivos seleccionados
  }
  
  // Método para limpiar los archivos seleccionados
  clearFiles() {
    this.selectedFiles = [];
    this.previewUrls = [];
  }

  // Método para generar las previsualizaciones de las imágenes
  generatePreviews() {
    this.previewUrls = [];
    for (const file of this.selectedFiles) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewUrls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  // Método para obtener la URL de previsualización de una imagen
  getPreviewUrl(index: number): string | undefined {
    return this.previewUrls[index];
  }

  // Método para formatear el tamaño del archivo
  formatSize(size: number): string {
    const kb = size / 1024;
    return kb.toFixed(1);
  }

  // Método para eliminar un archivo
  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }
  
}

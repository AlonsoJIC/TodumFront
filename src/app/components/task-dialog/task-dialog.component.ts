import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Task } from '../../models';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, TaskFormComponent],
  template: `
    <h2 mat-dialog-title>Editar Tarea</h2>
    <mat-dialog-content>
      <app-task-form
        [editMode]="true"
        [taskToEdit]="data"
        (save)="onSave($event)"
        (close)="onClose()"
      />
    </mat-dialog-content>
  `,
  styles: [`
    :host {
      display: block;
      padding: 20px;
      max-width: 500px;
      width: 100%;
    }
  `]
})
export class TaskDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Task
  ) { }

  onSave(task: Task) {
    console.log('TaskDialog onSave - received task:', task);
    this.isSaving = true;

    // Asegurarnos de que todos los campos necesarios están presentes
    const taskToSave: Task = {
      ...this.data, // Mantener los datos originales
      ...task, // Sobrescribir con los nuevos datos
      title: task.title.trim(),
      description: task.description?.trim() || '',
      cardId: this.data.cardId // Asegurar que se mantiene el cardId original
    };

    console.log('TaskDialog onSave - saving task:', taskToSave);
    setTimeout(() => {
      this.dialogRef.close(taskToSave);
      this.isSaving = false;
    }, 0);
  }

  onClose() {
    // Solo cerramos si no estamos en medio de un guardado
    if (!this.isSaving) {
      console.log('TaskDialog onClose - closing without save');
      this.dialogRef.close(null);
    }
  }

  private isSaving = false;
}

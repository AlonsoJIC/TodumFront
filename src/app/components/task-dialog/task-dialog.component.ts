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
    // Asegurarnos de que todos los campos necesarios están presentes
    const taskToSave: Task = {
      id: task.id,
      title: task.title.trim(),
      description: task.description?.trim() || '',
      position: task.position || this.data.position,
      completed: task.completed || false,
      cardId: this.data.cardId // Usar el cardId original
    };
    this.dialogRef.close(taskToSave);
  }

  onClose() {
    this.dialogRef.close(null);
  }
}

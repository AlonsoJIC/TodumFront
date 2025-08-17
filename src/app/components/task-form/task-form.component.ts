import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models';

@Component({
  selector: 'app-task-form',
  standalone: true,
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class TaskFormComponent implements OnInit {
  @Input() editMode = false;
  @Input() taskToEdit?: Task;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Task>();

  task: Task = {
    id: 0,
    title: '',
    description: '',
    completed: false,
    cardId: 0,
    position: 0
  };

  ngOnInit() {
    console.log('Form ngOnInit - editMode:', this.editMode);
    console.log('Form ngOnInit - taskToEdit:', this.taskToEdit);
    if (this.editMode && this.taskToEdit) {
      this.task = {
        ...this.taskToEdit,
        description: this.taskToEdit.description?.trim() || ''
      };
    }
  }

  ngAfterViewInit() {
    // Enfoca el campo de título al abrir el formulario
    setTimeout(() => {
      const titleInput = document.getElementById('title') as HTMLInputElement;
      if (titleInput) {
        titleInput.focus();
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.task.title.trim()) {
      console.log('TaskForm onSubmit - submitting task:', this.task);
      this.save.emit(this.task);
      // No emitimos close aquí, el diálogo se encargará de cerrarse
      return;
    }
  }

}


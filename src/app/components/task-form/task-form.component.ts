import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [class.task-form-overlay]="!editMode" (click)="onClose()">
      <div class="task-form" (click)="$event.stopPropagation()">
        <form (ngSubmit)="onSubmit()" #form="ngForm">
          <div class="form-group">
            <label for="title">Título</label>
            <input 
              type="text" 
              id="title"
              name="title"
              [(ngModel)]="task.title"
              required
              placeholder="Ingresa el título de la tarea"
              #title="ngModel">
            @if (title.invalid && (title.dirty || title.touched)) {
              <small class="error">El título es requerido</small>
            }
          </div>

          <div class="form-group">
            <label for="description">Descripción</label>
            <textarea 
              id="description"
              name="description"
              [(ngModel)]="task.description"
              rows="4"
              placeholder="Agrega una descripción (opcional)">
            </textarea>
          </div>

          <div class="button-group">
            <button type="button" class="cancel" (click)="onClose()">Cancelar</button>
            <button type="submit" [disabled]="!form.valid">
              {{ editMode ? 'Guardar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .task-form-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .task-form {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      width: 100%;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

      form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
    }

    .form-group {
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #333;
      }

      input, textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 0.95rem;
        background: #f8f9fa;
        transition: all 0.2s;

        &::placeholder {
          color: #adb5bd;
        }

        &:focus {
          outline: none;
          border-color: #007bff;
          background: white;
          box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
        }
      }

      textarea {
        resize: vertical;
        min-height: 100px;
      }

      .error {
        color: red;
        font-size: 0.875rem;
      }
    }

    .button-group {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;

      button {
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;

        &.cancel {
          background-color: #f8f9fa;
          color: #333;
          border: 1px solid #ddd;

          &:hover {
            background-color: #e9ecef;
          }
        }

        &[type="submit"] {
          background-color: #007bff;
          color: white;
          border: none;

          &:hover {
            background-color: #0056b3;
          }

          &:disabled {
            background-color: #ccc;
            cursor: not-allowed;
          }
        }
      }
    }
  `]
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


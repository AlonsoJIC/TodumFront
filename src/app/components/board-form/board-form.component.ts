import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Board } from '../../models';

@Component({
  selector: 'app-board-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="board-form-overlay" (click)="onClose()">
      <div class="board-form" (click)="$event.stopPropagation()">
        <h3>Create New Board</h3>
        <form (ngSubmit)="onSubmit()" #form="ngForm">
          <div class="form-group">
            <label for="title">Board Title</label>
            <input
              type="text"
              id="title"
              name="title"
              [(ngModel)]="board.title"
              required
              #name="ngModel">
            @if (name.invalid && (name.dirty || name.touched)) {
              <small class="error">Name is required</small>
            }
          </div>
          
          <div class="form-group">
            <label for="description">Description (optional)</label>
            <textarea 
              id="description"
              name="description"
              [(ngModel)]="board.description"
              rows="3">
            </textarea>
          </div>

          <div class="button-group">
            <button type="button" class="cancel" (click)="onClose()">Cancel</button>
            <button type="submit" [disabled]="!form.valid">Create</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .board-form-overlay {
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

    .board-form {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      width: 100%;
      max-width: 500px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

      h3 {
        margin-bottom: 1.5rem;
      }
    }

    .form-group {
      margin-bottom: 1rem;

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }

      input, textarea {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;

        &:focus {
          outline: none;
          border-color: #007bff;
        }
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
export class BoardFormComponent {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Partial<Board>>();

  board: Partial<Board> = {
    title: '',
    description: ''
  };

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    this.save.emit(this.board);
    this.onClose();
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Card } from '../../models';

@Component({
  selector: 'app-card-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card-form-overlay" (click)="onClose()">
      <div class="card-form" (click)="$event.stopPropagation()">
        <h3>{{ editMode ? 'Edit Card' : 'Create New Card' }}</h3>
        <form (ngSubmit)="onSubmit()" #form="ngForm">
          <div class="form-group">
            <label for="title">Card Title</label>
            <input 
              type="text" 
              id="title"
              name="title"
              [(ngModel)]="card.title"
              required
              #title="ngModel">
            @if (title.invalid && (title.dirty || title.touched)) {
              <small class="error">Title is required</small>
            }
          </div>

          <div class="button-group">
            <button type="button" class="cancel" (click)="onClose()">Cancel</button>
            <button type="submit" [disabled]="!form.valid">
              {{ editMode ? 'Save' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .card-form-overlay {
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

    .card-form {
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

      input {
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
export class CardFormComponent {
  @Input() editMode = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Partial<Card>>();

  card: Partial<Card> = {
    title: ''
  };

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    this.save.emit(this.card);
    this.onClose();
  }
}

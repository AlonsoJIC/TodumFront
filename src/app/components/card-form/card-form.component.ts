import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Card } from '../../models';

@Component({
  selector: 'app-card-form',
  standalone: true,
  templateUrl: './card-form.component.html',
  styleUrls: ['./card-form.component.scss'],
  imports: [CommonModule, FormsModule]
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

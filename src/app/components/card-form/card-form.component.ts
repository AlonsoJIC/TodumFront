import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
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
export class CardFormComponent implements OnInit {
  @Input() editMode = false;
  @Input() cardData: Partial<Card> | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Partial<Card>>();

  card: Partial<Card> = {
    title: '',
    description: ''
  };

  ngOnInit(): void {
    // Si hay datos de edición, cargarlos
    if (this.cardData) {
      this.card = { ...this.cardData };
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    this.save.emit(this.card);
    this.onClose();
  }
}

import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Board } from '../../models';

@Component({
  selector: 'app-board-form',
  standalone: true,
  templateUrl: './board-form.component.html',
  styleUrls: ['./board-form.component.scss'],
  imports: [CommonModule, FormsModule]
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

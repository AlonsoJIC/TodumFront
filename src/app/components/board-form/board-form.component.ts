import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
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
export class BoardFormComponent implements OnInit {
  @Input() editMode = false;
  @Input() boardData: Board | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Partial<Board>>();

  board: Partial<Board> = {
    title: '',
    description: ''
  };

  ngOnInit(): void {
    if (this.editMode && this.boardData) {
      this.board = {
        title: this.boardData.title,
        description: this.boardData.description
      };
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    this.save.emit(this.board);
    this.onClose();
  }
}

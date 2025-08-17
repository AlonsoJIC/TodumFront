import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Board } from '../../models';
import { BoardService } from '../../services/board.service';
import { AuthService } from '../../services/auth/auth.service';
import { BoardFormComponent } from '../board-form/board-form.component';

@Component({
  selector: 'app-board-list',
  standalone: true,
  templateUrl: './board-list.component.html',
  styleUrls: ['./board-list.component.scss'],
  imports: [CommonModule, RouterModule, BoardFormComponent]
})
export class BoardListComponent implements OnInit {
  boards: Board[] = [];
  isFormVisible = false;

  constructor(
    private boardService: BoardService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadBoards();
  }

  loadBoards(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }

    this.boardService.getBoardsByUserId(currentUser.id!).subscribe({
      next: (boards) => this.boards = boards,
      error: (error) => console.error('Error loading boards:', error)
    });
  }

  showBoardForm(): void {
    this.isFormVisible = true;
  }

  hideBoardForm(): void {
    this.isFormVisible = false;
  }

  onBoardCreate(boardData: Partial<Board>): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }

    const newBoard: Partial<Board> = {
      ...boardData,
      userId: currentUser.id
    };

    console.log('Sending board data:', newBoard);

    this.boardService.createBoard(newBoard as Board).subscribe({
      next: (board) => {
        console.log('Board created successfully:', board);
        this.boards = [...this.boards, board];
        this.hideBoardForm();
      },
      error: (error) => {
        console.error('Error creating board:', error);
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          error: error.error
        });
      }
    });
  }
}

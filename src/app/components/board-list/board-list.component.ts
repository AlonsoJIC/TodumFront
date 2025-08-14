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
  imports: [CommonModule, RouterModule, BoardFormComponent],
  template: `
    <div class="board-list">
      <h2>My Boards</h2>
      <div class="board-grid">
        @for (board of boards; track board.id) {
          <div class="board-card" [routerLink]="['/boards', board.id]">
            <h3>{{ board.title }}</h3>
            <p>{{ board.description }}</p>
          </div>
        }
        <div class="board-card new-board" (click)="showBoardForm()">
          <h3>+ New Board</h3>
        </div>
      </div>
    </div>

    @if (isFormVisible) {
      <app-board-form
        (close)="hideBoardForm()"
        (save)="onBoardCreate($event)"
      />
    }
  `,
  styles: [`
    .board-list {
      padding: 20px;
    }
    
    .board-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    
    .board-card {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: transform 0.2s;
    
      &:hover {
        transform: translateY(-2px);
      }
    
      h3 {
        margin: 0 0 10px;
        color: #333;
      }
    
      p {
        margin: 0;
        color: #666;
      }
    }
    
    .new-board {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      border: 2px dashed #ddd;
      
      h3 {
        color: #666;
      }
      
      &:hover {
        background: #ebebeb;
      }
    }
  `]
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

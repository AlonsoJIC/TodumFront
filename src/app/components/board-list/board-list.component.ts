import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Board } from '../../models';
import { BoardService } from '../../services/board.service';
import { AuthService } from '../../services/auth/auth.service';
import { BoardFormComponent } from '../board-form/board-form.component';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-board-list',
  standalone: true,
  templateUrl: './board-list.component.html',
  styleUrls: ['./board-list.component.scss'],
  imports: [CommonModule, RouterModule, BoardFormComponent, MatMenuModule, MatIconModule, MatButtonModule]
})
export class BoardListComponent implements OnInit {
  boards: Board[] = [];
  isFormVisible = false;
  selectedBoard: Board | null = null;
  editMode = false;

  constructor(
    private boardService: BoardService,
    private authService: AuthService,
    private dialog: MatDialog
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
    this.selectedBoard = null;
    this.editMode = false;
    this.isFormVisible = true;
  }

  hideBoardForm(): void {
    this.isFormVisible = false;
    this.selectedBoard = null;
    this.editMode = false;
  }

  editBoard(board: Board, event: Event): void {
    event.stopPropagation();
    this.selectedBoard = board;
    this.editMode = true;
    this.isFormVisible = true;
  }

  deleteBoard(board: Board, event: Event): void {
    event.stopPropagation();

    const dialogData: ConfirmationDialogData = {
      title: 'Eliminar Tablero',
      message: `¿Estás seguro de que quieres eliminar el tablero <strong>"${board.title}"</strong>?<br><br>
                <span style="color: #d32f2f;">⚠️ Esta acción es irreversible y eliminará:</span><br>
                • Todas las cartas del tablero<br>
                • Todas las tareas asociadas<br>
                • Todo el contenido relacionado`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.boardService.deleteBoard(board.id!).subscribe({
          next: () => {
            this.boards = this.boards.filter(b => b.id !== board.id);
            console.log('Board deleted successfully');
          },
          error: (error) => {
            console.error('Error deleting board:', error);
          }
        });
      }
    });
  }

  onBoardCreate(boardData: Partial<Board>): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }

    if (this.editMode && this.selectedBoard) {
      // Editar tablero existente
      const updatedBoard: Board = {
        ...this.selectedBoard,
        ...boardData
      };

      this.boardService.updateBoard(this.selectedBoard.id!, updatedBoard).subscribe({
        next: (board) => {
          console.log('Board updated successfully:', board);
          const index = this.boards.findIndex(b => b.id === board.id);
          if (index !== -1) {
            this.boards[index] = board;
          }
          this.hideBoardForm();
        },
        error: (error) => {
          console.error('Error updating board:', error);
        }
      });
    } else {
      // Crear nuevo tablero
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
}

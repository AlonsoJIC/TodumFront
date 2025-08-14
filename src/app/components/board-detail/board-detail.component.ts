import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Board, Card, Task } from '../../models';
import { BoardService } from '../../services/board.service';
import { CardService } from '../../services/card.service';
import { TaskService } from '../../services/task.service';
import { CardFormComponent } from '../card-form/card-form.component';
import { TaskFormComponent } from '../task-form/task-form.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [CommonModule, CardFormComponent, TaskFormComponent, MatMenuModule, MatIconModule, MatButtonModule, MatDialogModule],
  providers: [CardService, TaskService],
  template: `
    <div class="board-detail">
      @if (board) {
        <h2>{{ board.title }}</h2>
        <div class="cards-container">
          @for (card of cards; track card.id) {
            <div class="card">
              <h3>{{ card.title }}</h3>
              @if (card.description) {
                <p>{{ card.description }}</p>
              }
              <div class="tasks">
                @for (task of card.tasks || []; track task.id) {
                  <div class="task">
                    <div class="task-content">
                      <div class="task-title" [class.completed]="task.completed">{{ task.title }}</div>
                      @if (task.description) {
                        <div class="task-description">{{ task.description }}</div>
                      }
                    </div>
                    <button mat-icon-button [matMenuTriggerFor]="menu" class="menu-dots">
                      ⋮
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item (click)="toggleTask(task)">
                        <mat-icon>{{ task.completed ? 'task_alt' : 'radio_button_unchecked' }}</mat-icon>
                        <span>{{ task.completed ? 'Marcar como pendiente' : 'Marcar como hecha' }}</span>
                      </button>
                      <button mat-menu-item (click)="editTask(task, card.id!)">
                        <mat-icon>edit</mat-icon>
                        <span>Editar</span>
                      </button>
                      <button mat-menu-item (click)="deleteTask(task)">
                        <mat-icon>delete</mat-icon>
                        <span>Eliminar</span>
                      </button>
                    </mat-menu>
                  </div>
                }
              </div>
              <button class="add-task-btn" (click)="showTaskForm(card)">+ Add Task</button>
            </div>
          }
          <div class="card new-card" (click)="showAddCard = true">
            <h3>+ New Card</h3>
          </div>
        </div>

        @if (showAddCard) {
          <app-card-form
            (close)="showAddCard = false"
            (save)="onSaveCard($event)"
          />
        }

        @if (showAddTask) {
          <app-task-form
            (close)="showAddTask = false"
            (save)="onSaveTask($event)"
          />
        }
      } @else {
        <p>Loading...</p>
      }
    </div>
  `,
  styles: [`
    .board-detail {
      padding: 20px;
    }

    .cards-container {
      display: flex;
      gap: 20px;
      overflow-x: auto;
      padding: 20px 0;
      min-height: calc(100vh - 100px);
    }

    .card {
      background: #fff;
      border-radius: 8px;
      padding: 16px;
      width: 300px;
      height: fit-content;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);

      h3 {
        margin: 0 0 12px;
        color: #333;
        font-size: 1.1rem;
      }

      .tasks {
        margin: 12px 0;
        max-height: calc(100vh - 250px);
        overflow-y: auto;
      }

        .task {
        display: flex;
        align-items: flex-start;
        padding: 10px 12px;
        margin-bottom: 6px;
        border-radius: 4px;
        background: #f8f9fa;
        transition: background-color 0.2s;

        .task-content {
          flex: 1;
          min-width: 0;
          margin-right: 8px;

          .task-title {
            font-size: 0.95rem;
            font-weight: 500;
            margin-bottom: 4px;
            word-wrap: break-word;

            &.completed {
              text-decoration: line-through;
              color: #888;
            }
          }

          .task-description {
            font-size: 0.85rem;
            color: #666;
            word-wrap: break-word;
            line-height: 1.4;
          }
        }

        .menu-dots {
          color: #666;
          width: 24px;
          height: 24px;
          line-height: 24px;
          font-size: 18px;
          padding: 0;
          min-width: unset;
          margin-top: -2px;
          border-radius: 4px;

          &:hover {
            background-color: rgba(0, 0, 0, 0.04);
          }
        }        &:hover {
          background-color: #f0f2f5;
        }

        &:last-child {
          margin-bottom: 0;
        }
      }

      .add-task-btn {
        width: 100%;
        padding: 8px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
        font-size: 0.95rem;

        &:hover {
          background: #0056b3;
        }
      }
    }

    .new-card {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #007bff;
      border: none;
      cursor: pointer;
      transition: background-color 0.2s;
      width: 300px;
      height: 100px;

      h3 {
        color: white;
        margin: 0;
        font-size: 1.1rem;
      }

      &:hover {
        background: #0056b3;
      }
    }
  `]
})
export class BoardDetailComponent implements OnInit {
  board: Board | null = null;
  cards: Card[] = [];
  showAddCard = false;
  showAddTask = false;
  selectedCard: Card | null = null;

  constructor(
    private route: ActivatedRoute,
    private boardService: BoardService,
    private cardService: CardService,
    private taskService: TaskService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const boardId = parseInt(params['id'], 10);
      this.loadBoard(boardId);
      this.loadCards(boardId);
    });
  }

  loadBoard(boardId: number): void {
    this.boardService.getBoardById(boardId).subscribe({
      next: (board) => this.board = board,
      error: (error) => console.error('Error loading board:', error)
    });
  }

  loadCards(boardId: number): void {
    this.cardService.getCardsByBoardId(boardId).subscribe({
      next: (cards) => this.cards = cards,
      error: (error) => console.error('Error loading cards:', error)
    });
  }

  showTaskForm(card: Card): void {
    this.selectedCard = card;
    this.showAddTask = true;
  }

  onSaveCard(cardData: Partial<Card>): void {
    if (!this.board?.id) return;

    const newCard: Card = {
      ...cardData as Card,
      boardId: this.board.id,
      position: this.cards.length,
      title: cardData.title || ''
    };

    this.cardService.createCard(newCard).subscribe({
      next: (card: Card) => {
        this.cards.push(card);
        this.showAddCard = false;
      },
      error: (error: Error) => {
        console.error('Error creating card:', error);
      }
    });
  }

  onSaveTask(taskData: Partial<Task>): void {
    if (!this.selectedCard?.id) return;

    const newTask: Task = {
      ...taskData as Task,
      cardId: this.selectedCard.id,
      position: (this.selectedCard.tasks || []).length,
      title: taskData.title || '',
      completed: false
    };

    this.taskService.createTask(newTask).subscribe({
      next: (task: Task) => {
        if (this.selectedCard) {
          if (this.selectedCard.tasks) {
            this.selectedCard.tasks.push(task);
          } else {
            this.selectedCard.tasks = [task];
          }
        }
        this.showAddTask = false;
        this.selectedCard = null;
      },
      error: (error: Error) => {
        console.error('Error creating task:', error);
      }
    });
  }

  toggleTask(task: Task): void {
    if (!task.id) return;

    this.taskService.toggleTaskComplete(task.id).subscribe({
      next: (updatedTask: Task) => {
        const card = this.cards.find(c => c.id === updatedTask.cardId);
        if (card && card.tasks) {
          const index = card.tasks.findIndex(t => t.id === updatedTask.id);
          if (index !== -1) {
            card.tasks[index] = updatedTask;
          }
        }
      },
      error: (error: Error) => {
        console.error('Error toggling task:', error);
      }
    });
  }

  editTask(task: Task, cardId: number): void {
    console.log('BoardDetail editTask - original task:', task, 'cardId:', cardId);
    const taskToEdit: Task = {
      ...task,
      cardId: cardId, // Usar el cardId que se pasa como parámetro
      description: task.description || ''
    };
    console.log('BoardDetail editTask - taskToEdit:', taskToEdit);

    const dialogRef = this.dialog.open(TaskDialogComponent, {
      data: taskToEdit,
      width: '500px'
    }); dialogRef.afterClosed().subscribe(result => {
      console.log('BoardDetail dialog closed - result:', result);
      if (result && result.id && result.cardId) {
        console.log('BoardDetail attempting to update task:', result);
        this.taskService.updateTask(result.id, result).subscribe({
          next: (updatedTask: Task) => {
            console.log('BoardDetail update success:', updatedTask);
            // Buscar en todas las tarjetas
            this.cards.forEach(card => {
              if (card.tasks) {
                const index = card.tasks.findIndex(t => t.id === updatedTask.id);
                if (index !== -1) {
                  card.tasks[index] = updatedTask;
                }
              }
            });
          },
          error: (error: Error) => {
            console.error('Error updating task:', error);
          }
        });
      } else {
        console.log('BoardDetail update cancelled or invalid data:', result);
      }
    });
  }

  deleteTask(task: Task): void {
    if (!task.id) return;

    this.taskService.deleteTask(task.id).subscribe({
      next: () => {
        const card = this.cards.find(c => c.id === task.cardId);
        if (card && card.tasks) {
          card.tasks = card.tasks.filter(t => t.id !== task.id);
        }
      },
      error: (error: Error) => {
        console.error('Error deleting task:', error);
      }
    });
  }
}

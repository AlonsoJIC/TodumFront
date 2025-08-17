import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  templateUrl: './board-detail.component.html',
  styleUrls: ['./board-detail.component.scss'],
  imports: [
    CommonModule,
    CardFormComponent,
    TaskFormComponent,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    DragDropModule
  ],
  providers: [CardService, TaskService]
})
export class BoardDetailComponent implements OnInit {
  board: Board | null = null;
  cards: Card[] = [];
  showAddCard = false;
  showAddTask = false;
  selectedCard: Card | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private boardService: BoardService,
    private cardService: CardService,
    private taskService: TaskService,
    private dialog: MatDialog
  ) { }

  goBack(): void {
    this.router.navigate(['/boards']);
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const boardId = parseInt(params['id'], 10);
      this.loadBoard(boardId);
      this.loadCards(boardId);
    });
  }

  dropTask(event: CdkDragDrop<Task[] | undefined>) {
    if (!event.container.data) return;
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

      // Actualizar las posiciones en la base de datos
      const tasks = event.container.data;
      tasks.forEach((task, index) => {
        if (task.id) {
          const updatedTask = { ...task, position: index };
          this.taskService.updateTask(task.id, updatedTask).subscribe({
            error: (error) => console.error('Error updating task position:', error)
          });
        }
      });
    }
  } loadTasksForCard(cardId: number): void {
    this.taskService.getTasksByCardId(cardId).subscribe({
      next: (tasks) => {
        const card = this.cards.find(c => c.id === cardId);
        if (card) {
          card.tasks = tasks.sort((a, b) => (a.position || 0) - (b.position || 0));
        }
      },
      error: (error) => console.error('Error loading tasks:', error)
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
      next: (cards) => {
        this.cards = cards;
        // Cargar y ordenar las tareas para cada tarjeta
        cards.forEach(card => {
          if (card.id) {
            this.loadTasksForCard(card.id);
          }
        });
      },
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
        this.cards = this.cards.map(card => {
          if (card.tasks) {
            const taskIndex = card.tasks.findIndex(t => t.id === updatedTask.id);
            if (taskIndex !== -1) {
              return {
                ...card,
                tasks: [
                  ...card.tasks.slice(0, taskIndex),
                  updatedTask,
                  ...card.tasks.slice(taskIndex + 1)
                ]
              };
            }
          }
          return card;
        });
      },
      error: (error: Error) => console.error('Error toggling task:', error)
    });
  }

  editTask(task: Task, cardId: number): void {
    const taskToEdit: Task = {
      ...task,
      cardId,
      description: task.description || ''
    };

    const dialogRef = this.dialog.open(TaskDialogComponent, {
      data: taskToEdit,
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.id && result?.cardId) {
        this.taskService.updateTask(result.id, result).subscribe({
          next: (updatedTask: Task) => {
            this.cards = this.cards.map(card => {
              if (card.tasks) {
                const taskIndex = card.tasks.findIndex(t => t.id === updatedTask.id);
                if (taskIndex !== -1) {
                  return {
                    ...card,
                    tasks: [
                      ...card.tasks.slice(0, taskIndex),
                      updatedTask,
                      ...card.tasks.slice(taskIndex + 1)
                    ]
                  };
                }
              }
              return card;
            });
          },
          error: (error: Error) => console.error('Error updating task:', error)
        });
      }
    });
  }

  deleteTask(task: Task): void {
    if (!task.id) return;

    this.taskService.deleteTask(task.id).subscribe({
      next: () => {
        this.cards = this.cards.map(card => {
          if (card.id === task.cardId && card.tasks) {
            return {
              ...card,
              tasks: card.tasks.filter(t => t.id !== task.id)
            };
          }
          return card;
        });
      },
      error: (error: Error) => console.error('Error deleting task:', error)
    });
  }
}

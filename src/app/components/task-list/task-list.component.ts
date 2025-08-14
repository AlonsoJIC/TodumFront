import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Card, Task } from '../../models';
import { CardService } from '../../services/card.service';
import { TaskService } from '../../services/task.service';
import { TaskFormComponent } from '../task-form/task-form.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskFormComponent, MatMenuModule, MatIconModule, MatButtonModule, MatDialogModule],
  providers: [TaskService],
  template: `
    <div class="task-container">
      @if (card) {
        <div class="card-header">
          <h2>{{ card.title }}</h2>
          @if (card.description) {
            <p class="description">{{ card.description }}</p>
          }
        </div>

        <div class="tasks">
          @if ((card.tasks || []).length === 0) {
            <div class="no-tasks">
              <p>No tasks yet. Click "Add Task" to create one.</p>
            </div>
          }
          @for (task of card.tasks || []; track task.id) {
            <div class="task-item">
              <span [class.completed]="task.completed">{{ task.title }}</span>
              <button mat-icon-button [matMenuTriggerFor]="menu" class="menu-dots">
                ⋮
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="toggleTask(task)">
                  <mat-icon>{{ task.completed ? 'task_alt' : 'radio_button_unchecked' }}</mat-icon>
                  <span>{{ task.completed ? 'Marcar como pendiente' : 'Marcar como hecha' }}</span>
                </button>
                <button mat-menu-item (click)="editTask(task)">
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

        <button class="add-task-btn" (click)="showAddTask = true">
          + Add Task
        </button>

        @if (showAddTask) {
          <app-task-form
            (close)="showAddTask = false"
            (save)="onSaveTask($event)"
          />
        }
      } @else {
        <div class="loading">Loading...</div>
      }
    </div>
  `,
  styles: [`
    .task-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .card-header {
      margin-bottom: 30px;
      
      h2 {
        margin: 0 0 10px;
        color: #333;
      }

      .description {
        color: #666;
        font-size: 1rem;
      }
    }

    .tasks {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .no-tasks {
      text-align: center;
      padding: 40px 20px;
      color: #666;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .task-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
      
      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background-color: #f8f9fa;
      }

      span {
        flex: 1;
        font-size: 1.1rem;
        margin-right: 16px;
      }

      .menu-dots {
        font-size: 20px;
        color: #666;
        font-weight: bold;
        padding: 8px;
        min-width: 40px;
        line-height: 1;
        background: transparent;
        
        &:hover {
          background-color: #f0f0f0;
        }
      }

      .completed {
        text-decoration: line-through;
        color: #888;
      }
    }

    .add-task-btn {
      width: 100%;
      padding: 12px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.2s;

      &:hover {
        background: #0056b3;
      }
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }
  `]
})
export class TaskListComponent implements OnInit {
  card: Card | null = null;
  showAddTask = false;

  constructor(
    private route: ActivatedRoute,
    private cardService: CardService,
    private taskService: TaskService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const cardId = parseInt(params['id'], 10);
      this.loadCard(cardId);
    });
  }

  private loadCard(cardId: number) {
    this.cardService.getCardById(cardId).subscribe({
      next: (card: Card) => {
        this.card = card;
      },
      error: (error: Error) => {
        console.error('Error loading card:', error);
        // TODO: Add proper error handling
      }
    });
  }

  onSaveTask(taskData: Partial<Task>) {
    if (!this.card?.id) return;

    const newTask: Task = {
      ...taskData as Task,
      cardId: this.card.id,
      position: (this.card.tasks || []).length,
      title: taskData.title || '',
      completed: false
    };

    this.taskService.createTask(newTask).subscribe({
      next: (task: Task) => {
        if (this.card && this.card.tasks) {
          this.card.tasks.push(task);
        } else if (this.card) {
          this.card.tasks = [task];
        }
        this.showAddTask = false;
      },
      error: (error: Error) => {
        console.error('Error creating task:', error);
      }
    });
  }

  toggleTask(task: Task) {
    if (!task.id) return;

    this.taskService.toggleTaskComplete(task.id).subscribe({
      next: (updatedTask: Task) => {
        if (this.card && this.card.tasks) {
          const index = this.card.tasks.findIndex(t => t.id === updatedTask.id);
          if (index !== -1) {
            this.card.tasks[index] = updatedTask;
          }
        }
      },
      error: (error: Error) => {
        console.error('Error toggling task:', error);
      }
    });
  }

  editTask(task: Task) {
    console.log('TaskList editTask - original task:', task);
    // Asegurarnos de que tenemos todos los datos necesarios
    const taskToEdit: Task = {
      id: task.id!,
      title: task.title,
      description: task.description || '',
      position: task.position,
      completed: task.completed || false,
      cardId: this.card?.id || task.cardId // Asegurarnos de que tenemos el cardId
    };
    console.log('TaskList editTask - prepared task:', taskToEdit);

    const dialogRef = this.dialog.open(TaskDialogComponent, {
      data: taskToEdit,
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('TaskList dialog closed - result:', result);
      console.log('TaskList current card state:', this.card);
      if (result) {
        console.log('TaskList has result');
        if (this.card?.tasks) {
          console.log('TaskList has card tasks');
          if (result.id) {
            console.log('TaskList has result.id');
            console.log('TaskList attempting to update task with:', result);
            this.taskService.updateTask(result.id, result).subscribe({
              next: (updatedTask: Task) => {
                console.log('TaskList update success - updatedTask:', updatedTask);
                const index = this.card!.tasks!.findIndex(t => t.id === updatedTask.id);
                if (index !== -1) {
                  this.card!.tasks![index] = updatedTask;
                }
              },
              error: (error: Error) => {
                console.error('Error updating task:', error);
              }
            });
          } else {
            console.log('TaskList missing result.id');
          }
        } else {
          console.log('TaskList missing card.tasks');
        }
      } else {
        console.log('TaskList update canceled or invalid result');
      }
    });
  }

  deleteTask(task: Task) {
    if (!task.id) return;

    this.taskService.deleteTask(task.id).subscribe({
      next: () => {
        if (this.card && this.card.tasks) {
          this.card.tasks = this.card.tasks.filter(t => t.id !== task.id);
        }
      },
      error: (error: Error) => {
        console.error('Error deleting task:', error);
      }
    });
  }
}

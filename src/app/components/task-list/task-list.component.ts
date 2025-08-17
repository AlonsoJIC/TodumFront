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
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  imports: [CommonModule, TaskFormComponent, MatMenuModule, MatIconModule, MatButtonModule, MatDialogModule],
  providers: [TaskService]
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
    // Asegurarnos de que tenemos todos los datos necesarios
    const taskToEdit: Task = {
      id: task.id!,
      title: task.title,
      description: task.description || '',
      position: task.position,
      completed: task.completed || false,
      cardId: this.card?.id || task.cardId // Asegurarnos de que tenemos el cardId
    };

    const dialogRef = this.dialog.open(TaskDialogComponent, {
      data: taskToEdit,
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.card?.tasks) {
          if (result.id) {
            this.taskService.updateTask(result.id, result).subscribe({
              next: (updatedTask: Task) => {
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

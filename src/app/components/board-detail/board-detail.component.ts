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
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';

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
  private isUpdating = false; // ⭐ Flag para evitar updates concurrentes
  isProcessingDragDrop = false; // ⭐ Flag visual para el usuario

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
    console.log('🎯 DROP EVENT TRIGGERED');

    if (!event.container.data) {
      console.log('❌ No container data');
      return;
    }

    if (this.isUpdating) {
      console.log('⏸️ Ya hay una actualización en progreso');
      return;
    }

    this.isUpdating = true;
    this.isProcessingDragDrop = true;
    console.log('🔒 Bloqueando nuevas actualizaciones');

    if (event.previousContainer === event.container) {
      // Movimiento dentro de la misma carta
      console.log('📦 Movimiento DENTRO de la misma carta');
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

      // Simpler approach - actualizar solo las posiciones que cambiaron
      this.updateSimplePositions(event.container.data);

    } else {
      // Movimiento entre diferentes cartas
      console.log('🔄 Movimiento ENTRE diferentes cartas');

      if (!event.previousContainer.data) {
        this.resetFlags();
        return;
      }

      // Hacer el transfer
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const targetCardId = this.getCardIdFromDropListId(event.container.id);
      const movedTask = event.container.data[event.currentIndex];

      console.log('🎯 Task movida:', movedTask);
      console.log('🎯 Target card ID:', targetCardId);

      if (targetCardId && movedTask?.id) {
        // Actualizar la tarea principal primero
        const updatedTask = { ...movedTask, cardId: targetCardId, position: event.currentIndex };

        console.log('� Enviando actualización principal:', updatedTask);

        this.taskService.updateTask(movedTask.id, updatedTask).subscribe({
          next: (response) => {
            console.log('✅ Tarea principal actualizada:', response);

            // ⭐ IMPORTANTE: Actualizar el cardId en el objeto local para que las siguientes actualizaciones sean correctas
            movedTask.cardId = targetCardId;
            console.log('🔄 CardId actualizado localmente en la tarea movida:', movedTask);

            // Ahora actualizar las posiciones de ambas cartas
            this.updateSimplePositions(event.previousContainer.data || []);
            this.updateSimplePositions(event.container.data || []);
          },
          error: (error) => {
            console.error('❌ Error updating main task:', error);
            this.resetFlags();
          }
        });
      } else {
        console.log('❌ No target card ID or task ID');
        this.resetFlags();
      }
    }
  }

  private resetFlags(): void {
    this.isUpdating = false;
    this.isProcessingDragDrop = false;
    console.log('🔓 Flags reseteados');
  }

  private updateSimplePositions(tasks: Task[]): void {
    console.log('🔄 Actualizando posiciones simples para:', tasks.length, 'tareas');

    let updatesCompleted = 0;
    let totalUpdates = 0;

    tasks.forEach((task, index) => {
      if (task.id && task.position !== index) {
        totalUpdates++;
        console.log(`📤 Actualizando tarea ${task.id}: posición ${task.position} -> ${index} | cardId: ${task.cardId}`);

        const updatedTask = { ...task, position: index };
        console.log(`📤 DTO que se enviará:`, updatedTask);

        this.taskService.updateTask(task.id, updatedTask).subscribe({
          next: (response) => {
            console.log(`✅ Tarea ${task.id} actualizada:`, response);
            task.position = index; // Actualizar localmente
            updatesCompleted++;

            if (updatesCompleted === totalUpdates) {
              console.log('✅ Todas las actualizaciones completadas');
              this.resetFlags();
            }
          },
          error: (error) => {
            console.error(`❌ Error actualizando tarea ${task.id}:`, error);
            updatesCompleted++;

            if (updatesCompleted === totalUpdates) {
              console.log('⚠️ Actualizaciones completadas (con errores)');
              this.resetFlags();
            }
          }
        });
      }
    });

    if (totalUpdates === 0) {
      console.log('⏭️ No hay actualizaciones necesarias');
      this.resetFlags();
    }
  } private getCardIdFromDropListId(dropListId: string): number | null {
    const match = dropListId.match(/card-(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  private updateTaskPositions(tasks: Task[]): void {
    console.log('🔄 Actualizando posiciones de tareas:', tasks);
    tasks.forEach((task, index) => {
      if (task.id && task.position !== index) {
        console.log(`🔄 Actualizando posición de tarea ${task.id}: ${task.position} -> ${index}`);
        const updatedTask = { ...task, position: index };
        this.taskService.updateTask(task.id, updatedTask).subscribe({
          next: (response) => {
            console.log(`✅ Posición actualizada para tarea ${task.id}:`, response);
          },
          error: (error) => {
            console.error(`❌ Error updating task position for task ${task.id}:`, error);
          }
        });
      } else {
        console.log(`⏭️ Tarea ${task.id} ya tiene la posición correcta: ${task.position}`);
      }
    });
  }

  // ⭐ Método simplificado que actualiza las posiciones
  private updateTaskPositionsSequentially(tasks: Task[]): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('🔄 Actualizando posiciones de tareas:', tasks);

      const updatePromises: Promise<any>[] = [];

      tasks.forEach((task, index) => {
        if (task.id && task.position !== index) {
          console.log(`🔄 Actualizando posición de tarea ${task.id}: ${task.position} -> ${index}`);
          const updatedTask = { ...task, position: index };

          const updatePromise = new Promise((resolveUpdate, rejectUpdate) => {
            this.taskService.updateTask(task.id!, updatedTask).subscribe({
              next: (response) => {
                console.log(`✅ Posición actualizada para tarea ${task.id}:`, response);
                task.position = index; // Actualizar localmente
                resolveUpdate(response);
              },
              error: (error) => {
                console.error(`❌ Error updating task position for task ${task.id}:`, error);
                rejectUpdate(error);
              }
            });
          });

          updatePromises.push(updatePromise);
        } else {
          console.log(`⏭️ Tarea ${task.id} ya tiene la posición correcta: ${index}`);
        }
      });

      if (updatePromises.length === 0) {
        console.log('⏭️ No hay tareas que necesiten actualizar posición');
        resolve();
        return;
      }

      Promise.all(updatePromises)
        .then(() => {
          console.log('✅ Todas las actualizaciones de posición completadas');
          resolve();
        })
        .catch((error) => {
          console.error('❌ Error en alguna actualización:', error);
          reject(error);
        });
    });
  }

  loadTasksForCard(cardId: number): void {
    console.log('🔍 Cargando tareas para carta:', cardId);
    console.log('🔍 Estado actual de las cartas antes de cargar:', this.cards);

    this.taskService.getTasksByCardId(cardId).subscribe({
      next: (tasks) => {
        console.log('📋 Tareas recibidas del backend para carta', cardId, ':', tasks);
        const card = this.cards.find(c => c.id === cardId);
        if (card) {
          const sortedTasks = tasks.sort((a, b) => (a.position || 0) - (b.position || 0));
          console.log('📋 Tareas ordenadas por posición:', sortedTasks);
          console.log('📋 Asignando tareas a la carta:', card);
          card.tasks = sortedTasks;
          console.log('📋 Carta después de asignar tareas:', card);
        } else {
          console.log('❌ No se encontró la carta con ID:', cardId);
        }
      },
      error: (error) => console.error('❌ Error loading tasks:', error)
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

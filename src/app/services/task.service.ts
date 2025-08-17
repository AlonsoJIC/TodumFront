import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError, switchMap, map } from 'rxjs/operators';
import { Task } from '../models';

interface MoveTaskDTO {
  taskId: number;
  newPosition: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:8080/api/tasks';

  constructor(private http: HttpClient) { }

  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl).pipe(
      map((tasks: any[]) => tasks.map(task => ({
        ...task,
        completed: task.completed || false
      })))
    );
  }

  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`).pipe(
      map((task: any) => ({
        ...task,
        completed: task.completed || false
      }))
    );
  }

  getTasksByCardId(cardId: number): Observable<Task[]> {
    console.log('🔍 TaskService - getTasksByCardId - solicitando tareas para carta:', cardId);
    console.log('🔍 TaskService - getTasksByCardId - URL:', `${this.apiUrl}/card/${cardId}`);

    // Agregar timestamp para evitar caché
    const timestamp = new Date().getTime();
    const url = `${this.apiUrl}/card/${cardId}?t=${timestamp}`;
    console.log('🔍 TaskService - getTasksByCardId - URL con timestamp:', url);

    return this.http.get<Task[]>(url).pipe(
      tap(tasks => {
        console.log('📋 TaskService - getTasksByCardId - respuesta del backend (RAW):', tasks);
        tasks.forEach(task => {
          console.log(`📋 Task ID ${task.id}: cardId=${task.cardId}, position=${task.position}, title="${task.title}"`);
        });
      }),
      map((tasks: any[]) => tasks.map(task => ({
        ...task,
        completed: task.completed || false
      }))),
      tap(mappedTasks => {
        console.log('📋 TaskService - getTasksByCardId - tareas mapeadas:', mappedTasks);
        mappedTasks.forEach(task => {
          console.log(`📋 Mapped Task ID ${task.id}: cardId=${task.cardId}, position=${task.position}, title="${task.title}"`);
        });
      })
    );
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(id: number, task: Task): Observable<Task> {
    // Crear un DTO que coincida con el backend
    const taskDTO = {
      id: task.id,
      cardId: task.cardId,
      title: task.title,
      description: task.description || '',
      position: task.position,
      completed: task.completed
    };

    console.log('📤 TaskService - updateTask - ID:', id);
    console.log('📤 TaskService - updateTask - Task original:', task);
    console.log('📤 TaskService - updateTask - DTO enviado al backend:', taskDTO);
    console.log('📤 TaskService - updateTask - URL:', `${this.apiUrl}/${id}`);

    return this.http.put<Task>(`${this.apiUrl}/${id}`, taskDTO).pipe(
      tap(response => {
        console.log('📥 TaskService - updateTask - Respuesta del backend:', response);
        console.log('📥 TaskService - updateTask - cardId en respuesta:', response.cardId);
        console.log('📥 TaskService - updateTask - position en respuesta:', response.position);
      }),
      map((response: any) => ({
        ...response,
        completed: response.completed ?? taskDTO.completed // Usar el valor del backend si existe
      })),
      tap(finalTask => {
        console.log('✅ TaskService - updateTask - Task final mapeada:', finalTask);
        console.log('✅ TaskService - updateTask - cardId final:', finalTask.cardId);
        console.log('✅ TaskService - updateTask - position final:', finalTask.position);
      }),
      catchError((error: any) => {
        console.error('❌ TaskService updateTask error:', error);
        console.error('❌ Error details:', error.error);
        throw error;
      })
    );
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  moveTask(taskId: number, newPosition: number): Observable<Task> {
    const moveTaskDTO: MoveTaskDTO = {
      taskId,
      newPosition
    };
    return this.http.put<Task>(`${this.apiUrl}/${taskId}/move`, moveTaskDTO).pipe(
      catchError(error => {
        console.error('Error moving task:', error);
        throw error;
      })
    );
  }

  toggleTaskComplete(id: number): Observable<Task> {
    console.log('TaskService - toggleTaskComplete - starting for id:', id);
    return this.http.get<Task>(`${this.apiUrl}/${id}`).pipe(
      tap(task => console.log('TaskService - current task state:', task)),
      switchMap((task: Task) => {
        const updatedTask: Task = {
          ...task,
          completed: !task.completed
        };
        console.log('TaskService - sending updated task:', updatedTask);
        return this.updateTask(id, updatedTask);
      }),
      tap(result => console.log('TaskService - toggle result:', result))
    );
  }
}

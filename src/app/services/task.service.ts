import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Task } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:8080/api/tasks';

  constructor(private http: HttpClient) { }

  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  getTasksByCardId(cardId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/card/${cardId}`);
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(id: number, task: Task): Observable<Task> {
    console.log('TaskService updateTask - URL:', `${this.apiUrl}/${id}`);
    console.log('TaskService updateTask - Request payload:', task);

    // Crear un DTO que coincida con el backend
    const taskDTO = {
      id: task.id,
      cardId: task.cardId,
      title: task.title,
      description: task.description || '',
      position: task.position,
      completed: task.completed || false
    };

    return this.http.put<Task>(`${this.apiUrl}/${id}`, taskDTO).pipe(
      tap((response: Task) => {
        console.log('TaskService updateTask response:', response);
        return response;
      }),
      catchError((error: any) => {
        console.error('TaskService updateTask error:', error);
        throw error;
      })
    );
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleTaskComplete(id: number): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}/toggle`, {});
  }
}

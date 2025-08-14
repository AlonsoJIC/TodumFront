import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Board } from '../models';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private apiUrl = 'http://localhost:8080/api/boards';

  constructor(private http: HttpClient) { }

  getAllBoards(): Observable<Board[]> {
    return this.http.get<Board[]>(this.apiUrl);
  }

  getBoardById(id: number): Observable<Board> {
    return this.http.get<Board>(`${this.apiUrl}/${id}`);
  }

  getBoardsByUserId(userId: number): Observable<Board[]> {
    return this.http.get<Board[]>(`${this.apiUrl}/user/${userId}`);
  }

  createBoard(board: Board): Observable<Board> {
    return this.http.post<Board>(this.apiUrl, board);
  }

  updateBoard(id: number, board: Board): Observable<Board> {
    return this.http.put<Board>(`${this.apiUrl}/${id}`, board);
  }

  deleteBoard(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

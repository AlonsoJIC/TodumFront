import { Task } from './task.model';

export interface Card {
  id?: number;
  title: string;
  description?: string;
  boardId: number;
  position: number;
  tasks?: Task[];
}

export interface Task {
  id?: number;
  title: string;
  description?: string;
  completed?: boolean;
  position: number;
  cardId: number;
}

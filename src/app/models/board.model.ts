import { Card } from './card.model';

export interface Board {
  id?: number;
  title: string;
  description?: string;
  userId: number;
  cards?: Card[];
}

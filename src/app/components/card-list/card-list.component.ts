import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Card, Task } from '../../models';
import { CardService } from '../../services/card.service';
import { CardFormComponent } from '../card-form/card-form.component';

@Component({
  selector: 'app-card-list',
  standalone: true,
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss'],
  imports: [CommonModule, CardFormComponent],
  providers: [CardService]
})
export class CardListComponent {
  @Input() boardId!: number;
  cards: Card[] = [];
  showAddCard = false;

  constructor(
    private cardService: CardService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadCards();
  }

  private loadCards() {
    this.cardService.getCardsByBoardId(this.boardId).subscribe({
      next: (cards: Card[]) => {
        this.cards = cards;
      },
      error: (error: Error) => {
        console.error('Error loading cards:', error);
        // TODO: Add proper error handling
      }
    });
  }

  onCardClick(card: Card): void {
    this.router.navigate(['/cards', card.id]);
  }

  onToggleTask(task: Task): void {
    // TODO: Implement task toggle functionality
    console.log('Toggle task:', task);
  }

  onSaveCard(cardData: Partial<Card>) {
    const newCard: Card = {
      ...cardData as Card,
      boardId: this.boardId,
      position: this.cards.length, // Simple position assignment
      title: cardData.title || ''
    };

    this.cardService.createCard(newCard).subscribe({
      next: (card: Card) => {
        this.cards.push(card);
        this.showAddCard = false;
      },
      error: (error: Error) => {
        console.error('Error creating card:', error);
        // TODO: Add proper error handling
      }
    });
  }
}

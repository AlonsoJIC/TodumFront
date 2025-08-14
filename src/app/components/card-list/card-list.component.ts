import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Card, Task } from '../../models';
import { CardService } from '../../services/card.service';
import { CardFormComponent } from '../card-form/card-form.component';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [CommonModule, CardFormComponent],
  providers: [CardService],
  template: `
    <div class="cards-container">
      <h2>Board Cards</h2>
      <div class="cards-grid">
        @for (card of cards; track card.id) {
          <div class="card" (click)="onCardClick(card)">
            <h3>{{ card.title }}</h3>
            @if (card.description) {
              <p>{{ card.description }}</p>
            }
            <div class="task-count">
              Tasks: {{ (card.tasks || []).length }}
            </div>
          </div>
        }
        <div class="card new-card" (click)="showAddCard = true">
          <h3>+ New Card</h3>
        </div>
      </div>

      @if (showAddCard) {
        <app-card-form
          (close)="showAddCard = false"
          (save)="onSaveCard($event)"
        />
      }
    </div>
  `,
  styles: [`
    .cards-container {
      padding: 20px;
      
      h2 {
        margin: 0 0 20px;
        color: #333;
      }
    }
    
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }
    
    .card {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: transform 0.2s;
      
      &:hover {
        transform: translateY(-2px);
      }
      
      h3 {
        margin: 0 0 10px;
        color: #333;
        font-size: 1.1rem;
      }
      
      p {
        margin: 0 0 10px;
        color: #666;
        font-size: 0.9rem;
      }

      .task-count {
        color: #666;
        font-size: 0.9rem;
        margin-top: auto;
      }
    }
    
    .new-card {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      border: 2px dashed #ddd;
      
      h3 {
        color: #666;
        margin: 0;
      }
      
      &:hover {
        background: #ebebeb;
      }
    }
  `]
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

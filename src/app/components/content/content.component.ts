import { Input, signal } from '@angular/core';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { CurrencyService } from '../../services/currency.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-content',
  imports: [FormsModule],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent {
  
  currencies = /* signal<any[]>([]) */['AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'CLP', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'ISK', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'RON', 'SEK', 'SGD', 'TRY', 'UAH', 'USD', 'THB', 'XDR', 'ZAR'];

  @Input() selectedOriginCurrency: any = '';
  @Input() selectedDestinyCurrency: any = ''; 

  parity: any;
  parityText: any = signal("Paridade ___/___:");

  constructor (private service: CurrencyService) {}

  private previousOriginCurrency: any;
  private previousDestinyCurrency: any;

  private originParity = signal(0);
  private destinyParity = signal(0);

  ngDoCheck() {
    if (this.selectedOriginCurrency.length === 3 && this.selectedDestinyCurrency.length === 3 && (this.selectedOriginCurrency !== this.previousOriginCurrency || this.selectedDestinyCurrency !== this.previousDestinyCurrency)) {
      if (this.selectedOriginCurrency === this.selectedDestinyCurrency) {
        this.parityText.set("Paridade " + this.selectedOriginCurrency + "/" + this.selectedDestinyCurrency + ": 1,0000");
      } else {
        this.parityText.set(`Paridade ${this.selectedOriginCurrency}/${this.selectedDestinyCurrency}: carregando`);
        forkJoin([
          this.service.getResponse(this.selectedOriginCurrency),
          this.service.getResponse(this.selectedDestinyCurrency)
        ]).subscribe({
          next: ([originData, destinyData]) => {
            
            this.originParity.set(originData.rates[0].mid);
            this.destinyParity.set(destinyData.rates[0].mid);
  
            const parityValue = (this.originParity() / this.destinyParity()).toFixed(4).replace(".", ",");
            this.parityText.set(`Paridade ${this.selectedOriginCurrency}/${this.selectedDestinyCurrency}: ${parityValue}`);
          },
          error: (err) => {
            console.error('Error fetching data:', err);
            this.parityText.set(`Paridade ${this.selectedOriginCurrency}/${this.selectedDestinyCurrency}: erro`);
          }
        });
      }
    }
    if (this.selectedOriginCurrency !== this.previousOriginCurrency) {
      this.previousOriginCurrency = this.selectedOriginCurrency;
    }
    if (this.selectedDestinyCurrency !== this.previousDestinyCurrency) {
      this.previousDestinyCurrency = this.selectedDestinyCurrency;
    }
  }
}

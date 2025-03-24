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
  
  currenciesA: string[] = [];
  currenciesB: string[] = [];
  
  originCurrencies = signal<any[]>([]);
  destinyCurrencies = signal<any[]>([]);

  @Input() selectedOriginCurrency: any = '';
  @Input() selectedDestinyCurrency: any = ''; 

  parity: any;
  parityText: any = signal("Paridade ___/___:");

  effectiveDateText: any = signal("");

  constructor (private service: CurrencyService) {}

  private previousOriginCurrency: any;
  private previousDestinyCurrency: any;

  private originParity = signal(0);
  private destinyParity = signal(0);

  ngOnInit() {
    this.service.getCurrencies().subscribe({
      next: (data) => {
        this.currenciesA = data.currenciesA;
        this.currenciesB = data.currenciesB;
      },
      error: (err) => {
        console.error("Error fetching currencies", err);
      }
    });
  }

  ngDoCheck() {
    this.originCurrencies.set(this.currenciesA.concat(this.currenciesB).filter(currency => currency !== this.selectedDestinyCurrency).sort());
    this.destinyCurrencies.set(this.currenciesA.concat(this.currenciesB).filter(currency => currency !== this.selectedOriginCurrency).sort());
    if (this.selectedOriginCurrency.length === 3 && this.selectedDestinyCurrency.length === 3 && (this.selectedOriginCurrency !== this.previousOriginCurrency || this.selectedDestinyCurrency !== this.previousDestinyCurrency)) {
      this.parityText.set(`Paridade ${this.selectedOriginCurrency}/${this.selectedDestinyCurrency}: carregando...`);
      this.effectiveDateText.set("Data da consulta: carregando...");
      forkJoin([
        this.service.getResponse(this.currenciesA.includes(this.selectedOriginCurrency) ? "a" : "b", this.selectedOriginCurrency),
        this.service.getResponse(this.currenciesA.includes(this.selectedDestinyCurrency) ? "a" : "b", this.selectedDestinyCurrency)
      ]).subscribe({
        next: ([originData, destinyData]) => {
          if (originData.rates[0].effectiveDate === destinyData.rates[0].effectiveDate) {
            this.processOriginAndDestinyData(originData, destinyData, originData.rates[0].effectiveDate);
          } else {
            const oldestDate = new Date(originData.rates[0].effectiveDate) < new Date(destinyData.rates[0].effectiveDate) ? originData.rates[0].effectiveDate : destinyData.rates[0].effectiveDate;
            forkJoin([
              this.service.getDatedResponse(this.currenciesA.includes(this.selectedOriginCurrency) ? "a" : "b", this.selectedOriginCurrency, oldestDate),
              this.service.getDatedResponse(this.currenciesA.includes(this.selectedDestinyCurrency) ? "a" : "b", this.selectedDestinyCurrency, oldestDate)
            ]).subscribe({
              next: ([newOriginData, newDestinyData]) => {
                this.processOriginAndDestinyData(newOriginData, newDestinyData, oldestDate);
              }, error: (err) => {
                console.error('Error fetching data:', err);
                this.parityText.set(`Paridade ${this.selectedOriginCurrency}/${this.selectedDestinyCurrency}: Erro ao tentar carregar a paridade.`);
              }
            });
            this.effectiveDateText.set("");
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
          this.parityText.set(`Paridade ${this.selectedOriginCurrency}/${this.selectedDestinyCurrency}: Erro ao tentar carregar a paridade.`);
        }
      });
    }
    if (this.selectedOriginCurrency !== this.previousOriginCurrency) {
      this.previousOriginCurrency = this.selectedOriginCurrency;
    }
    if (this.selectedDestinyCurrency !== this.previousDestinyCurrency) {
      this.previousDestinyCurrency = this.selectedDestinyCurrency;
    }
  }

  processOriginAndDestinyData(originData: any, destinyData: any, oldestDate: string) {
    this.originParity.set(originData.rates[0].mid);
    this.destinyParity.set(destinyData.rates[0].mid);

    const parityValue = (this.originParity() / this.destinyParity()).toFixed(4).replace(".", ",");
    this.parityText.set(`Paridade ${this.selectedOriginCurrency}/${this.selectedDestinyCurrency}: ${parityValue}`);

    this.effectiveDateText.set(`Data da consulta: ${this.convertDateFormat(oldestDate)}`);
  }

  convertDateFormat(dateStr: string): string {
    const date = new Date(dateStr);
  
    const day = String(date.getDate() + 1).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
  
    return `${day}/${month}/${year}`;
  }
}

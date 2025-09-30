import { Input, signal } from '@angular/core';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { CurrencyService } from '../../services/currency.service';
import { forkJoin } from 'rxjs';
import { CurrencySelector } from '../currency-selector/currency-selector';

@Component({
    selector: 'app-content',
    imports: [CurrencySelector, FormsModule],
    templateUrl: './content.component.html',
    styleUrl: './content.component.scss'
})
export class ContentComponent {

    @Input() languageSelected: any;
    
    currenciesA: string[] = [];
    currenciesB: string[] = [];
    
    originCurrencies = signal<any[]>([]);
    destinyCurrencies = signal<any[]>([]);

    @Input() selectedOriginCurrency: any = '';
    @Input() selectedDestinyCurrency: any = '';

    isSwitchButtonHovered: any = signal(false);

    parity: any = signal(null);
    parityTextFirstPart: any = signal("");
    parityTextSecondPart: any = signal("");

    effectiveDate: any = signal(null);
    effectiveDateTextFirstPart: any = signal("");
    effectiveDateTextSecondPart: any = signal("");

    sourceTextFirstPart = signal("");
    sourceTextSecondPart = signal("");

    constructor (private service: CurrencyService) {}

    private previousOriginCurrency: any;
    private previousDestinyCurrency: any;

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
        this.parityTextFirstPart.set(this.languageSelected() === `br` ? `Paridade ${this.selectedOriginCurrency.length === 3 ? this.selectedOriginCurrency : `___`}/${this.selectedDestinyCurrency.length === 3 ? this.selectedDestinyCurrency : `___`}: ` : `${this.selectedOriginCurrency.length === 3 ? this.selectedOriginCurrency : `___`}/${this.selectedDestinyCurrency.length === 3 ? this.selectedDestinyCurrency : `___`} exchange rate: `);
        this.parityTextSecondPart.set(this.parity() === null ? "" : (this.languageSelected() === `br` ? this.parity().replace(".", ",") : this.parity()));
        
        this.effectiveDateTextFirstPart.set(this.languageSelected() === `br` ? `Data da consulta: ` : `Consultation date: `);
        this.effectiveDateTextSecondPart.set(this.effectiveDate() === null ? "" : this.convertDateFormat(this.effectiveDate()));
        
        this.originCurrencies.set(this.currenciesA.concat(this.currenciesB).filter(currency => currency !== this.selectedDestinyCurrency).sort());
        this.destinyCurrencies.set(this.currenciesA.concat(this.currenciesB).filter(currency => currency !== this.selectedOriginCurrency).sort());

        this.sourceTextFirstPart.set(this.languageSelected() === `br` ? `Fonte:` : `Source:`);
        this.sourceTextSecondPart.set(this.languageSelected() === `br` ? `Banco Nacional da Polônia` : `National Bank of Poland`);
        
        if (this.selectedOriginCurrency.length === 3 && this.selectedDestinyCurrency.length === 3 && (this.selectedOriginCurrency !== this.previousOriginCurrency || this.selectedDestinyCurrency !== this.previousDestinyCurrency)) {
        this.parityTextSecondPart.set(this.languageSelected() === `br` ? `carregando...` : `loading...`);
        this.effectiveDateTextSecondPart.set(this.languageSelected() === `br` ? `carregando...` : `loading...`);
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
                    this.parityTextSecondPart.set(this.languageSelected() === `br` ? `Erro inesperado.` : `Unexpected error.`);
                    this.effectiveDateTextSecondPart.set(this.languageSelected() === `br` ? `Erro inesperado.` : `Unexpected error.`);
                }
                });
                /* this.effectiveDateTextSecondPart.set(""); */
            }
            },
            error: (err) => {
            console.error('Error fetching data:', err);
            this.parityTextSecondPart.set(this.languageSelected() === `br` ? `Erro inesperado.` : `Unexpected error.`);
            this.effectiveDateTextSecondPart.set(this.languageSelected() === `br` ? `Erro inesperado.` : `Unexpected error.`);
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
        const parityValue = (originData.rates[0].mid / destinyData.rates[0].mid).toFixed(4);
        this.parity.set(parityValue);

        this.effectiveDate.set(this.getDateObject(oldestDate));
    }

    convertDateFormat(effectiveDate: any): string {
        return this.languageSelected() === `br` ? `${effectiveDate.day}/${effectiveDate.month}/${effectiveDate.year}` : `${effectiveDate.month}/${effectiveDate.day}/${effectiveDate.year}`;
    }

    getDateObject(dateStr: string): any {
        const date = new Date(dateStr);

        return new Object ({
        day: String(date.getDate() + 1).padStart(2, '0'),
        month: String(date.getMonth() + 1).padStart(2, '0'),
        year: date.getFullYear()
        })
    }

    enterSwitchButton() {
        this.isSwitchButtonHovered.set(true);
    }

    leaveSwitchButton() {
        this.isSwitchButtonHovered.set(false);
    }

    switchCurrencies() {
        const a = this.selectedOriginCurrency;
        const b = this.selectedDestinyCurrency;

        this.selectedOriginCurrency = b;
        this.selectedDestinyCurrency = a;
    }
}

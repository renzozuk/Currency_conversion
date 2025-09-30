import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-currency-selector',
    imports: [FormsModule],
    templateUrl: './currency-selector.html'
})
export class CurrencySelector {
    @Input() currencies: string[] = [];
    @Input() selectedCurrency: string = '';
    @Output() selectedCurrencyChange = new EventEmitter<string>();
}

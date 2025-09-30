import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-header',
    imports: [],
    templateUrl: './header.component.html'
})
export class HeaderComponent {
    @Input() languageSelected: any;
}

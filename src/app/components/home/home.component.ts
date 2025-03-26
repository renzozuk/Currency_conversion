import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { ContentComponent } from '../content/content.component';
import { signal } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  imports: [ContentComponent, FooterComponent, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  languageSelected = signal('us');

  constructor(private titleService: Title) {}

  changeLanguage() {
    if (this.languageSelected() === 'br') {
      this.languageSelected.set('us');
    } else if (this.languageSelected() === 'us') {
      this.languageSelected.set('br');
    }
  }

  ngDoCheck() {
    this.titleService.setTitle(this.languageSelected() === `br` ? `Conversor de Moedas` : `Currency Conversion`)
  }
}

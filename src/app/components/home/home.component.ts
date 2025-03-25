import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { ContentComponent } from '../content/content.component';
import { signal } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [ContentComponent, FooterComponent, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  languageSelected = signal('us');

  changeLanguage() {
    if (this.languageSelected() === 'br') {
      this.languageSelected.set('us');
    } else if (this.languageSelected() === 'us') {
      this.languageSelected.set('br');
    }
  }
}

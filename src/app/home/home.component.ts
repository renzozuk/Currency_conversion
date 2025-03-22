import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { ContentComponent } from '../content/content.component';

@Component({
  selector: 'app-home',
  imports: [ContentComponent, FooterComponent, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}

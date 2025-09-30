import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { ContentComponent } from '../content/content.component';
import { computed, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NetworkService } from '../../services/network.service';

@Component({
    selector: 'app-home',
    imports: [ContentComponent, FooterComponent, HeaderComponent],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {
    languageSelected = signal<string>('en');

    flagUrls: Record<string, string> = {
        br: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Flag_of_Brazil.svg',
        en: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg',
    };

    flagUrl = computed(() => this.flagUrls[this.languageSelected()]);

    getFlagUrl(flagUrl: string): string {
        return this.flagUrls[flagUrl];
    }

    isLanguageSelectorHovered = signal(false);

    constructor(private titleService: Title, private service: NetworkService) {}

    changeLanguage(language: string) {
        this.languageSelected.set(language);
    }

    ngOnInit() {
        this.setUserLanguageByLocation();
    }

    ngDoCheck() {
        this.titleService.setTitle(this.languageSelected() === `br` ? `Conversor de Moedas` : `Currency Conversion`)
    }

    enterLanguageSelector() {
        this.isLanguageSelectorHovered.set(true);
    }

    leaveLanguageSelector() {
        this.isLanguageSelectorHovered.set(false);
    }

    async setUserLanguageByLocation() {
        try {
        const ip = await this.service.getIPAddressWithWebRTC();
        this.service.getLacnicResponse(ip).subscribe({
            next: (data) => {
            if (data.country === 'BR') {
                this.languageSelected.set('br');
            }
            },
            error: (err) => {
            console.error('Error fetching LACNIC data:', err);
            this.languageSelected.set('en');
            }
        });
        } catch (error) {
        console.error('Error getting IP:', error);
        this.languageSelected.set('en');
        }
    }
}

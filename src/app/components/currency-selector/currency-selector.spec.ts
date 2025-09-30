import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencySelector } from './currency-selector';

describe('CurrencySelector', () => {
  let component: CurrencySelector;
  let fixture: ComponentFixture<CurrencySelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrencySelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrencySelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

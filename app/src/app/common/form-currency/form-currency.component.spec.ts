import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCurrencyComponent } from './form-currency.component';

describe('FormCurrencyComponent', () => {
  let component: FormCurrencyComponent;
  let fixture: ComponentFixture<FormCurrencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormCurrencyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormCurrencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

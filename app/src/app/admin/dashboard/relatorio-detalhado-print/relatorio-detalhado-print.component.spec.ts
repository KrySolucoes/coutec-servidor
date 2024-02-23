import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatorioDetalhadoPrintComponent } from './relatorio-detalhado-print.component';

describe('RelatorioDetalhadoPrintComponent', () => {
  let component: RelatorioDetalhadoPrintComponent;
  let fixture: ComponentFixture<RelatorioDetalhadoPrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelatorioDetalhadoPrintComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RelatorioDetalhadoPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

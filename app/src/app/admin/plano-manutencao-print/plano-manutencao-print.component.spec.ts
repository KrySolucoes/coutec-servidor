import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanoManutencaoPrintComponent } from './plano-manutencao-print.component';

describe('PlanoManutencaoPrintComponent', () => {
  let component: PlanoManutencaoPrintComponent;
  let fixture: ComponentFixture<PlanoManutencaoPrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanoManutencaoPrintComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanoManutencaoPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManutencaoDetalhadaPrintComponent } from './manutencao-detalhada-print.component';

describe('ManutencaoDetalhadaPrintComponent', () => {
  let component: ManutencaoDetalhadaPrintComponent;
  let fixture: ComponentFixture<ManutencaoDetalhadaPrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManutencaoDetalhadaPrintComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManutencaoDetalhadaPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardManutencaoComponent } from './dashboard-manutencao.component';

describe('DashboardManutencaoComponent', () => {
  let component: DashboardManutencaoComponent;
  let fixture: ComponentFixture<DashboardManutencaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardManutencaoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardManutencaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

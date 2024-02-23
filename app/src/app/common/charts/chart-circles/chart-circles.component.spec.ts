import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartCirclesComponent } from './chart-circles.component';

describe('ChartCirclesComponent', () => {
  let component: ChartCirclesComponent;
  let fixture: ComponentFixture<ChartCirclesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChartCirclesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartCirclesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

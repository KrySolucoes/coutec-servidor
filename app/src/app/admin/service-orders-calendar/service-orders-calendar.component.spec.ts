import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceOrdersCalendarComponent } from './service-orders-calendar.component';

describe('ServiceOrdersCalendarComponent', () => {
  let component: ServiceOrdersCalendarComponent;
  let fixture: ComponentFixture<ServiceOrdersCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceOrdersCalendarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceOrdersCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

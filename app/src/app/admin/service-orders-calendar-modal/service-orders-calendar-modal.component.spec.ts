import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceOrdersCalendarModalComponent } from './service-orders-calendar-modal.component';

describe('ServiceOrdersCalendarModalComponent', () => {
  let component: ServiceOrdersCalendarModalComponent;
  let fixture: ComponentFixture<ServiceOrdersCalendarModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceOrdersCalendarModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceOrdersCalendarModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

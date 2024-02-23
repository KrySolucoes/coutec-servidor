import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceOrderPrintComponent } from './service-order-print.component';

describe('ServiceOrderPrintComponent', () => {
  let component: ServiceOrderPrintComponent;
  let fixture: ComponentFixture<ServiceOrderPrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceOrderPrintComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceOrderPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceOrderWPrintComponent } from './service-order-w-print.component';

describe('ServiceOrderWPrintComponent', () => {
  let component: ServiceOrderWPrintComponent;
  let fixture: ComponentFixture<ServiceOrderWPrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceOrderWPrintComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceOrderWPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

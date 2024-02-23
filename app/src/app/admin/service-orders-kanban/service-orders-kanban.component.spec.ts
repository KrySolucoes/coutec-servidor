import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceOrdersKanbanComponent } from './service-orders-kanban.component';

describe('ServiceOrdersKanbanComponent', () => {
  let component: ServiceOrdersKanbanComponent;
  let fixture: ComponentFixture<ServiceOrdersKanbanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceOrdersKanbanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceOrdersKanbanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

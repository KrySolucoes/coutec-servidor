import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoDefeitoModalComponent } from './tipo-defeito-modal.component';

describe('TipoDefeitoModalComponent', () => {
  let component: TipoDefeitoModalComponent;
  let fixture: ComponentFixture<TipoDefeitoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TipoDefeitoModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TipoDefeitoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

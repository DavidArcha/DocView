import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomModalContainerComponent } from './custom-modal-container.component';

describe('CustomModalContainerComponent', () => {
  let component: CustomModalContainerComponent;
  let fixture: ComponentFixture<CustomModalContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomModalContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomModalContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomModalPopupComponent } from './custom-modal-popup.component';

describe('CustomModalPopupComponent', () => {
  let component: CustomModalPopupComponent;
  let fixture: ComponentFixture<CustomModalPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomModalPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomModalPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

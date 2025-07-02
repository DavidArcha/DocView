import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomFooterComponentComponent } from './custom-footer-component.component';

describe('CustomFooterComponentComponent', () => {
  let component: CustomFooterComponentComponent;
  let fixture: ComponentFixture<CustomFooterComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomFooterComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomFooterComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

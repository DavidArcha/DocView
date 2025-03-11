import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestingDropdownComponent } from './testing-dropdown.component';

describe('TestingDropdownComponent', () => {
  let component: TestingDropdownComponent;
  let fixture: ComponentFixture<TestingDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestingDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestingDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

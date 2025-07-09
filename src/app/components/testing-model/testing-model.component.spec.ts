import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestingModelComponent } from './testing-model.component';

describe('TestingModelComponent', () => {
  let component: TestingModelComponent;
  let fixture: ComponentFixture<TestingModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestingModelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestingModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

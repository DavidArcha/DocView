import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestingLevelComponent } from './testing-level.component';

describe('TestingLevelComponent', () => {
  let component: TestingLevelComponent;
  let fixture: ComponentFixture<TestingLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestingLevelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestingLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

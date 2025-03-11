import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestingAccordionComponent } from './testing-accordion.component';

describe('TestingAccordionComponent', () => {
  let component: TestingAccordionComponent;
  let fixture: ComponentFixture<TestingAccordionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestingAccordionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestingAccordionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

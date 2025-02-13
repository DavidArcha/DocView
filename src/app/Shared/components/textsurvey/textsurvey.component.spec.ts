import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextsurveyComponent } from './textsurvey.component';

describe('TextsurveyComponent', () => {
  let component: TextsurveyComponent;
  let fixture: ComponentFixture<TextsurveyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TextsurveyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextsurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridGalleryComponent } from './grid-gallery.component';

describe('GridGalleryComponent', () => {
  let component: GridGalleryComponent;
  let fixture: ComponentFixture<GridGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GridGalleryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

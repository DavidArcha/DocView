import { TestBed } from '@angular/core/testing';

import { CustomModalService } from './custom-modal.service';

describe('CustomModalService', () => {
  let service: CustomModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

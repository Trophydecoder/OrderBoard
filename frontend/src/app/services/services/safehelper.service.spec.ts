import { TestBed } from '@angular/core/testing';

import { SafehelperService } from './safehelper.service';

describe('SafehelperService', () => {
  let service: SafehelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SafehelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

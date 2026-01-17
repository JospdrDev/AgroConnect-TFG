import { TestBed } from '@angular/core/testing';

import { Finca } from './finca';

describe('Finca', () => {
  let service: Finca;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Finca);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { BoletinService } from './boletin.service';

describe('ServicesService', () => {
  let service: BoletinService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoletinService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

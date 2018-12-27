import { TestBed, inject } from '@angular/core/testing';

import { Socket } from './socket.service';

describe('Socket', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Socket]
    });
  });

  it('should be created', inject([Socket], (service: Socket) => {
    expect(service).toBeTruthy();
  }));
});

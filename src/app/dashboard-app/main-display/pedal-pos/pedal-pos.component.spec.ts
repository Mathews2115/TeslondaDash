import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PedalPosComponent } from './pedal-pos.component';

describe('PedalPosComponent', () => {
  let component: PedalPosComponent;
  let fixture: ComponentFixture<PedalPosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PedalPosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PedalPosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisconnectedComponent } from './disconnected.component';

describe('DisconnectedComponent', () => {
  let component: DisconnectedComponent;
  let fixture: ComponentFixture<DisconnectedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisconnectedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisconnectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

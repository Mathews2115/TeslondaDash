import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InitScreenComponent } from './init-screen.component';

describe('InitScreenComponent', () => {
  let component: InitScreenComponent;
  let fixture: ComponentFixture<InitScreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InitScreenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InitScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

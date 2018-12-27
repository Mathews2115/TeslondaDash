import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemperaturesComponent } from './temperatures.component';

describe('TemperaturesComponent', () => {
  let component: TemperaturesComponent;
  let fixture: ComponentFixture<TemperaturesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemperaturesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemperaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PowerMeterComponent } from './power-meter.component';

describe('PowerMeterComponent', () => {
  let component: PowerMeterComponent;
  let fixture: ComponentFixture<PowerMeterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PowerMeterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PowerMeterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

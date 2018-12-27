import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VoltagesComponent } from './voltages.component';

describe('VoltagesComponent', () => {
  let component: VoltagesComponent;
  let fixture: ComponentFixture<VoltagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VoltagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoltagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

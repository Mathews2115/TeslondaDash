import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleReadOutComponent } from './simple-read-out.component';

describe('SimpleReadOutComponent', () => {
  let component: SimpleReadOutComponent;
  let fixture: ComponentFixture<SimpleReadOutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimpleReadOutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleReadOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

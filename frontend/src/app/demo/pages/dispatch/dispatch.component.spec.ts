import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DispatchComponent } from './dispatch.component';

describe('DispatchComponent', () => {
  let component: DispatchComponent;
  let fixture: ComponentFixture<DispatchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DispatchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DispatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

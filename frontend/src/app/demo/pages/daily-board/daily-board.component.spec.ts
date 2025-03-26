import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyBoardComponent } from './daily-board.component';

describe('DailyBoardComponent', () => {
  let component: DailyBoardComponent;
  let fixture: ComponentFixture<DailyBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyBoardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLiquidityComponent } from './add-liquidity.component';

describe('AddLiquidityComponent', () => {
  let component: AddLiquidityComponent;
  let fixture: ComponentFixture<AddLiquidityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddLiquidityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddLiquidityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveLiquidityDialogComponent } from './remove-liquidity-dialog.component';

describe('BurnDialogComponent', () => {
  let component: RemoveLiquidityDialogComponent;
  let fixture: ComponentFixture<RemoveLiquidityDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RemoveLiquidityDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoveLiquidityDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

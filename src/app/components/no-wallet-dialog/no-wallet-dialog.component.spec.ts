import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoWalletDialogComponent } from './no-wallet-dialog.component';

describe('NoWalletDialogComponent', () => {
  let component: NoWalletDialogComponent;
  let fixture: ComponentFixture<NoWalletDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoWalletDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoWalletDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

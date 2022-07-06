import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTokenDialogComponent } from './create-token-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: CreateTokenDialogComponent;
  let fixture: ComponentFixture<CreateTokenDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateTokenDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTokenDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

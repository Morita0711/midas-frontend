import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BurnTokensComponent } from './burn-tokens.component';

describe('BurnTokensComponent', () => {
  let component: BurnTokensComponent;
  let fixture: ComponentFixture<BurnTokensComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BurnTokensComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BurnTokensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

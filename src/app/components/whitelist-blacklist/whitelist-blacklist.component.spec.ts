import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhitelistBlacklistComponent } from './whitelist-blacklist.component';

describe('WhitelistBlacklistComponent', () => {
  let component: WhitelistBlacklistComponent;
  let fixture: ComponentFixture<WhitelistBlacklistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhitelistBlacklistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhitelistBlacklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

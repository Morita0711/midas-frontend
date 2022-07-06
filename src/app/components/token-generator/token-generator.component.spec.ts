import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenGeneratorComponent } from './token-generator.component';

describe('TokenGeneratorComponent', () => {
  let component: TokenGeneratorComponent;
  let fixture: ComponentFixture<TokenGeneratorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TokenGeneratorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

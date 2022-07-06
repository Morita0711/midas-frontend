import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceTokenPaymentSelectorComponent } from './service-token-payment-selector.component';

describe('ServiceTokenPaymentSelectorComponent', () => {
  let component: ServiceTokenPaymentSelectorComponent;
  let fixture: ComponentFixture<ServiceTokenPaymentSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceTokenPaymentSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceTokenPaymentSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

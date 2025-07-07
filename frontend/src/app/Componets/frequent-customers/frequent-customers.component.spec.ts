import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrequentCustomersComponent } from './frequent-customers.component';

describe('FrequentCustomersComponent', () => {
  let component: FrequentCustomersComponent;
  let fixture: ComponentFixture<FrequentCustomersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrequentCustomersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrequentCustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

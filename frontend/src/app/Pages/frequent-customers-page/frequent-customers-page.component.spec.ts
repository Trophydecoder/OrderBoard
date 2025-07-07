import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrequentCustomersPageComponent } from './frequent-customers-page.component';

describe('FrequentCustomersPageComponent', () => {
  let component: FrequentCustomersPageComponent;
  let fixture: ComponentFixture<FrequentCustomersPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrequentCustomersPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrequentCustomersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

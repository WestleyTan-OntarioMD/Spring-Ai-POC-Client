import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HqPortalComponent } from './hq-portal.component';

describe('HqPortalComponent', () => {
  let component: HqPortalComponent;
  let fixture: ComponentFixture<HqPortalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HqPortalComponent]
    });
    fixture = TestBed.createComponent(HqPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

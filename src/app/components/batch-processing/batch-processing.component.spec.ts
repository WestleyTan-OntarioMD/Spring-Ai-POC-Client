import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchProcessingComponent } from './batch-processing.component';

describe('BatchProcessingComponent', () => {
  let component: BatchProcessingComponent;
  let fixture: ComponentFixture<BatchProcessingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BatchProcessingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BatchProcessingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

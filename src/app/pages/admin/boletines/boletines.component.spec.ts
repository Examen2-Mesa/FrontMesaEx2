import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoletinesComponent } from './boletines.component';

describe('BoletinesComponent', () => {
  let component: BoletinesComponent;
  let fixture: ComponentFixture<BoletinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoletinesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoletinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

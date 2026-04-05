import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FincaListComponent } from './finca-list';

describe('FincaListComponent', () => {
  let component: FincaListComponent;
  let fixture: ComponentFixture<FincaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FincaListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FincaListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

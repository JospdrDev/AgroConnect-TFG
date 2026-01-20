import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FincaMap } from './finca-map';

describe('FincaMap', () => {
  let component: FincaMap;
  let fixture: ComponentFixture<FincaMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FincaMap]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FincaMap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

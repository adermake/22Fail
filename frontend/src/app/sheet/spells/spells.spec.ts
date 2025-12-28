import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Spells } from './spells';

describe('Spells', () => {
  let component: Spells;
  let fixture: ComponentFixture<Spells>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Spells]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Spells);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

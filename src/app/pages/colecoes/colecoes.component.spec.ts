import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColecoesComponent } from './colecoes.component';

describe('ColecoesComponent', () => {
  let component: ColecoesComponent;
  let fixture: ComponentFixture<ColecoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColecoesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ColecoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

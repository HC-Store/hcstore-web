import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagamentoPendenteComponent } from './pagamento-pendente.component';

describe('PagamentoPendenteComponent', () => {
  let component: PagamentoPendenteComponent;
  let fixture: ComponentFixture<PagamentoPendenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagamentoPendenteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PagamentoPendenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

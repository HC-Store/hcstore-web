import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagamentoSucessoComponent } from './pagamento-sucesso.component';

describe('PagamentoSucessoComponent', () => {
  let component: PagamentoSucessoComponent;
  let fixture: ComponentFixture<PagamentoSucessoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagamentoSucessoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PagamentoSucessoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

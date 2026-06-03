import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagamentoErroComponent } from './pagamento-erro.component';

describe('PagamentoErroComponent', () => {
  let component: PagamentoErroComponent;
  let fixture: ComponentFixture<PagamentoErroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagamentoErroComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PagamentoErroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

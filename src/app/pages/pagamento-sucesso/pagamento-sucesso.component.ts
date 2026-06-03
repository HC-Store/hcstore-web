import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pagamento-sucesso',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './pagamento-sucesso.component.html'
})
export class PagamentoSucessoComponent implements OnInit {

  ngOnInit(): void {

    localStorage.removeItem('cart');
    localStorage.removeItem('checkoutData');
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { ModalsComponent } from '../../components/modals/modals.component';

type ModalTipo = 'login' | 'register' | 'cart' | null;

@Component({
  selector: 'app-pagamento',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    ModalsComponent
  ],
  templateUrl: './pagamento.component.html',
  styleUrls: ['./pagamento.component.css']
})
export class PagamentoComponent implements OnInit {

  modalAberto: ModalTipo = null;

  carregando = false;
  sucesso = false;
  erro = '';

  metodoPagamento: string = 'cartao';

  itensCarrinho: any[] = [];

  cardData = {
    numero: '',
    validade: '',
    cvv: '',
    nome: ''
  };

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {

    this.itensCarrinho = JSON.parse(
      localStorage.getItem('checkoutData') || '[]'
    );
  }

  selecionarPagamento(tipo: string): void {

    this.metodoPagamento = tipo;
  }

  get subtotal(): number {

    return this.itensCarrinho.reduce(

      (total, item) => {

        return total +

        (
          (item.produto?.preco || item.price || 0)
          *
          (item.quantidade || item.qty || 1)
        );
      },

      0
    );
  }

  formatPrice(value: number): string {

    return 'R$' +
      value.toFixed(2).replace('.', ',');
  }

  formatarNumero(event: any): void {

    let value =
      event.target.value.replace(/\D/g, '');

    value =
      value.replace(/(\d{4})(?=\d)/g, '$1 ');

    this.cardData.numero = value;
  }

  formatarValidade(event: any): void {

    let value =
      event.target.value.replace(/\D/g, '');

    if (value.length > 2) {

      value =
        value.slice(0, 2) +
        '/' +
        value.slice(2, 4);
    }

    this.cardData.validade = value;
  }

  formatarCvv(event: any): void {

    this.cardData.cvv =
      event.target.value.replace(/\D/g, '');
  }

  formatarNome(event: any): void {

    let value =
      event.target.value.replace(
        /[^a-zA-ZÀ-ÿ\s]/g,
        ''
      );

    this.cardData.nome =
      value.toUpperCase();
  }

  concluirCompra(): void {

    if (this.metodoPagamento === 'cartao') {

      const {
        numero,
        validade,
        cvv,
        nome
      } = this.cardData;

      if (
        !numero.trim() ||
        !validade.trim() ||
        !cvv.trim() ||
        !nome.trim()
      ) {

        this.erro =
          'Preencha todos os dados do cartão.';

        return;
      }
    }

    this.erro = '';

    this.carregando = true;

    setTimeout(() => {

      this.carregando = false;

      this.sucesso = true;

      localStorage.removeItem(
        'checkoutData'
      );

      localStorage.removeItem(
        'cart'
      );

      setTimeout(() => {

        this.router.navigate(['/home']);

      }, 3000);

    }, 2000);
  }

  abrirLogin(): void {

    this.modalAberto = 'login';
  }

  abrirCart(): void {

    this.modalAberto = 'cart';
  }

  fecharModal(): void {

    this.modalAberto = null;
  }
}
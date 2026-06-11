import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { ModalsComponent } from '../../components/modals/modals.component';
import { ApiService } from '../../services/api.service';

type ModalTipo =
  | 'login'
  | 'register'
  | 'cart'
  | 'profileWelcome'
  | 'profileEdit'
  | null;

@Component({
  selector: 'app-pagamento',
  standalone: true,
  imports: [
    CommonModule,
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
  erro = '';

  itensCarrinho: any[] = [];
  resumoCheckout = {
    subtotal: 0,
    frete: 0,
    desconto: 0,
    total: 0
  };

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const checkoutData = JSON.parse(localStorage.getItem('checkoutData') || '[]');

    if (Array.isArray(checkoutData)) {
      this.itensCarrinho = checkoutData;
      this.resumoCheckout = {
        subtotal: this.calcularSubtotalItens(checkoutData),
        frete: this.calcularSubtotalItens(checkoutData) >= 200 ? 0 : 20,
        desconto: 0,
        total: this.calcularSubtotalItens(checkoutData) + (this.calcularSubtotalItens(checkoutData) >= 200 ? 0 : 20)
      };
    } else {
      this.itensCarrinho = Array.isArray(checkoutData.itens) ? checkoutData.itens : [];
      this.resumoCheckout = {
        subtotal: Number(checkoutData.subtotal || 0),
        frete: Number(checkoutData.frete || 0),
        desconto: Number(checkoutData.desconto || 0),
        total: Number(checkoutData.total || 0)
      };
    }

    if (this.itensCarrinho.length === 0) {
      this.erro = 'Nenhum item encontrado.';
    }
  }

  get subtotal(): number {
    return this.resumoCheckout.subtotal || this.calcularSubtotalItens(this.itensCarrinho);
  }

  get frete(): number {
    return this.resumoCheckout.frete;
  }

  get total(): number {
    return this.resumoCheckout.total || (this.subtotal + this.frete - this.resumoCheckout.desconto);
  }

  formatPrice(value: number): string {
    return 'R$ ' + value.toFixed(2).replace('.', ',');
  }

  private calcularSubtotalItens(itens: any[]): number {
    return itens.reduce((total, item) => {
      return total + Number(item.produto?.preco || 0) * Number(item.quantidade || 1);
    }, 0);
  }

  pagarComPagBank(): void {

    if (this.itensCarrinho.length === 0) {
      this.erro = 'Carrinho vazio.';
      return;
    }

    this.carregando = true;
    this.erro = '';

    const body = {
      items: this.itensCarrinho.map((item) => ({
        id: item.produto?.id,
        nome: item.produto?.nome,
        preco: Number(item.produto?.preco),
        quantidade: Number(item.quantidade)
      })),
      subtotal: this.subtotal,
      frete: this.frete,
      desconto: this.resumoCheckout.desconto,
      total: this.total
    };

    this.api.criarCheckoutPagBank(body).subscribe({

      next: (res: any) => {

        this.carregando = false;

        if (!res.paymentUrl) {
          this.erro = 'PagBank não retornou URL.';
          return;
        }

        window.location.href = res.paymentUrl;
      },

      error: (err) => {

        console.log(err);

        this.carregando = false;

        this.erro =
          err.error?.error ||
          'Erro ao iniciar pagamento.';
      }
    });
  }

  abrirLogin(): void {

    const usuario = localStorage.getItem('usuarioLogado');
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (usuario === 'true' || token || user) {
      this.modalAberto = 'profileWelcome';
    } else {
      this.modalAberto = 'login';
    }
  }

  abrirCart(): void {
    this.modalAberto = 'cart';
  }

  fecharModal(): void {
    this.modalAberto = null;
  }
}

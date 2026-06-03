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

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itensCarrinho = JSON.parse(
      localStorage.getItem('checkoutData') || '[]'
    );

    if (this.itensCarrinho.length === 0) {
      this.erro = 'Nenhum item encontrado.';
    }
  }

  get subtotal(): number {
    return this.itensCarrinho.reduce((total, item) => {
      return (
        total +
        (item.produto?.preco || 0) *
        (item.quantidade || 1)
      );
    }, 0);
  }

  get frete(): number {
    return this.subtotal >= 200 ? 0 : 20;
  }

  get total(): number {
    return this.subtotal + this.frete;
  }

  formatPrice(value: number): string {
    return 'R$ ' + value.toFixed(2).replace('.', ',');
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
      }))
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
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { ModalsComponent } from '../../components/modals/modals.component';
import { ApiService } from '../../services/api.service';

type ModalTipo = 'login' | 'register' | 'cart' | 'profileWelcome' | 'profileEdit' | null;

@Component({
  selector: 'app-pagamento',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent, ModalsComponent],
  templateUrl: './pagamento.component.html',
  styleUrls: ['./pagamento.component.css']
})
export class PagamentoComponent implements OnInit {

  modalAberto: ModalTipo = null;
  carregando = false;
  erro = '';

  itensCarrinho: any[] = [];
<<<<<<< Updated upstream
  resumoCheckout = {
    subtotal: 0,
    frete: 0,
    desconto: 0,
    total: 0
  };
=======
  checkoutData: any = null;
>>>>>>> Stashed changes

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
<<<<<<< Updated upstream
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
=======
    const salvo = localStorage.getItem('checkoutData');
>>>>>>> Stashed changes

    if (!salvo) {
      this.erro = 'Nenhum pedido encontrado. Volte ao carrinho.';
      return;
    }

    this.checkoutData = JSON.parse(salvo);
    this.itensCarrinho = this.checkoutData?.itens || [];
  }

  get subtotal(): number {
<<<<<<< Updated upstream
    return this.resumoCheckout.subtotal || this.calcularSubtotalItens(this.itensCarrinho);
  }

  get frete(): number {
    return this.resumoCheckout.frete;
  }

  get total(): number {
    return this.resumoCheckout.total || (this.subtotal + this.frete - this.resumoCheckout.desconto);
=======
    return Number(this.checkoutData?.valores?.subtotal || 0);
  }

  get frete(): number {
    return Number(this.checkoutData?.valores?.frete || 0);
  }

  get desconto(): number {
    return Number(this.checkoutData?.valores?.desconto || 0);
  }

  get total(): number {
    return Number(this.checkoutData?.valores?.total || 0);
>>>>>>> Stashed changes
  }

  formatPrice(value: number): string {
    return 'R$ ' + Number(value || 0).toFixed(2).replace('.', ',');
  }

  private calcularSubtotalItens(itens: any[]): number {
    return itens.reduce((total, item) => {
      return total + Number(item.produto?.preco || 0) * Number(item.quantidade || 1);
    }, 0);
  }

  pagarComPagBank(): void {
    if (!this.checkoutData?.itens?.length) {
      this.erro = 'Nenhum item encontrado para pagamento.';
      return;
    }

    this.carregando = true;
    this.erro = '';

<<<<<<< Updated upstream
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
=======
    const items = this.itensCarrinho
      .map(item => ({
        id: item.produto?.id || item.id,
        nome: item.produto?.nome || item.nome,
        preco: Number(item.produto?.preco || item.preco || 0),
        quantidade: Number(item.quantidade || item.qty || 1)
      }))
      .filter(item => item.id && item.nome && item.preco > 0 && item.quantidade > 0);

    if (items.length === 0) {
      this.carregando = false;
      this.erro = 'Itens inválidos para pagamento.';
      return;
    }

    // Adiciona frete como item se houver cobrança
    if (this.frete > 0) {
      items.push({
        id: 0,
        nome: `Frete (${this.checkoutData?.entrega?.tipoEntrega || 'SEDEX'})`,
        preco: this.frete,
        quantidade: 1
      });
    }

    const body = {
      pedidoId: this.checkoutData?.pedido?.id,
      items
>>>>>>> Stashed changes
    };

    this.api.criarCheckoutPagBank(body).subscribe({
      next: (res: any) => {
        this.carregando = false;

        if (!res.paymentUrl) {
          this.erro = 'PagBank não retornou URL de pagamento.';
          return;
        }

        window.location.href = res.paymentUrl;
      },
      error: (err) => {
        this.carregando = false;
        this.erro =
          err.error?.error ||
          err.error?.details?.error_messages?.[0]?.description ||
          'Erro ao iniciar pagamento.';
      }
    });
  }

  abrirLogin(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    this.modalAberto = (token || user) ? 'profileWelcome' : 'login';
  }

<<<<<<< Updated upstream
  abrirCart(): void {
    this.modalAberto = 'cart';
  }

  fecharModal(): void {
    this.modalAberto = null;
  }
}
=======
  abrirCart(): void { this.modalAberto = 'cart'; }
  fecharModal(): void { this.modalAberto = null; }
}
>>>>>>> Stashed changes

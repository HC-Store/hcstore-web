import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { ModalsComponent } from '../../components/modals/modals.component';
import { ApiService } from '../../services/api.service';
import { CarrinhoService } from '../../services/carrinho.service';
import { AuthService } from '../../services/auth.service';

type ModalTipo = 'login' | 'register' | 'cart' | null;

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent, ModalsComponent],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {

  produto: any = null;
  carregando = true;
  erro = '';

  mainImage: string = '';
  thumbnails: string[] = [];
  selectedSize: string = '';
  modalAberto: ModalTipo = null;
  sucesso = '';

  accordionOpen = { material: false, lavagem: false, envio: true };

  tamanhos: string[] = ['M', 'G', 'GG', 'XG'];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private carrinho: CarrinhoService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.getProdutos().subscribe({
        next: (produtos: any[]) => {
          this.produto = produtos.find(p => p.id === Number(id));
          if (this.produto) {
            this.mainImage = this.produto.imagens?.[0]?.url || this.produto.imagem || 'assets/img/sem-imagem.png';
            this.thumbnails = [this.mainImage];
          }
          this.carregando = false;
        },
        error: () => {
          this.erro = 'Erro ao carregar produto.';
          this.carregando = false;
        }
      });
    }
  }

  trocarImagem(image: string): void { this.mainImage = image; }
  selecionarTamanho(size: string): void { this.selectedSize = size; }

  toggleAccordion(section: 'material' | 'lavagem' | 'envio'): void {
    const current = this.accordionOpen[section];
    this.accordionOpen = { material: false, lavagem: false, envio: false };
    this.accordionOpen[section] = !current;
  }

  abrirLogin(): void { this.modalAberto = 'login'; }
  abrirRegister(): void { this.modalAberto = 'register'; }
  abrirCart(): void { this.modalAberto = 'cart'; }
  fecharModal(): void { this.modalAberto = null; }

  adicionarAoCarrinho(): void {
    if (!this.selectedSize) {
      alert('Selecione um tamanho.');
      return;
    }

    if (!this.auth.isLoggedIn()) {
      this.modalAberto = 'login';
      return;
    }

    this.carrinho.adicionarItem(this.produto.id, 1);
    this.sucesso = 'Produto adicionado ao carrinho!';
    setTimeout(() => { this.sucesso = ''; }, 2000);
  }
}
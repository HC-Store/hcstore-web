import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { ModalsComponent } from '../../components/modals/modals.component';

import { CarrinhoService } from '../../services/carrinho.service';
import { AuthService } from '../../services/auth.service';
import { ProdutosService } from '../../services/produtos.service';

type ModalTipo =
  | 'login'
  | 'register'
  | 'cart'
  | 'profileWelcome'
  | 'profileEdit'
  | null;

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    ModalsComponent
  ],
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

  erroCarrinho = '';

  adicionandoCarrinho = false;

  accordionOpen = {
    material: false,
    lavagem: false,
    envio: true
  };

  tamanhos: string[] = [
    'M',
    'G',
    'GG',
    'XG'
  ];

  constructor(
    private route: ActivatedRoute,
    private produtosService: ProdutosService,
    private carrinho: CarrinhoService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {

      this.produtosService.listar().subscribe({

        next: (produtos: any[]) => {

          this.produto =
            produtos.find(
              p => p.id === Number(id)
            );

          if (this.produto) {

            this.mainImage =
              this.produto.imagens?.[0]?.url ||
              this.produto.imagem ||
              'assets/img/sem-imagem.png';

            this.thumbnails = [
              this.mainImage
            ];
          } else {
            this.erro = 'Produto nao encontrado.';
          }

          this.carregando = false;
        },

        error: () => {

          this.erro =
            'Erro ao carregar produto.';

          this.carregando = false;
        }
      });
    }
  }

  trocarImagem(image: string): void {

    this.mainImage = image;
  }

  selecionarTamanho(size: string): void {

    this.selectedSize = size;
  }

  toggleAccordion(
    section: 'material' | 'lavagem' | 'envio'
  ): void {

    const current =
      this.accordionOpen[section];

    this.accordionOpen = {
      material: false,
      lavagem: false,
      envio: false
    };

    this.accordionOpen[section] = !current;
  }

  abrirLogin(): void {

    const usuario =
      localStorage.getItem('usuarioLogado');

    const token =
      localStorage.getItem('token');

    const user =
      localStorage.getItem('user');

    if (
      usuario === 'true' ||
      token ||
      user ||
      this.auth.isLoggedIn()
    ) {

      this.modalAberto =
        'profileWelcome';

    } else {

      this.modalAberto =
        'login';
    }
  }

  abrirRegister(): void {

    this.modalAberto =
      'register';
  }

  abrirCart(): void {

    this.modalAberto =
      'cart';
  }

  fecharModal(): void {

    this.modalAberto = null;
  }

  adicionarAoCarrinho(): void {
    this.sucesso = '';
    this.erroCarrinho = '';

    if (!this.produto?.id || this.adicionandoCarrinho) {
      return;
    }

    const tamanho = this.selectedSize || 'Unico';

    this.adicionandoCarrinho = true;

    this.carrinho.adicionarItem(this.produto.id, 1, tamanho, this.produto).subscribe({
      next: () => {
        this.adicionandoCarrinho = false;
        this.sucesso = 'Produto adicionado ao carrinho!';
        this.modalAberto = 'cart';
      },
      error: (err) => {
        this.adicionandoCarrinho = false;
        this.erroCarrinho =
          err?.error?.error ||
          err?.error?.message ||
          err?.message ||
          'Nao foi possivel adicionar o produto ao carrinho.';
      }
    });
  }
}

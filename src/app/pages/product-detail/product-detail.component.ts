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

  private tamanhosPadrao = ['M', 'G', 'GG', 'XG'];
  private numeracoesCalcado = ['38', '39', '40', '41', '42'];
  private tamanhoUnico = ['Tamanho unico'];

  get categoriaProduto(): string {
    const categoria = this.produto?.categoria;

    if (categoria?.nome) {
      return categoria.nome;
    }

    if (typeof categoria === 'string') {
      return categoria;
    }

    return 'PRODUTO';
  }

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

            const imagens = this.obterImagensProduto();
            this.mainImage = imagens[0];
            this.thumbnails = imagens.slice(1);

            this.tamanhos = this.obterTamanhosProduto();
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

  trocarImagem(image: string, index: number): void {

    this.thumbnails[index] = this.mainImage;
    this.mainImage = image;
  }

  private obterImagensProduto(): string[] {
    const imagensProduto = Array.isArray(this.produto?.imagens)
      ? this.produto.imagens
          .map((imagem: any) => imagem?.url || imagem)
          .filter(Boolean)
      : [];

    const imagens = [
      ...imagensProduto,
      this.produto?.imagem,
      this.produto?.imagem2,
      this.produto?.imagem3
    ].filter(Boolean);

    return imagens.length > 0
      ? [...new Set(imagens)]
      : ['assets/img/sem-imagem.png'];
  }

  selecionarTamanho(size: string): void {

    this.selectedSize = size;
  }

  private obterTamanhosProduto(): string[] {
    const tamanhosCadastrados = this.obterTamanhosCadastrados();

    if (tamanhosCadastrados.length > 0) {
      return tamanhosCadastrados;
    }

    const categoria = this.normalizarTexto(this.categoriaProduto);

    if (
      categoria.includes('tenis') ||
      categoria.includes('streetwear') ||
      categoria.includes('chinelo')
    ) {
      return this.numeracoesCalcado;
    }

    if (categoria.includes('acessor')) {
      return this.tamanhoUnico;
    }

    return this.tamanhosPadrao;
  }

  private obterTamanhosCadastrados(): string[] {
    const tamanho = this.produto?.tamanho;

    if (Array.isArray(tamanho)) {
      return tamanho.map(String);
    }

    if (typeof tamanho === 'string') {
      return tamanho.split(',').map(item => item.trim()).filter(Boolean);
    }

    const quantidadePorTamanho = this.produto?.quantidadePorTamanho;

    if (quantidadePorTamanho && typeof quantidadePorTamanho === 'object') {
      return Object.keys(quantidadePorTamanho);
    }

    if (typeof quantidadePorTamanho === 'string') {
      try {
        return Object.keys(JSON.parse(quantidadePorTamanho));
      } catch {
        return [];
      }
    }

    return [];
  }

  private normalizarTexto(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
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

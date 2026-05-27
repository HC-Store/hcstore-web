import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { ModalsComponent } from '../../components/modals/modals.component';
import { ProdutosService, Produto } from '../../services/produtos.service';

type ModalTipo =
  | 'login'
  | 'register'
  | 'cart'
  | 'profileWelcome'
  | 'profileEdit'
  | null;

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    ModalsComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  modalAberto: ModalTipo = null;

  filtroAberto = false;

  categoriaSelecionada = '';
  tamanhoSelecionado = '';
  precoSelecionado = '';

  categorias = [
    'Todos os Produtos',
    'Casual',
    'Streetwear',
    'Camisetas',
    'Bermudas & Shorts',
    'Conjuntos',
    'Calças',
    'Moletons',
    'Chinelos',
    'Tênis',
    'Acessórios'
  ];

  tamanhosPadrao = ['M', 'G', 'GG', 'XG'];
  numeracoesCalcado = ['38', '39', '40', '41', '42'];
  tamanhoUnico = ['Tamanho unico'];
  tamanhos = this.tamanhosPadrao;

  faixasPreco = [
    'R$0 - R$250',
    'R$250 - R$500',
    'R$500 - R$750',
    'R$750 +'
  ];

  produtos: Produto[] = [];
  paginaAtual = 1;
  produtosPorPagina = 6;

  constructor(private produtosService: ProdutosService) {}

  ngOnInit(): void {
    this.carregarProdutos();
  }

  get produtosFiltrados(): Produto[] {
    return this.produtos.filter((produto: any) => {
      const categoriaProduto =
        produto.categoria ||
        produto.category ||
        '';

      const tamanhosProduto: string[] =
        produto.tamanhos ||
        produto.sizes ||
        produto.tamanho ||
        [];

      const precoProduto = Number(
        produto.precoPromocional ||
        produto.preco ||
        produto.salePrice ||
        produto.price ||
        produto.regularPrice ||
        0
      );

      const categoriaOk =
        !this.categoriaSelecionada ||
        this.categoriaSelecionada === 'Todos os Produtos' ||
        categoriaProduto === this.categoriaSelecionada;

      const tamanhoOk =
        !this.tamanhoSelecionado ||
        tamanhosProduto.includes(this.tamanhoSelecionado);

      const precoOk =
        !this.precoSelecionado ||
        (this.precoSelecionado === 'R$0 - R$250' &&
          precoProduto >= 0 &&
          precoProduto <= 250) ||
        (this.precoSelecionado === 'R$250 - R$500' &&
          precoProduto > 250 &&
          precoProduto <= 500) ||
        (this.precoSelecionado === 'R$500 - R$750' &&
          precoProduto > 500 &&
          precoProduto <= 750) ||
        (this.precoSelecionado === 'R$750 +' &&
          precoProduto > 750);

      return categoriaOk && tamanhoOk && precoOk;
    });
  }

  get totalPaginas(): number {
    return Math.ceil(this.produtosFiltrados.length / this.produtosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, index) => index + 1);
  }

  get produtosPaginados(): Produto[] {
    const inicio = (this.paginaAtual - 1) * this.produtosPorPagina;
    return this.produtosFiltrados.slice(inicio, inicio + this.produtosPorPagina);
  }

  carregarProdutos(): void {
    this.produtosService.listar().subscribe({
      next: (res) => {
        this.produtos = Array.isArray(res) ? res : [];
        this.paginaAtual = 1;
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
        this.produtos = [];
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

  toggleFiltro(): void {
    this.filtroAberto = !this.filtroAberto;
  }

  fecharFiltro(): void {
    this.filtroAberto = false;
  }

  selecionarCategoria(categoria: string): void {
    this.categoriaSelecionada = categoria;
    this.tamanhos = this.obterTamanhosPorCategoria(categoria);
    this.paginaAtual = 1;

    if (
      this.tamanhoSelecionado &&
      !this.tamanhos.includes(this.tamanhoSelecionado)
    ) {
      this.tamanhoSelecionado = '';
    }
  }

  selecionarTamanho(tamanho: string): void {
    this.tamanhoSelecionado = tamanho;
    this.paginaAtual = 1;
  }

  selecionarPreco(preco: string): void {
    this.precoSelecionado = preco;
    this.paginaAtual = 1;
  }

  limparFiltros(): void {
    this.categoriaSelecionada = '';
    this.tamanhoSelecionado = '';
    this.precoSelecionado = '';
    this.tamanhos = this.tamanhosPadrao;
    this.paginaAtual = 1;
  }

  irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }

  private categoriaEhCalcado(categoria: string): boolean {
    const nome = categoria.toLowerCase();
    return nome.includes('chinelo') || nome.includes('tênis') || nome.includes('tenis');
  }

  private categoriaEhAcessorio(categoria: string): boolean {
    return categoria.toLowerCase().includes('acess');
  }

  private obterTamanhosPorCategoria(categoria: string): string[] {
    if (this.categoriaEhCalcado(categoria)) {
      return this.numeracoesCalcado;
    }

    if (this.categoriaEhAcessorio(categoria)) {
      return this.tamanhoUnico;
    }

    return this.tamanhosPadrao;
  }
}
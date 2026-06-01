import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { ModalsComponent } from '../../components/modals/modals.component';
import { Produto, ProdutoFiltros, ProdutosService } from '../../services/produtos.service';

type ModalTipo = 'login' | 'register' | 'cart' | 'profileWelcome' | 'profileEdit' | null;
type Categoria = { id: number; nome: string };

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent, ModalsComponent],
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
    'Todos os Produtos', 'Casual', 'Streetwear', 'Camisetas',
    'Bermudas & Shorts', 'Conjuntos', 'Calcas', 'Moletons',
    'Chinelos', 'Tenis', 'Acessorios'
  ];
  categoriasBanco: Categoria[] = [];

  tamanhosPadrao = ['M', 'G', 'GG', 'XG'];
  numeracoesCalcado = ['38', '39', '40', '41', '42'];
  tamanhoUnico = ['Tamanho unico'];
  tamanhos = this.tamanhosPadrao;

  faixasPreco = ['R$0 - R$250', 'R$250 - R$500', 'R$500 - R$750', 'R$750 +'];

  produtos: Produto[] = [];
  paginaAtual = 1;
  produtosPorPagina = 6;

  constructor(private produtosService: ProdutosService) {}

  ngOnInit(): void {
    this.carregarCategorias();
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    const filtros = this.obterFiltrosSelecionados();

    this.produtosService.listar(filtros).subscribe({
      next: (res) => {
        const produtos = Array.isArray(res) ? res : [];
        this.produtos = this.aplicarFiltrosLocais(produtos);
        this.paginaAtual = 1;
      },
      error: (err) => console.error('Erro ao carregar produtos:', err)
    });
  }

  carregarCategorias(): void {
    this.produtosService.listarCategorias().subscribe({
      next: (res) => {
        this.categoriasBanco = Array.isArray(res) ? res : [];
        this.categorias = [
          'Todos os Produtos',
          ...this.categoriasBanco.map(categoria => categoria.nome)
        ];
      },
      error: (err) => console.error('Erro ao carregar categorias:', err)
    });
  }

  get produtosFiltrados(): Produto[] {
    return this.aplicarFiltrosLocais(this.produtos);
  }

  get totalPaginas(): number {
    return Math.ceil(this.produtosFiltrados.length / this.produtosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get produtosPaginados(): Produto[] {
    const inicio = (this.paginaAtual - 1) * this.produtosPorPagina;
    return this.produtosFiltrados.slice(inicio, inicio + this.produtosPorPagina);
  }

  get tituloSecao(): string {
    if (this.categoriaSelecionada && this.categoriaSelecionada !== 'Todos os Produtos') {
      return this.categoriaSelecionada;
    }
    return 'Produtos em destaque';
  }

  abrirLogin(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token || user) {
      this.modalAberto = 'profileWelcome';
    } else {
      this.modalAberto = 'login';
    }
  }

  abrirCart(): void { this.modalAberto = 'cart'; }
  fecharModal(): void { this.modalAberto = null; }
  toggleFiltro(): void { this.filtroAberto = !this.filtroAberto; }
  fecharFiltro(): void { this.filtroAberto = false; }

  selecionarCategoria(categoria: string): void {
    this.categoriaSelecionada = categoria;
    this.tamanhos = this.obterTamanhosPorCategoria(categoria);
    this.paginaAtual = 1;

    if (this.tamanhoSelecionado && !this.tamanhos.includes(this.tamanhoSelecionado)) {
      this.tamanhoSelecionado = '';
    }

    this.carregarProdutos();
  }

  selecionarTamanho(tamanho: string): void {
    this.tamanhoSelecionado = tamanho;
    this.paginaAtual = 1;
    this.carregarProdutos();
  }

  selecionarPreco(preco: string): void {
    this.precoSelecionado = preco;
    this.paginaAtual = 1;
    this.carregarProdutos();
  }

  limparFiltros(): void {
    this.categoriaSelecionada = '';
    this.tamanhoSelecionado = '';
    this.precoSelecionado = '';
    this.tamanhos = this.tamanhosPadrao;
    this.paginaAtual = 1;
    this.carregarProdutos();
  }

  irParaPagina(pagina: number): void {
    this.paginaAtual = pagina;
  }

  private obterFiltrosSelecionados(): ProdutoFiltros {
    const filtros: ProdutoFiltros = {};
    const categoria = this.obterCategoriaSelecionadaBanco();
    const faixaPreco = this.obterFaixaPrecoSelecionada();

    if (categoria) {
      filtros.categoria = categoria.nome;
      filtros.categoriaId = categoria.id;
    }

    if (this.tamanhoSelecionado) {
      filtros.tamanho = this.tamanhoSelecionado;
    }

    if (faixaPreco) {
      filtros.precoMin = faixaPreco.min;
      if (faixaPreco.max !== undefined) filtros.precoMax = faixaPreco.max;
    }

    return filtros;
  }

  private aplicarFiltrosLocais(produtos: Produto[]): Produto[] {
    return produtos.filter(produto =>
      this.produtoBateComCategoria(produto) &&
      this.produtoBateComTamanho(produto) &&
      this.produtoBateComPreco(produto)
    );
  }

  private produtoBateComCategoria(produto: Produto): boolean {
    const categoria = this.obterCategoriaSelecionadaBanco();
    if (!categoria) return true;

    const categoriaProduto = (produto as any).categoria;
    const categoriaId = Number((produto as any).categoriaId || categoriaProduto?.id);
    const categoriaNome = this.normalizarTexto(categoriaProduto?.nome || categoriaProduto || '');

    return categoriaId === categoria.id || categoriaNome === this.normalizarTexto(categoria.nome);
  }

  private produtoBateComTamanho(produto: Produto): boolean {
    if (!this.tamanhoSelecionado) return true;
    return this.obterTamanhosProduto(produto).includes(this.tamanhoSelecionado);
  }

  private produtoBateComPreco(produto: Produto): boolean {
    const faixaPreco = this.obterFaixaPrecoSelecionada();
    if (!faixaPreco) return true;

    const preco = Number((produto as any).preco);
    if (Number.isNaN(preco)) return false;

    return preco >= faixaPreco.min && (faixaPreco.max === undefined || preco <= faixaPreco.max);
  }

  private obterCategoriaSelecionadaBanco(): Categoria | null {
    if (!this.categoriaSelecionada || this.categoriaSelecionada === 'Todos os Produtos') {
      return null;
    }

    const categoriaNormalizada = this.normalizarTexto(this.categoriaSelecionada);
    return this.categoriasBanco.find(categoria =>
      this.normalizarTexto(categoria.nome) === categoriaNormalizada
    ) || null;
  }

  private obterTamanhosProduto(produto: Produto): string[] {
    const tamanho = (produto as any).tamanho;

    if (Array.isArray(tamanho)) {
      return tamanho.map(String);
    }

    if (typeof tamanho === 'string') {
      return tamanho.split(',').map(item => item.trim()).filter(Boolean);
    }

    const quantidadePorTamanho = (produto as any).quantidadePorTamanho;
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

  private obterFaixaPrecoSelecionada(): { min: number; max?: number } | null {
    if (this.precoSelecionado === 'R$0 - R$250') return { min: 0, max: 250 };
    if (this.precoSelecionado === 'R$250 - R$500') return { min: 250, max: 500 };
    if (this.precoSelecionado === 'R$500 - R$750') return { min: 500, max: 750 };
    if (this.precoSelecionado === 'R$750 +') return { min: 750 };
    return null;
  }

  private categoriaEhCalcado(categoria: string): boolean {
    const nome = this.normalizarTexto(categoria);
    return nome.includes('chinelo') || nome.includes('tenis');
  }

  private categoriaEhStreetwear(categoria: string): boolean {
    return this.normalizarTexto(categoria).includes('streetwear');
  }

  private categoriaEhAcessorio(categoria: string): boolean {
    return this.normalizarTexto(categoria).includes('acessor');
  }

  private obterTamanhosPorCategoria(categoria: string): string[] {
    if (this.categoriaEhCalcado(categoria) || this.categoriaEhStreetwear(categoria)) {
      return this.numeracoesCalcado;
    }

    if (this.categoriaEhAcessorio(categoria)) {
      return this.tamanhoUnico;
    }

    return this.tamanhosPadrao;
  }

  private normalizarTexto(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}

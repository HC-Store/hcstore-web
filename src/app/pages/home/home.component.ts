import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { ModalsComponent } from '../../components/modals/modals.component';
import { ApiService } from '../../services/api.service';

type ModalTipo = 'login' | 'register' | 'cart' | 'profileWelcome' | 'profileEdit' | null;

export interface DestaqueProduto {
  id: number;
  titulo: string;
  imagem: string;
}

export interface ConfigHome {
  videoUrl: string;
  banner1: string;
  banner2: string;
  banner3: string;
  destaques: DestaqueProduto[];
  lancamentos: DestaqueProduto[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent, ModalsComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  modalAberto: ModalTipo = null;
  indiceLancamento = 0;

  config: ConfigHome = {
    videoUrl: 'assets/video/banner-home.mp4',
    banner1: 'assets/img/nikegreen.jpg',
    banner2: 'assets/img/brinco.jpg',
    banner3: 'assets/img/baseball.webp',
    destaques: [],
    lancamentos: []
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    const salvo = localStorage.getItem('configHome');
    if (salvo) {
      this.config = { ...this.config, ...JSON.parse(salvo) };
    }

    this.carregarProdutosHome();
  }

  get lancamentosVisiveis(): DestaqueProduto[] {
    const lancamentos = this.config.lancamentos;

    if (lancamentos.length <= 2) {
      return lancamentos;
    }

    return [
      lancamentos[this.indiceLancamento],
      lancamentos[(this.indiceLancamento + 1) % lancamentos.length]
    ];
  }

  anteriorLancamento(): void {
    const total = this.config.lancamentos.length;
    if (total <= 2) return;

    this.indiceLancamento = (this.indiceLancamento - 1 + total) % total;
  }

  proximoLancamento(): void {
    const total = this.config.lancamentos.length;
    if (total <= 2) return;

    this.indiceLancamento = (this.indiceLancamento + 1) % total;
  }

  private carregarProdutosHome(): void {
    this.api.getProdutos().subscribe({
      next: (res) => {
        const produtos = Array.isArray(res) ? res : [];
        const produtosValidos = produtos.filter((produto: any) => produto?.id && produto?.nome);

        this.config.destaques = produtosValidos
          .slice(0, 3)
          .map((produto: any) => this.mapearProdutoHome(produto));

        this.config.lancamentos = produtosValidos
          .filter((produto: any) => this.produtoEhCamisaDeTime(produto))
          .map((produto: any) => this.mapearProdutoHome(produto));

        this.indiceLancamento = 0;
      },
      error: (err) => console.error('Erro ao carregar produtos da home:', err)
    });
  }

  private mapearProdutoHome(produto: any): DestaqueProduto {
    return {
      id: produto.id,
      titulo: produto.nome,
      imagem: produto.imagens?.[0]?.url || produto.imagem || 'assets/img/sem-imagem.png'
    };
  }

  private produtoEhCamisaDeTime(produto: any): boolean {
    const categoria = produto?.categoria?.nome || produto?.categoria || '';
    const texto = this.normalizarTexto(`${produto?.nome || ''} ${categoria}`);

    return texto.includes('jersey') || (
      texto.includes('camisa') && (
        texto.includes('time') ||
        texto.includes('futebol') ||
        texto.includes('clube') ||
        texto.includes('selecao')
      )
    );
  }

  private normalizarTexto(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
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

  abrirRegister(): void { this.modalAberto = 'register'; }
  abrirCart(): void { this.modalAberto = 'cart'; }
  fecharModal(): void { this.modalAberto = null; }
}

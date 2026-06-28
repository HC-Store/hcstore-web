import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ConfigHome } from '../../home/home.component';

@Component({
  selector: 'app-config-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './config-home.component.html',
  styleUrls: ['./config-home.component.css']
})
export class ConfigHomeComponent implements OnInit {

  sucesso = '';
  erro = '';
  produtos: any[] = [];

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
    this.carregarConfig();
    this.carregarProdutos();
  }

  carregarConfig(): void {
    this.api.getSiteConfig().subscribe({
      next: (res) => {
        if (res?.home) {
          this.config = { ...this.config, ...res.home };
        }
      },
      error: () => {
        this.erro = 'Erro ao carregar configurações da Home.';
      }
    });
  }

  carregarProdutos(): void {
    this.api.getProdutos().subscribe({
      next: (res) => {
        this.produtos = Array.isArray(res) ? res : [];
      },
      error: () => {
        this.erro = 'Erro ao carregar produtos.';
      }
    });
  }

  salvar(): void {
    this.api.getSiteConfig().subscribe({
      next: (siteConfig) => {
        const body = {
          ...(siteConfig || {}),
          home: this.config
        };

        this.api.salvarSiteConfig(body).subscribe({
          next: () => {
            this.sucesso = 'Configurações salvas com sucesso!';
            setTimeout(() => this.sucesso = '', 3000);
          },
          error: () => {
            this.erro = 'Erro ao salvar configurações.';
          }
        });
      },
      error: () => {
        this.erro = 'Erro ao buscar configuração atual.';
      }
    });
  }

  adicionarDestaque(): void {
    this.config.destaques.push({ id: 0, titulo: '', imagem: '' });
  }

  removerDestaque(index: number): void {
    this.config.destaques.splice(index, 1);
  }

  adicionarLancamento(): void {
    this.config.lancamentos.push({ id: 0, titulo: '', imagem: '' });
  }

  removerLancamento(index: number): void {
    this.config.lancamentos.splice(index, 1);
  }

  selecionarProdutoDestaque(index: number, produtoId: any): void {
    const produto = this.produtos.find(p => Number(p.id) === Number(produtoId));
    if (!produto) return;

    this.config.destaques[index] = this.mapearProduto(produto);
  }

  selecionarProdutoLancamento(index: number, produtoId: any): void {
    const produto = this.produtos.find(p => Number(p.id) === Number(produtoId));
    if (!produto) return;

    this.config.lancamentos[index] = this.mapearProduto(produto);
  }

  private mapearProduto(produto: any) {
    return {
      id: produto.id,
      titulo: produto.nome,
      imagem: produto.imagens?.[0]?.url || 'assets/img/sem-imagem.png'
    };
  }
}

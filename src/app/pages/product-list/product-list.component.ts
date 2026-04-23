import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { ModalsComponent } from '../../components/modals/modals.component';

type ModalTipo = 'login' | 'register' | 'cart' | null;

interface Produto {
  nome: string;
  imagem: string;
}

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
export class ProductListComponent {
  modalAberto: ModalTipo = null;

  categoriaSelecionada = '';
  tamanhoSelecionado = '';
  precoSelecionado = '';

  categorias: string[] = [
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

  tamanhos: string[] = ['M', 'G', 'GG', 'XG'];

  faixasPreco: string[] = [
    'R$0 - R$250',
    'R$250 - R$500',
    'R$500 - R$750',
    'R$750 +'
  ];

  produtos: Produto[] = [];

  abrirLogin(): void {
    this.modalAberto = 'login';
  }

  abrirCart(): void {
    this.modalAberto = 'cart';
  }

  fecharModal(): void {
    this.modalAberto = null;
  }

  selecionarCategoria(categoria: string): void {
    this.categoriaSelecionada = categoria;
  }

  selecionarTamanho(tamanho: string): void {
    this.tamanhoSelecionado = tamanho;
  }

  selecionarPreco(preco: string): void {
    this.precoSelecionado = preco;
  }

  limparFiltros(): void {
    this.categoriaSelecionada = '';
    this.tamanhoSelecionado = '';
    this.precoSelecionado = '';
  }
}
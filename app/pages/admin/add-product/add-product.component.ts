import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';

interface EstoqueTamanho {
  tamanho: string;
  quantidade: number | null;
}

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    FormsModule
  ],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent {

  sizes = [
    'PP',
    'P',
    'M',
    'G',
    'GG',
    '36',
    '38',
    '40',
    '42',
    '44'
  ];

  selectedSizes: string[] = [];

  estoquePorTamanho: EstoqueTamanho[] = [];

  carregando = false;
  uploadando = false;

  sucesso = '';
  erro = '';

  produto = {
    nome: '',
    descricao: '',
    categoria: '',
    marca: '',
    estoque: 0,
    preco: null as number | null,
    imagem: ''
  };

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  get estoqueTotal(): number {
    return this.estoquePorTamanho.reduce((total, item) => {
      return total + Number(item.quantidade || 0);
    }, 0);
  }

  toggleSize(size: string): void {

    if (this.selectedSizes.includes(size)) {

      this.selectedSizes =
        this.selectedSizes.filter(s => s !== size);

      this.estoquePorTamanho =
        this.estoquePorTamanho.filter(
          item => item.tamanho !== size
        );

    } else {

      this.selectedSizes.push(size);

      this.estoquePorTamanho.push({
        tamanho: size,
        quantidade: null
      });

    }

    this.produto.estoque = this.estoqueTotal;
  }

  onImageSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.erro = 'Selecione apenas arquivos de imagem.';
      return;
    }

    this.uploadando = true;
    this.erro = '';

    const formData = new FormData();

    formData.append('imagem', file);

    this.api.uploadImagem(formData).subscribe({

      next: (res: any) => {

        this.produto.imagem = res.url;

        this.uploadando = false;
      },

      error: () => {

        this.erro =
          'Erro ao fazer upload da imagem.';

        this.uploadando = false;
      }

    });
  }

  salvar(): void {

    this.erro = '';
    this.sucesso = '';

    if (!this.produto.nome.trim()) {
      this.erro = 'Nome é obrigatório.';
      return;
    }

    if (!this.produto.categoria) {
      this.erro = 'Selecione uma categoria.';
      return;
    }

    if (!this.produto.preco) {
      this.erro = 'Preço é obrigatório.';
      return;
    }

    if (this.selectedSizes.length === 0) {
      this.erro =
        'Selecione pelo menos um tamanho.';
      return;
    }

    const algumSemQuantidade =
      this.estoquePorTamanho.some(
        item =>
          item.quantidade === null ||
          Number(item.quantidade) < 0
      );

    if (algumSemQuantidade) {
      this.erro =
        'Informe a quantidade de todos os tamanhos.';
      return;
    }

    this.carregando = true;

    this.produto.estoque = this.estoqueTotal;

    const body = {

      nome: this.produto.nome,

      descricao: this.produto.descricao,

      categoria: this.produto.categoria,

      marca: this.produto.marca,

      preco: Number(this.produto.preco),

      estoque: this.estoqueTotal,

      tamanhos: this.selectedSizes,

      estoquesPorTamanho:
        this.estoquePorTamanho.map(item => ({
          tamanho: item.tamanho,
          quantidade: Number(item.quantidade || 0)
        })),

      imagem: this.produto.imagem

    };

    this.api.createProduto(body).subscribe({

      next: () => {

        this.carregando = false;

        this.sucesso =
          'Produto adicionado com sucesso!';

        setTimeout(() => {
          this.router.navigate([
            '/admin/produtos'
          ]);
        }, 1500);
      },

      error: (err) => {

        this.carregando = false;

        this.erro =
          err.error?.message ||
          err.error?.error ||
          'Erro ao adicionar produto.';
      }

    });
  }
}
import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, FormsModule],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {
  sizes = [
  'Único',
  'PP', 'P', 'M', 'G', 'GG',
  '36', '38', '40', '42', '44',
  'Pulseira P', 'Pulseira M', 'Pulseira G',
  'Corrente 45cm', 'Corrente 50cm', 'Corrente 60cm'
];
  categorias: any[] = [];

  carregando = false;
  uploadando = false;
  sucesso = '';
  erro = '';

  produto = {
    nome: '',
    descricao: '',
    categoriaId: null as number | null,
    marca: '',
    estoque: null as number | null,
    preco: null as number | null,
    imagens: [] as string[],
    composicaoMaterial: '',
    instrucaoLavagem: '',
    enviosDevolucoes: '',
    quantidadePorTamanho: {} as Record<string, number>
  };

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarCategorias();
  }

  carregarCategorias(): void {
    this.api.getCategorias().subscribe({
      next: (res) => {
        this.categorias = res;
      },
      error: () => {
        this.erro = 'Erro ao carregar categorias.';
      }
    });
  }

  toggleSize(size: string): void {
    if (this.produto.quantidadePorTamanho[size] !== undefined) {
      delete this.produto.quantidadePorTamanho[size];
    } else {
      this.produto.quantidadePorTamanho[size] = 0;
    }
  }

  sizeSelecionado(size: string): boolean {
    return this.produto.quantidadePorTamanho[size] !== undefined;
  }

  atualizarQuantidadeSize(size: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.produto.quantidadePorTamanho[size] = Number(input.value || 0);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    if (this.produto.imagens.length >= 3) {
      this.erro = 'Você pode adicionar no máximo 3 imagens.';
      input.value = '';
      return;
    }

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.erro = 'Selecione apenas arquivos de imagem.';
      input.value = '';
      return;
    }

    this.uploadando = true;
    this.erro = '';

    const formData = new FormData();
    formData.append('imagem', file);

    this.api.uploadImagem(formData).subscribe({
      next: (res: any) => {
        this.produto.imagens.push(res.url);
        this.uploadando = false;
        input.value = '';
      },
      error: (err) => {
        this.erro = err.error?.error || 'Erro ao fazer upload da imagem.';
        this.uploadando = false;
        input.value = '';
      }
    });
  }

  removerImagem(index: number): void {
    this.produto.imagens.splice(index, 1);
  }

  salvar(): void {
    this.erro = '';
    this.sucesso = '';

    if (!this.produto.nome.trim()) {
      this.erro = 'Nome é obrigatório.';
      return;
    }

    if (!this.produto.categoriaId) {
      this.erro = 'Categoria é obrigatória.';
      return;
    }

    if (!this.produto.preco || this.produto.preco <= 0) {
      this.erro = 'Preço é obrigatório.';
      return;
    }

    if (!this.produto.estoque || this.produto.estoque <= 0) {
      this.erro = 'Estoque é obrigatório.';
      return;
    }

    if (this.produto.imagens.length === 0) {
      this.erro = 'Adicione pelo menos uma imagem.';
      return;
    }

    const tamanhosSelecionados = Object.keys(this.produto.quantidadePorTamanho);

    const body = {
      nome: this.produto.nome,
      descricao: this.produto.descricao,
      preco: Number(this.produto.preco),
      estoque: Number(this.produto.estoque),
      categoriaId: Number(this.produto.categoriaId),
      marca: this.produto.marca,
      tamanho: tamanhosSelecionados.join(','),
      imagens: this.produto.imagens,
      composicaoMaterial: this.produto.composicaoMaterial,
      instrucaoLavagem: this.produto.instrucaoLavagem,
      enviosDevolucoes: this.produto.enviosDevolucoes,
      quantidadePorTamanho: this.produto.quantidadePorTamanho
    };

    this.carregando = true;

    this.api.createProduto(body).subscribe({
      next: () => {
        this.carregando = false;
        this.sucesso = 'Produto adicionado com sucesso!';
        setTimeout(() => this.router.navigate(['/admin/produtos']), 1200);
      },
      error: (err) => {
        this.carregando = false;
        this.erro = err.error?.error || err.error?.message || 'Erro ao adicionar produto.';
      }
    });
  }
}

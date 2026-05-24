import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {

  sizes = ['PP', 'P', 'M', 'G', 'GG', '36', '38', '40', '42', '44'];
  selectedSizes: string[] = [];
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
    imagem: ''
  };

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.api.getCategorias().subscribe({
      next: (res) => this.categorias = res,
      error: () => console.error('Erro ao carregar categorias')
    });
  }

  toggleSize(size: string) {
    if (this.selectedSizes.includes(size)) {
      this.selectedSizes = this.selectedSizes.filter(s => s !== size);
    } else {
      this.selectedSizes.push(size);
    }
  }

  // 🔌 UPLOAD CLOUDINARY
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

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
    this.erro = 'Erro ao fazer upload da imagem.';
    this.uploadando = false;
  }
});
  }

  salvar(): void {
    this.erro = '';
    this.sucesso = '';

    if (!this.produto.nome.trim()) { this.erro = 'Nome é obrigatório.'; return; }
    if (!this.produto.preco) { this.erro = 'Preço é obrigatório.'; return; }
    if (!this.produto.estoque) { this.erro = 'Estoque é obrigatório.'; return; }

    this.carregando = true;

    const body = {
      nome: this.produto.nome,
      descricao: this.produto.descricao,
      preco: Number(this.produto.preco),
      estoque: Number(this.produto.estoque),
      categoriaId: this.produto.categoriaId,
      marca: this.produto.marca,
      tamanho: this.selectedSizes.join(','),
      imagem: this.produto.imagem
    };

    this.api.createProduto(body).subscribe({
      next: () => {
        this.carregando = false;
        this.sucesso = 'Produto adicionado com sucesso!';
        setTimeout(() => this.router.navigate(['/admin/produtos']), 1500);
      },
      error: (err) => {
        this.carregando = false;
        this.erro = err.error?.message || err.error?.error || 'Erro ao adicionar produto.';
      }
    });
  }
}

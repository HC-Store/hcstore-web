import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {

  produtos: any[] = [];
  carregando = false;
  erro = '';

  showModal = false;
  editIndex: number | null = null;
  editId: number | null = null;

  form: any = {
    nome: '',
    categoriaId: null,
    preco: '',
    descricao: '',
    tamanho: '',
    estoque: '',
    marca: '',
    composicaoMaterial: '',
    instrucaoLavagem: '',
    enviosDevolucoes: ''
  };

  constructor(private router: Router, private api: ApiService) {}

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.carregando = true;
    this.api.getProdutos().subscribe({
      next: (res) => {
        this.produtos = res;
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Erro ao carregar produtos.';
        this.carregando = false;
      }
    });
  }

  novoProduto(): void {
    this.router.navigate(['/admin/adicionar-produto']);
  }

  editarProduto(index: number): void {
    this.editIndex = index;
    const p = this.produtos[index];
    this.editId = p.id;

    this.form = {
      nome: p.nome,
      categoriaId: p.categoriaId,
      preco: p.preco,
      descricao: p.descricao,
      tamanho: p.tamanho || '',
      estoque: p.estoque,
      marca: p.marca || '',
      composicaoMaterial: p.composicaoMaterial || '',
      instrucaoLavagem: p.instrucaoLavagem || '',
      enviosDevolucoes: p.enviosDevolucoes || ''
    };

    this.showModal = true;
  }

  salvarProduto(): void {
    if (this.editId === null) return;

    const body = {
      nome: this.form.nome,
      preco: Number(this.form.preco),
      descricao: this.form.descricao,
      tamanho: this.form.tamanho,
      estoque: Number(this.form.estoque),
      marca: this.form.marca,
      categoriaId: this.form.categoriaId,
      composicaoMaterial: this.form.composicaoMaterial,
      instrucaoLavagem: this.form.instrucaoLavagem,
      enviosDevolucoes: this.form.enviosDevolucoes
    };

    this.api.updateProduto(this.editId, body).subscribe({
      next: () => {
        this.showModal = false;
        this.carregarProdutos();
      },
      error: () => {
        this.erro = 'Erro ao atualizar produto.';
      }
    });
  }

  removerProduto(index: number): void {
    const produto = this.produtos[index];
    if (!confirm(`Deseja excluir "${produto.nome}"?`)) return;

    this.api.deleteProduto(produto.id).subscribe({
      next: () => this.carregarProdutos(),
      error: () => this.erro = 'Erro ao excluir produto.'
    });
  }
}

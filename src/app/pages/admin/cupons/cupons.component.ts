import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-cupons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cupons.component.html',
  styleUrls: ['./cupons.component.css']
})
export class CuponsComponent implements OnInit {
  cupons: any[] = [];
  erro = '';
  sucesso = '';
  carregando = false;

  form = {
    codigo: '',
    tipo: 'PERCENTUAL',
    valor: null as number | null,
    ativo: true,
    usoMaximo: null as number | null
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.carregarCupons();
  }

  carregarCupons(): void {
    this.carregando = true;

    this.api.getCupons().subscribe({
      next: (res) => {
        this.cupons = Array.isArray(res) ? res : [];
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Erro ao carregar cupons.';
        this.carregando = false;
      }
    });
  }

  criarCupom(): void {
    this.erro = '';
    this.sucesso = '';

    if (!this.form.codigo.trim()) {
      this.erro = 'Código do cupom é obrigatório.';
      return;
    }

    if (!this.form.valor || this.form.valor <= 0) {
      this.erro = 'Valor do desconto é obrigatório.';
      return;
    }

    const body = {
      codigo: this.form.codigo.trim().toUpperCase(),
      tipo: this.form.tipo,
      valor: Number(this.form.valor),
      ativo: this.form.ativo,
      usoMaximo: this.form.usoMaximo ? Number(this.form.usoMaximo) : null
    };

    this.api.createCupom(body).subscribe({
      next: () => {
        this.sucesso = 'Cupom criado com sucesso.';
        this.form = {
          codigo: '',
          tipo: 'PERCENTUAL',
          valor: null,
          ativo: true,
          usoMaximo: null
        };
        this.carregarCupons();
        setTimeout(() => this.sucesso = '', 3000);
      },
      error: (err) => {
        this.erro = err.error?.error || 'Erro ao criar cupom.';
      }
    });
  }

  excluirCupom(id: number): void {
    if (!confirm('Deseja excluir este cupom?')) return;

    this.api.deleteCupom(id).subscribe({
      next: () => {
        this.sucesso = 'Cupom excluído com sucesso.';
        this.carregarCupons();
        setTimeout(() => this.sucesso = '', 3000);
      },
      error: () => {
        this.erro = 'Erro ao excluir cupom.';
      }
    });
  }
}

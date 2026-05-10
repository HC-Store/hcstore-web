import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, CommonModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  usuarios: any[] = [];
  carregando = false;
  erro = '';

  showForm = false;
  editingId: number | null = null;

  form: any = {
    nome: '',
    sobrenome: '',
    email: '',
    telefone: ''
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    this.carregando = true;
    this.api.getUsuarios().subscribe({
      next: (res) => {
        this.usuarios = res;
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Erro ao carregar usuários.';
        this.carregando = false;
      }
    });
  }

  openForm(): void {
    this.showForm = true;
    this.editingId = null;
    this.form = { nome: '', sobrenome: '', email: '', telefone: '' };
  }

  closeForm(): void {
    this.showForm = false;
  }

  editUser(usuario: any): void {
    this.editingId = usuario.id;
    this.form = {
      nome: usuario.nome,
      sobrenome: usuario.sobrenome,
      email: usuario.email,
      telefone: usuario.telefone
    };
    this.showForm = true;
  }

  saveUser(): void {
    if (this.editingId === null) return;

    this.api.updateUsuario(this.editingId, this.form).subscribe({
      next: () => {
        this.closeForm();
        this.carregarUsuarios();
      },
      error: () => this.erro = 'Erro ao atualizar usuário.'
    });
  }

  deleteUser(id: number): void {
    if (!confirm('Deseja excluir este usuário?')) return;

    this.api.deleteUsuario(id).subscribe({
      next: () => this.carregarUsuarios(),
      error: () => this.erro = 'Erro ao excluir usuário.'
    });
  }
}

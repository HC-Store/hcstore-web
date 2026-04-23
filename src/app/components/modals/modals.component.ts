import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface CartItem {
  name: string;
  price: number;
  size?: string;
  qty: number;
  category?: string;
  image?: string;
}

type ModalTipo = 'login' | 'register' | 'cart' | null;

@Component({
  selector: 'app-modals',
  standalone: true,
  imports: [CommonModule,FormsModule, RouterModule],
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.css']
})
export class ModalsComponent {
  @Input() modalAberto: ModalTipo = null;
  @Output() closeModal = new EventEmitter<void>();

  loginData = {
    email: '',
    senha: ''
  };

  registerData = {
    nome: '',
    sobrenome: '',
    dia: '',
    mes: '',
    ano: '',
    sexo: '',
    cpf: '',
    telefone: '',
    email: '',
    senha: ''
  };

  get cart(): CartItem[] {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  }

  get totalCart(): number {
    return this.cart.reduce((total, item) => total + item.price * item.qty, 0);
  }

  formatPrice(value: number): string {
    return 'R$' + value.toFixed(2).replace('.', ',');
  }

  abrirLogin(): void {
    this.modalAberto = 'login';
  }

  abrirRegister(): void {
    this.modalAberto = 'register';
  }

  abrirCart(): void {
    this.modalAberto = 'cart';
  }

  fechar(): void {
    this.closeModal.emit();
  }

  diminuirQuantidade(index: number): void {
    const cart = this.cart;

    if (cart[index].qty > 1) {
      cart[index].qty -= 1;
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }

  aumentarQuantidade(index: number): void {
    const cart = this.cart;
    cart[index].qty += 1;
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  removerItem(index: number): void {
    const cart = this.cart;
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  irParaCheckout(): void {
    localStorage.setItem('checkoutData', JSON.stringify(this.cart));
  }

  submitLogin(): void {
    const { email, senha } = this.loginData;

    if (!email.trim() || !senha.trim()) {
      alert('Preencha todos os campos.');
      return;
    }

    alert('Login enviado com sucesso.');
    this.fechar();
  }

  submitRegister(): void {
    const {
      nome,
      sobrenome,
      dia,
      mes,
      ano,
      sexo,
      cpf,
      telefone,
      email,
      senha
    } = this.registerData;

    if (
      !nome.trim() ||
      !sobrenome.trim() ||
      !dia.trim() ||
      !mes.trim() ||
      !ano.trim() ||
      !sexo.trim() ||
      !cpf.trim() ||
      !telefone.trim() ||
      !email.trim() ||
      !senha.trim()
    ) {
      alert('Preencha todos os campos.');
      return;
    }

    alert('Cadastro enviado com sucesso.');
    this.fechar();
  }
}
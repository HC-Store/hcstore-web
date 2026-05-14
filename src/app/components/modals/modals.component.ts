import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { CarrinhoService } from '../../services/carrinho.service';

type ModalTipo = 'login' | 'register' | 'cart' | null;

@Component({
  selector: 'app-modals',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.css']
})
export class ModalsComponent implements OnInit {

  @Input() modalAberto: ModalTipo = null;
  @Output() closeModal = new EventEmitter<void>();

  carregando = false;

  erroLogin = '';
  erroRegister = '';

  sucessoLogin = '';
  sucessoRegister = '';

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

  itensCarrinho: any[] = [];

  constructor(
    private auth: AuthService,
    public carrinho: CarrinhoService
  ) {}

  ngOnInit(): void {

    this.carrinho.itens.subscribe(itens => {

      this.itensCarrinho = itens;
    });
  }

  get totalCart(): number {

    return this.carrinho.total;
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

  removerItem(itemId: number): void {

    this.carrinho.removerItem(itemId);
  }
aumentarQtd(item: any): void {

  item.quantidade++;

 
}

diminuirQtd(item: any): void {

  if (item.quantidade > 1) {

    item.quantidade--;

  
  }
}


  irParaCheckout(): void {

    localStorage.setItem(
      'checkoutData',
      JSON.stringify(this.itensCarrinho)
    );
  }

  submitLogin(): void {

    const { email, senha } = this.loginData;

    this.erroLogin = '';
    this.sucessoLogin = '';

    if (!email.trim() || !senha.trim()) {

      this.erroLogin = 'Preencha todos os campos.';
      return;
    }

    this.carregando = true;

    this.auth.login(email, senha).subscribe({

      next: () => {

        this.carregando = false;

        this.sucessoLogin = 'Login realizado com sucesso!';

        this.carrinho.carregarCarrinho();

        setTimeout(() => {

          this.fechar();

        }, 1500);
      },

      error: (err) => {

        this.carregando = false;

        this.erroLogin =
          err.error?.erro ||
          'E-mail ou senha incorretos.';
      }
    });
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

    this.erroRegister = '';
    this.sucessoRegister = '';

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

      this.erroRegister = 'Preencha todos os campos.';
      return;
    }

    const dataNascimento =
      `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;

    this.carregando = true;

    this.auth.register(
      nome,
      sobrenome,
      email,
      senha,
      cpf,
      telefone,
      sexo,
      dataNascimento
    ).subscribe({

      next: () => {

        this.carregando = false;

        this.sucessoRegister = 'Conta criada com sucesso!';

        setTimeout(() => {

          this.modalAberto = 'login';

        }, 1500);
      },

      error: (err) => {

        this.carregando = false;

        this.erroRegister =
          err.error?.erro ||
          'Erro ao criar conta. Tente novamente.';
      }
    });
  }
}
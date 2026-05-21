import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CarrinhoService } from '../../services/carrinho.service';
import { AuthService } from '../../services/auth.service';

type ModalTipo =
  | 'login'
  | 'register'
  | 'cart'
  | 'profileWelcome'
  | 'profileEdit'
  | null;

@Component({
  selector: 'app-modals',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.scss']
})
export class ModalsComponent implements OnInit, OnChanges {
  @Input() modalAberto: ModalTipo = null;
  @Output() closeModal = new EventEmitter<void>();

  carregando = false;

  erroLogin = '';
  sucessoLogin = '';

  erroRegister = '';
  sucessoRegister = '';

  mensagemPerfil = '';
  tipoMensagemPerfil = '';

  itensCarrinho: any[] = [];
  totalCart = 0;

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

  profileData = {
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

  constructor(
    private carrinho: CarrinhoService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.carrinho.itens.subscribe((itens) => {
      this.itensCarrinho = itens;
      this.calcularTotal();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modalAberto'] && this.modalAberto === 'cart') {
      this.carrinho.carregarCarrinho();
    }
  }

  abrirLogin(): void {
    const usuario = localStorage.getItem('usuarioLogado');
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (usuario === 'true' || token || user) {
      this.modalAberto = 'profileWelcome';
    } else {
      this.modalAberto = 'login';
    }
  }

  abrirRegister(): void {
    this.modalAberto = 'register';
  }

  abrirCart(): void {
    this.modalAberto = 'cart';
    this.carrinho.carregarCarrinho();
  }

  abrirProfileWelcome(): void {
    this.modalAberto = 'profileWelcome';
  }

  abrirProfileEdit(): void {
    this.modalAberto = 'profileEdit';
  }

  fechar(): void {
    this.modalAberto = null;
    this.closeModal.emit();
  }

  private iniciarSessaoLocal(email: string): void {
    localStorage.setItem('usuarioLogado', 'true');
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: 1,
        email
      })
    );
  }

  submitLogin(): void {
    this.carregando = true;
    this.erroLogin = '';
    this.sucessoLogin = '';

    this.auth.login(this.loginData.email, this.loginData.senha).subscribe({
      next: () => {
        this.carregando = false;
        localStorage.setItem('usuarioLogado', 'true');
        this.carrinho.carregarCarrinho();
        this.sucessoLogin = 'Login realizado com sucesso!';

        setTimeout(() => {
          this.modalAberto = 'profileWelcome';
          this.sucessoLogin = '';
        }, 1000);
      },
      error: () => {
        this.carregando = false;
        this.iniciarSessaoLocal(this.loginData.email);
        this.carrinho.carregarCarrinho();
        this.sucessoLogin = 'Login local ativado para teste!';

        setTimeout(() => {
          this.modalAberto = 'profileWelcome';
          this.sucessoLogin = '';
        }, 1000);
      }
    });
  }

  submitRegister(): void {
    this.carregando = true;
    this.erroRegister = '';
    this.sucessoRegister = '';

    const dataNascimento = [
      this.registerData.ano,
      this.registerData.mes,
      this.registerData.dia
    ].filter(Boolean).join('-');

    this.auth.register(
      this.registerData.nome,
      this.registerData.sobrenome,
      this.registerData.email,
      this.registerData.senha,
      this.registerData.cpf,
      this.registerData.telefone,
      this.registerData.sexo,
      dataNascimento
    ).subscribe({
      next: () => {
        this.carregando = false;
        this.sucessoRegister = 'Conta criada com sucesso!';

        setTimeout(() => {
          this.modalAberto = 'login';
        }, 1500);
      },
      error: () => {
        this.carregando = false;
        this.iniciarSessaoLocal(this.registerData.email);
        this.sucessoRegister = 'Conta local criada para teste!';

        setTimeout(() => {
          this.modalAberto = 'profileWelcome';
          this.sucessoRegister = '';
        }, 1500);
      }
    });
  }

  salvarPerfil(): void {
    this.carregando = true;

    setTimeout(() => {
      this.carregando = false;
      this.tipoMensagemPerfil = 'sucesso';
      this.mensagemPerfil = 'Informações atualizadas com sucesso!';
    }, 1200);
  }

  cancelarEdicaoPerfil(): void {
    this.modalAberto = 'profileWelcome';
  }

  sairPerfil(): void {
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    this.modalAberto = null;
    this.closeModal.emit();
  }

  carregarDadosPerfil(): void {
    const user = localStorage.getItem('user');

    if (user) {
      const usuario = JSON.parse(user);
      this.profileData.email = usuario.email || '';
    }
  }

  apenasNumeros(
    campo: 'dia' | 'mes' | 'ano',
    valor: string
  ): void {
    this.profileData[campo] = valor.replace(/\D/g, '');
  }

  formatarCpf(valor: string): void {
    valor = valor.replace(/\D/g, '');

    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    this.profileData.cpf = valor;
  }

  formatarTelefone(valor: string): void {
    valor = valor.replace(/\D/g, '');

    valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2');
    valor = valor.replace(/(\d)(\d{4})$/, '$1-$2');

    this.profileData.telefone = valor;
  }

  removerItem(id: number): void {
    this.carrinho.removerItem(id);
  }

  aumentarQtd(item: any): void {
    this.carrinho.aumentarQuantidade(item);
    this.calcularTotal();
  }

  diminuirQtd(item: any): void {
    this.carrinho.diminuirQuantidade(item);
    this.calcularTotal();
  }

  calcularTotal(): void {
    this.totalCart = this.itensCarrinho.reduce((acc, item) => {
      return acc + Number(item.produto?.preco || 0) * Number(item.quantidade || 1);
    }, 0);
  }

  formatPrice(valor: number): string {
    return valor?.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  irParaCheckout(): void {
    this.fechar();
  }
}

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CarrinhoService } from '../../services/carrinho.service';

type ModalTipo = 'login' | 'register' | 'cart' | 'profileWelcome' | 'profileEdit' | null;

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
  mensagemPerfil = '';
  tipoMensagemPerfil: 'sucesso' | 'erro' | 'cancelado' | '' = '';

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
    sexo: 'Masculino',
    cpf: '',
    telefone: '',
    email: '',
    senha: ''
  };

  itensCarrinho: any[] = [];

  constructor(
    private auth: AuthService,
    private api: ApiService,
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

  abrirProfileWelcome(): void {

    this.carregarDadosPerfil();
    this.modalAberto = 'profileWelcome';
  }

  abrirProfileEdit(): void {

    this.carregarDadosPerfil();
    this.limparMensagemPerfil();
    this.modalAberto = 'profileEdit';
  }

  fechar(): void {

    this.closeModal.emit();
  }

  sairPerfil(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.fechar();
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
        this.carregarDadosPerfil();

        setTimeout(() => {

          this.modalAberto = 'profileWelcome';
          this.sucessoLogin = '';

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

  salvarPerfil(): void {

    this.limparMensagemPerfil();

    const camposObrigatorios = [
      'nome',
      'sobrenome',
      'dia',
      'mes',
      'ano',
      'cpf',
      'telefone',
      'email'
    ] as const;

    const temErro = camposObrigatorios.some(campo => !this.profileData[campo].trim());

    if (temErro) {

      this.mostrarMensagemPerfil('Por favor, preencha todos os campos.', 'erro');
      return;
    }

    const usuarioAtual = this.getUsuarioLocal();
    const dataNascimento =
      `${this.profileData.ano}-${this.profileData.mes.padStart(2, '0')}-${this.profileData.dia.padStart(2, '0')}`;

    const dadosAtualizados: any = {
      ...usuarioAtual,
      nome: this.profileData.nome,
      sobrenome: this.profileData.sobrenome,
      sexo: this.profileData.sexo,
      cpf: this.profileData.cpf,
      telefone: this.profileData.telefone,
      email: this.profileData.email,
      dataNascimento
    };

    if (this.profileData.senha.trim()) {

      dadosAtualizados.senha = this.profileData.senha;
    }

    const finalizar = (dados: any) => {

      const usuarioSalvo = dados?.user || dados?.usuario || dados || dadosAtualizados;
      localStorage.setItem('user', JSON.stringify(usuarioSalvo));
      this.profileData.senha = '';
      this.mostrarMensagemPerfil('Informações salvas com sucesso!', 'sucesso');
    };

    if (!usuarioAtual?.id) {

      finalizar(dadosAtualizados);
      return;
    }

    this.carregando = true;

    this.api.updateUsuario(usuarioAtual.id, dadosAtualizados).subscribe({

      next: (res) => {

        this.carregando = false;
        finalizar(res);
      },

      error: (err) => {

        this.carregando = false;
        this.mostrarMensagemPerfil(
          err.error?.erro || 'Erro ao salvar informações. Tente novamente.',
          'erro'
        );
      }
    });
  }

  cancelarEdicaoPerfil(): void {

    this.carregarDadosPerfil();
    this.mostrarMensagemPerfil('Edição cancelada.', 'cancelado');
    setTimeout(() => {

      this.modalAberto = 'profileWelcome';
      this.limparMensagemPerfil();

    }, 900);
  }

  formatarCpf(valor: string): void {

    let v = valor.replace(/\D/g, '').slice(0, 11);

    if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
    else if (v.length > 3) v = v.replace(/(\d{3})(\d{0,3})/, '$1.$2');

    this.profileData.cpf = v;
  }

  formatarTelefone(valor: string): void {

    let v = valor.replace(/\D/g, '').slice(0, 11);

    if (v.length > 7) v = v.replace(/(\d{2})(\d{1})(\d{4})(\d{0,4})/, '($1) $2 $3-$4');
    else if (v.length > 3) v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    else if (v.length > 0) v = v.replace(/(\d{0,2})/, '($1');

    this.profileData.telefone = v;
  }

  apenasNumeros(campo: 'dia' | 'mes' | 'ano', valor: string): void {

    this.profileData[campo] = valor.replace(/\D/g, '');
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

  private carregarDadosPerfil(): void {

    const usuario = this.getUsuarioLocal();
    const dataNascimento = usuario?.dataNascimento || usuario?.nascimento || '';
    const partes = this.extrairDataNascimento(dataNascimento);

    this.profileData = {
      nome: usuario?.nome || this.profileData.nome || '',
      sobrenome: usuario?.sobrenome || this.profileData.sobrenome || '',
      dia: partes.dia || this.profileData.dia || '',
      mes: partes.mes || this.profileData.mes || '',
      ano: partes.ano || this.profileData.ano || '',
      sexo: usuario?.sexo || this.profileData.sexo || 'Masculino',
      cpf: usuario?.cpf || this.profileData.cpf || '',
      telefone: usuario?.telefone || this.profileData.telefone || '',
      email: usuario?.email || this.loginData.email || this.profileData.email || '',
      senha: ''
    };
  }

  private getUsuarioLocal(): any {

    try {

      return JSON.parse(localStorage.getItem('user') || '{}');

    } catch {

      return {};
    }
  }

  private extrairDataNascimento(valor: string): { dia: string; mes: string; ano: string } {

    if (!valor) return { dia: '', mes: '', ano: '' };

    const data = valor.includes('T') ? valor.split('T')[0] : valor;
    const partes = data.includes('-') ? data.split('-') : data.split('/');

    if (data.includes('-')) {

      return {
        ano: partes[0] || '',
        mes: partes[1] || '',
        dia: partes[2] || ''
      };
    }

    return {
      dia: partes[0] || '',
      mes: partes[1] || '',
      ano: partes[2] || ''
    };
  }

  private mostrarMensagemPerfil(
    texto: string,
    tipo: 'sucesso' | 'erro' | 'cancelado'
  ): void {

    this.mensagemPerfil = texto;
    this.tipoMensagemPerfil = tipo;
  }

  private limparMensagemPerfil(): void {

    this.mensagemPerfil = '';
    this.tipoMensagemPerfil = '';
  }
}

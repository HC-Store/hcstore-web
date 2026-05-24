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
import { CarrinhoService } from '../../services/carrinho.service';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { Router, RouterModule } from '@angular/router';

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
  carregandoPerfil = false;

  erroLogin = '';
  sucessoLogin = '';

  erroRegister = '';
  sucessoRegister = '';

  mensagemPerfil = '';
  tipoMensagemPerfil = '';

  itensCarrinho: any[] = [];
  totalCart = 0;
  nomeUsuario = '';

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
  private auth: AuthService,
  private api: ApiService,
  private router: Router
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

    if (changes['modalAberto'] && this.modalAberto === 'profileWelcome') {
      this.carregarNomeUsuario();
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
    this.carregarNomeUsuario();
    this.modalAberto = 'profileWelcome';
  }

  abrirProfileEdit(): void {
    this.modalAberto = 'profileEdit';
    this.carregarDadosPerfil();
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
        nome: this.registerData.nome || '',
        sobrenome: this.registerData.sobrenome || '',
        email
      })
    );
    this.carregarNomeUsuario();
  }

  submitLogin(): void {
  this.carregando = true;
  this.erroLogin = '';
  this.sucessoLogin = '';

  this.auth.login(this.loginData.email, this.loginData.senha).subscribe({
    next: () => {
      this.carregando = false;
      this.sucessoLogin = 'Login realizado com sucesso!';
      this.carrinho.carregarCarrinho();
      this.carregarNomeUsuario();

      setTimeout(() => {
        this.sucessoLogin = '';
        this.fechar();
        if (this.auth.isAdmin()) {
          this.router.navigate(['/admin']);
        } else {
          this.modalAberto = 'profileWelcome';
        }
      }, 1500);
    },
    error: (err) => {
      this.carregando = false;
      this.erroLogin = err.error?.erro || 'E-mail ou senha incorretos.';
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
      error: (err) => {
       this.carregando = false;
       this.erroRegister = err.error?.erro || 'Erro ao criar conta. Tente novamente.';
      }
    });
  }

  salvarPerfil(): void {
    this.carregando = true;
    this.mensagemPerfil = '';

    const usuarioLogado = this.obterUsuarioLocal();
    const dadosPerfil = {
      nome: this.profileData.nome,
      sobrenome: this.profileData.sobrenome,
      email: this.profileData.email,
      cpf: this.profileData.cpf,
      telefone: this.profileData.telefone,
      sexo: this.profileData.sexo,
      dataNascimento: this.montarDataNascimento()
    };

    if (usuarioLogado?.id && localStorage.getItem('token')) {
      this.api.updateUsuario(usuarioLogado.id, dadosPerfil).subscribe({
        next: (usuarioAtualizado) => {
          this.atualizarUsuarioLocal(this.normalizarUsuario(usuarioAtualizado) || dadosPerfil);
          this.carregando = false;
          this.tipoMensagemPerfil = 'sucesso';
          this.mensagemPerfil = 'Informações atualizadas com sucesso!';
        },
        error: () => {
          this.atualizarUsuarioLocal(dadosPerfil);
          this.carregando = false;
          this.tipoMensagemPerfil = 'erro';
          this.mensagemPerfil = 'Não foi possível atualizar no banco agora. Dados mantidos localmente.';
        }
      });

      return;
    }

    setTimeout(() => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      localStorage.setItem(
        'user',
        JSON.stringify({
          ...user,
          nome: this.profileData.nome,
          sobrenome: this.profileData.sobrenome,
          email: this.profileData.email,
          telefone: this.profileData.telefone,
          cpf: this.profileData.cpf,
          sexo: this.profileData.sexo,
          dataNascimento: this.montarDataNascimento()
        })
      );

      this.carregarNomeUsuario();
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
    this.mensagemPerfil = '';
    const usuarioLocal = this.obterUsuarioLocal();

    if (usuarioLocal) {
      this.preencherPerfil(usuarioLocal);
    }

    if (!usuarioLocal?.id || !localStorage.getItem('token')) {
      return;
    }

    this.carregandoPerfil = true;

    this.api.getUsuarioById(usuarioLocal.id).subscribe({
      next: (resposta) => {
        const usuarioBanco = this.normalizarUsuario(resposta);
        this.preencherPerfil(usuarioBanco);
        this.atualizarUsuarioLocal(usuarioBanco);
        this.carregandoPerfil = false;
      },
      error: () => {
        this.carregandoPerfil = false;
        this.tipoMensagemPerfil = 'erro';
        this.mensagemPerfil = 'Não foi possível carregar os dados do banco agora.';
      }
    });
  }

  carregarNomeUsuario(): void {
    const usuario = this.obterUsuarioLocal();

    if (!usuario) {
      this.nomeUsuario = '';
      return;
    }

    const nomeCompleto = [usuario.nome, usuario.sobrenome]
      .filter(Boolean)
      .join(' ')
      .trim();

    this.nomeUsuario = nomeCompleto || usuario.email || '';
  }

  private obterUsuarioLocal(): any {
    const user = localStorage.getItem('user');

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }

  private atualizarUsuarioLocal(dados: any): void {
    const user = this.obterUsuarioLocal() || {};

    localStorage.setItem(
      'user',
      JSON.stringify({
        ...user,
        ...dados
      })
    );

    this.carregarNomeUsuario();
  }

  private preencherPerfil(usuario: any): void {
    this.profileData.nome = usuario?.nome || '';
    this.profileData.sobrenome = usuario?.sobrenome || '';
    this.profileData.sexo = usuario?.sexo || '';
    this.profileData.cpf = usuario?.cpf || '';
    this.profileData.telefone = usuario?.telefone || '';
    this.profileData.email = usuario?.email || '';
    this.profileData.senha = '';

    this.preencherDataNascimento(usuario?.dataNascimento || usuario?.nascimento);
  }

  private normalizarUsuario(resposta: any): any {
    return resposta?.usuario || resposta?.user || resposta;
  }

  private preencherDataNascimento(dataNascimento?: string): void {
    if (!dataNascimento) {
      this.profileData.dia = '';
      this.profileData.mes = '';
      this.profileData.ano = '';
      return;
    }

    const [ano, mes, dia] = dataNascimento.split('T')[0].split('-');
    this.profileData.ano = ano || '';
    this.profileData.mes = mes || '';
    this.profileData.dia = dia || '';
  }

  private montarDataNascimento(): string {
    const { ano, mes, dia } = this.profileData;

    return [ano, mes, dia].filter(Boolean).join('-');
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

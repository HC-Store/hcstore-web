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
  | 'forgotPassword'
  | 'forgotCode'
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
  styleUrls: ['./modals.component.css']
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
  resetandoSenha = false;

  erroRecuperacao = '';
  sucessoRecuperacao = '';
  carregandoRecuperacao = false;
  emailNaoCadastrado = false;
  codigoGerado = '';
  usuarioRecuperacao: any = null;

  itensCarrinho: any[] = [];
  totalCart = 0;
  nomeUsuario = '';

  loginData = {
    email: '',
    senha: ''
  };

  forgotData = {
    email: '',
    codigo: ''
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
    this.resetarRecuperacaoSenha();
    this.modalAberto = 'register';
  }

  abrirCadastroRecuperacao(): void {
    const email = this.forgotData.email.trim().toLowerCase();
    this.resetarRecuperacaoSenha();
    this.registerData.email = email;
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
    this.resetandoSenha = false;
    this.modalAberto = 'profileEdit';
    this.carregarDadosPerfil();
  }

  abrirEsqueciSenha(): void {
    this.erroLogin = '';
    this.sucessoLogin = '';
    this.resetarRecuperacaoSenha();
    this.modalAberto = 'forgotPassword';
  }

  fechar(): void {
    this.modalAberto = null;
    this.resetandoSenha = false;
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

  enviarCodigoRecuperacao(): void {
    const email = this.forgotData.email.trim().toLowerCase();
    this.erroRecuperacao = '';
    this.sucessoRecuperacao = '';
    this.emailNaoCadastrado = false;

    if (!email) {
      this.erroRecuperacao = 'Informe o e-mail usado para entrar.';
      return;
    }

    this.carregandoRecuperacao = true;

    this.api.enviarCodigoRecuperacao({ email }).subscribe({
      next: (resposta) => {
        this.carregandoRecuperacao = false;

        this.usuarioRecuperacao = this.normalizarUsuario(resposta) || { email };
        this.codigoGerado = '';
        this.forgotData.codigo = '';
        this.sucessoRecuperacao = 'Código enviado para seu e-mail.';
        this.modalAberto = 'forgotCode';
      },
      error: (err) => {
        this.carregandoRecuperacao = false;
        if (this.rotaRecuperacaoIndisponivel(err)) {
          this.erroRecuperacao = 'Recuperação de senha ainda não configurada no servidor.';
          return;
        }
        if (err.status === 404) {
          this.emailNaoCadastrado = true;
          this.erroRecuperacao = 'E-mail não cadastrado.';
          return;
        }
        this.erroRecuperacao = 'Não foi possível validar o e-mail agora.';
      }
    });
  }

  confirmarCodigoRecuperacao(): void {
    this.erroRecuperacao = '';
    this.sucessoRecuperacao = '';
    this.emailNaoCadastrado = false;

    const email = this.forgotData.email.trim().toLowerCase();
    const codigo = this.forgotData.codigo.trim();

    if (!codigo) {
      this.erroRecuperacao = 'Informe o código recebido por e-mail.';
      return;
    }

    this.carregandoRecuperacao = true;

    this.api.confirmarCodigoRecuperacao({ email, codigo }).subscribe({
      next: (resposta) => {
        const usuario = this.normalizarUsuario(resposta);
        this.usuarioRecuperacao = usuario;
        this.resetandoSenha = true;
        this.tipoMensagemPerfil = '';
        this.mensagemPerfil = 'Confira seus dados e defina uma nova senha.';
        localStorage.setItem('user', JSON.stringify(usuario));
        this.preencherPerfil(usuario);
        this.carregandoRecuperacao = false;
        this.modalAberto = 'profileEdit';
      },
      error: (err) => {
        this.carregandoRecuperacao = false;
        this.erroRecuperacao = err.error?.erro || err.error?.error || 'Código inválido. Confira e tente novamente.';
      }
    });
    return;

    if (this.forgotData.codigo.trim() !== this.codigoGerado) {
      this.erroRecuperacao = 'Código inválido. Confira e tente novamente.';
      return;
    }

    this.resetandoSenha = true;
    this.tipoMensagemPerfil = '';
    this.mensagemPerfil = 'Confira seus dados e defina uma nova senha.';
    localStorage.setItem('user', JSON.stringify(this.usuarioRecuperacao));
    this.preencherPerfil(this.usuarioRecuperacao);
    this.modalAberto = 'profileEdit';
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
      dataNascimento: this.montarDataNascimento(),
      ...(this.profileData.senha ? { senha: this.profileData.senha } : {})
    };

    if (this.resetandoSenha && !this.profileData.senha) {
      this.carregando = false;
      this.tipoMensagemPerfil = 'erro';
      this.mensagemPerfil = 'Informe uma nova senha para continuar.';
      return;
    }

    if (this.resetandoSenha) {
      this.api.redefinirSenha({
        email: this.forgotData.email.trim().toLowerCase(),
        codigo: this.forgotData.codigo.trim(),
        senha: this.profileData.senha
      }).subscribe({
        next: () => {
          this.carregando = false;
          this.tipoMensagemPerfil = 'sucesso';
          this.mensagemPerfil = 'Senha redefinida com sucesso! Entre com sua nova senha.';
          this.resetandoSenha = false;
          localStorage.removeItem('usuarioLogado');
          localStorage.removeItem('token');

          setTimeout(() => {
            this.modalAberto = 'login';
          }, 1500);
        },
        error: (err) => {
          this.carregando = false;
          this.tipoMensagemPerfil = 'erro';
          this.mensagemPerfil = err.error?.erro || err.error?.error || 'Não foi possível redefinir a senha agora.';
        }
      });
      return;
    }

    if (usuarioLogado?.id && (localStorage.getItem('token') || this.resetandoSenha)) {
      this.api.updateUsuario(usuarioLogado.id, dadosPerfil).subscribe({
        next: (usuarioAtualizado) => {
          this.atualizarUsuarioLocal(this.normalizarUsuario(usuarioAtualizado) || dadosPerfil);
          this.carregando = false;
          this.tipoMensagemPerfil = 'sucesso';
          if (this.resetandoSenha) {
            this.mensagemPerfil = 'Senha redefinida com sucesso! Entre com sua nova senha.';
            this.resetandoSenha = false;
            localStorage.removeItem('usuarioLogado');
            localStorage.removeItem('token');

            setTimeout(() => {
              this.modalAberto = 'login';
            }, 1500);
            return;
          }
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
    if (this.resetandoSenha) {
      this.resetandoSenha = false;
      this.modalAberto = 'login';
      return;
    }

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

  private rotaRecuperacaoIndisponivel(err: any): boolean {
    const erro = typeof err?.error === 'string' ? err.error : '';
    return err?.status === 404 && erro.includes('Cannot POST /api/auth/forgot-password');
  }

  private normalizarLista(resposta: any): any[] {
    if (Array.isArray(resposta)) return resposta;
    if (Array.isArray(resposta?.data)) return resposta.data;
    if (Array.isArray(resposta?.usuarios)) return resposta.usuarios;
    if (Array.isArray(resposta?.users)) return resposta.users;
    return [];
  }

  private gerarCodigoRecuperacao(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private resetarRecuperacaoSenha(): void {
    this.forgotData = { email: '', codigo: '' };
    this.erroRecuperacao = '';
    this.sucessoRecuperacao = '';
    this.codigoGerado = '';
    this.usuarioRecuperacao = null;
    this.resetandoSenha = false;
    this.emailNaoCadastrado = false;
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
    this.itensCarrinho = this.carrinho.itensSnapshot;
    this.calcularTotal();
  }

  diminuirQtd(item: any): void {
    this.carrinho.diminuirQuantidade(item);
    this.itensCarrinho = this.carrinho.itensSnapshot;
    this.calcularTotal();
  }

  calcularTotal(): void {
    this.totalCart = this.itensCarrinho.reduce((acc, item) => {
      return acc + this.precoProdutoCarrinho(item) * Number(item.quantidade || 1);
    }, 0);
  }

  imagemProdutoCarrinho(item: any): string {
    const produto = item?.produto || {};

    return (
      produto.imagens?.[0]?.url ||
      produto.imagens?.[0] ||
      produto.produtoImagem?.[0]?.url ||
      produto.produtoImagem?.[0] ||
      produto.imagem ||
      produto.imagem2 ||
      produto.imagem3 ||
      'assets/img/sem-imagem.png'
    );
  }

  nomeProdutoCarrinho(item: any): string {
    return item?.produto?.nome || item?.nome || 'Produto';
  }

  precoProdutoCarrinho(item: any): number {
    return Number(item?.produto?.preco || item?.preco || 0);
  }

  categoriaProdutoCarrinho(item: any): string {
    const categoria = item?.produto?.categoria;

    if (categoria?.nome) {
      return categoria.nome;
    }

    if (typeof categoria === 'string') {
      return categoria;
    }

    return 'Produto';
  }

  tamanhoProdutoCarrinho(item: any): string {
    return item?.tamanho || item?.produto?.tamanhoSelecionado || item?.produto?.selectedSize || this.tamanhoUnicoProduto(item);
  }

  private tamanhoUnicoProduto(item: any): string {
    const tamanho = item?.produto?.tamanho;

    if (Array.isArray(tamanho) && tamanho.length === 1) {
      return String(tamanho[0]);
    }

    if (typeof tamanho === 'string') {
      const tamanhos = tamanho.split(',').map(itemTamanho => itemTamanho.trim()).filter(Boolean);
      if (tamanhos.length === 1) {
        return tamanhos[0];
      }
    }

    const quantidadePorTamanho = item?.produto?.quantidadePorTamanho;

    if (quantidadePorTamanho && typeof quantidadePorTamanho === 'object') {
      const tamanhos = Object.keys(quantidadePorTamanho);
      if (tamanhos.length === 1) {
        return tamanhos[0];
      }
    }

    if (typeof quantidadePorTamanho === 'string') {
      try {
        const tamanhos = Object.keys(JSON.parse(quantidadePorTamanho));
        if (tamanhos.length === 1) {
          return tamanhos[0];
        }
      } catch {
        return 'Único';
      }
    }

    return 'Único';
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

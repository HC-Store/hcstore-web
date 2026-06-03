import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { ModalsComponent } from '../../components/modals/modals.component';
import { ApiService } from '../../services/api.service';
import { CarrinhoService } from '../../services/carrinho.service';

type ModalTipo =
  | 'login'
  | 'register'
  | 'cart'
  | 'profileWelcome'
  | 'profileEdit'
  | null;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    ModalsComponent
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  modalAberto: ModalTipo = null;

  carregando = false;
  erro = '';
  sucesso = '';

  tipoEntrega: 'SEDEX' | 'MOTOBOY' = 'SEDEX';
  cupom = '';
  desconto = 0;

  formData = {
    email: '',
    telefone: '',
    nome: '',
    sobrenome: '',
    cep: '',
    endereco: '',
    bairro: '',
    cidade: '',
    estado: '',
    casaApartamento: '',
    numeroBloco: ''
  };

  itensCarrinho: any[] = [];

  constructor(
    private api: ApiService,
    private carrinho: CarrinhoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carrinho.itens.subscribe(itens => {
      this.itensCarrinho = itens;
    });

    this.carregarDadosUsuarioLogado();
  }

  carregarDadosUsuarioLogado(): void {
    const user = this.obterUsuarioLocal();

    this.preencherDadosUsuario(user);

    if (!user?.id || !localStorage.getItem('token')) return;

    this.api.getUsuarioById(user.id).subscribe({
      next: (resposta) => {
        const usuarioBanco = this.normalizarUsuario(resposta);

        this.preencherDadosUsuario(usuarioBanco);

        localStorage.setItem(
          'user',
          JSON.stringify({
            ...user,
            ...usuarioBanco
          })
        );
      },
      error: () => {
        console.warn('Nao foi possivel carregar os dados do usuario pelo banco.');
      }
    });
  }

  preencherDadosUsuario(user: any): void {
    if (!user) return;

    this.formData.email = user.email || this.formData.email;
    this.formData.telefone = user.telefone || this.formData.telefone;
    this.formData.nome = user.nome || this.formData.nome;
    this.formData.sobrenome = user.sobrenome || this.formData.sobrenome;
  }

  obterUsuarioLocal(): any {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }

  normalizarUsuario(resposta: any): any {
    return resposta?.usuario || resposta?.user || resposta;
  }

  abrirLogin(): void {
    const usuario = localStorage.getItem('usuarioLogado');
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    this.modalAberto = usuario === 'true' || token || user
      ? 'profileWelcome'
      : 'login';
  }

  abrirCart(): void {
    this.modalAberto = 'cart';
  }

  fecharModal(): void {
    this.modalAberto = null;
  }

  get subtotal(): number {
    return this.itensCarrinho.reduce((total, item) => {
      return total + Number(item.produto?.preco || 0) * Number(item.quantidade || 1);
    }, 0);
  }

  get frete(): number {
    if (this.subtotal >= 200) return 0;
    return this.tipoEntrega === 'MOTOBOY' ? 15 : 25;
  }

  get total(): number {
    return this.subtotal + this.frete - this.desconto;
  }

  aplicarCupom(): void {
    const codigo = this.cupom.trim().toUpperCase();

    if (!codigo) {
      this.erro = 'Digite um cupom.';
      return;
    }

    this.api.validarCupom({
      codigo,
      subtotal: this.subtotal
    }).subscribe({
      next: (res: any) => {
        this.desconto = Number(res.desconto || 0);
        this.cupom = res.codigo || codigo;
        this.sucesso = 'Cupom aplicado com sucesso!';
        this.erro = '';
      },
      error: (err) => {
        this.desconto = 0;
        this.sucesso = '';
        this.erro = err.error?.error || 'Cupom inválido.';
      }
    });
  }

  formatPrice(value: number): string {
    return 'R$' + Number(value || 0).toFixed(2).replace('.', ',');
  }

  async buscarCep(): Promise<void> {
    const cep = this.formData.cep.replace(/\D/g, '');

    if (cep.length !== 8) {
      alert('CEP inválido');
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const dados = await response.json();

      if (dados.erro) {
        alert('CEP não encontrado');
        return;
      }

      this.formData.endereco = dados.logradouro || '';
      this.formData.bairro = dados.bairro || '';
      this.formData.cidade = dados.localidade || '';
      this.formData.estado = dados.uf || '';
    } catch {
      alert('Erro ao buscar CEP');
    }
  }

  finalizarCompra(): void {
    const {
      email,
      telefone,
      nome,
      sobrenome,
      cep,
      endereco,
      bairro,
      cidade,
      estado,
      numeroBloco
    } = this.formData;

    if (
      !email.trim() ||
      !telefone.trim() ||
      !nome.trim() ||
      !sobrenome.trim() ||
      !cep.trim() ||
      !endereco.trim() ||
      !cidade.trim() ||
      !estado.trim() ||
      !numeroBloco.trim()
    ) {
      this.erro = 'Preencha todos os campos obrigatórios.';
      return;
    }

    if (this.itensCarrinho.length === 0) {
      this.erro = 'Seu carrinho está vazio.';
      return;
    }

    const user = this.obterUsuarioLocal();

    if (!user?.id) {
      this.erro = 'Faça login para finalizar a compra.';
      return;
    }

    this.carregando = true;
    this.erro = '';

    this.api.createEndereco({
      rua: `${endereco}, ${bairro}`,
      numero: numeroBloco,
      cidade,
      estado,
      cep,
      usuarioId: user.id
    }).subscribe({
      next: (enderecoSalvo: any) => {
        this.api.createPedido({
          usuarioId: user.id,
          enderecoId: enderecoSalvo.id,
          tipoEntrega: this.tipoEntrega,
          frete: this.frete,
          desconto: this.desconto,
          cupomCodigo: this.cupom || null,
          totalFinal: this.total
        }).subscribe({
          next: () => {
            this.carregando = false;
            this.sucesso = 'Pedido realizado com sucesso!';

            this.carrinho.carregarCarrinho();

            setTimeout(() => {
              this.router.navigate(['/pagamento']);
            }, 2000);
          },
          error: (err) => {
            this.carregando = false;
            this.erro = err.error?.error || 'Erro ao criar pedido.';
          }
        });
      },
      error: (err) => {
        this.carregando = false;
        this.erro = err.error?.error || 'Erro ao salvar endereço.';
      }
    });
  }
}

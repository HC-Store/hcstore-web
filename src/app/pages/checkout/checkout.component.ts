import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { ModalsComponent } from '../../components/modals/modals.component';
import { ApiService } from '../../services/api.service';
import { CarrinhoService } from '../../services/carrinho.service';

type ModalTipo = 'login' | 'register' | 'cart' | null;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent, ModalsComponent],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  modalAberto: ModalTipo = null;
  carregando = false;
  erro = '';
  sucesso = '';

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

    // pré-preenche email e telefone do usuário logado
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.email) this.formData.email = user.email;
    if (user.telefone) this.formData.telefone = user.telefone;
    if (user.nome) this.formData.nome = user.nome;
    if (user.sobrenome) this.formData.sobrenome = user.sobrenome;
  }

  abrirLogin(): void { this.modalAberto = 'login'; }
  abrirCart(): void { this.modalAberto = 'cart'; }
  fecharModal(): void { this.modalAberto = null; }

  get subtotal(): number {
    return this.itensCarrinho.reduce((total, item) => {
      return total + Number(item.produto?.preco || 0) * item.quantidade;
    }, 0);
  }

  get total(): number {
    return this.subtotal;
  }

  formatPrice(value: number): string {
    return 'R$' + value.toFixed(2).replace('.', ',');
  }

  async buscarCep(): Promise<void> {
    const cep = this.formData.cep.replace(/\D/g, '');
    if (cep.length !== 8) { alert('CEP inválido'); return; }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const dados = await response.json();
      if (dados.erro) { alert('CEP não encontrado'); return; }
      this.formData.endereco = dados.logradouro || '';
      this.formData.bairro = dados.bairro || '';
      this.formData.cidade = dados.localidade || '';
      this.formData.estado = dados.uf || '';
    } catch {
      alert('Erro ao buscar CEP');
    }
  }

  finalizarCompra(): void {
    const { email, telefone, nome, sobrenome, cep, endereco, bairro, cidade, estado, casaApartamento, numeroBloco } = this.formData;

    if (!email.trim() || !telefone.trim() || !nome.trim() || !sobrenome.trim() ||
        !cep.trim() || !endereco.trim() || !cidade.trim() || !estado.trim() || !numeroBloco.trim()) {
      this.erro = 'Preencha todos os campos obrigatórios.';
      return;
    }

    if (this.itensCarrinho.length === 0) {
      this.erro = 'Seu carrinho está vazio.';
      return;
    }

    this.carregando = true;
    this.erro = '';

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // 1. Salva o endereço
    this.api.createEndereco({
      rua: `${endereco}, ${bairro}`,
      numero: numeroBloco,
      cidade,
      estado,
      cep,
      usuarioId: user.id
    }).subscribe({
      next: (enderecoSalvo: any) => {

        // 2. Cria o pedido com o enderecoId retornado
        this.api.createPedido({
          usuarioId: user.id,
          enderecoId: enderecoSalvo.id
        }).subscribe({
          next: () => {
            this.carregando = false;
            this.sucesso = 'Pedido realizado com sucesso!';
            this.carrinho.carregarCarrinho(); // atualiza carrinho
            setTimeout(() => this.router.navigate(['/pagamento']), 2000);
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
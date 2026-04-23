import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { ModalsComponent } from '../../components/modals/modals.component';

interface CheckoutItem {
  name: string;
  price: number;
  size?: string;
  qty: number;
  category?: string;
  image?: string;
}

type ModalTipo = 'login' | 'register' | 'cart' | null;

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
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent {
  modalAberto: ModalTipo = null;

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

  checkoutData: CheckoutItem[] = JSON.parse(localStorage.getItem('checkoutData') || '[]');

  abrirLogin(): void {
    this.modalAberto = 'login';
  }

  abrirCart(): void {
    this.modalAberto = 'cart';
  }

  fecharModal(): void {
    this.modalAberto = null;
  }

  get subtotal(): number {
    return this.checkoutData.reduce((total, item) => total + item.price * item.qty, 0);
  }

  get total(): number {
    return this.subtotal;
  }

  formatPrice(value: number): string {
    return 'R$' + value.toFixed(2).replace('.', ',');
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
      casaApartamento,
      numeroBloco
    } = this.formData;

    if (
      !email.trim() ||
      !telefone.trim() ||
      !nome.trim() ||
      !sobrenome.trim() ||
      !cep.trim() ||
      !endereco.trim() ||
      !bairro.trim() ||
      !cidade.trim() ||
      !estado.trim() ||
      !casaApartamento.trim() ||
      !numeroBloco.trim()
    ) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    localStorage.setItem('paymentData', JSON.stringify(this.checkoutData));
    localStorage.setItem('shippingData', JSON.stringify(this.formData));
    alert('Dados do checkout salvos com sucesso.');
  }
}

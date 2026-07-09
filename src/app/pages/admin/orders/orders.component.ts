import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [NgFor, NgIf, CommonModule, FormsModule, DatePipe],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {

  pedidos: any[] = [];
  pedidoSelecionado: any = null;

  carregando = false;
  erro = '';
  sucesso = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.carregarPedidos();
  }

  carregarPedidos(): void {
    this.carregando = true;

    this.api.getPedidos().subscribe({
      next: (res) => {
        this.pedidos = Array.isArray(res) ? res : [];
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Erro ao carregar pedidos.';
        this.carregando = false;
      }
    });
  }

  verDetalhes(pedido: any): void {
    this.pedidoSelecionado = pedido;
  }

  fecharDetalhes(): void {
    this.pedidoSelecionado = null;
  }

  atualizarStatus(pedido: any, status: string): void {
    if (!status) return;

    this.api.updatePedido(pedido.id, { status }).subscribe({
      next: () => {
        pedido.status = status;
        this.sucesso = `Pedido #${pedido.id} atualizado para ${status}!`;
        setTimeout(() => this.sucesso = '', 3000);
      },
      error: () => this.erro = 'Erro ao atualizar status.'
    });
  }

  copiarTexto(texto: string): void {
    navigator.clipboard.writeText(texto || '');
    this.sucesso = 'Copiado!';
    setTimeout(() => this.sucesso = '', 2000);
  }

  enderecoCompleto(pedido: any): string {
    const e = pedido?.endereco;

    if (!e) return 'Endereço não informado.';

    return `${e.rua}, Nº ${e.numero} - ${e.cidade}/${e.estado} - CEP: ${e.cep}`;
  }

  abrirWhatsApp(pedido: any): void {
    const telefone = String(pedido?.usuario?.telefone || '').replace(/\D/g, '');

    if (!telefone) {
      this.erro = 'Cliente sem telefone cadastrado.';
      return;
    }

    const mensagem = `Olá, ${pedido.usuario?.nome || ''}! Recebemos seu pedido #${pedido.id} na HC Store. Já estamos separando e embalando seu produto.`;

    window.open(`https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`, '_blank');
  }
}

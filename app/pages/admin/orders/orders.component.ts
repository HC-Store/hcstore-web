import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [NgFor, NgIf, CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {

  pedidos: any[] = [];
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
        this.pedidos = res;
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Erro ao carregar pedidos.';
        this.carregando = false;
      }
    });
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
}

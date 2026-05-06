import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [NgFor, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent {
  statusSelecionado = '';

  pedidos = [
    { id: 25426, produto: 'Tênis Adidas Ultra boost', data: '2026-03-08', pagamento: 'Cartão', cliente: 'João Silva', status: 'Entregue', preco: 599.99 },
    { id: 25427, produto: 'Camiseta Nike Dry-Fit', data: '2026-05-02', pagamento: 'Pix', cliente: 'Maria Souza', status: 'Pendente', preco: 129.99 },
    { id: 25428, produto: 'Moletom Puma', data: '2026-03-04', pagamento: 'Pix', cliente: 'Lucas Correa', status: 'Pendente', preco: 199.99 },
    { id: 25429, produto: 'Calça moletom Mizuno', data: '2026-02-25', pagamento: 'Cartão', cliente: 'Rafael Alves', status: 'Entregue', preco: 119.99 },
    { id: 25430, produto: 'Tênis Nike Air-Max', data: '2026-05-02', pagamento: 'Pix', cliente: 'Fernando Souza', status: 'Pendente', preco: 1329.99 }
  ];
}

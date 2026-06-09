import { Component, AfterViewInit, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { NgFor, NgIf, isPlatformBrowser } from '@angular/common';
import Chart from 'chart.js/auto';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../../services/api.service';

interface DashboardProduct {
  id: number;
  name: string;
  price: number;
  sales: number;
  image: string;
}

interface DashboardOrder {
  product: string;
  id: number;
  date: string;
  name: string;
  status: string;
  price: number;
}

interface DashboardMetric {
  label: string;
  value: string;
  percent: number;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private api = inject(ApiService);

  chart: Chart | null = null;
  isBrowser = isPlatformBrowser(this.platformId);
  loading = false;
  error = '';

  products: DashboardProduct[] = [];
  orders: DashboardOrder[] = [];
  metrics: DashboardMetric[] = [
    { label: 'Pedidos pagos', value: '0%', percent: 0, color: '#ff6b6b' },
    { label: 'Entregues', value: '0%', percent: 0, color: '#25df14' },
    { label: 'Cancelados', value: '0%', percent: 0, color: '#3b82f6' }
  ];
  totals = {
    revenue: 0,
    orders: 0,
    products: 0,
    users: 0,
    lowStock: 0
  };
  showReport = false;

  private monthlySales = new Array(12).fill(0);

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.createChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      produtos: this.api.getProdutos().pipe(catchError(() => of([]))),
      pedidos: this.api.getPedidos().pipe(catchError(() => of([]))),
      usuarios: this.api.getUsuarios().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ produtos, pedidos, usuarios }) => {
        const productList = this.normalizeList(produtos);
        const orderList = this.normalizeList(pedidos);
        const userList = this.normalizeList(usuarios);

        this.totals = {
          revenue: this.calculateRevenue(orderList),
          orders: orderList.length,
          products: productList.length,
          users: userList.length,
          lowStock: productList.filter((product) => Number(product.estoque ?? 0) <= 3).length
        };

        this.products = this.buildBestSellers(productList, orderList);
        this.orders = this.buildRecentOrders(orderList);
        this.metrics = this.buildMetrics(orderList);
        this.monthlySales = this.buildMonthlySales(orderList);
        this.loading = false;
        this.updateChart();
      },
      error: () => {
        this.error = 'Erro ao carregar dados do dashboard.';
        this.loading = false;
      }
    });
  }

  openReport(): void {
    this.showReport = true;
  }

  closeReport(): void {
    this.showReport = false;
  }

  createChart(): void {
    const canvas = document.getElementById('salesChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.chart?.destroy();

    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [{
          label: 'Faturamento',
          data: this.monthlySales.slice(0, 6),
          backgroundColor: '#25df14',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: '#eee' } }
        }
      }
    });
  }

  updateChart(): void {
    if (!this.isBrowser) return;

    if (!this.chart) {
      setTimeout(() => this.createChart());
      return;
    }

    this.chart.data.datasets[0].data = this.monthlySales.slice(0, 6);
    this.chart.update();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value || 0));
  }

  metricBackground(metric: DashboardMetric): string {
    return `conic-gradient(${metric.color} ${metric.percent}%, #eee 0)`;
  }

  statusClass(status: string): string {
    const normalized = this.normalizeStatus(status);

    if (normalized === 'ENTREGUE' || normalized === 'PAGO' || normalized === 'ENVIADO') {
      return 'delivered';
    }

    if (normalized === 'CANCELADO') {
      return 'canceled';
    }

    return 'pending';
  }

  private normalizeList(value: any): any[] {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.items)) return value.items;
    return [];
  }

  private buildBestSellers(products: any[], orders: any[]): DashboardProduct[] {
    const salesByProduct = new Map<number, number>();

    orders.forEach((order) => {
      this.normalizeList(order.itempedido).forEach((item) => {
        const id = Number(item.produtoId ?? item.produto?.id);
        const quantity = Number(item.quantidade ?? 0);

        if (id) {
          salesByProduct.set(id, (salesByProduct.get(id) || 0) + quantity);
        }
      });
    });

    return products
      .map((product) => ({
        id: Number(product.id),
        name: product.nome,
        price: Number(product.preco ?? 0),
        sales: salesByProduct.get(Number(product.id)) || 0,
        image: product.imagens?.[0]?.url || product.imagem || 'assets/img/HC STORE.png'
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }

  private buildRecentOrders(orders: any[]): DashboardOrder[] {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 8)
      .map((order) => {
        const items = this.normalizeList(order.itempedido);
        const productNames = items
          .map((item) => item.produto?.nome)
          .filter(Boolean);
        const userName = [order.usuario?.nome, order.usuario?.sobrenome].filter(Boolean).join(' ');

        return {
          product: productNames.length ? productNames.join(', ') : 'Pedido sem itens',
          id: Number(order.id),
          date: this.formatDate(order.createdAt),
          name: userName || 'Cliente',
          status: this.normalizeStatus(order.status),
          price: Number(order.totalFinal ?? order.total ?? 0)
        };
      });
  }

  private buildMetrics(orders: any[]): DashboardMetric[] {
    const total = orders.length || 1;
    const countByStatus = (status: string) =>
      orders.filter((order) => this.normalizeStatus(order.status) === status).length;

    return [
      this.createMetric('Pedidos pagos', countByStatus('PAGO'), total, '#ff6b6b'),
      this.createMetric('Entregues', countByStatus('ENTREGUE'), total, '#25df14'),
      this.createMetric('Cancelados', countByStatus('CANCELADO'), total, '#3b82f6')
    ];
  }

  private createMetric(label: string, value: number, total: number, color: string): DashboardMetric {
    const percent = Math.round((value / total) * 100);

    return {
      label,
      value: `${percent}%`,
      percent,
      color
    };
  }

  private buildMonthlySales(orders: any[]): number[] {
    const months = new Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    orders
      .filter((order) => this.normalizeStatus(order.status) !== 'CANCELADO')
      .forEach((order) => {
        const date = new Date(order.createdAt);
        if (Number.isNaN(date.getTime()) || date.getFullYear() !== currentYear) return;
        months[date.getMonth()] += Number(order.totalFinal ?? order.total ?? 0);
      });

    return months;
  }

  private calculateRevenue(orders: any[]): number {
    return orders
      .filter((order) => this.normalizeStatus(order.status) !== 'CANCELADO')
      .reduce((sum, order) => sum + Number(order.totalFinal ?? order.total ?? 0), 0);
  }

  private normalizeStatus(status: string): string {
    return (status || 'PENDENTE').toString().toUpperCase();
  }

  private formatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return new Intl.DateTimeFormat('pt-BR').format(date);
  }
}

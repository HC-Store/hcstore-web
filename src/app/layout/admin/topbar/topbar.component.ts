import { Component, HostListener, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

interface Notificacao {
  id: string;
  text: string;
  rota: string;
  read: boolean;
}

const CHAVE_LIDAS = 'hcAdminNotificacoesLidas';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {

  // 📍 Página atual (breadcrumb)
  currentPage = 'DASHBOARD';

  // 🔍 BUSCA
  showSearch = false;
  searchTerm = '';

  // 🔔 NOTIFICAÇÕES (geradas a partir dos pedidos e do estoque)
  showNotifications = false;
  notifications: Notificacao[] = [];

  // 👤 ADMIN MENU
  showAdminMenu = false;

  constructor(
    private router: Router,
    private api: ApiService,
    private auth: AuthService
  ) {
    this.updatePage();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.updatePage());
  }

  ngOnInit(): void {
    this.carregarNotificacoes();
  }

  // 🔍 ABRIR / FECHAR BUSCA
  toggleSearch() {
    this.showSearch = !this.showSearch;
  }

  // 🔍 AÇÃO DE BUSCA
  search() {
    const termo = this.searchTerm.trim();

    this.router.navigate(['/admin/produtos'], {
      queryParams: termo ? { q: termo } : {}
    });
  }

  // 🔔 NOTIFICAÇÕES
  toggleNotifications() {
    this.showNotifications = !this.showNotifications;

    if (this.showNotifications) {
      this.carregarNotificacoes();
    }
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  abrirNotificacao(notification: Notificacao) {
    notification.read = true;
    this.salvarLidas();
    this.showNotifications = false;
    this.router.navigate([notification.rota]);
  }

  marcarTodasComoLidas() {
    this.notifications.forEach(n => n.read = true);
    this.salvarLidas();
  }

  private carregarNotificacoes() {
    forkJoin({
      pedidos: this.api.getPedidos().pipe(catchError(() => of([]))),
      produtos: this.api.getProdutosAdmin().pipe(catchError(() => of([])))
    }).subscribe(({ pedidos, produtos }) => {
      const lidas = new Set(this.lerLidas());

      this.notifications = [
        ...this.notificacoesDePedidos(Array.isArray(pedidos) ? pedidos : []),
        ...this.notificacoesDeEstoque(Array.isArray(produtos) ? produtos : [])
      ].map(n => ({ ...n, read: lidas.has(n.id) }));
    });
  }

  // pedidos que ainda precisam de atenção, do mais novo para o mais antigo
  private notificacoesDePedidos(pedidos: any[]): Omit<Notificacao, 'read'>[] {
    const textos: Record<string, string> = {
      PENDENTE: 'aguardando pagamento',
      PAGO: 'pago, aguardando envio'
    };

    return pedidos
      .filter(p => textos[p.status])
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 10)
      .map(p => ({
        id: `pedido-${p.id}-${p.status}`,
        text: `Pedido #${p.id} ${textos[p.status]}`,
        rota: '/admin/pedidos'
      }));
  }

  // mesmo limite de estoque baixo usado no dashboard (3 ou menos)
  private notificacoesDeEstoque(produtos: any[]): Omit<Notificacao, 'read'>[] {
    return produtos
      .filter(p => p.ativo !== false && Number(p.estoque ?? 0) <= 3)
      .map(p => ({
        id: `estoque-${p.id}-${Number(p.estoque ?? 0)}`,
        text: `Estoque baixo: ${p.nome} (${Number(p.estoque ?? 0)} un.)`,
        rota: '/admin/produtos'
      }));
  }

  private lerLidas(): string[] {
    try {
      const lidas = JSON.parse(localStorage.getItem(CHAVE_LIDAS) || '[]');
      return Array.isArray(lidas) ? lidas : [];
    } catch {
      return [];
    }
  }

  private salvarLidas() {
    const lidas = this.notifications.filter(n => n.read).map(n => n.id);
    localStorage.setItem(CHAVE_LIDAS, JSON.stringify(lidas));
  }

  // 👤 ADMIN MENU
  toggleAdminMenu() {
    this.showAdminMenu = !this.showAdminMenu;
  }

  logout() {
    this.auth.logout();
  }

  // 📍 ATUALIZA NOME DA PÁGINA
  updatePage() {
    const url = this.router.url;

    if (url.includes('/admin/produtos')) this.currentPage = 'PRODUTOS';
    else if (url.includes('/admin/pedidos')) this.currentPage = 'PEDIDOS';
    else if (url.includes('/admin/usuarios')) this.currentPage = 'USUÁRIOS';
    else if (url.includes('/admin/adicionar-produto')) this.currentPage = 'ADICIONAR PRODUTO';
    else if (url.includes('/admin/config-home')) this.currentPage = 'CONFIG HOME';
    else if (url.includes('/admin/config-colecoes')) this.currentPage = 'CONFIG COLEÇÕES';
    else if (url.includes('/admin/cupons')) this.currentPage = 'CUPONS';
    else this.currentPage = 'DASHBOARD';
  }

  // 🔥 FECHAR DROPDOWNS AO CLICAR FORA
  @HostListener('document:click', ['$event'])
  closeOutside(event: any) {

    if (!event.target.closest('.notif-container')) {
      this.showNotifications = false;
    }

    if (!event.target.closest('.admin-container')) {
      this.showAdminMenu = false;
    }

  }

}

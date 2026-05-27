import { Component, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent {

  // 📍 Página atual (breadcrumb)
  currentPage = 'DASHBOARD';

  // 🔍 BUSCA
  showSearch = false;
  searchTerm = '';

  // 🔔 NOTIFICAÇÕES
  showNotifications = false;

  notifications = [
    { text: 'Novo pedido recebido', read: false },
    { text: 'Usuário cadastrado', read: false },
    { text: 'Produto atualizado', read: true }
  ];

  // 👤 ADMIN MENU
  showAdminMenu = false;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.updatePage());
  }

  // 🔍 ABRIR / FECHAR BUSCA
  toggleSearch() {
    this.showSearch = !this.showSearch;
  }

  // 🔍 AÇÃO DE BUSCA
  search() {
    console.log('Buscando:', this.searchTerm);

    this.router.navigate(['/admin/produtos'], {
      queryParams: { q: this.searchTerm }
    });
  }

  // 🔔 NOTIFICAÇÕES
  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(notification: any) {
    notification.read = true;
  }

  // 👤 ADMIN MENU
  toggleAdminMenu() {
    this.showAdminMenu = !this.showAdminMenu;
  }

  logout() {
    console.log('Saindo do sistema...');

    localStorage.removeItem('user');

    this.router.navigate(['/lhome']);
  }

  // 📍 ATUALIZA NOME DA PÁGINA
  updatePage() {
    const url = this.router.url;

    if (url.includes('/admin/produtos')) this.currentPage = 'PRODUTOS';
    else if (url.includes('/admin/pedidos')) this.currentPage = 'PEDIDOS';
    else if (url.includes('/admin/usuarios')) this.currentPage = 'USUÁRIOS';
    else if (url.includes('/admin/adicionar-produto')) this.currentPage = 'ADICIONAR PRODUTO';
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

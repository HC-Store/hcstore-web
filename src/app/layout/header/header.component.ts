import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Output() openLogin = new EventEmitter<void>();
  @Output() openCart = new EventEmitter<void>();

  menuMobileOpen = false;

  toggleMenu(): void {
    this.menuMobileOpen = !this.menuMobileOpen;
  }

  fecharMenu(): void {
    this.menuMobileOpen = false;
  }

  abrirLogin(event?: Event): void {
    event?.preventDefault();
    this.openLogin.emit();
    this.fecharMenu();
  }

  abrirCart(event?: Event): void {
    event?.preventDefault();
    this.openCart.emit();
    this.fecharMenu();
  }
}

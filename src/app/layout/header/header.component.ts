import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, OnInit, HostListener } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProdutosService, Produto } from '../../services/produtos.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Output() openLogin = new EventEmitter<void>();
  @Output() openCart = new EventEmitter<void>();

  menuMobileOpen = false;

  // Autocomplete
  searchQuery = '';
  mobileSearchQuery = '';
  sugestoes: Produto[] = [];
  mostrarSugestoes = false;
  mostrarSugestoesMobile = false;
  private todosProdutos: Produto[] = [];
  private searchSubject = new Subject<string>();

  constructor(private produtosService: ProdutosService, private router: Router) {}

  ngOnInit(): void {
    this.produtosService.listar().subscribe(produtos => {
      this.todosProdutos = produtos;
    });

    this.searchSubject.pipe(
      debounceTime(200),
      distinctUntilChanged()
    ).subscribe(query => {
      this.filtrar(query);
    });
  }

  onSearchInput(query: string, mobile = false): void {
    if (mobile) {
      this.mobileSearchQuery = query;
    } else {
      this.searchQuery = query;
    }
    this.searchSubject.next(query);
    this.mostrarSugestoes = !mobile && query.length > 0;
    this.mostrarSugestoesMobile = mobile && query.length > 0;
  }

  private filtrar(query: string): void {
    if (!query.trim()) {
      this.sugestoes = [];
      return;
    }
    const q = query.toLowerCase();
    this.sugestoes = this.todosProdutos
      .filter(p => p.nome.toLowerCase().includes(q))
      .slice(0, 6);
  }

  selecionarSugestao(produto: Produto): void {
    this.searchQuery = '';
    this.mobileSearchQuery = '';
    this.sugestoes = [];
    this.mostrarSugestoes = false;
    this.mostrarSugestoesMobile = false;
    this.router.navigate(['/product-detail', produto.id]);
    this.fecharMenu();
  }

  pesquisar(query: string): void {
    if (!query.trim()) return;
    this.searchQuery = '';
    this.mobileSearchQuery = '';
    this.sugestoes = [];
    this.mostrarSugestoes = false;
    this.mostrarSugestoesMobile = false;
    this.router.navigate(['/product-list'], { queryParams: { busca: query } });
    this.fecharMenu();
  }

  fecharSugestoes(): void {
    setTimeout(() => {
      this.mostrarSugestoes = false;
      this.mostrarSugestoesMobile = false;
    }, 150);
  }

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

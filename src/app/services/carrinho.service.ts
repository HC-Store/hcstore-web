import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CarrinhoService {

  private carrinhoId: number | null = null;
  private itens$ = new BehaviorSubject<any[]>([]);

  constructor(private api: ApiService, private auth: AuthService) {
    if (this.auth.isLoggedIn()) {
      this.carregarCarrinho();
    }
  }

  get itens(): Observable<any[]> {
    return this.itens$.asObservable();
  }

  get itensSnapshot(): any[] {
    return this.itens$.getValue();
  }

  carregarCarrinho(): void {
    this.api.getCarrinho().subscribe({
      next: (carrinho: any) => {
        if (carrinho) {
          this.carrinhoId = carrinho.id;
          this.itens$.next(carrinho.itemcarrinho || []);
        }
      },
      error: (err) => console.error('Erro ao carregar carrinho:', err)
    });
  }

  adicionarItem(produtoId: number, quantidade: number): void {
    if (!this.auth.isLoggedIn()) {
      alert('Faça login para adicionar ao carrinho!');
      return;
    }

    if (!this.carrinhoId) {
      console.error('Carrinho não encontrado');
      return;
    }

    this.api.addItemCarrinho({
      carrinhoId: this.carrinhoId,
      produtoId,
      quantidade
    }).subscribe({
      next: () => this.carregarCarrinho(),
      error: (err) => console.error('Erro ao adicionar item:', err)
    });
  }

  removerItem(itemId: number): void {
    this.api.deleteItemCarrinho(itemId).subscribe({
      next: () => this.carregarCarrinho(),
      error: (err) => console.error('Erro ao remover item:', err)
    });
  }

  get total(): number {
    return this.itensSnapshot.reduce((total, item) => {
      return total + (item.produto?.preco || 0) * item.quantidade;
    }, 0);
  }
}

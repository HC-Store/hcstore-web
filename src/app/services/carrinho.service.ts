import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CarrinhoService {

  private readonly localStorageKey = 'hcStoreCarrinho';

  private carrinhoId: number | null = null;

  private itens$ = new BehaviorSubject<any[]>([]);

  constructor(
    private api: ApiService,
    private auth: AuthService
  ) {

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

  private temTokenApi(): boolean {
    return !!this.auth.getToken();
  }

  private carregarCarrinhoLocal(): any[] {
    const itens = JSON.parse(
      localStorage.getItem(this.localStorageKey) || '[]'
    );

    this.itens$.next(itens);

    return itens;
  }

  private salvarCarrinhoLocal(itens: any[]): any[] {
    localStorage.setItem(
      this.localStorageKey,
      JSON.stringify(itens)
    );

    this.itens$.next([...itens]);

    return itens;
  }

  private atualizarCarrinho(carrinho: any): any {
    if (carrinho) {
      this.carrinhoId = carrinho.id;

      this.itens$.next(
        carrinho.itemcarrinho || []
      );
    }

    return carrinho;
  }

  private carregarCarrinho$(): Observable<any> {
    return this.api.getCarrinho().pipe(
      tap((carrinho: any) => this.atualizarCarrinho(carrinho))
    );
  }

  carregarCarrinho(): void {
    if (!this.temTokenApi()) {
      this.carregarCarrinhoLocal();
      return;
    }

    this.carregarCarrinho$().subscribe({

      error: (err) =>

        console.error(
          'Erro ao carregar carrinho:',
          err
        )
    });
  }

  adicionarItem(
    produtoId: number,
    quantidade: number,
    tamanho?: string,
    produto?: any
  ): Observable<any> {

    if (!this.temTokenApi()) {
      const itens = this.carregarCarrinhoLocal();
      const itemExistente = itens.find(
        (item: any) =>
          item.produto?.id === produtoId &&
          item.tamanho === tamanho
      );

      if (itemExistente) {
        itemExistente.quantidade += quantidade;
      } else {
        itens.push({
          id: Date.now(),
          produto: produto || { id: produtoId },
          quantidade,
          tamanho
        });
      }

      return of(this.salvarCarrinhoLocal(itens));
    }

    const adicionar = () => {
      if (!this.carrinhoId) {
        return throwError(() => new Error('Carrinho nao encontrado.'));
      }

      return this.api.addItemCarrinho({

        carrinhoId: this.carrinhoId,
        produtoId,
        quantidade,
        tamanho

      }).pipe(
        switchMap(() => this.carregarCarrinho$())
      );
    };

    if (this.carrinhoId) {
      return adicionar();
    }

    return this.carregarCarrinho$().pipe(
      catchError(() => of(null)),
      switchMap((carrinho: any) => {
        if (carrinho?.id) {
          return adicionar();
        }

        const user = JSON.parse(localStorage.getItem('user') || '{}');

        if (!user.id) {
          return throwError(() => new Error('Usuario nao encontrado.'));
        }

        return this.api.createCarrinho({ usuarioId: user.id }).pipe(
          tap((novoCarrinho: any) => this.atualizarCarrinho(novoCarrinho)),
          switchMap(() => adicionar())
        );
      })
    );
  }

  removerItem(itemId: number): void {
    if (!this.temTokenApi()) {
      const itens = this.carregarCarrinhoLocal().filter(
        (item: any) => item.id !== itemId
      );

      this.salvarCarrinhoLocal(itens);
      return;
    }

    this.api.deleteItemCarrinho(itemId).subscribe({

      next: () => this.carregarCarrinho(),

      error: (err) =>

        console.error(
          'Erro ao remover item:',
          err
        )
    });
  }

  aumentarQuantidade(item: any): void {
    const itens = this.itensSnapshot.map((itemAtual: any) => {
      if (itemAtual.id !== item.id) {
        return itemAtual;
      }

      return {
        ...itemAtual,
        quantidade: Number(itemAtual.quantidade || 1) + 1
      };
    });

    if (this.temTokenApi()) {
      this.itens$.next(itens);
      return;
    }

    this.salvarCarrinhoLocal(itens);
  }

  diminuirQuantidade(item: any): void {
    const itens = this.itensSnapshot.map((itemAtual: any) => {
      if (itemAtual.id !== item.id) {
        return itemAtual;
      }

      return {
        ...itemAtual,
        quantidade: Math.max(Number(itemAtual.quantidade || 1) - 1, 1)
      };
    });

    if (this.temTokenApi()) {
      this.itens$.next(itens);
      return;
    }

    this.salvarCarrinhoLocal(itens);
  }

  get total(): number {

    return this.itensSnapshot.reduce(

      (total, item) => {

        return total +
          (item.produto?.preco || 0) *
          item.quantidade;
      },

      0
    );
  }
}

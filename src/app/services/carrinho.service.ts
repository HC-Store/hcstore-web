import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CarrinhoService {

  private readonly localStorageKey = 'hcStoreCarrinho';
  private readonly tamanhoStorageKey = 'hcStoreCarrinhoTamanhos';

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

  private atualizarCarrinhoComItens(carrinho: any, itens: any[]): any {
    if (carrinho) {
      this.carrinhoId = carrinho.id;
    }

    this.itens$.next(itens);

    return {
      ...carrinho,
      itemcarrinho: itens
    };
  }

  private carregarTamanhosLogado(): Record<string, string> {
    return JSON.parse(localStorage.getItem(this.tamanhoStorageKey) || '{}');
  }

  private salvarTamanhoLogado(produtoId: number, tamanho?: string): void {
    if (!tamanho) return;

    const tamanhos = this.carregarTamanhosLogado();
    tamanhos[String(produtoId)] = tamanho;
    localStorage.setItem(this.tamanhoStorageKey, JSON.stringify(tamanhos));
  }

  private removerTamanhoLogado(produtoId?: number): void {
    if (!produtoId) return;

    const tamanhos = this.carregarTamanhosLogado();
    delete tamanhos[String(produtoId)];
    localStorage.setItem(this.tamanhoStorageKey, JSON.stringify(tamanhos));
  }

  private produtoIdItem(item: any): number {
    return Number(item?.produtoId || item?.produto?.id || 0);
  }

  private enriquecerItensCarrinho(itens: any[], produtos: any[]): any[] {
    const tamanhos = this.carregarTamanhosLogado();

    return itens.map((item: any) => {
      const produtoId = this.produtoIdItem(item);
      const produtoCompleto = produtos.find((produto: any) => Number(produto.id) === produtoId);

      return {
        ...item,
        tamanho: item.tamanho || tamanhos[String(produtoId)],
        produto: {
          ...(item.produto || {}),
          ...(produtoCompleto || {})
        }
      };
    });
  }

  private carregarCarrinho$(): Observable<any> {
    return this.api.getCarrinho().pipe(
      switchMap((carrinho: any) => {
        const itens = carrinho?.itemcarrinho || [];

        return this.api.getProdutos().pipe(
          catchError(() => of([])),
          map((produtos: any) => {
            const itensEnriquecidos = this.enriquecerItensCarrinho(
              itens,
              Array.isArray(produtos) ? produtos : []
            );

            return this.atualizarCarrinhoComItens(carrinho, itensEnriquecidos);
          })
        );
      })
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

      this.salvarTamanhoLogado(produtoId, tamanho);

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
    const itemRemovido = this.itensSnapshot.find((item: any) => item.id === itemId);

    if (!this.temTokenApi()) {
      const itens = this.carregarCarrinhoLocal().filter(
        (item: any) => item.id !== itemId
      );

      this.salvarCarrinhoLocal(itens);
      return;
    }

    this.api.deleteItemCarrinho(itemId).subscribe({

      next: () => {
        this.removerTamanhoLogado(this.produtoIdItem(itemRemovido));
        this.carregarCarrinho();
      },

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

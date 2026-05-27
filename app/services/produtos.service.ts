import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Produto {
  id?: number;
  nome: string;
  descricao?: string;
  preco: number;
  estoque?: number;
  categoriaId?: number;
  imagem?: string;
  imagens?: { id: number; url: string; produtoId: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class ProdutosService {
  private apiUrl = `${environment.apiUrl}/produtos`;

  private produtosFallback: Produto[] = [
    {
      id: 1,
      nome: 'Calca Cargo Oversized',
      descricao: 'Peca streetwear com modelagem oversized.',
      preco: 189.9,
      estoque: 10,
      categoriaId: 1,
      imagem: 'assets/img/outfit.png'
    },
    {
      id: 2,
      nome: 'Calca Alfaiataria',
      descricao: 'Modelagem moderna para composicoes casuais.',
      preco: 219.9,
      estoque: 8,
      categoriaId: 1,
      imagem: 'assets/img/outfit.png'
    },
    {
      id: 3,
      nome: 'Conjunto Oversized',
      descricao: 'Conjunto confortavel com caimento amplo.',
      preco: 279.9,
      estoque: 6,
      categoriaId: 1,
      imagem: 'assets/img/oversized.png'
    },
    {
      id: 4,
      nome: 'Bone Baseball',
      descricao: 'Acessorio casual para completar o visual.',
      preco: 89.9,
      estoque: 12,
      categoriaId: 2,
      imagem: 'assets/img/baseball.webp'
    },
    {
      id: 5,
      nome: 'Outfit HC Store',
      descricao: 'Composicao selecionada da HC Store.',
      preco: 249.9,
      estoque: 5,
      categoriaId: 1,
      imagem: 'assets/img/nikegreen.jpg'
    }
  ];

  constructor(private http: HttpClient) {}

  listar(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.apiUrl).pipe(
      catchError((err) => {
        console.warn('Usando produtos locais para teste:', err);
        return of(this.produtosFallback);
      })
    );
  }

  cadastrar(produto: Produto): Observable<Produto> {
    return this.http.post<Produto>(this.apiUrl, produto);
  }

  atualizar(id: number, produto: Produto): Observable<Produto> {
    return this.http.put<Produto>(`${this.apiUrl}/${id}`, produto);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  // AUTENTICAÇÃO
  register(body: any): Observable<any> {
    return this.http.post(`${this.base}/api/auth/register`, body);
  }
  login(body: any): Observable<any> {
    return this.http.post(`${this.base}/api/auth/login`, body);
  }

  // USUÁRIOS
  getUsuarios(): Observable<any> {
    return this.http.get(`${this.base}/api/usuarios`, { headers: this.headers() });
  }
  getUsuarioById(id: number): Observable<any> {
    return this.http.get(`${this.base}/api/usuarios/${id}`, { headers: this.headers() });
  }
  createUsuario(body: any): Observable<any> {
    return this.http.post(`${this.base}/api/usuarios`, body, { headers: this.headers() });
  }
  updateUsuario(id: number, body: any): Observable<any> {
    return this.http.put(`${this.base}/api/usuarios/${id}`, body, { headers: this.headers() });
  }
  deleteUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.base}/api/usuarios/${id}`, { headers: this.headers() });
  }

  // PRODUTOS
  getProdutos(): Observable<any> {
    return this.http.get(`${this.base}/api/produtos`);
  }
  createProduto(body: any): Observable<any> {
    return this.http.post(`${this.base}/api/produtos`, body, { headers: this.headers() });
  }
  updateProduto(id: number, body: any): Observable<any> {
    return this.http.put(`${this.base}/api/produtos/${id}`, body, { headers: this.headers() });
  }
  deleteProduto(id: number): Observable<any> {
    return this.http.delete(`${this.base}/api/produtos/${id}`, { headers: this.headers() });
  }

  // IMAGEM PRODUTO
  getProdutoImagens(): Observable<any> {
    return this.http.get(`${this.base}/api/produto-imagem`, { headers: this.headers() });
  }
  createProdutoImagem(body: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ ...(token ? { Authorization: `Bearer ${token}` } : {}) });
    return this.http.post(`${this.base}/api/produto-imagem`, body, { headers });
  }
  deleteProdutoImagem(id: number): Observable<any> {
    return this.http.delete(`${this.base}/api/produto-imagem/${id}`, { headers: this.headers() });
  }

  // CATEGORIAS
  getCategorias(): Observable<any> {
    return this.http.get(`${this.base}/api/categorias`);
  }
  createCategoria(body: any): Observable<any> {
    return this.http.post(`${this.base}/api/categorias`, body, { headers: this.headers() });
  }

  // CARRINHO
  getCarrinho(): Observable<any> {
    return this.http.get(`${this.base}/api/carrinho`, { headers: this.headers() });
  }
  getCarrinhoById(id: number): Observable<any> {
    return this.http.get(`${this.base}/api/carrinho/${id}`, { headers: this.headers() });
  }
  createCarrinho(body: any): Observable<any> {
    return this.http.post(`${this.base}/api/carrinho`, body, { headers: this.headers() });
  }

  // ITEM CARRINHO
  getItensCarrinho(): Observable<any> {
    return this.http.get(`${this.base}/api/itemcarrinho`, { headers: this.headers() });
  }
  addItemCarrinho(body: any): Observable<any> {
    return this.http.post(`${this.base}/api/itemcarrinho`, body, { headers: this.headers() });
  }
  deleteItemCarrinho(id: number): Observable<any> {
    return this.http.delete(`${this.base}/api/itemcarrinho/${id}`, { headers: this.headers() });
  }

  // ENDEREÇOS
  getEnderecos(): Observable<any> {
    return this.http.get(`${this.base}/api/enderecos`, { headers: this.headers() });
  }
  createEndereco(body: any): Observable<any> {
    return this.http.post(`${this.base}/api/enderecos`, body, { headers: this.headers() });
  }

  // PEDIDOS
  getPedidos(): Observable<any> {
    return this.http.get(`${this.base}/api/pedidos`, { headers: this.headers() });
  }
  createPedido(body: any): Observable<any> {
    return this.http.post(`${this.base}/api/pedidos`, body, { headers: this.headers() });
  }
  updatePedido(id: number, body: any): Observable<any> {
    return this.http.put(`${this.base}/api/pedidos/${id}`, body, { headers: this.headers() });
  }
}

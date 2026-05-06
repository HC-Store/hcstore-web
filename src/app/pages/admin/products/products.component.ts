  import { Component } from '@angular/core';
  import { NgFor, NgIf } from '@angular/common';
  import { FormsModule } from '@angular/forms';
  import { Router } from '@angular/router';

  @Component({
    selector: 'app-products',
    standalone: true,
    imports: [NgFor, NgIf, FormsModule],
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.css']
  })
  export class ProductsComponent {

    constructor(private router: Router) {}

    produtos = [
      { name:'Adidas Ultra boost', cat:'Tênis', price:'R$610,40', icon:'👟', vendas:1269, estoque:1269, sizes:['38','40','42'], desc:'Corridas de longa distância exigem muito dos atletas.' },
      { name:'Adidas Ultra boost', cat:'Tênis', price:'R$600,40', icon:'👟', vendas:1269, estoque:1269, sizes:['P','M','G'], desc:'Corridas de longa distância exigem muito dos atletas.' },
      { name:'Adidas Ultra boost', cat:'Tênis', price:'R$800,40', icon:'👟', vendas:1269, estoque:1269, sizes:['36','38','40'], desc:'Corridas de longa distância exigem muito dos atletas.' },
      { name:'ADIZERO SL RUNNING', cat:'Corrida', price:'R$364,40', icon:'🏃', vendas:1269, estoque:1269, sizes:['M','G','GG'], desc:'Corridas de longa distância exigem muito dos atletas.' },
      { name:'ULTRABOOST CLEATS', cat:'Tênis', price:'R$800,40', icon:'⚽', vendas:1269, estoque:1269, sizes:['40','42','44'], desc:'Corridas de longa distância exigem muito dos atletas.' },
      { name:'FORUM EXHIBIT LOW', cat:'Tênis', price:'R$674,00', icon:'👟', vendas:109, estoque:1500, sizes:['38','40'], desc:'Corridas de longa distância exigem muito dos atletas.' },
      { name:'Adidas Ultra boost', cat:'Tênis', price:'R$710,40', icon:'👟', vendas:1269, estoque:1269, sizes:['P','M'], desc:'Corridas de longa distância exigem muito dos atletas.' },
      { name:'Adidas Ultra boost', cat:'Tênis', price:'R$600,40', icon:'👟', vendas:1269, estoque:1269, sizes:['G','GG'], desc:'Corridas de longa distância exigem muito dos atletas.' },
      { name:'Adidas Ultra boost', cat:'Tênis', price:'R$800,40', icon:'👟', vendas:1269, estoque:1269, sizes:['36','38','40','42'], desc:'Corridas de longa distância exigem muito dos atletas.' }
    ];

    // 🔥 MODAL
    showModal = false;
    editIndex: number | null = null;

    form: any = {
      name: '',
      cat: '',
      price: '',
      desc: '',
      sizes: ''
    };

    // 👉 ABRIR PARA NOVO
    novoProduto() {
      this.router.navigate(['/adicionar-produto']);
    }

    // 👉 EDITAR
    editarProduto(index: number) {
      this.editIndex = index;

      const p = this.produtos[index];

      this.form = {
        name: p.name,
        cat: p.cat,
        price: p.price,
        desc: p.desc,
        sizes: p.sizes.join(',')
      };

      this.showModal = true;
    }

    // 👉 SALVAR
    salvarProduto() {
      const novo = {
        ...this.form,
        sizes: this.form.sizes.split(','),
        vendas: 0,
        estoque: 0,
        icon: '👟'
      };

      if (this.editIndex !== null) {
        this.produtos[this.editIndex] = novo;
      } else {
        this.produtos.push(novo);
      }

      this.showModal = false;
    }

    // 👉 EXCLUIR
    removerProduto(index: number) {
      if (confirm('Deseja excluir este produto?')) {
        this.produtos.splice(index, 1);
      }
    }

  }
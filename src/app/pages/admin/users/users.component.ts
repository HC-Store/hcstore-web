import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {

  users = [
    {
      id: 25421,
      date: 'Jan 8th, 2022',
      method: 'PayPal',
      name: 'Bessie Cooper',
      status: 'Delivered',
      price: 200,
      avatar: 'https://i.pravatar.cc/40?img=1'
    }
  ];

  showForm = false;
  editingIndex: number | null = null;

  form: any = {
    name: '',
    method: '',
    status: '',
    price: ''
  };

  openForm() {
    this.showForm = true;
    this.form = { name: '', method: '', status: '', price: '' };
    this.editingIndex = null;
  }

  closeForm() {
    this.showForm = false;
  }

  saveUser() {
    if (this.editingIndex !== null) {
      this.users[this.editingIndex] = {
        ...this.users[this.editingIndex],
        ...this.form
      };
    } else {
      this.users.push({
        id: Math.floor(Math.random() * 99999),
        date: new Date().toLocaleDateString(),
        avatar: 'https://i.pravatar.cc/40',
        ...this.form
      });
    }

    this.closeForm();
  }

  editUser(index: number) {
    this.editingIndex = index;
    this.form = { ...this.users[index] };
    this.showForm = true;
  }

  deleteUser(index: number) {
    this.users.splice(index, 1);
  }

}

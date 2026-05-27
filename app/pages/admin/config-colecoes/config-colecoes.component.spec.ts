import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigColecoesComponent } from './config-colecoes.component';

describe('ConfigColecoesComponent', () => {
  let component: ConfigColecoesComponent;
  let fixture: ComponentFixture<ConfigColecoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigColecoesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfigColecoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

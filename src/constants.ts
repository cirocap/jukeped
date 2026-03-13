import { MenuItem } from './types';

export const MENU_ITEMS: MenuItem[] = [
  // Hambúrgueres
  { id: 'b1', name: 'Juke Burguer', price: 25, category: 'burgers', description: 'Pão, queijo, hambúrguer artesanal, maionese caseira, tomate, cebola crocante e anéis de cebola.' },
  { id: 'b2', name: 'Burguer Duplo', price: 30, category: 'burgers', description: 'Pão, queijo, dois hambúrgueres, maionese da casa, tomate, crispy de cebola, onion rings e molho billy jack.' },
  { id: 'b3', name: 'Juke Bacon', price: 27, category: 'burgers', description: 'Pão, queijo, hambúrguer artesanal, tiras de bacon, barbecue, tomate, crispy de cebola e onion rings.' },
  { id: 'b4', name: 'Duplo Bacon', price: 32, category: 'burgers', description: 'Pão, queijo, dois hambúrgueres, tiras de bacon, barbecue, tomate, crispy de cebola e onion rings.' },
  { id: 'b5', name: 'Juke Pernil com Abacaxi', price: 28, category: 'burgers', hasDoubleOption: true, doublePrice: 33, description: 'Pão, queijo, maionese, abacaxi em pedaços, tomate, cebola crocante e anéis de cebola.' },
  { id: 'b6', name: 'Vegetariano', price: 27, category: 'burgers', hasDoubleOption: true, doublePrice: 32, description: 'Hambúrguer vegetariano (quinoa, lentilha ou grão de bico), maionese, picles, alface, tomate, crispy e anéis.' },
  { id: 'b7', name: 'Juke Costela', price: 29, category: 'burgers', hasDoubleOption: true, doublePrice: 34, description: 'Hambúrguer de costela, pão, queijo, tomate, molho barbecue, crispy de cebola e onion rings.' },
  { id: 'b8', name: 'Juke Frango', price: 27, category: 'burgers', hasDoubleOption: true, doublePrice: 32, description: 'Pão, queijo, hambúrguer de frango, onion ring, alface, tomate, cebola crocante e maionese caseira.' },

  // Porções
  { id: 'p1', name: 'Fritas 180g', price: 13, category: 'portions' },
  { id: 'p2', name: 'Fritas 400g', price: 18, category: 'portions' },
  { id: 'p3', name: 'Fritas 400g + Cheddar + Bacon', price: 35, category: 'portions' },
  { id: 'p4', name: 'Aipim', price: 13, category: 'portions' },
  { id: 'p5', name: 'Polenta', price: 13, category: 'portions' },
  { id: 'p6', name: 'Bolinha de Queijo', price: 17, category: 'portions' },
  { id: 'p7', name: 'Mini Coxinha', price: 17, category: 'portions' },
  { id: 'p8', name: 'Quibe', price: 17, category: 'portions' },
  { id: 'p9', name: 'Onion Rings', price: 17, category: 'portions' },
  { id: 'p10', name: 'Nuggets', price: 18, category: 'portions' },
  { id: 'p11', name: 'Churros', price: 18, category: 'portions' },
  { id: 'p12', name: 'Amendoim', price: 6, category: 'portions' },

  // Drinks
  { id: 'd1', name: 'Quentão', price: 12, category: 'drinks' },
  { id: 'd2', name: 'Cuba Libre', price: 16, category: 'drinks', options: ['Normal', 'Zero'] },
  { id: 'd3', name: 'Jambu Tônica', price: 22, category: 'drinks' },
  { id: 'd4', name: 'Jambu Libre', price: 22, category: 'drinks', options: ['Normal', 'Zero'] },
  { id: 'd5', name: 'Gim Tônica', price: 22, category: 'drinks' },
  { id: 'd6', name: 'Moscow Mule', price: 23, category: 'drinks' },
  { id: 'd7', name: 'Moscow Mule Red', price: 23, category: 'drinks' },
  { id: 'd8', name: 'Pink Vodka Limonade', price: 23, category: 'drinks' },
  { id: 'd9', name: 'Jack and Coke', price: 30, category: 'drinks', options: ['Normal', 'Zero'] },
  { id: 'd10', name: 'Vodka com Energético', price: 22, category: 'drinks' },
  { id: 'd11', name: 'Jager Bomb', price: 28, category: 'drinks' },
  { id: 'd12', name: 'Jager Hunter\'s Tea', price: 28, category: 'drinks' },
  { id: 'd13', name: 'Negroni', price: 22, category: 'drinks' },
  { id: 'd14', name: 'Soda Italiana', price: 16, category: 'drinks' },
  { id: 'd15', name: 'Italian Spritz', price: 16, category: 'drinks' },
  { id: 'd16', name: 'Refri, Suco e Mate', price: 7, category: 'drinks' },
  { id: 'd17', name: 'Agua', price: 5, category: 'drinks' },
  { id: 'd18', name: 'Caipirinha', price: 15, category: 'drinks', options: ['Limão', 'Abacaxi', 'Morango', 'Maracujá'] },
  { id: 'd19', name: 'Caipirinha Especial', price: 20, category: 'drinks', options: ['Vinho', 'Jambu', 'Materinha'] },
];

export const ADICIONAIS = [
  { name: 'Cheddar', price: 3 },
  { name: 'Bacon', price: 3 },
  { name: 'Maionese da Casa', price: 2 },
];

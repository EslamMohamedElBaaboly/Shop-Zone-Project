export interface Product {
  id: number;
  name: string;
  price: number;
  category: 'Electronics' | 'Fashion' | 'Home' | 'Sports';
  stock: number;
  rating: number;
  image: string;
}

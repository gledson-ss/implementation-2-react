import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const response: Product[] = (await api.get('products')).data;
      
      var hasId = cart.find((product) =>{
        return productId === product.id
      })

      if(hasId === undefined) {
        response.forEach((product) =>{
          if(product.id === productId){
            setCart([...cart, {id: product.id, amount: 1, image: product.image, price: product.price,title: product.title }])
          }
        })
        
      }
      else{
        const newCart: Product[] = [];
        cart.forEach((product) => {
          if(product.id === productId){
            newCart.push({
              id: product.id,
              amount: product.amount + 1,
              image: product.image,
              price: product.price,
              title: product.title
            })
          }
          else{
            newCart.push(product)
          }
        })
        setCart(newCart)
      }
      console.log(cart)
    } catch {
      
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}

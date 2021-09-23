import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
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

type ResponseProduct = Omit<Product, "amount">;

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
      const updatedCart = [...cart]
      const responseStock: Stock = (await (await api.get(`stock/${productId}`)).data)
      const amountStock = responseStock.amount

      const hasCartItem = updatedCart.find(product => product.id === productId)

      const productAmount = (hasCartItem ? hasCartItem.amount : 0) + 1

      if(productAmount > amountStock) {
        toast.error('Quantidade solicitada fora de estoque');
        return
      }

      if(hasCartItem){
        hasCartItem.amount = productAmount
      }
      else{
        const responseProduct: ResponseProduct = (await (await api.get(`products/${productId}`)).data)
        updatedCart.push({...responseProduct, amount: 1})
      }
      setCart(updatedCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const hasCartItem = cart.find((product) => product.id === productId)

      if(hasCartItem){
        const newCart = cart.filter((product) => product.id !== productId)
        setCart(newCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
      }
      else{
        throw new Error()
      }
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if(amount <= 0){
        return
      }

      const responseStock: Stock = (await (await api.get(`stock/${productId}`)).data)

      if(amount > responseStock.amount){
        toast.error('Quantidade solicitada fora de estoque');
        return
      }

      const product_cart = cart.find((product) => product.id === productId)
      
      if(product_cart){
        const newCart = cart.map(product =>{
          if(productId === product.id){
            product.amount = amount
            return product
          }
          return product
        })

        setCart(newCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
      }
      else{
        throw new Error()
      }

    } catch {
      toast.error('Erro na alteração de quantidade do produto');
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

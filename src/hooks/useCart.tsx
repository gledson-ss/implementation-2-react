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
  cartSize: number;
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
  const [cartSize, setCartSize] = useState(cart.length)

  useEffect(() =>{
    localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
  }, [cart])

  const addProduct = async (productId: number) => {
    try {
      const response: Product = (await api.get(`products/${productId}`)).data;
      
      const responseStock: Stock = (await api.get(`stock/${productId}`)).data
      
      const hasStock = cart.find((product) => {
        return responseStock.amount <= product.amount;
      })
      if(!hasStock) {
        toast.error('Quantidade solicitada fora de estoque');
      }
      const hasId = cart.find((product) =>{
        return productId === product.id
      })

      if(hasId === undefined) {
        setCart([...cart, {id: response.id, amount: 1, image: response.image, price: response.price,title: response.title }])
        setCartSize(cartSize + 1);
      }
      else{
        const newCart: Product[] = cart.map((product) =>{
          if(product.id === productId){
            return ({
                    id: product.id,
                    amount: product.amount + 1,
                    image: product.image,
                    price: product.price,
                    title: product.title
                  })
          }
          else{
            return product
          }
        })
        setCart(newCart)
        
      }
      
    } catch {
      toast.error('Erro na adição do produto');
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
      value={{ cart, addProduct, removeProduct, updateProductAmount, cartSize }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}

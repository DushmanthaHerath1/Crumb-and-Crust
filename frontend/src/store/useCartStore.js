import { create } from "zustand";

const useCartStore = create((set, get) => ({
  //states
  cart: [],
  isCartOpen: false,

  //derived values
  cartItemCount: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),

  cartTotal: () =>
    get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0),

  //functions
  addToCart: (product) =>
    set((state) => {
      const existing = state.cart.find((item) => item.id === product.id);

      if (existing) {
        return {
          cart: state.cart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        };
      }

      return {
        cart: [
          ...state.cart,
          {
            ...product,
            quantity: 1,
          },
        ],
      };
    }),

  removeFromCart: (itemId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== itemId),
    })),

  updateQuantity: (itemId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return { cart: state.cart.filter((item) => item.id !== itemId) };
      }
      return {
        cart: state.cart.map((item) =>
          item.id === itemId ? { ...item, quantity } : item,
        ),
      };
    }),

  clearCart: () =>
    set({
      cart: [],
    }),

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
}));

export default useCartStore;

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Minus, 
  Trash2, 
  ChefHat, 
  ClipboardList, 
  ShoppingCart, 
  User, 
  Hash, 
  PlusCircle, 
  XCircle, 
  CheckCircle2,
  Clock,
  ChevronRight,
  Beer,
  UtensilsCrossed,
  GlassWater
} from 'lucide-react';
import { MENU_ITEMS, ADICIONAIS } from './constants';
import { Order, OrderItem, MenuItem } from './types';
import { getSupabase } from './lib/supabase';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState<'counter' | 'deliveries' | 'kitchen'>('counter');
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('burgers');
  const [itemOptions, setItemOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Sync view state with URL
  useEffect(() => {
    if (location.pathname === '/cozinha') {
      setView('kitchen');
    } else if (location.pathname === '/entregas') {
      setView('deliveries');
    } else {
      setView('counter');
    }
  }, [location.pathname]);

  // Real-time subscription
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    fetchOrders();

    const subscription = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchOrders = async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data.map((o: any) => ({
        id: o.id,
        customerName: o.customer_name,
        orderNumber: o.order_number,
        items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
        status: o.status,
        createdAt: o.created_at,
        total: o.total
      })));
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
    }
  };

  const getItemQuantityInCart = (menuItemId: string) => {
    return cart.filter(item => item.menuItemId === menuItemId).reduce((sum, item) => sum + item.quantity, 0);
  };

  const addToCart = (item: MenuItem, isDouble = false) => {
    const price = isDouble ? (item.doublePrice || item.price) : item.price;
    const selectedOption = itemOptions[item.id] || (item.options ? item.options[0] : undefined);
    
    const newItem: OrderItem = {
      id: Math.random().toString(36).substr(2, 9),
      menuItemId: item.id,
      name: item.name + (isDouble ? ' (Duplo)' : ''),
      quantity: 1,
      price: price,
      additions: [],
      removals: [],
      isDouble,
      selectedOption
    };
    setCart([...cart, newItem]);
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<OrderItem>) => {
    setCart(cart.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const toggleAddition = (itemId: string, addition: string) => {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;
    
    const additions = item.additions.includes(addition)
      ? item.additions.filter(a => a !== addition)
      : [...item.additions, addition];
    
    updateItem(itemId, { additions });
  };

  const toggleRemoval = (itemId: string, removal: string) => {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;
    
    const removals = item.removals.includes(removal)
      ? item.removals.filter(r => r !== removal)
      : [...item.removals, removal];
    
    updateItem(itemId, { removals });
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const additionsPrice = item.additions.reduce((sum, addName) => {
        const add = ADICIONAIS.find(a => a.name === addName);
        return sum + (add?.price || 0);
      }, 0);
      return total + (item.price + additionsPrice) * item.quantity;
    }, 0);
  };

  const submitOrder = async () => {
    const supabase = getSupabase();
    if (!supabase) {
      alert('Configuração do Supabase ausente. Verifique as variáveis de ambiente.');
      return;
    }

    if (!customerName || !orderNumber || cart.length === 0) {
      alert('Preencha o nome, número e adicione itens ao carrinho!');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('orders')
        .insert({
          customer_name: customerName,
          order_number: orderNumber,
          items: cart,
          total: calculateTotal()
        });

      if (error) throw error;

      setCart([]);
      setCustomerName('');
      setOrderNumber('');
      alert('Pedido enviado com sucesso!');
    } catch (err) {
      console.error('Erro ao enviar pedido:', err);
      alert('Erro ao enviar pedido');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: number, status: string) => {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  const deleteOrder = async (id: number) => {
    const supabase = getSupabase();
    if (!supabase) return;

    if (!confirm('Deseja excluir este pedido?')) return;
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Erro ao excluir pedido:', err);
    }
  };

  const categories = [
    { id: 'burgers', name: 'Hambúrgueres', icon: <UtensilsCrossed size={18} /> },
    { id: 'portions', name: 'Porções', icon: <ChefHat size={18} /> },
    { id: 'drinks', name: 'Drinks', icon: <GlassWater size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-orange-500/30">
      {/* Header */}
      {!getSupabase() && (
        <div className="bg-orange-600 text-white text-[10px] py-1 px-4 text-center font-bold uppercase tracking-widest">
          Atenção: Supabase não configurado. Os pedidos não serão salvos.
        </div>
      )}
      <header className="bg-[#111] border-b border-white/10 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20">
              <ChefHat className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">JUKE BAR</h1>
              <p className="text-[10px] text-orange-500 uppercase tracking-widest font-bold">Kitchen System</p>
            </div>
          </div>
          
          <nav className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            <button 
              onClick={() => navigate('/')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${location.pathname === '/' ? 'bg-orange-600 text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              <ClipboardList size={16} />
              Balcão
            </button>
            <button 
              onClick={() => navigate('/entregas')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${location.pathname === '/entregas' ? 'bg-orange-600 text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              <ShoppingCart size={16} />
              Entregas
              {orders.filter(o => o.status === 'ready').length > 0 && (
                <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                  {orders.filter(o => o.status === 'ready').length}
                </span>
              )}
            </button>
            <button 
              onClick={() => navigate('/cozinha')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${location.pathname === '/cozinha' ? 'bg-orange-600 text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              <ChefHat size={16} />
              Cozinha
              {orders.filter(o => o.status === 'pending').length > 0 && (
                <span className="bg-white text-orange-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {orders.filter(o => o.status === 'pending').length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        <Routes>
          <Route path="/" element={
            <div className="space-y-6">
              {/* Customer Identification - NOW AT THE TOP */}
              <div className="bg-[#111] border border-white/10 rounded-3xl p-6 shadow-xl">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-orange-500 ml-1">Nome do Cliente</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        type="text" 
                        placeholder="Quem está pedindo?"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-base focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-48 space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-orange-500 ml-1">Mesa / Senha</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        type="text" 
                        placeholder="Ex: 05"
                        value={orderNumber}
                        onChange={e => setOrderNumber(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-base font-bold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Menu Selection */}
                <div className="lg:col-span-2 space-y-6">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border whitespace-nowrap transition-all ${
                        selectedCategory === cat.id 
                          ? 'bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-600/20' 
                          : 'bg-[#1a1a1a] border-white/5 text-white/60 hover:border-white/20'
                      }`}
                    >
                      {cat.icon}
                      <span className="text-sm font-medium">{cat.name}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MENU_ITEMS.filter(item => item.category === selectedCategory).map(item => {
                    const qty = getItemQuantityInCart(item.id);
                    return (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={item.id}
                        className={`bg-[#1a1a1a] border p-4 rounded-2xl transition-all group relative ${
                          qty > 0 ? 'border-orange-500 shadow-lg shadow-orange-600/5' : 'border-white/5 hover:border-orange-500/50'
                        }`}
                      >
                        {qty > 0 && (
                          <div className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-[#0a0a0a]">
                            {qty}
                          </div>
                        )}
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg group-hover:text-orange-500 transition-colors">
                            {item.name} {qty > 0 && <span className="text-orange-500">({qty})</span>}
                          </h3>
                          <span className="text-orange-500 font-bold">R$ {item.price.toFixed(2)}</span>
                        </div>
                        {item.description && (
                          <p className="text-xs text-white/40 mb-4 line-clamp-2">{item.description}</p>
                        )}

                        {item.options && (
                          <div className="mb-4">
                            <p className="text-[10px] uppercase font-bold text-white/30 mb-2">Opção:</p>
                            <div className="flex flex-wrap gap-2">
                              {item.options.map(opt => (
                                <button
                                  key={opt}
                                  onClick={() => setItemOptions(prev => ({ ...prev, [item.id]: opt }))}
                                  className={`text-[10px] px-2.5 py-1.5 rounded-lg border transition-all ${
                                    (itemOptions[item.id] || item.options![0]) === opt
                                      ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                                      : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button 
                            onClick={() => addToCart(item)}
                            className="flex-1 bg-white/5 hover:bg-orange-600 text-white py-2 rounded-xl text-xs font-bold transition-all border border-white/10 hover:border-orange-500"
                          >
                            ADICIONAR
                          </button>
                          {item.hasDoubleOption && (
                            <button 
                              onClick={() => addToCart(item, true)}
                              className="flex-1 bg-orange-600/10 hover:bg-orange-600 text-orange-500 hover:text-white py-2 rounded-xl text-xs font-bold transition-all border border-orange-500/30"
                            >
                              DUPLO (R$ {item.doublePrice?.toFixed(2)})
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-[#111] border border-white/10 rounded-3xl p-6 sticky top-24">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <ShoppingCart className="text-orange-500" size={20} />
                    Novo Pedido
                  </h2>

                  <div className="max-h-[400px] overflow-y-auto pr-2 mb-6 space-y-3 scrollbar-thin">
                    <AnimatePresence mode="popLayout">
                      {cart.map(item => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          key={item.id}
                          className="bg-white/5 border border-white/5 rounded-2xl p-4"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-sm">{item.name}</h4>
                              <p className="text-xs text-orange-500 font-bold">R$ {item.price.toFixed(2)}</p>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-white/20 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>

                          {/* Options (Coca Zero/Normal, Frutas) */}
                          {MENU_ITEMS.find(mi => mi.id === item.menuItemId)?.options && (
                            <div className="mt-3">
                              <p className="text-[9px] uppercase font-bold text-white/30 mb-1.5">Opção</p>
                              <div className="flex flex-wrap gap-1.5">
                                {MENU_ITEMS.find(mi => mi.id === item.menuItemId)?.options?.map(opt => (
                                  <button
                                    key={opt}
                                    onClick={() => updateItem(item.id, { selectedOption: opt })}
                                    className={`text-[10px] px-2 py-1 rounded-lg border transition-all ${
                                      item.selectedOption === opt
                                        ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                                        : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Additions & Removals */}
                          <div className="space-y-3 mt-3">
                            <div>
                              <p className="text-[9px] uppercase font-bold text-white/30 mb-1.5">Adicionais</p>
                              <div className="flex flex-wrap gap-1.5">
                                {ADICIONAIS.map(add => (
                                  <button
                                    key={add.name}
                                    onClick={() => toggleAddition(item.id, add.name)}
                                    className={`text-[10px] px-2 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                                      item.additions.includes(add.name)
                                        ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                        : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                                    }`}
                                  >
                                    <PlusCircle size={10} />
                                    {add.name} (+R${add.price})
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase font-bold text-white/30 mb-1.5">Retirar</p>
                              <div className="flex flex-wrap gap-1.5">
                                {['Cebola', 'Tomate', 'Picles', 'Alface', 'Maionese'].map(rem => (
                                  <button
                                    key={rem}
                                    onClick={() => toggleRemoval(item.id, rem)}
                                    className={`text-[10px] px-2 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                                      item.removals.includes(rem)
                                        ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                        : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                                    }`}
                                  >
                                    <XCircle size={10} />
                                    Sem {rem}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {cart.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
                        <ShoppingCart className="mx-auto text-white/10 mb-2" size={32} />
                        <p className="text-sm text-white/20">Carrinho vazio</p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-white/10 pt-6 space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-sm text-white/40">Total do Pedido</span>
                      <span className="text-2xl font-black text-white">R$ {calculateTotal().toFixed(2)}</span>
                    </div>
                    <button 
                      disabled={loading || cart.length === 0}
                      onClick={submitOrder}
                      className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-white/10 disabled:text-white/20 text-white font-bold py-4 rounded-2xl shadow-xl shadow-orange-600/20 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? 'ENVIANDO...' : 'ENVIAR PARA COZINHA'}
                      {!loading && <ChevronRight size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          } />
          
          <Route path="/entregas" element={
            /* Deliveries View (Counter) */
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <ShoppingCart className="text-green-500" />
                  Prontos para Entrega
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {orders.filter(o => o.status === 'ready').map(order => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={order.id}
                      className="bg-[#111] border border-green-500/30 rounded-3xl overflow-hidden shadow-lg shadow-green-500/5"
                    >
                      <div className="bg-green-600/20 p-6 text-center border-b border-green-500/20">
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-400 mb-1 block">CHAMAR CLIENTE</span>
                        <h3 className="text-4xl font-black mb-1">{order.orderNumber}</h3>
                        <p className="text-xl font-bold text-white">{order.customerName}</p>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <p key={idx} className="text-sm text-white/60">
                              <span className="text-white font-bold mr-2">{item.quantity}x</span>
                              {item.name}
                              {item.selectedOption && <span className="text-orange-400 ml-2">({item.selectedOption})</span>}
                            </p>
                          ))}
                        </div>
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 size={18} />
                          PEDIDO ENTREGUE
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {orders.filter(o => o.status === 'ready').length === 0 && (
                  <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 rounded-3xl">
                    <ShoppingCart className="mx-auto text-white/5 mb-4" size={64} />
                    <h3 className="text-xl font-bold text-white/20">Nenhum pedido para entregar</h3>
                    <p className="text-sm text-white/10">Aguardando a cozinha finalizar os pedidos...</p>
                  </div>
                )}
              </div>
            </div>
          } />

          <Route path="/cozinha" element={
            /* Kitchen View */
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <ChefHat className="text-orange-500" />
                  Pedidos Pendentes
                </h2>
                <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-white/40">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    {orders.filter(o => o.status === 'pending').length} Pendentes
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {orders.filter(o => o.status === 'pending').map(order => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={order.id}
                      className="bg-[#111] border border-orange-500/30 rounded-3xl overflow-hidden shadow-lg shadow-orange-500/5"
                    >
                      <div className="p-4 flex justify-between items-center bg-orange-600/10 border-b border-orange-500/20">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Mesa / Senha</span>
                          <h3 className="text-2xl font-black">{order.orderNumber}</h3>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Cliente</span>
                          <p className="font-bold text-orange-500">{order.customerName}</p>
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="space-y-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="border-b border-white/5 pb-3 last:border-0">
                              <div className="flex justify-between items-start">
                                <p className="font-bold text-sm">
                                  <span className="text-orange-500 mr-2">{item.quantity}x</span>
                                  {item.name}
                                  {item.selectedOption && <span className="text-orange-400 ml-2">({item.selectedOption})</span>}
                                </p>
                              </div>
                              {(item.additions.length > 0 || item.removals.length > 0) && (
                                <div className="mt-2 space-y-1">
                                  {item.additions.map(add => (
                                    <p key={add} className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                                      <Plus size={10} /> {add}
                                    </p>
                                  ))}
                                  {item.removals.map(rem => (
                                    <p key={rem} className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                                      <Minus size={10} /> Sem {rem}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 text-white/30 text-[10px] font-bold">
                          <Clock size={12} />
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                            className="flex-1 bg-orange-600 hover:bg-orange-500 text-white py-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 size={16} />
                            MARCAR PRONTO
                          </button>
                          <button 
                            onClick={() => deleteOrder(order.id)}
                            className="bg-white/5 hover:bg-red-600/20 text-white/20 hover:text-red-500 p-4 rounded-xl transition-all border border-white/10"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {orders.filter(o => o.status === 'pending').length === 0 && (
                  <div className="col-span-full py-24 text-center">
                    <ChefHat className="mx-auto text-white/5 mb-4" size={64} />
                    <h3 className="text-xl font-bold text-white/20">Nenhum pedido pendente</h3>
                    <p className="text-sm text-white/10">Tudo limpo na cozinha!</p>
                  </div>
                )}
              </div>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}

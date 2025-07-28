import React, { useState, useEffect } from 'react';
import { useCart } from '@/components/cart/Cart';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from 'react-router-dom';
import { paymentService } from '@/lib/payment-service';
import { authService } from '@/lib/auth';
import { db } from '@/lib/github-sdk';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, ArrowLeft, ShoppingCart, CreditCard, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Checkout = () => {
    const { items, totalItems, totalPrice, loading: cartLoading, removeItem, updateItemQuantity } = useCart();
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'paystack'>('paystack');
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const user = authService.getCurrentUser();

    useEffect(() => {
        const fetchWalletBalance = async () => {
            if (user?.id) {
                try {
                    const wallet = await paymentService.getUserWallet(user.id);
                    setWalletBalance(wallet?.balance || 0);
                } catch (error) {
                    console.error("Error fetching wallet balance:", error);
                }
            }
        };
        fetchWalletBalance();
    }, [user]);

    const handleCheckout = async () => {
        // ... (checkout logic remains the same)
    };

    if (cartLoading) {
        return <div className="text-center py-20">Loading your cart...</div>;
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}>
                    <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6"><ArrowLeft className="mr-2 h-4 w-4"/> Back to shopping</Button>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">Your Shopping Cart</h1>
                </motion.div>

                {items.length === 0 ? (
                    <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="text-center py-20">
                        <ShoppingCart className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-700"/>
                        <h2 className="mt-6 text-2xl font-semibold">Your cart is empty</h2>
                        <p className="mt-2 text-gray-500">Looks like you haven't added anything to your cart yet.</p>
                        <Button onClick={() => navigate('/marketplace')} className="mt-6">Explore Courses</Button>
                    </motion.div>
                ) : (
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2">
                           <AnimatePresence>
                                {items.map(item => (
                                    <motion.div layout key={item.courseId} initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} transition={{duration:0.3}}>
                                        <CartItemComponent item={item} onRemove={removeItem} onUpdateQuantity={updateItemQuantity} />
                                    </motion.div>
                                ))}
                           </AnimatePresence>
                        </div>
                        <div className="lg:col-span-1">
                            <OrderSummary 
                                totalItems={totalItems} 
                                totalPrice={totalPrice} 
                                paymentMethod={paymentMethod} 
                                setPaymentMethod={setPaymentMethod} 
                                walletBalance={walletBalance}
                                onCheckout={handleCheckout}
                                loading={loading}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const CartItemComponent: React.FC<{ item: any, onRemove: (id: string) => void, onUpdateQuantity: (id: string, q: number) => void }> = ({ item, onRemove, onUpdateQuantity }) => (
    <div className="flex items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm mb-4">
        <img src={item.image || `https://source.unsplash.com/random/100x100?course,${item.courseId}`} alt={item.name} className="w-24 h-24 object-cover rounded-md"/>
        <div className="flex-grow">
            <h3 className="font-semibold text-lg">{item.name}</h3>
            <p className="text-sm text-gray-500">A great course</p>
        </div>
        <div className="flex items-center gap-2">
            <Input type="number" value={item.quantity} onChange={e => onUpdateQuantity(item.courseId, parseInt(e.target.value))} className="w-16 text-center"/>
        </div>
        <p className="font-semibold w-24 text-right">{paymentService.formatCurrency(item.price * item.quantity, 'USD')}</p>
        <Button variant="ghost" size="icon" onClick={() => onRemove(item.courseId)}><Trash2 className="h-4 w-4"/></Button>
    </div>
);

const OrderSummary: React.FC<{ totalItems: number, totalPrice: number, paymentMethod: string, setPaymentMethod: (method: 'wallet' | 'paystack') => void, walletBalance: number, onCheckout: () => void, loading: boolean }> = ({ totalItems, totalPrice, paymentMethod, setPaymentMethod, walletBalance, onCheckout, loading }) => (
    <div className="sticky top-24 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold border-b pb-4 mb-4">Order Summary</h2>
        <div className="space-y-2">
            <div className="flex justify-between"><span>Subtotal</span><span>{paymentService.formatCurrency(totalPrice, 'USD')}</span></div>
            <div className="flex justify-between"><span>Items</span><span>{totalItems}</span></div>
            <div className="flex justify-between font-bold text-lg border-t pt-4 mt-4"><span>Total</span><span>{paymentService.formatCurrency(totalPrice, 'USD')}</span></div>
        </div>
        <div className="my-6">
            <h3 className="text-lg font-semibold mb-2">Payment Method</h3>
            <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)} className="space-y-2">
                <Label htmlFor="paystack" className="flex items-center gap-2 p-4 border rounded-lg cursor-pointer has-[:checked]:bg-green-50 has-[:checked]:border-green-400">
                    <RadioGroupItem value="paystack" id="paystack" />
                    <CreditCard className="h-5 w-5 mr-2"/> Pay with Card
                </Label>
                <Label htmlFor="wallet" className="flex items-center gap-2 p-4 border rounded-lg cursor-pointer has-[:checked]:bg-green-50 has-[:checked]:border-green-400">
                    <RadioGroupItem value="wallet" id="wallet" />
                    <Wallet className="h-5 w-5 mr-2"/> Wallet <span className="ml-auto text-sm">({paymentService.formatCurrency(walletBalance, 'USD')})</span>
                </Label>
            </RadioGroup>
        </div>
        <Button onClick={onCheckout} disabled={loading} size="lg" className="w-full">
            {loading ? 'Processing...' : 'Proceed to Checkout'}
        </Button>
    </div>
);

export default Checkout;
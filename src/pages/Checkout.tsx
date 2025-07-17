import React, { useState, useEffect } from 'react';
import { useCart } from '@/components/cart/Cart';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useNavigate } from 'react-router-dom';
import { paymentService } from '@/lib/payment-service';
import { authService } from '@/lib/auth';

const Checkout = () => {
    const { items, clearCart, totalItems, totalPrice } = useCart();
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'paystack'>('wallet');
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const user = authService.getCurrentUser();

    useEffect(() => {
        const fetchWalletBalance = async () => {
            if (user?.id) {
                try {
                  const wallet = await paymentService.getUserWallet(user.id);
                  setWalletBalance(wallet ? wallet.balance : 0);
                } catch (error) {
                  console.error("Error fetching wallet balance:", error);
                  setWalletBalance(0); // Set to 0 in case of error
                }
            }
        };

        fetchWalletBalance();
    }, [user?.id]);

    const handleCheckout = async () => {
        if (!user) {
            alert('Please login to checkout.');
            navigate('/auth/login');
            return;
        }

        if (paymentMethod === 'wallet') {
            if (walletBalance >= totalPrice) {
                try {
                    await paymentService.processWalletPayment(user.id, totalPrice);

                    clearCart();
                    navigate('/marketplace');
                } catch (error) {
                    console.error('Wallet payment error:', error);
                    alert('Failed to process wallet payment.');
                }
            } else {
                alert('Insufficient wallet balance. Please fund your wallet or use Paystack.');
            }
        } else if (paymentMethod === 'paystack') {
            try {
                const paymentResponse = await paymentService.initializePayment({
                    amount: totalPrice,
                    currency: 'USD', // Replace with user's currency or default currency
                    email: user.email || '',
                    userId: user.id,
                    courseId: '', // Replace with course ID if needed
                    type: 'course_purchase',
                    description: 'Course purchase',
                });

                if (paymentResponse.authorization_url) {
                    window.location.href = paymentResponse.authorization_url;
                } else {
                    alert('Failed to initialize Paystack payment.');
                }
            } catch (error) {
                console.error('Paystack payment error:', error);
                alert('Failed to initialize Paystack payment.');
            }
        }
    };

    if (items.length === 0) {
        return <p>Your cart is empty.</p>;
    }

    return (
        <div className="container mx-auto mt-8">
            <h2 className="text-2xl font-semibold mb-4">Checkout</h2>
            {items.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div>
                    <ul>
                        {items.map(item => (
                            <li key={item.id} className="mb-2">
                                {item.name} - {paymentService.formatCurrency(item.price, 'USD')}
                            </li>
                        ))}
                    </ul>
                    <p>Total Items: {totalItems}</p>
                    <p>Total Price: {paymentService.formatCurrency(totalPrice, 'USD')}</p>

                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">Payment Method</h3>
                        <RadioGroup defaultValue="wallet" className="flex gap-2" onValueChange={(value) => setPaymentMethod(value as 'wallet' | 'paystack')}>
                            <RadioGroupItem value="wallet" id="wallet" />
                            <label htmlFor="wallet" className="cursor-pointer">
                                Wallet (Balance: {paymentService.formatCurrency(walletBalance, 'USD')})
                            </label>
                            <RadioGroupItem value="paystack" id="paystack" />
                            <label htmlFor="paystack" className="cursor-pointer">
                                Paystack
                            </label>
                        </RadioGroup>
                    </div>

                    <Button onClick={handleCheckout}>Checkout</Button>
                </div>
            )}
        </div>
    );
};

export default Checkout;
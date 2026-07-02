'use client'

import { useState, useEffect } from 'react'
import axios from '@/lib/axios'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AppImage } from '@/components/shared/AppImage'
import { ShoppingCart, CreditCard, Wallet, Banknote, Smartphone, Minus, Plus, X, Loader2 } from 'lucide-react'

interface Product {
    id: number
    name: string
    selling_price: number | string
    current_stock: number
    image_url?: string
    brand?: string
}

interface CartItem {
    product: Product
    quantity: number
}

interface PaymentMethod {
    id: number
    name: string
    type: string
    fee_type?: string
    fee_value?: number
    processing_fee_percentage?: string
    processing_fee_fixed?: string
    is_active: boolean
}

interface ProductPurchaseModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    cartItems: CartItem[]
    onUpdateQuantity: (productId: number, quantity: number) => void
    onRemoveItem: (productId: number) => void
}

export default function ProductPurchaseModal({
    isOpen,
    onClose,
    onSuccess,
    cartItems,
    onUpdateQuantity,
    onRemoveItem
}: ProductPurchaseModalProps) {
    const [loading, setLoading] = useState(false)
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null)
    const [walletBalance, setWalletBalance] = useState<number>(0)
    const [error, setError] = useState<string>('')

    useEffect(() => {
        if (isOpen) {
            fetchPaymentMethods()
            fetchWalletBalance()
        }
    }, [isOpen])

    const fetchPaymentMethods = async () => {
        try {
            const response = await axios.get('/api/public/payment-methods')
            // Handle both array and object response formats
            const methods = response.data.payment_methods || response.data
            const activeMethods = Array.isArray(methods) 
                ? methods.filter((pm: PaymentMethod) => pm.is_active)
                : []
            
            setPaymentMethods(activeMethods)
            if (activeMethods.length > 0) {
                setSelectedPaymentMethod(activeMethods[0].id)
            }
            console.log('Payment methods loaded:', activeMethods)
        } catch (error) {
            console.error('Failed to fetch payment methods:', error)
        }
    }

    const fetchWalletBalance = async () => {
        try {
            const response = await axios.get('/api/customer/wallet')
            setWalletBalance(response.data.balance || 0)
        } catch (error) {
            console.error('Failed to fetch wallet balance:', error)
            setWalletBalance(0)
        }
    }

    const calculateSubtotal = () => {
        return cartItems.reduce((sum, item) => {
            const price = typeof item.product.selling_price === 'string' 
                ? parseFloat(item.product.selling_price) 
                : item.product.selling_price
            return sum + (price * item.quantity)
        }, 0)
    }

    const calculateFee = () => {
        if (!selectedPaymentMethod) return 0
        const method = paymentMethods.find(pm => pm.id === selectedPaymentMethod)
        if (!method) return 0

        const subtotal = calculateSubtotal()
        
        // Handle both old and new field names
        const feePercentage = method.processing_fee_percentage 
            ? parseFloat(method.processing_fee_percentage) 
            : (method.fee_type === 'percentage' ? (method.fee_value || 0) : 0)
        
        const feeFixed = method.processing_fee_fixed 
            ? parseFloat(method.processing_fee_fixed) 
            : (method.fee_type === 'fixed' ? (method.fee_value || 0) : 0)

        if (feePercentage > 0) {
            return (subtotal * feePercentage) / 100
        }
        return feeFixed
    }

    const calculateTotal = () => {
        return calculateSubtotal() + calculateFee()
    }

    const handlePurchase = async () => {
        if (!selectedPaymentMethod || cartItems.length === 0) return

        setError('')
        
        // Check wallet balance if wallet payment
        const selectedMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethod)
        if (selectedMethod && selectedMethod.type.toLowerCase() === 'wallet') {
            const total = calculateTotal()
            if (walletBalance < total) {
                setError(`Insufficient wallet balance. You have R${walletBalance.toFixed(2)} but need R${total.toFixed(2)}`)
                return
            }
        }

        setLoading(true)
        try {
            const items = cartItems.map(item => ({
                product_id: item.product.id,
                quantity: item.quantity,
                unit_price: typeof item.product.selling_price === 'string' 
                    ? parseFloat(item.product.selling_price) 
                    : item.product.selling_price
            }))

            const response = await axios.post('/api/customer/products/purchase', {
                items,
                payment_method_id: selectedPaymentMethod
            })

            if (response.data.success) {
                // Check if payment requires redirect (Paystack for card payments)
                if (response.data.requires_redirect && response.data.authorization_url) {
                    // Redirect to Paystack
                    window.location.href = response.data.authorization_url
                    return // Don't close modal, user is being redirected
                }

                // Direct payment success (Cash, Wallet, etc.)
                const totalAmount = parseFloat(response.data.sale.total_amount)
                alert(`✅ Purchase successful!\n\nSale Number: ${response.data.sale.sale_number}\nTotal: R${totalAmount.toFixed(2)}\nPayment: ${response.data.sale.payment_method}`)
                
                onSuccess()
                
                // Close modal after short delay
                setTimeout(() => {
                    onClose()
                }, 100)
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to complete purchase. Please try again.'
            setError(errorMessage)
            console.error('Purchase error:', error)
            setLoading(false) // Only reset loading on error
        }
    }

    const getPaymentIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'cash':
                return <Banknote className="h-5 w-5" />
            case 'card':
                return <CreditCard className="h-5 w-5" />
            case 'wallet':
                return <Wallet className="h-5 w-5" />
            case 'mobile':
            case 'eft':
                return <Smartphone className="h-5 w-5" />
            default:
                return <CreditCard className="h-5 w-5" />
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Complete Your Purchase
                    </DialogTitle>
                    <DialogDescription>
                        Review your cart and select a payment method
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Cart Items */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Cart Items</h3>
                        {cartItems.map((item) => (
                            <div key={item.product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="relative w-16 h-16 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                                    {item.product.image_url ? (
                                        <AppImage
                                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${item.product.image_url}`}
                                            alt={item.product.name}
                                            className="w-full h-full object-cover rounded-md"
                                            sizes="64px"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ShoppingCart className="h-6 w-6 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold">{item.product.name}</h4>
                                    {item.product.brand && (
                                        <p className="text-sm text-gray-500">{item.product.brand}</p>
                                    )}
                                    <p className="text-sm font-bold text-pink-600">
                                        R{(typeof item.product.selling_price === 'string' 
                                            ? parseFloat(item.product.selling_price) 
                                            : item.product.selling_price).toFixed(2)} each
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-12 text-center font-semibold">{item.quantity}</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                        disabled={item.quantity >= item.product.current_stock}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">
                                        R{((typeof item.product.selling_price === 'string' 
                                            ? parseFloat(item.product.selling_price) 
                                            : item.product.selling_price) * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRemoveItem(item.product.id)}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    {/* Payment Methods */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Payment Method</h3>
                            {walletBalance > 0 && (
                                <div className="text-sm text-gray-600">
                                    Wallet Balance: <span className="font-bold text-green-600">R{walletBalance.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {paymentMethods.map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => {
                                        setSelectedPaymentMethod(method.id)
                                        setError('')
                                    }}
                                    className={`p-4 border-2 rounded-lg transition-all ${
                                        selectedPaymentMethod === method.id
                                            ? 'border-pink-600 bg-pink-50'
                                            : 'border-gray-200 hover:border-pink-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {getPaymentIcon(method.type)}
                                        <div className="text-left">
                                            <div className="font-semibold">{method.name}</div>
                                            {method.type.toLowerCase() === 'wallet' && (
                                                <div className="text-xs text-green-600">
                                                    Balance: R{walletBalance.toFixed(2)}
                                                </div>
                                            )}
                                            {(() => {
                                                const feePercentage = method.processing_fee_percentage 
                                                    ? parseFloat(method.processing_fee_percentage) 
                                                    : 0
                                                const feeFixed = method.processing_fee_fixed 
                                                    ? parseFloat(method.processing_fee_fixed) 
                                                    : 0
                                                
                                                if (feePercentage > 0) {
                                                    return (
                                                        <div className="text-xs text-gray-500">
                                                            {feePercentage}% fee
                                                        </div>
                                                    )
                                                } else if (feeFixed > 0) {
                                                    return (
                                                        <div className="text-xs text-gray-500">
                                                            R{feeFixed.toFixed(2)} fee
                                                        </div>
                                                    )
                                                }
                                                return null
                                            })()}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Summary */}
                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal:</span>
                            <span className="font-semibold">R{calculateSubtotal().toFixed(2)}</span>
                        </div>
                        {calculateFee() > 0 && (
                            <div className="flex justify-between text-sm">
                                <span>Payment Fee:</span>
                                <span className="font-semibold">R{calculateFee().toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                            <span>Total:</span>
                            <span className="text-pink-600">R{calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-600 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handlePurchase}
                            disabled={loading || !selectedPaymentMethod || cartItems.length === 0}
                            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Complete Purchase - R{calculateTotal().toFixed(2)}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

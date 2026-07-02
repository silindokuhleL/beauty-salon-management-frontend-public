'use client'

import { useCallback, useState, useEffect } from 'react'
import { useAuth } from '@/hooks/auth'
import axios from '@/lib/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AppImage } from '@/components/shared/AppImage'
import { 
    ShoppingCart, 
    Search, 
    Plus, 
    Minus, 
    Trash2, 
    DollarSign,
    Package,
    TrendingUp,
    Calendar,
    X
} from 'lucide-react'

interface Product {
    id: number
    name: string
    sku: string
    category: string
    brand: string
    selling_price: number
    current_stock: number
    image_url?: string
}

interface CartItem {
    product: Product
    quantity: number
    discount: number
}

interface Statistics {
    today_sales: number
    week_sales: number
    month_sales: number
    total_sales: number
    pending_sales: number
}

export default function ProductSalesPage() {
    const { user } = useAuth({ middleware: 'auth' })
    const [products, setProducts] = useState<Product[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(false)
    const [statistics, setStatistics] = useState<Statistics | null>(null)
    const [saleDiscount, setSaleDiscount] = useState(0)
    const [paymentMethod, setPaymentMethod] = useState('cash')

    const fetchProducts = useCallback(async () => {
        try {
            const response = await axios.get('/api/product-sales/products', {
                params: { search: searchTerm, in_stock_only: true }
            })
            setProducts(response.data)
        } catch (error) {
            console.error('Failed to fetch products:', error)
        }
    }, [searchTerm])

    const fetchStatistics = useCallback(async () => {
        try {
            const response = await axios.get('/api/product-sales/statistics')
            setStatistics(response.data)
        } catch (error) {
            console.error('Failed to fetch statistics:', error)
        }
    }, [])

    useEffect(() => {
        fetchStatistics()
    }, [fetchStatistics])

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProducts()
        }, 300)

        return () => clearTimeout(delayDebounceFn)
    }, [fetchProducts])

    const addToCart = (product: Product) => {
        const existingItem = cart.find(item => item.product.id === product.id)
        
        if (existingItem) {
            if (existingItem.quantity < product.current_stock) {
                setCart(cart.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ))
            } else {
                alert('Not enough stock available')
            }
        } else {
            setCart([...cart, { product, quantity: 1, discount: 0 }])
        }
    }

    const updateQuantity = (productId: number, newQuantity: number) => {
        const item = cart.find(i => i.product.id === productId)
        if (!item) return

        if (newQuantity <= 0) {
            removeFromCart(productId)
        } else if (newQuantity <= item.product.current_stock) {
            setCart(cart.map(item =>
                item.product.id === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            ))
        } else {
            alert('Not enough stock available')
        }
    }

    const updateDiscount = (productId: number, discount: number) => {
        setCart(cart.map(item =>
            item.product.id === productId
                ? { ...item, discount: Math.max(0, discount) }
                : item
        ))
    }

    const removeFromCart = (productId: number) => {
        setCart(cart.filter(item => item.product.id !== productId))
    }

    const clearCart = () => {
        setCart([])
        setSaleDiscount(0)
    }

    const calculateSubtotal = () => {
        return cart.reduce((sum, item) => {
            return sum + (item.product.selling_price * item.quantity - item.discount)
        }, 0)
    }

    const calculateTotal = () => {
        return Math.max(0, calculateSubtotal() - saleDiscount)
    }

    const processSale = async () => {
        if (cart.length === 0) {
            alert('Cart is empty')
            return
        }

        setLoading(true)
        try {
            const items = cart.map(item => ({
                product_id: item.product.id,
                quantity: item.quantity,
                unit_price: item.product.selling_price,
                discount_amount: item.discount
            }))

            const response = await axios.post('/api/product-sales', {
                items,
                payment_method: paymentMethod,
                payment_status: 'paid',
                discount_amount: saleDiscount
            })

            if (response.data.success) {
                alert(`Sale completed! Sale #${response.data.sale.sale_number}`)
                clearCart()
                fetchProducts()
                fetchStatistics()
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to process sale')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        Point of Sale
                    </h1>
                    <p className="text-gray-600">Sell products to customers</p>
                </div>

                {/* Statistics Cards */}
                {statistics && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card className="border-l-4 border-l-green-500">
                            <CardHeader className="pb-2">
                                <CardDescription>Today's Sales</CardDescription>
                                <CardTitle className="text-2xl text-green-600">
                                    R{statistics.today_sales.toFixed(2)}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="border-l-4 border-l-blue-500">
                            <CardHeader className="pb-2">
                                <CardDescription>This Week</CardDescription>
                                <CardTitle className="text-2xl text-blue-600">
                                    R{statistics.week_sales.toFixed(2)}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="border-l-4 border-l-purple-500">
                            <CardHeader className="pb-2">
                                <CardDescription>This Month</CardDescription>
                                <CardTitle className="text-2xl text-purple-600">
                                    R{statistics.month_sales.toFixed(2)}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="border-l-4 border-l-orange-500">
                            <CardHeader className="pb-2">
                                <CardDescription>Total Sales</CardDescription>
                                <CardTitle className="text-2xl text-orange-600">
                                    {statistics.total_sales}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Products Section */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Products
                                </CardTitle>
                                <div className="relative mt-4">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
                                    {products.map((product) => (
                                        <div
                                            key={product.id}
                                            onClick={() => addToCart(product)}
                                            className="p-4 border rounded-lg hover:border-pink-500 hover:shadow-md cursor-pointer transition-all bg-white"
                                        >
                                            <div className="relative aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                                                {product.image_url ? (
                                                    <AppImage
                                                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${product.image_url}`} 
                                                        alt={product.name} 
                                                        className="w-full h-full object-cover rounded-md"
                                                        sizes="(max-width: 768px) 50vw, 160px"
                                                    />
                                                ) : (
                                                    <Package className="h-12 w-12 text-gray-400" />
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-sm mb-1 truncate">{product.name}</h3>
                                            <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-bold text-pink-600">
                                                    R{parseFloat(String(product.selling_price)).toFixed(2)}
                                                </span>
                                                <Badge variant={product.current_stock > 10 ? "default" : "destructive"} className="text-xs">
                                                    {product.current_stock} left
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {products.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                        <p>No products found</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Cart Section */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <ShoppingCart className="h-5 w-5" />
                                        Cart ({cart.length})
                                    </span>
                                    {cart.length > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearCart}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4">
                                    {cart.map((item) => (
                                        <div key={item.product.id} className="p-3 bg-gray-50 rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-sm">{item.product.name}</h4>
                                                    <p className="text-xs text-gray-500">R{item.product.selling_price.toFixed(2)} each</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFromCart(item.product.id)}
                                                    className="h-6 w-6 p-0 text-red-600"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <Input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 0)}
                                                    className="h-8 w-16 text-center"
                                                    min="1"
                                                    max={item.product.current_stock}
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-600">Discount:</span>
                                                <Input
                                                    type="number"
                                                    value={item.discount}
                                                    onChange={(e) => updateDiscount(item.product.id, parseFloat(e.target.value) || 0)}
                                                    className="h-8 text-sm"
                                                    placeholder="0.00"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div className="mt-2 text-right">
                                                <span className="font-bold text-pink-600">
                                                    R{((item.product.selling_price * item.quantity) - item.discount).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {cart.length === 0 && (
                                    <div className="text-center py-12 text-gray-400">
                                        <ShoppingCart className="h-16 w-16 mx-auto mb-4" />
                                        <p>Cart is empty</p>
                                    </div>
                                )}

                                {cart.length > 0 && (
                                    <>
                                        <div className="border-t pt-4 space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span>Subtotal:</span>
                                                <span className="font-semibold">R{calculateSubtotal().toFixed(2)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">Sale Discount:</span>
                                                <Input
                                                    type="number"
                                                    value={saleDiscount}
                                                    onChange={(e) => setSaleDiscount(parseFloat(e.target.value) || 0)}
                                                    className="h-8"
                                                    placeholder="0.00"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div className="flex justify-between text-lg font-bold border-t pt-3">
                                                <span>Total:</span>
                                                <span className="text-pink-600">R{calculateTotal().toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-3">
                                            <div>
                                                <label className="text-sm font-medium mb-2 block">Payment Method</label>
                                                <select
                                                    value={paymentMethod}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    className="w-full h-10 px-3 border rounded-md"
                                                >
                                                    <option value="cash">Cash</option>
                                                    <option value="card">Card</option>
                                                    <option value="wallet">Wallet</option>
                                                    <option value="eft">EFT</option>
                                                </select>
                                            </div>
                                            <Button
                                                onClick={processSale}
                                                disabled={loading}
                                                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white h-12 text-lg font-semibold"
                                            >
                                                {loading ? 'Processing...' : `Complete Sale - R${calculateTotal().toFixed(2)}`}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

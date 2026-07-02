'use client'

import { useCallback, useState, useEffect } from 'react'
import { useAuth } from '@/hooks/auth'
import axios from '@/lib/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ProductCard from '@/components/shared/ProductCard'
import ProductPurchaseModal from '@/components/customer/ProductPurchaseModal'
import { Search, ShoppingCart, Package, Filter } from 'lucide-react'

interface Product {
    id: number
    name: string
    description?: string
    brand?: string
    category?: string
    selling_price: number | string
    current_stock: number
    image_url?: string
    product_type?: string
}

interface CartItem {
    product: Product
    quantity: number
}

export default function CustomerProductsPage() {
    const { user } = useAuth({ middleware: 'auth' })
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [categories, setCategories] = useState<string[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [showPurchaseModal, setShowPurchaseModal] = useState(false)
    const [favorites, setFavorites] = useState<number[]>([])

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (searchTerm) params.append('search', searchTerm)
            if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory)
            // Backend already filters by is_sellable via sellable() scope
            params.append('in_stock_only', 'true')

            console.log('Fetching products with params:', params.toString())
            const response = await axios.get(`/api/product-sales/products?${params}`)
            console.log('Products response:', response.data)
            setProducts(response.data)
        } catch (error) {
            console.error('Failed to fetch products:', error)
            console.error('Error details:', error)
        } finally {
            setLoading(false)
        }
    }, [searchTerm, selectedCategory])

    const fetchCategories = useCallback(async () => {
        try {
            const response = await axios.get('/api/inventory/categories')
            setCategories(response.data)
        } catch (error) {
            console.error('Failed to fetch categories:', error)
        }
    }, [])

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    useEffect(() => {
        fetchProducts()
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
                alert('Cannot add more than available stock')
            }
        } else {
            setCart([...cart, { product, quantity: 1 }])
        }
    }

    const updateQuantity = (productId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId)
        } else {
            const item = cart.find(i => i.product.id === productId)
            if (item && quantity <= item.product.current_stock) {
                setCart(cart.map(item =>
                    item.product.id === productId
                        ? { ...item, quantity }
                        : item
                ))
            }
        }
    }

    const removeFromCart = (productId: number) => {
        setCart(cart.filter(item => item.product.id !== productId))
    }

    const toggleFavorite = (productId: number) => {
        setFavorites(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        )
    }

    const handlePurchaseSuccess = () => {
        setCart([])
        fetchProducts() // Refresh products to update stock
    }

    const cartTotal = cart.reduce((sum, item) => {
        const price = typeof item.product.selling_price === 'string' 
            ? parseFloat(item.product.selling_price) 
            : item.product.selling_price
        return sum + (price * item.quantity)
    }, 0)

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Shop Products
                    </h1>
                    <p className="text-gray-600">Browse and purchase salon products</p>
                </div>

                {/* Search & Filters */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                                    onClick={() => setSelectedCategory('all')}
                                    className={selectedCategory === 'all' ? 'bg-gradient-to-r from-pink-600 to-purple-600' : ''}
                                >
                                    All
                                </Button>
                                {categories.map((category) => (
                                    <Button
                                        key={category}
                                        variant={selectedCategory === category ? 'default' : 'outline'}
                                        onClick={() => setSelectedCategory(category)}
                                        className={selectedCategory === category ? 'bg-gradient-to-r from-pink-600 to-purple-600' : ''}
                                    >
                                        {category}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Cart Summary */}
                {cart.length > 0 && (
                    <Card className="mb-6 border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ShoppingCart className="h-6 w-6 text-pink-600" />
                                    <div>
                                        <p className="font-semibold">{cart.length} item(s) in cart</p>
                                        <p className="text-sm text-gray-600">Total: R{cartTotal.toFixed(2)}</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => setShowPurchaseModal(true)}
                                    className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                                >
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Checkout
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Products Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading products...</p>
                    </div>
                ) : products.length === 0 ? (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                                <p className="text-gray-600">Try adjusting your search or filters</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                isFavorite={favorites.includes(product.id)}
                                onToggleFavorite={toggleFavorite}
                                onAddToCart={addToCart}
                                showAddToCart={true}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Purchase Modal */}
            <ProductPurchaseModal
                isOpen={showPurchaseModal}
                onClose={() => setShowPurchaseModal(false)}
                onSuccess={handlePurchaseSuccess}
                cartItems={cart}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
            />
        </div>
    )
}

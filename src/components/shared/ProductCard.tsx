'use client'

import { memo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Package, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AppImage } from '@/components/shared/AppImage'

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

interface ProductCardProps {
    product: Product
    isFavorite?: boolean
    onToggleFavorite?: (productId: number) => void
    onAddToCart: (product: Product) => void
    showAddToCart?: boolean
    className?: string
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'

const ProductCard = memo(function ProductCard({
    product,
    isFavorite = false,
    onToggleFavorite,
    onAddToCart,
    showAddToCart = true,
    className = ""
}: ProductCardProps) {
    const router = useRouter()
    const [imageError, setImageError] = useState(false)
    const [isAdding, setIsAdding] = useState(false)

    const formatPrice = useCallback((price: number | string) => {
        if (!price) return 'R0.00';
        const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.-]/g, '')) : price;
        if (isNaN(numPrice) || numPrice === 0) return 'R0.00';
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
        }).format(numPrice);
    }, [])

    const handleAddToCart = async () => {
        if (product.current_stock <= 0) return
        setIsAdding(true)
        try {
            await onAddToCart(product)
        } finally {
            setIsAdding(false)
        }
    }

    const imageUrl = imageError || !product.image_url 
        ? FALLBACK_IMAGE 
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}${product.image_url}`

    const isOutOfStock = product.current_stock <= 0
    const isLowStock = product.current_stock > 0 && product.current_stock <= 5

    return (
        <div className={`group relative bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${className}`}>
            {/* Favorite Button */}
            {onToggleFavorite && (
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onToggleFavorite(product.id)
                    }}
                    className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white"
                >
                    <Heart 
                        className={`h-5 w-5 transition-colors ${
                            isFavorite ? 'fill-pink-500 text-pink-500' : 'text-gray-400 hover:text-pink-500'
                        }`}
                    />
                </button>
            )}

            {/* Stock Badge */}
            {isOutOfStock && (
                <div className="absolute top-3 left-3 z-10">
                    <Badge variant="destructive">Out of Stock</Badge>
                </div>
            )}
            {isLowStock && !isOutOfStock && (
                <div className="absolute top-3 left-3 z-10">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Only {product.current_stock} left
                    </Badge>
                </div>
            )}

            {/* Product Image */}
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
                <AppImage
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    onError={() => setImageError(true)}
                />
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">Out of Stock</span>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4">
                {/* Category & Brand */}
                {(product.category || product.brand) && (
                    <div className="flex items-center gap-2 mb-2">
                        {product.category && (
                            <Badge variant="outline" className="text-xs">
                                {product.category}
                            </Badge>
                        )}
                        {product.brand && (
                            <span className="text-xs text-gray-500">{product.brand}</span>
                        )}
                    </div>
                )}

                {/* Product Name */}
                <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-2 min-h-[3.5rem]">
                    {product.name}
                </h3>

                {/* Description */}
                {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                    </p>
                )}

                {/* Price & Stock */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                            {formatPrice(product.selling_price)}
                        </div>
                        <div className="text-xs text-gray-500">
                            {product.current_stock} in stock
                        </div>
                    </div>
                </div>

                {/* Add to Cart Button */}
                {showAddToCart && (
                    <Button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock || isAdding}
                        className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isAdding ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Adding...
                            </>
                        ) : isOutOfStock ? (
                            <>
                                <Package className="h-4 w-4 mr-2" />
                                Out of Stock
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Add to Cart
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    )
})

export default ProductCard

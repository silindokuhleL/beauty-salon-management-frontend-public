'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/auth'
import axios from '@/lib/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AppImage } from '@/components/shared/AppImage'
import { Package, Calendar, CreditCard, ShoppingBag } from 'lucide-react'
import { format } from 'date-fns'

interface PurchaseItem {
    product_id: number
    product_name: string
    product_sku: string
    quantity: number
    unit_price: string
    total_price: string
    image_url?: string
}

interface Purchase {
    id: number
    sale_number: string
    sale_date: string
    subtotal: string
    tax_amount: string
    total_amount: string
    payment_method: string
    payment_status: string
    items: PurchaseItem[]
}

export default function MyOrdersPage() {
    const { user } = useAuth({ middleware: 'auth' })
    const [purchases, setPurchases] = useState<Purchase[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPurchaseHistory()
    }, [])

    const fetchPurchaseHistory = async () => {
        setLoading(true)
        try {
            const response = await axios.get('/api/customer/products/purchase-history')
            if (response.data.success) {
                setPurchases(response.data.purchases)
            }
        } catch (error) {
            console.error('Failed to fetch purchase history:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return 'bg-green-100 text-green-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'failed':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        My Orders
                    </h1>
                    <p className="text-gray-600">View your purchase history and order details</p>
                </div>

                {loading && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading your orders...</p>
                    </div>
                )}

                {!loading && purchases.length === 0 && (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                                <p className="text-gray-600">Start shopping to see your orders here</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!loading && purchases.length > 0 && (
                    <div className="space-y-6">
                        {purchases.map((purchase) => (
                            <Card key={purchase.id} className="overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">Order #{purchase.sale_number}</CardTitle>
                                            <CardDescription className="flex items-center gap-4 mt-2">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {format(new Date(purchase.sale_date), 'MMM dd, yyyy HH:mm')}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <CreditCard className="h-4 w-4" />
                                                    {purchase.payment_method}
                                                </span>
                                            </CardDescription>
                                        </div>
                                        <Badge className={getStatusColor(purchase.payment_status)}>
                                            {purchase.payment_status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-4 mb-4">
                                        {purchase.items.map((item, index) => (
                                            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                                <div className="relative w-16 h-16 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                                                    {item.image_url ? (
                                                        <AppImage
                                                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${item.image_url}`}
                                                            alt={item.product_name}
                                                            className="w-full h-full object-cover rounded-md"
                                                            sizes="64px"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="h-6 w-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold">{item.product_name}</h4>
                                                    <p className="text-sm text-gray-500">SKU: {item.product_sku}</p>
                                                    <p className="text-sm text-gray-600">Qty: {item.quantity} × R{parseFloat(item.unit_price).toFixed(2)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-pink-600">R{parseFloat(item.total_price).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t pt-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Subtotal:</span>
                                            <span className="font-semibold">R{parseFloat(purchase.subtotal).toFixed(2)}</span>
                                        </div>
                                        {parseFloat(purchase.tax_amount) > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span>Payment Fee:</span>
                                                <span className="font-semibold">R{parseFloat(purchase.tax_amount).toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                                            <span>Total:</span>
                                            <span className="text-pink-600">R{parseFloat(purchase.total_amount).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

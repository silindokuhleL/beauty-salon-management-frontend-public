'use client'

import { useState } from 'react'
import axios from '@/lib/axios'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

interface Product {
    id: number
    name: string
    sku: string
    current_stock: number
}

interface StockAdjustmentModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    product: Product | null
}

export default function StockAdjustmentModal({ isOpen, onClose, onSuccess, product }: StockAdjustmentModalProps) {
    const [loading, setLoading] = useState(false)
    const [type, setType] = useState<'in' | 'out' | 'adjustment'>('in')
    const [quantity, setQuantity] = useState('')
    const [reason, setReason] = useState('')
    const [reference, setReference] = useState('')
    const [notes, setNotes] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!product) return

        setLoading(true)
        try {
            await axios.post(`/api/inventory/products/${product.id}/adjust-stock`, {
                type,
                quantity: parseInt(quantity),
                reason,
                reference,
                notes
            })
            alert('Stock adjusted successfully!')
            onSuccess()
            onClose()
            // Reset form
            setType('in')
            setQuantity('')
            setReason('')
            setReference('')
            setNotes('')
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to adjust stock')
        } finally {
            setLoading(false)
        }
    }

    const getNewStock = () => {
        if (!product || !quantity) return product?.current_stock || 0
        const qty = parseInt(quantity)
        switch (type) {
            case 'in':
                return product.current_stock + qty
            case 'out':
                return Math.max(0, product.current_stock - qty)
            case 'adjustment':
                return qty
            default:
                return product.current_stock
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Adjust Stock</DialogTitle>
                    <DialogDescription>
                        {product && (
                            <>
                                <div className="font-semibold text-gray-900">{product.name}</div>
                                <div className="text-sm">SKU: {product.sku}</div>
                                <div className="text-sm">Current Stock: <span className="font-bold">{product.current_stock}</span></div>
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="type">Adjustment Type *</Label>
                        <Select value={type} onValueChange={(value: any) => setType(value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="in">Stock In (Add)</SelectItem>
                                <SelectItem value="out">Stock Out (Remove)</SelectItem>
                                <SelectItem value="adjustment">Adjustment (Set to specific amount)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="quantity">
                            {type === 'adjustment' ? 'New Stock Level *' : 'Quantity *'}
                        </Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="0"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                        />
                        {quantity && (
                            <p className="text-sm text-gray-600 mt-1">
                                New stock will be: <span className="font-bold">{getNewStock()}</span>
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="reason">Reason *</Label>
                        <Input
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g., New delivery, Damaged items, Stock count"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="reference">Reference Number</Label>
                        <Input
                            id="reference"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            placeholder="e.g., PO-12345, INV-67890"
                        />
                    </div>

                    <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-pink-600 to-purple-600"
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Adjust Stock
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

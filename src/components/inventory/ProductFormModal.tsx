'use client'

import { useState, useEffect } from 'react'
import axios from '@/lib/axios'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AppImage } from '@/components/shared/AppImage'
import { Loader2 } from 'lucide-react'

interface Product {
    id?: number
    name: string
    sku: string
    description?: string
    category?: string | null
    product_type: 'retail' | 'professional' | 'both'
    is_sellable: boolean
    brand?: string | null
    cost_price: number
    selling_price: number
    current_stock: number
    minimum_stock: number
    maximum_stock: number
    unit: string
    supplier_id?: number | null
    expiry_date?: string | null
    location?: string | null
    notes?: string | null
    image?: File | null
    image_url?: string
}

interface Supplier {
    id: number
    name: string
}

interface ProductFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    product?: Product | null
}

export default function ProductFormModal({ isOpen, onClose, onSuccess, product }: ProductFormModalProps) {
    const [loading, setLoading] = useState(false)
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [formData, setFormData] = useState<Product>({
        name: '',
        sku: '',
        description: '',
        category: '',
        product_type: 'retail',
        is_sellable: true,
        brand: '',
        cost_price: 0,
        selling_price: 0,
        current_stock: 0,
        minimum_stock: 5,
        maximum_stock: 100,
        unit: 'piece',
        supplier_id: undefined,
        expiry_date: '',
        location: '',
        notes: ''
    })

    useEffect(() => {
        if (isOpen) {
            fetchSuppliers()
            if (product) {
                setFormData({ ...product, image: null })
                setImagePreview(product.image_url || null)
            } else {
                // Reset form for new product
                setFormData({
                    name: '',
                    sku: '',
                    description: '',
                    category: '',
                    product_type: 'retail',
                    is_sellable: true,
                    brand: '',
                    cost_price: 0,
                    selling_price: 0,
                    current_stock: 0,
                    minimum_stock: 5,
                    maximum_stock: 100,
                    unit: 'piece',
                    supplier_id: undefined,
                    expiry_date: '',
                    location: '',
                    notes: '',
                    image: null
                })
                setImagePreview(null)
            }
        }
    }, [isOpen, product])

    const fetchSuppliers = async () => {
        try {
            const response = await axios.get('/api/inventory/suppliers')
            setSuppliers(response.data.data || [])
        } catch (error) {
            console.error('Failed to fetch suppliers:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const data = new FormData()
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'image' && value) {
                    data.append(key, value as File)
                } else if (key === 'is_sellable') {
                    data.append(key, value ? '1' : '0')
                } else if (value !== null && value !== undefined && key !== 'image') {
                    data.append(key, String(value))
                }
            })

            if (product?.id) {
                // Update existing product
                await axios.post(`/api/inventory/products/${product.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                alert('Product updated successfully!')
            } else {
                // Create new product
                await axios.post('/api/inventory/products', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                alert('Product created successfully!')
            }
            onSuccess()
            onClose()
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to save product')
        } finally {
            setLoading(false)
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFormData({...formData, image: file})
            // Create preview URL
            const reader = new FileReader()
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        } else {
            setFormData({...formData, image: null})
            setImagePreview(null)
        }
    }

    const handleChange = (field: keyof Product, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    <DialogDescription>
                        {product ? 'Update product information' : 'Add a new product to your inventory'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Product Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="sku">SKU *</Label>
                                <Input
                                    id="sku"
                                    value={formData.sku}
                                    onChange={(e) => handleChange('sku', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description || ''}
                                onChange={(e) => handleChange('description', e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    value={formData.category || ''}
                                    onChange={(e) => handleChange('category', e.target.value)}
                                    placeholder="e.g., Hair Care"
                                />
                            </div>
                            <div>
                                <Label htmlFor="brand">Brand</Label>
                                <Input
                                    id="brand"
                                    value={formData.brand || ''}
                                    onChange={(e) => handleChange('brand', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="unit">Unit *</Label>
                                <Input
                                    id="unit"
                                    value={formData.unit}
                                    onChange={(e) => handleChange('unit', e.target.value)}
                                    placeholder="e.g., piece, bottle, box"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Product Type */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Product Type</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="product_type">Type *</Label>
                                <Select
                                    value={formData.product_type}
                                    onValueChange={(value) => handleChange('product_type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="retail">Retail (Sell to customers)</SelectItem>
                                        <SelectItem value="professional">Professional (Use in services)</SelectItem>
                                        <SelectItem value="both">Both</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="is_sellable">Sellable</Label>
                                <Select
                                    value={formData.is_sellable ? 'yes' : 'no'}
                                    onValueChange={(value) => handleChange('is_sellable', value === 'yes')}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="yes">Yes</SelectItem>
                                        <SelectItem value="no">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Pricing</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="cost_price">Cost Price (R) *</Label>
                                <Input
                                    id="cost_price"
                                    type="number"
                                    step="0.01"
                                    value={formData.cost_price}
                                    onChange={(e) => handleChange('cost_price', parseFloat(e.target.value))}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="selling_price">Selling Price (R) *</Label>
                                <Input
                                    id="selling_price"
                                    type="number"
                                    step="0.01"
                                    value={formData.selling_price}
                                    onChange={(e) => handleChange('selling_price', parseFloat(e.target.value))}
                                    required
                                />
                            </div>
                        </div>
                        {formData.selling_price > 0 && formData.cost_price > 0 && (
                            <p className="text-sm text-gray-600">
                                Profit Margin: R{(formData.selling_price - formData.cost_price).toFixed(2)} 
                                ({(((formData.selling_price - formData.cost_price) / formData.selling_price) * 100).toFixed(1)}%)
                            </p>
                        )}
                    </div>

                    {/* Stock Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Stock Information</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="current_stock">Current Stock *</Label>
                                <Input
                                    id="current_stock"
                                    type="number"
                                    value={formData.current_stock}
                                    onChange={(e) => handleChange('current_stock', parseInt(e.target.value))}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="minimum_stock">Minimum Stock *</Label>
                                <Input
                                    id="minimum_stock"
                                    type="number"
                                    value={formData.minimum_stock}
                                    onChange={(e) => handleChange('minimum_stock', parseInt(e.target.value))}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="maximum_stock">Maximum Stock *</Label>
                                <Input
                                    id="maximum_stock"
                                    type="number"
                                    value={formData.maximum_stock}
                                    onChange={(e) => handleChange('maximum_stock', parseInt(e.target.value))}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Additional Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="supplier_id">Supplier</Label>
                                <Select
                                    value={formData.supplier_id?.toString() || 'none'}
                                    onValueChange={(value) => handleChange('supplier_id', value === 'none' ? undefined : parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select supplier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Supplier</SelectItem>
                                        {suppliers.map((supplier) => (
                                            <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                                {supplier.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="location">Storage Location</Label>
                                <Input
                                    id="location"
                                    value={formData.location || ''}
                                    onChange={(e) => handleChange('location', e.target.value)}
                                    placeholder="e.g., Shelf A3"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="expiry_date">Expiry Date</Label>
                            <Input
                                id="expiry_date"
                                type="date"
                                value={formData.expiry_date || ''}
                                onChange={(e) => handleChange('expiry_date', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="image">Product Image</Label>
                            <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            {imagePreview && (
                                <div className="mt-3 flex flex-col items-center">
                                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                                    <div className="relative w-full max-w-md h-48 overflow-hidden rounded-lg border border-gray-300 shadow-sm">
                                        <AppImage
                                        src={imagePreview} 
                                        alt="Product preview" 
                                            className="w-full h-full object-cover"
                                            sizes="(max-width: 768px) 100vw, 448px"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes || ''}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Actions */}
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
                            {product ? 'Update Product' : 'Create Product'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

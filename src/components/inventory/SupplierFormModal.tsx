'use client'

import { useState, useEffect } from 'react'
import axios from '@/lib/axios'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

interface Supplier {
    id?: number
    name: string
    contact_person?: string | null
    email?: string | null
    phone?: string | null
    address?: string | null
    city?: string | null
    country?: string | null
    postal_code?: string | null
    website?: string | null
    tax_number?: string | null
    payment_terms?: string | null
    notes?: string | null
}

interface SupplierFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    supplier?: Supplier | null
}

export default function SupplierFormModal({ isOpen, onClose, onSuccess, supplier }: SupplierFormModalProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<Supplier>({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: 'South Africa',
        postal_code: '',
        website: '',
        tax_number: '',
        payment_terms: '',
        notes: ''
    })

    useEffect(() => {
        if (isOpen) {
            if (supplier) {
                setFormData(supplier)
            } else {
                setFormData({
                    name: '',
                    contact_person: '',
                    email: '',
                    phone: '',
                    address: '',
                    city: '',
                    country: 'South Africa',
                    postal_code: '',
                    website: '',
                    tax_number: '',
                    payment_terms: '',
                    notes: ''
                })
            }
        }
    }, [isOpen, supplier])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (supplier?.id) {
                await axios.put(`/api/inventory/suppliers/${supplier.id}`, formData)
                alert('Supplier updated successfully!')
            } else {
                await axios.post('/api/inventory/suppliers', formData)
                alert('Supplier created successfully!')
            }
            onSuccess()
            onClose()
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to save supplier')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (field: keyof Supplier, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{supplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
                    <DialogDescription>
                        {supplier ? 'Update supplier information' : 'Add a new supplier to your system'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Supplier Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="contact_person">Contact Person</Label>
                                <Input
                                    id="contact_person"
                                    value={formData.contact_person || ''}
                                    onChange={(e) => handleChange('contact_person', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Contact Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone || ''}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                type="url"
                                value={formData.website || ''}
                                onChange={(e) => handleChange('website', e.target.value)}
                                placeholder="https://"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Address</h3>
                        <div>
                            <Label htmlFor="address">Street Address</Label>
                            <Textarea
                                id="address"
                                value={formData.address || ''}
                                onChange={(e) => handleChange('address', e.target.value)}
                                rows={2}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    value={formData.city || ''}
                                    onChange={(e) => handleChange('city', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="postal_code">Postal Code</Label>
                                <Input
                                    id="postal_code"
                                    value={formData.postal_code || ''}
                                    onChange={(e) => handleChange('postal_code', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    value={formData.country || ''}
                                    onChange={(e) => handleChange('country', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Business Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Business Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="tax_number">Tax Number / VAT</Label>
                                <Input
                                    id="tax_number"
                                    value={formData.tax_number || ''}
                                    onChange={(e) => handleChange('tax_number', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="payment_terms">Payment Terms</Label>
                                <Input
                                    id="payment_terms"
                                    value={formData.payment_terms || ''}
                                    onChange={(e) => handleChange('payment_terms', e.target.value)}
                                    placeholder="e.g., Net 30"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes || ''}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                rows={3}
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
                            {supplier ? 'Update Supplier' : 'Create Supplier'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from '@/lib/axios'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function ProductPaymentCallbackPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')
    const [saleData, setSaleData] = useState<any>(null)

    useEffect(() => {
        const reference = searchParams.get('reference')
        
        if (!reference) {
            setStatus('error')
            setMessage('Invalid payment reference')
            return
        }

        verifyPayment(reference)
    }, [searchParams])

    const verifyPayment = async (reference: string) => {
        try {
            const response = await axios.get(`/api/customer/products/payment-callback?reference=${reference}`)
            
            if (response.data.success) {
                setStatus('success')
                setMessage(response.data.message)
                setSaleData(response.data.sale)
            } else {
                setStatus('error')
                setMessage(response.data.message || 'Payment verification failed')
            }
        } catch (error: any) {
            setStatus('error')
            setMessage(error.response?.data?.message || 'Failed to verify payment')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-6">
            <Card className="max-w-md w-full">
                <CardContent className="pt-6">
                    {status === 'loading' && (
                        <div className="text-center py-8">
                            <Loader2 className="h-16 w-16 animate-spin text-pink-600 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold mb-2">Verifying Payment...</h2>
                            <p className="text-gray-600">Please wait while we confirm your payment</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="text-center py-8">
                            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
                            <p className="text-gray-600 mb-6">{message}</p>
                            
                            {saleData && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Sale Number:</span>
                                            <span className="font-semibold">{saleData.sale_number}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Amount:</span>
                                            <span className="font-semibold">R{parseFloat(saleData.total_amount).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Payment Method:</span>
                                            <span className="font-semibold">{saleData.payment_method}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <Button
                                    onClick={() => router.push('/customer/products')}
                                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                                >
                                    Continue Shopping
                                </Button>
                                <Button
                                    onClick={() => router.push('/dashboard')}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Go to Dashboard
                                </Button>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="text-center py-8">
                            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
                            <p className="text-gray-600 mb-6">{message}</p>
                            
                            <div className="space-y-3">
                                <Button
                                    onClick={() => router.push('/customer/products')}
                                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                                >
                                    Try Again
                                </Button>
                                <Button
                                    onClick={() => router.push('/dashboard')}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Go to Dashboard
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
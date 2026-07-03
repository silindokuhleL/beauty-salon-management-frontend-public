'use client'

import { useCallback, useState } from 'react'
import axios from '@/lib/axios'
import type { Service, GuestBookingData, AvailableSlots } from '@/types'

// Alias for backwards compatibility
export type { Service }
export type BookingData = GuestBookingData

export const useGuest = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const getServices = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await axios.get('/api/guest/services')
            return response.data
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to fetch services'
            setError(message)
            throw new Error(message)
        } finally {
            setLoading(false)
        }
    }, [])

    const submitBooking = useCallback(async (bookingData: BookingData) => {
        setLoading(true)
        setError(null)
        try {
            const response = await axios.post('/api/guest/booking', bookingData)
            return response.data
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to submit booking'
            setError(message)
            throw new Error(message)
        } finally {
            setLoading(false)
        }
    }, [])

    const getAvailableSlots = useCallback(async (date: string, tenantId: string): Promise<AvailableSlots> => {
        setLoading(true)
        setError(null)
        try {
            const response = await axios.get(`/api/guest/available-slots?date=${date}&tenant_id=${tenantId}`)
            return response.data
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to fetch available slots'
            setError(message)
            throw new Error(message)
        } finally {
            setLoading(false)
        }
    }, [])

    const getBookingByReference = useCallback(async (reference: string) => {
        setLoading(true)
        setError(null)
        try {
            const response = await axios.get(`/api/guest/booking/${reference}`)
            return response.data
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to fetch booking details'
            setError(message)
            throw new Error(message)
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        loading,
        error,
        getServices,
        submitBooking,
        getAvailableSlots,
        getBookingByReference,
    }
}

'use client'

import { useCallback, useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AppImage } from '@/components/shared/AppImage'
import { 
    Calendar, 
    Clock, 
    User, 
    Phone, 
    DollarSign, 
    CheckCircle, 
    XCircle, 
    AlertCircle,
    Search,
    Filter,
    UserCheck,
    MessageSquare,
    MoreVertical
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/auth'
import axios from '@/lib/axios'
import { format } from 'date-fns'
import RoleBasedRoute from '@/components/RoleBasedRoute'

interface Appointment {
    id: number
    booking_reference?: string
    user: {
        id: number
        name: string
        email: string
        phone?: string
    }
    service: {
        id: number
        name: string
        price: number
        duration_minutes: number
        image_url?: string
        category?: string
    } | null
    service_name: string
    staff: {
        id: number
        name: string
    } | null
    appointment_date: string
    appointment_time: string
    duration_minutes: number
    price: number | string
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
    payment_method?: 'cash' | 'card' | 'wallet' | 'bank_transfer' | 'mobile'
    payment?: {
        id: number
        status: 'pending' | 'paid' | 'completed' | 'failed' | 'refunded'
        amount?: number | string
        transaction_reference?: string | null
        paid_at?: string | null
    } | null
    phone?: string
    notes?: string
    is_guest_booking: boolean
    confirmed_at?: string
    cancelled_at?: string
    cancellation_reason?: string
}

interface AppointmentStats {
    today_appointments: number
    pending_appointments: number
    confirmed_appointments: number
    completed_appointments: number
    cancelled_appointments: number
    this_week_revenue: number
    upcoming_appointments: number
}

interface Staff {
    id: number
    name: string
    email: string
}

function StaffAppointmentsPageContent() {
    const { user } = useAuth({ middleware: 'auth' })
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [stats, setStats] = useState<AppointmentStats | null>(null)
    const [availableStaff, setAvailableStaff] = useState<Staff[]>([])
    const [clients, setClients] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [dateFilter, setDateFilter] = useState('all')
    const [loading, setLoading] = useState(true)

    const fetchAppointments = useCallback(async () => {
        try {
            const params: any = {}
            if (statusFilter !== 'all') params.status = statusFilter
            if (dateFilter === 'today') {
                params.date_from = format(new Date(), 'yyyy-MM-dd')
                params.date_to = format(new Date(), 'yyyy-MM-dd')
            } else if (dateFilter === 'week') {
                const today = new Date()
                const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
                const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6))
                params.date_from = format(weekStart, 'yyyy-MM-dd')
                params.date_to = format(weekEnd, 'yyyy-MM-dd')
            }

            const response = await axios.get('/api/appointments', { params })
            // API Response Structure: { data: [...appointments], current_page, total, per_page, etc }
            // NOT response.data.data.data (that was the bug!)
            const appointmentsData = response.data.data || []
            console.log(' Appointments fetched:', appointmentsData.length, 'appointments')
            console.log(' Full response:', response.data)
            console.log(' Filters applied:', { statusFilter, dateFilter, params })
            setAppointments(appointmentsData)
        } catch (error) {
            console.error('Error fetching appointments:', error)
        } finally {
            setLoading(false)
        }
    }, [dateFilter, statusFilter])

    const fetchStats = useCallback(async () => {
        try {
            const response = await axios.get('/api/appointments/statistics')
            setStats(response.data.data)
        } catch (error) {
            console.error('Error fetching stats:', error)
        }
    }, [])

    const fetchAvailableStaff = useCallback(async () => {
        try {
            const response = await axios.get('/api/appointments/available-staff')
            setAvailableStaff(response.data.data || [])
        } catch (error) {
            console.error('Error fetching available staff:', error)
        }
    }, [])

    const fetchClients = useCallback(async () => {
        try {
            const response = await axios.get('/api/reports/clients')
            setClients(response.data.top_clients || [])
        } catch (error) {
            console.error('Error fetching clients:', error)
        }
    }, [])

    useEffect(() => {
        fetchAppointments()
        fetchStats()
        fetchAvailableStaff()
        fetchClients()
    }, [fetchAppointments, fetchStats, fetchAvailableStaff, fetchClients])

    const updateAppointmentStatus = async (appointmentId: number, status: string, notes?: string, cancellationReason?: string) => {
        try {
            const data: any = { status }
            if (notes) data.notes = notes
            if (cancellationReason) data.cancellation_reason = cancellationReason

            const response = await axios.patch(`/api/appointments/${appointmentId}/status`, data)
            
            // Update local state
            setAppointments(prev => prev.map(apt => 
                apt.id === appointmentId ? { ...apt, ...response.data.data } : apt
            ))
            
            // Refresh stats
            fetchStats()
        } catch (error) {
            console.error('Error updating appointment status:', error)
        }
    }

    const assignStaff = async (appointmentId: number, staffId: number) => {
        try {
            const response = await axios.patch(`/api/appointments/${appointmentId}/assign-staff`, {
                staff_id: staffId
            })
            
            // Update local state
            setAppointments(prev => prev.map(apt => 
                apt.id === appointmentId ? { ...apt, ...response.data.data } : apt
            ))
        } catch (error) {
            console.error('Error assigning staff:', error)
        }
    }

    const filteredAppointments = appointments.filter(appointment => {
        const matchesSearch = 
            appointment.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.booking_reference?.toLowerCase().includes(searchTerm.toLowerCase())
        
        return matchesSearch
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
            case 'no_show': return 'bg-gray-100 text-gray-800 border-gray-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed': return <CheckCircle className="h-4 w-4" />
            case 'pending': return <AlertCircle className="h-4 w-4" />
            case 'completed': return <CheckCircle className="h-4 w-4" />
            case 'cancelled': return <XCircle className="h-4 w-4" />
            case 'no_show': return <XCircle className="h-4 w-4" />
            default: return <AlertCircle className="h-4 w-4" />
        }
    }

    const getPaymentStatusColor = (status?: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-700 border-green-200'
            case 'completed': return 'bg-green-100 text-green-700 border-green-200'
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case 'failed': return 'bg-red-100 text-red-700 border-red-200'
            case 'refunded': return 'bg-purple-100 text-purple-700 border-purple-200'
            default: return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const markCashPaymentAsPaid = async (appointmentId: number) => {
        if (!confirm('Mark this cash payment as completed?')) {
            return
        }

        try {
            const response = await axios.post(`/api/payment/cash/${appointmentId}/mark-paid`)
            
            if (response.data.success) {
                // Refresh appointments to get updated payment status
                fetchAppointments()
                alert('Payment marked as paid!')
            }
        } catch (err: any) {
            console.error('Error marking payment as paid:', err)
            alert('Failed to mark payment as paid: ' + (err.response?.data?.message || 'Unknown error'))
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg shadow p-6">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        Appointment Management
                    </h1>
                    <p className="text-gray-600 mt-2">Manage and track all salon appointments</p>
                </div>
                <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    New Appointment
                </Button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                            <Calendar className="h-4 w-4 text-pink-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-pink-600">{stats.today_appointments}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending_appointments}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.confirmed_appointments}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Week Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">${stats.this_week_revenue.toFixed(2)}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                type="text"
                                placeholder="Search appointments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                <SelectItem value="no_show">No Show</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger>
                                <Calendar className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="All Dates" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Dates</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">This Week</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setSearchTerm('')
                                setStatusFilter('all')
                                setDateFilter('all')
                            }}
                        >
                            Clear Filters

                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="appointments" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="appointments">All Appointments</TabsTrigger>
                    <TabsTrigger value="schedule">Today's Schedule</TabsTrigger>
                </TabsList>

                <TabsContent value="appointments" className="space-y-4">
                    <div className="space-y-4">
                        {filteredAppointments.length === 0 ? (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center py-8">
                                        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
                                        <p className="mt-1 text-sm text-gray-500">No appointments found matching your filters.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredAppointments.map((appointment) => {
                                const isOwnerAppointment = appointment.staff?.id === user?.id
                                return (
                                <Card key={appointment.id} className={`hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 ${
                                    isOwnerAppointment 
                                        ? 'border-l-amber-500 ring-2 ring-amber-200' 
                                        : 'border-l-pink-500'
                                }`}>
                                    <div className="flex flex-col md:flex-row">
                                        {/* Service Image */}
                                        {appointment.service?.image_url && (
                                            <div className="md:w-48 h-48 md:h-auto relative overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
                                                <AppImage
                                                    src={
                                                        appointment.service.image_url.startsWith('http')
                                                            ? appointment.service.image_url
                                                            : `${process.env.NEXT_PUBLIC_BACKEND_URL}${appointment.service.image_url}`
                                                    }
                                                    alt={appointment.service_name}
                                                    className="w-full h-full object-cover"
                                                    fallbackSrc="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                                    sizes="(max-width: 768px) 100vw, 192px"
                                                />
                                                {appointment.service?.category && (
                                                    <div className="absolute top-2 left-2">
                                                        <Badge className="bg-white/90 text-gray-900">
                                                            {appointment.service.category}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        {/* Content */}
                                        <div className="flex-1">
                                            <CardHeader>
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <CardTitle className="flex items-center gap-2 text-xl">
                                                            <User className="h-5 w-5 text-pink-600" />
                                                            {appointment.user.name}
                                                        </CardTitle>
                                                        <CardDescription className="mt-2 flex flex-wrap items-center gap-3">
                                                            <span className="font-semibold text-gray-900">{appointment.service_name}</span>
                                                            {appointment.booking_reference && (
                                                                <span className="text-xs font-mono bg-pink-100 text-pink-700 px-2 py-1 rounded">
                                                                    #{appointment.booking_reference}
                                                                </span>
                                                            )}
                                                        </CardDescription>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <Badge className={`border-2 px-3 py-1.5 ${getStatusColor(appointment.status)}`}>
                                                            {getStatusIcon(appointment.status)}
                                                            <span className="ml-2 font-semibold capitalize">{appointment.status}</span>
                                                        </Badge>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                
                                                                {appointment.status === 'pending' && (
                                                                    <>
                                                                        <DropdownMenuItem onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}>
                                                                            <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                                                                            Confirm
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => updateAppointmentStatus(appointment.id, 'cancelled', undefined, 'Cancelled by admin')}>
                                                                            <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                                                            Cancel
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                                
                                                                {appointment.status === 'confirmed' && (
                                                                    <>
                                                                        <DropdownMenuItem onClick={() => updateAppointmentStatus(appointment.id, 'completed')}>
                                                                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                                                            Complete
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => updateAppointmentStatus(appointment.id, 'cancelled', undefined, 'Cancelled by admin')}>
                                                                            <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                                                            Cancel
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                                
                                                                {availableStaff.length > 0 && (
                                                                    <>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuLabel>Assign Staff</DropdownMenuLabel>
                                                                        {availableStaff.map((staff) => (
                                                                            <DropdownMenuItem 
                                                                                key={staff.id}
                                                                                onClick={() => assignStaff(appointment.id, staff.id)}
                                                                            >
                                                                                <UserCheck className="h-4 w-4 mr-2" />
                                                                                {staff.name}
                                                                            </DropdownMenuItem>
                                                                        ))}
                                                                    </>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-gray-500" />
                                                        <div>
                                                            <p className="text-xs text-gray-500">Date</p>
                                                            <p className="font-medium">{format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-gray-500" />
                                                        <div>
                                                            <p className="text-xs text-gray-500">Time</p>
                                                            <p className="font-medium">{appointment.appointment_time} ({appointment.duration_minutes}min)</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-gray-500" />
                                                        <div>
                                                            <p className="text-xs text-gray-500">Phone</p>
                                                            <p className="font-medium">{appointment.phone || appointment.user.phone || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="h-4 w-4 text-gray-500" />
                                                        <div>
                                                            <p className="text-xs text-gray-500">Price</p>
                                                            <p className="font-medium text-green-600">R{Number(appointment.price).toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Staff Assignment */}
                                                {appointment.staff && (
                                                    <div className={`mb-4 p-3 rounded-lg border ${
                                                        isOwnerAppointment
                                                            ? 'bg-amber-50 border-amber-300'
                                                            : 'bg-purple-50 border-purple-200'
                                                    }`}>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <UserCheck className={`h-4 w-4 ${
                                                                isOwnerAppointment ? 'text-amber-600' : 'text-purple-600'
                                                            }`} />
                                                            <span className={`font-medium ${
                                                                isOwnerAppointment ? 'text-amber-900' : 'text-purple-900'
                                                            }`}>Assigned to:</span>
                                                            <span className={isOwnerAppointment ? 'text-amber-700' : 'text-purple-700'}>
                                                                {appointment.staff.name}
                                                            </span>
                                                            <Badge variant="outline" className={`border text-xs ${
                                                                isOwnerAppointment
                                                                    ? 'bg-amber-100 text-amber-700 border-amber-400'
                                                                    : 'bg-purple-100 text-purple-700 border-purple-300'
                                                            }`}>
                                                                {isOwnerAppointment ? '👑 Your Appointment' : 'Staff Assigned'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                )}

                                        {appointment.notes && (
                                            <div className="mt-4 p-3 bg-gray-50 rounded-md">
                                                <p className="text-sm text-gray-600">{appointment.notes}</p>
                                            </div>
                                        )}

                                        {appointment.cancellation_reason && (
                                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                                <p className="text-sm text-red-700">
                                                    <strong>Cancellation reason:</strong> {appointment.cancellation_reason}
                                                </p>
                                            </div>
                                                )}

                                                {/* Payment Status & Actions */}
                                        <div className="mt-4 flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-700">Payment:</span>
                                                <Badge className={`${getPaymentStatusColor(appointment.payment?.status || 'pending')}`}>
                                                    {appointment.payment?.status || 'pending'}
                                                </Badge>
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                    {appointment.payment_method || 'N/A'}
                                                </Badge>
                                            </div>
                                            
                                            {/* Mark Cash as Paid Button */}
                                            {appointment.payment_method === 'cash' && appointment.payment?.status === 'pending' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => markCashPaymentAsPaid(appointment.id)}
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Mark as Paid
                                                </Button>
                                            )}
                                        </div>

                                        {/* Quick Status Actions */}
                                        {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {appointment.status === 'pending' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Confirm
                                                    </Button>
                                                )}
                                                {appointment.status === 'confirmed' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Complete
                                                    </Button>
                                                )}
                                                {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => updateAppointmentStatus(appointment.id, 'cancelled', undefined, 'Cancelled by admin')}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        Cancel
                                                    </Button>
                                                )}
                                            </div>
                                                )}
                                            </CardContent>
                                        </div>
                                    </div>
                                </Card>
                            )})
                        )}
                    </div>
                </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-pink-600" />
                            Today's Schedule
                        </CardTitle>
                        <CardDescription>
                            {format(new Date(), 'EEEE, MMMM dd, yyyy')} • 
                            {filteredAppointments.filter(apt => format(new Date(apt.appointment_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).length} appointments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {filteredAppointments
                                .filter(apt => format(new Date(apt.appointment_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
                                .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                                .length === 0 ? (
                                    <div className="text-center py-12">
                                        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Appointments Today</h3>
                                        <p className="text-gray-600">You have a clear schedule for today</p>
                                    </div>
                                ) : (
                                    filteredAppointments
                                        .filter(apt => format(new Date(apt.appointment_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
                                        .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                                        .map((appointment) => (
                                            <div key={appointment.id} className="flex items-center gap-4 p-4 border-l-4 border-l-pink-500 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                                {/* Time Badge */}
                                                <div className="flex flex-col items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-lg p-3 min-w-[80px]">
                                                    <Clock className="h-5 w-5 mb-1" />
                                                    <span className="text-lg font-bold">{appointment.appointment_time}</span>
                                                    <span className="text-xs opacity-90">{appointment.duration_minutes}min</span>
                                                </div>
                                                
                                                {/* Service Image */}
                                                {appointment.service?.image_url && (
                                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                                        <AppImage
                                                            src={
                                                                appointment.service.image_url.startsWith('http')
                                                                    ? appointment.service.image_url
                                                                    : `${process.env.NEXT_PUBLIC_BACKEND_URL}${appointment.service.image_url}`
                                                            }
                                                            alt={appointment.service_name}
                                                            className="w-full h-full object-cover"
                                                            fallbackSrc="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                                            sizes="64px"
                                                        />
                                                    </div>
                                                )}
                                                
                                                {/* Appointment Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-gray-900 truncate">{appointment.user.name}</h4>
                                                            <p className="text-sm text-gray-600 truncate">{appointment.service_name}</p>
                                                            {appointment.staff && (
                                                                <div className="flex items-center gap-1 mt-1">
                                                                    <UserCheck className="h-3 w-3 text-purple-600" />
                                                                    <span className="text-xs text-purple-700">{appointment.staff.name}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1">
                                                            <Badge className={`${getStatusColor(appointment.status)} text-xs`}>
                                                                {getStatusIcon(appointment.status)}
                                                                <span className="ml-1 capitalize">{appointment.status}</span>
                                                            </Badge>
                                                            <span className="text-xs font-mono bg-pink-100 text-pink-700 px-2 py-0.5 rounded">
                                                                #{appointment.booking_reference}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Quick Actions */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="flex-shrink-0">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        {appointment.status === 'pending' && (
                                                            <DropdownMenuItem onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}>
                                                                <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                                                                Confirm
                                                            </DropdownMenuItem>
                                                        )}
                                                        {appointment.status === 'confirmed' && (
                                                            <DropdownMenuItem onClick={() => updateAppointmentStatus(appointment.id, 'completed')}>
                                                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                                                Complete
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        ))
                                )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
        </div>
    )
}

export default function StaffAppointmentsPage() {
    return (
        <RoleBasedRoute requiredPermissions={['view appointments']} allowedRoles={['Admin', 'Owner', 'Manager', 'Staff', 'Receptionist']}>
            <StaffAppointmentsPageContent />
        </RoleBasedRoute>
    )
}

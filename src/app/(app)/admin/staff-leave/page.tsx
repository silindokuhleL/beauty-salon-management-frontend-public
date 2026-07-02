'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/auth'
import axios from '@/lib/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar, Clock, User, AlertCircle, CheckCircle, XCircle, Plus, Mail, Users } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import RoleBasedRoute from '@/components/RoleBasedRoute'

interface StaffMember {
    id: number
    name: string
    email: string
    specialization?: string
}

interface StaffLeave {
    id: number
    staff_id: number
    start_date: string
    end_date: string
    leave_type: string
    status: string
    reason?: string
    notes?: string
    affected_appointments_count: number
    reassigned_appointments_count: number
    customers_notified: boolean
    customers_notified_at?: string
    staff: StaffMember
    created_by?: StaffMember
    created_at: string
}

interface Appointment {
    id: number
    user: { name: string; email: string }
    service_name: string
    appointment_date: string
    appointment_time: string
    status: string
}

function StaffLeavePageContent() {
    const { user } = useAuth({ middleware: 'auth' })
    const [leaves, setLeaves] = useState<StaffLeave[]>([])
    const [staff, setStaff] = useState<StaffMember[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [selectedLeave, setSelectedLeave] = useState<StaffLeave | null>(null)
    const [affectedAppointments, setAffectedAppointments] = useState<Appointment[]>([])
    const [selectedAppointments, setSelectedAppointments] = useState<number[]>([])
    const [reassignStaffId, setReassignStaffId] = useState<string>('')

    const [formData, setFormData] = useState({
        staff_id: '',
        start_date: '',
        end_date: '',
        leave_type: 'personal',
        reason: '',
        notes: '',
        notify_customers: true,
    })

    useEffect(() => {
        fetchLeaves()
        fetchStaff()
    }, [])

    const fetchLeaves = async () => {
        try {
            const response = await axios.get('/api/staff-leave')
            setLeaves(response.data.leaves)
        } catch (error) {
            console.error('Failed to fetch leaves:', error)
            toast.error('Failed to load staff leave records')
        } finally {
            setLoading(false)
        }
    }

    const fetchStaff = async () => {
        try {
            const response = await axios.get('/api/staff-leave/staff-list')
            setStaff(response.data.staff || [])
        } catch (error) {
            console.error('Failed to fetch staff:', error)
            toast.error('Failed to load staff list')
        }
    }

    const handleCreateLeave = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.staff_id || !formData.start_date || !formData.end_date) {
            toast.error('Please fill in all required fields')
            return
        }

        try {
            const response = await axios.post('/api/staff-leave', formData)
            toast.success('Staff leave created successfully')
            setLeaves([response.data.leave, ...leaves])
            setIsCreateModalOpen(false)
            resetForm()

            if (response.data.affected_appointments?.length > 0) {
                toast.success(`${response.data.affected_appointments.length} customers notified`)
            }
        } catch (error: any) {
            console.error('Failed to create leave:', error)
            toast.error(error.response?.data?.message || 'Failed to create staff leave')
        }
    }

    const fetchAffectedAppointments = async (leaveId: number) => {
        try {
            const leave = leaves.find(l => l.id === leaveId)
            if (!leave) return

            const response = await axios.post('/api/staff-leave/affected-appointments', {
                staff_id: leave.staff_id,
                start_date: leave.start_date,
                end_date: leave.end_date,
            })
            setAffectedAppointments(response.data.appointments)
            setSelectedLeave(leave)
        } catch (error) {
            console.error('Failed to fetch affected appointments:', error)
            toast.error('Failed to load affected appointments')
        }
    }

    const handleReassignAppointments = async () => {
        if (!selectedLeave || selectedAppointments.length === 0 || !reassignStaffId) {
            toast.error('Please select appointments and a staff member')
            return
        }

        try {
            await axios.post(`/api/staff-leave/${selectedLeave.id}/reassign`, {
                appointment_ids: selectedAppointments,
                new_staff_id: parseInt(reassignStaffId),
            })
            toast.success('Appointments reassigned successfully')
            fetchLeaves()
            setSelectedLeave(null)
            setSelectedAppointments([])
            setReassignStaffId('')
        } catch (error) {
            console.error('Failed to reassign appointments:', error)
            toast.error('Failed to reassign appointments')
        }
    }

    const handleDeleteLeave = async (leaveId: number) => {
        if (!confirm('Are you sure you want to delete this leave record?')) return

        try {
            await axios.delete(`/api/staff-leave/${leaveId}`)
            toast.success('Leave record deleted')
            setLeaves(leaves.filter(l => l.id !== leaveId))
        } catch (error) {
            console.error('Failed to delete leave:', error)
            toast.error('Failed to delete leave record')
        }
    }

    const handleApproveLeave = async (leaveId: number) => {
        try {
            const response = await axios.post(`/api/staff-leave/${leaveId}/approve`)
            toast.success('Leave approved successfully')
            fetchLeaves()
        } catch (error) {
            console.error('Failed to approve leave:', error)
            toast.error('Failed to approve leave')
        }
    }

    const handleRejectLeave = async (leaveId: number) => {
        const reason = prompt('Reason for rejection (optional):')
        try {
            await axios.post(`/api/staff-leave/${leaveId}/reject`, {
                rejection_reason: reason
            })
            toast.success('Leave rejected')
            fetchLeaves()
        } catch (error) {
            console.error('Failed to reject leave:', error)
            toast.error('Failed to reject leave')
        }
    }

    const resetForm = () => {
        setFormData({
            staff_id: '',
            start_date: '',
            end_date: '',
            leave_type: 'personal',
            reason: '',
            notes: '',
            notify_customers: true,
        })
    }

    const getLeaveTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            sick: 'bg-red-100 text-red-700 border-red-300',
            vacation: 'bg-blue-100 text-blue-700 border-blue-300',
            personal: 'bg-purple-100 text-purple-700 border-purple-300',
            emergency: 'bg-orange-100 text-orange-700 border-orange-300',
            other: 'bg-gray-100 text-gray-700 border-gray-300',
        }
        return colors[type] || colors.other
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            approved: 'bg-green-100 text-green-700',
            pending: 'bg-yellow-100 text-yellow-700',
            rejected: 'bg-red-100 text-red-700',
            cancelled: 'bg-gray-100 text-gray-700',
        }
        return colors[status] || colors.pending
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        Staff Leave Management
                    </h1>
                    <p className="text-gray-600 mt-1">Manage staff availability and notify affected customers</p>
                </div>
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-pink-600 to-purple-600">
                            <Plus className="h-4 w-4 mr-2" />
                            Mark Staff Unavailable
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create Staff Leave</DialogTitle>
                            <DialogDescription>
                                Mark a staff member as unavailable. Customers with affected appointments will be notified automatically.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateLeave} className="space-y-4">
                            <div>
                                <Label>Staff Member *</Label>
                                <Select value={formData.staff_id} onValueChange={(value) => setFormData({...formData, staff_id: value})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select staff member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {staff.map((s) => (
                                            <SelectItem key={s.id} value={s.id.toString()}>
                                                {s.name} {s.specialization && `(${s.specialization})`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Start Date *</Label>
                                    <Input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>End Date *</Label>
                                    <Input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Leave Type *</Label>
                                <Select value={formData.leave_type} onValueChange={(value) => setFormData({...formData, leave_type: value})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sick">Sick Leave</SelectItem>
                                        <SelectItem value="vacation">Vacation</SelectItem>
                                        <SelectItem value="personal">Personal</SelectItem>
                                        <SelectItem value="emergency">Emergency</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Reason</Label>
                                <Textarea
                                    value={formData.reason}
                                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                    placeholder="Optional reason for leave"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label>Internal Notes</Label>
                                <Textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                    placeholder="Internal notes (not visible to customers)"
                                    rows={2}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="notify"
                                    checked={formData.notify_customers}
                                    onChange={(e) => setFormData({...formData, notify_customers: e.target.checked})}
                                    className="rounded border-gray-300 border"
                                />
                                <Label htmlFor="notify" className="cursor-pointer">
                                    Send email notifications to affected customers
                                </Label>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-gradient-to-r from-pink-600 to-purple-600">
                                    Create Leave
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Leaves</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{leaves.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Active Leaves</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {leaves.filter(l => l.status === 'approved' && new Date(l.end_date) >= new Date()).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Affected Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {leaves.reduce((sum, l) => sum + l.affected_appointments_count, 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Reassigned</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {leaves.reduce((sum, l) => sum + l.reassigned_appointments_count, 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Leave Records */}
            <Card>
                <CardHeader>
                    <CardTitle>Leave Records</CardTitle>
                    <CardDescription>All staff leave and unavailability records</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {leaves.length === 0 ? (
                            <div className="text-center py-12">
                                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Leave Records</h3>
                                <p className="text-gray-600">No staff leave records found</p>
                            </div>
                        ) : (
                            leaves.map((leave) => (
                                <Card key={leave.id} className="border-l-4 border-l-pink-500">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <User className="h-5 w-5 text-pink-600" />
                                                    <h3 className="text-lg font-semibold">{leave.staff.name}</h3>
                                                    <Badge className={getLeaveTypeColor(leave.leave_type)}>
                                                        {leave.leave_type}
                                                    </Badge>
                                                    <Badge className={getStatusColor(leave.status)}>
                                                        {leave.status}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                                    <div>
                                                        <p className="text-gray-500">Start Date</p>
                                                        <p className="font-medium">{format(new Date(leave.start_date), 'MMM dd, yyyy')}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">End Date</p>
                                                        <p className="font-medium">{format(new Date(leave.end_date), 'MMM dd, yyyy')}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Affected Appointments</p>
                                                        <p className="font-medium text-red-600">{leave.affected_appointments_count}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Reassigned</p>
                                                        <p className="font-medium text-green-600">{leave.reassigned_appointments_count}</p>
                                                    </div>
                                                </div>

                                                {leave.reason && (
                                                    <div className="mb-3">
                                                        <p className="text-sm text-gray-500">Reason:</p>
                                                        <p className="text-sm">{leave.reason}</p>
                                                    </div>
                                                )}

                                                {leave.customers_notified && (
                                                    <div className="flex items-center gap-2 text-sm text-green-600">
                                                        <Mail className="h-4 w-4" />
                                                        <span>Customers notified on {format(new Date(leave.customers_notified_at!), 'MMM dd, yyyy HH:mm')}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                {leave.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700"
                                                            onClick={() => handleApproveLeave(leave.id)}
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleRejectLeave(leave.id)}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-2" />
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                                {leave.affected_appointments_count > 0 && leave.status === 'approved' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => fetchAffectedAppointments(leave.id)}
                                                    >
                                                        <Users className="h-4 w-4 mr-2" />
                                                        View Appointments
                                                    </Button>
                                                )}
                                                {leave.status !== 'pending' && (
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDeleteLeave(leave.id)}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Affected Appointments Modal */}
            {selectedLeave && (
                <Dialog open={!!selectedLeave} onOpenChange={() => setSelectedLeave(null)}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Affected Appointments - {selectedLeave.staff.name}</DialogTitle>
                            <DialogDescription>
                                {format(new Date(selectedLeave.start_date), 'MMM dd')} - {format(new Date(selectedLeave.end_date), 'MMM dd, yyyy')}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {affectedAppointments.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No affected appointments</p>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        {affectedAppointments.map((apt) => (
                                            <div key={apt.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAppointments.includes(apt.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedAppointments([...selectedAppointments, apt.id])
                                                        } else {
                                                            setSelectedAppointments(selectedAppointments.filter(id => id !== apt.id))
                                                        }
                                                    }}
                                                    className="rounded border-gray-300 border"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium">{apt.user.name}</p>
                                                    <p className="text-sm text-gray-600">{apt.service_name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {format(new Date(apt.appointment_date), 'MMM dd, yyyy')} at {apt.appointment_time}
                                                    </p>
                                                </div>
                                                <Badge>{apt.status}</Badge>
                                            </div>
                                        ))}
                                    </div>

                                    {selectedAppointments.length > 0 && (
                                        <div className="border-t pt-4">
                                            <Label>Reassign to Staff Member</Label>
                                            <div className="flex gap-2 mt-2">
                                                <Select value={reassignStaffId} onValueChange={setReassignStaffId}>
                                                    <SelectTrigger className="flex-1">
                                                        <SelectValue placeholder="Select staff member" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {staff.filter(s => s.id !== selectedLeave.staff_id).map((s) => (
                                                            <SelectItem key={s.id} value={s.id.toString()}>
                                                                {s.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Button onClick={handleReassignAppointments}>
                                                    Reassign ({selectedAppointments.length})
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}

export default function StaffLeavePage() {
    return (
        <RoleBasedRoute allowedRoles={['Admin', 'Owner', 'Manager']}>
            <StaffLeavePageContent />
        </RoleBasedRoute>
    )
}

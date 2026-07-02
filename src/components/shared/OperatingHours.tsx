import { Clock } from 'lucide-react'

interface OperatingHoursProps {
  hours: {
    day: string
    open: string
    close: string
    closed: boolean
  } | null
  compact?: boolean
  className?: string
}

export function OperatingHours({ hours, compact = false, className = '' }: OperatingHoursProps) {
  if (!hours) return null

  if (compact) {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <Clock className="w-4 h-4 text-gray-500" />
        <span className={hours.closed ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
          {hours.closed ? 'Closed' : `${formatTime(hours.open)} - ${formatTime(hours.close)}`}
        </span>
      </div>
    )
  }

  return (
    <div className={`p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg ${className}`}>
      <div className="flex items-start gap-3">
        <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <p className="font-semibold text-gray-900">
            {hours.day} Hours
          </p>
          <p className="text-lg font-medium">
            {hours.closed ? (
              <span className="text-red-600">Closed</span>
            ) : (
              <span className="text-blue-900">
                {formatTime(hours.open)} - {formatTime(hours.close)}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

// Helper function to format time (e.g., "09:00" -> "9:00 AM")
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

// Weekly schedule component
interface WeeklyScheduleProps {
  hours: Array<{
    day: string
    open: string
    close: string
    closed: boolean
  }>
  className?: string
}

export function WeeklySchedule({ hours, className = '' }: WeeklyScheduleProps) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  
  return (
    <div className={`${className}`}>
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-900">
        <Clock className="w-5 h-5 text-purple-600" />
        Operating Hours
      </h3>
      <div className="space-y-2">
        {days.map(day => {
          const dayHours = hours.find(h => h.day === day)
          const isToday = day === today
          return (
            <div 
              key={day} 
              className={`flex justify-between items-center p-4 rounded-xl transition-all duration-200 ${
                isToday 
                  ? 'bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-300 shadow-sm' 
                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className={`font-semibold text-base ${isToday ? 'text-pink-900' : 'text-gray-800'}`}>
                {day}
                {isToday && <span className="ml-3 text-xs bg-pink-500 text-white px-2.5 py-1 rounded-full font-medium">Today</span>}
              </span>
              <span className={`font-semibold text-base ${dayHours?.closed ? 'text-red-600' : 'text-green-600'}`}>
                {dayHours?.closed ? 'Closed' : dayHours ? `${formatTime(dayHours.open)} - ${formatTime(dayHours.close)}` : 'Not set'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

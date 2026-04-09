export interface TimeSlot {
  id: number
  working_day_id: number
  start_time: string
  end_time: string
  status: 'available' | 'reserved'
  is_open: boolean
}

export interface WorkingDay {
  id: number
  date: string
  is_open: boolean
  time_slots: TimeSlot[]
}

export interface DeleteTarget {
  type: 'day' | 'slot'
  id: number
  label: string
}

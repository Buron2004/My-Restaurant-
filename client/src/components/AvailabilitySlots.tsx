import { useQuery } from '@tanstack/react-query'
import { fetchAvailability } from '../api/reservations'

interface Props {
  date: string
  partySize: number
  selectedTime?: string
  onSelectTime: (time: string) => void
  onBack: () => void
}

export function AvailabilitySlots({ date, partySize, selectedTime, onSelectTime, onBack }: Props) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['availability', date, partySize],
    queryFn: () => fetchAvailability(date, partySize),
  })

  return (
    <div className="bg-[#fffdfa] border border-stone-200 rounded-xl shadow-[0_1.5rem_4rem_rgba(31,46,34,0.1)] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-stone-500">
            {new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}{' '}
            &middot; Party of {partySize}
          </p>
          <h2 className="text-xl font-bold">Choose a time</h2>
        </div>
        <button onClick={onBack} className="text-sm text-[#4B6B4F] font-semibold hover:underline">
          Change
        </button>
      </div>

      {isLoading && <p className="text-stone-500 py-6 text-center">Checking availability…</p>}

      {isError && (
        <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error instanceof Error ? error.message : 'Could not load availability. Please try again.'}
        </p>
      )}

      {data && data.data.slots.every((slot) => !slot.available) && (
        <p className="text-stone-600 bg-stone-50 border border-stone-200 rounded-lg px-4 py-3">
          No tables are available for this date and party size. Please try a different date.
        </p>
      )}

      {data && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {data.data.slots.map((slot) => (
            <button
              key={slot.time}
              type="button"
              disabled={!slot.available}
              onClick={() => onSelectTime(slot.time)}
              className={`rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${
                !slot.available
                  ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                  : selectedTime === slot.time
                    ? 'bg-[#1F2E22] text-[#FBF6EC] border-[#1F2E22]'
                    : 'bg-white text-stone-800 border-stone-300 hover:border-[#4B6B4F]'
              }`}
            >
              {slot.time}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
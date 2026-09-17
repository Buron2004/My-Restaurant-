import type { Reservation } from '../types/reservation'

interface Props {
  reservation: Reservation
  onBookAnother: () => void
}

export function ReservationConfirmation({ reservation, onBookAnother }: Props) {
  return (
    <div className="bg-[#fffdfa] border border-stone-200 rounded-xl shadow-[0_1.5rem_4rem_rgba(31,46,34,0.1)] p-6 space-y-5 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-2xl">
        ✓
      </div>
      <div>
        <h2 className="text-2xl font-bold">Reservation confirmed</h2>
        <p className="text-stone-500 mt-1">We look forward to seeing you, {reservation.guestName}.</p>
      </div>

      <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 text-left space-y-2">
        <div className="flex justify-between">
          <span className="text-stone-500">Reference</span>
          <span className="font-semibold">{reservation.referenceCode}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">Date</span>
          <span className="font-semibold">
            {new Date(reservation.reservationDate).toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">Time</span>
          <span className="font-semibold">
            {new Date(reservation.startTime).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'UTC',
            })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">Party size</span>
          <span className="font-semibold">{reservation.partySize}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">Table</span>
          <span className="font-semibold">
            {reservation.table.name} ({reservation.table.location.toLowerCase()})
          </span>
        </div>
      </div>

      <p className="text-sm text-stone-500">
        Save your reference code — you'll need it to look up or cancel this reservation.
      </p>

      <button
        onClick={onBookAnother}
        className="w-full bg-white border border-[#1F2E22] text-[#1F2E22] hover:bg-stone-50 font-semibold rounded-lg px-4 py-2.5 transition-colors"
      >
        Book another reservation
      </button>
    </div>
  )
}
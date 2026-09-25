import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
//import { Link } from 'react-router-dom'
import { z } from 'zod'
import { cancelReservation, lookupReservation } from '../api/reservations'
import type { Reservation } from '../types/reservation'
import { BackButton } from '../components/BackButton'
import toast from 'react-hot-toast'

const FOREST = '#1F2E22'
const PARCHMENT = '#FBF6EC'
const HERB = '#4B6B4F'
const CHARCOAL = '#241C16'

const schema = z.object({
  referenceCode: z.string().trim().min(1, 'Enter your reservation reference.'),
  guestPhone: z.string().trim().min(1, 'Enter the phone number used to book.'),
})

type FormValues = z.infer<typeof schema>

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function ManageReservationPage() {
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [lastCredentials, setLastCredentials] = useState<FormValues | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const lookupMutation = useMutation({
    mutationFn: (values: FormValues) => lookupReservation(values.referenceCode, values.guestPhone),
    onSuccess: (response, values) => {
      setReservation(response.data)
      setLastCredentials(values)
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () => {
      if (!lastCredentials) throw new Error('Missing lookup details.')
      return cancelReservation(lastCredentials)
    },
    onSuccess: (response) => {
      setReservation(response.data)
      setShowCancelConfirm(false)
      toast.success('Reservation cancelled.')
    },
  })

  const isCancellable = reservation && ['PENDING', 'CONFIRMED'].includes(reservation.status)

  return (
    <div style={{ background: PARCHMENT, minHeight: '100vh' }} className="py-12 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center">
          <BackButton to="/" />
          <p className="text-sm font-semibold uppercase tracking-wide mt-4" style={{ color: HERB }}>
            Manage reservation
          </p>
          <h1 className="text-4xl font-bold mt-1" style={{ color: CHARCOAL }}>
            Find your booking
          </h1>
        </div>

        {!reservation && (
          <form
            onSubmit={handleSubmit((values) => lookupMutation.mutate(values))}
            className="bg-[#fffdfa] border border-stone-200 rounded-xl shadow-[0_1.5rem_4rem_rgba(31,46,34,0.1)] p-6 space-y-5"
          >
            {lookupMutation.isError && (
              <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {lookupMutation.error instanceof Error ? lookupMutation.error.message : 'Something went wrong.'}
              </p>
            )}

            <div>
              <label htmlFor="referenceCode" className="block text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: HERB }}>
                Reference code
              </label>
              <input
                id="referenceCode"
                placeholder="RSV-XXXXXX"
                {...register('referenceCode')}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E3A008] focus:border-[#4B6B4F]"
              />
              {errors.referenceCode && <p className="text-sm text-red-700 mt-1">{errors.referenceCode.message}</p>}
            </div>

            <div>
              <label htmlFor="guestPhone" className="block text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: HERB }}>
                Phone number
              </label>
              <input
                id="guestPhone"
                {...register('guestPhone')}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E3A008] focus:border-[#4B6B4F]"
              />
              {errors.guestPhone && <p className="text-sm text-red-700 mt-1">{errors.guestPhone.message}</p>}
            </div>

            <button
              type="submit"
              disabled={lookupMutation.isPending}
              className="w-full font-semibold rounded-lg px-4 py-2.5 transition-colors disabled:opacity-50"
              style={{ background: FOREST, color: PARCHMENT }}
            >
              {lookupMutation.isPending ? 'Looking up…' : 'Find reservation'}
            </button>
          </form>
        )}

        {reservation && (
          <div className="bg-[#fffdfa] border border-stone-200 rounded-xl shadow-[0_1.5rem_4rem_rgba(31,46,34,0.1)] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: CHARCOAL }}>
                {reservation.guestName}'s reservation
              </h2>
              <span
                className="text-xs font-semibold uppercase tracking-wide rounded-full px-3 py-1"
                style={{
                  background: reservation.status === 'CANCELLED' ? '#fee2e2' : '#dcfce7',
                  color: reservation.status === 'CANCELLED' ? '#991b1b' : '#166534',
                }}
              >
                {reservation.status.toLowerCase()}
              </span>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Reference</span>
                <span className="font-semibold">{reservation.referenceCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Date</span>
                <span className="font-semibold">{formatDate(reservation.reservationDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Time</span>
                <span className="font-semibold">{formatTime(reservation.startTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Party size</span>
                <span className="font-semibold">{reservation.partySize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Table</span>
                <span className="font-semibold">{reservation.table.name}</span>
              </div>
            </div>

            {cancelMutation.isError && (
              <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
                {cancelMutation.error instanceof Error ? cancelMutation.error.message : 'Could not cancel this reservation.'}
              </p>
            )}

            {cancelMutation.isSuccess && reservation.status === 'CANCELLED' && (
              <p className="text-sm rounded-lg px-4 py-3" style={{ background: '#dcfce7', color: '#166534' }}>
                Your reservation has been cancelled.
              </p>
            )}

            {isCancellable && !showCancelConfirm && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="w-full border border-red-700 text-red-700 hover:bg-red-50 font-semibold rounded-lg px-4 py-2.5 transition-colors"
              >
                Cancel reservation
              </button>
            )}

            {showCancelConfirm && (
              <div className="space-y-3">
                <p className="text-sm text-stone-600">Are you sure you want to cancel this reservation?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 border border-stone-300 rounded-lg px-4 py-2.5 font-semibold text-stone-700"
                  >
                    Keep it
                  </button>
                  <button
                    onClick={() => cancelMutation.mutate()}
                    disabled={cancelMutation.isPending}
                    className="flex-1 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 font-semibold"
                  >
                    {cancelMutation.isPending ? 'Cancelling…' : 'Yes, cancel'}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setReservation(null)
                setLastCredentials(null)
                setShowCancelConfirm(false)
              }}
              className="text-sm font-semibold"
              style={{ color: HERB }}
            >
              Look up a different reservation
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
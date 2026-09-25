import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { createReservation } from '../api/reservations'
import type { Reservation } from '../types/reservation'
import toast from 'react-hot-toast'

const schema = z.object({
  guestName: z.string().trim().min(1, 'Name is required.'),
  guestPhone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, 'Enter a valid phone number.'),
  guestEmail: z.string().trim().email('Enter a valid email address.').optional().or(z.literal('')),
  specialRequests: z.string().trim().max(500).optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  date: string
  startTime: string
  partySize: number
  onBack: () => void
  onBooked: (reservation: Reservation) => void
}

export function GuestDetailsForm({ date, startTime, partySize, onBack, onBooked }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      createReservation({
        ...values,
        guestEmail: values.guestEmail || undefined,
        partySize,
        reservationDate: date,
        startTime,
      }),
    onSuccess: (response) => {
      toast.success('Reservation confirmed!')
      onBooked(response.data)
    },
  })

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      className="bg-[#fffdfa] border border-stone-200 rounded-xl shadow-[0_1.5rem_4rem_rgba(31,46,34,0.1)] p-6 space-y-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-stone-500">
            {new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}{' '}
            at {startTime} &middot; Party of {partySize}
          </p>
          <h2 className="text-xl font-bold">Your details</h2>
        </div>
        <button type="button" onClick={onBack} className="text-sm text-[#4B6B4F] font-semibold hover:underline">
          Change time
        </button>
      </div>

      {mutation.isError && (
        <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {mutation.error instanceof Error ? mutation.error.message : 'Something went wrong. Please try again.'}
        </p>
      )}

      <div>
        <label htmlFor="guestName" className="block text-sm font-semibold text-[#4B6B4F] uppercase tracking-wide mb-1">
          Full name
        </label>
        <input
          id="guestName"
          {...register('guestName')}
          className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E3A008] focus:border-[#4B6B4F]"
        />
        {errors.guestName && <p className="text-sm text-red-700 mt-1">{errors.guestName.message}</p>}
      </div>

      <div>
        <label htmlFor="guestPhone" className="block text-sm font-semibold text-[#4B6B4F] uppercase tracking-wide mb-1">
          Phone number
        </label>
        <input
          id="guestPhone"
          {...register('guestPhone')}
          className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E3A008] focus:border-[#4B6B4F]"
        />
        {errors.guestPhone && <p className="text-sm text-red-700 mt-1">{errors.guestPhone.message}</p>}
      </div>

      <div>
        <label htmlFor="guestEmail" className="block text-sm font-semibold text-[#4B6B4F] uppercase tracking-wide mb-1">
          Email <span className="text-stone-400 font-normal normal-case">(optional)</span>
        </label>
        <input
          id="guestEmail"
          type="email"
          {...register('guestEmail')}
          className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E3A008] focus:border-[#4B6B4F]"
        />
        {errors.guestEmail && <p className="text-sm text-red-700 mt-1">{errors.guestEmail.message}</p>}
      </div>

      <div>
        <label htmlFor="specialRequests" className="block text-sm font-semibold text-[#4B6B4F] uppercase tracking-wide mb-1">
          Special requests <span className="text-stone-400 font-normal normal-case">(optional)</span>
        </label>
        <textarea
          id="specialRequests"
          rows={3}
          {...register('specialRequests')}
          className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E3A008] focus:border-[#4B6B4F]"
        />
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full bg-[#1F2E22] hover:bg-[#142018] disabled:bg-stone-300 disabled:cursor-not-allowed text-[#FBF6EC] font-semibold rounded-lg px-4 py-2.5 transition-colors"
      >
        {mutation.isPending ? 'Booking…' : 'Confirm reservation'}
      </button>
    </form>
  )
}
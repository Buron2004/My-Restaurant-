import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
  date: z.string().min(1, 'Please choose a date.'),
  partySize: z.coerce.number().int().min(1, 'At least 1 guest.').max(12, 'For parties over 12, please contact the restaurant directly.'),
})

export type ReservationDateFormValues = z.infer<typeof schema>

interface Props {
  defaultValues?: ReservationDateFormValues
  onSubmit: (values: ReservationDateFormValues) => void
}

export function ReservationDateForm({ defaultValues, onSubmit }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 60)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReservationDateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { date: today, partySize: 2 },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-[#fffdfa] border border-stone-200 rounded-xl shadow-[0_1.5rem_4rem_rgba(31,46,34,0.1)] p-6 space-y-5">
      <div>
        <label htmlFor="date" className="block text-sm font-semibold text-[#4B6B4F] uppercase tracking-wide mb-1">
          Date
        </label>
        <input
          id="date"
          type="date"
          min={today}
          max={maxDate.toISOString().slice(0, 10)}
          {...register('date')}
          className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E3A008] focus:border-[#4B6B4F]"
        />
        {errors.date && <p className="text-sm text-red-700 mt-1">{errors.date.message}</p>}
      </div>

      <div>
        <label htmlFor="partySize" className="block text-sm font-semibold text-[#4B6B4F] uppercase tracking-wide mb-1">
          Party size
        </label>
        <input
          id="partySize"
          type="number"
          min={1}
          max={12}
          {...register('partySize')}
          className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E3A008] focus:border-[#4B6B4F]"
        />
        {errors.partySize && <p className="text-sm text-red-700 mt-1">{errors.partySize.message}</p>}
      </div>

      <button
        type="submit"
        className="w-full bg-[#1F2E22] hover:bg-[#142018] text-[#FBF6EC] font-semibold rounded-lg px-4 py-2.5 transition-colors"
      >
        Check availability
      </button>
    </form>
  )
}
import { useState } from 'react'
import { AvailabilitySlots } from '../components/AvailabilitySlots'
import { GuestDetailsForm } from '../components/GuestDetailsForm'
import { ReservationConfirmation } from '../components/ReservationConfirmation'
import { ReservationDateForm, type ReservationDateFormValues } from '../components/ReservationDateForm'
import type { Reservation } from '../types/reservation'
import { BackButton } from '../components/BackButton'

type Step =
  | { name: 'date' }
  | { name: 'time'; date: string; partySize: number }
  | { name: 'details'; date: string; partySize: number; startTime: string }
  | { name: 'confirmed'; reservation: Reservation }

export default function ReservePage() {
  const [step, setStep] = useState<Step>({ name: 'date' })

  return (
    <div className="min-h-screen bg-[#FBF6EC] py-12 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <BackButton to="/" />
        <div className="text-center">
          <p className="text-sm font-semibold text-red-900 tracking-wide uppercase">Reservations</p>
          <h1 className="text-4xl font-bold mt-1">Book a table</h1>
        </div>

        {step.name === 'date' && (
          <ReservationDateForm
            onSubmit={(values: ReservationDateFormValues) =>
              setStep({ name: 'time', date: values.date, partySize: values.partySize })
            }
          />
        )}

        {step.name === 'time' && (
          <AvailabilitySlots
            date={step.date}
            partySize={step.partySize}
            onSelectTime={(time) =>
              setStep({ name: 'details', date: step.date, partySize: step.partySize, startTime: time })
            }
            onBack={() => setStep({ name: 'date' })}
          />
        )}

        {step.name === 'details' && (
          <GuestDetailsForm
            date={step.date}
            partySize={step.partySize}
            startTime={step.startTime}
            onBack={() => setStep({ name: 'time', date: step.date, partySize: step.partySize })}
            onBooked={(reservation) => setStep({ name: 'confirmed', reservation })}
          />
        )}

        {step.name === 'confirmed' && (
          <ReservationConfirmation reservation={step.reservation} onBookAnother={() => setStep({ name: 'date' })} />
        )}
      </div>
    </div>
  )
}
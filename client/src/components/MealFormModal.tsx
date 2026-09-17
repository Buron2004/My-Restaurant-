import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { uploadImageToCloudinary } from '../api/uploads'
import type { Cuisine, Meal, MealStatus } from '../types/meal'

const mealFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  description: z.string().max(1000, 'Description is too long.').optional(),
  price: z.coerce.number().positive('Price must be greater than zero.').refine((value) => Number.isInteger(value * 100), 'Use no more than 2 decimal places.'),
  cuisineId: z.string().min(1, 'Choose a cuisine.'),
  imageUrl: z.string().url('Enter a valid image URL.').or(z.literal('')).optional(),
  prepTimeMinutes: z.coerce.number().int('Use whole minutes.').positive('Prep time must be positive.'),
  status: z.enum(['AVAILABLE', 'OUT_OF_STOCK', 'ARCHIVED']),
  dietaryTags: z.string().optional(),
  isFeatured: z.boolean(),
})

type MealFormValues = z.infer<typeof mealFormSchema>

type MealFormModalProps = {
  meal: Meal | null
  cuisines: Cuisine[]
  isSaving: boolean
  onClose: () => void
  onSubmit: (values: { name: string; description?: string; price: number; cuisineId: string; imageUrl?: string; prepTimeMinutes: number; status: MealStatus; dietaryTags: string[]; isFeatured: boolean }) => void
}

export function MealFormModal({ meal, cuisines, isSaving, onClose, onSubmit }: MealFormModalProps) {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<z.input<typeof mealFormSchema>, undefined, MealFormValues>({
    resolver: zodResolver(mealFormSchema),
    defaultValues: { name: '', description: '', price: 0, cuisineId: '', imageUrl: '', prepTimeMinutes: 15, status: 'AVAILABLE', dietaryTags: '', isFeatured: false },
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const imageUrl = watch('imageUrl')

  useEffect(() => {
    reset(meal ? { name: meal.name, description: meal.description ?? '', price: meal.price / 100, cuisineId: meal.cuisineId, imageUrl: meal.imageUrl ?? '', prepTimeMinutes: meal.prepTimeMinutes, status: meal.status, dietaryTags: meal.dietaryTags.join(', '), isFeatured: meal.isFeatured } : { name: '', description: '', price: 0, cuisineId: '', imageUrl: '', prepTimeMinutes: 15, status: 'AVAILABLE', dietaryTags: '', isFeatured: false })
    setUploadError(null)
  }, [meal, reset])

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = '' // allow re-selecting the same file later
    if (!file) return

    setUploadError(null)
    setIsUploading(true)
    try {
      const uploadedUrl = await uploadImageToCloudinary(file)
      setValue('imageUrl', uploadedUrl, { shouldValidate: true, shouldDirty: true })
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const submit = (values: MealFormValues) => onSubmit({ ...values, description: values.description || undefined, imageUrl: values.imageUrl || undefined, dietaryTags: (values.dietaryTags ?? '').split(',').map((tag) => tag.trim()).filter(Boolean) })

  return <div className="fixed inset-0 z-20 flex items-center justify-center bg-stone-950/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="meal-form-title">
      <div className="mb-6 flex items-start justify-between"><div><p className="eyebrow">Menu catalogue</p><h2 id="meal-form-title" className="mt-1 text-2xl font-semibold text-stone-950">{meal ? 'Edit meal' : 'Create meal'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close">×</button></div>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(submit)}>
        <label className="field-label sm:col-span-2">Meal name<input className="field-control" {...register('name')} />{errors.name && <span className="field-error">{errors.name.message}</span>}</label>
        <label className="field-label sm:col-span-2">Description<textarea className="field-control min-h-24" {...register('description')} />{errors.description && <span className="field-error">{errors.description.message}</span>}</label>
        <label className="field-label">Price<input className="field-control" type="number" step="0.01" {...register('price')} />{errors.price && <span className="field-error">{errors.price.message}</span>}</label>
        <label className="field-label">Cuisine<select className="field-control" {...register('cuisineId')}><option value="">Choose cuisine</option>{cuisines.map((cuisine) => <option key={cuisine.id} value={cuisine.id}>{cuisine.name}</option>)}</select>{errors.cuisineId && <span className="field-error">{errors.cuisineId.message}</span>}</label>
        <label className="field-label">Prep time (minutes)<input className="field-control" type="number" {...register('prepTimeMinutes')} />{errors.prepTimeMinutes && <span className="field-error">{errors.prepTimeMinutes.message}</span>}</label>
        <label className="field-label">Status<select className="field-control" {...register('status')}><option value="AVAILABLE">Available</option><option value="OUT_OF_STOCK">Out of stock</option><option value="ARCHIVED">Archived</option></select></label>

        <div className="field-label sm:col-span-2">
          Meal image
          <div className="mt-1 flex items-start gap-4">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-center text-stone-300 text-2xl">
              {imageUrl ? <img src={imageUrl} alt="" className="h-full w-full object-cover" /> : '🍽️'}
            </div>
            <div className="flex-1 space-y-2">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <button
                type="button"
                className="button-secondary"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? 'Uploading…' : 'Upload from computer'}
              </button>
              <input
                className="field-control"
                placeholder="Or paste an image URL"
                {...register('imageUrl')}
              />
              {uploadError && <span className="field-error">{uploadError}</span>}
              {errors.imageUrl && <span className="field-error">{errors.imageUrl.message}</span>}
            </div>
          </div>
        </div>

        <label className="field-label sm:col-span-2">Dietary tags <span className="font-normal normal-case text-stone-400">comma separated</span><input className="field-control" placeholder="vegetarian, gluten-free" {...register('dietaryTags')} /></label>
        <label className="flex items-center gap-3 text-sm font-medium text-stone-700 sm:col-span-2"><input className="h-4 w-4 accent-amber-700" type="checkbox" {...register('isFeatured')} /> Feature this meal</label>
        <div className="flex justify-end gap-3 border-t border-stone-100 pt-5 sm:col-span-2"><button type="button" className="button-secondary" onClick={onClose}>Cancel</button><button className="button-primary" disabled={isSaving || isUploading}>{isSaving ? 'Saving...' : meal ? 'Save changes' : 'Create meal'}</button></div>
      </form>
    </section>
  </div>
}
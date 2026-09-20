interface Props {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="text-center py-10 px-4 border border-red-200 bg-red-50 rounded-xl">
      <p className="text-red-800 font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-block bg-red-800 hover:bg-red-900 text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  )
}
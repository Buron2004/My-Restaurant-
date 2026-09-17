import { Link } from 'react-router-dom'

export default function OrderPage() {
  return (
    <div className="min-h-screen bg-[#FBF6EC] flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <p className="text-sm font-semibold text-[#4B6B4F] tracking-wide uppercase">Order Online</p>
        <h1 className="text-3xl font-bold">Delivery ordering is coming soon</h1>
        <p className="text-stone-600">
          We're putting the finishing touches on online delivery. In the meantime, you can reserve a table and enjoy
          the full menu with us in person.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to="/reserve"
            className="bg-[#1F2E22] hover:bg-[#142018] text-[#FBF6EC] font-semibold rounded-lg px-5 py-2.5 transition-colors"
          >
            Book a table instead
          </Link>
          <Link
            to="/"
            className="border border-stone-300 hover:border-stone-400 text-stone-700 font-semibold rounded-lg px-5 py-2.5 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
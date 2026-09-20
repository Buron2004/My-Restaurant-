import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCuisines, fetchMeals } from '../api/meals'
import type { Meal } from '../types/meal'

const FOREST = '#1F2E22'
const PARCHMENT = '#FBF6EC'
const SAFFRON = '#E3A008'
const HERB = '#4B6B4F'
const CHARCOAL = '#241C16'

const display = { fontFamily: "'Fraunces', serif" }
const body = { fontFamily: "'Inter', sans-serif" }

function formatPrice(minorUnits: number) {
    return `$${(minorUnits / 100).toFixed(2)}`
}

function MenuRow({ meal }: { meal: Meal }) {
    return (
        <div className="flex items-center gap-4 py-3 border-b" style={{ borderColor: `${CHARCOAL}1a` }}>
            {meal.imageUrl && (
                <img src={meal.imageUrl} alt="" className="w-12 h-12 object-cover flex-shrink-0" />
            )}
            <span style={{ ...display, color: CHARCOAL }} className="text-lg">
                {meal.name}
            </span>
            <span className="flex-1 border-b border-dotted -translate-y-1" style={{ borderColor: `${CHARCOAL}55` }} />
            <span style={{ ...body, color: CHARCOAL }} className="font-semibold whitespace-nowrap">
                {formatPrice(meal.price)}
            </span>
        </div>
    )
}

export default function LandingPage() {
    const [selectedCuisineId, setSelectedCuisineId] = useState<string | null>(null)
    const [subscribed, setSubscribed] = useState(false)
    const [mobileNavOpen, setMobileNavOpen] = useState(false)

    const cuisinesQuery = useQuery({ queryKey: ['landing-cuisines'], queryFn: fetchCuisines })

    const mealsQuery = useQuery({
        queryKey: ['landing-meals', selectedCuisineId],
        queryFn: () => {
            const params = new URLSearchParams({ limit: '12', status: 'AVAILABLE', sort: 'name' })
            if (selectedCuisineId) params.set('cuisineId', selectedCuisineId)
            return fetchMeals(params)
        },
    })

    const meals = mealsQuery.data?.data ?? []
    const featured = meals.filter((meal) => meal.isFeatured).slice(0, 3)
    const heroImage = featured[0]?.imageUrl ?? meals[0]?.imageUrl

    return (
        <div style={body}>
            {/* Hero band */}
            <section style={{ background: FOREST }} className="text-white">
                <div className="max-w-6xl mx-auto px-6">
                    <nav className="flex items-center justify-between py-6">
                        <span style={display} className="text-xl">
                            Harvest &amp; Ember
                        </span>

                        <div className="hidden sm:flex items-center gap-8 text-sm">
                            <Link to="/menu" className="hover:opacity-80">Menu</Link>
                            <Link to="/reserve" className="hover:opacity-80">Reservations</Link>
                            <Link to="/order" className="hover:opacity-80">Order online</Link>
                            <Link to="/login" className="hover:opacity-80">Staff login</Link>
                        </div>

                        <button
                            className="sm:hidden text-2xl leading-none"
                            onClick={() => setMobileNavOpen((value) => !value)}
                            aria-label="Toggle menu"
                            aria-expanded={mobileNavOpen}
                        >
                            ☰
                        </button>
                    </nav>

                    {mobileNavOpen && (
                        <div className="sm:hidden flex flex-col gap-1 pb-6 text-sm">
                            <a href="#menu" onClick={() => setMobileNavOpen(false)} className="py-2 border-b border-white/10">Menu</a>
                            <Link to="/reserve" onClick={() => setMobileNavOpen(false)} className="py-2 border-b border-white/10">Reservations</Link>
                            <Link to="/order" onClick={() => setMobileNavOpen(false)} className="py-2 border-b border-white/10">Order online</Link>
                            <Link to="/login" onClick={() => setMobileNavOpen(false)} className="py-2">Staff login</Link>
                            <Link to="/manage-reservation" className="hover:opacity-80">
                                Manage booking
                            </Link>
                        </div>
                    )}
                </div>

                <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center pb-0">
                    <div className="py-14 md:py-24">
                        <h1 style={display} className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl leading-[1.05] font-light">
                            A table, a fire,
                            <br />
                            something worth
                            <br />
                            the wait.
                        </h1>
                        <p className="mt-6 max-w-sm text-white/70 leading-relaxed">
                            Seasonal dishes, cooked to order, served at your own table. Reserve tonight, or come find your seat.
                        </p>
                        <Link
                            to="/reserve"
                            className="inline-block mt-8 px-7 py-3 font-semibold"
                            style={{ background: SAFFRON, color: CHARCOAL }}
                        >
                            Reserve a table
                        </Link>
                    </div>

                    <div className="hidden md:block h-full min-h-[420px] self-stretch">
                        {heroImage ? (
                            <img src={heroImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full" style={{ background: HERB }} />
                        )}
                    </div>
                </div>
            </section>

            {/* Featured mosaic + menu board */}
            <section id="menu" style={{ background: PARCHMENT }} className="py-16">
                <div className="max-w-6xl mx-auto px-6">
                    {featured.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-14">
                            <div className="col-span-2 sm:row-span-2 aspect-[4/3]">
                                {featured[0]?.imageUrl && (
                                    <img src={featured[0].imageUrl} alt={featured[0].name} className="w-full h-full object-cover" />
                                )}
                            </div>
                            {featured.slice(1, 3).map((meal) => (
                                <div key={meal.id} className="aspect-square">
                                    {meal.imageUrl && <img src={meal.imageUrl} alt={meal.name} className="w-full h-full object-cover" />}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-baseline justify-between mb-6 flex-wrap gap-4">
                        <h2 style={{ ...display, color: CHARCOAL }} className="text-3xl">
                            Tonight's board
                        </h2>

                        {cuisinesQuery.isLoading && (
                            <div className="flex gap-4 flex-wrap animate-pulse">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <div key={index} className="h-4 w-14 rounded" style={{ background: `${CHARCOAL}1a` }} />
                                ))}
                            </div>
                        )}

                        {cuisinesQuery.data && (
                            <div className="flex gap-6 text-sm flex-wrap">
                                <button
                                    onClick={() => setSelectedCuisineId(null)}
                                    className={`pb-1 font-medium ${selectedCuisineId === null ? 'border-b-2' : ''}`}
                                    style={{ color: selectedCuisineId === null ? HERB : `${CHARCOAL}99`, borderColor: HERB }}
                                >
                                    All
                                </button>
                                {cuisinesQuery.data.data.map((cuisine) => (
                                    <button
                                        key={cuisine.id}
                                        onClick={() => setSelectedCuisineId(cuisine.id)}
                                        className={`pb-1 font-medium ${selectedCuisineId === cuisine.id ? 'border-b-2' : ''}`}
                                        style={{
                                            color: selectedCuisineId === cuisine.id ? HERB : `${CHARCOAL}99`,
                                            borderColor: HERB,
                                        }}
                                    >
                                        {cuisine.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {mealsQuery.isLoading && (
                        <div className="grid sm:grid-cols-2 gap-x-12">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <div key={index} className="flex items-center gap-4 py-3 border-b animate-pulse" style={{ borderColor: `${CHARCOAL}1a` }}>
                                    <div className="w-12 h-12 flex-shrink-0 rounded" style={{ background: `${CHARCOAL}14` }} />
                                    <div className="h-4 w-32 rounded" style={{ background: `${CHARCOAL}14` }} />
                                    <span className="flex-1" />
                                    <div className="h-4 w-12 rounded" style={{ background: `${CHARCOAL}14` }} />
                                </div>
                            ))}
                        </div>
                    )}
                    {mealsQuery.isError && <p className="text-red-800">Could not load the menu right now.</p>}
                    {meals.length === 0 && !mealsQuery.isLoading && (
                        <p style={{ color: `${CHARCOAL}99` }}>Nothing in this category yet.</p>
                    )}

                    {!mealsQuery.isLoading && (
                        <div className="grid sm:grid-cols-2 gap-x-12">
                            {meals.map((meal) => (
                                <MenuRow key={meal.id} meal={meal} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Reservation CTA split */}
            <section style={{ background: FOREST }} className="text-white">
                <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
                    <div className="hidden md:block aspect-[4/3]">
                        {meals[3]?.imageUrl ? (
                            <img src={meals[3].imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full" style={{ background: HERB }} />
                        )}
                    </div>
                    <div className="py-16 flex flex-col justify-center">
                        <h2 style={display} className="text-4xl leading-tight">
                            Ready when you are.
                        </h2>
                        <p className="mt-4 text-white/70 max-w-sm">
                            Tables are held in real time — pick a date, choose your time, and we'll have it ready.
                        </p>
                        <Link
                            to="/reserve"
                            className="inline-block mt-8 px-7 py-3 font-semibold w-fit"
                            style={{ background: SAFFRON, color: CHARCOAL }}
                        >
                            Book your table
                        </Link>
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <section style={{ background: PARCHMENT }} className="py-16">
                <div className="max-w-6xl mx-auto px-6 border-t pt-10" style={{ borderColor: `${CHARCOAL}22` }}>
                    <div className="max-w-md">
                        <h2 style={{ ...display, color: CHARCOAL }} className="text-2xl">
                            New dishes, first.
                        </h2>
                        <form
                            onSubmit={(event) => {
                                event.preventDefault()
                                setSubscribed(true)
                            }}
                            className="mt-5 flex flex-col sm:flex-row gap-3"
                        >
                            <input
                                type="email"
                                required
                                placeholder="you@example.com"
                                className="flex-1 border px-4 py-2.5 focus:outline-none"
                                style={{ borderColor: `${CHARCOAL}33`, color: CHARCOAL }}
                            />
                            <button type="submit" className="px-6 py-2.5 font-semibold" style={{ background: HERB, color: PARCHMENT }}>
                                Subscribe
                            </button>
                        </form>
                        {subscribed && (
                            <p className="text-sm mt-3" style={{ color: HERB }}>
                                Thanks — you're on the list.
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: FOREST }} className="text-white/70 py-10">
                <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between gap-6 text-sm">
                    <span style={display} className="text-white">
                        Harvest &amp; Ember
                    </span>
                    <div className="flex flex-wrap gap-x-8 gap-y-2">
                        <a href="#menu" className="hover:text-white">
                            Menu
                        </a>
                        <Link to="/reserve" className="hover:text-white">
                            Reservations
                        </Link>
                        <Link to="/order" className="hover:text-white">
                            Order online
                        </Link>
                        <Link to="/login" className="hover:text-white">
                            Staff login
                        </Link>
                        <Link to="/manage-reservation" className="hover:opacity-80">
                            Manage booking
                        </Link>
                    </div>
                </div>
                <p className="max-w-6xl mx-auto px-6 text-xs mt-8 text-white/40">
                    © {new Date().getFullYear()} Harvest &amp; Ember.
                </p>
            </footer>
        </div>
    )
}
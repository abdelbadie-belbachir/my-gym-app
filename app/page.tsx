'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dumbbell, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [isMounted, setIsMounted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setIsMounted(true)
        const savedName = localStorage.getItem('gym_username')
        if (savedName) {
            router.push('/workout')
        }
    }, [router])

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        const cleanedUsername = username.trim().toLowerCase()
        if (!cleanedUsername || isSubmitting) return

        setIsSubmitting(true)
        localStorage.setItem('gym_username', cleanedUsername)
        router.push('/workout')
    }

    if (!isMounted) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-black text-white">
                <div className="h-6 w-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            </main>
        )
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-black text-white p-4">
            <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-6 shadow-2xl">
                <div className="text-center space-y-2">
                    <div className="inline-flex p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-amber-400">
                        <Dumbbell className="h-6 w-6" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">Progressive Overload</h1>
                    <p className="text-xs text-zinc-400">أدخل اسمك للبدء في تتبع تمارينك اليومية</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            placeholder="أدخل اسمك (مثال: abdelbadie)"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 text-center rounded-xl p-3 text-sm text-zinc-100 outline-none focus:border-amber-500 transition placeholder:text-zinc-600"
                            required
                            autoFocus
                            disabled={isSubmitting}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting || !username.trim()}
                        className="w-full py-3 rounded-xl bg-zinc-100 text-black font-semibold text-sm hover:bg-white transition shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <span>جاري الدخول...</span>
                        ) : (
                            <>
                                <span>دخول (Start Workout)</span>
                                <ArrowLeft className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </main>
    )
}
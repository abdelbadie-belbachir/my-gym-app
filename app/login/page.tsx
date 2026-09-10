'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dumbbell, ArrowRight } from 'lucide-react'

export default function LoginPage() {
    const [name, setName] = useState('')
    const router = useRouter()

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        // تخزين الاسم في الـ LocalStorage ليصبح المعرف الخاص بالمستخدم
        localStorage.setItem('gym_username', name.trim())
        router.push('/')
    }

    return (
        <main className="flex min-h-screen items-center justify-center p-4 bg-black text-white">
            <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-6 shadow-2xl">
                <div className="text-center space-y-2">
                    <div className="inline-flex p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-white mb-1">
                        <Dumbbell className="h-6 w-6" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">أهلاً بك يا بطل!</h1>
                    <p className="text-xs text-zinc-400">أدخل اسمك أو اللقب تاعك للبدء في تتبع تمارينك</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[11px] font-medium text-zinc-400">اسم المستخدم (الاسم)</label>
                        <input
                            type="text"
                            required
                            placeholder="مثال: عبد البديع"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-zinc-700 text-center font-bold"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-zinc-100 text-black font-semibold text-sm hover:bg-white transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                        دخول للتطبيق <ArrowRight className="h-4 w-4" />
                    </button>
                </form>
            </div>
        </main>
    )
}
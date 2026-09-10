'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dumbbell } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
    const savedName = localStorage.getItem('gym_username')
    // إذا كان المستخدم مسجّل من قبل يديه مباشرة لصفحة التمارين
    if (savedName) {
      router.push('/workout')
    }
  }, [router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return

    // حفظ الاسم والدخول
    localStorage.setItem('gym_username', username.trim().toLowerCase())
    router.push('/workout')
  }

  if (!isMounted) return null

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
              className="w-full bg-zinc-900 border border-zinc-800 text-center rounded-xl p-3 text-sm text-zinc-100 outline-none focus:border-amber-500 transition"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-zinc-100 text-black font-semibold text-sm hover:bg-white transition shadow-lg cursor-pointer"
          >
            دخول (Start Workout)
          </button>
        </form>
      </div>
    </main>
  )
}
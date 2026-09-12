'use client'

import { useEffect, useState, useRef } from 'react'
import { Search, Dumbbell, Activity } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { createClient } from '@/lib/supabase/client'

type ExerciseResult = {
    id: string
    name: string
    target_muscle: string
    thumbnail_url: string | null
}

export function ExerciseAutocomplete({ onSelect }: { onSelect: (exercise: ExerciseResult) => void }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<ExerciseResult[]>([])
    const [open, setOpen] = useState(false)
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
    const inputRef = useRef<HTMLInputElement>(null)
    const debouncedQuery = useDebounce(query, 150)

    useEffect(() => {
        const searchTerm = debouncedQuery.trim()

        if (searchTerm.length < 2) {
            setResults([])
            setOpen(false)
            return
        }

        const supabase = createClient()

        supabase
            .from('exercises')
            .select('id, name, target_muscle, thumbnail_url')
            .or(`name.ilike.%${searchTerm}%,target_muscle.ilike.%${searchTerm}%`)
            .order('name', { ascending: true })
            .limit(20)
            .then(({ data, error }) => {
                if (error) {
                    console.error('Supabase Error:', error)
                } else {
                    setResults(data ?? [])
                    setOpen(true)
                }
            })
    }, [debouncedQuery])

    const handleSelect = (exercise: ExerciseResult) => {
        onSelect(exercise)
        setQuery(exercise.name)
        setOpen(false)
        inputRef.current?.focus()
    }

    const handleImageError = (id: string) => {
        setImageErrors((prev) => ({ ...prev, [id]: true }))
    }

    return (
        <div className="relative w-full">
            <div className="flex w-full items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/90 px-3.5 focus-within:border-amber-500/80 transition-all shadow-inner">
                <Search className="h-4 w-4 text-zinc-500 shrink-0 pointer-events-none" />
                <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        if (results.length > 0) setOpen(true)
                    }}
                    placeholder="Search exercise (e.g. Incline Bench, Curl...)"
                    className="w-full bg-transparent py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                />
            </div>

            {open && (
                <div className="absolute left-0 right-0 top-full mt-2 border border-zinc-800/90 bg-zinc-950 p-1.5 max-h-[340px] overflow-y-auto z-50 rounded-2xl shadow-2xl space-y-1 backdrop-blur-xl">
                    {results.length === 0 ? (
                        <div className="px-3 py-4 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                            <Activity className="h-4 w-4 text-zinc-600 animate-pulse" />
                            <span>لم يتم العثور على أي تمرين matching</span>
                        </div>
                    ) : (
                        results.map((exercise) => {
                            const hasImage = exercise.thumbnail_url && !imageErrors[exercise.id]

                            return (
                                <button
                                    key={exercise.id}
                                    type="button"
                                    onMouseDown={(e) => {
                                        e.preventDefault()
                                        handleSelect(exercise)
                                    }}
                                    className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-zinc-900/90 border border-transparent hover:border-zinc-800 transition-all cursor-pointer group"
                                >
                                    {/* إطار الرسوم التوضيحية / GIF */}
                                    <div className="relative h-11 w-11 shrink-0 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center shadow-md group-hover:border-amber-500/40 transition-colors">
                                        {hasImage ? (
                                            <img
                                                src={exercise.thumbnail_url!}
                                                alt={exercise.name}
                                                onError={() => handleImageError(exercise.id)}
                                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center gap-0.5 text-zinc-600 group-hover:text-amber-400 transition-colors">
                                                <Dumbbell className="h-4 w-4" />
                                                <span className="text-[8px] font-black tracking-tighter uppercase">FIT</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* تفاصيل التمرين */}
                                    <div className="flex flex-col text-left">
                                        <span className="text-sm font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors line-clamp-1">
                                            {exercise.name}
                                        </span>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[10px] font-medium text-amber-400/80 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                                                {exercise.target_muscle}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            )
                        })
                    )}
                </div>
            )}
        </div>
    )
}
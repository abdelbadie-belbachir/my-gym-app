'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Search } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
    const debouncedQuery = useDebounce(query, 250)

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
            .limit(10)
            .then(({ data, error }) => {
                if (error) {
                    console.error('Supabase Error:', error)
                } else {
                    setResults(data ?? [])
                    setOpen(true)
                }
            })
    }, [debouncedQuery])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger className="w-full text-left outline-none">
                <div className="flex w-full items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 cursor-text">
                    <Search className="h-4 w-4 text-zinc-500 shrink-0" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search exercise (e.g. Hack Squat, Bench, Curl...)"
                        className="w-full bg-transparent py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                    />
                </div>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-[--radix-popover-trigger-width] border-zinc-800 bg-zinc-950 p-1 max-h-[320px] overflow-y-auto z-50 rounded-lg shadow-lg"
            >
                {results.length === 0 ? (
                    <div className="px-3 py-4 text-center text-sm text-zinc-500">No exercises found</div>
                ) : (
                    results.map((exercise) => (
                        <button
                            key={exercise.id}
                            type="button"
                            onClick={() => {
                                onSelect(exercise)
                                setQuery(exercise.name)
                                setOpen(false)
                            }}
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-zinc-900 transition-colors"
                        >
                            <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
                                <Image
                                    src={exercise.thumbnail_url ?? '/placeholder-exercise.png'}
                                    alt={exercise.name}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-sm font-medium text-zinc-100">{exercise.name}</span>
                                <span className="text-xs text-zinc-500">{exercise.target_muscle}</span>
                            </div>
                        </button>
                    ))
                )}
            </PopoverContent>
        </Popover>
    )
}
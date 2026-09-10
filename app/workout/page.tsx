'use client'

import { useState, useEffect } from 'react'
import { ExerciseAutocomplete } from '@/components/ui/exercise-autocomplete'
import { Plus, Trash2, TrendingUp, Save, CheckCircle2, History, LogOut, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36)

type WorkoutSet = {
    id: string
    weight: string | number
    reps: string | number
    reps_to_failure: string | number
}

type PastWorkout = {
    date: string
    sets: WorkoutSet[]
}

type SelectedExercise = {
    id: string
    name: string
    target_muscle: string
    thumbnail_url: string | null
    sets: WorkoutSet[]
    past_workouts?: PastWorkout[]
}

export default function WorkoutPage() {
    const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([])
    const [loading, setLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState(false)
    const [username, setUsername] = useState<string | null>(null)
    const [isMounted, setIsMounted] = useState(false)

    const [activeGraphExercise, setActiveGraphExercise] = useState<{ name: string; history: PastWorkout[] } | null>(null)

    const router = useRouter()

    useEffect(() => {
        setIsMounted(true)
        const savedName = localStorage.getItem('gym_username')
        if (!savedName) {
            router.push('/') // ترجيعه للـ Login إذا لم يكن مسجلاً
        } else {
            setUsername(savedName)
        }
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem('gym_username')
        router.push('/')
    }

    const handleSelectExercise = async (exercise: any) => {
        if (selectedExercises.some((e) => e.id === exercise.id)) return

        let pastWorkouts: PastWorkout[] = []

        try {
            const supabase = createClient()
            if (supabase && username) {
                const { data, error } = await supabase
                    .from('workout_logs')
                    .select('created_at, exercises_data')
                    .eq('user_id', username)
                    .order('created_at', { ascending: false })

                if (!error && data) {
                    for (const log of data) {
                        const exercisesList = log.exercises_data as any[]
                        const found = exercisesList?.find((ex: any) => ex.id === exercise.id)

                        if (found && found.sets) {
                            const formattedDate = new Date(log.created_at).toLocaleDateString('ar-DZ', {
                                month: 'short',
                                day: 'numeric',
                            })

                            pastWorkouts.push({
                                date: formattedDate,
                                sets: found.sets.map((s: any) => ({
                                    id: generateId(),
                                    weight: s.weight,
                                    reps: s.reps,
                                    reps_to_failure: s.reps_to_failure ?? 0
                                }))
                            })

                            if (pastWorkouts.length >= 5) break
                        }
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching past workouts:', err)
        }

        setSelectedExercises((prev) => [
            ...prev,
            {
                ...exercise,
                sets: [{ id: generateId(), weight: '', reps: '', reps_to_failure: '0' }],
                past_workouts: pastWorkouts
            }
        ])
    }

    const handleRemoveExercise = (id: string) => {
        setSelectedExercises((prev) => prev.filter((e) => e.id !== id))
    }

    const handleAddSet = (exerciseId: string) => {
        setSelectedExercises((prev) =>
            prev.map((ex) => {
                if (ex.id === exerciseId) {
                    return {
                        ...ex,
                        sets: [...(ex.sets || []), { id: generateId(), weight: '', reps: '', reps_to_failure: '0' }]
                    }
                }
                return ex
            })
        )
    }

    const handleRemoveSet = (exerciseId: string, setId: string) => {
        setSelectedExercises((prev) =>
            prev.map((ex) => {
                if (ex.id === exerciseId) {
                    return {
                        ...ex,
                        sets: (ex.sets || []).filter((s) => s.id !== setId)
                    }
                }
                return ex
            })
        )
    }

    const handleSetChange = (
        exerciseId: string,
        setId: string,
        field: 'weight' | 'reps' | 'reps_to_failure',
        value: string
    ) => {
        setSelectedExercises((prev) =>
            prev.map((ex) => {
                if (ex.id === exerciseId) {
                    return {
                        ...ex,
                        sets: (ex.sets || []).map((s) => (s.id === setId ? { ...s, [field]: value } : s))
                    }
                }
                return ex
            })
        )
    }

    const handleSaveWorkout = async () => {
        if (selectedExercises.length === 0) {
            alert('الرجاء إضافة تمرين واحد على الأقل لحفظ الحصة!')
            return
        }

        if (!username) {
            router.push('/')
            return
        }

        setLoading(true)

        try {
            const supabase = createClient()

            const { error } = await supabase.from('workout_logs').insert([
                {
                    user_id: username,
                    total_exercises: selectedExercises.length,
                    exercises_data: selectedExercises
                }
            ])

            if (error) {
                console.error('Supabase Error:', error)
                alert(`خطأ Supabase: ${error.message} (Code: ${error.code})`)
            } else {
                setSuccessMessage(true)
                setTimeout(() => setSuccessMessage(false), 4000)
                setSelectedExercises([])
            }
        } catch (err: any) {
            console.error('Catch Error:', err)
            alert(`خطأ غير متوقع: ${err.message || err}`)
        } finally {
            setLoading(false)
        }
    }

    if (!isMounted || !username) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-black text-white">
                <div className="text-sm text-zinc-500 animate-pulse">جاري التحميل...</div>
            </main>
        )
    }

    return (
        <main className="flex min-h-screen flex-col items-center p-4 md:p-6 bg-black text-white pb-20">
            <div className="w-full max-w-xl space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Progressive Overload</h1>
                        <p className="text-[11px] text-zinc-400">مرحباً، <span className="text-amber-400 font-bold">{username}</span></p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-red-400 transition cursor-pointer"
                        title="تبديل الاسم"
                    >
                        <LogOut className="h-3.5 w-3.5" /> تبديل الاسم
                    </button>
                </div>

                {successMessage && (
                    <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-950/40 border border-emerald-900 text-emerald-300 text-sm animate-fade-in">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                        <span>تم حفظ حصة اليوم بنجاح يا بطل! 🚀</span>
                    </div>
                )}

                <ExerciseAutocomplete onSelect={handleSelectExercise} />

                <div className="space-y-4 pt-2">
                    {selectedExercises.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center text-xs text-zinc-500">
                            لم تقم بإضافة أي تمرين بعد. ابحث عن تمرين في الأعلى للبدء.
                        </div>
                    ) : (
                        selectedExercises.map((exercise) => (
                            <div
                                key={exercise.id}
                                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-4 shadow-xl"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="relative h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                            {exercise.thumbnail_url ? (
                                                <img
                                                    src={exercise.thumbnail_url}
                                                    alt={exercise.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-[10px] text-zinc-600 font-bold">GYM</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-zinc-100">{exercise.name}</h3>
                                            <span className="text-xs text-zinc-500">{exercise.target_muscle}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setActiveGraphExercise({ name: exercise.name, history: exercise.past_workouts || [] })}
                                            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-400 hover:bg-zinc-800 transition cursor-pointer"
                                            title="عرض الرسم البياني للتطور (Graph)"
                                        >
                                            <TrendingUp className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleRemoveExercise(exercise.id)}
                                            className="p-2 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-950/40 transition cursor-pointer"
                                            title="حذف التمرين"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {exercise.past_workouts && exercise.past_workouts.length > 0 && (
                                    <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-3 space-y-2">
                                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-400/90">
                                            <History className="h-3.5 w-3.5" />
                                            <span>سجل آخر حصص سابقة:</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            {exercise.past_workouts.map((workout, wIdx) => (
                                                <div key={wIdx} className="text-[11px] bg-zinc-900/80 border border-zinc-800/60 p-2 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                    <span className="text-zinc-400 font-medium">({workout.date})</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {workout.sets.map((s, sIdx) => (
                                                            <span key={s.id || sIdx} className="bg-zinc-950 px-2 py-0.5 rounded text-zinc-300 border border-zinc-900">
                                                                S{sIdx + 1}: <strong className="text-white">{s.weight || 0}كغ</strong> × <strong className="text-white">{s.reps || 0}تكرار</strong> <span className="text-amber-400/90 text-[10px]">(RIR: {s.reps_to_failure ?? 0})</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2 pt-2 border-t border-zinc-900">
                                    <div className="grid grid-cols-12 gap-1.5 text-[10px] font-medium text-zinc-500 px-1 text-center">
                                        <div className="col-span-2">SET</div>
                                        <div className="col-span-3">KG (الوزن)</div>
                                        <div className="col-span-3">REPS (تكرار)</div>
                                        <div className="col-span-3 text-amber-400/90">RIR (للفشل)</div>
                                        <div className="col-span-1"></div>
                                    </div>

                                    {(exercise.sets ?? []).map((set, setIdx) => (
                                        <div key={set.id} className="grid grid-cols-12 gap-1.5 items-center">
                                            <div className="col-span-2 text-center text-xs font-bold text-zinc-400 bg-zinc-900/50 py-2.5 rounded-xl border border-zinc-800/50">
                                                #{setIdx + 1}
                                            </div>

                                            <div className="col-span-3">
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    value={set.weight}
                                                    onChange={(e) => handleSetChange(exercise.id, set.id, 'weight', e.target.value)}
                                                    className="w-full bg-zinc-900 border border-zinc-800 text-center rounded-xl py-2.5 text-xs text-zinc-100 outline-none focus:border-zinc-700"
                                                />
                                            </div>

                                            <div className="col-span-3">
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    value={set.reps}
                                                    onChange={(e) => handleSetChange(exercise.id, set.id, 'reps', e.target.value)}
                                                    className="w-full bg-zinc-900 border border-zinc-800 text-center rounded-xl py-2.5 text-xs text-zinc-100 outline-none focus:border-zinc-700"
                                                />
                                            </div>

                                            <div className="col-span-3">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="5"
                                                    placeholder="0"
                                                    value={set.reps_to_failure}
                                                    onChange={(e) => handleSetChange(exercise.id, set.id, 'reps_to_failure', e.target.value)}
                                                    className="w-full bg-zinc-900 border border-amber-500/40 text-center rounded-xl py-2.5 text-xs text-amber-400 font-bold outline-none focus:border-amber-500"
                                                />
                                            </div>

                                            <div className="col-span-1 flex justify-center">
                                                {(exercise.sets ?? []).length > 1 && (
                                                    <button
                                                        onClick={() => handleRemoveSet(exercise.id, set.id)}
                                                        className="text-zinc-600 hover:text-red-400 transition text-xs font-bold cursor-pointer"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => handleAddSet(exercise.id)}
                                        className="w-full mt-2 py-2.5 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 hover:border-zinc-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <Plus className="h-3.5 w-3.5" /> إضافة مجموعة (Add Set)
                                    </button>
                                </div>
                            </div>
                        ))
                    )}

                    {selectedExercises.length > 0 && (
                        <button
                            onClick={handleSaveWorkout}
                            disabled={loading}
                            className="w-full mt-6 py-4 rounded-2xl bg-zinc-100 text-black font-semibold text-sm hover:bg-white transition flex items-center justify-center gap-2 shadow-xl disabled:opacity-50 cursor-pointer"
                        >
                            <Save className="h-4 w-4" />
                            {loading ? 'جاري الحفظ...' : 'حفظ حصة اليوم (Finish Workout)'}
                        </button>
                    )}
                </div>
            </div>

            {activeGraphExercise && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-5 shadow-2xl animate-fade-in">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                            <div className="space-y-0.5">
                                <h3 className="text-sm font-bold text-zinc-100">تطور الأوزان (Graph)</h3>
                                <p className="text-xs text-amber-400">{activeGraphExercise.name}</p>
                            </div>
                            <button
                                onClick={() => setActiveGraphExercise(null)}
                                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                            {activeGraphExercise.history.length === 0 ? (
                                <div className="py-10 text-center text-xs text-zinc-500">
                                    لا توجد سجلات سابقة لهذا التمرين لعرضها بيضياً.
                                </div>
                            ) : (
                                activeGraphExercise.history.map((item, idx) => {
                                    const maxWeight = Math.max(...item.sets.map(s => Number(s.weight) || 0))
                                    return (
                                        <div key={idx} className="bg-zinc-900/50 border border-zinc-900 p-3 rounded-2xl space-y-2">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-zinc-400 font-medium">الحصة: {item.date}</span>
                                                <span className="text-amber-400 font-bold">أقصى وزن: {maxWeight} كغ</span>
                                            </div>

                                            <div className="space-y-1">
                                                {item.sets.map((s, sIdx) => {
                                                    const w = Number(s.weight) || 0
                                                    const percentage = Math.min(Math.max((w / 150) * 100, 5), 100)
                                                    return (
                                                        <div key={s.id || sIdx} className="space-y-1">
                                                            <div className="flex justify-between text-[10px] text-zinc-500">
                                                                <span>Set #{sIdx + 1}</span>
                                                                <span>{w} كغ × {s.reps} تكرار (RIR: {s.reps_to_failure ?? 0})</span>
                                                            </div>
                                                            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500"
                                                                    style={{ width: `${percentage}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        <button
                            onClick={() => setActiveGraphExercise(null)}
                            className="w-full py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition cursor-pointer"
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            )}
        </main>
    )
}
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
    const response = await fetch('https://exercisedb.p.rapidapi.com/exercises?limit=0', {
        headers: {
            'X-RapidAPI-Key': process.env.EXERCISEDB_RAPIDAPI_KEY!,
            'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
        },
    })
    const items = await response.json()

    for (const item of items) {
        const gif = await fetch(item.gifUrl)
        const buffer = await gif.arrayBuffer()
        const path = `exercisedb/${item.id}.gif`

        await supabase.storage.from('exercise-media').upload(path, buffer, {
            contentType: 'image/gif',
            upsert: true,
        })

        const { data: url } = supabase.storage.from('exercise-media').getPublicUrl(path)

        await supabase.from('exercises').upsert({
            external_id: item.id,
            name: item.name,
            body_part: item.bodyPart,
            target_muscle: item.target,
            equipment: item.equipment,
            secondary_muscles: item.secondaryMuscles,
            instructions: item.instructions,
            gif_url: url.publicUrl,
            thumbnail_url: url.publicUrl,
        }, { onConflict: 'external_id' })
    }

    return NextResponse.json({ synced: items.length })
}
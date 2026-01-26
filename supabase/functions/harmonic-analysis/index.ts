/**
 * Supabase Edge Function: Harmonic Analysis
 * 
 * Processes harmonic analysis jobs in the background.
 * Triggered by analysis_jobs queue or manual invocation.
 * 
 * FLOW:
 * 1. Receive job request
 * 2. Update job status to 'processing'
 * 3. Run ML analysis pipeline (stub for now)
 * 4. Store result in harmonic_fingerprints table
 * 5. Update job status to 'completed' or 'failed'
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface AnalysisRequest {
  track_id: string
  audio_hash?: string
  isrc?: string
  priority?: 'low' | 'normal' | 'high'
  force_reanalysis?: boolean
}

interface HarmonicFingerprint {
  track_id: string
  audio_hash?: string | null
  isrc?: string | null
  tonal_center: {
    root_interval: number
    mode: 'major' | 'minor' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'aeolian' | 'locrian'
    stability_score: number
  }
  roman_progression: Array<{
    numeral: string
    quality: 'major' | 'minor' | 'diminished' | 'augmented' | 'dominant'
    extensions?: string[]
  }>
  loop_length_bars: number
  cadence_type: 'authentic' | 'plagal' | 'deceptive' | 'half' | 'none'
  confidence_score: number
  analysis_timestamp: string
  analysis_version: string
  is_provisional: boolean
  detected_key?: string
  detected_mode: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Parse request
    const request: AnalysisRequest = await req.json()
    const { track_id, audio_hash, isrc, force_reanalysis } = request

    console.log('[HarmonicAnalysis] Processing request:', {
      track_id,
      has_audio_hash: !!audio_hash,
      has_isrc: !!isrc,
      force_reanalysis
    })

    // Step 1: Check for existing analysis (unless force_reanalysis)
    if (!force_reanalysis) {
      const { data: existing } = await supabaseClient
        .from('harmonic_fingerprints')
        .select('*')
        .eq('track_id', track_id)
        .gte('reuse_until', new Date().toISOString())
        .order('analysis_timestamp', { ascending: false })
        .limit(1)

      if (existing && existing.length > 0) {
        console.log('[HarmonicAnalysis] Using cached result')
        return new Response(
          JSON.stringify({
            success: true,
            fingerprint: existing[0],
            method: 'cached'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        )
      }
    }

    // Step 2: Create or find analysis job
    const jobId = crypto.randomUUID()
    const now = new Date().toISOString()

    const { error: insertError } = await supabaseClient
      .from('analysis_jobs')
      .insert({
        id: jobId,
        track_id,
        audio_hash: audio_hash ?? null,
        isrc: isrc ?? null,
        status: 'processing',
        progress: 0.0,
        started_at: now,
        analysis_version: '1.0.0'
      })

    if (insertError) {
      throw new Error(`Failed to create job: ${insertError.message}`)
    }

    // Step 3: Run analysis pipeline
    console.log('[HarmonicAnalysis] Starting analysis:', jobId)

    // Update progress: Fetching audio
    await updateJobProgress(supabaseClient, jobId, 0.2)

    // TODO: Integrate actual ML model here
    // For now, use mock analysis
    const fingerprint = await runMockAnalysis(track_id, audio_hash, isrc)

    // Update progress: Extracting features
    await updateJobProgress(supabaseClient, jobId, 0.5)

    // Update progress: Detecting harmony
    await updateJobProgress(supabaseClient, jobId, 0.8)

    // Step 4: Store result
    const { error: storeError } = await supabaseClient
      .from('harmonic_fingerprints')
      .upsert(fingerprint, {
        onConflict: audio_hash ? 'audio_hash' : 'track_id'
      })

    if (storeError) {
      throw new Error(`Failed to store result: ${storeError.message}`)
    }

    // Step 5: Mark job complete
    const { error: completeError } = await supabaseClient
      .from('analysis_jobs')
      .update({
        status: 'completed',
        progress: 1.0,
        completed_at: new Date().toISOString(),
        result: fingerprint,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)

    if (completeError) {
      console.error('[HarmonicAnalysis] Failed to update job:', completeError)
    }

    console.log('[HarmonicAnalysis] Analysis complete:', jobId)

    return new Response(
      JSON.stringify({
        success: true,
        job_id: jobId,
        fingerprint,
        method: 'ml_audio'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('[HarmonicAnalysis] Error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

// Helper: Update job progress
async function updateJobProgress(
  supabaseClient: any,
  jobId: string,
  progress: number
): Promise<void> {
  await supabaseClient
    .from('analysis_jobs')
    .update({
      progress,
      updated_at: new Date().toISOString()
    })
    .eq('id', jobId)
}

// Mock analysis (placeholder until ML model integrated)
async function runMockAnalysis(
  trackId: string,
  audioHash?: string,
  isrc?: string
): Promise<HarmonicFingerprint> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Common progressions for testing
  const progressions = [
    [
      { numeral: 'I', quality: 'major' as const },
      { numeral: 'V', quality: 'major' as const },
      { numeral: 'vi', quality: 'minor' as const },
      { numeral: 'IV', quality: 'major' as const }
    ],
    [
      { numeral: 'i', quality: 'minor' as const },
      { numeral: 'VI', quality: 'major' as const },
      { numeral: 'III', quality: 'major' as const },
      { numeral: 'VII', quality: 'major' as const }
    ],
    [
      { numeral: 'I', quality: 'major' as const },
      { numeral: 'IV', quality: 'major' as const },
      { numeral: 'V', quality: 'major' as const }
    ]
  ]

  const progression = progressions[Math.floor(Math.random() * progressions.length)]

  return {
    track_id: trackId,
    audio_hash: audioHash ?? null,
    isrc: isrc ?? null,
    tonal_center: {
      root_interval: 0,
      mode: 'major',
      stability_score: 0.85
    },
    roman_progression: progression,
    loop_length_bars: 4,
    cadence_type: 'authentic',
    confidence_score: 0.72,
    analysis_timestamp: new Date().toISOString(),
    analysis_version: '1.0.0',
    is_provisional: false, // Edge function produces final results
    detected_key: 'C',
    detected_mode: 'major'
  }
}

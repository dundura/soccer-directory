export type ExerciseType = 'work' | 'rest'

export interface Exercise {
  name: string
  dur: number
  type: ExerciseType
  tip: string
  voice: string
  img?: string
}

export const IMGS: Record<string, string> = {
  'Dumbbell Squat':      'https://images.unsplash.com/photo-1566241142245-75c71d780a1c?w=480&h=320&fit=crop&q=80',
  'Romanian Deadlift':   'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=480&h=320&fit=crop&q=80',
  'Bent-Over Row':       'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=480&h=320&fit=crop&q=80',
  'Dumbbell Push Press': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=480&h=320&fit=crop&q=80',
  'Alternating Lunges':  'https://images.unsplash.com/photo-1536922246289-88c42f957773?w=480&h=320&fit=crop&q=80',
  'Bicep Curl':          'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=480&h=320&fit=crop&q=80',
  'Lateral Raise':       'https://images.unsplash.com/photo-1590487988256-9ed24133863e?w=480&h=320&fit=crop&q=80',
  'Renegade Row':        'https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=480&h=320&fit=crop&q=80',
  'Goblet Squat':        'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=480&h=320&fit=crop&q=80',
  'Sit & Press':         'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=480&h=320&fit=crop&q=80',
}

export const WORKOUT: Exercise[] = [
  { name: 'Dumbbell Squat',      dur: 60, type: 'work', img: IMGS['Dumbbell Squat'],
    tip: 'Feet shoulder-width. Drive through heels. Chest proud.',
    voice: 'Dumbbell Squats! Drive those heels in. Chest up, core tight. Let\'s go!' },
  { name: 'Rest',                dur: 30, type: 'rest',
    tip: 'Shake out your legs. Romanian Deadlift is next.',
    voice: 'Rest up. Romanian Deadlifts are coming.' },
  { name: 'Romanian Deadlift',   dur: 60, type: 'work', img: IMGS['Romanian Deadlift'],
    tip: 'Soft knee bend. Hinge from hips. Feel that hamstring stretch.',
    voice: 'Romanian Deadlifts! Hinge at the hips. Feel those hamstrings load. Control it.' },
  { name: 'Rest',                dur: 30, type: 'rest',
    tip: 'Breathe. Bent-Over Rows are next.',
    voice: 'Good work. Bent Over Rows next.' },
  { name: 'Bent-Over Row',       dur: 60, type: 'work', img: IMGS['Bent-Over Row'],
    tip: 'Hinge forward 45\u00B0. Drive elbows to ceiling. Squeeze your back.',
    voice: 'Bent Over Rows! Pull those elbows to the sky. Squeeze at the top.' },
  { name: 'Rest',                dur: 30, type: 'rest',
    tip: 'Breathe. Push Press is coming.',
    voice: 'Rest. Push Press is next.' },
  { name: 'Dumbbell Push Press', dur: 60, type: 'work', img: IMGS['Dumbbell Push Press'],
    tip: 'Slight knee dip, then explode the dumbbells overhead. Lock out.',
    voice: 'Push Press! Dip and drive. Use those legs to get the weight up.' },
  { name: 'Rest',                dur: 30, type: 'rest',
    tip: 'Breathe. Alternating Lunges are next.',
    voice: 'Rest. Lunges are coming.' },
  { name: 'Alternating Lunges',  dur: 60, type: 'work', img: IMGS['Alternating Lunges'],
    tip: 'Big step, drop back knee toward the floor. Push through front heel.',
    voice: 'Alternating Lunges! Big step, drop that knee. Power back up. Alternate sides.' },
  { name: 'Rest',                dur: 30, type: 'rest',
    tip: 'Breathe. Bicep Curls next.',
    voice: 'Rest. Bicep Curls coming.' },
  { name: 'Bicep Curl',          dur: 60, type: 'work', img: IMGS['Bicep Curl'],
    tip: 'Elbows pinned to sides. Full range. Control the weight down.',
    voice: 'Bicep Curls! Elbows stay pinned. Squeeze hard at the top. No swinging.' },
  { name: 'Rest',                dur: 30, type: 'rest',
    tip: 'Breathe. Lateral Raises next.',
    voice: 'Rest. Lateral Raises coming.' },
  { name: 'Lateral Raise',       dur: 60, type: 'work', img: IMGS['Lateral Raise'],
    tip: 'Slight bend in elbows. Raise to shoulder height. Slow and controlled.',
    voice: 'Lateral Raises! Arms slightly bent. Raise to shoulder level. Feel that burn.' },
  { name: 'Rest',                dur: 30, type: 'rest',
    tip: 'Breathe. Three more to go. You\'ve got this!',
    voice: 'Rest. Three more exercises. Home stretch!' },
  { name: 'Renegade Row',        dur: 60, type: 'work', img: IMGS['Renegade Row'],
    tip: 'Plank on dumbbells. Row one arm at a time. Brace core. No hip twist.',
    voice: 'Renegade Rows! Into your plank. Row each arm. Hips stay square!' },
  { name: 'Rest',                dur: 30, type: 'rest',
    tip: 'Breathe. Goblet Squat next.',
    voice: 'Rest up. Goblet Squats next.' },
  { name: 'Goblet Squat',        dur: 60, type: 'work', img: IMGS['Goblet Squat'],
    tip: 'Hold one dumbbell at chest. Drive elbows to push knees wide. Sit deep.',
    voice: 'Goblet Squats! Dumbbell to your chest. Elbows drive knees wide. Deep squat.' },
  { name: 'Rest',                dur: 30, type: 'rest',
    tip: 'Last rest. Final exercise. Finish strong!',
    voice: 'Final rest. Last one. Finish strong!' },
  { name: 'Sit & Press',         dur: 60, type: 'work', img: IMGS['Sit & Press'],
    tip: 'Sit up and press dumbbells overhead simultaneously. Control back down.',
    voice: 'Sit and Press! Sit up, press overhead. Last exercise! Finish strong!' },
]

export const TOTAL_SECONDS = WORKOUT.reduce((s, e) => s + e.dur, 0)
export const CIRCUMFERENCE = 2 * Math.PI * 64 // r=64 ~ 402

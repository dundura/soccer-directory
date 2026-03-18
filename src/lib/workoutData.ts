export type ExerciseType = 'work' | 'rest'

export interface Exercise {
  name: string
  dur: number
  type: ExerciseType
  tip: string
  voice: string
  img?: string
}

export interface WorkoutPlan {
  id: string
  name: string
  label: string
  description: string
  exercises: Exercise[]
}

function buildWorkout(exercises: Omit<Exercise, 'type' | 'dur'>[]): Exercise[] {
  const result: Exercise[] = []
  exercises.forEach((ex, i) => {
    result.push({ ...ex, dur: 60, type: 'work' })
    if (i < exercises.length - 1) {
      const next = exercises[i + 1]
      result.push({
        name: 'Rest',
        dur: 30,
        type: 'rest',
        tip: `Breathe. ${next.name} is next.`,
        voice: `Rest up. ${next.name} is coming.`,
      })
    }
  })
  return result
}

// ── FULL BODY (original) ──────────────────────────────────
const FULL_BODY = buildWorkout([
  { name: 'Dumbbell Squat',
    tip: 'Feet shoulder-width. Drive through heels. Chest proud.',
    voice: 'Dumbbell Squats! Drive those heels in. Chest up, core tight. Let\'s go!',
    img: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=480&h=320&fit=crop&q=80' },
  { name: 'Romanian Deadlift',
    tip: 'Soft knee bend. Hinge from hips. Feel that hamstring stretch.',
    voice: 'Romanian Deadlifts! Hinge at the hips. Feel those hamstrings load. Control it.',
    img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=480&h=320&fit=crop&q=80' },
  { name: 'Bent-Over Row',
    tip: 'Hinge forward 45\u00B0. Drive elbows to ceiling. Squeeze your back.',
    voice: 'Bent Over Rows! Pull those elbows to the sky. Squeeze at the top.',
    img: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=480&h=320&fit=crop&q=80' },
  { name: 'Dumbbell Push Press',
    tip: 'Slight knee dip, then explode the dumbbells overhead. Lock out.',
    voice: 'Push Press! Dip and drive. Use those legs to get the weight up.',
    img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=480&h=320&fit=crop&q=80' },
  { name: 'Alternating Lunges',
    tip: 'Big step, drop back knee toward the floor. Push through front heel.',
    voice: 'Alternating Lunges! Big step, drop that knee. Power back up. Alternate sides.',
    img: 'https://images.unsplash.com/photo-1536922246289-88c42f957773?w=480&h=320&fit=crop&q=80' },
  { name: 'Bicep Curl',
    tip: 'Elbows pinned to sides. Full range. Control the weight down.',
    voice: 'Bicep Curls! Elbows stay pinned. Squeeze hard at the top. No swinging.',
    img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=480&h=320&fit=crop&q=80' },
  { name: 'Lateral Raise',
    tip: 'Slight bend in elbows. Raise to shoulder height. Slow and controlled.',
    voice: 'Lateral Raises! Arms slightly bent. Raise to shoulder level. Feel that burn.',
    img: 'https://images.unsplash.com/photo-1590487988256-9ed24133863e?w=480&h=320&fit=crop&q=80' },
  { name: 'Renegade Row',
    tip: 'Plank on dumbbells. Row one arm at a time. Brace core. No hip twist.',
    voice: 'Renegade Rows! Into your plank. Row each arm. Hips stay square!',
    img: 'https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=480&h=320&fit=crop&q=80' },
  { name: 'Goblet Squat',
    tip: 'Hold one dumbbell at chest. Drive elbows to push knees wide. Sit deep.',
    voice: 'Goblet Squats! Dumbbell to your chest. Elbows drive knees wide. Deep squat.',
    img: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=480&h=320&fit=crop&q=80' },
  { name: 'Sit & Press',
    tip: 'Sit up and press dumbbells overhead simultaneously. Control back down.',
    voice: 'Sit and Press! Sit up, press overhead. Last exercise! Finish strong!',
    img: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=480&h=320&fit=crop&q=80' },
])

// ── UPPER BODY ────────────────────────────────────────────
const UPPER_BODY = buildWorkout([
  { name: 'Dumbbell Push Press',
    tip: 'Slight knee dip, then explode the dumbbells overhead. Lock out.',
    voice: 'Push Press! Dip and drive. Explode those dumbbells overhead!',
    img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=480&h=320&fit=crop&q=80' },
  { name: 'Dumbbell Bench Press',
    tip: 'Lie back, press dumbbells up. Lower slow, press explosive.',
    voice: 'Dumbbell Bench Press! Control it down, power it up. Big chest!',
    img: 'https://images.unsplash.com/photo-1534368959876-26bf04f2c947?w=480&h=320&fit=crop&q=80' },
  { name: 'Lateral Raise',
    tip: 'Slight bend in elbows. Raise to shoulder height. Slow and controlled.',
    voice: 'Lateral Raises! Shoulder level. Control the weight. Feel that burn.',
    img: 'https://images.unsplash.com/photo-1590487988256-9ed24133863e?w=480&h=320&fit=crop&q=80' },
  { name: 'Arnold Press',
    tip: 'Start palms facing you, rotate as you press overhead. Full range.',
    voice: 'Arnold Press! Rotate and press. Full range of motion. Shoulders on fire!',
    img: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=480&h=320&fit=crop&q=80' },
  { name: 'Front Raise',
    tip: 'Arms straight, raise dumbbells to eye level. Slow on the way down.',
    voice: 'Front Raises! Straight arms, eye level. Control the negative.',
    img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=480&h=320&fit=crop&q=80' },
  { name: 'Tricep Kickback',
    tip: 'Hinge forward, extend arms behind you. Squeeze the triceps.',
    voice: 'Tricep Kickbacks! Hinge forward, extend and squeeze. Lock it out!',
    img: 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=480&h=320&fit=crop&q=80' },
  { name: 'Chest Fly',
    tip: 'Arms wide, slight bend in elbows. Squeeze chest at the top.',
    voice: 'Chest Flys! Wide arms, squeeze at the top. Feel that stretch and squeeze.',
    img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=480&h=320&fit=crop&q=80' },
  { name: 'Overhead Tricep Extension',
    tip: 'One dumbbell overhead, both hands. Lower behind head, press up.',
    voice: 'Overhead Tricep Extensions! Lower behind your head. Press it up. Triceps burning!',
    img: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=480&h=320&fit=crop&q=80' },
  { name: 'Dumbbell Shrug',
    tip: 'Heavy dumbbells at sides. Shrug shoulders to ears. Hold at top.',
    voice: 'Dumbbell Shrugs! Shoulders to ears. Hold and squeeze at the top.',
    img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=480&h=320&fit=crop&q=80' },
  { name: 'Push-Up to Renegade Row',
    tip: 'Push-up, then row each dumbbell. Core tight the whole time.',
    voice: 'Push-Up to Row! Push-up, row left, row right. Last one! Finish strong!',
    img: 'https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=480&h=320&fit=crop&q=80' },
])

// ── LOWER BODY ────────────────────────────────────────────
const LOWER_BODY = buildWorkout([
  { name: 'Goblet Squat',
    tip: 'Hold one dumbbell at chest. Drive elbows to push knees wide. Sit deep.',
    voice: 'Goblet Squats! Dumbbell at chest, sit deep. Elbows push those knees wide!',
    img: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=480&h=320&fit=crop&q=80' },
  { name: 'Romanian Deadlift',
    tip: 'Soft knee bend. Hinge from hips. Feel that hamstring stretch.',
    voice: 'Romanian Deadlifts! Hinge at the hips. Load those hamstrings. Control it.',
    img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=480&h=320&fit=crop&q=80' },
  { name: 'Walking Lunges',
    tip: 'Big step forward, drop back knee. Push through front heel to next step.',
    voice: 'Walking Lunges! Big steps, drop that knee. Keep moving forward!',
    img: 'https://images.unsplash.com/photo-1536922246289-88c42f957773?w=480&h=320&fit=crop&q=80' },
  { name: 'Sumo Squat',
    tip: 'Wide stance, toes out. Hold dumbbell between legs. Drive up through heels.',
    voice: 'Sumo Squats! Wide stance, dumbbell low. Drive through those heels!',
    img: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=480&h=320&fit=crop&q=80' },
  { name: 'Bulgarian Split Squat (L)',
    tip: 'Back foot elevated. Drop straight down. All the weight on front leg.',
    voice: 'Bulgarian Split Squats, left leg! Back foot up. Drop down. Feel that burn!',
    img: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=480&h=320&fit=crop&q=80' },
  { name: 'Bulgarian Split Squat (R)',
    tip: 'Switch legs. Back foot elevated. Drop straight down. Push through front heel.',
    voice: 'Switch sides! Right leg now. Same form. Drop and drive!',
    img: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=480&h=320&fit=crop&q=80' },
  { name: 'Dumbbell Calf Raise',
    tip: 'Hold dumbbells at sides. Rise onto toes. Pause at top. Slow down.',
    voice: 'Calf Raises! Up on those toes. Squeeze at the top. Slow on the way down.',
    img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=480&h=320&fit=crop&q=80' },
  { name: 'Stiff-Leg Deadlift',
    tip: 'Legs nearly straight. Hinge from hips. Maximum hamstring stretch.',
    voice: 'Stiff-Leg Deadlifts! Straight legs, deep hinge. Feel that hamstring stretch!',
    img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=480&h=320&fit=crop&q=80' },
  { name: 'Squat Pulse',
    tip: 'Stay low in squat position. Small pulses up and down. Don\'t stand up.',
    voice: 'Squat Pulses! Stay low. Small pulses. Do not stand up. Burn those quads!',
    img: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=480&h=320&fit=crop&q=80' },
  { name: 'Jump Squat',
    tip: 'Bodyweight. Squat down, explode up. Land soft. Repeat.',
    voice: 'Jump Squats! Explode up, land soft. Last exercise! Give it everything!',
    img: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=480&h=320&fit=crop&q=80' },
])

// ── BACK ──────────────────────────────────────────────────
const BACK = buildWorkout([
  { name: 'Bent-Over Row',
    tip: 'Hinge forward 45\u00B0. Drive elbows to ceiling. Squeeze your back.',
    voice: 'Bent Over Rows! Pull those elbows to the sky. Squeeze at the top.',
    img: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=480&h=320&fit=crop&q=80' },
  { name: 'Single-Arm Row (L)',
    tip: 'One hand on bench. Pull dumbbell to hip. Squeeze lat at the top.',
    voice: 'Single Arm Row, left side! Pull to your hip. Squeeze that lat!',
    img: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=480&h=320&fit=crop&q=80' },
  { name: 'Single-Arm Row (R)',
    tip: 'Switch sides. Pull dumbbell to hip. Keep core braced.',
    voice: 'Switch sides! Right arm now. Same form. Pull and squeeze!',
    img: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=480&h=320&fit=crop&q=80' },
  { name: 'Renegade Row',
    tip: 'Plank on dumbbells. Row one arm at a time. Brace core. No hip twist.',
    voice: 'Renegade Rows! Plank position. Row each arm. Keep those hips square!',
    img: 'https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=480&h=320&fit=crop&q=80' },
  { name: 'Reverse Fly',
    tip: 'Hinge forward, arms hang down. Raise arms out to sides. Squeeze shoulder blades.',
    voice: 'Reverse Flys! Hinge forward. Arms wide. Squeeze those shoulder blades together!',
    img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=480&h=320&fit=crop&q=80' },
  { name: 'Dumbbell Pullover',
    tip: 'Lie back, one dumbbell overhead. Lower behind head, pull back over chest.',
    voice: 'Dumbbell Pullovers! Stretch back behind your head. Pull it over. Feel those lats!',
    img: 'https://images.unsplash.com/photo-1534368959876-26bf04f2c947?w=480&h=320&fit=crop&q=80' },
  { name: 'Wide Row',
    tip: 'Hinge forward, elbows flare out wide at 90\u00B0. Squeeze upper back.',
    voice: 'Wide Rows! Elbows out wide. Squeeze that upper back. Feel it!',
    img: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=480&h=320&fit=crop&q=80' },
  { name: 'Dumbbell Shrug',
    tip: 'Heavy dumbbells at sides. Shrug shoulders to ears. Hold at top.',
    voice: 'Dumbbell Shrugs! Shoulders to ears. Hold and squeeze. Build those traps!',
    img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=480&h=320&fit=crop&q=80' },
  { name: 'Prone Y-Raise',
    tip: 'Lie face down. Arms in Y-shape. Raise up. Squeeze between shoulder blades.',
    voice: 'Y-Raises! Face down, arms in a Y. Raise and squeeze. Upper back on fire!',
    img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=480&h=320&fit=crop&q=80' },
  { name: 'Superman Row',
    tip: 'Lie face down, row dumbbells. Lift chest off floor as you pull.',
    voice: 'Superman Rows! Chest off the floor. Row and hold. Last one! Finish strong!',
    img: 'https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=480&h=320&fit=crop&q=80' },
])

// ── ARMS ──────────────────────────────────────────────────
const ARMS = buildWorkout([
  { name: 'Bicep Curl',
    tip: 'Elbows pinned to sides. Full range. Control the weight down.',
    voice: 'Bicep Curls! Elbows pinned. Squeeze hard at the top. No swinging!',
    img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=480&h=320&fit=crop&q=80' },
  { name: 'Tricep Kickback',
    tip: 'Hinge forward, extend arms behind you. Squeeze the triceps.',
    voice: 'Tricep Kickbacks! Hinge forward. Extend and squeeze. Lock it out!',
    img: 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=480&h=320&fit=crop&q=80' },
  { name: 'Hammer Curl',
    tip: 'Palms face each other. Curl up. Targets the brachialis.',
    voice: 'Hammer Curls! Palms facing in. Curl and squeeze. Build those arms!',
    img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=480&h=320&fit=crop&q=80' },
  { name: 'Overhead Tricep Extension',
    tip: 'One dumbbell overhead, both hands. Lower behind head, press up.',
    voice: 'Overhead Extensions! Lower behind your head. Press it up. Feel those triceps!',
    img: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=480&h=320&fit=crop&q=80' },
  { name: 'Concentration Curl (L)',
    tip: 'Sit down, elbow on inner thigh. Curl with full focus. Squeeze.',
    voice: 'Concentration Curls, left arm! Elbow on thigh. Full squeeze at the top.',
    img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=480&h=320&fit=crop&q=80' },
  { name: 'Concentration Curl (R)',
    tip: 'Switch arms. Same focus. Full range of motion.',
    voice: 'Switch arms! Right side now. Same focus. Squeeze it!',
    img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=480&h=320&fit=crop&q=80' },
  { name: 'Close-Grip Press',
    tip: 'Dumbbells together, press up. Elbows stay close to body. Tricep focus.',
    voice: 'Close Grip Press! Dumbbells together. Press up. Elbows in. Triceps on fire!',
    img: 'https://images.unsplash.com/photo-1534368959876-26bf04f2c947?w=480&h=320&fit=crop&q=80' },
  { name: 'Zottman Curl',
    tip: 'Curl up with palms up, rotate to palms down at top, lower slowly.',
    voice: 'Zottman Curls! Curl up, rotate at the top, slow negative. Full forearm burn!',
    img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=480&h=320&fit=crop&q=80' },
  { name: 'Diamond Push-Up',
    tip: 'Hands together in diamond shape. Push-up. Targets triceps.',
    voice: 'Diamond Push-Ups! Hands together. Tricep focused. Almost done!',
    img: 'https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=480&h=320&fit=crop&q=80' },
  { name: '21s Curl',
    tip: '7 bottom half, 7 top half, 7 full range. No rest between.',
    voice: 'Twenty-Ones! Seven bottom, seven top, seven full. Last exercise! Empty the tank!',
    img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=480&h=320&fit=crop&q=80' },
])

// ── EXPORTS ───────────────────────────────────────────────
export const WORKOUTS: WorkoutPlan[] = [
  { id: 'full', name: 'Full Body', label: 'FULL BODY', description: 'Hit every muscle group in 15 minutes', exercises: FULL_BODY },
  { id: 'upper', name: 'Upper Body', label: 'UPPER BODY', description: 'Chest, shoulders, and triceps', exercises: UPPER_BODY },
  { id: 'lower', name: 'Lower Body', label: 'LOWER BODY', description: 'Quads, hamstrings, glutes, and calves', exercises: LOWER_BODY },
  { id: 'back', name: 'Back', label: 'BACK', description: 'Lats, traps, and rear delts', exercises: BACK },
  { id: 'arms', name: 'Arms', label: 'ARMS', description: 'Biceps, triceps, and forearms', exercises: ARMS },
]

// Default for backward compat
export const WORKOUT = FULL_BODY
export const IMGS: Record<string, string> = {}
export const TOTAL_SECONDS = FULL_BODY.reduce((s, e) => s + e.dur, 0)
export const CIRCUMFERENCE = 2 * Math.PI * 64

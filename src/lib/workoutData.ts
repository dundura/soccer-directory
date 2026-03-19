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
  icon: string
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

function buildStretch(exercises: Omit<Exercise, 'type' | 'dur'>[]): Exercise[] {
  const result: Exercise[] = []
  exercises.forEach((ex, i) => {
    result.push({ ...ex, dur: 45, type: 'work' })
    if (i < exercises.length - 1) {
      const next = exercises[i + 1]
      result.push({
        name: 'Transition',
        dur: 10,
        type: 'rest',
        tip: `Switch to ${next.name}.`,
        voice: `Next up, ${next.name}.`,
      })
    }
  })
  return result
}

const G = 'https://static.exercisedb.dev/media'

// ── DUMBBELL: FULL BODY ───────────────────────────────────
const DB_FULL_BODY = buildWorkout([
  { name: 'Dumbbell Squat', tip: 'Feet shoulder-width. Drive through heels. Chest proud.', voice: 'Dumbbell Squats! Drive those heels in. Chest up, core tight. Let\'s go!', img: `${G}/yn8yg1r.gif` },
  { name: 'Romanian Deadlift', tip: 'Soft knee bend. Hinge from hips. Feel that hamstring stretch.', voice: 'Romanian Deadlifts! Hinge at the hips. Feel those hamstrings load. Control it.', img: `${G}/rR0LJzx.gif` },
  { name: 'Bent-Over Row', tip: 'Hinge forward 45\u00B0. Drive elbows to ceiling. Squeeze your back.', voice: 'Bent Over Rows! Pull those elbows to the sky. Squeeze at the top.', img: `${G}/BJ0Hz5L.gif` },
  { name: 'Dumbbell Push Press', tip: 'Slight knee dip, then explode the dumbbells overhead. Lock out.', voice: 'Push Press! Dip and drive. Use those legs to get the weight up.', img: `${G}/Xy4jlWA.gif` },
  { name: 'Alternating Lunges', tip: 'Big step, drop back knee toward the floor. Push through front heel.', voice: 'Alternating Lunges! Big step, drop that knee. Power back up.', img: `${G}/qx4fgX7.gif` },
  { name: 'Bicep Curl', tip: 'Elbows pinned to sides. Full range. Control the weight down.', voice: 'Bicep Curls! Elbows stay pinned. Squeeze hard at the top.', img: `${G}/DsgkuIt.gif` },
  { name: 'Lateral Raise', tip: 'Slight bend in elbows. Raise to shoulder height. Slow and controlled.', voice: 'Lateral Raises! Arms slightly bent. Raise to shoulder level.', img: `${G}/DsgkuIt.gif` },
  { name: 'Renegade Row', tip: 'Plank on dumbbells. Row one arm at a time. Brace core.', voice: 'Renegade Rows! Into your plank. Row each arm. Hips stay square!', img: `${G}/C0MA9bC.gif` },
  { name: 'Goblet Squat', tip: 'Hold one dumbbell at chest. Drive elbows to push knees wide.', voice: 'Goblet Squats! Dumbbell to your chest. Elbows drive knees wide.', img: `${G}/yn8yg1r.gif` },
  { name: 'Sit & Press', tip: 'Sit up and press dumbbells overhead simultaneously.', voice: 'Sit and Press! Last exercise! Finish strong!', img: `${G}/PdmaD0N.gif` },
])

// ── DUMBBELL: UPPER BODY ──────────────────────────────────
const DB_UPPER = buildWorkout([
  { name: 'Dumbbell Push Press', tip: 'Slight knee dip, then explode overhead.', voice: 'Push Press! Dip and drive!', img: `${G}/Xy4jlWA.gif` },
  { name: 'Dumbbell Bench Press', tip: 'Lie back, press up. Lower slow, press explosive.', voice: 'Bench Press! Control down, power up!', img: `${G}/SpYC0Kp.gif` },
  { name: 'Lateral Raise', tip: 'Raise to shoulder height. Slow and controlled.', voice: 'Lateral Raises! Feel that burn!', img: `${G}/DsgkuIt.gif` },
  { name: 'Arnold Press', tip: 'Start palms facing you, rotate as you press.', voice: 'Arnold Press! Rotate and press!', img: `${G}/Xy4jlWA.gif` },
  { name: 'Front Raise', tip: 'Arms straight, raise to eye level.', voice: 'Front Raises! Control the negative.', img: `${G}/3eGE2JC.gif` },
  { name: 'Tricep Kickback', tip: 'Hinge forward, extend arms behind you.', voice: 'Tricep Kickbacks! Extend and squeeze!', img: `${G}/W6PxUkg.gif` },
  { name: 'Chest Fly', tip: 'Arms wide, squeeze chest at the top.', voice: 'Chest Flys! Squeeze at the top!', img: `${G}/SpYC0Kp.gif` },
  { name: 'Overhead Tricep Extension', tip: 'Lower behind head, press up.', voice: 'Overhead Extensions! Triceps burning!', img: `${G}/PdmaD0N.gif` },
  { name: 'Dumbbell Shrug', tip: 'Shrug shoulders to ears. Hold at top.', voice: 'Shrugs! Shoulders to ears!', img: `${G}/NJzBsGJ.gif` },
  { name: 'Push-Up to Row', tip: 'Push-up, then row each dumbbell.', voice: 'Push-Up to Row! Last one! Finish strong!', img: `${G}/C0MA9bC.gif` },
])

// ── DUMBBELL: LOWER BODY ──────────────────────────────────
const DB_LOWER = buildWorkout([
  { name: 'Goblet Squat', tip: 'Dumbbell at chest, sit deep.', voice: 'Goblet Squats! Sit deep!', img: `${G}/yn8yg1r.gif` },
  { name: 'Romanian Deadlift', tip: 'Hinge from hips. Feel the hamstrings.', voice: 'Romanian Deadlifts! Control it.', img: `${G}/rR0LJzx.gif` },
  { name: 'Walking Lunges', tip: 'Big step forward, drop back knee.', voice: 'Walking Lunges! Keep moving forward!', img: `${G}/qx4fgX7.gif` },
  { name: 'Sumo Squat', tip: 'Wide stance, toes out. Drive through heels.', voice: 'Sumo Squats! Wide and deep!', img: `${G}/yn8yg1r.gif` },
  { name: 'Bulgarian Split Squat (L)', tip: 'Back foot elevated. Drop straight down.', voice: 'Bulgarian Split Squats, left leg!', img: `${G}/qx4fgX7.gif` },
  { name: 'Bulgarian Split Squat (R)', tip: 'Switch legs. Same form.', voice: 'Switch sides! Right leg now!', img: `${G}/qx4fgX7.gif` },
  { name: 'Dumbbell Calf Raise', tip: 'Rise onto toes. Pause at top.', voice: 'Calf Raises! Squeeze at the top!', img: `${G}/nUwVh7b.gif` },
  { name: 'Stiff-Leg Deadlift', tip: 'Legs nearly straight. Maximum hamstring stretch.', voice: 'Stiff-Leg Deadlifts! Feel that stretch!', img: `${G}/5eLRITT.gif` },
  { name: 'Squat Pulse', tip: 'Stay low. Small pulses. Don\'t stand up.', voice: 'Squat Pulses! Stay low! Burn those quads!', img: `${G}/yn8yg1r.gif` },
  { name: 'Jump Squat', tip: 'Squat down, explode up. Land soft.', voice: 'Jump Squats! Last one! Give it everything!', img: `${G}/yn8yg1r.gif` },
])

// ── DUMBBELL: BACK ────────────────────────────────────────
const DB_BACK = buildWorkout([
  { name: 'Bent-Over Row', tip: 'Drive elbows to ceiling. Squeeze your back.', voice: 'Bent Over Rows! Squeeze at the top.', img: `${G}/BJ0Hz5L.gif` },
  { name: 'Single-Arm Row (L)', tip: 'Pull dumbbell to hip. Squeeze lat.', voice: 'Single Arm Row, left side!', img: `${G}/C0MA9bC.gif` },
  { name: 'Single-Arm Row (R)', tip: 'Switch sides. Pull to hip.', voice: 'Switch sides! Right arm!', img: `${G}/C0MA9bC.gif` },
  { name: 'Renegade Row', tip: 'Plank on dumbbells. Row one arm at a time.', voice: 'Renegade Rows! Hips stay square!', img: `${G}/C0MA9bC.gif` },
  { name: 'Reverse Fly', tip: 'Hinge forward. Raise arms to sides.', voice: 'Reverse Flys! Squeeze those shoulder blades!', img: `${G}/v1qBec9.gif` },
  { name: 'Dumbbell Pullover', tip: 'Lower behind head, pull back over chest.', voice: 'Pullovers! Feel those lats!', img: `${G}/9XjtHvS.gif` },
  { name: 'Wide Row', tip: 'Elbows flare out wide. Squeeze upper back.', voice: 'Wide Rows! Upper back on fire!', img: `${G}/wt6rwjk.gif` },
  { name: 'Dumbbell Shrug', tip: 'Shoulders to ears. Hold at top.', voice: 'Shrugs! Build those traps!', img: `${G}/NJzBsGJ.gif` },
  { name: 'Prone Y-Raise', tip: 'Face down. Arms in Y. Raise and squeeze.', voice: 'Y-Raises! Upper back on fire!', img: `${G}/PbzNu7c.gif` },
  { name: 'Superman Row', tip: 'Chest off floor, row dumbbells.', voice: 'Superman Rows! Last one! Finish strong!', img: `${G}/XUUD0Fs.gif` },
])

// ── DUMBBELL: ARMS ────────────────────────────────────────
const DB_ARMS = buildWorkout([
  { name: 'Bicep Curl', tip: 'Elbows pinned. Full range.', voice: 'Bicep Curls! No swinging!', img: `${G}/DsgkuIt.gif` },
  { name: 'Tricep Kickback', tip: 'Hinge forward, extend and squeeze.', voice: 'Tricep Kickbacks! Lock it out!', img: `${G}/W6PxUkg.gif` },
  { name: 'Hammer Curl', tip: 'Palms face each other. Curl up.', voice: 'Hammer Curls! Build those arms!', img: `${G}/DsgkuIt.gif` },
  { name: 'Overhead Tricep Extension', tip: 'Lower behind head, press up.', voice: 'Overhead Extensions! Feel those triceps!', img: `${G}/PdmaD0N.gif` },
  { name: 'Concentration Curl (L)', tip: 'Elbow on thigh. Full squeeze.', voice: 'Concentration Curls, left arm!', img: `${G}/DsgkuIt.gif` },
  { name: 'Concentration Curl (R)', tip: 'Switch arms. Same focus.', voice: 'Switch arms! Right side!', img: `${G}/DsgkuIt.gif` },
  { name: 'Close-Grip Press', tip: 'Dumbbells together, press up. Tricep focus.', voice: 'Close Grip Press! Triceps on fire!', img: `${G}/RxayqAZ.gif` },
  { name: 'Zottman Curl', tip: 'Curl up, rotate at top, lower slowly.', voice: 'Zottman Curls! Full forearm burn!', img: `${G}/DsgkuIt.gif` },
  { name: 'Diamond Push-Up', tip: 'Hands together. Targets triceps.', voice: 'Diamond Push-Ups! Almost done!', img: `${G}/soIB2rj.gif` },
  { name: '21s Curl', tip: '7 bottom half, 7 top half, 7 full range.', voice: 'Twenty-Ones! Last exercise! Empty the tank!', img: `${G}/DsgkuIt.gif` },
])

// ── SOCCER FITNESS ────────────────────────────────────────
const SOCCER_FITNESS = buildWorkout([
  { name: 'High Knees', tip: 'Drive knees to chest. Stay on the balls of your feet. Fast pace.', voice: 'High Knees! Pump those arms. Drive the knees up. Let\'s go!', img: `${G}/ealLwvX.gif` },
  { name: 'Burpees', tip: 'Drop, chest to floor, explode up with a jump. Full range.', voice: 'Burpees! Drop, push, jump. Maximum effort!', img: `${G}/dK9394r.gif` },
  { name: 'Mountain Climbers', tip: 'Plank position. Drive knees to chest alternating. Fast.', voice: 'Mountain Climbers! Drive those knees. Keep your hips low!', img: `${G}/RJgzwny.gif` },
  { name: 'Jumping Jacks', tip: 'Arms overhead, feet wide. Snap back to center. Stay light.', voice: 'Jumping Jacks! Arms up, feet wide. Keep the tempo!', img: `${G}/1g5bPpA.gif` },
  { name: 'Squat Jumps', tip: 'Squat down, explode up. Land soft on the balls of your feet.', voice: 'Squat Jumps! Explode up, land soft. Power through!', img: `${G}/6FMU51h.gif` },
  { name: 'Plank Hold', tip: 'Forearms down, body straight. Core tight. Don\'t let hips sag.', voice: 'Plank Hold! Core tight. Straight line from head to heels. Hold it!', img: `${G}/VBAWRPG.gif` },
  { name: 'Bicycle Crunches', tip: 'Opposite elbow to knee. Rotate your torso. Controlled.', voice: 'Bicycle Crunches! Elbow to knee. Rotate and squeeze!', img: `${G}/tZkGYZ9.gif` },
  { name: 'Speed Skaters', tip: 'Leap side to side. Land on one foot. Touch the ground.', voice: 'Speed Skaters! Leap and land. Stay low and explosive!', img: `${G}/zfNHMN9.gif` },
  { name: 'Burpees', tip: 'Second round. Push harder. Don\'t slow down.', voice: 'Burpees again! Dig deep. You\'ve got this!', img: `${G}/dK9394r.gif` },
  { name: 'Mountain Climbers', tip: 'Last exercise. Sprint those knees. Empty the tank.', voice: 'Mountain Climbers! Final push! Give it everything you\'ve got!', img: `${G}/RJgzwny.gif` },
])

// ── SOCCER FULL BODY ──────────────────────────────────────
const SOCCER_FULL_BODY = buildWorkout([
  { name: 'Push-Ups', tip: 'Chest to floor, push up. Keep core tight the whole time.', voice: 'Push-Ups! Chest to the floor. Core tight. Full range!', img: `${G}/I4hDWkc.gif` },
  { name: 'Bodyweight Squats', tip: 'Sit back and down. Knees track over toes. Drive up.', voice: 'Bodyweight Squats! Sit deep. Drive through those heels!', img: `${G}/9E25EOx.gif` },
  { name: 'Walking Lunges', tip: 'Big step forward, drop back knee. Push through front heel.', voice: 'Walking Lunges! Big steps. Drop that knee!', img: `${G}/IZVHb27.gif` },
  { name: 'Glute Bridge', tip: 'Lie on back, feet flat. Drive hips to ceiling. Squeeze glutes.', voice: 'Glute Bridges! Drive those hips up. Squeeze at the top!', img: `${G}/196HJGw.gif` },
  { name: 'Side Plank (L)', tip: 'Left forearm down. Stack feet. Hips up. Hold.', voice: 'Side Plank, left side! Hips up. Hold it steady!', img: `${G}/5VXmnV5.gif` },
  { name: 'Side Plank (R)', tip: 'Switch sides. Right forearm down. Hips up.', voice: 'Switch sides! Right side plank. Stay strong!', img: `${G}/5VXmnV5.gif` },
  { name: 'Leg Raises', tip: 'Lie on back. Raise legs to 90\u00B0. Lower slowly. Don\'t arch.', voice: 'Leg Raises! Slow and controlled. Core stays engaged!', img: `${G}/WhuFnR7.gif` },
  { name: 'Superman', tip: 'Lie face down. Raise arms and legs off floor. Hold and squeeze.', voice: 'Superman! Arms and legs up. Squeeze your back!', img: `${G}/4GqRrAk.gif` },
  { name: 'Squat Jumps', tip: 'Squat down, explode up. Land soft.', voice: 'Squat Jumps! Explosive power! Land soft!', img: `${G}/6FMU51h.gif` },
  { name: 'Push-Ups', tip: 'Last exercise. Go until you can\'t. Then do one more.', voice: 'Push-Ups! Final exercise! Give it everything!', img: `${G}/I4hDWkc.gif` },
])

// ── STRETCHING ────────────────────────────────────────────
const STRETCHING = buildStretch([
  { name: 'Hamstring Stretch', tip: 'Stand tall. Hinge forward, reach for toes. Hold and breathe.', voice: 'Hamstring Stretch. Hinge forward. Breathe into the stretch.', img: `${G}/99rWm7w.gif` },
  { name: 'Quad Stretch', tip: 'Stand on one leg. Pull foot to glute. Keep knees together.', voice: 'Quad Stretch. Pull your foot to your glute. Hold steady.', img: `${G}/BWnJR72.gif` },
  { name: 'Hip Flexor Stretch', tip: 'Lunge position. Push hips forward. Feel the front of the hip open.', voice: 'Hip Flexor Stretch. Push those hips forward. Open up.', img: `${G}/tFGKm99.gif` },
  { name: 'Shoulder Stretch', tip: 'Arm across body. Pull with opposite hand. Hold.', voice: 'Shoulder Stretch. Arm across. Hold and breathe.', img: `${G}/Uto7l43.gif` },
  { name: 'Tricep Stretch', tip: 'Arm overhead, elbow bent. Pull elbow with opposite hand.', voice: 'Tricep Stretch. Reach down your back. Pull and hold.', img: `${G}/Z5YStHW.gif` },
  { name: 'Seated Forward Fold', tip: 'Sit with legs straight. Reach for toes. Relax into it.', voice: 'Seated Forward Fold. Reach for your toes. Relax and breathe.', img: `${G}/QFmz6ch.gif` },
  { name: 'Butterfly Stretch', tip: 'Sit with soles together. Press knees down. Lean forward.', voice: 'Butterfly Stretch. Soles together. Press those knees down.', img: `${G}/hC6oYY5.gif` },
  { name: 'Piriformis Stretch', tip: 'Cross ankle over knee. Pull standing leg toward you.', voice: 'Piriformis Stretch. Ankle over knee. Feel the deep glute stretch.', img: `${G}/QY39eBr.gif` },
  { name: 'Hip Flexor Stretch', tip: 'Switch sides. Lunge position. Push hips forward.', voice: 'Hip Flexor Stretch, other side. Push forward and hold.', img: `${G}/tFGKm99.gif` },
  { name: 'Hamstring Stretch', tip: 'Final stretch. Hinge forward. Let gravity do the work.', voice: 'Final Hamstring Stretch. Let your body relax. Great work today.', img: `${G}/99rWm7w.gif` },
])

// ── CARDIO: INTERVAL RUN/WALK ─────────────────────────────
const CARDIO_INTERVALS: Exercise[] = [
  { name: 'Warm-Up Walk', dur: 60, type: 'work', tip: 'Easy pace. Get the blood flowing. Loosen up.', voice: 'Warm-up walk. Easy pace. Get those legs moving.' },
  { name: 'Jog', dur: 60, type: 'work', tip: 'Light jog. Find your rhythm. Steady breathing.', voice: 'Light jog. Find your rhythm. Steady breathing.' },
  { name: 'Walk', dur: 30, type: 'rest', tip: 'Recover. Slow it down. Control your breathing.', voice: 'Walk it out. Catch your breath.' },
  { name: 'Run', dur: 60, type: 'work', tip: 'Pick up the pace. Strong arms. Drive your knees.', voice: 'Run! Pick up the pace. Strong arms. Drive those knees!' },
  { name: 'Walk', dur: 30, type: 'rest', tip: 'Recover. You\'re doing great.', voice: 'Walk. Recover. You\'re doing great.' },
  { name: 'Sprint', dur: 30, type: 'work', tip: 'All out! Maximum effort. Leave nothing behind.', voice: 'Sprint! All out! Maximum effort! Go go go!' },
  { name: 'Walk', dur: 45, type: 'rest', tip: 'Recover from the sprint. Deep breaths.', voice: 'Walk it off. Deep breaths. Recover.' },
  { name: 'Run', dur: 60, type: 'work', tip: 'Back to a strong run. Push through.', voice: 'Run! Back at it. Strong pace. Push through!' },
  { name: 'Walk', dur: 30, type: 'rest', tip: 'Recover. Two more intervals.', voice: 'Walk. Two more. You\'ve got this.' },
  { name: 'Sprint', dur: 30, type: 'work', tip: 'All out again! Dig deep. This is where you grow.', voice: 'Sprint! Dig deep! This is where champions are made!' },
  { name: 'Walk', dur: 45, type: 'rest', tip: 'Recover. One more push.', voice: 'Walk. Recover. One more big push coming.' },
  { name: 'Run', dur: 60, type: 'work', tip: 'Strong run. Keep the form. Almost there.', voice: 'Run! Strong form. Almost there. Keep pushing!' },
  { name: 'Walk', dur: 30, type: 'rest', tip: 'Last recovery. Final sprint coming.', voice: 'Walk. Last recovery. Final sprint is next.' },
  { name: 'Sprint', dur: 30, type: 'work', tip: 'Final sprint! Everything you\'ve got. Empty the tank.', voice: 'Final Sprint! Everything you\'ve got! Empty the tank!' },
  { name: 'Cool-Down Walk', dur: 60, type: 'rest', tip: 'Slow walk. Let your heart rate come down. Great work.', voice: 'Cool down. Slow walk. Amazing work today. You crushed it.' },
]

// ── PLYOMETRICS ───────────────────────────────────────────
const PLYOMETRICS = buildWorkout([
  { name: 'Squat Jumps', tip: 'Squat deep, explode up. Land soft on the balls of your feet.', voice: 'Squat Jumps! Explode up, land soft. Maximum power!', img: `${G}/6FMU51h.gif` },
  { name: 'Box Jump (Imaginary)', tip: 'Swing arms, jump up onto an imaginary box. Land with bent knees. Step down.', voice: 'Box Jumps! Swing and explode. Land soft with bent knees!', img: `${G}/6FMU51h.gif` },
  { name: 'Lateral Bounds', tip: 'Leap side to side. Push off one foot, land on the other. Stay low and explosive.', voice: 'Lateral Bounds! Leap side to side. Stay low and explosive!', img: `${G}/zfNHMN9.gif` },
  { name: 'Tuck Jumps', tip: 'Jump high, pull knees to chest at the top. Land soft and repeat immediately.', voice: 'Tuck Jumps! Knees to chest. Maximum height every rep!', img: `${G}/6FMU51h.gif` },
  { name: 'Split Squat Jumps', tip: 'Lunge position. Jump and switch legs mid-air. Land in a lunge. Repeat.', voice: 'Split Squat Jumps! Jump and switch. Explosive legs!', img: `${G}/qx4fgX7.gif` },
  { name: 'Broad Jump', tip: 'Swing arms, jump forward as far as you can. Land soft. Walk back and repeat.', voice: 'Broad Jumps! Swing and launch forward. Maximum distance!', img: `${G}/6FMU51h.gif` },
  { name: 'Single-Leg Hop (L)', tip: 'Hop forward on left leg. Drive knee up. Stay balanced. Quick hops.', voice: 'Single Leg Hops, left leg! Drive that knee. Stay balanced!', img: `${G}/ealLwvX.gif` },
  { name: 'Single-Leg Hop (R)', tip: 'Switch to right leg. Same explosive hops. Drive the knee.', voice: 'Switch legs! Right leg now. Same power. Drive and hop!', img: `${G}/ealLwvX.gif` },
  { name: 'Burpee Jump', tip: 'Burpee with maximum jump at the top. Full extension. Land and go again.', voice: 'Burpee Jumps! Drop, push, explode sky high! Almost done!', img: `${G}/dK9394r.gif` },
  { name: 'Star Jumps', tip: 'Jump up, spread arms and legs into a star. Snap back together before landing.', voice: 'Star Jumps! Spread wide at the top. Last exercise! Give it everything!', img: `${G}/1g5bPpA.gif` },
])

// ── EXPORTS ───────────────────────────────────────────────
export const WORKOUTS: WorkoutPlan[] = [
  // Soccer
  { id: 'soccer-fitness', name: 'Soccer Fitness', label: 'SOCCER FITNESS', description: 'Speed, agility, and conditioning for the pitch', icon: '\u26BD', exercises: SOCCER_FITNESS },
  { id: 'soccer-full', name: 'Soccer Full Body', label: 'SOCCER FULL BODY', description: 'Bodyweight strength for soccer players', icon: '\u26BD', exercises: SOCCER_FULL_BODY },
  { id: 'plyo', name: 'Plyometrics', label: 'PLYOMETRICS', description: 'Explosive jumping and power for speed and agility', icon: '\uD83D\uDCA5', exercises: PLYOMETRICS },
  { id: 'cardio', name: 'Interval Run/Walk', label: 'INTERVAL RUN/WALK', description: 'Run, walk, sprint intervals for cardio', icon: '\uD83C\uDFC3', exercises: CARDIO_INTERVALS },
  { id: 'stretch', name: 'Stretching', label: 'STRETCHING', description: 'Recovery and flexibility for athletes', icon: '\uD83E\uDDD8', exercises: STRETCHING },
  // Dumbbell
  { id: 'db-full', name: 'Full Body', label: 'FULL BODY', description: 'Hit every muscle group with dumbbells', icon: '\uD83C\uDFCB\uFE0F', exercises: DB_FULL_BODY },
  { id: 'db-upper', name: 'Upper Body', label: 'UPPER BODY', description: 'Chest, shoulders, and triceps', icon: '\uD83C\uDFCB\uFE0F', exercises: DB_UPPER },
  { id: 'db-lower', name: 'Lower Body', label: 'LOWER BODY', description: 'Quads, hamstrings, glutes, and calves', icon: '\uD83C\uDFCB\uFE0F', exercises: DB_LOWER },
  { id: 'db-back', name: 'Back', label: 'BACK', description: 'Lats, traps, and rear delts', icon: '\uD83C\uDFCB\uFE0F', exercises: DB_BACK },
  { id: 'db-arms', name: 'Arms', label: 'ARMS', description: 'Biceps, triceps, and forearms', icon: '\uD83C\uDFCB\uFE0F', exercises: DB_ARMS },
]

export const WORKOUT = DB_FULL_BODY
export const IMGS: Record<string, string> = {}
export const TOTAL_SECONDS = DB_FULL_BODY.reduce((s, e) => s + e.dur, 0)
export const CIRCUMFERENCE = 2 * Math.PI * 64

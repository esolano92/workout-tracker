import { buildProgram, circuit, cx, ex, strength } from './build'

const EACH_SIDE_SET = 'Do all reps on one side, then the other. Each side counts as its own set.'
const BOTH_SIDES_SET = 'Do all reps on one side, then the other. Both sides together count as one set.'
const ALT_ROW = 'Row one side, then the other. That pair counts as one rep.'
const STAGGERED = 'Staggered stance: toes of the back foot in line with the heel of the front foot.'
const PULLOVER =
  'Lie on your back with the kettlebell on the floor behind your head. Grip the horns with both hands and pull it over until it is above your chest, squeezing your lats and chest the whole way.'
const OVERHEAD_CRUNCH =
  'Lie on your back holding the kettlebell overhead with both hands. Crunch up without letting your feet leave the floor.'
const GOOD_MORNING = 'Hold the kettlebell behind your head on your upper back, then hinge forward at the hips.'
const FARMERS = 'Kettlebells at your sides. Brace your core, keep your shoulders back and your spine neutral.'
const PIKE_HOLD = 'Lie on your back and hold your feet just above the kettlebell without touching it.'
const PLANK_SLIDE = 'In a high plank, drag the kettlebell under your body from one side to the other.'

export const kettlebellShred = buildProgram({
  id: 'kb-shred-8wk',
  name: '8 Week Kettlebell Shred',
  author: 'Adam Gooch',
  summary:
    'A 4-day-a-week beginner kettlebell program that gets progressively harder over 8 weeks. Full-body strength days plus conditioning circuits.',
  equipment: 'Two or more kettlebells and a pull-up bar or resistance band. Yoga mat and towel optional.',
  guidelines: [
    'Challenge yourself on every lift. If you only have a few kettlebell sizes, add reps to make it harder.',
    'Supersets (A1/A2, B1/B2): do A1, take the short rest listed, do A2, take the longer rest, then repeat.',
    'Circuit days: do every exercise back to back with no rest. Pick a weight you can finish every rep with. Rest only after the last exercise, then start the next round.',
    'On single-arm circuit moves you may rest up to 30 seconds before switching sides.',
    'Build a good foundation before attempting the more complex movements. When you finish, you can run the program again with heavier weights.',
  ],
  glossary: [
    { term: 'RPE', meaning: 'Rate of Perceived Exertion: how hard a set should feel, 1-10 (10 = all-out).' },
    { term: 'Rest', meaning: 'Rest time in seconds.' },
    { term: 'KB', meaning: 'Kettlebell' },
    { term: 'RDL', meaning: 'Romanian Deadlift' },
    { term: 'RFE', meaning: 'Rear Foot Elevated (back foot up on a bench or step)' },
    { term: 'OHP', meaning: 'Overhead Press' },
    { term: 'Front rack', meaning: 'Kettlebell resting at your shoulder, bell on the outside of your forearm.' },
    { term: 'AMRAP', meaning: 'As many reps as possible' },
  ],
  weeks: [
    // Week 1
    [
      strength('Full Body', 'https://youtu.be/ETVKTvqZExE', [
        ex('Narrow Stance Goblet Squat', 4, '8-10', '60', '6-7', {
          notes: 'Hold the kettlebell by the horns at your chest. Feet shoulder-width or narrower.',
        }),
        ex('Single Arm Clean', 4, '6-8 each side', '45-60', '6-7', { notes: EACH_SIDE_SET }),
        ex('Single Arm Bent Over Row', 4, '8-10 each side', '60', '6-7', { notes: EACH_SIDE_SET }),
        ex('Single Arm Floor Press', 4, '8-10 each side', '45-60', '6-7', { notes: EACH_SIDE_SET }),
      ]),
      strength('Full Body', 'https://youtu.be/DHpMyAB4B-w', [
        ex('Goblet Reverse Lunge', 4, '6-8 each leg', '60', '6-7', {
          notes: 'Hold the kettlebell by the horns at your chest and step back into a lunge.',
        }),
        ex('Swing', 4, '10-12', '45-60', '6-7', {
          notes: 'One kettlebell. Drive through your hips and squeeze your quads at the top.',
        }),
        ex('Kneeling Bottoms-Up Press', 4, '6-8', '45-60', '6-7', {
          notes: 'Kneel on the floor holding the kettlebell upside down by the horns, then press it overhead.',
        }),
        ex('Clean to Goblet Squat', 4, '8-10', '45-60', '6-7', {
          notes: 'Holding the horns, clean the kettlebell from the floor to your chest, then squat. That is one rep.',
        }),
        ex('Lying Pike Hold', 3, '45-60 sec', '45-60', undefined, { notes: PIKE_HOLD }),
      ]),
      strength('Full Body', 'https://youtu.be/7KT1DNmht8g', [
        ex('Swing', 4, '8-10', '45-60', '7-9'),
        ex('Double KB Deadlift', 4, '8', '45-60', '6-7'),
        ex('Single Arm Bridge Press', 4, '8-10', '20-30 before A2', '6-7', {
          group: 'A1',
          notes: 'Lie on your back, feet flat, hips lifted into a bridge, and press the kettlebell up.',
        }),
        ex('Alternating Bent Over Row', 3, '8-10', '60 before A1', '7-8', { group: 'A2', notes: ALT_ROW }),
        ex('Lying Pike Windshield Wipers', 4, '12 each side', '60', '6-7', {
          notes: 'Lie on your back with your legs raised and sweep them side to side over the kettlebell.',
        }),
      ]),
      strength('Full Body', 'https://youtu.be/fuYMG0oVJGE', [
        ex('Pull-ups or Banded Pull-downs', 5, '8-10', '60-90', '7-8', {
          notes: 'Wide or narrow grip. Keep every rep controlled.',
        }),
        ex('Suitcase RDL', 4, '6-8 each side', '60', '6-7', {
          notes: `Kettlebell at your side. ${EACH_SIDE_SET}`,
        }),
        ex('Wide Stance Goblet Squat', 4, '10-12', '45-60', '6-7', { notes: 'Feet wider than shoulder-width.' }),
        ex('Double KB Marches', 4, '16 steps total', '45-60', '7-8', {
          notes: 'Kettlebells at your sides. Lift one knee, lower it slowly, then lift the other.',
        }),
      ]),
    ],
    // Week 2
    [
      strength('Full Body', 'https://youtu.be/LlVgdaCwDXQ', [
        ex('Suitcase Deadlift', 4, '8 each side', '45-60', '7-8', {
          notes: `Kettlebell at one side, brace your core and deadlift. ${BOTH_SIDES_SET}`,
        }),
        ex('Two Hand Clean', 4, '6-10', '45-60', '7-8', {
          notes: 'Explode through your hips and drive your elbows back.',
        }),
        ex('Front Rack Split Squat', 4, '8-10 each leg', '45-60', '7-8', {
          notes: 'One kettlebell in the front rack on the same side as the working leg.',
        }),
        ex('Good Morning', 4, '10-12', '10-20 before A2', '6-7', { group: 'A1', notes: GOOD_MORNING }),
        ex('Offset KB Marches', 4, '16 steps total', '45-60 before A1', '7-8', {
          group: 'A2',
          notes: 'Hold one kettlebell on one side. Lift one knee, lower slowly, then the other. Switch the kettlebell to the other side each set.',
        }),
      ]),
      circuit('Conditioning Circuit', 'https://youtu.be/mfX96gxeBVo', 5, '90-120', '7-8', [
        cx('Single Arm Bent Over Row', '5 each side', 'One side at a time, or alternate sides.'),
        cx('Single Arm Swing', '5 each side', 'Step back and swing.'),
        cx('Single Arm Clean', '5 each side', 'Go straight from the swing into cleans.'),
        cx('Double KB Pushup', '5', 'Push up from the kettlebell handles, handles facing up.'),
      ]),
      strength('Full Body', 'https://youtu.be/2fxy7440Nrc', [
        ex('Pistol Squat (or Assisted Pistol)', 4, '6-8', '45-60', '7-8', {
          notes: 'Full pistol squat, or hold onto something for support.',
        }),
        ex('Curl to Squat', 4, '8', '45-60', '6-7', {
          notes: 'Hold the horns and curl the kettlebell up, then do a slow, controlled squat. That is one rep.',
        }),
        ex('Single Arm Clean to Row', 4, '6-8', '45-60', '7-8', {
          notes: 'Clean from the floor to the front rack, lower it back down, then row. That is one rep.',
        }),
        ex('Kneeling Halo', 3, '6-8', '20 before A2', '7-8', {
          group: 'A1',
          notes: 'Hold the kettlebell upside down by the horns. Circle it slowly around your head one way, then the other. That is one rep.',
        }),
        ex('Pushup', 3, '10-15', '60 before A1', '7-8', { group: 'A2' }),
      ]),
      strength('Full Body', 'https://youtu.be/bGlY9t4Yo8w', [
        ex('Single Arm Snatch', 4, '5-6 each side', '45-60', '7-8'),
        ex('Front Rack RFE Split Squat', 4, '6-8 each leg', '45-60', '7-8', {
          notes: 'Back foot elevated. Kettlebell in the front rack on the same side as the working leg.',
        }),
        ex('Kneeling Single Arm OHP', 3, '6-8 each side', '45-60', '6-7', {
          notes: 'Kneel on a mat, squeeze your glutes, and press the kettlebell overhead.',
        }),
        ex('Two Hand Bent Over Row', 3, '12-15', '60 before A2', '6-7', {
          group: 'A1',
          notes: 'Hold the kettlebell by the horns with both hands and row.',
        }),
        ex('Plank', 3, '45-60 sec', '60 before A1', '7-8', { group: 'A2' }),
      ]),
    ],
    // Week 3
    [
      strength('Full Body', 'https://youtu.be/biA9bRSRfhs', [
        ex('Swing', 4, '8-10', '45-60', '7-8', { notes: 'Use one heavy kettlebell.' }),
        ex('Double KB Deadlift', 4, '8', '45-60', '7-8', { notes: 'Kettlebells at your sides.' }),
        ex('Single Arm Floor Press', 3, '8-10', '20-30 before A2', '7-8', { group: 'A1', notes: EACH_SIDE_SET }),
        ex('Alternating Bent Over Row', 3, '8-10', '60 before A1', '7-8', { group: 'A2', notes: ALT_ROW }),
        ex('Overhead Crunch', 3, '8-10', '60', '7-8', { notes: OVERHEAD_CRUNCH }),
      ]),
      circuit('Conditioning Circuit', 'https://youtu.be/yxHlRiTm_Is', 5, '90-120', '7-8', [
        cx('See-Saw Row', '6 each side', 'Both kettlebells on the floor. Row one while pressing down on the other.'),
        cx('Double KB Swing to Clean', '6', 'Squeeze your quads and glutes, hinge at the hips, keep your spine neutral.'),
        cx('Double Front Rack Squat', '6', 'Both kettlebells in the front rack.'),
        cx('Double KB Pushup', '6', 'Push up from the kettlebell handles.'),
      ]),
      strength('Full Body', 'https://youtu.be/DDl1LpqJVDs', [
        ex('Single Arm Swing', 3, '10-12', '60', '7-8', { notes: BOTH_SIDES_SET }),
        ex('Single Arm Clean to Reverse Lunge', 4, '6-8', '60', '7-8', { notes: BOTH_SIDES_SET }),
        ex('Pushup', 3, 'AMRAP', '10-20 before A2', '8-9', { group: 'A1', notes: 'As many reps as possible.' }),
        ex('See-Saw Row', 3, '8-10', '60 before A1', '8-9', {
          group: 'A2',
          notes: 'Kettlebells between your feet, wide stance, slight forward lean. Row one side, then the other. That is one rep.',
        }),
        ex('Half Kneeling Wood Chop', 3, '10-12', '45-60', '6-7', {
          notes: `In a half-kneeling position, chop the kettlebell diagonally across your body, from high on the front-leg side down to low on the other side, rotating your torso. ${EACH_SIDE_SET}`,
        }),
      ]),
      strength('Full Body', 'https://youtu.be/I3Vv5QRkTb8', [
        ex('Double Front Rack Squat', 4, '8', '60-90', '8-9'),
        ex('Good Morning', 4, '8', '60-90', '7-8', { notes: GOOD_MORNING }),
        ex('Kneeling Single Arm Push Press', 4, '6-8 each side', '60', '7-8', {
          notes: 'Kneel on a pad with the kettlebell in the front rack. Drive your hips forward and press.',
        }),
        ex("Farmer's Walk", 3, '30-40 yd and back', '45-60', '8-9', { notes: FARMERS }),
      ]),
    ],
    // Week 4
    [
      strength('Full Body', 'https://youtu.be/8fBHHe170Zs', [
        ex('Two Hand Clean to Goblet Squat', 4, '8-10', '60', '7-8', {
          notes: 'Clean the kettlebell from the floor by the horns, then squat. That is one rep.',
        }),
        ex('Staggered Stance RDL', 4, '6-8', '45-60', '7-8', { notes: `${STAGGERED} ${EACH_SIDE_SET}` }),
        ex('Close Grip Floor Press', 4, '8-10', '60', '6-7', {
          group: 'A1',
          notes: 'Lie on your back, feet flat. Hold one kettlebell on its side with your thumbs through the horns and press over your chest.',
        }),
        ex('Pullover', 4, '8-10', '45-60', '6-7', { group: 'A2', notes: 'Slow and controlled.' }),
      ]),
      circuit('Conditioning Circuit', 'https://youtu.be/-PYG-yV8CUw', 5, '90-120', '7-8', [
        cx('Single Arm Dead Stop Swing', '5 each side', 'Start each swing from the floor and reset between reps.'),
        cx('Single Arm Dead Clean', '5 each side', 'Step forward so the kettlebell is between your feet, then clean it from the floor.'),
        cx(
          'Single Arm Thruster',
          '5 each side',
          'Kettlebell in the front rack. Squat, then press overhead as you stand. That is one rep.',
          '45-60',
        ),
        cx('Alternating Hand Pushup', '10 total (5 each side)', 'One hand on a kettlebell lying on its side, the other on the floor. Switch sides each rep.'),
      ]),
      strength('Full Body', 'https://youtu.be/ZDaUk8PruUU', [
        ex('Goblet Squat to Reverse Lunge', 4, '8-10', '45-60', '7-8', {
          notes: 'Squat, then reverse lunge on each leg. That is one rep.',
        }),
        ex('Kneeling Halo', 4, '6', '45-60', '7-8', { notes: 'One direction, then the other. That is one rep.' }),
        ex('Pullover', 4, '8-10', '20-30 before A2', '6-7', { group: 'A1', notes: PULLOVER }),
        ex('Single Arm Row', 4, '8-10', '60 before A1', '7-8', { group: 'A2', notes: 'All reps on one side, then the other.' }),
        ex("Front Rack Farmer's Walk", 3, '30-40 yd and back', '60', '8-9', {
          notes: 'Both kettlebells in the front rack. Brace your core, keep your shoulders back and your spine neutral.',
        }),
      ]),
      strength('Full Body', 'https://youtu.be/u4Al4O0XCQc', [
        ex('Single Arm Snatch to Reverse Lunge', 3, '5-6 each side', '60-90', '7-8', {
          notes: 'Snatch, lower the kettlebell to the front rack, then reverse lunge on the same side.',
        }),
        ex('Single Arm Clean to Squat', 3, '5-6 each side', '60-90', '7-8', {
          notes: 'Clean, then squat while holding the front rack.',
        }),
        ex('KB Pushup', 4, '10-15', '45-60', '7-8', {
          notes: 'Hands on a kettlebell lying on its side. Keep your core braced.',
        }),
        ex('High Plank KB Slide', 4, '16 total', '45-60', '7-8', { notes: PLANK_SLIDE }),
      ]),
    ],
    // Week 5
    [
      strength('Full Body', 'https://youtu.be/aLVOhQ5ir5o', [
        ex('Double Front Rack RFE Split Squat', 4, '6-8 each leg', '60-90', '8-9', {
          notes: 'Back foot elevated, both kettlebells in the front rack.',
        }),
        ex('Clean to Bent Over Row', 4, '6-8', '45-60', '7-8', {
          notes: 'Clean one kettlebell from the floor, lower it back down, then row. That is one rep.',
        }),
        ex('Gorilla Row', 4, '8-10', '10-20 before A2', '7-8', {
          group: 'A1',
          notes: 'Kettlebells between your feet, slight forward lean. Row both at the same time.',
        }),
        ex('Double KB Floor Press', 4, '6-8', '60 before A1', '7-8', {
          group: 'A2',
          notes: 'Lie on your back, feet flat, and press both kettlebells together.',
        }),
      ]),
      circuit('Conditioning Circuit', 'https://youtu.be/QFZ1zAvB2tQ', 4, '90-120', '7-8', [
        cx('Single Arm Swing to Snatch', '6', 'Swing the kettlebell straight up into a snatch.'),
        cx('Staggered Stance Squat', '6', `One kettlebell in the front rack. ${STAGGERED}`),
        cx('Single Arm OHP', '6', 'Press from the front rack.'),
        cx('Single Arm Staggered Stance RDL', '6', 'Hold the kettlebell on the same side as your front leg.'),
      ]),
      strength('Full Body', 'https://youtu.be/0AybKt6BroM', [
        ex('Swing', 4, '8-10', '45-60', '7-8'),
        ex('Suitcase Reverse Lunge', 4, '8 each leg', '45-60', '7-8', {
          notes: 'Hold the kettlebell on the side opposite the working leg.',
        }),
        ex('See-Saw Floor Press', 4, '8-10 each side', '20-30 before A2', '7-8', {
          group: 'A1',
          notes: 'On your back, feet flat, both arms locked out. Lower and press one side at a time, alternating.',
        }),
        ex('Alternating Bent Over Row', 3, '8-10', '60 before A1', '7-8', { group: 'A2', notes: ALT_ROW }),
        ex('Lying Pike Hold', 4, '45-60 sec', '60', '7-8', { notes: PIKE_HOLD }),
      ]),
      strength('Full Body', 'https://youtu.be/ZoQU9VF3xho', [
        ex('Heel Elevated Wide Stance Goblet Squat', 5, '8-10', '60-90', '7-8', {
          notes: 'Heels raised, feet wider than shoulder-width. Pause 1-2 seconds at the bottom.',
        }),
        ex('Curtsy Lunge to Halo', 4, '6-8 each leg', '60', '6-7', {
          notes: 'Step into a curtsy lunge, then do a halo at the bottom.',
        }),
        ex('Deficit KB Pushup', 4, '10-12', '10-20 before A2', '7-8', {
          group: 'A1',
          notes: 'Push up from the kettlebell handles so your chest can go lower.',
        }),
        ex('Pull-ups or Banded Pull-downs', 4, '10-12', '45-60 before A1', '7-8', { group: 'A2' }),
      ]),
    ],
    // Week 6
    [
      strength('Full Body', 'https://youtu.be/ym9V2qk-z0Y', [
        ex('Double Front Rack Reverse Lunge', 4, '6-8 each leg', '60', '7-8', { notes: 'Alternate legs.' }),
        ex('Single Arm Floor Press', 4, '8-10', '20 before A2', '7-8', { group: 'A1', notes: 'One side, then the other.' }),
        ex('See-Saw Row', 4, '10-12 each arm', '60 before A1', '7-8', { group: 'A2' }),
        ex('Double KB RDL', 4, '10-12', '20 before B2', '7-8', {
          group: 'B1',
          notes: 'Lower slowly until the kettlebells are just above the floor, then drive up hard.',
        }),
        ex('Double Front Rack Marches', 4, '10-12 steps each leg', '60 before B1', '7-8', { group: 'B2' }),
      ]),
      strength('Full Body', 'https://youtu.be/owy48Wh3y1w', [
        ex('Swing', 4, '10-12', '45-60', '7-8'),
        ex('Suitcase Deadlift', 4, '8-10', '20 before A2', '7-8', {
          group: 'A1',
          notes: `Heavy kettlebell. ${BOTH_SIDES_SET}`,
        }),
        ex('Single Arm Push Press', 4, '6-8', '60 before A1', '7-8', { group: 'A2', notes: EACH_SIDE_SET }),
        ex('Alternating Row to Two Hand Clean', 4, '8', '20 before B2', '7-8', {
          group: 'B1',
          notes: 'Row one side, row the other, then clean the kettlebell to your chest with both hands. That is one rep.',
        }),
        ex('Standing Windmill', 4, '6-8 each side', '60 before B1', '7-8', { group: 'B2' }),
      ]),
      strength('Full Body', 'https://youtu.be/_r9cSvwBzAc', [
        ex('Pull-ups', 5, '10-12', '60-90', '7-8', { notes: 'Explode up, lower under control.' }),
        ex('Single Arm Clean to Press', 4, '6-8', '20 before A2', '7-8', { group: 'A1', notes: EACH_SIDE_SET }),
        ex('Double Front Rack Squat', 4, '6-8', '60 before A1', '7-8', {
          group: 'A2',
          notes: 'Chest tall, core braced, back flat. Squat as deep as you can.',
        }),
        ex('Single Arm Staggered Stance RDL', 4, '10 each leg', '20 before B2', '7-8', {
          group: 'B1',
          notes: `${STAGGERED} Hold the kettlebell on the working-leg side.`,
        }),
        ex('High Plank KB Slide', 4, '20 total', '60 before B1', undefined, {
          group: 'B2',
          notes: 'Feet wider than shoulder-width. Slide the kettlebell side to side under your body without letting your torso rotate.',
        }),
      ]),
      circuit('Conditioning Circuit', 'https://youtu.be/jPyNMOo8Brs', 4, '90-120', '8-9', [
        cx('Single Arm Swing', '6 each side', 'Start with the kettlebell about a foot in front of you. Swing to shoulder height.'),
        cx('Single Arm Swing to Snatch', '6 each side', 'Swing straight up into a snatch.'),
        cx('Front Rack Reverse Lunge', '6 each side', 'From the snatch, bring the kettlebell down to the front rack.'),
        cx('Single Arm OHP', '6 each side', 'Press from the front rack.'),
      ]),
    ],
    // Week 7
    [
      strength('Full Body', 'https://youtu.be/C-bu7ddenEU', [
        ex('Single Arm Clean to Squat', 4, '6-8 each side', '60', '7-8', {
          notes: 'Clean from a dead stop on the floor, then squat.',
        }),
        ex('Kneeling Hip Drive to OHP', 4, '8-10', '45-60', '7-8', {
          notes: 'Kneeling with the kettlebell in the front rack, drive your hips forward and use that to press overhead.',
        }),
        ex('Two Hand Clean to March', 4, '8-10', '20 before A2', '7-8', {
          group: 'A1',
          notes: 'Clean one kettlebell to your chest, then march one knee up and the other. That is one rep.',
        }),
        ex("Farmer's Walk", 4, '30-40 yd', '60 before A1', '7-8', { group: 'A2', notes: FARMERS }),
      ]),
      strength('Full Body', 'https://youtu.be/f_wk0kKoRac', [
        ex('Dead Stop Swing', 4, '10-12', '45-60', '7-8', {
          notes: 'Return the kettlebell to the floor between every rep.',
        }),
        ex('Alternating Suitcase to Double Deadlift', 4, '6-8', '45-60', '7-8', {
          notes: 'Heavy suitcase deadlift on one side, then the other, then deadlift both kettlebells together. That is one rep.',
        }),
        ex('Close Grip KB Pushup', 4, '10-12', '20 before A2', '7-8', {
          group: 'A1',
          notes: 'Kettlebell on its side, hands on the round part of the bell.',
        }),
        ex('Goblet Jumping Lunge', 4, '8 each leg', '60 before A1', '7-8', {
          group: 'A2',
          notes: 'Hold the kettlebell at your chest. Start at the bottom of a lunge, then jump and switch legs.',
        }),
      ]),
      strength('Full Body', 'https://youtu.be/bKHb94z22F8', [
        ex('Double Front Rack B-Stance Squat', 4, '6-10', '60-90', '7-8', {
          notes: 'B-stance: front heel in line with the toes of the back foot, so the front leg does most of the work. Each leading leg counts as its own set.',
        }),
        ex('B-Stance RDL', 4, '6-10', '45-60', '7-8', {
          notes: 'Same stance as above, one kettlebell on the working-leg side. Each leading leg counts as its own set.',
        }),
        ex('Half Kneeling OHP to Windmill', 4, '6-8', '60', '7-8', {
          notes: 'Half-kneeling with the kettlebell in the front rack. Press overhead, then bend sideways until your other forearm rests on the floor, keeping the kettlebell locked out overhead.',
        }),
        ex('Overhead Crunch', 4, '8-10', '20', '7-8', { notes: OVERHEAD_CRUNCH }),
      ]),
      circuit('Single KB Conditioning Circuit', 'https://youtu.be/NhsE-fiMOss', 5, '90-120', '8-9', [
        cx('Swing', '6', 'On the last rep, bring the kettlebell up into the goblet position.'),
        cx('Goblet Squat', '6', 'Hold the kettlebell at your chest.'),
        cx('Standing Bottoms-Up Press', '6', 'Flip the kettlebell upside down, thumbs through the horns, and press with both arms.'),
        cx('Single Arm Alternating Bent Over Row', '6 each side', 'Lower the kettlebell and row, alternating sides.'),
      ]),
    ],
    // Week 8
    [
      strength('Full Body', 'https://youtu.be/VheXo9zou1M', [
        ex('Front Rack Cossack Squat', 4, '6-8 each leg', '60', '7-8', {
          notes: 'Kettlebell in the front rack. Wide stance: squat down to one side, keeping the other leg straight.',
        }),
        ex('Single Arm Floor Press', 4, '8-10', '20 before A2', '7-8', {
          group: 'A1',
          notes: 'Lie on your back, feet flat, and press from your chest.',
        }),
        ex('Single Arm Bent Over Row', 4, '10-12', '60 before A1', '7-8', {
          group: 'A2',
          notes: 'Back flat, core braced, lead with the elbow.',
        }),
        ex('Single Leg RDL', 4, '8-10 each leg', '20 before B2', '7-8', { group: 'B1' }),
        ex('Front Rack Marches', 4, '10-12 steps each leg', '60 before B1', '7-8', {
          group: 'B2',
          notes: 'One kettlebell in the front rack on one side.',
        }),
      ]),
      strength('Full Body', 'https://youtu.be/y07TcKWA_-Q', [
        ex('Dead Stop Snatch', 4, '6', '45-60', '7-8', { notes: 'Start every rep from the floor.' }),
        ex('Suitcase Forward to Reverse Lunge', 4, '6 each leg', '60-90', '7-8', {
          notes: 'Kettlebell at your side. Lunge forward, return to standing, then lunge back. That is one rep.',
        }),
        ex('Half Kneeling OHP', 4, '6-8 each side', '20-30 before A2', '7-8', {
          group: 'A1',
          notes: 'Half-kneeling with the kettlebell in the front rack, press overhead.',
        }),
        ex('Two Hand Clean to Upright Row', 4, '6', '60 before A1', '7-8', {
          group: 'A2',
          notes: 'Clean to your chest with both hands, lower to your waist, then upright row. That is one rep.',
        }),
      ]),
      strength('Full Body', 'https://youtu.be/ZCvDwiF7NfY', [
        ex('Two Hand Clean to Goblet Squat', 4, '8-10', '60', '7-8', {
          notes: 'Clean the kettlebell from the floor by the horns, then squat. That is one rep.',
        }),
        ex('Staggered Stance RDL', 4, '6-8', '45-60', '7-8', { notes: `${STAGGERED} ${EACH_SIDE_SET}` }),
        ex('See-Saw Bridge Press', 4, '6-8 each side', '20-30 before A2', '8-9', {
          group: 'A1',
          notes: 'On your back, feet flat, hips lifted, both arms locked out. Lower and press one side, then the other.',
        }),
        ex('Pullover', 4, '8-10', '45-60 before A1', '6-7', { group: 'A2', notes: PULLOVER }),
      ]),
      circuit('Conditioning Circuit', 'https://youtu.be/BEb3EUR8E5w', 4, '90-120', '8-9', [
        cx('Single Arm Swing to Clean', '5'),
        cx('Single Arm Swing to Snatch', '5', 'Go straight from the clean into the swing and snatch.'),
        cx('Front Rack Forward to Reverse Lunge', '5', 'Kettlebell in the front rack on one side. Lunge forward, then back.'),
        cx('Single Arm Thruster', '5', 'Kettlebell in the front rack. Squat, then press overhead as you stand.'),
      ]),
    ],
  ],
})

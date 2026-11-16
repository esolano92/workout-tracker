import { block, buildProgram, cardio, easy, off, restDay, test, work } from './build'

const SCALING =
  'Too much? Cut the number of rounds so you complete about 75% of the written work. Quality of movement and effort come first.'
const OTHER_MACHINES =
  'No air bike? Use any cardio machine. Do the 10-minute test on it, then use your average pace (per 500 m on a rower or ski erg, per 1000 m on a bike erg or running) wherever the plan says "test pace".'

const glossary = [
  { term: 'Test pace', meaning: 'The average RPM you held in your 10-minute max-calorie test. Every pace in this plan is relative to it.' },
  { term: 'Test calories', meaning: 'Total calories from your 10-minute test. Calorie targets like "10% of test calories" are worked out from this.' },
  { term: 'Above test pace', meaning: 'Faster than your test pace (higher RPM).' },
  { term: 'Easy / recovery', meaning: 'Keep pedaling, but slower: roughly 5-10 rpm under test pace.' },
  { term: 'Rest / off', meaning: 'Stop pedaling completely.' },
  { term: 'On / off', meaning: 'Work / rest.' },
  { term: 'EMOM', meaning: 'Every Minute On the Minute: start the work at the top of each minute and rest for whatever time is left in that minute.' },
  { term: 'For time', meaning: 'Finish the work as fast as you can and log your total time.' },
  { term: 'RPM', meaning: 'Revolutions per minute: how fast you are pedaling. Shown on the bike monitor.' },
]

const TEST_10MIN = block('10-minute max calories', [
  'Warm up well first.',
  'Ride as many calories as you can in 10 minutes.',
  'Record your total calories and your average RPM. The whole program is built on these two numbers.',
  'On a bike erg, record your average pace per 1000 m instead of RPM.',
], { segments: [work(600, 'Max calories: hold the fastest pace you can sustain for 10 minutes')] })

export const bikeBeastVol1 = buildProgram({
  id: 'bike-beast-vol1',
  name: 'Bike Beast Vol. 1',
  author: 'Khan Porter',
  summary:
    'A 30-day air bike program to build your engine. Four 10-30 minute sessions a week plus an optional extra, all paced from a 10-minute test.',
  equipment: 'Air bike (Assault, Rogue, Echo) or any cardio machine.',
  usesBaseline: true,
  guidelines: [
    'Do the baseline test first. The app uses your result to show your exact pace and calorie targets.',
    'Do the sessions in the order written.',
    'Optional sessions help your endurance, but skip them if you are short on time.',
    SCALING,
    OTHER_MACHINES,
  ],
  glossary,
  weeks: [
    {
      label: 'Before you start',
      days: [test('Test', 'Baseline test', [TEST_10MIN], ['cal', 'rpm'])],
    },
    {
      label: 'Week 1',
      days: [
        cardio('Day 1', '6 × 3-minute intervals', [
          block('6 rounds', [
            '3:00 hard: above test pace (faster than {pace})',
            '2:00 recovery: keep pedaling at {pace-10}',
            '1:00 complete rest',
          ], {
            rounds: 6,
            segments: [work(180, 'Above test pace: faster than {pace}'), easy(120, 'Recovery: {pace-10}'), off(60)],
          }),
        ]),
        cardio('Day 2', '5 calorie sprints', [
          block('5 sprints', [
            'Ride {cal 10%} as fast as possible.',
            'Rest 2:00 between sprints.',
          ]),
        ], { log: ['time'], goal: 'Log your time for each sprint in the notes.' }),
        restDay('Day 3'),
        cardio('Day 4', '6 × 4-minute pace ladder', [
          block('6 rounds', [
            '1:00 above test pace, faster than your Day 1 hard intervals',
            '1:00 easy: {pace-10}',
            '1:00 at test pace: {pace}',
            '1:00 rest',
          ], {
            rounds: 6,
            segments: [
              work(60, 'Faster than Day 1 intervals'),
              easy(60, 'Easy: {pace-10}'),
              work(60, 'Test pace: {pace}'),
              off(60),
            ],
          }),
        ]),
        restDay('Day 5'),
        cardio('Day 6', '20 rounds, nonstop', [
          block('20 rounds, no stopping', [
            'You keep pedaling the entire time. There is no full rest.',
            '0:20 above test pace (faster than {pace})',
            '0:20 at test pace: {pace}',
            '0:40 easy recovery: {pace-10}',
          ], {
            rounds: 20,
            segments: [work(20, 'Above test pace'), work(20, 'Test pace: {pace}'), easy(40, 'Easy: {pace-10}')],
          }),
        ], { optional: true }),
        restDay('Day 7'),
      ],
    },
    {
      label: 'Week 2',
      days: [
        cardio('Day 8', '5 × 4 minutes at test pace', [
          block('5 rounds', ['4:00 at test pace: {pace}', '2:00 complete rest'], {
            rounds: 5,
            segments: [work(240, 'Test pace: {pace}'), off(120)],
          }),
        ]),
        restDay('Day 9'),
        cardio('Day 10', '30 × 30 seconds on/off', [
          block('30 rounds', [
            '0:30 on: build speed through the whole 30 seconds. Don\'t sprint the start and fade at the end.',
            'Aim for {pace+3..+5} on each interval.',
            '0:30 off',
          ], { rounds: 30, segments: [work(30, 'Build to {pace+3..+5}'), off(30)] }),
        ]),
        restDay('Day 11'),
        cardio('Day 12', 'Every 3 minutes × 10', [
          block('Every 3:00, 10 rounds', [
            'At the start of every 3 minutes, ride {cal 10%} as fast as you can. Sprint if you can keep it up.',
            'Stop at 1:00 even if you haven\'t finished.',
            'Rest for whatever is left of the 3 minutes, then go again.',
          ], { rounds: 10, segments: [work(60, 'Ride {cal 10%} fast (1:00 max)'), off(120, 'Rest until the next round')] }),
        ]),
        cardio('Day 13', '20-minute easy ride', [
          block('20:00 easy', ['Steady, easy effort at {pace-10..-5}.'], {
            segments: [easy(1200, 'Easy: {pace-10..-5}')],
          }),
        ], { optional: true }),
        restDay('Day 14'),
      ],
    },
    {
      label: 'Week 3',
      days: [
        cardio('Day 15', '4-minute intervals', [
          block('Part 1: 3 rounds', ['4:00 on at or just above test pace ({pace})', '1:00 off'], {
            rounds: 3,
            segments: [work(240, 'At or just above {pace}'), off(60)],
          }),
          block('Part 2: straight into 2 rounds', ['4:00 on at test pace or just under', '1:00 off'], {
            rounds: 2,
            segments: [work(240, 'At or just under {pace}'), off(60)],
          }),
        ]),
        restDay('Day 16'),
        cardio('Day 17', 'Three EMOM blocks', [
          block('Part 1: every minute for 8 minutes', [
            'At the start of each minute, ride {cal 7.5%} (7.5% of your test calories, rounded up). Rest for the rest of the minute.',
            'Then rest 4:00.',
          ], { rounds: 8, segments: [work(60, 'Ride {cal 7.5%}, then rest')], restAfter: 240 }),
          block('Part 2: every minute for 8 minutes', [
            'At the start of each minute, ride {cal 5%}. Rest for the rest of the minute.',
            'Then rest 4:00.',
          ], { rounds: 8, segments: [work(60, 'Ride {cal 5%}, then rest')], restAfter: 240 }),
          block('Part 3: every minute for 4 minutes', [
            'At the start of each minute, ride {cal 10%}. Rest for the rest of the minute.',
          ], { rounds: 4, segments: [work(60, 'Ride {cal 10%}, then rest')] }),
        ]),
        cardio('Day 18', '20-minute easy ride', [
          block('20:00 easy', ['Easy effort, 1-2 rpm faster than your Day 13 easy ride.'], {
            segments: [easy(1200, 'Easy: 1-2 rpm faster than last week')],
          }),
        ], { optional: true }),
        restDay('Day 19'),
        cardio('Day 20', 'Wall sit + bike EMOM', [
          block('Every minute for 18 minutes (6 rounds)', [
            'Minute 1: wall sit for 0:50, then get on the bike.',
            'Minute 2: bike for 1:00 at test pace or faster ({pace}+).',
            'Minute 3: rest.',
          ], {
            rounds: 6,
            segments: [work(50, 'Wall sit'), off(10, 'Get on the bike'), work(60, 'Bike at {pace} or faster'), off(60)],
          }),
        ]),
        restDay('Day 21'),
      ],
    },
    {
      label: 'Week 4',
      days: [
        cardio('Day 22', 'Running-clock intervals', [
          block('Part 1: 3 rounds', [
            'Keep the clock running the whole session.',
            '2:00 at {pace+2..+5}',
            '1:00 easy',
            '2:00 at test pace: {pace}',
            '1:00 complete rest',
          ], {
            rounds: 3,
            segments: [work(120, '{pace+2..+5}'), easy(60, 'Easy'), work(120, 'Test pace: {pace}'), off(60)],
          }),
          block('Part 2: straight into 3 rounds', [
            'Same as Part 1, but with 2:00 of rest at the end of each round.',
          ], {
            rounds: 3,
            segments: [work(120, '{pace+2..+5}'), easy(60, 'Easy'), work(120, 'Test pace: {pace}'), off(120)],
          }),
        ]),
        restDay('Day 23'),
        cardio('Day 24', 'Every 2:30 × 12', [
          block('Every 2:30, 12 rounds', [
            'At the start of every 2:30, ride {cal 10%} as fast as you can.',
            'Stop at 1:00 even if you haven\'t finished.',
            'Rest for whatever is left of the 2:30.',
          ], { rounds: 12, segments: [work(60, 'Ride {cal 10%} fast (1:00 max)'), off(90, 'Rest until the next round')] }),
        ]),
        restDay('Day 25'),
        cardio('Day 26', '7 / 5 / 7 minute efforts', [
          block('3 efforts', [
            '7:00 above test pace (faster than {pace})',
            'Rest 4:00',
            '5:00 above test pace',
            'Rest 4:00',
            '7:00 at test pace: {pace}',
          ], {
            segments: [
              work(420, 'Above test pace'),
              off(240),
              work(300, 'Above test pace'),
              off(240),
              work(420, 'Test pace: {pace}'),
            ],
          }),
        ]),
        restDay('Day 27'),
        cardio('Day 28', '10 rounds of 45/30/15', [
          block('10 rounds', [
            '0:45 on at test pace ({pace}), 0:15 off',
            '0:30 on faster than test pace, 0:30 off',
            '0:15 on as fast as you can hold for 15 seconds (hard, but not an all-out max), 0:45 off',
          ], {
            rounds: 10,
            segments: [
              work(45, 'Test pace: {pace}'),
              off(15),
              work(30, 'Faster than test pace'),
              off(30),
              work(15, 'Fast, sustained 15 seconds'),
              off(45),
            ],
          }),
        ]),
      ],
    },
    {
      label: 'Week 5',
      days: [
        restDay('Day 29'),
        cardio('Day 30', '20-minute easy ride', [
          block('20:00 easy', ['Easy effort, 1-2 rpm faster than your Day 18 easy ride.'], {
            segments: [easy(1200, 'Easy: 1-2 rpm faster than last time')],
          }),
        ]),
        test('Retest', 'Retest', [
          block('Rest 1-2 days first', ['Take 1-2 rest days after Day 30, then retest to see how far you\'ve come.']),
          TEST_10MIN,
        ], ['cal', 'rpm']),
      ],
    },
  ],
})

const TEST_50CAL = block('50 calories for time', [
  'Rest fully after the 10-minute test (or do this on another day).',
  'Ride 50 calories as fast as you can and record your time.',
  'If you know 50 calories takes you under 1 minute, do 100 calories instead.',
])

export const bikeBeastVol2 = buildProgram({
  id: 'bike-beast-vol2',
  name: 'Bike Beast Vol. 2',
  author: 'Khan Porter',
  summary:
    'The follow-up to Vol. 1: 30 days of 4-5 bike sessions a week, some mixed with dumbbell, running, rowing and bodyweight work. Use it on its own or after Vol. 1.',
  equipment: 'Air bike or Concept2 bike erg. Some days also need a dumbbell, a wall ball, and a rower (or substitute burpees).',
  usesBaseline: true,
  guidelines: [
    'Do both baseline tests first. The app uses your 10-minute result to show your exact pace and calorie targets.',
    'Do the sessions in the order written. Use it alongside your normal training or on its own.',
    'Where two numbers are given, like 20/15 cal, the first is the men\'s target and the second is the women\'s.',
    SCALING,
    OTHER_MACHINES,
  ],
  glossary: [
    ...glossary,
    { term: '20/15 cal', meaning: 'Men\'s target / women\'s target.' },
    { term: 'Devil\'s press', meaning: 'Burpee with your hand on a dumbbell, then swing the dumbbell from the floor straight overhead in one motion.' },
    { term: 'Reverse Tabata', meaning: '8 rounds of 0:10 very hard work + 0:20 rest (4 minutes total).' },
  ],
  weeks: [
    {
      label: 'Before you start',
      days: [test('Test', 'Baseline tests', [TEST_10MIN, TEST_50CAL], ['cal', 'rpm', 'time'])],
    },
    {
      label: 'Week 1',
      days: [
        cardio('Day 1', '1:30, 2:00 and 5:00 efforts', [
          block('Part 1: 3 rounds', [
            '1:30 work: aim for {cal 20%} each round (20% of your test calories)',
            '1:30 rest',
            'Then rest 3:00.',
          ], { rounds: 3, segments: [work(90, 'Aim for {cal 20%}'), off(90)], restAfter: 180 }),
          block('Part 2: 3 rounds', [
            '2:00 work: aim to match your best 1:30 score from Part 1',
            '1:00 rest',
            'Then rest 3:00.',
          ], { rounds: 3, segments: [work(120, 'Match your best 1:30 score'), off(60)], restAfter: 180 }),
          block('Part 3: one 5-minute effort', ['5:00 work: aim for at least double your best 2:00 score.'], {
            segments: [work(300, 'Double your best 2:00 score')],
          }),
        ]),
        cardio('Day 2', '15-minute continuous ride', [
          block('15:00 continuous', [
            'Aim to beat your 10-minute test calories ({cal}) in 15 minutes.',
            'That works out to roughly 80% of the pace you held in the test.',
          ], { segments: [work(900, 'Beat {cal} in 15 minutes')] }),
        ]),
        cardio('Day 3', 'Squats, bike, dumbbell snatches', [
          block('5 rounds for time', [
            '30 air squats',
            '20/15 cal bike, faster than test pace if you can',
            '10 dumbbell snatches on the left arm, then 10 on the right (not alternating)',
            'Rest 1:00 between rounds.',
            'Try to do each movement without stopping.',
          ]),
        ], { log: ['time'] }),
        restDay('Day 4'),
        cardio('Day 5', 'Fast / easy / moderate', [
          block('5 rounds', [
            '1:00 fast: above test pace (faster than {pace})',
            '1:00 easy: {pace-10..-5}',
            '1:00 moderate: as close to test pace as you can ({pace})',
            '2:00 rest',
          ], {
            rounds: 5,
            segments: [work(60, 'Fast: above {pace}'), easy(60, 'Easy: {pace-10..-5}'), work(60, 'Moderate: {pace}'), off(120)],
          }),
        ]),
        cardio('Day 6', '20 short sprints', [
          block('20 rounds', [
            'Sprint 10/6 cal at max effort.',
            'Rest 0:30.',
            'You should hold a real sprint for at least the first 10-15 rounds. If your pace drops off, lower the calories.',
          ]),
        ], { log: ['time'] }),
        restDay('Day 7'),
      ],
    },
    {
      label: 'Week 2',
      days: [
        cardio('Day 8', 'Run, wall balls, bike', [
          block('5 rounds for time', [
            'Run 400 m',
            '15 wall balls',
            '15/12 cal bike',
            'Rest 1:00 between rounds.',
            'Hold at least test pace on the bike, or go as fast as you can while staying smooth on the run and wall balls.',
          ]),
        ], { log: ['time'] }),
        cardio('Day 9', '3 sets of 2:30 efforts', [
          block('Set 1: 3 rounds', ['2:30 on just under test pace', '1:30 off'], {
            rounds: 3,
            segments: [work(150, 'Just under {pace}'), off(90)],
          }),
          block('Set 2: 3 rounds', ['2:30 on at test pace ({pace})', '1:30 off'], {
            rounds: 3,
            segments: [work(150, 'Test pace: {pace}'), off(90)],
          }),
          block('Set 3: 3 rounds', ['2:30 on just over test pace', '1:30 off'], {
            rounds: 3,
            segments: [work(150, 'Just over {pace}'), off(90)],
          }),
        ]),
        cardio('Day 10', '20-minute nasal-breathing ride', [
          block('20:00 easy', ['Slow and steady. Breathe in and out through your nose only the whole time.'], {
            segments: [easy(1200, 'Easy, nose breathing only')],
          }),
        ]),
        restDay('Day 11'),
        cardio('Day 12', 'Bike + devil\'s presses', [
          block('10 rounds for time', ['12/9 cal bike', '6 single-arm dumbbell devil\'s presses']),
        ], { log: ['time'] }),
        cardio('Day 13', '10 × 15/12 cal', [
          block('10 rounds', [
            'Ride 15/12 cal.',
            'Rest 1:00.',
            'These should be fast, steady efforts, not all-out sprints. Hold around 80-90 rpm instead of spiking to 110 rpm.',
          ]),
        ], { log: ['time'] }),
        restDay('Day 14'),
      ],
    },
    {
      label: 'Week 3',
      days: [
        cardio('Day 15', '4-minute intervals + 50 cal', [
          block('3 rounds', ['4:00 on at or just above test pace ({pace})', '1:00 off'], {
            rounds: 3,
            segments: [work(240, 'At or just above {pace}'), off(60)],
          }),
          block('Then straight into', ['50/40 cal for time.']),
        ], { log: ['time'] }),
        cardio('Day 16', '2 reverse Tabatas', [
          block('Reverse Tabata #1', ['8 rounds: 0:10 very hard, 0:20 rest.', 'Then rest 6:00.'], {
            rounds: 8,
            segments: [work(10, 'VERY hard'), off(20)],
            restAfter: 360,
          }),
          block('Reverse Tabata #2', ['8 rounds: 0:10 very hard, 0:20 rest.'], {
            rounds: 8,
            segments: [work(10, 'VERY hard'), off(20)],
          }),
        ]),
        restDay('Day 17'),
        cardio('Day 18', 'Bike / devil\'s press EMOM', [
          block('Every minute for 20 minutes (10 rounds)', [
            'Minute 1: 15/12 cal bike',
            'Minute 2: 10 single-arm dumbbell devil\'s presses',
            'Rest for whatever is left of each minute.',
          ], { rounds: 10, segments: [work(60, 'Bike 15/12 cal'), work(60, '10 devil\'s presses')] }),
        ]),
        restDay('Day 19'),
        cardio('Day 20', '5:00 + 7 × 1:00', [
          block('5-minute effort', ['5:00 at test pace ({pace})', 'Rest 2:00'], {
            segments: [work(300, 'Test pace: {pace}')],
            restAfter: 120,
          }),
          block('Then 7 rounds', ['1:00 above test pace', '1:00 rest'], {
            rounds: 7,
            segments: [work(60, 'Above {pace}'), off(60)],
          }),
        ]),
        restDay('Day 21'),
      ],
    },
    {
      label: 'Week 4',
      days: [
        cardio('Day 22', '2 × 10-minute pace changes', [
          block('2 rounds', [
            'Each 10:00 effort goes like this:',
            '2:00 under test pace',
            '1:00 over test pace',
            '3:00 under test pace',
            '2:00 over test pace',
            '1:00 easy',
            '1:00 as hard as possible',
            'Then 3:00 off before the second round.',
          ], {
            rounds: 2,
            segments: [
              work(120, 'Under {pace}'),
              work(60, 'Over {pace}'),
              work(180, 'Under {pace}'),
              work(120, 'Over {pace}'),
              easy(60, 'Easy'),
              work(60, 'As hard as possible'),
              off(180),
            ],
          }),
        ]),
        cardio('Day 23', '21 / 15 / 9 calorie sprints', [
          block('3 rounds', [
            'Ride each effort as fast as you possibly can:',
            '21/18 cal, rest 1:00',
            '15/12 cal, rest 0:30',
            '9/6 cal, rest 2:00',
          ]),
        ], { log: ['time'] }),
        restDay('Day 24'),
        cardio('Day 25', 'Burpees + bike', [
          block('5 rounds', [
            '5 burpees',
            '10 cal bike',
            '10 burpees',
            '15 cal bike',
            'Rest 1:00.',
            'Try to get faster every round.',
          ]),
        ], { log: ['time'] }),
        restDay('Day 26'),
        cardio('Day 27', 'Row / bike EMOM', [
          block('Every minute for 21 minutes (7 rounds)', [
            'Minute 1: 20/15 cal row. No rower? Use any machine, or do 15 burpees.',
            'Minute 2: 15/12 cal bike',
            'Minute 3: rest',
          ], { rounds: 7, segments: [work(60, 'Row 20/15 cal'), work(60, 'Bike 15/12 cal'), off(60)] }),
        ]),
        cardio('Day 28', '7 / 5 / 3 minute efforts', [
          block('3 efforts', [
            '7:00 above test pace (faster than {pace})',
            'Rest 5:00',
            '5:00 faster than your 7-minute pace',
            'Rest 3:00',
            '3:00 at max-effort pace',
          ], {
            segments: [
              work(420, 'Above {pace}'),
              off(300),
              work(300, 'Faster than your 7:00 pace'),
              off(180),
              work(180, 'Max-effort pace'),
            ],
          }),
        ]),
      ],
    },
    {
      label: 'Week 5',
      days: [
        restDay('Day 29'),
        test('Day 30', 'Retest', [TEST_10MIN, TEST_50CAL], ['cal', 'rpm', 'time']),
      ],
    },
  ],
})

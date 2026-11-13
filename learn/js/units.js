// Cambridge IGCSE Economics 0455, syllabus for exams in 2027 to 2029.
// Section 1 (1.1 to 1.4) and section 2 (2.1 to 2.6; the syllabus continues to 2.10). `ready` marks units whose activities are built;
// the teacher opens units per class. '1.P' and '2.P' are the section exam papers (papers.js), opened like units.
// the teacher opens units per class. Section 1 and Section 2 (to 2.5) adapt their English to each student's band (see bands.js).
export const SECTIONS = { '1': 'The basic economic problem', '2': 'The allocation of resources' };
export const UNITS = [
  { id: '1.1', title: 'The nature of the economic problem', sub: 'Scarcity, choices, the three questions, economic and free goods', ready: true },
  { id: '1.2', title: 'The factors of production', sub: 'Land, labour, capital, enterprise and their rewards', ready: true },
  { id: '1.3', title: 'Opportunity cost', sub: 'The next best alternative, and how it affects decisions', ready: true },
  { id: '1.4', title: 'Production possibility curve diagrams', sub: 'Points, movements and shifts of the PPC', ready: true },
  { id: '1.P', title: 'Section 1 exam papers', sub: 'Paper 1 and Paper 2 on units 1.1 to 1.4, two forms of each, with a timer', ready: true, paper: true },
  { id: '2.1', title: 'The role of markets in allocating resources', sub: 'The market system, buyers and sellers, the price mechanism', ready: true },
  { id: '2.2', title: 'Demand', sub: 'The demand curve, movements and shifts', ready: true },
  { id: '2.3', title: 'Supply', sub: 'The supply curve, movements and shifts', ready: true },
  { id: '2.4', title: 'Price determination', sub: 'The price mechanism, equilibrium, shortages and surpluses', ready: true },
  { id: '2.5', title: 'Price changes', sub: 'Shifts in demand and supply: what happens to price and quantity', ready: true },
  { id: '2.P', title: 'Section 2 exam papers (2.1 to 2.5)', sub: 'Paper 1 and Paper 2 on units 2.1 to 2.5, two forms of each, with a timer', ready: true, paper: true },
  { id: '2.6', title: 'Price elasticity of demand (PED)', sub: 'How much quantity demanded reacts to a price change', ready: false }
];
const S1 = [
  { id: 'learn', title: 'Learn', sub: 'Short cards with key words you can tap', icon: '📘' },
  { id: 'scen', title: 'Scenarios', sub: 'Use the ideas in real situations in Ho Chi Minh City', icon: '🎬' },
  { id: 'mcq', title: 'Paper 1 practice', sub: 'Multiple-choice questions at your level', icon: '✅' },
  { id: 'p2', title: 'Paper 2 builder', sub: 'Build written answers step by step', icon: '🧩' }];
export const ACTIVITIES = {
  '1.1': S1, '1.2': S1, '1.3': S1, '2.1': S1, '2.2': S1, '2.3': S1,
  '1.4': [S1[0], S1[1], { id: 'ppc', title: 'PPC explorer', sub: 'Read points, movements and shifts on a PPC', icon: '📈' }, S1[2], S1[3]],
  '2.4': [
    { id: 'learn', title: 'Learn', sub: 'Five cards with a price slider: watch shortages and surpluses disappear', icon: '📘' },
    S1[1],
    { id: 'eqm', title: 'Equilibrium finder', sub: 'Read schedules and diagrams: find equilibrium, shortages and surpluses', icon: '⚖️' },
    { id: 'mcq', title: 'Paper 1 practice', sub: '10 multiple-choice questions that adapt to you', icon: '✅' },
    { id: 'data', title: 'Data response', sub: 'Rambutan at the Tết market: identify, calculate, draw, explain', icon: '📊' }
  ],
  '2.5': [
    { id: 'learn', title: 'Learn', sub: 'Five short cards with moving diagrams', icon: '📘' },
    S1[1],
    { id: 'shift', title: 'Shift detective', sub: 'Which curve? Which way? What happens to P and Q?', icon: '🔎' },
    { id: 'mcq', title: 'Paper 1 practice', sub: '10 multiple-choice questions that adapt to you', icon: '✅' },
    { id: 'data', title: 'Data response', sub: 'Vietnam’s coffee market: calculate, identify, draw, explain', icon: '📊' }
  ]
};

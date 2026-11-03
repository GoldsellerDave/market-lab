// Cambridge IGCSE Economics 0455, syllabus for exams in 2027 to 2029, section 2: the allocation of resources.
// The app shows 2.1 to 2.6; the syllabus continues to 2.10. `ready` marks units whose activities are built; the teacher opens units per class.
export const UNITS = [
  { id: '2.1', title: 'The role of markets in allocating resources', sub: 'The market system, buyers and sellers', ready: false },
  { id: '2.2', title: 'Demand', sub: 'The demand curve, movements and shifts', ready: false },
  { id: '2.3', title: 'Supply', sub: 'The supply curve, movements and shifts', ready: false },
  { id: '2.4', title: 'Price determination', sub: 'The price mechanism, equilibrium, shortages and surpluses', ready: true },
  { id: '2.5', title: 'Price changes', sub: 'Shifts in demand and supply: what happens to price and quantity', ready: true },
  { id: '2.6', title: 'Price elasticity of demand (PED)', sub: 'How much quantity demanded reacts to a price change', ready: false }
];
export const ACTIVITIES = {
  '2.4': [
    { id: 'learn', title: 'Learn', sub: 'Five cards with a price slider: watch shortages and surpluses disappear', icon: '📘' },
    { id: 'eqm', title: 'Equilibrium finder', sub: 'Read schedules and diagrams: find equilibrium, shortages and surpluses', icon: '⚖️' },
    { id: 'mcq', title: 'Paper 1 practice', sub: '10 multiple-choice questions that adapt to you', icon: '✅' },
    { id: 'data', title: 'Data response', sub: 'Rambutan at the Tết market: identify, calculate, draw, explain', icon: '📊' }
  ],
  '2.5': [
    { id: 'learn', title: 'Learn', sub: 'Five short cards with moving diagrams', icon: '📘' },
    { id: 'shift', title: 'Shift detective', sub: 'Which curve? Which way? What happens to P and Q?', icon: '🔎' },
    { id: 'mcq', title: 'Paper 1 practice', sub: '10 multiple-choice questions that adapt to you', icon: '✅' },
    { id: 'data', title: 'Data response', sub: 'Vietnam’s coffee market: calculate, identify, draw, explain', icon: '📊' }
  ]
};

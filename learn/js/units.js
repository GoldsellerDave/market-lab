// Cambridge IGCSE Economics 0455, section 2: the allocation of resources (2.1 to 2.6).
// `ready` marks units whose activities are built; the teacher opens units per class.
export const UNITS = [
  { id: '2.1', title: 'Microeconomics and macroeconomics', sub: 'Decision makers and the two levels of economics', ready: false },
  { id: '2.2', title: 'The role of markets', sub: 'The market system, buyers and sellers', ready: false },
  { id: '2.3', title: 'Demand', sub: 'The demand curve, movements and shifts', ready: false },
  { id: '2.4', title: 'Supply', sub: 'The supply curve, movements and shifts', ready: false },
  { id: '2.5', title: 'Price changes', sub: 'Equilibrium, shifts, shortages and surpluses', ready: true },
  { id: '2.6', title: 'Price elasticity of demand', sub: 'How much quantity reacts to price', ready: false }
];
export const ACTIVITIES = {
  '2.5': [
    { id: 'learn', title: 'Learn', sub: 'Five short cards with moving diagrams', icon: '📘' },
    { id: 'shift', title: 'Shift detective', sub: 'Which curve? Which way? What happens to P and Q?', icon: '🔎' },
    { id: 'mcq', title: 'Paper 1 practice', sub: '10 multiple-choice questions that adapt to you', icon: '✅' },
    { id: 'data', title: 'Data response', sub: 'Vietnam’s coffee market: calculate, identify, draw, explain', icon: '📊' }
  ]
};

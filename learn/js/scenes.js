// Cartoon scenes for the Section 1 scenario cards: flat, colourful SVG drawn here (no image files), set in Ho Chi Minh City.
// scene(key) returns an <svg> 400×170; the scenario's emoji stickers are laid over it by the student app.

const sky = (a, b, id) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="400" height="170" fill="url(#${id})"/>`;
const sun = (x, y, r = 18) => `<circle cx="${x}" cy="${y}" r="${r + 8}" fill="#FFE27A" opacity=".35"/><circle cx="${x}" cy="${y}" r="${r}" fill="#FFC93C"/>`;
const cloud = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity=".92"><ellipse cx="0" cy="0" rx="22" ry="11"/><ellipse cx="18" cy="-6" rx="16" ry="12"/><ellipse cx="34" cy="2" rx="16" ry="9"/></g>`;
// A person: skin, shirt colour, hair; hat 'non' = conical hat, 'cap'; x,y = feet
function person(x, y, { shirt = '#E85D75', pants = '#2D4A7A', hair = '#2B1B12', skin = '#F2C29B', hat = '', long = false, s = 1 } = {}) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-7" y="-26" width="6" height="26" rx="3" fill="${pants}"/><rect x="1" y="-26" width="6" height="26" rx="3" fill="${pants}"/>
    <rect x="-11" y="-56" width="22" height="34" rx="9" fill="${shirt}"/>
    <rect x="-17" y="-52" width="7" height="24" rx="3.5" fill="${shirt}"/><rect x="10" y="-52" width="7" height="24" rx="3.5" fill="${shirt}"/>
    ${long ? `<path d="M-12 -70 q12 -14 24 0 v16 h-24z" fill="${hair}"/>` : ''}
    <circle cx="0" cy="-68" r="12" fill="${skin}"/>
    ${hat === 'non' ? '<path d="M-22 -72 L0 -94 L22 -72 z" fill="#E9C46A" stroke="#C99A2E" stroke-width="1.5"/>' : hat === 'cap' ? `<path d="M-12 -72 q12 -14 24 0z" fill="#1E8C87"/><rect x="8" y="-74" width="12" height="4" rx="2" fill="#1E8C87"/>` : `<path d="M-12 -70 q12 -16 24 0 q-6 -5 -12 -4 q-6 -1 -12 4z" fill="${hair}"/>`}
    <circle cx="-4" cy="-68" r="1.6" fill="#222"/><circle cx="4" cy="-68" r="1.6" fill="#222"/><path d="M-4 -62 q4 3 8 0" stroke="#A0522D" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  </g>`;
}
const motorbike = (x, y, c = '#E63946') => `<g transform="translate(${x} ${y})"><circle cx="-14" cy="0" r="7" fill="#333"/><circle cx="14" cy="0" r="7" fill="#333"/><circle cx="-14" cy="0" r="3" fill="#bbb"/><circle cx="14" cy="0" r="3" fill="#bbb"/>
  <path d="M-16 -4 h22 l8 -8 h6" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="-10" y="-14" width="14" height="6" rx="3" fill="#222"/></g>`;
// Ho Chi Minh City skyline: Landmark-81-like tall tower and a Bitexco-like tower with a helipad
const skyline = (y = 120, c = '#5B7DB1') => `<g fill="${c}">
  <rect x="20" y="${y - 40}" width="26" height="40"/><rect x="50" y="${y - 58}" width="22" height="58"/><rect x="76" y="${y - 34}" width="30" height="34"/>
  <path d="M120 ${y} L124 ${y - 100} L132 ${y - 104} L140 ${y - 100} L144 ${y} z"/><rect x="128" y="${y - 112}" width="4" height="10"/>
  <path d="M168 ${y} L172 ${y - 76} q8 -10 16 0 L192 ${y} z"/><ellipse cx="186" cy="${y - 64}" rx="11" ry="3" fill="#8FB0E0"/>
  <rect x="204" y="${y - 50}" width="28" height="50"/><rect x="238" y="${y - 30}" width="24" height="30"/><rect x="268" y="${y - 62}" width="20" height="62"/>
  <rect x="294" y="${y - 44}" width="34" height="44"/><rect x="334" y="${y - 26}" width="26" height="26"/><rect x="364" y="${y - 52}" width="24" height="52"/></g>
  <g fill="#FFF3B0" opacity=".7">${[[26, 30], [56, 46], [210, 40], [272, 50], [300, 34], [368, 40]].map(([x, h]) => `<rect x="${x}" y="${y - h}" width="5" height="5"/><rect x="${x + 9}" y="${y - h}" width="5" height="5"/>`).join('')}</g>`;

const SCENES = {
  // Lan in front of a shop street, with her wallet
  lan: () => `${sky('#8ED1FC', '#D8F1FF', 'gl')}${sun(345, 34)}${cloud(60, 30)}${cloud(200, 22, .8)}
    ${skyline(118, '#A9C4EB')}
    <rect y="118" width="400" height="52" fill="#F4D6A0"/><rect y="118" width="400" height="6" fill="#E3B873"/>
    <g><rect x="20" y="70" width="110" height="50" fill="#FF8FA3"/><path d="M14 70 h122 l-8 -14 h-106z" fill="#E63E62"/><text x="75" y="100" font-size="15" text-anchor="middle" fill="#fff" font-family="sans-serif" font-weight="800">TRÀ SỮA</text>
    <rect x="250" y="66" width="130" height="54" fill="#7EC4CF"/><path d="M244 66 h142 l-8 -14 h-126z" fill="#3A8FA0"/><text x="315" y="98" font-size="15" text-anchor="middle" fill="#fff" font-family="sans-serif" font-weight="800">NHÀ SÁCH</text></g>
    ${person(190, 160, { shirt: '#FFFFFF', pants: '#1D3557', long: true })}<rect x="202" y="118" width="14" height="10" rx="2" fill="#F4A261"/>
    ${motorbike(320, 158)}`,
  // Bến Thành market: clock tower, stalls with fruit
  market: () => `${sky('#FFD6A5', '#FFF1D6', 'gm')}${sun(60, 36, 16)}${cloud(300, 28)}
    <rect x="120" y="40" width="160" height="80" fill="#F6E7C1"/><rect x="185" y="14" width="30" height="40" fill="#F6E7C1"/><path d="M180 16 h40 l-20 -12z" fill="#C0583F"/>
    <circle cx="200" cy="32" r="9" fill="#fff" stroke="#6B4F3A" stroke-width="2"/><path d="M200 32 v-5 M200 32 h4" stroke="#6B4F3A" stroke-width="1.6"/>
    <path d="M114 40 h172 l-12 -10 h-148z" fill="#C0583F"/><text x="200" y="70" font-size="14" text-anchor="middle" fill="#8A3B26" font-family="sans-serif" font-weight="800">CHỢ BẾN THÀNH</text>
    ${[150, 180, 210, 240].map(x => `<rect x="${x}" y="84" width="16" height="36" rx="8" fill="#6B4F3A" opacity=".55"/>`).join('')}
    <rect y="120" width="400" height="50" fill="#E9C9A0"/>
    ${[[20, '#E76F51'], [300, '#2A9D8F']].map(([x, c]) => `<g><rect x="${x}" y="96" width="80" height="34" fill="#fff"/><path d="M${x - 6} 96 h92 l-6 -14 h-80z" fill="${c}"/>
      <circle cx="${x + 14}" cy="122" r="7" fill="#F4A261"/><circle cx="${x + 30}" cy="122" r="7" fill="#E63946"/><circle cx="${x + 46}" cy="122" r="7" fill="#8AC926"/><circle cx="${x + 62}" cy="122" r="7" fill="#FFCA3A"/></g>`).join('')}
    ${person(150, 164, { shirt: '#9B5DE5', long: true, s: .85 })}${person(245, 164, { shirt: '#FFFFFF', pants: '#1D3557', long: true, s: .7 })}`,
  // City: skyline, Saigon River, metro, People's Committee-like building
  city: () => `${sky('#6EC6FF', '#CDEBFF', 'gc')}${sun(60, 30, 15)}${cloud(250, 26)}${cloud(330, 40, .7)}
    ${skyline(112, '#4F74B5')}
    <rect y="112" width="400" height="20" fill="#3E9BD6"/><path d="M0 118 q20 -4 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" stroke="#9CD6F5" stroke-width="2" fill="none"/>
    <rect y="132" width="400" height="38" fill="#8FD18A"/>
    <rect x="40" y="136" width="150" height="16" rx="8" fill="#F1FAEE" stroke="#457B9D" stroke-width="2"/><rect x="48" y="140" width="18" height="7" rx="2" fill="#A8DADC"/><rect x="72" y="140" width="18" height="7" rx="2" fill="#A8DADC"/><rect x="96" y="140" width="18" height="7" rx="2" fill="#A8DADC"/><rect x="120" y="140" width="18" height="7" rx="2" fill="#A8DADC"/><rect x="40" y="152" width="150" height="3" fill="#457B9D"/>
    <g><rect x="250" y="122" width="110" height="38" fill="#FFE8A3"/><rect x="292" y="104" width="26" height="22" fill="#FFE8A3"/><path d="M288 104 h34 l-17 -12z" fill="#E76F51"/>
      ${[258, 274, 334, 350].map(x => `<rect x="${x}" y="132" width="8" height="16" rx="4" fill="#E9A23B"/>`).join('')}<rect x="296" y="136" width="18" height="24" rx="9" fill="#C0583F"/><rect x="304" y="86" width="2" height="8" fill="#555"/><rect x="306" y="86" width="9" height="6" fill="#DA291C"/></g>`,
  // Cần Giờ beach: sea, sand, palm tree, sunbed, coconut
  beach: () => `${sky('#5BC0EB', '#BDE8FA', 'gb')}${sun(330, 36, 20)}${cloud(80, 30)}${cloud(190, 46, .7)}
    <rect y="88" width="400" height="38" fill="#2E86C1"/><path d="M0 98 q15 -5 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0" stroke="#AEDFF7" stroke-width="2.5" fill="none"/>
    <path d="M0 126 q100 -18 200 -6 t200 -4 V170 H0z" fill="#F7D794"/>
    <path d="M62 150 q-4 -50 8 -78" stroke="#8D5524" stroke-width="7" fill="none" stroke-linecap="round"/>
    <g fill="#2D9C5A"><path d="M70 72 q-30 -6 -44 12 q24 -6 44 -12z"/><path d="M70 72 q30 -8 46 8 q-26 -4 -46 -8z"/><path d="M70 72 q-16 -22 -6 -40 q4 20 6 40z"/><path d="M70 72 q14 -22 34 -24 q-18 10 -34 24z"/></g>
    <circle cx="66" cy="78" r="5" fill="#6B8E23"/><circle cx="75" cy="80" r="5" fill="#6B8E23"/>
    <g><path d="M250 128 l60 -2 l18 -18" stroke="#E76F51" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M262 104 q30 -34 60 0z" fill="#F4A261"/><rect x="291" y="104" width="2.5" height="26" fill="#6B4F3A"/></g>
    ${person(180, 160, { shirt: '#FFB703', long: true, s: .85 })}${person(212, 160, { shirt: '#06D6A0', hat: 'cap', s: .8 })}`,
  // Mr Minh's café with awning, coffee cups, plants
  cafe: () => `${sky('#FFE0B5', '#FFF6E8', 'gk')}${cloud(320, 26)}${sun(56, 30, 14)}
    <rect x="70" y="44" width="260" height="96" fill="#FFF8F0"/><rect x="70" y="40" width="260" height="10" fill="#6F4E37"/>
    <path d="M60 50 h280 l-10 26 h-260z" fill="#2A9D8F"/>${[0, 1, 2, 3, 4, 5, 6].map(k => `<path d="M${70 + k * 40} 76 q20 12 40 0" fill="${k % 2 ? '#2A9D8F' : '#FFFFFF'}"/>`).join('')}
    <text x="200" y="68" font-size="16" text-anchor="middle" fill="#fff" font-family="sans-serif" font-weight="800">CÀ PHÊ MINH ☕</text>
    <rect x="96" y="90" width="80" height="50" fill="#BDE0FE" stroke="#6F4E37" stroke-width="3"/><rect x="230" y="90" width="44" height="50" fill="#8D5524"/><circle cx="266" cy="116" r="2.5" fill="#FFD166"/>
    <rect y="140" width="400" height="30" fill="#D9C2A7"/>
    <g><rect x="22" y="122" width="40" height="4" fill="#6F4E37"/><rect x="40" y="126" width="4" height="16" fill="#6F4E37"/><rect x="28" y="112" width="10" height="10" rx="2" fill="#fff"/><rect x="44" y="112" width="10" height="10" rx="2" fill="#fff"/></g>
    <g><rect x="340" y="122" width="40" height="4" fill="#6F4E37"/><rect x="358" y="126" width="4" height="16" fill="#6F4E37"/></g>
    <g fill="#52B788"><circle cx="196" cy="118" r="10"/><circle cx="206" cy="112" r="9"/><rect x="194" y="124" width="14" height="16" fill="#E76F51"/></g>
    ${person(140, 166, { shirt: '#6F4E37', pants: '#333', s: .8 })}`,
  // Rice farm in Củ Chi: paddies, farmer in nón lá, buffalo-free, water pump
  farm: () => `${sky('#9BE7FF', '#E6FAFF', 'gf')}${sun(70, 34, 16)}${cloud(260, 30)}
    <path d="M0 80 q60 -24 130 -6 t140 -4 t130 -10 V100 H0z" fill="#7BC67E"/>
    <rect y="96" width="400" height="74" fill="#A7D676"/>
    ${[0, 1, 2, 3].map(r => `<path d="M0 ${104 + r * 16} H400" stroke="#86BF5B" stroke-width="2"/>`).join('')}
    ${Array.from({ length: 30 }, (_, k) => `<path d="M${10 + (k % 15) * 27} ${112 + Math.floor(k / 15) * 30} l-3 -10 M${10 + (k % 15) * 27} ${112 + Math.floor(k / 15) * 30} l3 -10 M${10 + (k % 15) * 27} ${112 + Math.floor(k / 15) * 30} v-12" stroke="#4E8C2E" stroke-width="2" stroke-linecap="round"/>`).join('')}
    <g><rect x="300" y="60" width="60" height="38" fill="#F1E3C6"/><path d="M294 60 h72 l-36 -24z" fill="#B5651D"/><rect x="322" y="76" width="14" height="22" fill="#8D5524"/></g>
    ${person(150, 162, { shirt: '#4361EE', hat: 'non', s: .95 })}${person(220, 162, { shirt: '#F72585', hat: 'non', s: .8 })}`,
  // From the countryside to the city: road, bus, farm on the left, factory on the right
  move: () => `${sky('#B8E0FF', '#F0F9FF', 'gv')}${sun(200, 28, 14)}${cloud(90, 30, .8)}
    <rect y="100" width="170" height="70" fill="#A7D676"/>${Array.from({ length: 8 }, (_, k) => `<path d="M${14 + k * 20} 130 v-12" stroke="#4E8C2E" stroke-width="2"/>`).join('')}
    <rect x="230" y="100" width="170" height="70" fill="#C9D6E3"/>
    <g><rect x="260" y="56" width="110" height="46" fill="#ADB5BD"/><path d="M260 56 l22 -14 v14 l22 -14 v14 l22 -14 v14 l22 -14 v14z" fill="#6C757D"/><rect x="350" y="26" width="10" height="34" fill="#6C757D"/>
      <circle cx="356" cy="20" r="6" fill="#DEE2E6"/><circle cx="364" cy="12" r="5" fill="#E9ECEF"/><text x="315" y="86" font-size="12" text-anchor="middle" fill="#fff" font-family="sans-serif" font-weight="800">📱 FACTORY</text></g>
    <path d="M0 140 Q200 110 400 140 V170 H0z" fill="#6C757D"/><path d="M20 152 Q200 124 380 152" stroke="#FFD166" stroke-width="3" stroke-dasharray="12 10" fill="none"/>
    <g transform="translate(160 118)"><rect x="0" y="0" width="80" height="30" rx="6" fill="#F77F00"/>${[8, 26, 44].map(x => `<rect x="${x}" y="5" width="14" height="10" rx="2" fill="#CDEBFF"/>`).join('')}<rect x="62" y="5" width="12" height="18" rx="2" fill="#CDEBFF"/><circle cx="16" cy="31" r="6" fill="#333"/><circle cx="62" cy="31" r="6" fill="#333"/></g>
    ${person(60, 112, { shirt: '#4361EE', hat: 'non', s: .6 })}${person(250, 128, { shirt: '#FFFFFF', pants: '#1D3557', hat: 'cap', s: .6 })}`,
  // PPC background: rice fields on the left, phone factory on the right, a mini curve in the middle
  ppc: () => `${sky('#C3F0CA', '#F1FFF3', 'gp')}
    <rect y="110" width="140" height="60" fill="#A7D676"/>${Array.from({ length: 6 }, (_, k) => `<path d="M${16 + k * 22} 140 v-14" stroke="#4E8C2E" stroke-width="2.4"/>`).join('')}
    <g><rect x="270" y="70" width="110" height="60" fill="#B8C4D6"/><rect x="350" y="40" width="12" height="34" fill="#8D99AE"/>${[284, 312, 340].map(x => `<rect x="${x}" y="88" width="18" height="26" rx="3" fill="#2B2D42"/><rect x="${x + 3}" y="92" width="12" height="18" rx="1" fill="#8ECAE6"/>`).join('')}</g>
    <rect x="260" y="130" width="140" height="40" fill="#D3DCE6"/>
    <g transform="translate(150 22)"><rect width="104" height="118" rx="12" fill="#fff" stroke="#1E8C87" stroke-width="3"/>
      <path d="M18 14 V100 H96" stroke="#16324F" stroke-width="3" fill="none"/><path d="M18 28 A70 70 0 0 1 86 100" stroke="#1E8C87" stroke-width="4" fill="none"/>
      <circle cx="54" cy="52" r="5" fill="#D9622B"/><text x="22" y="14" font-size="11" font-family="sans-serif">📱</text><text x="84" y="114" font-size="11" font-family="sans-serif">🌾</text></g>`
};
export const SCENE_KEYS = Object.keys(SCENES);
export function scene(key, label = '') {
  return `<svg class="scene-svg" viewBox="0 0 400 170" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}">${(SCENES[key] || SCENES.city)()}</svg>`;
}

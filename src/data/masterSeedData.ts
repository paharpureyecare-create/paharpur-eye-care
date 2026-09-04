import { MasterRecord, MasterCategoryKey } from '../types';

export interface MasterCategoryDefinition {
  key: MasterCategoryKey;
  name: string;
  nameBn: string;
  shortDesc: string;
  idPrefix: string;
  iconName: string;
  badgeColor: string;
  fieldsHint: string;
}

export const MASTER_CATEGORIES_CONFIG: MasterCategoryDefinition[] = [
  {
    key: 'lens-type',
    name: 'Lens Type Master',
    nameBn: 'লেন্স টাইপ মাস্টার',
    shortDesc: 'Ophthalmic & Optical Lens Design/Usage Categories (Single Vision, Blue Cut, Progressive, Bifocal, Anti-Fatigue, etc.)',
    idPrefix: 'LNT',
    iconName: 'Disc',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    fieldsHint: 'Classification of corrective lenses for optical inventory, prescription orders, and stock generation.'
  },
  {
    key: 'brand',
    name: 'Lens & Product Brand Master',
    nameBn: 'ব্র্যান্ড মাস্টার',
    shortDesc: 'Optical lens and accessory brands (Crizal, Blue-Guard, OmniView, Zeiss DriveSafe, TransFast, etc.)',
    idPrefix: 'BRD',
    iconName: 'Tag',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    fieldsHint: 'Registered lens brand labels and trade names.'
  },
  {
    key: 'company',
    name: 'Company / Manufacturer Master',
    nameBn: 'কোম্পানি / প্রস্তুতকারক মাস্টার',
    shortDesc: 'Lens, Frame, and Pharma Manufacturers (Essilor, Hoya, Zeiss, Prime Vision, Sun Pharma, Alcon, etc.)',
    idPrefix: 'CMP',
    iconName: 'Building2',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    fieldsHint: 'Corporate manufacturers and lab suppliers.'
  },
  {
    key: 'coating',
    name: 'Lens Coating Master',
    nameBn: 'লেন্স কোটিং মাস্টার',
    shortDesc: 'Surface treatments & optical coatings (Green HMC, Blue Cut UV420, Super Hydrophobic, DriveSafe ARC, etc.)',
    idPrefix: 'CTG',
    iconName: 'Layers',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    fieldsHint: 'Anti-reflective, scratch resistant, and light filtering coatings.'
  },
  {
    key: 'refractive-index',
    name: 'Refractive Index Master',
    nameBn: 'রিফ্র্যাক্টিভ ইনডেক্স মাস্টার',
    shortDesc: 'Lens optical index & thickness standards (1.50 CR-39, 1.56 Mid-Index, 1.59 Poly, 1.60, 1.67, 1.74 Hi-Index)',
    idPrefix: 'IDX',
    iconName: 'Sparkles',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    fieldsHint: 'Material density and edge-thickness grading.'
  },
  {
    key: 'frame-brand',
    name: 'Frame Brand Master',
    nameBn: 'ফ্রেম ব্র্যান্ড মাস্টার',
    shortDesc: 'Eyewear and spectacle frame brands (Titan EyePlus, Fastrack, Ray-Ban, PEC Signature, Vogue, etc.)',
    idPrefix: 'FBR',
    iconName: 'Glasses',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    fieldsHint: 'Designer and commercial frame brands.'
  },
  {
    key: 'frame-type',
    name: 'Frame Type & Material Master',
    nameBn: 'ফ্রেম টাইপ ও উপাদান মাস্টার',
    shortDesc: 'Frame structure & materials (Full Rim Acetate, Half-Rim Metal, Rimless Titanium, TR90 Memory, Ultem, etc.)',
    idPrefix: 'FTY',
    iconName: 'Box',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
    fieldsHint: 'Mounting style and base material composition.'
  },
  {
    key: 'supplier',
    name: 'Supplier Master',
    nameBn: 'সাপ্লায়ার মাস্টার',
    shortDesc: 'Wholesale optical lens, frame, and medical vendors & distributors',
    idPrefix: 'SUP',
    iconName: 'Truck',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    fieldsHint: 'Primary wholesale vendors and supply partners.'
  },
  {
    key: 'medicine-brand',
    name: 'Medicine Brand Master',
    nameBn: 'মেডিসিন ব্র্যান্ড মাস্টার',
    shortDesc: 'Formulary brands for eye drops, ointments, and oral ophthalmic medications',
    idPrefix: 'MED',
    iconName: 'Pill',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    fieldsHint: 'Ophthalmic pharmaceutical brands and formulations.'
  },
  {
    key: 'diagnosis',
    name: 'Diagnosis Master',
    nameBn: 'ডায়াগনোসিস মাস্টার',
    shortDesc: 'Standard ophthalmic and refractive diagnosis terms (Myopia, Astigmatism, Presbyopia, Cataract, Glaucoma, etc.)',
    idPrefix: 'DX',
    iconName: 'Stethoscope',
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-300',
    fieldsHint: 'Clinical examination and vision disorder terms.'
  },
  {
    key: 'payment-method',
    name: 'Payment Method Master',
    nameBn: 'পেমেন্ট মেথড মাস্টার',
    shortDesc: 'Billing & POS settlement modes (Cash, UPI QR, Card POS, Bank NEFT, Store Credit, EMI)',
    idPrefix: 'PAY',
    iconName: 'CreditCard',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    fieldsHint: 'Accepted retail, clinical, and wholesale payment channels.'
  }
];

export const INITIAL_MASTERS: MasterRecord[] = [
  // 1. LENS TYPE MASTER (All existing options + extra common ones)
  {
    id: 'LNT-001',
    categoryKey: 'lens-type',
    name: 'SINGLE VISION SPHERICAL',
    code: 'SV-SPH',
    subCategory: 'Single Vision',
    description: 'Standard single vision spherical power for distance or near correction.',
    active: true,
    isDefault: true,
    sortOrder: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'LNT-002',
    categoryKey: 'lens-type',
    name: 'SINGLE VISION CYLINDRICAL / TORIC',
    code: 'SV-CYL',
    subCategory: 'Single Vision',
    description: 'Single vision with astigmatism cylindrical/toric correction.',
    active: true,
    sortOrder: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'LNT-003',
    categoryKey: 'lens-type',
    name: 'BLUE CUT',
    code: 'BLU-STD',
    subCategory: 'Blue Protection',
    description: 'Standard Blue Light Filtering lens for digital screen protection (UV420).',
    active: true,
    sortOrder: 3,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'LNT-004',
    categoryKey: 'lens-type',
    name: 'BLUE CUT GREEN',
    code: 'BC-GRN',
    subCategory: 'Blue Protection',
    description: 'High-clarity blue block lens with green anti-glare HMC coating reflex.',
    active: true,
    sortOrder: 4,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'LNT-005',
    categoryKey: 'lens-type',
    name: 'BLUE CUT BLUE',
    code: 'BC-BLU',
    subCategory: 'Blue Protection',
    description: 'Premium blue cut lens with blue anti-reflective coating reflex.',
    active: true,
    sortOrder: 5,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'LNT-006',
    categoryKey: 'lens-type',
    name: 'PG / PHOTOCHROMIC',
    code: 'PG-PHO',
    subCategory: 'Photochromic',
    description: 'Fast dark-transitioning light-reactive photochromic lens for indoor/outdoor use.',
    active: true,
    sortOrder: 6,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'LNT-007',
    categoryKey: 'lens-type',
    name: 'PROGRESSIVE',
    code: 'PROG-STD',
    subCategory: 'Progressive',
    description: 'Standard multi-focal progressive lens with seamless distance, intermediate & near vision.',
    active: true,
    sortOrder: 7,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'LNT-008',
    categoryKey: 'lens-type',
    name: 'PROGRESSIVE BLUE CUT',
    code: 'PROG-BC',
    subCategory: 'Progressive',
    description: 'Digital freeform progressive lens with integrated blue light UV420 protection.',
    active: true,
    sortOrder: 8,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'LNT-009',
    categoryKey: 'lens-type',
    name: 'PROGRESSIVE PG',
    code: 'PROG-PG',
    subCategory: 'Progressive',
    description: 'Freeform progressive combined with photochromic fast transition tint.',
    active: true,
    sortOrder: 9,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'LNT-010',
    categoryKey: 'lens-type',
    name: 'BIFOCAL',
    code: 'BIF-KRY',
    subCategory: 'Bifocal',
    description: 'Traditional D-Segment / Kryptok bifocal lens with visible near reading segment.',
    active: true,
    sortOrder: 10,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'LNT-011',
    categoryKey: 'lens-type',
    name: 'HI-INDEX 1.67',
    code: 'HI-167',
    subCategory: 'High Index',
    description: 'Ultra-thin high index 1.67 aspheric lens for high refractive powers.',
    active: true,
    sortOrder: 11,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'LNT-012',
    categoryKey: 'lens-type',
    name: 'NORMAL CLEAR',
    code: 'CLR-CR39',
    subCategory: 'Basic',
    description: 'Standard hard-coated clear CR-39 lens without anti-reflective coating.',
    active: true,
    sortOrder: 12,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'LNT-013',
    categoryKey: 'lens-type',
    name: 'ARC / ANTI-REFLECTIVE',
    code: 'ARC-STD',
    subCategory: 'Coated',
    description: 'Anti-Reflective coated clear lens for glare reduction.',
    active: true,
    sortOrder: 13,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'LNT-014',
    categoryKey: 'lens-type',
    name: 'OTHER CUSTOM LENS',
    code: 'CUST-LNS',
    subCategory: 'Specialized',
    description: 'Custom lab order or specialized ophthalmic prescription lens.',
    active: true,
    sortOrder: 14,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },

  // 2. BRAND MASTER
  {
    id: 'BRD-001',
    categoryKey: 'brand',
    name: 'Clear Vision',
    code: 'CV',
    description: 'Reliable everyday ophthalmic single vision & blue cut lenses',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'BRD-002',
    categoryKey: 'brand',
    name: 'Crizal',
    code: 'CRZ',
    description: 'Essilor premium anti-reflective and smudge-resistant lens line',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'BRD-003',
    categoryKey: 'brand',
    name: 'Blue-Guard',
    code: 'BG',
    description: 'High-density blue block UV420 computer screen lenses',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'BRD-004',
    categoryKey: 'brand',
    name: 'OmniView',
    code: 'OV',
    description: 'Wide-corridor digital freeform progressive lenses',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'BRD-005',
    categoryKey: 'brand',
    name: 'TransFast',
    code: 'TF',
    description: 'Fast response photochromic grey and brown lenses',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'BRD-006',
    categoryKey: 'brand',
    name: 'Zeiss DriveSafe',
    code: 'ZDS',
    description: 'Carl Zeiss specialized low-light and night driving anti-glare lenses',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },

  // 3. COMPANY / MANUFACTURER MASTER
  {
    id: 'CMP-001',
    categoryKey: 'company',
    name: 'Essilor Optical India',
    code: 'ESS',
    description: 'Leading global ophthalmic lens maker (Crizal, Eyezen, Varilux)',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'CMP-002',
    categoryKey: 'company',
    name: 'Hoya Vision Care',
    code: 'HOY',
    description: 'Japanese high-precision optical lenses and coatings',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'CMP-003',
    categoryKey: 'company',
    name: 'Carl Zeiss India',
    code: 'CZ',
    description: 'German precision optics, DriveSafe, SmartLife lenses',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'CMP-004',
    categoryKey: 'company',
    name: 'Prime Vision Optics',
    code: 'PVO',
    description: 'Wholesale stockist & finished single vision/blue cut manufacturer',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'CMP-005',
    categoryKey: 'company',
    name: 'VisionTech Laboratories',
    code: 'VTL',
    description: 'Digital RX prescription lab and custom freeform surfacing',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'CMP-006',
    categoryKey: 'company',
    name: 'Allergan / AbbVie',
    code: 'ALL',
    description: 'Ophthalmic pharmaceuticals (Refresh Tears, Optive, Alphagan)',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'CMP-007',
    categoryKey: 'company',
    name: 'Alcon Laboratories',
    code: 'ALC',
    description: 'Ophthalmic solutions & drops (Systane, Vigamox, Patanol)',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },

  // 4. COATING MASTER
  {
    id: 'CTG-001',
    categoryKey: 'coating',
    name: 'Green HMC (Anti-Glare UV420)',
    code: 'GRN-HMC',
    description: 'Standard green reflex multi-coating with UV420 and anti-reflective properties.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'CTG-002',
    categoryKey: 'coating',
    name: 'Blue HMC (Blue Cut Reflector)',
    code: 'BLU-HMC',
    description: 'Blue residual reflex with intense harmful high-energy blue-violet filter.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'CTG-003',
    categoryKey: 'coating',
    name: 'Super Hydrophobic Clean Coat',
    code: 'SHC',
    description: 'Oleophobic & hydrophobic water-repellent, smudge-free top coat.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'CTG-004',
    categoryKey: 'coating',
    name: 'DriveSafe Night-Vision ARC',
    code: 'DS-ARC',
    description: 'Specialized luminance-tuned coating reducing oncoming headlight glare up to 64%.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'CTG-005',
    categoryKey: 'coating',
    name: 'Hard Coated Clear (HC)',
    code: 'HC',
    description: 'Thermal dipped anti-scratch hard protective coating.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },

  // 5. REFRACTIVE INDEX MASTER
  {
    id: 'IDX-001',
    categoryKey: 'refractive-index',
    name: '1.50 (Standard CR-39)',
    code: '1.50',
    description: 'Standard optical resin with Abbe Value 58 (Suitable for low power -2.00 to +2.00)',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'IDX-002',
    categoryKey: 'refractive-index',
    name: '1.56 (High Index Thin)',
    code: '1.56',
    description: 'Popular mid-index resin, 15% thinner than standard CR-39.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'IDX-003',
    categoryKey: 'refractive-index',
    name: '1.59 (Polycarbonate Impact Resistant)',
    code: '1.59',
    description: 'Shatter-proof impact-resistant material ideal for rimless frames & sports glasses.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'IDX-004',
    categoryKey: 'refractive-index',
    name: '1.60 (Super Thin MR-8 Resin)',
    code: '1.60',
    description: 'Tensile-strength MR-8 resin, 25% thinner, excellent for rimless drilling.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'IDX-005',
    categoryKey: 'refractive-index',
    name: '1.67 (Ultra Thin Hi-Index)',
    code: '1.67',
    description: '35% thinner than standard CR-39 with aspheric profile for moderate/high powers.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'IDX-006',
    categoryKey: 'refractive-index',
    name: '1.74 (Extreme Thin Double-Aspheric)',
    code: '1.74',
    description: 'Thinnest organic ophthalmic lens for high prescriptions over -6.00D or +4.00D.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },

  // 6. FRAME BRAND MASTER
  {
    id: 'FBR-001',
    categoryKey: 'frame-brand',
    name: 'Titan EyePlus',
    code: 'TEP',
    description: 'Premium domestic branded eyewear with solid build quality and warranty.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'FBR-002',
    categoryKey: 'frame-brand',
    name: 'Fastrack',
    code: 'FTK',
    description: 'Youth and contemporary lifestyle frame and sunglass designs.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'FBR-003',
    categoryKey: 'frame-brand',
    name: 'Ray-Ban',
    code: 'RB',
    description: 'Iconic Italian eyewear classics (Aviator, Wayfarer, Clubmaster).',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'FBR-004',
    categoryKey: 'frame-brand',
    name: 'PEC Signature Collection',
    code: 'PEC',
    description: 'Paharpur Eye Care in-house curated acetate & titanium lightweight frames.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'FBR-005',
    categoryKey: 'frame-brand',
    name: 'Vogue Eyewear',
    code: 'VG',
    description: 'Trendy fashion-forward feminine and unisex eyewear collection.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'FBR-006',
    categoryKey: 'frame-brand',
    name: 'Velocity Titanium',
    code: 'VEL',
    description: 'Lightweight pure titanium and memory metal flexible frames.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },

  // 7. FRAME TYPE & MATERIAL MASTER
  {
    id: 'FTY-001',
    categoryKey: 'frame-type',
    name: 'Full Rim Acetate',
    code: 'FR-ACE',
    description: 'Classic durable Italian handcrafted cellulose acetate full-rim frame.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'FTY-002',
    categoryKey: 'frame-type',
    name: 'Half-Rim Metal (Supra)',
    code: 'HR-MTL',
    description: 'Nylon thread bottom supra mount with lightweight metal browline.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'FTY-003',
    categoryKey: 'frame-type',
    name: 'Rimless Titanium',
    code: 'RL-TI',
    description: 'Three-piece drilled rimless mount with ultra-light flex titanium temples.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'FTY-004',
    categoryKey: 'frame-type',
    name: 'TR90 Memory Plastic',
    code: 'TR90',
    description: 'Flexible Swiss thermoplastic material with high fatigue strength.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'FTY-005',
    categoryKey: 'frame-type',
    name: 'Ultem Ultra-Lightweight',
    code: 'ULT',
    description: 'Aerospace-grade resin, featherlight (under 8g) with magnetic clip-on support.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },

  // 8. SUPPLIER MASTER
  {
    id: 'SUP-001',
    categoryKey: 'supplier',
    name: 'Essilor Optical India Pvt Ltd',
    code: 'SUP-ESS',
    description: 'Distributor for Crizal, Varilux, and finished stock lenses (Kolkata Hub).',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'SUP-002',
    categoryKey: 'supplier',
    name: 'Prime Lens Labs Kolkata',
    code: 'SUP-PLL',
    description: 'Finished power lenses, Blue Cut Green, and PG photochromic inventory.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'SUP-003',
    categoryKey: 'supplier',
    name: 'Vision Care Frames Mumbai',
    code: 'SUP-VCF',
    description: 'Direct importer of acetate, TR90, and titanium designer spectacle frames.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },

  // 9. MEDICINE BRAND MASTER
  {
    id: 'MED-001',
    categoryKey: 'medicine-brand',
    name: 'Refresh Tears (Allergan)',
    code: 'MED-RT',
    description: 'Carboxymethylcellulose Sodium 0.5% Lubricating Eye Drops.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'MED-002',
    categoryKey: 'medicine-brand',
    name: 'Systane Ultra (Alcon)',
    code: 'MED-SU',
    description: 'Polyethylene Glycol 400 + Propylene Glycol high-performance dry eye protection.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'MED-003',
    categoryKey: 'medicine-brand',
    name: 'Vigamox (Alcon)',
    code: 'MED-VG',
    description: 'Moxifloxacin HCl 0.5% 4th Generation Fluoroquinolone Antibiotic Eye Drops.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'MED-004',
    categoryKey: 'medicine-brand',
    name: 'Pataday (Novartis)',
    code: 'MED-PT',
    description: 'Olopatadine HCl 0.2% Once-Daily Ocular Antihistamine & Mast Cell Stabilizer.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },

  // 10. DIAGNOSIS MASTER
  {
    id: 'DX-001',
    categoryKey: 'diagnosis',
    name: 'Simple Myopia',
    code: 'MYO-SMP',
    description: 'Short-sightedness with clear near vision and blurred distance.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'DX-002',
    categoryKey: 'diagnosis',
    name: 'Compound Myopic Astigmatism',
    code: 'MYO-AST',
    description: 'Myopia combined with corneal/lenticular cylindrical error in both principal meridians.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'DX-003',
    categoryKey: 'diagnosis',
    name: 'Hypermetropia',
    code: 'HYP',
    description: 'Long-sightedness / Farsightedness needing convex plus power correction.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'DX-004',
    categoryKey: 'diagnosis',
    name: 'Presbyopia',
    code: 'PRB',
    description: 'Age-related loss of near accommodation reading power (typically after age 40).',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'DX-005',
    categoryKey: 'diagnosis',
    name: 'Dry Eye Syndrome (DES)',
    code: 'DES',
    description: 'Tear film deficiency or evaporative dry eye with ocular burning sensation.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'DX-006',
    categoryKey: 'diagnosis',
    name: 'Computer Vision Syndrome (CVS)',
    code: 'CVS',
    description: 'Digital screen fatigue, asthenopia, reduced blink rate, and glare strain.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'DX-007',
    categoryKey: 'diagnosis',
    name: 'Allergic Conjunctivitis',
    code: 'ACJ',
    description: 'Itching, conjunctival chemosis, and seasonal or dust-induced redness.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'DX-008',
    categoryKey: 'diagnosis',
    name: 'Immature Senile Cataract (NS1/NS2)',
    code: 'CAT-IMS',
    description: 'Lens opacification causing progressive painless blur and glare at night.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'DX-009',
    categoryKey: 'diagnosis',
    name: 'Glaucoma Suspect / Ocular Hypertension',
    code: 'GLC-SUS',
    description: 'Elevated IOP (>21 mmHg) or increased cup-to-disc ratio needing visual field monitoring.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },

  // 11. PAYMENT METHOD MASTER
  {
    id: 'PAY-001',
    categoryKey: 'payment-method',
    name: 'Cash',
    code: 'CSH',
    description: 'Direct physical cash currency payment.',
    active: true,
    isDefault: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'PAY-002',
    categoryKey: 'payment-method',
    name: 'UPI / QR (GooglePay, PhonePe, Paytm)',
    code: 'UPI',
    description: 'Direct digital QR code scan and UPI transaction.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'PAY-003',
    categoryKey: 'payment-method',
    name: 'Debit / Credit Card (POS Terminal)',
    code: 'CARD',
    description: 'Electronic EDC card swipe / tap transaction.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'PAY-004',
    categoryKey: 'payment-method',
    name: 'Bank Transfer (NEFT / IMPS / RTGS)',
    code: 'BANK',
    description: 'Direct bank account transfer settlement.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  },
  {
    id: 'PAY-005',
    categoryKey: 'payment-method',
    name: 'Store Credit / Advance Adjusted',
    code: 'CREDIT',
    description: 'Adjusted from previous patient advance balance or exchange credit.',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'System Master Seed'
  }
];

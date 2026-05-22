export type ElementCategory =
  | "alkali-metal"
  | "alkaline-earth"
  | "transition-metal"
  | "post-transition-metal"
  | "metalloid"
  | "nonmetal"
  | "halogen"
  | "noble-gas"
  | "lanthanide"
  | "actinide"
  | "unknown";

export interface ChemElement {
  number: number;
  symbol: string;
  name: string;
  mass: string;
  category: ElementCategory;
  /** display row: 1–7 = periods 1–7, 8 = lanthanides, 9 = actinides */
  row: number;
  /** display column: 1–18 */
  col: number;
}

export type PhaseAtRTP = "solid" | "liquid" | "gas";

export interface ElementExtra {
  electronConfig: string;   // e.g. "[He] 2s² 2p²"
  phaseAtRTP:     PhaseAtRTP;
  meltingC?:      string;   // °C, undefined for noble gases etc.
  boilingC?:      string;
  commonUse?:     string;   // one short sentence
}

export const ELEMENT_EXTRAS: Record<number, ElementExtra> = {
  1:  { electronConfig: "1s¹",               phaseAtRTP: "gas",    boilingC: "−252.9", meltingC: "−259.2", commonUse: "Fuel cells, Haber process, balloon gas" },
  2:  { electronConfig: "1s²",               phaseAtRTP: "gas",    boilingC: "−268.9", meltingC: "−272.2", commonUse: "Cryogenics, party balloons, MRI coolant" },
  3:  { electronConfig: "[He] 2s¹",          phaseAtRTP: "solid",  meltingC: "180.5",  boilingC: "1342",   commonUse: "Li-ion batteries, mood-stabiliser drug" },
  4:  { electronConfig: "[He] 2s²",          phaseAtRTP: "solid",  meltingC: "1287",   boilingC: "2469",   commonUse: "Aerospace alloys, X-ray windows" },
  5:  { electronConfig: "[He] 2s² 2p¹",     phaseAtRTP: "solid",  meltingC: "2076",   boilingC: "3927",   commonUse: "Borosilicate glass, semiconductors" },
  6:  { electronConfig: "[He] 2s² 2p²",     phaseAtRTP: "solid",  meltingC: "3550",   boilingC: "4027",   commonUse: "Steel, graphite electrodes, diamond" },
  7:  { electronConfig: "[He] 2s² 2p³",     phaseAtRTP: "gas",    boilingC: "−195.8", meltingC: "−209.9", commonUse: "Ammonia, explosives, fertilisers (N₂)" },
  8:  { electronConfig: "[He] 2s² 2p⁴",     phaseAtRTP: "gas",    boilingC: "−183.0", meltingC: "−218.8", commonUse: "Respiration, combustion, steel-making" },
  9:  { electronConfig: "[He] 2s² 2p⁵",     phaseAtRTP: "gas",    boilingC: "−188.1", meltingC: "−219.6", commonUse: "Teflon, toothpaste (F⁻ fluoride)" },
  10: { electronConfig: "[He] 2s² 2p⁶",     phaseAtRTP: "gas",    boilingC: "−246.1", meltingC: "−248.6", commonUse: "Neon signs, lasers" },
  11: { electronConfig: "[Ne] 3s¹",          phaseAtRTP: "solid",  meltingC: "97.8",   boilingC: "883",    commonUse: "NaCl salt, sodium vapour lamps" },
  12: { electronConfig: "[Ne] 3s²",          phaseAtRTP: "solid",  meltingC: "650",    boilingC: "1090",   commonUse: "Alloys, chlorophyll, antacids" },
  13: { electronConfig: "[Ne] 3s² 3p¹",     phaseAtRTP: "solid",  meltingC: "660.3",  boilingC: "2519",   commonUse: "Aircraft, beverage cans, foil" },
  14: { electronConfig: "[Ne] 3s² 3p²",     phaseAtRTP: "solid",  meltingC: "1414",   boilingC: "2900",   commonUse: "Semiconductors, solar cells, glass" },
  15: { electronConfig: "[Ne] 3s² 3p³",     phaseAtRTP: "solid",  meltingC: "44.2",   boilingC: "280.5",  commonUse: "Fertilisers (phosphates), matches, DNA" },
  16: { electronConfig: "[Ne] 3s² 3p⁴",     phaseAtRTP: "solid",  meltingC: "115.2",  boilingC: "444.6",  commonUse: "Sulfuric acid production, rubber vulcanisation" },
  17: { electronConfig: "[Ne] 3s² 3p⁵",     phaseAtRTP: "gas",    boilingC: "−34.0",  meltingC: "−101.5", commonUse: "Water purification, PVC, bleach" },
  18: { electronConfig: "[Ne] 3s² 3p⁶",     phaseAtRTP: "gas",    boilingC: "−185.9", meltingC: "−189.4", commonUse: "Welding shield gas, light bulbs" },
  19: { electronConfig: "[Ar] 4s¹",          phaseAtRTP: "solid",  meltingC: "63.4",   boilingC: "759",    commonUse: "Fertilisers (K⁺), nerve signal transmission" },
  20: { electronConfig: "[Ar] 4s²",          phaseAtRTP: "solid",  meltingC: "842",    boilingC: "1484",   commonUse: "Bones, cement (CaO), chalk (CaCO₃)" },
  26: { electronConfig: "[Ar] 3d⁶ 4s²",     phaseAtRTP: "solid",  meltingC: "1538",   boilingC: "2861",   commonUse: "Steel, haemoglobin (Fe²⁺), catalysts" },
  29: { electronConfig: "[Ar] 3d¹⁰ 4s¹",    phaseAtRTP: "solid",  meltingC: "1084.6", boilingC: "2562",   commonUse: "Electrical wiring, plumbing, coins" },
  30: { electronConfig: "[Ar] 3d¹⁰ 4s²",    phaseAtRTP: "solid",  meltingC: "419.5",  boilingC: "907",    commonUse: "Galvanised steel, brass alloy, sunscreen" },
  47: { electronConfig: "[Kr] 4d¹⁰ 5s¹",    phaseAtRTP: "solid",  meltingC: "961.8",  boilingC: "2162",   commonUse: "Photography, jewellery, antimicrobial" },
  79: { electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s¹", phaseAtRTP: "solid", meltingC: "1064.2", boilingC: "2856", commonUse: "Currency, electronics, jewellery" },
  82: { electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²", phaseAtRTP: "solid", meltingC: "327.5", boilingC: "1749", commonUse: "Lead-acid batteries, radiation shielding" },
  35: { electronConfig: "[Ar] 3d¹⁰ 4s² 4p⁵", phaseAtRTP: "liquid", meltingC: "−7.2",  boilingC: "58.8",  commonUse: "Flame retardants, photography (AgBr)" },
  80: { electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s²", phaseAtRTP: "liquid", meltingC: "−38.8", boilingC: "356.7", commonUse: "Thermometers (historic), amalgams" },
  92: { electronConfig: "[Rn] 5f³ 6d¹ 7s²", phaseAtRTP: "solid",  meltingC: "1135",   boilingC: "4131",  commonUse: "Nuclear fuel (²³⁵U), DU armour piercing" },
};

export const CATEGORY_LABELS: Record<ElementCategory, string> = {
  "alkali-metal":          "Alkali Metal",
  "alkaline-earth":        "Alkaline Earth",
  "transition-metal":      "Transition Metal",
  "post-transition-metal": "Post-Transition Metal",
  "metalloid":             "Metalloid",
  "nonmetal":              "Nonmetal",
  "halogen":               "Halogen",
  "noble-gas":             "Noble Gas",
  "lanthanide":            "Lanthanide",
  "actinide":              "Actinide",
  "unknown":               "Unknown",
};

export const elements: ChemElement[] = [
  // ── Period 1 ──────────────────────────────────────────
  { number: 1,   symbol: "H",  name: "Hydrogen",      mass: "1.008",   category: "nonmetal",              row: 1, col: 1  },
  { number: 2,   symbol: "He", name: "Helium",         mass: "4.003",   category: "noble-gas",             row: 1, col: 18 },
  // ── Period 2 ──────────────────────────────────────────
  { number: 3,   symbol: "Li", name: "Lithium",        mass: "6.941",   category: "alkali-metal",          row: 2, col: 1  },
  { number: 4,   symbol: "Be", name: "Beryllium",      mass: "9.012",   category: "alkaline-earth",        row: 2, col: 2  },
  { number: 5,   symbol: "B",  name: "Boron",          mass: "10.81",   category: "metalloid",             row: 2, col: 13 },
  { number: 6,   symbol: "C",  name: "Carbon",         mass: "12.01",   category: "nonmetal",              row: 2, col: 14 },
  { number: 7,   symbol: "N",  name: "Nitrogen",       mass: "14.01",   category: "nonmetal",              row: 2, col: 15 },
  { number: 8,   symbol: "O",  name: "Oxygen",         mass: "16.00",   category: "nonmetal",              row: 2, col: 16 },
  { number: 9,   symbol: "F",  name: "Fluorine",       mass: "19.00",   category: "halogen",               row: 2, col: 17 },
  { number: 10,  symbol: "Ne", name: "Neon",           mass: "20.18",   category: "noble-gas",             row: 2, col: 18 },
  // ── Period 3 ──────────────────────────────────────────
  { number: 11,  symbol: "Na", name: "Sodium",         mass: "22.99",   category: "alkali-metal",          row: 3, col: 1  },
  { number: 12,  symbol: "Mg", name: "Magnesium",      mass: "24.31",   category: "alkaline-earth",        row: 3, col: 2  },
  { number: 13,  symbol: "Al", name: "Aluminum",       mass: "26.98",   category: "post-transition-metal", row: 3, col: 13 },
  { number: 14,  symbol: "Si", name: "Silicon",        mass: "28.09",   category: "metalloid",             row: 3, col: 14 },
  { number: 15,  symbol: "P",  name: "Phosphorus",     mass: "30.97",   category: "nonmetal",              row: 3, col: 15 },
  { number: 16,  symbol: "S",  name: "Sulfur",         mass: "32.07",   category: "nonmetal",              row: 3, col: 16 },
  { number: 17,  symbol: "Cl", name: "Chlorine",       mass: "35.45",   category: "halogen",               row: 3, col: 17 },
  { number: 18,  symbol: "Ar", name: "Argon",          mass: "39.95",   category: "noble-gas",             row: 3, col: 18 },
  // ── Period 4 ──────────────────────────────────────────
  { number: 19,  symbol: "K",  name: "Potassium",      mass: "39.10",   category: "alkali-metal",          row: 4, col: 1  },
  { number: 20,  symbol: "Ca", name: "Calcium",        mass: "40.08",   category: "alkaline-earth",        row: 4, col: 2  },
  { number: 21,  symbol: "Sc", name: "Scandium",       mass: "44.96",   category: "transition-metal",      row: 4, col: 3  },
  { number: 22,  symbol: "Ti", name: "Titanium",       mass: "47.87",   category: "transition-metal",      row: 4, col: 4  },
  { number: 23,  symbol: "V",  name: "Vanadium",       mass: "50.94",   category: "transition-metal",      row: 4, col: 5  },
  { number: 24,  symbol: "Cr", name: "Chromium",       mass: "52.00",   category: "transition-metal",      row: 4, col: 6  },
  { number: 25,  symbol: "Mn", name: "Manganese",      mass: "54.94",   category: "transition-metal",      row: 4, col: 7  },
  { number: 26,  symbol: "Fe", name: "Iron",           mass: "55.85",   category: "transition-metal",      row: 4, col: 8  },
  { number: 27,  symbol: "Co", name: "Cobalt",         mass: "58.93",   category: "transition-metal",      row: 4, col: 9  },
  { number: 28,  symbol: "Ni", name: "Nickel",         mass: "58.69",   category: "transition-metal",      row: 4, col: 10 },
  { number: 29,  symbol: "Cu", name: "Copper",         mass: "63.55",   category: "transition-metal",      row: 4, col: 11 },
  { number: 30,  symbol: "Zn", name: "Zinc",           mass: "65.38",   category: "transition-metal",      row: 4, col: 12 },
  { number: 31,  symbol: "Ga", name: "Gallium",        mass: "69.72",   category: "post-transition-metal", row: 4, col: 13 },
  { number: 32,  symbol: "Ge", name: "Germanium",      mass: "72.63",   category: "metalloid",             row: 4, col: 14 },
  { number: 33,  symbol: "As", name: "Arsenic",        mass: "74.92",   category: "metalloid",             row: 4, col: 15 },
  { number: 34,  symbol: "Se", name: "Selenium",       mass: "78.97",   category: "nonmetal",              row: 4, col: 16 },
  { number: 35,  symbol: "Br", name: "Bromine",        mass: "79.90",   category: "halogen",               row: 4, col: 17 },
  { number: 36,  symbol: "Kr", name: "Krypton",        mass: "83.80",   category: "noble-gas",             row: 4, col: 18 },
  // ── Period 5 ──────────────────────────────────────────
  { number: 37,  symbol: "Rb", name: "Rubidium",       mass: "85.47",   category: "alkali-metal",          row: 5, col: 1  },
  { number: 38,  symbol: "Sr", name: "Strontium",      mass: "87.62",   category: "alkaline-earth",        row: 5, col: 2  },
  { number: 39,  symbol: "Y",  name: "Yttrium",        mass: "88.91",   category: "transition-metal",      row: 5, col: 3  },
  { number: 40,  symbol: "Zr", name: "Zirconium",      mass: "91.22",   category: "transition-metal",      row: 5, col: 4  },
  { number: 41,  symbol: "Nb", name: "Niobium",        mass: "92.91",   category: "transition-metal",      row: 5, col: 5  },
  { number: 42,  symbol: "Mo", name: "Molybdenum",     mass: "95.96",   category: "transition-metal",      row: 5, col: 6  },
  { number: 43,  symbol: "Tc", name: "Technetium",     mass: "(98)",    category: "transition-metal",      row: 5, col: 7  },
  { number: 44,  symbol: "Ru", name: "Ruthenium",      mass: "101.1",   category: "transition-metal",      row: 5, col: 8  },
  { number: 45,  symbol: "Rh", name: "Rhodium",        mass: "102.9",   category: "transition-metal",      row: 5, col: 9  },
  { number: 46,  symbol: "Pd", name: "Palladium",      mass: "106.4",   category: "transition-metal",      row: 5, col: 10 },
  { number: 47,  symbol: "Ag", name: "Silver",         mass: "107.9",   category: "transition-metal",      row: 5, col: 11 },
  { number: 48,  symbol: "Cd", name: "Cadmium",        mass: "112.4",   category: "transition-metal",      row: 5, col: 12 },
  { number: 49,  symbol: "In", name: "Indium",         mass: "114.8",   category: "post-transition-metal", row: 5, col: 13 },
  { number: 50,  symbol: "Sn", name: "Tin",            mass: "118.7",   category: "post-transition-metal", row: 5, col: 14 },
  { number: 51,  symbol: "Sb", name: "Antimony",       mass: "121.8",   category: "metalloid",             row: 5, col: 15 },
  { number: 52,  symbol: "Te", name: "Tellurium",      mass: "127.6",   category: "metalloid",             row: 5, col: 16 },
  { number: 53,  symbol: "I",  name: "Iodine",         mass: "126.9",   category: "halogen",               row: 5, col: 17 },
  { number: 54,  symbol: "Xe", name: "Xenon",          mass: "131.3",   category: "noble-gas",             row: 5, col: 18 },
  // ── Period 6 (main) ───────────────────────────────────
  { number: 55,  symbol: "Cs", name: "Cesium",         mass: "132.9",   category: "alkali-metal",          row: 6, col: 1  },
  { number: 56,  symbol: "Ba", name: "Barium",         mass: "137.3",   category: "alkaline-earth",        row: 6, col: 2  },
  // col 3 = placeholder (57–71)
  { number: 72,  symbol: "Hf", name: "Hafnium",        mass: "178.5",   category: "transition-metal",      row: 6, col: 4  },
  { number: 73,  symbol: "Ta", name: "Tantalum",       mass: "180.9",   category: "transition-metal",      row: 6, col: 5  },
  { number: 74,  symbol: "W",  name: "Tungsten",       mass: "183.8",   category: "transition-metal",      row: 6, col: 6  },
  { number: 75,  symbol: "Re", name: "Rhenium",        mass: "186.2",   category: "transition-metal",      row: 6, col: 7  },
  { number: 76,  symbol: "Os", name: "Osmium",         mass: "190.2",   category: "transition-metal",      row: 6, col: 8  },
  { number: 77,  symbol: "Ir", name: "Iridium",        mass: "192.2",   category: "transition-metal",      row: 6, col: 9  },
  { number: 78,  symbol: "Pt", name: "Platinum",       mass: "195.1",   category: "transition-metal",      row: 6, col: 10 },
  { number: 79,  symbol: "Au", name: "Gold",           mass: "197.0",   category: "transition-metal",      row: 6, col: 11 },
  { number: 80,  symbol: "Hg", name: "Mercury",        mass: "200.6",   category: "transition-metal",      row: 6, col: 12 },
  { number: 81,  symbol: "Tl", name: "Thallium",       mass: "204.4",   category: "post-transition-metal", row: 6, col: 13 },
  { number: 82,  symbol: "Pb", name: "Lead",           mass: "207.2",   category: "post-transition-metal", row: 6, col: 14 },
  { number: 83,  symbol: "Bi", name: "Bismuth",        mass: "209.0",   category: "post-transition-metal", row: 6, col: 15 },
  { number: 84,  symbol: "Po", name: "Polonium",       mass: "(209)",   category: "post-transition-metal", row: 6, col: 16 },
  { number: 85,  symbol: "At", name: "Astatine",       mass: "(210)",   category: "halogen",               row: 6, col: 17 },
  { number: 86,  symbol: "Rn", name: "Radon",          mass: "(222)",   category: "noble-gas",             row: 6, col: 18 },
  // ── Period 7 (main) ───────────────────────────────────
  { number: 87,  symbol: "Fr", name: "Francium",       mass: "(223)",   category: "alkali-metal",          row: 7, col: 1  },
  { number: 88,  symbol: "Ra", name: "Radium",         mass: "(226)",   category: "alkaline-earth",        row: 7, col: 2  },
  // col 3 = placeholder (89–103)
  { number: 104, symbol: "Rf", name: "Rutherfordium",  mass: "(267)",   category: "transition-metal",      row: 7, col: 4  },
  { number: 105, symbol: "Db", name: "Dubnium",        mass: "(268)",   category: "transition-metal",      row: 7, col: 5  },
  { number: 106, symbol: "Sg", name: "Seaborgium",     mass: "(271)",   category: "transition-metal",      row: 7, col: 6  },
  { number: 107, symbol: "Bh", name: "Bohrium",        mass: "(272)",   category: "transition-metal",      row: 7, col: 7  },
  { number: 108, symbol: "Hs", name: "Hassium",        mass: "(270)",   category: "transition-metal",      row: 7, col: 8  },
  { number: 109, symbol: "Mt", name: "Meitnerium",     mass: "(276)",   category: "unknown",               row: 7, col: 9  },
  { number: 110, symbol: "Ds", name: "Darmstadtium",   mass: "(281)",   category: "unknown",               row: 7, col: 10 },
  { number: 111, symbol: "Rg", name: "Roentgenium",    mass: "(280)",   category: "unknown",               row: 7, col: 11 },
  { number: 112, symbol: "Cn", name: "Copernicium",    mass: "(285)",   category: "transition-metal",      row: 7, col: 12 },
  { number: 113, symbol: "Nh", name: "Nihonium",       mass: "(284)",   category: "unknown",               row: 7, col: 13 },
  { number: 114, symbol: "Fl", name: "Flerovium",      mass: "(289)",   category: "unknown",               row: 7, col: 14 },
  { number: 115, symbol: "Mc", name: "Moscovium",      mass: "(288)",   category: "unknown",               row: 7, col: 15 },
  { number: 116, symbol: "Lv", name: "Livermorium",    mass: "(293)",   category: "unknown",               row: 7, col: 16 },
  { number: 117, symbol: "Ts", name: "Tennessine",     mass: "(294)",   category: "unknown",               row: 7, col: 17 },
  { number: 118, symbol: "Og", name: "Oganesson",      mass: "(294)",   category: "unknown",               row: 7, col: 18 },
  // ── Lanthanides (row 8, cols 3–17) ───────────────────
  { number: 57,  symbol: "La", name: "Lanthanum",      mass: "138.9",   category: "lanthanide",            row: 8, col: 3  },
  { number: 58,  symbol: "Ce", name: "Cerium",         mass: "140.1",   category: "lanthanide",            row: 8, col: 4  },
  { number: 59,  symbol: "Pr", name: "Praseodymium",   mass: "140.9",   category: "lanthanide",            row: 8, col: 5  },
  { number: 60,  symbol: "Nd", name: "Neodymium",      mass: "144.2",   category: "lanthanide",            row: 8, col: 6  },
  { number: 61,  symbol: "Pm", name: "Promethium",     mass: "(145)",   category: "lanthanide",            row: 8, col: 7  },
  { number: 62,  symbol: "Sm", name: "Samarium",       mass: "150.4",   category: "lanthanide",            row: 8, col: 8  },
  { number: 63,  symbol: "Eu", name: "Europium",       mass: "152.0",   category: "lanthanide",            row: 8, col: 9  },
  { number: 64,  symbol: "Gd", name: "Gadolinium",     mass: "157.3",   category: "lanthanide",            row: 8, col: 10 },
  { number: 65,  symbol: "Tb", name: "Terbium",        mass: "158.9",   category: "lanthanide",            row: 8, col: 11 },
  { number: 66,  symbol: "Dy", name: "Dysprosium",     mass: "162.5",   category: "lanthanide",            row: 8, col: 12 },
  { number: 67,  symbol: "Ho", name: "Holmium",        mass: "164.9",   category: "lanthanide",            row: 8, col: 13 },
  { number: 68,  symbol: "Er", name: "Erbium",         mass: "167.3",   category: "lanthanide",            row: 8, col: 14 },
  { number: 69,  symbol: "Tm", name: "Thulium",        mass: "168.9",   category: "lanthanide",            row: 8, col: 15 },
  { number: 70,  symbol: "Yb", name: "Ytterbium",      mass: "173.0",   category: "lanthanide",            row: 8, col: 16 },
  { number: 71,  symbol: "Lu", name: "Lutetium",       mass: "175.0",   category: "lanthanide",            row: 8, col: 17 },
  // ── Actinides (row 9, cols 3–17) ─────────────────────
  { number: 89,  symbol: "Ac", name: "Actinium",       mass: "(227)",   category: "actinide",              row: 9, col: 3  },
  { number: 90,  symbol: "Th", name: "Thorium",        mass: "232.0",   category: "actinide",              row: 9, col: 4  },
  { number: 91,  symbol: "Pa", name: "Protactinium",   mass: "231.0",   category: "actinide",              row: 9, col: 5  },
  { number: 92,  symbol: "U",  name: "Uranium",        mass: "238.0",   category: "actinide",              row: 9, col: 6  },
  { number: 93,  symbol: "Np", name: "Neptunium",      mass: "(237)",   category: "actinide",              row: 9, col: 7  },
  { number: 94,  symbol: "Pu", name: "Plutonium",      mass: "(244)",   category: "actinide",              row: 9, col: 8  },
  { number: 95,  symbol: "Am", name: "Americium",      mass: "(243)",   category: "actinide",              row: 9, col: 9  },
  { number: 96,  symbol: "Cm", name: "Curium",         mass: "(247)",   category: "actinide",              row: 9, col: 10 },
  { number: 97,  symbol: "Bk", name: "Berkelium",      mass: "(247)",   category: "actinide",              row: 9, col: 11 },
  { number: 98,  symbol: "Cf", name: "Californium",    mass: "(251)",   category: "actinide",              row: 9, col: 12 },
  { number: 99,  symbol: "Es", name: "Einsteinium",    mass: "(252)",   category: "actinide",              row: 9, col: 13 },
  { number: 100, symbol: "Fm", name: "Fermium",        mass: "(257)",   category: "actinide",              row: 9, col: 14 },
  { number: 101, symbol: "Md", name: "Mendelevium",    mass: "(258)",   category: "actinide",              row: 9, col: 15 },
  { number: 102, symbol: "No", name: "Nobelium",       mass: "(259)",   category: "actinide",              row: 9, col: 16 },
  { number: 103, symbol: "Lr", name: "Lawrencium",     mass: "(262)",   category: "actinide",              row: 9, col: 17 },
];

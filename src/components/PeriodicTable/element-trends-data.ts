// Periodic trend property values per element.
// Sources: NIST, WebElements, CRC Handbook.
// Units: atomicRadius (pm), electronegativity (Pauling), ionizationEnergy (kJ/mol, first),
//         electronAffinity (kJ/mol), density (g/cm³), meltingPointK (K), boilingPointK (K)

export type TrendProperty =
  | "atomicRadius"
  | "electronegativity"
  | "ionizationEnergy"
  | "electronAffinity"
  | "density"
  | "meltingPointK"
  | "boilingPointK"
  | "atomicMass";

export interface TrendConfig {
  label: string;
  unit: string;
  description: string;
  trendExplanation: string;
  periodTrend: "increases" | "decreases";
  groupTrend: "increases" | "decreases";
  icon: string;
}

export const TREND_CONFIGS: Record<TrendProperty, TrendConfig> = {
  atomicRadius: {
    label: "Atomic Radius",
    unit: "pm",
    description: "Distance from nucleus to outermost electron shell",
    trendExplanation:
      "Decreases left→right across a period (increasing nuclear charge pulls electrons closer). Increases top→bottom down a group (new principal shells are added, pushing electrons further from the nucleus).",
    periodTrend: "decreases",
    groupTrend: "increases",
    icon: "⬤",
  },
  electronegativity: {
    label: "Electronegativity",
    unit: "Pauling",
    description: "Tendency of an atom to attract bonding electrons toward itself",
    trendExplanation:
      "Increases left→right across a period (more protons pull shared electrons closer). Decreases top→bottom down a group (valence electrons are further from the nucleus and better shielded). Fluorine (3.98) is the most electronegative element.",
    periodTrend: "increases",
    groupTrend: "decreases",
    icon: "⚡",
  },
  ionizationEnergy: {
    label: "Ionization Energy",
    unit: "kJ/mol",
    description: "Energy required to remove the outermost electron from a gaseous atom",
    trendExplanation:
      "Generally increases left→right (electrons are held more tightly as nuclear charge increases). Decreases top→bottom (outer electrons are farther from the nucleus and more shielded by inner electrons). Noble gases have the highest values; alkali metals the lowest.",
    periodTrend: "increases",
    groupTrend: "decreases",
    icon: "⚛️",
  },
  electronAffinity: {
    label: "Electron Affinity",
    unit: "kJ/mol",
    description: "Energy released when a neutral atom gains one electron",
    trendExplanation:
      "Halogens have the highest electron affinities—they need just one electron to complete their outer shell. Noble gases and alkaline-earth metals have negative values (they resist gaining electrons). Generally increases across a period and decreases down a group.",
    periodTrend: "increases",
    groupTrend: "decreases",
    icon: "➕",
  },
  density: {
    label: "Density",
    unit: "g/cm³",
    description: "Mass per unit volume at standard conditions (STP)",
    trendExplanation:
      "No simple periodic trend. Transition metals in periods 5–6 (Os, Ir, Pt, Re) are the densest (~22 g/cm³). Alkali metals and gases are least dense. Density peaks mid-period in the d-block due to increasing atomic mass and decreasing atomic radius.",
    periodTrend: "increases",
    groupTrend: "increases",
    icon: "⚖️",
  },
  meltingPointK: {
    label: "Melting Point",
    unit: "K",
    description: "Temperature at which solid becomes liquid at 1 atm",
    trendExplanation:
      "Peaks at group 6 in each period (W: 3695 K, the highest of any element). Alkali metals melt well below 400 K. Noble gases have extremely low melting points. High values indicate strong metallic or covalent bonding; low values indicate weak intermolecular forces.",
    periodTrend: "increases",
    groupTrend: "decreases",
    icon: "🌡️",
  },
  boilingPointK: {
    label: "Boiling Point",
    unit: "K",
    description: "Temperature at which liquid becomes gas at 1 atm",
    trendExplanation:
      "Mirrors melting-point trends broadly. Rhenium (5869 K) and tungsten (5828 K) have the highest boiling points. Noble gases and hydrogen have the lowest. Strong metallic bonding in transition metals leads to very high boiling points.",
    periodTrend: "increases",
    groupTrend: "decreases",
    icon: "💧",
  },
  atomicMass: {
    label: "Atomic Mass",
    unit: "u",
    description: "Weighted average mass of naturally-occurring isotopes",
    trendExplanation:
      "Increases continuously across the entire periodic table with atomic number. Roughly twice the atomic number for most lighter elements. Heavier nuclei accumulate more neutrons proportionally—uranium (238 u) has 92 protons but 146 neutrons.",
    periodTrend: "increases",
    groupTrend: "increases",
    icon: "⚖️",
  },
};

export interface ElementTrendValues {
  atomicRadius?: number;
  electronegativity?: number;
  ionizationEnergy?: number;
  electronAffinity?: number;
  density?: number;
  meltingPointK?: number;
  boilingPointK?: number;
}

export const ELEMENT_TRENDS: Record<number, ElementTrendValues> = {
  1:   { atomicRadius: 53,  electronegativity: 2.20, ionizationEnergy: 1312, electronAffinity: 72.8,   density: 0.0000899, meltingPointK: 14,    boilingPointK: 20    },
  2:   { atomicRadius: 31,                           ionizationEnergy: 2372, electronAffinity: -48,    density: 0.0001785, meltingPointK: 0.95,  boilingPointK: 4.2   },
  3:   { atomicRadius: 167, electronegativity: 0.98, ionizationEnergy: 520,  electronAffinity: 59.6,   density: 0.534,     meltingPointK: 454,   boilingPointK: 1615  },
  4:   { atomicRadius: 112, electronegativity: 1.57, ionizationEnergy: 900,  electronAffinity: -48,    density: 1.85,      meltingPointK: 1560,  boilingPointK: 2742  },
  5:   { atomicRadius: 87,  electronegativity: 2.04, ionizationEnergy: 800,  electronAffinity: 26.7,   density: 2.34,      meltingPointK: 2348,  boilingPointK: 4273  },
  6:   { atomicRadius: 67,  electronegativity: 2.55, ionizationEnergy: 1086, electronAffinity: 121.8,  density: 2.26,      meltingPointK: 3823,  boilingPointK: 4098  },
  7:   { atomicRadius: 56,  electronegativity: 3.04, ionizationEnergy: 1402, electronAffinity: -7.0,   density: 0.00125,   meltingPointK: 63,    boilingPointK: 77    },
  8:   { atomicRadius: 48,  electronegativity: 3.44, ionizationEnergy: 1314, electronAffinity: 141.0,  density: 0.00143,   meltingPointK: 54,    boilingPointK: 90    },
  9:   { atomicRadius: 42,  electronegativity: 3.98, ionizationEnergy: 1681, electronAffinity: 328.0,  density: 0.00170,   meltingPointK: 53,    boilingPointK: 85    },
  10:  { atomicRadius: 38,                           ionizationEnergy: 2081, electronAffinity: -116,   density: 0.000900,  meltingPointK: 25,    boilingPointK: 27    },
  11:  { atomicRadius: 190, electronegativity: 0.93, ionizationEnergy: 496,  electronAffinity: 52.8,   density: 0.968,     meltingPointK: 371,   boilingPointK: 1156  },
  12:  { atomicRadius: 145, electronegativity: 1.31, ionizationEnergy: 738,  electronAffinity: -40,    density: 1.74,      meltingPointK: 923,   boilingPointK: 1363  },
  13:  { atomicRadius: 118, electronegativity: 1.61, ionizationEnergy: 578,  electronAffinity: 42.5,   density: 2.70,      meltingPointK: 933,   boilingPointK: 2792  },
  14:  { atomicRadius: 111, electronegativity: 1.90, ionizationEnergy: 786,  electronAffinity: 133.6,  density: 2.33,      meltingPointK: 1687,  boilingPointK: 3538  },
  15:  { atomicRadius: 98,  electronegativity: 2.19, ionizationEnergy: 1012, electronAffinity: 72.0,   density: 1.82,      meltingPointK: 317,   boilingPointK: 553   },
  16:  { atomicRadius: 88,  electronegativity: 2.58, ionizationEnergy: 1000, electronAffinity: 200.0,  density: 2.07,      meltingPointK: 388,   boilingPointK: 718   },
  17:  { atomicRadius: 79,  electronegativity: 3.16, ionizationEnergy: 1251, electronAffinity: 349.0,  density: 0.00317,   meltingPointK: 172,   boilingPointK: 239   },
  18:  { atomicRadius: 71,                           ionizationEnergy: 1521, electronAffinity: -96,    density: 0.00178,   meltingPointK: 84,    boilingPointK: 87    },
  19:  { atomicRadius: 243, electronegativity: 0.82, ionizationEnergy: 419,  electronAffinity: 48.4,   density: 0.862,     meltingPointK: 337,   boilingPointK: 1032  },
  20:  { atomicRadius: 194, electronegativity: 1.00, ionizationEnergy: 590,  electronAffinity: 2.4,    density: 1.54,      meltingPointK: 1115,  boilingPointK: 1757  },
  21:  { atomicRadius: 184, electronegativity: 1.36, ionizationEnergy: 633,  electronAffinity: 18.1,   density: 2.99,      meltingPointK: 1814,  boilingPointK: 3109  },
  22:  { atomicRadius: 176, electronegativity: 1.54, ionizationEnergy: 659,  electronAffinity: 7.6,    density: 4.54,      meltingPointK: 1941,  boilingPointK: 3560  },
  23:  { atomicRadius: 171, electronegativity: 1.63, ionizationEnergy: 651,  electronAffinity: 50.6,   density: 6.11,      meltingPointK: 2183,  boilingPointK: 3680  },
  24:  { atomicRadius: 166, electronegativity: 1.66, ionizationEnergy: 653,  electronAffinity: 64.3,   density: 7.15,      meltingPointK: 2180,  boilingPointK: 2944  },
  25:  { atomicRadius: 161, electronegativity: 1.55, ionizationEnergy: 717,  electronAffinity: -50,    density: 7.44,      meltingPointK: 1519,  boilingPointK: 2334  },
  26:  { atomicRadius: 156, electronegativity: 1.83, ionizationEnergy: 762,  electronAffinity: 15.7,   density: 7.87,      meltingPointK: 1811,  boilingPointK: 3134  },
  27:  { atomicRadius: 152, electronegativity: 1.88, ionizationEnergy: 760,  electronAffinity: 63.7,   density: 8.90,      meltingPointK: 1768,  boilingPointK: 3200  },
  28:  { atomicRadius: 149, electronegativity: 1.91, ionizationEnergy: 737,  electronAffinity: 111.7,  density: 8.90,      meltingPointK: 1728,  boilingPointK: 3186  },
  29:  { atomicRadius: 145, electronegativity: 1.90, ionizationEnergy: 745,  electronAffinity: 118.4,  density: 8.96,      meltingPointK: 1358,  boilingPointK: 2835  },
  30:  { atomicRadius: 142, electronegativity: 1.65, ionizationEnergy: 906,  electronAffinity: -58,    density: 7.13,      meltingPointK: 693,   boilingPointK: 1180  },
  31:  { atomicRadius: 136, electronegativity: 1.81, ionizationEnergy: 579,  electronAffinity: 28.9,   density: 5.91,      meltingPointK: 303,   boilingPointK: 2477  },
  32:  { atomicRadius: 125, electronegativity: 2.01, ionizationEnergy: 762,  electronAffinity: 118.9,  density: 5.32,      meltingPointK: 1211,  boilingPointK: 3106  },
  33:  { atomicRadius: 114, electronegativity: 2.18, ionizationEnergy: 947,  electronAffinity: 78.0,   density: 5.73,      meltingPointK: 1090,  boilingPointK: 887   },
  34:  { atomicRadius: 103, electronegativity: 2.55, ionizationEnergy: 941,  electronAffinity: 195.0,  density: 4.81,      meltingPointK: 494,   boilingPointK: 958   },
  35:  { atomicRadius: 94,  electronegativity: 2.96, ionizationEnergy: 1140, electronAffinity: 324.6,  density: 3.12,      meltingPointK: 266,   boilingPointK: 332   },
  36:  { atomicRadius: 88,  electronegativity: 3.00, ionizationEnergy: 1351, electronAffinity: -96,    density: 0.00374,   meltingPointK: 116,   boilingPointK: 120   },
  37:  { atomicRadius: 265, electronegativity: 0.82, ionizationEnergy: 403,  electronAffinity: 46.9,   density: 1.53,      meltingPointK: 312,   boilingPointK: 961   },
  38:  { atomicRadius: 219, electronegativity: 0.95, ionizationEnergy: 550,  electronAffinity: 5.0,    density: 2.64,      meltingPointK: 1050,  boilingPointK: 1655  },
  39:  { atomicRadius: 212, electronegativity: 1.22, ionizationEnergy: 600,  electronAffinity: 29.6,   density: 4.47,      meltingPointK: 1799,  boilingPointK: 3609  },
  40:  { atomicRadius: 206, electronegativity: 1.33, ionizationEnergy: 640,  electronAffinity: 41.1,   density: 6.52,      meltingPointK: 2128,  boilingPointK: 4682  },
  41:  { atomicRadius: 198, electronegativity: 1.60, ionizationEnergy: 652,  electronAffinity: 88.5,   density: 8.57,      meltingPointK: 2750,  boilingPointK: 5017  },
  42:  { atomicRadius: 190, electronegativity: 2.16, ionizationEnergy: 684,  electronAffinity: 72.1,   density: 10.28,     meltingPointK: 2896,  boilingPointK: 4912  },
  43:  { atomicRadius: 183, electronegativity: 1.90, ionizationEnergy: 702,  electronAffinity: 53.0,   density: 11.0,      meltingPointK: 2430,  boilingPointK: 4538  },
  44:  { atomicRadius: 178, electronegativity: 2.20, ionizationEnergy: 711,  electronAffinity: 100.8,  density: 12.37,     meltingPointK: 2607,  boilingPointK: 4423  },
  45:  { atomicRadius: 173, electronegativity: 2.28, ionizationEnergy: 720,  electronAffinity: 109.7,  density: 12.41,     meltingPointK: 2237,  boilingPointK: 3968  },
  46:  { atomicRadius: 169, electronegativity: 2.20, ionizationEnergy: 804,  electronAffinity: 53.7,   density: 12.02,     meltingPointK: 1828,  boilingPointK: 3236  },
  47:  { atomicRadius: 165, electronegativity: 1.93, ionizationEnergy: 731,  electronAffinity: 125.6,  density: 10.50,     meltingPointK: 1235,  boilingPointK: 2435  },
  48:  { atomicRadius: 161, electronegativity: 1.69, ionizationEnergy: 868,  electronAffinity: -68,    density: 8.65,      meltingPointK: 594,   boilingPointK: 1040  },
  49:  { atomicRadius: 156, electronegativity: 1.78, ionizationEnergy: 558,  electronAffinity: 29.0,   density: 7.31,      meltingPointK: 430,   boilingPointK: 2345  },
  50:  { atomicRadius: 145, electronegativity: 1.96, ionizationEnergy: 709,  electronAffinity: 107.3,  density: 7.29,      meltingPointK: 505,   boilingPointK: 2875  },
  51:  { atomicRadius: 133, electronegativity: 2.05, ionizationEnergy: 833,  electronAffinity: 103.2,  density: 6.68,      meltingPointK: 904,   boilingPointK: 1860  },
  52:  { atomicRadius: 123, electronegativity: 2.10, ionizationEnergy: 869,  electronAffinity: 190.2,  density: 6.24,      meltingPointK: 723,   boilingPointK: 1261  },
  53:  { atomicRadius: 115, electronegativity: 2.66, ionizationEnergy: 1008, electronAffinity: 295.2,  density: 4.93,      meltingPointK: 387,   boilingPointK: 457   },
  54:  { atomicRadius: 108, electronegativity: 2.60, ionizationEnergy: 1170, electronAffinity: -77,    density: 0.00589,   meltingPointK: 161,   boilingPointK: 165   },
  55:  { atomicRadius: 298, electronegativity: 0.79, ionizationEnergy: 376,  electronAffinity: 45.5,   density: 1.93,      meltingPointK: 302,   boilingPointK: 944   },
  56:  { atomicRadius: 253, electronegativity: 0.89, ionizationEnergy: 503,  electronAffinity: 13.9,   density: 3.59,      meltingPointK: 1000,  boilingPointK: 2170  },
  57:  { atomicRadius: 250, electronegativity: 1.10, ionizationEnergy: 538,  electronAffinity: 48.0,   density: 6.15,      meltingPointK: 1193,  boilingPointK: 3737  },
  58:  { atomicRadius: 248, electronegativity: 1.12, ionizationEnergy: 534,  electronAffinity: 50.0,   density: 6.77,      meltingPointK: 1071,  boilingPointK: 3716  },
  59:  { atomicRadius: 247, electronegativity: 1.13, ionizationEnergy: 527,  electronAffinity: 50.0,   density: 6.77,      meltingPointK: 1204,  boilingPointK: 3793  },
  60:  { atomicRadius: 206, electronegativity: 1.14, ionizationEnergy: 533,  electronAffinity: 50.0,   density: 7.01,      meltingPointK: 1294,  boilingPointK: 3347  },
  61:  { atomicRadius: 205, electronegativity: 1.13, ionizationEnergy: 540,  electronAffinity: 50.0,   density: 7.26,      meltingPointK: 1315,  boilingPointK: 3273  },
  62:  { atomicRadius: 238, electronegativity: 1.17, ionizationEnergy: 545,  electronAffinity: 50.0,   density: 7.52,      meltingPointK: 1345,  boilingPointK: 2067  },
  63:  { atomicRadius: 231, electronegativity: 1.20, ionizationEnergy: 547,  electronAffinity: 50.0,   density: 5.24,      meltingPointK: 1095,  boilingPointK: 1802  },
  64:  { atomicRadius: 233, electronegativity: 1.20, ionizationEnergy: 593,  electronAffinity: 50.0,   density: 7.90,      meltingPointK: 1586,  boilingPointK: 3546  },
  65:  { atomicRadius: 225, electronegativity: 1.10, ionizationEnergy: 566,  electronAffinity: 50.0,   density: 8.23,      meltingPointK: 1629,  boilingPointK: 3503  },
  66:  { atomicRadius: 228, electronegativity: 1.22, ionizationEnergy: 573,  electronAffinity: 50.0,   density: 8.55,      meltingPointK: 1685,  boilingPointK: 2840  },
  67:  { atomicRadius: 226, electronegativity: 1.23, ionizationEnergy: 581,  electronAffinity: 50.0,   density: 8.80,      meltingPointK: 1747,  boilingPointK: 2973  },
  68:  { atomicRadius: 226, electronegativity: 1.24, ionizationEnergy: 589,  electronAffinity: 50.0,   density: 9.07,      meltingPointK: 1802,  boilingPointK: 3141  },
  69:  { atomicRadius: 222, electronegativity: 1.25, ionizationEnergy: 597,  electronAffinity: 50.0,   density: 9.32,      meltingPointK: 1818,  boilingPointK: 2223  },
  70:  { atomicRadius: 222, electronegativity: 1.10, ionizationEnergy: 603,  electronAffinity: 50.0,   density: 6.90,      meltingPointK: 1092,  boilingPointK: 1469  },
  71:  { atomicRadius: 217, electronegativity: 1.27, ionizationEnergy: 524,  electronAffinity: 50.0,   density: 9.84,      meltingPointK: 1936,  boilingPointK: 3675  },
  72:  { atomicRadius: 208, electronegativity: 1.30, ionizationEnergy: 659,  electronAffinity: 0.0,    density: 13.31,     meltingPointK: 2506,  boilingPointK: 4876  },
  73:  { atomicRadius: 200, electronegativity: 1.50, ionizationEnergy: 761,  electronAffinity: 31.0,   density: 16.65,     meltingPointK: 3290,  boilingPointK: 5731  },
  74:  { atomicRadius: 193, electronegativity: 2.36, ionizationEnergy: 770,  electronAffinity: 78.6,   density: 19.25,     meltingPointK: 3695,  boilingPointK: 5828  },
  75:  { atomicRadius: 188, electronegativity: 1.90, ionizationEnergy: 760,  electronAffinity: 14.5,   density: 21.02,     meltingPointK: 3459,  boilingPointK: 5869  },
  76:  { atomicRadius: 185, electronegativity: 2.20, ionizationEnergy: 840,  electronAffinity: 106.1,  density: 22.59,     meltingPointK: 3306,  boilingPointK: 5285  },
  77:  { atomicRadius: 180, electronegativity: 2.20, ionizationEnergy: 880,  electronAffinity: 151.0,  density: 22.56,     meltingPointK: 2719,  boilingPointK: 4701  },
  78:  { atomicRadius: 177, electronegativity: 2.28, ionizationEnergy: 870,  electronAffinity: 205.3,  density: 21.45,     meltingPointK: 2041,  boilingPointK: 4098  },
  79:  { atomicRadius: 174, electronegativity: 2.54, ionizationEnergy: 890,  electronAffinity: 222.8,  density: 19.30,     meltingPointK: 1337,  boilingPointK: 3129  },
  80:  { atomicRadius: 171, electronegativity: 2.00, ionizationEnergy: 1007, electronAffinity: -48,    density: 13.53,     meltingPointK: 234,   boilingPointK: 630   },
  81:  { atomicRadius: 156, electronegativity: 1.62, ionizationEnergy: 589,  electronAffinity: 19.2,   density: 11.85,     meltingPointK: 577,   boilingPointK: 1746  },
  82:  { atomicRadius: 154, electronegativity: 2.33, ionizationEnergy: 716,  electronAffinity: 35.1,   density: 11.34,     meltingPointK: 601,   boilingPointK: 2022  },
  83:  { atomicRadius: 143, electronegativity: 2.02, ionizationEnergy: 703,  electronAffinity: 91.2,   density: 9.78,      meltingPointK: 544,   boilingPointK: 1837  },
  84:  { atomicRadius: 135, electronegativity: 2.00, ionizationEnergy: 812,  electronAffinity: 183.3,  density: 9.20,      meltingPointK: 527,   boilingPointK: 1235  },
  85:  { atomicRadius: 127, electronegativity: 2.20, ionizationEnergy: 920,  electronAffinity: 270.1,  density: 7.0,       meltingPointK: 575,   boilingPointK: 610   },
  86:  { atomicRadius: 120, electronegativity: 2.20, ionizationEnergy: 1037, electronAffinity: -68,    density: 0.00973,   meltingPointK: 202,   boilingPointK: 211   },
  87:  { atomicRadius: 348, electronegativity: 0.70, ionizationEnergy: 380,                            density: 1.87,      meltingPointK: 300,   boilingPointK: 950   },
  88:  { atomicRadius: 283, electronegativity: 0.90, ionizationEnergy: 509,                            density: 5.50,      meltingPointK: 973,   boilingPointK: 2010  },
  89:  { atomicRadius: 260, electronegativity: 1.10, ionizationEnergy: 499,                            density: 10.07,     meltingPointK: 1323,  boilingPointK: 3471  },
  90:  { atomicRadius: 237, electronegativity: 1.30, ionizationEnergy: 587,  electronAffinity: 112.4,  density: 11.72,     meltingPointK: 2115,  boilingPointK: 5061  },
  91:  { atomicRadius: 243, electronegativity: 1.50, ionizationEnergy: 568,                            density: 15.37,     meltingPointK: 1841,  boilingPointK: 4300  },
  92:  { atomicRadius: 196, electronegativity: 1.38, ionizationEnergy: 598,  electronAffinity: 50.0,   density: 19.10,     meltingPointK: 1408,  boilingPointK: 4404  },
  93:  { atomicRadius: 190, electronegativity: 1.36, ionizationEnergy: 605,                            density: 20.45,     meltingPointK: 910,   boilingPointK: 4175  },
  94:  { atomicRadius: 187, electronegativity: 1.28, ionizationEnergy: 585,                            density: 19.84,     meltingPointK: 913,   boilingPointK: 3505  },
  95:  { atomicRadius: 180,                          ionizationEnergy: 578,                            density: 13.67,     meltingPointK: 1449,  boilingPointK: 2880  },
  96:  { atomicRadius: 169,                          ionizationEnergy: 581,                            density: 13.51,     meltingPointK: 1613,  boilingPointK: 3383  },
};

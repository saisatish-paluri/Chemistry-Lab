// Extended element data: isotopes, chemistry properties, history/discovery,
// lab experiment links, and AI-style learning content.

// ── Isotope Explorer ──────────────────────────────────────────────────────────

export interface Isotope {
  mass: number;
  name?: string;
  abundance?: string;  // "99.98%" or undefined if no natural abundance
  halfLife?: string;   // "stable" or "5730 y"
  stable: boolean;
  use?: string;
}

export const ELEMENT_ISOTOPES: Record<number, Isotope[]> = {
  1: [
    { mass: 1,  name: "Protium",   abundance: "99.98%",  halfLife: "stable", stable: true,  use: "Most common form in water & biology" },
    { mass: 2,  name: "Deuterium", abundance: "0.015%",  halfLife: "stable", stable: true,  use: "NMR solvents, heavy water reactors" },
    { mass: 3,  name: "Tritium",                         halfLife: "12.3 y", stable: false, use: "Nuclear fusion fuel, glow-in-dark items" },
  ],
  2: [
    { mass: 4,  name: "⁴He",  abundance: "99.9998%", halfLife: "stable", stable: true,  use: "Balloons, MRI coolant" },
    { mass: 3,  name: "³He",  abundance: "0.0002%",  halfLife: "stable", stable: true,  use: "Neutron detectors, cryogenics" },
  ],
  6: [
    { mass: 12, name: "Carbon-12", abundance: "98.89%", halfLife: "stable", stable: true,  use: "Atomic mass standard (12 u exactly)" },
    { mass: 13, name: "Carbon-13", abundance: "1.11%",  halfLife: "stable", stable: true,  use: "NMR spectroscopy (¹³C NMR)" },
    { mass: 14, name: "Carbon-14",                      halfLife: "5730 y", stable: false, use: "Radiocarbon dating (archaeology)" },
  ],
  7: [
    { mass: 14, name: "¹⁴N",  abundance: "99.63%", halfLife: "stable", stable: true },
    { mass: 15, name: "¹⁵N",  abundance: "0.37%",  halfLife: "stable", stable: true, use: "Isotope labelling in biochemistry" },
  ],
  8: [
    { mass: 16, name: "¹⁶O",  abundance: "99.76%", halfLife: "stable", stable: true  },
    { mass: 17, name: "¹⁷O",  abundance: "0.04%",  halfLife: "stable", stable: true  },
    { mass: 18, name: "¹⁸O",  abundance: "0.20%",  halfLife: "stable", stable: true, use: "Isotope tracing in metabolic studies" },
  ],
  17: [
    { mass: 35, name: "³⁵Cl", abundance: "75.77%", halfLife: "stable", stable: true  },
    { mass: 37, name: "³⁷Cl", abundance: "24.23%", halfLife: "stable", stable: true, use: "Explains Cl mass spectrum 2-peak pattern" },
  ],
  19: [
    { mass: 39, name: "³⁹K",  abundance: "93.26%",  halfLife: "stable",   stable: true  },
    { mass: 40, name: "⁴⁰K",  abundance: "0.012%",  halfLife: "1.25×10⁹ y", stable: false, use: "Geological K-Ar dating, body radiation source" },
    { mass: 41, name: "⁴¹K",  abundance: "6.73%",   halfLife: "stable",   stable: true  },
  ],
  20: [
    { mass: 40, name: "⁴⁰Ca", abundance: "96.94%",  halfLife: "stable",      stable: true  },
    { mass: 44, name: "⁴⁴Ca", abundance: "2.09%",   halfLife: "stable",      stable: true  },
    { mass: 48, name: "⁴⁸Ca", abundance: "0.19%",   halfLife: "4.3×10¹⁹ y", stable: false, use: "Near-stable; double-beta decay research" },
  ],
  26: [
    { mass: 54, name: "⁵⁴Fe", abundance: "5.85%",   halfLife: "stable", stable: true  },
    { mass: 56, name: "⁵⁶Fe", abundance: "91.75%",  halfLife: "stable", stable: true, use: "Most tightly bound nucleus; product of stellar nucleosynthesis" },
    { mass: 57, name: "⁵⁷Fe", abundance: "2.12%",   halfLife: "stable", stable: true, use: "Mössbauer spectroscopy" },
    { mass: 58, name: "⁵⁸Fe", abundance: "0.28%",   halfLife: "stable", stable: true  },
  ],
  27: [
    { mass: 59, name: "⁵⁹Co", abundance: "100%",    halfLife: "stable",  stable: true  },
    { mass: 60, name: "⁶⁰Co",                        halfLife: "5.27 y",  stable: false, use: "Cancer radiotherapy, food irradiation, gamma-ray source" },
  ],
  29: [
    { mass: 63, name: "⁶³Cu", abundance: "69.15%",  halfLife: "stable", stable: true  },
    { mass: 65, name: "⁶⁵Cu", abundance: "30.85%",  halfLife: "stable", stable: true  },
    { mass: 64, name: "⁶⁴Cu",                        halfLife: "12.7 h", stable: false, use: "PET imaging agent" },
  ],
  50: [
    { mass: 112, name: "¹¹²Sn", abundance: "0.97%",  halfLife: "stable", stable: true  },
    { mass: 114, name: "¹¹⁴Sn", abundance: "0.66%",  halfLife: "stable", stable: true  },
    { mass: 116, name: "¹¹⁶Sn", abundance: "14.54%", halfLife: "stable", stable: true  },
    { mass: 118, name: "¹¹⁸Sn", abundance: "24.22%", halfLife: "stable", stable: true, use: "Tin has 10 stable isotopes — more than any element" },
    { mass: 120, name: "¹²⁰Sn", abundance: "32.58%", halfLife: "stable", stable: true  },
  ],
  53: [
    { mass: 127, name: "¹²⁷I",  abundance: "100%",   halfLife: "stable",  stable: true  },
    { mass: 131, name: "¹³¹I",                        halfLife: "8.02 d",  stable: false, use: "Thyroid cancer treatment and diagnostic imaging" },
    { mass: 123, name: "¹²³I",                        halfLife: "13.2 h",  stable: false, use: "Nuclear medicine thyroid scans" },
  ],
  56: [
    { mass: 130, name: "¹³⁰Ba", abundance: "0.11%",  halfLife: "stable",     stable: true  },
    { mass: 132, name: "¹³²Ba", abundance: "0.10%",  halfLife: "stable",     stable: true  },
    { mass: 137, name: "¹³⁷Ba", abundance: "11.23%", halfLife: "stable",     stable: true  },
    { mass: 140, name: "¹⁴⁰Ba",                      halfLife: "12.75 d",   stable: false, use: "Fission product from uranium; used in nuclear medicine" },
  ],
  88: [
    { mass: 226, name: "²²⁶Ra",                      halfLife: "1600 y",  stable: false, use: "Historic: radium dial paints, cancer therapy (now obsolete)" },
    { mass: 228, name: "²²⁸Ra",                      halfLife: "5.75 y",  stable: false },
  ],
  92: [
    { mass: 234, name: "²³⁴U",  abundance: "0.005%", halfLife: "2.45×10⁵ y", stable: false },
    { mass: 235, name: "²³⁵U",  abundance: "0.72%",  halfLife: "7.04×10⁸ y", stable: false, use: "Fissile isotope: nuclear reactors & weapons" },
    { mass: 238, name: "²³⁸U",  abundance: "99.27%", halfLife: "4.47×10⁹ y", stable: false, use: "Depleted U armour, nuclear fuel breeding material" },
  ],
  94: [
    { mass: 238, name: "²³⁸Pu",                      halfLife: "87.7 y",  stable: false, use: "RTG power source for deep-space probes (Voyager, New Horizons)" },
    { mass: 239, name: "²³⁹Pu",                      halfLife: "2.41×10⁴ y", stable: false, use: "Primary fissile material in nuclear weapons and MOX fuel" },
    { mass: 240, name: "²⁴⁰Pu",                      halfLife: "6563 y",  stable: false },
  ],
};

// ── Chemistry Properties ──────────────────────────────────────────────────────

export interface ChemistryData {
  oxidationStates: string;
  commonIons: string;
  bondingType: string;
  reactivity: string;
  flameColor?: string;
  keyConceptTitle: string;
  keyConcept: string;
  examQuestion: string;
  examAnswer: string;
}

export const ELEMENT_CHEMISTRY: Record<number, ChemistryData> = {
  1: {
    oxidationStates: "+1, -1, 0",
    commonIons: "H⁺, H⁻ (hydride)",
    bondingType: "Covalent (H₂); ionic (hydrides)",
    reactivity: "Highly reactive with oxygen and halogens; less reactive with most metals under standard conditions",
    keyConceptTitle: "Why is hydrogen unique among elements?",
    keyConcept: "Hydrogen sits uniquely in group 1 but behaves differently from alkali metals — it can form both +1 (by losing its electron) and -1 (hydride, by gaining one) oxidation states. It's the lightest element and the only one whose electron is not shielded from the nucleus by any inner electrons.",
    examQuestion: "Why can hydrogen form both H⁺ and H⁻ ions?",
    examAnswer: "H can lose its single electron to form H⁺ (like alkali metals), or gain one to complete its 1s² shell and form H⁻ (hydride). Both processes are energetically accessible.",
  },
  2: {
    oxidationStates: "0",
    commonIons: "None (chemically inert)",
    bondingType: "No bonding; monatomic gas",
    reactivity: "Essentially zero — only forced compounds exist (e.g., HHeF under extreme conditions)",
    keyConceptTitle: "Why is helium completely inert?",
    keyConcept: "Helium has a completely filled 1s² shell, giving it zero tendency to gain or share electrons. Its first ionization energy (2372 kJ/mol) is the highest of all elements, making electron removal extremely difficult.",
    examQuestion: "Why do noble gases not form bonds under normal conditions?",
    examAnswer: "Their outer electron shells are completely filled (helium: 1s²; others: ns²np⁶), giving zero tendency to gain, lose, or share electrons. The energy required to disrupt this stable configuration exceeds any possible bond energy under normal conditions.",
  },
  3: {
    oxidationStates: "+1",
    commonIons: "Li⁺",
    bondingType: "Metallic; ionic in compounds",
    reactivity: "Reacts with water (slowly) and burns in oxygen; less reactive than Na/K",
    flameColor: "Crimson red",
    keyConceptTitle: "Why is lithium the least reactive alkali metal?",
    keyConcept: "Although all alkali metals lose their single valence electron easily, lithium has the smallest atomic radius and highest charge density in group 1. Its 2s¹ electron is closer to the nucleus and less shielded, so its ionization energy is the highest in the group.",
    examQuestion: "Explain why reactivity increases down group 1.",
    examAnswer: "Down the group, atomic radius increases, the outer electron is in a higher energy shell (further from the nucleus), and inner electrons shield the nuclear charge more effectively. The electron is therefore lost more easily — lower ionization energy = higher reactivity.",
  },
  6: {
    oxidationStates: "+4, +2, -4, 0",
    commonIons: "C⁴⁺ (rare), carbonate CO₃²⁻",
    bondingType: "Covalent (sp³, sp², sp hybridization)",
    reactivity: "Forms 4 covalent bonds; basis of organic chemistry; reacts with oxygen on heating",
    keyConceptTitle: "Why can carbon form so many compounds?",
    keyConcept: "Carbon has 4 valence electrons, exactly half a full shell, making it energetically favorable to form 4 covalent bonds rather than lose or gain electrons. Its ability to form chains, rings, double and triple bonds with itself and other non-metals creates millions of organic compounds.",
    examQuestion: "Why does diamond have a much higher melting point than graphite?",
    examAnswer: "Diamond has a giant covalent structure where every carbon forms 4 strong covalent bonds to neighbors in a 3D network — breaking it requires breaking these bonds (requires massive energy). Graphite has only 3 bonds per carbon in 2D layers held together by weak van der Waals forces between layers.",
  },
  7: {
    oxidationStates: "-3, +3, +5, +2, +4",
    commonIons: "NO₃⁻, NH₄⁺, N²⁻ (nitride)",
    bondingType: "Triple bond in N₂ (very stable); covalent in most compounds",
    reactivity: "Very unreactive as N₂ (triple bond: 945 kJ/mol); highly reactive in compounds",
    keyConceptTitle: "Why is N₂ so unreactive despite being in nearly all living things?",
    keyConcept: "The N≡N triple bond (945 kJ/mol) is one of the strongest bonds in chemistry. Breaking it requires enormous energy, which is why N₂ is effectively inert at room temperature. Biological nitrogen fixation uses enzyme nitrogenase with a complex iron-molybdenum cofactor to accomplish this feat at ambient temperature.",
    examQuestion: "Why does nitrogen have the anomalously high 1st IE compared to oxygen?",
    examAnswer: "Nitrogen (1s²2s²2p³) has half-filled p subshell — each p orbital has one electron, and Hund's rule makes this stable. Oxygen must pair two electrons in one p orbital, creating electron-electron repulsion that makes the first electron easier to remove than expected.",
  },
  8: {
    oxidationStates: "-2, -1, 0",
    commonIons: "O²⁻ (oxide), OH⁻, O₂²⁻ (peroxide)",
    bondingType: "Covalent; often forms double bonds; ionic (oxide) with metals",
    reactivity: "Highly reactive with most elements (oxidiser); liquid O₂ is a powerful rocket oxidant",
    keyConceptTitle: "Why is oxygen paramagnetic?",
    keyConcept: "Molecular orbital theory predicts that O₂ has two unpaired electrons in degenerate π* antibonding orbitals (each orbital gets one electron by Hund's rule). This makes O₂ paramagnetic — it is attracted to a magnetic field — a prediction that simple Lewis structures cannot explain.",
    examQuestion: "Explain why oxygen typically forms 2 bonds while sulfur (in the same group) can form 6.",
    examAnswer: "Oxygen has no available d orbitals, so it is limited to 4 bonds by its valence shell. Sulfur (period 3) has empty 3d orbitals that can accommodate extra electron pairs, allowing expanded octets (SF₆, SO₃ etc.) with up to 6 bonds.",
  },
  9: {
    oxidationStates: "-1, 0",
    commonIons: "F⁻ (fluoride)",
    bondingType: "Covalent in F₂ (weak F-F bond); ionic in metal fluorides",
    reactivity: "Most reactive non-metal; strongest oxidising agent; can react with glass, noble gases",
    keyConceptTitle: "Why is fluorine the most electronegative element?",
    keyConcept: "Fluorine has the highest nuclear charge-to-atomic-radius ratio among non-metals, combined with minimal electron shielding (only 2 inner electrons in a small 2p shell). This gives it an enormous attraction for bonding electrons. Its electronegativity of 3.98 is set as the benchmark for all other elements.",
    examQuestion: "Why is the F-F bond in F₂ unusually weak compared to Cl-Cl or Br-Br?",
    examAnswer: "The two fluorine atoms are very small, bringing their lone pairs into close proximity. Lone-pair–lone-pair repulsion weakens the bond. Cl and Br have larger atoms, reducing this repulsion and giving stronger X-X bonds.",
  },
  11: {
    oxidationStates: "+1",
    commonIons: "Na⁺",
    bondingType: "Metallic; ionic in all compounds",
    reactivity: "Reacts vigorously with water (produces NaOH + H₂); burns in oxygen; stored in oil",
    flameColor: "Intense yellow (589 nm D-line)",
    keyConceptTitle: "Why does sodium react so violently with water?",
    keyConcept: "Sodium's single 3s¹ valence electron is well-shielded and far from the nucleus (low IE: 496 kJ/mol). Water molecules easily oxidise Na by abstracting this electron: 2Na + 2H₂O → 2NaOH + H₂. The reaction is highly exothermic and can ignite the hydrogen produced.",
    examQuestion: "Why does the reactivity of group 1 metals increase down the group?",
    examAnswer: "Atomic radius increases down the group; the outer s electron is in progressively higher shells, experiences more shielding, and is further from the nucleus — it is lost more readily. Lower ionization energy = easier electron loss = more reactive metal.",
  },
  12: {
    oxidationStates: "+2",
    commonIons: "Mg²⁺",
    bondingType: "Metallic; ionic in compounds",
    reactivity: "Burns brilliantly in air/O₂ at 3100 °C; reacts with steam; no reaction with cold water",
    flameColor: "Brilliant white",
    keyConceptTitle: "Why does magnesium burn so intensely?",
    keyConcept: "Magnesium has a low ionization energy for both s electrons and forms a very stable oxide lattice (MgO: ΔHf = −601 kJ/mol). The highly exothermic combustion reaction releases enough energy to heat the magnesium above its boiling point during burning. Remarkably, Mg continues burning in CO₂ and N₂.",
    examQuestion: "Explain why magnesium reacts with steam but not liquid water.",
    examAnswer: "The oxide layer on magnesium's surface is protective in cold water. Steam has higher energy that disrupts this layer and the higher temperature provides enough activation energy for Mg + H₂O → MgO + H₂ to proceed.",
  },
  13: {
    oxidationStates: "+3",
    commonIons: "Al³⁺",
    bondingType: "Metallic; covalent in AlCl₃ (dimer), ionic in Al₂O₃",
    reactivity: "Kinetically protected by Al₂O₃ passivation layer; reacts with NaOH (amphoteric oxide)",
    keyConceptTitle: "Why is aluminium so resistant to corrosion despite being reactive?",
    keyConcept: "Aluminium rapidly forms a thin (3–4 nm) but extremely hard aluminium oxide layer (Al₂O₃) that adheres tightly to the surface and prevents further oxidation. Anodising thickens this layer artificially. The oxide is amphoteric, dissolving in both acids and strong bases.",
    examQuestion: "Why does aluminium dissolve in both acid and alkali (but not iron)?",
    examAnswer: "Al₂O₃ is amphoteric: it reacts with acid (Al₂O₃ + 6HCl → 2AlCl₃ + 3H₂O) and with base (Al₂O₃ + 2NaOH + 3H₂O → 2NaAl(OH)₄). Iron's oxide (Fe₂O₃) is basic only and only dissolves in acid.",
  },
  14: {
    oxidationStates: "+4, -4",
    commonIons: "SiO₄⁴⁻ (silicate)",
    bondingType: "Covalent (giant lattice in solid); sp³ hybridised",
    reactivity: "Reacts slowly with NaOH and HF; inert to most acids (unlike Ge, Sn, Pb)",
    keyConceptTitle: "Why is silicon the backbone of the semiconductor industry?",
    keyConcept: "Silicon is a group-14 metalloid with a band gap of 1.12 eV — small enough to be overcome by doping with electrons (n-type, group 15 dopants) or holes (p-type, group 13 dopants), making its conductivity highly tuneable. Its oxide (SiO₂) is a perfect insulating gate material in MOSFETs.",
    examQuestion: "Why does silicon form SiO₂ while carbon forms CO₂ (discrete molecules)?",
    examAnswer: "Silicon's 3d orbitals allow it to expand its octet and form four Si-O single bonds in a giant 3D covalent lattice (SiO₂). Carbon's 2p orbitals permit p-p π bonding with oxygen, making discrete O=C=O molecules much more stable.",
  },
  17: {
    oxidationStates: "-1, +1, +3, +5, +7",
    commonIons: "Cl⁻, ClO⁻, ClO₃⁻, ClO₄⁻",
    bondingType: "Covalent in Cl₂ and most compounds; ionic as Cl⁻",
    reactivity: "Strong oxidising agent; reacts with most metals and non-metals; disproportionates in water",
    keyConceptTitle: "Why does chlorine have so many oxidation states?",
    keyConcept: "Chlorine has 7 valence electrons and can use empty 3d orbitals to expand its octet, enabling oxidation states from -1 (chloride) up to +7 (perchlorate, ClO₄⁻). In water, Cl₂ disproportionates: Cl₂ + H₂O → HCl + HClO, producing both -1 and +1 states simultaneously.",
    examQuestion: "Explain the trend in oxidising ability: F₂ > Cl₂ > Br₂ > I₂.",
    examAnswer: "Electronegativity decreases down the group as atomic radius increases and electron shielding increases. A smaller, more electronegative atom attracts electrons more readily. F₂ is the strongest oxidising agent in chemistry; I₂ is the weakest halogen oxidant.",
  },
  18: {
    oxidationStates: "0 (generally)",
    commonIons: "None",
    bondingType: "No chemical bonding under normal conditions",
    reactivity: "Essentially inert; XeF₂, XeF₄, XeO₃ exist for Xe under forcing conditions",
    keyConceptTitle: "Why are noble gases so unreactive?",
    keyConcept: "Noble gases have completely filled valence shells (helium: 1s²; others: ns²np⁶), with zero tendency to gain, share, or lose electrons. Their first ionization energies are the highest in each period. Only the heaviest noble gases (Xe, Kr, Rn) can be forced to react, using the most aggressive fluorinating agents like PtF₆.",
    examQuestion: "Which noble gas has known stable compounds and why?",
    examAnswer: "Xenon (and to a lesser extent krypton) forms compounds like XeF₂ and XeF₄ because Xe has a large atomic radius and lower ionization energy than lighter noble gases. Fluorine's extreme electronegativity can force electron removal and bonding even from Xe's filled shell.",
  },
  19: {
    oxidationStates: "+1",
    commonIons: "K⁺",
    bondingType: "Metallic; ionic in all compounds",
    reactivity: "More reactive than Na; reacts vigorously with water; ignites the H₂ produced",
    flameColor: "Lilac/violet (766 nm)",
    keyConceptTitle: "Why is potassium more reactive than sodium?",
    keyConcept: "Potassium's valence electron is in the 4s orbital, farther from the nucleus than sodium's 3s¹ electron and more shielded by inner electrons. Its ionization energy (419 kJ/mol) is lower than Na (496 kJ/mol), so the electron is lost more easily and the metal reacts more vigorously.",
    examQuestion: "Predict what happens when potassium is added to water.",
    examAnswer: "K reacts even more vigorously than Na: 2K + 2H₂O → 2KOH + H₂. The reaction is exothermic enough to ignite the hydrogen produced, giving a characteristic lilac flame. The solution turns strongly alkaline (high pH).",
  },
  20: {
    oxidationStates: "+2",
    commonIons: "Ca²⁺",
    bondingType: "Metallic; ionic in all compounds",
    reactivity: "Reacts with cold water (slowly, unlike Mg); burns in air; dissolves in acids",
    flameColor: "Brick red (orange-red)",
    keyConceptTitle: "Why is calcium essential for bone structure?",
    keyConcept: "Bone is primarily hydroxyapatite Ca₅(PO₄)₃OH — a calcium phosphate mineral giving rigidity. The Ca²⁺ ion forms a strong, stable ionic lattice with phosphate. Calcium ions also regulate muscle contraction, blood clotting, and nerve signal transmission through tight homeostatic control.",
    examQuestion: "Explain why Ca(OH)₂ is only slightly soluble while NaOH is very soluble.",
    examAnswer: "Ca²⁺ has a higher charge density (+2, smaller cation) than Na⁺ (+1). The lattice energy of Ca(OH)₂ is much greater, requiring more energy to disrupt than the hydration energy gained. For NaOH, the lower lattice energy is easily overcome by Na⁺ hydration.",
  },
  26: {
    oxidationStates: "+2, +3",
    commonIons: "Fe²⁺ (ferrous), Fe³⁺ (ferric)",
    bondingType: "Metallic; ionic in Fe²⁺/Fe³⁺ compounds",
    reactivity: "Reacts with dilute acids; rusts in presence of water + oxygen; thermite reaction with Al₂O₃",
    keyConceptTitle: "Why does iron rust and how does iron form coloured compounds?",
    keyConcept: "Iron rusts via an electrochemical process: Fe acts as anode (Fe → Fe²⁺ + 2e⁻) and oxygen/water provide the cathode. Fe²⁺ oxidises to Fe³⁺ forming Fe₂O₃·xH₂O (rust). Iron's d-orbitals allow electron transitions that absorb specific light wavelengths — Fe³⁺ complexes appear yellow-brown, Fe²⁺ complexes often pale green or blue-green.",
    examQuestion: "Why does steel rust while stainless steel does not?",
    examAnswer: "Stainless steel contains at least 10.5% chromium. Chromium forms a thin, self-repairing Cr₂O₃ passivation layer (like aluminium's Al₂O₃) that prevents oxygen/water reaching the iron beneath.",
  },
  29: {
    oxidationStates: "+1, +2",
    commonIons: "Cu⁺, Cu²⁺",
    bondingType: "Metallic; ionic in compounds",
    reactivity: "Below hydrogen in reactivity series; does not react with dilute HCl but reacts with H₂SO₄(conc) and HNO₃",
    keyConceptTitle: "Why is copper below hydrogen in the reactivity series?",
    keyConcept: "Copper's electron configuration [Ar]3d¹⁰4s¹ gives a fully filled d shell that stabilises the atom. Its standard electrode potential (E° = +0.34 V for Cu²⁺/Cu) means Cu²⁺ is more easily reduced than H⁺, so copper metal cannot reduce H⁺ in dilute acid. Copper's resistance to corrosion makes it ideal for plumbing and electrical wiring.",
    examQuestion: "Why does copper dissolve in concentrated nitric acid but not in dilute HCl?",
    examAnswer: "Copper (E° = +0.34 V) cannot reduce H⁺ to H₂ since Cu sits below H in the electrochemical series. HNO₃ is an oxidising acid — the NO₃⁻ ion oxidises Cu directly: Cu + 4HNO₃(conc) → Cu(NO₃)₂ + 2NO₂ + 2H₂O.",
  },
  47: {
    oxidationStates: "+1, +2",
    commonIons: "Ag⁺",
    bondingType: "Metallic; ionic in AgNO₃, AgCl, AgBr",
    reactivity: "Below H in reactivity; reacts with HNO₃; AgCl/AgBr are light-sensitive (photography)",
    keyConceptTitle: "Why does silver tarnish and what causes its antimicrobial properties?",
    keyConcept: "Silver reacts with hydrogen sulfide in air (2Ag + H₂S → Ag₂S + H₂) to form black silver sulfide (tarnish). Silver ions (Ag⁺) are potently antimicrobial: they bind to sulfhydryl groups in bacterial enzymes and DNA, disrupting cell function — hence silver's use in wound dressings.",
    examQuestion: "Explain the ionic equation for the reaction between silver nitrate and sodium chloride.",
    examAnswer: "Ag⁺(aq) + Cl⁻(aq) → AgCl(s). AgCl precipitates as a white solid (Ksp = 1.8×10⁻¹⁰). This test distinguishes Cl⁻ (white ppt), Br⁻ (cream ppt with AgBr) and I⁻ (yellow ppt with AgI).",
  },
  79: {
    oxidationStates: "+1, +3",
    commonIons: "Au⁺, Au³⁺",
    bondingType: "Metallic; forms covalent-like bonds in complexes",
    reactivity: "Very unreactive; only dissolves in aqua regia (3:1 HCl:HNO₃); does not tarnish",
    keyConceptTitle: "Why is gold so chemically inert?",
    keyConcept: "Gold exhibits strong relativistic effects: its 6s electron moves at ~58% the speed of light, causing relativistic mass increase and orbital contraction. This lowers the 6s energy, making the electron harder to remove, and stabilises the Au-Au metallic bond. Gold's high reduction potential (E° = +1.52 V for Au³⁺/Au) means it is extremely difficult to oxidise.",
    examQuestion: "What is aqua regia and why can it dissolve gold?",
    examAnswer: "Aqua regia is a 3:1 mixture of conc. HCl and conc. HNO₃. NO₃⁻ oxidises Au to Au³⁺, while Cl⁻ forms the stable tetrachloroaurate complex [AuCl₄]⁻. The complex formation shifts the equilibrium, overcoming gold's high electrode potential and allowing dissolution.",
  },
  82: {
    oxidationStates: "+2, +4",
    commonIons: "Pb²⁺, Pb⁴⁺",
    bondingType: "Metallic; ionic in PbO, PbSO₄",
    reactivity: "Resists corrosion (dense PbSO₄/PbCO₃ surface coating); reacts with strong acids",
    keyConceptTitle: "Why is lead so toxic to biological systems?",
    keyConcept: "Pb²⁺ ions mimic Ca²⁺ in biological processes (similar ionic radius), disrupting calcium-dependent enzymes. Lead substitutes for zinc in DNA repair enzymes, and interferes with haem synthesis by inhibiting delta-aminolevulinic acid dehydratase. Neurological damage occurs because Pb²⁺ can cross the blood-brain barrier.",
    examQuestion: "Explain the inert-pair effect in lead's chemistry.",
    examAnswer: "Lead (6s²6p²) exhibits the inert-pair effect: the 6s² electrons are relativistically stabilised and resist ionisation. Pb²⁺ (loses only the 6p² electrons) is more stable than Pb⁴⁺ (would require also removing the 6s² pair). This is why PbO dominates over PbO₂.",
  },
  92: {
    oxidationStates: "+3, +4, +5, +6",
    commonIons: "UO₂²⁺ (uranyl)",
    bondingType: "Metallic; actinide with 5f electron participation",
    reactivity: "Slowly oxidised in air; dissolves in dilute HNO₃; weakly radioactive (α emitter)",
    keyConceptTitle: "How does uranium release nuclear energy?",
    keyConcept: "²³⁵U undergoes neutron-induced fission: ²³⁵U + n → fission fragments + 2-3 n + ~200 MeV energy. The released neutrons trigger more fissions in a chain reaction. Only 0.72% of natural U is the fissile ²³⁵U; the rest is ²³⁸U, which must be enriched for reactor use (3–5%) or weapon use (>90%).",
    examQuestion: "Distinguish between nuclear fission and nuclear fusion in terms of energy and mass.",
    examAnswer: "In fission, a heavy nucleus splits into lighter fragments with a small mass deficit (Δm), released as energy (E = Δmc²). In fusion, light nuclei combine; the mass of the product is less than the sum of reactants, releasing even more energy per unit mass. The sun's energy comes from fusion (p-p chain); nuclear power plants use fission.",
  },
};

// ── History & Discovery ───────────────────────────────────────────────────────

export interface DiscoveryData {
  discoverer: string;
  year: string;
  country: string;
  method: string;
  significance: string;
}

export const ELEMENT_HISTORY: Record<number, DiscoveryData> = {
  1:   { discoverer: "Henry Cavendish",                  year: "1766", country: "England",      method: "Reacted metals with acids, collected 'inflammable air'", significance: "Most abundant element in the universe; enabled the chemical revolution" },
  2:   { discoverer: "Janssen & Lockyer (solar spectrum)", year: "1868", country: "France/England", method: "Spectroscopic analysis of solar eclipse chromosphere",   significance: "First element discovered outside Earth; named after Helios (Greek sun god)" },
  3:   { discoverer: "Johan August Arfwedson",            year: "1817", country: "Sweden",       method: "Chemical analysis of petalite mineral",                    significance: "Lightest metal; essential for Li-ion batteries and psychiatric medicine" },
  4:   { discoverer: "Louis-Nicolas Vauquelin",           year: "1798", country: "France",       method: "Analysis of beryl and emerald minerals",                   significance: "Named from beryl; rare in nature despite cosmological abundance" },
  5:   { discoverer: "Gay-Lussac & Thénard / Davy",      year: "1808", country: "France/England", method: "Chemical reduction of boron oxide",                     significance: "Named from borax; used as semiconductor and nuclear neutron absorber" },
  6:   { discoverer: "Ancient (known prehistorically)",   year: "Ancient", country: "Various",   method: "Charcoal and soot known since prehistoric times",          significance: "Basis of all organic chemistry; diamond and graphite are allotropes" },
  7:   { discoverer: "Daniel Rutherford",                 year: "1772", country: "Scotland",     method: "Removed O₂ and CO₂ from air; the residue was N₂",          significance: "Called 'noxious air' and 'azote' (lifeless); essential to all proteins/DNA" },
  8:   { discoverer: "Carl Scheele / Joseph Priestley",   year: "1774", country: "Sweden/England", method: "Scheele by heating KMnO₄; Priestley by heating HgO",    significance: "Priestley got credit as Lavoisier named it oxygen, disproving phlogiston theory" },
  9:   { discoverer: "Henri Moissan",                     year: "1886", country: "France",       method: "Electrolysis of liquid HF (won 1906 Nobel Prize)",         significance: "So reactive it killed/injured many chemists attempting isolation; 'Wöhler's curse'" },
  10:  { discoverer: "Ramsay & Travers",                  year: "1898", country: "England",      method: "Fractional distillation of liquid air",                    significance: "Name from Greek 'neos' (new); gave bright orange-red light in discharge tubes" },
  11:  { discoverer: "Humphry Davy",                      year: "1807", country: "England",      method: "Electrolysis of molten NaOH — first isolated by electrolysis", significance: "Named from soda ash; revolutionised electrochemistry as demonstration of electrolysis power" },
  12:  { discoverer: "Joseph Black (identified); Davy (isolated)", year: "1808", country: "Scotland/England", method: "Davy electrolysed molten magnesia",          significance: "Named from Magnesia (Greek district); eighth most abundant element in Earth's crust" },
  13:  { discoverer: "Hans Christian Ørsted / Friedrich Wöhler", year: "1825/1827", country: "Denmark/Germany", method: "Reduction of AlCl₃ with potassium amalgam", significance: "Was more precious than gold in 1850s; Napoleon reserved Al cutlery for honoured guests" },
  14:  { discoverer: "Jöns Jacob Berzelius",              year: "1824", country: "Sweden",       method: "Reduction of SiF₄ with potassium",                         significance: "Second most abundant element in crust; underpins the semiconductor/solar industry" },
  15:  { discoverer: "Hennig Brand",                      year: "1669", country: "Germany",      method: "Evaporated 50 buckets of urine, discovered glowing residue", significance: "First element discovered by a known individual; was called 'phosphorus' (light-bearer)" },
  16:  { discoverer: "Ancient (known since antiquity)",   year: "Ancient", country: "Various",   method: "Found as native sulfur in volcanic regions",               significance: "'Brimstone' in ancient texts; vital for H₂SO₄ production (world's most produced chemical)" },
  17:  { discoverer: "Carl Wilhelm Scheele",              year: "1774", country: "Sweden",       method: "Reaction of MnO₂ with HCl produced yellow-green gas",      significance: "First chemical weapon in WWI (Ypres, 1915); essential for water purification globally" },
  18:  { discoverer: "Lord Rayleigh & William Ramsay",    year: "1894", country: "England",      method: "Noticed nitrogen from air was denser than chemical N₂",     significance: "Hidden for decades as it forms no compounds; makes up 0.93% of atmosphere (more than CO₂)" },
  19:  { discoverer: "Humphry Davy",                      year: "1807", country: "England",      method: "Electrolysis of molten KOH — same day as sodium",           significance: "From 'pot ash'; first metal isolated by Davy's electrolysis experiments" },
  20:  { discoverer: "Humphry Davy",                      year: "1808", country: "England",      method: "Electrolysis of molten calcium salts",                     significance: "Named from calx (Latin: lime); most abundant metal in the human body (1 kg in skeleton)" },
  22:  { discoverer: "William Gregor / Martin Heinrich Klaproth", year: "1791", country: "England/Germany", method: "Gregor analysed black sand; Klaproth later confirmed from rutile", significance: "Named from Titans; SR-71 Blackbird spy plane was 93% titanium" },
  23:  { discoverer: "Nils Gabriel Sefström",             year: "1830", country: "Sweden",       method: "Found in cast iron; named after Norse goddess Vanadis",     significance: "Vanadium steel used in Model T Ford chassis; vanadium flow batteries for grid storage" },
  24:  { discoverer: "Louis Nicolas Vauquelin",           year: "1798", country: "France",       method: "Analysed crocoite mineral (PbCrO₄)",                       significance: "From Greek 'chroma' (colour); gives ruby red (Cr³⁺), emerald green, chrome yellow pigments" },
  25:  { discoverer: "Carl Wilhelm Scheele / Johan Gahn", year: "1774", country: "Sweden",       method: "Scheele recognised manganese in pyrolusite; Gahn isolated it", significance: "Named from Magnesia region; essential for steel making; dry-cell battery cathode" },
  26:  { discoverer: "Ancient",                           year: "~5000 BCE", country: "Various", method: "Smelted from ore in furnaces — basis of Iron Age",          significance: "Most widely used metal; haemoglobin iron enables oxygen transport in blood" },
  27:  { discoverer: "Georg Brandt",                      year: "1735", country: "Sweden",       method: "Isolated from cobalt ore (mistaken for copper ore by miners)", significance: "'Kobold' (German goblin) — miners blamed goblins when ore yielded no copper; named cobalt" },
  28:  { discoverer: "Axel Fredrik Cronstedt",            year: "1751", country: "Sweden",       method: "Analysed Kupfernickel mineral (false copper ore)",           significance: "Named 'Nickel' as miners' slang for Old Nick (devil) who gave copper-coloured ore with no Cu" },
  29:  { discoverer: "Ancient",                           year: "~9000 BCE", country: "Cyprus",  method: "Earliest metal smelted by humans from malachite/azurite",   significance: "Name from Cyprus (Latin: Cuprum); earliest metal worked; beginning of metallurgy" },
  30:  { discoverer: "Andreas Marggraf",                  year: "1746", country: "Germany",      method: "Isolated metallic zinc by heating calamine with charcoal",  significance: "Known as sphalerite ore since antiquity; zinc deficiency affects 2 billion people globally" },
  35:  { discoverer: "Carl Löwig & Antoine Balard",       year: "1826", country: "Germany/France", method: "Isolated from brines — competition between two groups",   significance: "One of only two liquid elements at room temperature; name from Greek 'bromos' (stench)" },
  36:  { discoverer: "Ramsay & Travers",                  year: "1898", country: "England",      method: "Fractional distillation of liquid air",                    significance: "Named from Greek 'kryptos' (hidden); used in krypton fluoride lasers and speciality lighting" },
  37:  { discoverer: "Bunsen & Kirchhoff",                year: "1861", country: "Germany",      method: "Flame spectroscopy — first use of spectroscope to discover element", significance: "Named for its deep-red spectral lines; first element discovered by spectroscopy" },
  38:  { discoverer: "Adair Crawford",                    year: "1790", country: "Scotland",     method: "Analysis of strontianite mineral from Strontian, Scotland",  significance: "Named from Scottish village Strontian; ⁹⁰Sr in nuclear fallout mimics calcium in bones" },
  39:  { discoverer: "Johan Gadolin",                     year: "1794", country: "Finland",      method: "Analysis of ytterbite (gadolinite) mineral from Ytterby", significance: "Named from Ytterby village (which gave names to 4 elements: Y, Yb, Er, Tb)" },
  47:  { discoverer: "Ancient",                           year: "~5000 BCE", country: "Various", method: "Found as native metal; mined from argentite ore",           significance: "Highest electrical and thermal conductivity of all elements; name from Sanskrit 'Argunas'" },
  50:  { discoverer: "Ancient",                           year: "~3000 BCE", country: "Various", method: "Found in alloy with copper (bronze); later smelted from cassiterite", significance: "Gave the Bronze Age its crucial alloy; only element with 10 stable isotopes" },
  53:  { discoverer: "Bernard Courtois",                  year: "1811", country: "France",       method: "Accidentally discovered while extracting saltpetre from seaweed ash", significance: "Named from Greek 'ioeides' (violet); essential trace element (thyroid hormone T3/T4)" },
  55:  { discoverer: "Bunsen & Kirchhoff",                year: "1860", country: "Germany",      method: "Spectroscopy of mineral water — first use of spectroscopy in chemistry", significance: "First element discovered by spectroscopy; the most electropositive natural element" },
  56:  { discoverer: "Carl Wilhelm Scheele",              year: "1774", country: "Sweden",       method: "Identified new element in pyrolusite; isolated by Gahn",    significance: "Named from Greek 'barys' (heavy); Ba contrast in X-ray imaging (barium meal)" },
  74:  { discoverer: "Scheele identified acid; d'Elhujar brothers isolated", year: "1783", country: "Spain", method: "Reduction of tungstic acid with charcoal", significance: "Highest melting point of any element (3422°C); from Swedish 'heavy stone' (tung sten)" },
  78:  { discoverer: "Antonio de Ulloa / Wood",           year: "1735/1741", country: "Spain/England", method: "Found in South American gold mines — called 'platina' (little silver)", significance: "Rarest stable element; platinum-group metals essential for catalytic converters" },
  79:  { discoverer: "Ancient",                           year: "~6000 BCE", country: "Various", method: "Found as native metal in river alluvium",                  significance: "All gold ever mined (~200,000 t) fits in a 21-metre cube; standard of monetary value" },
  80:  { discoverer: "Ancient",                           year: "~2000 BCE", country: "Various", method: "Found as cinnabar ore (HgS) in volcanic regions",           significance: "Named from Latin 'hydrargyrum' (liquid silver); Hg symbol; once used in thermometers" },
  82:  { discoverer: "Ancient",                           year: "~7000 BCE", country: "Various", method: "Smelted from galena (PbS) ore",                            significance: "'Plumbum' gave English 'plumbing' — Romans used lead pipes; contributed to Rome's decline" },
  88:  { discoverer: "Marie & Pierre Curie",              year: "1898", country: "France",       method: "Isolated from uraninite (pitchblende) after processing tonnes of ore", significance: "Marie Curie's second element discovery; 'radioactivity' coined by her; first Nobel in Physics" },
  92:  { discoverer: "Martin Heinrich Klaproth",          year: "1789", country: "Germany",      method: "Analysis of pitchblende, named after newly-discovered planet Uranus", significance: "Enables nuclear power and atomic weapons; first transuranic elements synthesised from uranium" },
};

// ── Lab Experiment Links ──────────────────────────────────────────────────────

// Maps element atomic number → array of experiment slugs (matching CATALOG)
export const ELEMENT_LABS: Record<number, { slug: string; label: string; reason: string }[]> = {
  1:  [
    { slug: "electrolysis",  label: "Electrolysis",         reason: "Hydrogen gas produced at cathode (2H⁺ + 2e⁻ → H₂)" },
    { slug: "gas-collection", label: "Gas Collection",       reason: "Collect and test H₂ produced from acid + metal" },
    { slug: "gas-laws",       label: "Gas Laws",             reason: "Hydrogen demonstrates Boyle's and Charles's Law" },
  ],
  6:  [
    { slug: "calorimetry",    label: "Calorimetry",          reason: "Carbon compounds (fuels) measured for heat of combustion" },
    { slug: "chromatography", label: "Chromatography",       reason: "Separate organic (carbon-based) pigment mixtures" },
  ],
  7:  [
    { slug: "gas-laws",       label: "Gas Laws",             reason: "Nitrogen gas used in Boyle's Law demonstrations" },
  ],
  8:  [
    { slug: "electrolysis",   label: "Electrolysis",         reason: "Oxygen produced at anode (2H₂O → O₂ + 4H⁺ + 4e⁻)" },
    { slug: "gas-collection", label: "Gas Collection",       reason: "Collect O₂ by displacement, test with glowing splint" },
    { slug: "reaction-rate",  label: "Reaction Rate",        reason: "Oxygen concentration affects combustion/reaction rates" },
  ],
  11: [
    { slug: "flame-test",     label: "Flame Test",           reason: "Sodium gives the most distinctive yellow-orange flame (589 nm)" },
    { slug: "titration",      label: "Titration",            reason: "NaOH standard solution used as strong base titrant" },
    { slug: "neutralization", label: "Neutralization",       reason: "NaOH + HCl neutralisation is a classic experiment" },
  ],
  12: [
    { slug: "water-hardness", label: "Water Hardness",       reason: "Mg²⁺ ions cause temporary and permanent water hardness" },
    { slug: "calorimetry",    label: "Calorimetry",          reason: "Mg combustion enthalpy measurement experiment" },
  ],
  17: [
    { slug: "titration",      label: "Titration",            reason: "Chloride ions titrated with AgNO₃ (Mohr's method)" },
    { slug: "electrolysis",   label: "Electrolysis",         reason: "Cl₂ gas produced at anode when brine is electrolysed" },
  ],
  19: [
    { slug: "flame-test",     label: "Flame Test",           reason: "Potassium gives characteristic lilac/violet flame (766 nm)" },
  ],
  20: [
    { slug: "water-hardness", label: "Water Hardness",       reason: "Ca²⁺ is the primary cause of water hardness (limescale)" },
    { slug: "flame-test",     label: "Flame Test",           reason: "Calcium gives brick-red flame in flame tests" },
    { slug: "titration",      label: "Titration",            reason: "EDTA titration of Ca²⁺ measures water hardness" },
  ],
  26: [
    { slug: "redox-displacement", label: "Redox Displacement", reason: "Fe is displaced by more reactive metals (Mg, Zn, Al)" },
    { slug: "reaction-rate",  label: "Reaction Rate",          reason: "Iron catalyses H₂O₂ decomposition (Fenton reaction)" },
  ],
  29: [
    { slug: "electrolysis",   label: "Electrolysis",            reason: "Copper is plated in copper sulfate electrolysis cell" },
    { slug: "redox-displacement", label: "Redox Displacement",  reason: "Iron displaces copper from CuSO₄ solution (core experiment)" },
  ],
  30: [
    { slug: "redox-displacement", label: "Redox Displacement", reason: "Zinc displaces copper from CuSO₄; common displacement demo" },
    { slug: "electrolysis",   label: "Electrolysis",            reason: "Zinc electrodeposition from ZnSO₄ solutions" },
  ],
  38: [
    { slug: "flame-test",     label: "Flame Test",           reason: "Strontium gives a brilliant crimson-red flame" },
  ],
  56: [
    { slug: "flame-test",     label: "Flame Test",           reason: "Barium gives a distinctive green flame" },
  ],
  3:  [
    { slug: "flame-test",     label: "Flame Test",           reason: "Lithium gives a vivid crimson-red flame" },
  ],
  4:  [
    { slug: "chromatography", label: "Chromatography",       reason: "Beryllium separations in analytical chemistry" },
  ],
  16: [
    { slug: "titration",      label: "Titration",            reason: "H₂SO₄ (sulfuric acid) used as standard acid titrant" },
    { slug: "reaction-rate",  label: "Reaction Rate",        reason: "Sulfuric acid catalyses ester hydrolysis reactions" },
  ],
  25: [
    { slug: "reaction-rate",  label: "Reaction Rate",        reason: "MnO₄⁻ (permanganate) used in rate experiments; MnO₂ catalyses H₂O₂" },
  ],
  35: [
    { slug: "titration",      label: "Titration",            reason: "Bromide titrations; bromine water tests for alkenes" },
  ],
  47: [
    { slug: "redox-displacement", label: "Redox Displacement", reason: "Silver displaced from AgNO₃ by more reactive metals" },
  ],
  92: [
    { slug: "reaction-rate",  label: "Reaction Rate",        reason: "Uranium catalysis and radioactive decay rate studies" },
  ],
};

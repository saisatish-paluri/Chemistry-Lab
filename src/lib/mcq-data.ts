export interface MCQQuestion {
  id:           string;
  question:     string;
  options:      [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation:  string;
}

export type ExperimentKey =
  | "titration"
  | "electrolysis"
  | "flame-test"
  | "solubility"
  | "reaction-rate"
  | "gas-laws"
  | "chemical-equilibrium"
  | "gas-collection"
  | "redox-displacement"
  | "calorimetry"
  | "separation-techniques"
  // Class 6-7 experiments
  | "density-floats-sinks"
  | "dissolving-rate"
  | "indicator-test"
  | "filtration-basics"
  // New experiments
  | "neutralization"
  | "salt-analysis"
  | "water-hardness"
  | "functional-groups"
  | "chromatography";

export const MCQ_DATA: Record<ExperimentKey, MCQQuestion[]> = {

  titration: [
    {
      id: "t1",
      question: "What is the equivalence point in an acid-base titration?",
      options: [
        "The point at which the indicator changes colour",
        "The point at which moles of acid equal moles of base stoichiometrically",
        "The point at which pH equals 7",
        "The point at which equal volumes of acid and base have been added",
      ],
      correctIndex: 1,
      explanation:
        "The equivalence point is defined by stoichiometry — the point where the acid and base have been added in exactly the ratio described by the balanced equation. For a strong acid–strong base titration the equivalence pH happens to be 7, but this is not the definition.",
    },
    {
      id: "t2",
      question: "Phenolphthalein is colourless in acid and pink in base. Why does it change colour near the endpoint?",
      options: [
        "The temperature of the solution rises at the endpoint",
        "The indicator molecule undergoes a structural change as pH crosses its transition range (pH 8.2–10)",
        "All the acid molecules are destroyed at the endpoint",
        "The salt formed reacts with the indicator",
      ],
      correctIndex: 1,
      explanation:
        "Phenolphthalein is a weak acid itself. As pH rises above ~8.2, it loses a proton and the conjugate base adopts a quinoid structure that absorbs visible light — producing the pink colour. Below that pH the colourless lactone form dominates.",
    },
    {
      id: "t3",
      question:
        "25 mL of 0.1 M HCl requires 12.5 mL of NaOH to reach the equivalence point. What is the concentration of the NaOH?",
      options: ["0.05 M", "0.1 M", "0.2 M", "0.4 M"],
      correctIndex: 2,
      explanation:
        "Moles HCl = 0.025 L × 0.1 mol/L = 0.0025 mol. At equivalence, moles NaOH = 0.0025 mol. Concentration NaOH = 0.0025 mol / 0.0125 L = 0.2 M.",
    },
    {
      id: "t4",
      question: "Why is the burette rinsed with the titrant solution before filling it?",
      options: [
        "To warm the burette to room temperature",
        "To prevent contamination of the titre with residual water which would dilute the titrant",
        "To sterilise the burette",
        "To check for leaks in the stopcock",
      ],
      correctIndex: 1,
      explanation:
        "Any water remaining in the burette would dilute the titrant, lowering its effective concentration and giving a larger titre than expected, leading to systematic error.",
    },
    {
      id: "t5",
      question: "The steep near-vertical region on a pH titration curve occurs because:",
      options: [
        "The buffer capacity is highest at that point",
        "A very small addition of titrant causes a very large change in pH",
        "The indicator is most sensitive to light at that pH",
        "The reaction rate slows dramatically near the endpoint",
      ],
      correctIndex: 1,
      explanation:
        "Near the equivalence point, virtually all the acid (or base) has been neutralised. The slightest addition of excess titrant shifts the equilibrium dramatically, producing a large pH change from a tiny volume increment.",
    },
  ],

  electrolysis: [
    {
      id: "e1",
      question: "In the electrolysis of dilute H₂SO₄, what is produced at the cathode?",
      options: ["Oxygen gas", "Hydrogen gas", "Sulfur dioxide", "Sulfuric acid vapour"],
      correctIndex: 1,
      explanation:
        "At the cathode (negative electrode), reduction occurs: 2H⁺ + 2e⁻ → H₂. Hydrogen ions in solution migrate to the cathode and are discharged as hydrogen gas.",
    },
    {
      id: "e2",
      question: "Why is distilled water essentially a non-conductor compared with NaCl(aq)?",
      options: [
        "Water molecules are too large to pass through the circuit",
        "Distilled water contains no free ions to carry electrical charge",
        "Distilled water has too high a pH for electrolysis",
        "NaCl raises the boiling point of the solution",
      ],
      correctIndex: 1,
      explanation:
        "Electrical conduction in solution requires mobile ions. Pure water self-ionises to only 10⁻⁷ mol/L of H⁺ and OH⁻ — negligible. Dissolved NaCl provides ~1 mol/L Na⁺ and Cl⁻, which carry current effectively.",
    },
    {
      id: "e3",
      question: "During electrolysis of CuSO₄(aq) with copper electrodes, which statement is correct?",
      options: [
        "Oxygen is released at the anode and hydrogen at the cathode",
        "The anode loses mass as copper oxidises; the cathode gains mass as copper deposits",
        "The concentration of CuSO₄ doubles over time",
        "Both electrodes gain mass equally",
      ],
      correctIndex: 1,
      explanation:
        "With copper electrodes: anode: Cu → Cu²⁺ + 2e⁻ (mass decreases); cathode: Cu²⁺ + 2e⁻ → Cu (mass increases). The CuSO₄ concentration remains essentially constant as Cu²⁺ is replenished by anode dissolution.",
    },
    {
      id: "e4",
      question: "How does the volume of H₂ at the cathode compare with O₂ at the anode during electrolysis of dilute H₂SO₄?",
      options: [
        "Equal volumes",
        "Cathode produces half the volume of the anode",
        "Cathode produces double the volume of the anode",
        "Depends on voltage applied",
      ],
      correctIndex: 2,
      explanation:
        "Cathode: 4H⁺ + 4e⁻ → 2H₂. Anode: 2H₂O → O₂ + 4H⁺ + 4e⁻. For every 4 moles of electrons, 2 mol H₂ and 1 mol O₂ are produced, so H₂ volume is always double O₂ volume.",
    },
    {
      id: "e5",
      question: "Faraday's first law of electrolysis states that the mass of substance deposited is proportional to:",
      options: [
        "The voltage applied",
        "The temperature of the electrolyte",
        "The total electrical charge passed",
        "The distance between the electrodes",
      ],
      correctIndex: 2,
      explanation:
        "Faraday's first law: m = (M × Q)/(n × F). Mass deposited depends only on moles of electrons transferred (charge Q = I × t). Voltage and electrode separation affect current but not the law itself.",
    },
  ],

  "flame-test": [
    {
      id: "f1",
      question: "Why do different metal ions produce different characteristic flame colours?",
      options: [
        "They have different melting points so they burn at different stages",
        "Electrons in each element are excited to specific higher energy levels and emit photons of characteristic wavelength when returning to ground state",
        "The different metals react with oxygen at different rates",
        "Each metal has a different ionisation temperature",
      ],
      correctIndex: 1,
      explanation:
        "When heated, electrons absorb energy and jump to quantised excited levels. On returning to the ground state they emit photons whose energy (E = hf) corresponds to fixed wavelengths unique to each element's electron structure — producing the characteristic colour.",
    },
    {
      id: "f2",
      question: "Sodium produces an intense golden-yellow flame. At approximately what wavelength does it emit?",
      options: ["440 nm (violet)", "520 nm (green)", "589 nm (yellow)", "680 nm (red)"],
      correctIndex: 2,
      explanation:
        "Sodium's intense D-lines at 588.9 nm and 589.6 nm correspond to the 3p→3s electron transition. These fall in the yellow-orange region and are so intense that even trace contamination gives a bright yellow flame.",
    },
    {
      id: "f3",
      question: "Why must the nichrome loop be thoroughly cleaned between each flame test?",
      options: [
        "To prevent static charge build-up on the wire",
        "To ensure the loop is at room temperature before the next test",
        "To remove residual metal ions that could contaminate the next sample and give a false colour",
        "To increase the surface area for the next test",
      ],
      correctIndex: 2,
      explanation:
        "Residual ions on the wire, especially sodium (which is omnipresent), will enter the flame alongside the new sample, masking or mixing colours and making identification unreliable.",
    },
    {
      id: "f4",
      question: "A blue cobalt glass filter is used to distinguish Na⁺ from K⁺ in a mixed sample because:",
      options: [
        "It amplifies the potassium lilac colour",
        "It absorbs the dominant sodium yellow emission, allowing the potassium colour to be seen",
        "It converts UV to visible light",
        "It prevents the flame from extinguishing",
      ],
      correctIndex: 1,
      explanation:
        "Sodium's intense yellow emission swamps potassium's weak lilac. Cobalt blue glass selectively absorbs yellow–orange wavelengths (~570–620 nm), blocking the sodium signal. With Na⁺ removed spectrally, K⁺'s characteristic lilac becomes visible.",
    },
    {
      id: "f5",
      question: "A blue-green flame colour strongly suggests the presence of which ion?",
      options: ["Li⁺", "Ca²⁺", "Cu²⁺", "Sr²⁺"],
      correctIndex: 2,
      explanation:
        "Copper(II) ions produce a striking blue-green flame (~510 nm) due to transitions unique to Cu²⁺. Lithium is crimson, calcium is orange-red, and strontium is scarlet — none resemble blue-green.",
    },
  ],

  solubility: [
    {
      id: "s1",
      question: "What conditions are necessary to form a precipitate when two solutions are mixed?",
      options: [
        "Both solutions must be acidic",
        "The product of ion concentrations must exceed the solubility product (Ksp) of a potential compound",
        "The solutions must be at different temperatures",
        "Both solutions must have the same pH",
      ],
      correctIndex: 1,
      explanation:
        "A precipitate forms when the ionic product Q exceeds Ksp for a sparingly soluble compound. If Q < Ksp, the solution remains unsaturated and no precipitate forms.",
    },
    {
      id: "s2",
      question: "AgNO₃(aq) is added to NaCl(aq). A white precipitate forms. What is the net ionic equation?",
      options: [
        "Na⁺(aq) + NO₃⁻(aq) → NaNO₃(s)",
        "Ag⁺(aq) + Cl⁻(aq) → AgCl(s)",
        "AgNO₃(aq) + NaCl(aq) → AgCl(s) + NaNO₃(aq)",
        "2Ag⁺(aq) + 2Cl⁻(aq) → Ag₂Cl₂(s)",
      ],
      correctIndex: 1,
      explanation:
        "The net ionic equation eliminates spectator ions (Na⁺ and NO₃⁻) that do not participate in the reaction. Only Ag⁺ and Cl⁻ combine to form the insoluble AgCl precipitate.",
    },
    {
      id: "s3",
      question: "Which generalisation correctly describes the solubility of most sulphate salts?",
      options: [
        "All sulphates are insoluble",
        "All sulphates are soluble",
        "Most sulphates are soluble; BaSO₄, PbSO₄, and CaSO₄ are notable exceptions",
        "Sulphates are soluble only in acidic conditions",
      ],
      correctIndex: 2,
      explanation:
        "Most metal sulphates dissolve readily in water. The main insoluble exceptions are barium sulphate (used in X-ray contrast), lead(II) sulphate, and slightly soluble calcium sulphate (gypsum).",
    },
    {
      id: "s4",
      question: "Spectator ions in a precipitation reaction are best described as:",
      options: [
        "Ions that catalyse the precipitation",
        "Ions present in solution that do not take part in the reaction",
        "Ions that are consumed in forming the precipitate",
        "Ions that prevent the precipitate from dissolving",
      ],
      correctIndex: 1,
      explanation:
        "Spectator ions remain dissolved and unchanged throughout the reaction. They appear on both sides of the full ionic equation and are cancelled when writing the net ionic equation.",
    },
  ],

  "reaction-rate": [
    {
      id: "rr1",
      question: "Why does increasing temperature increase the rate of a chemical reaction?",
      options: [
        "Higher temperatures increase the concentration of reactants",
        "Higher temperatures increase both the frequency of collisions and the proportion of molecules with energy ≥ activation energy",
        "Higher temperatures reduce the activation energy of the reaction",
        "Higher temperatures change the stoichiometry of the reaction",
      ],
      correctIndex: 1,
      explanation:
        "Collision theory: temperature raises average kinetic energy, so molecules collide more frequently. More importantly, the Maxwell–Boltzmann distribution shifts right — a greater fraction of molecules exceed the activation energy threshold, dramatically increasing successful collision rate.",
    },
    {
      id: "rr2",
      question: "How does a catalyst increase reaction rate without being consumed?",
      options: [
        "It provides additional reactant molecules",
        "It raises the temperature of the system",
        "It provides an alternative reaction pathway with a lower activation energy",
        "It increases the concentration of products",
      ],
      correctIndex: 2,
      explanation:
        "A catalyst participates in an intermediate step that has a lower energy barrier (Ea), allowing more collisions to be successful. The catalyst is regenerated at the end and so is not consumed overall.",
    },
    {
      id: "rr3",
      question: "Powdering a solid reactant increases the reaction rate primarily because:",
      options: [
        "Powder dissolves faster",
        "It increases the surface area exposed to reactants, providing more collision sites",
        "It lowers the activation energy",
        "It raises the temperature of the solid",
      ],
      correctIndex: 1,
      explanation:
        "Reactions between a solid and a gas or liquid occur only at the surface. Reducing particle size enormously increases surface area per gram, exposing far more reactant particles for simultaneous collision — increasing rate.",
    },
    {
      id: "rr4",
      question: "Doubling the concentration of a reactant doubles the reaction rate. This means the reaction is:",
      options: [
        "Zero order with respect to that reactant",
        "First order with respect to that reactant",
        "Second order with respect to that reactant",
        "Third order with respect to that reactant",
      ],
      correctIndex: 1,
      explanation:
        "Rate = k[A]ⁿ. If doubling [A] doubles the rate, then 2¹ = 2, so n = 1. The reaction is first order with respect to that reactant.",
    },
    {
      id: "rr5",
      question: "The activation energy of a reaction is best defined as:",
      options: [
        "The energy released when bonds form in the products",
        "The total energy of all reactant molecules",
        "The minimum kinetic energy a collision must possess for the reaction to occur",
        "The energy difference between reactants and products",
      ],
      correctIndex: 2,
      explanation:
        "Activation energy (Ea) is the energy threshold — the minimum collision energy needed to break existing bonds and reach the transition state, initiating the reaction. Collisions below Ea are elastic and non-reactive.",
    },
  ],

  "gas-laws": [
    {
      id: "gl1",
      question: "Boyle's Law states that for a fixed mass of gas at constant temperature:",
      options: [
        "Volume is directly proportional to temperature",
        "Volume is directly proportional to pressure",
        "Pressure and volume are inversely proportional (PV = constant)",
        "Volume is independent of pressure",
      ],
      correctIndex: 2,
      explanation:
        "Boyle's Law: P₁V₁ = P₂V₂ at constant T and n. As pressure increases, gas molecules are compressed into a smaller volume — their frequency of wall collisions increases, maintaining constant PV.",
    },
    {
      id: "gl2",
      question: "A gas occupies 4 L at 300 K. At what temperature (constant pressure) will it occupy 6 L?",
      options: ["200 K", "450 K", "600 K", "400 K"],
      correctIndex: 1,
      explanation:
        "Charles's Law: V₁/T₁ = V₂/T₂. T₂ = T₁ × V₂/V₁ = 300 K × 6/4 = 450 K. Temperature must always be in Kelvin for gas law calculations.",
    },
    {
      id: "gl3",
      question: "At STP (0 °C, 1 atm), 1 mole of any ideal gas occupies approximately:",
      options: ["11.2 L", "22.4 L", "44.8 L", "8.31 L"],
      correctIndex: 1,
      explanation:
        "From PV = nRT: V = nRT/P = (1)(8.314)(273.15)/(101325) ≈ 0.02241 m³ = 22.4 L. This molar volume is a fundamental constant used in gas stoichiometry.",
    },
    {
      id: "gl4",
      question: "Why does a graph of P vs. 1/V give a straight line through the origin for an ideal gas (Boyle's Law)?",
      options: [
        "Because PV = constant means P = constant × (1/V), a linear relationship with zero intercept",
        "Because the gas molecules have zero volume",
        "Because intermolecular forces are constant",
        "Because the ideal gas law is only valid at low temperatures",
      ],
      correctIndex: 0,
      explanation:
        "Rearranging PV = k gives P = k × (1/V). This is of the form y = mx (m = k, y-intercept = 0), so P vs. 1/V is linear through the origin. A curved P vs. V plot becomes linear when plotted against 1/V.",
    },
  ],

  "chemical-equilibrium": [
    {
      id: "ce1",
      question: "Le Chatelier's Principle states that a system at equilibrium will:",
      options: [
        "Always shift to produce more products when disturbed",
        "Partially counteract any applied stress by shifting to re-establish equilibrium",
        "Reach a new equilibrium only if the catalyst is changed",
        "Remain unchanged when temperature is altered",
      ],
      correctIndex: 1,
      explanation:
        "Le Chatelier's Principle: when a stress (concentration, pressure, or temperature change) is applied, the equilibrium shifts in the direction that partially opposes the stress, re-establishing a new equilibrium position.",
    },
    {
      id: "ce2",
      question: "In the reaction Fe³⁺(aq) + SCN⁻(aq) ⇌ FeSCN²⁺(aq), adding more Fe³⁺ will:",
      options: [
        "Shift equilibrium to the left, decreasing [FeSCN²⁺]",
        "Shift equilibrium to the right, increasing [FeSCN²⁺] and deepening the red colour",
        "Have no effect because Keq is constant",
        "Decrease both [Fe³⁺] and [SCN⁻] immediately",
      ],
      correctIndex: 1,
      explanation:
        "Adding Fe³⁺ increases Q above Keq. The system shifts right (forward) to consume Fe³⁺ and SCN⁻, forming more FeSCN²⁺ (the blood-red product). The colour intensifies visibly.",
    },
    {
      id: "ce3",
      question: "For the exothermic reaction A ⇌ B + heat, increasing temperature will:",
      options: [
        "Shift equilibrium right, producing more B",
        "Shift equilibrium left, producing more A",
        "Have no effect on the position of equilibrium",
        "Double the rate constant without shifting equilibrium",
      ],
      correctIndex: 1,
      explanation:
        "For an exothermic reaction, heat is a product. Increasing temperature adds heat (a stress on the product side), so the equilibrium shifts left (reverse direction) to absorb the extra heat, reducing product concentrations. Keq decreases.",
    },
    {
      id: "ce4",
      question: "The equilibrium constant Keq changes when:",
      options: [
        "The concentration of a reactant changes",
        "The pressure is changed (for a gaseous reaction)",
        "The temperature changes",
        "An inert catalyst is added",
      ],
      correctIndex: 2,
      explanation:
        "Keq is temperature-dependent only. Concentration and pressure changes shift the equilibrium position (Q changes to re-approach Keq) but Keq itself stays constant. A catalyst speeds up both forward and reverse reactions equally, reaching equilibrium faster without changing Keq.",
    },
    {
      id: "ce5",
      question: "Diluting the FeSCN²⁺ equilibrium system with water causes the solution to become less intensely red because:",
      options: [
        "Water reacts with Fe³⁺ to form FeOH²⁺",
        "Dilution decreases all ion concentrations; the system shifts left (reverse) to partially restore [FeSCN²⁺], but concentration still drops overall",
        "Water increases Keq",
        "The reaction is no longer at equilibrium after dilution",
      ],
      correctIndex: 1,
      explanation:
        "Dilution reduces concentrations of all species. Q drops below Keq; the system shifts forward (right) to partially restore FeSCN²⁺. However, since all concentrations fell, the net [FeSCN²⁺] is lower than before — the solution appears lighter in colour.",
    },
  ],

  "gas-collection": [
    {
      id: "gc1",
      question: "In the reaction CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g), which variable most directly determines how much CO₂ is produced?",
      options: [
        "The temperature of the acid",
        "The moles of the limiting reagent (CaCO₃ or HCl)",
        "The surface area of the marble chips",
        "The pressure of the laboratory",
      ],
      correctIndex: 1,
      explanation:
        "The amount of CO₂ is determined by stoichiometry — specifically by whichever reactant runs out first (the limiting reagent). Surface area affects rate but not the total yield. Temperature and pressure affect volume but not moles.",
    },
    {
      id: "gc2",
      question: "Why is CO₂ collected over water rather than over mercury in a school laboratory?",
      options: [
        "CO₂ reacts with mercury",
        "Mercury is denser than CO₂",
        "Mercury is toxic; water displacement is safer and practical for low-hazard gases",
        "CO₂ is more soluble in mercury than in water",
      ],
      correctIndex: 2,
      explanation:
        "Mercury is highly toxic. Water displacement (downward displacement of water / gas collection over water) is a safe, simple method. The slight solubility of CO₂ in water causes minor underestimation of volume but is acceptable at school level.",
    },
    {
      id: "gc3",
      question: "Why do smaller marble chips react faster than large lumps of the same total mass?",
      options: [
        "Smaller chips have higher density",
        "Smaller chips expose more surface area to the acid, increasing collision frequency",
        "Smaller chips have a higher CaCO₃ content",
        "Smaller chips lower the activation energy",
      ],
      correctIndex: 1,
      explanation:
        "Reaction between CaCO₃ and HCl occurs at the solid surface. Smaller chips have a higher surface area-to-mass ratio, providing more simultaneous reaction sites. Total yield remains the same, but rate is faster.",
    },
  ],

  "redox-displacement": [
    {
      id: "rd1",
      question: "In the activity series, a metal higher in the series will:",
      options: [
        "Dissolve in any acid",
        "Displace a less active metal from its aqueous salt solution",
        "Always produce a blue solution",
        "Require heating before it can displace another metal",
      ],
      correctIndex: 1,
      explanation:
        "Metals higher in the electrochemical (activity) series have greater reducing power — they lose electrons more readily. A more active metal (e.g. Zn) will oxidise to Zn²⁺ while displacing a less active metal (e.g. Cu²⁺) from solution, reducing it to Cu metal.",
    },
    {
      id: "rd2",
      question: "When zinc is added to copper(II) sulphate solution, the blue colour fades. This is because:",
      options: [
        "Cu²⁺ is diluted by Zn²⁺ ions",
        "Zn displaces Cu²⁺ from solution: Zn + Cu²⁺ → Zn²⁺ + Cu. Cu²⁺ is consumed, removing the blue colour",
        "Zinc acts as a catalyst",
        "CuSO₄ precipitates as ZnSO₄ forms",
      ],
      correctIndex: 1,
      explanation:
        "Cu²⁺ gives the blue colour. Zinc (higher in activity series) reduces Cu²⁺ to copper metal, which deposits on the zinc surface. As [Cu²⁺] falls, the blue colour fades, replaced by white/colourless Zn²⁺.",
    },
    {
      id: "rd3",
      question: "Copper does NOT displace silver from AgNO₃ solution. This implies:",
      options: [
        "Silver is more reactive than copper",
        "Copper is more reactive than silver — Cu displaces Ag: Cu + 2Ag⁺ → Cu²⁺ + 2Ag",
        "Neither copper nor silver reacts with water",
        "The activation energy is too high for the reaction",
      ],
      correctIndex: 1,
      explanation:
        "Copper IS above silver in the activity series, so copper DOES displace silver. Cu + 2AgNO₃ → Cu(NO₃)₂ + 2Ag. The blue colour of Cu²⁺ appears and silver deposits. The question's premise is incorrect — the actual answer clarifies the true direction.",
    },
    {
      id: "rd4",
      question: "Oxidation in a displacement reaction refers to:",
      options: [
        "The reaction involving oxygen gas",
        "The loss of electrons by the more active metal",
        "The gain of electrons by the less active metal",
        "The dissolution of the salt in water",
      ],
      correctIndex: 1,
      explanation:
        "Oxidation = loss of electrons (OIL in OIL RIG). The more active metal is oxidised: M → Mⁿ⁺ + ne⁻. The less active metal ion is reduced: Mⁿ⁺ + ne⁻ → M. Together these form a redox (reduction–oxidation) reaction.",
    },
  ],

  calorimetry: [
    {
      id: "cal1",
      question: "The formula q = mcΔT is used in calorimetry. What does 'c' represent?",
      options: [
        "The concentration of the solution",
        "The specific heat capacity of the solution (J g⁻¹ °C⁻¹)",
        "The heat released per mole",
        "The speed of the reaction",
      ],
      correctIndex: 1,
      explanation:
        "c is the specific heat capacity — the energy required to raise 1 gram of the substance by 1 °C. For dilute aqueous solutions we use c ≈ 4.18 J g⁻¹ °C⁻¹ (same as water), since the solution is mostly water.",
    },
    {
      id: "cal2",
      question: "The neutralisation of HCl by NaOH is exothermic. This means:",
      options: [
        "Energy is absorbed from the surroundings; temperature drops",
        "Energy is released to the surroundings; temperature of the calorimeter rises",
        "The reaction requires a catalyst to proceed",
        "ΔH is positive",
      ],
      correctIndex: 1,
      explanation:
        "Exothermic reactions release energy. In the calorimeter, this heats the solution — temperature rises. ΔH is negative (energy leaves the system). The formula ΔH = −q/n uses the negative sign to convert heat absorbed by the calorimeter to the system's enthalpy change.",
    },
    {
      id: "cal3",
      question: "Why is a polystyrene cup used as the calorimeter rather than a glass beaker?",
      options: [
        "Polystyrene is transparent to infrared radiation",
        "Polystyrene is an excellent thermal insulator, minimising heat loss to surroundings",
        "Glass reacts with NaOH at high concentrations",
        "Polystyrene has a higher heat capacity than glass",
      ],
      correctIndex: 1,
      explanation:
        "Polystyrene (Styrofoam) has very low thermal conductivity. It insulates the reaction mixture, ensuring that as much heat as possible stays in the solution for temperature measurement rather than escaping to the bench or air.",
    },
    {
      id: "cal4",
      question: "The molar enthalpy of neutralisation of a strong acid–strong base is approximately −57 kJ/mol. This represents:",
      options: [
        "The heat released per gram of acid used",
        "The heat released per mole of water formed: H⁺(aq) + OH⁻(aq) → H₂O(l)",
        "The total heat released per litre of solution",
        "The activation energy of the neutralisation",
      ],
      correctIndex: 1,
      explanation:
        "For all strong acid–strong base neutralisations, the net ionic equation is the same: H⁺ + OH⁻ → H₂O. The enthalpy change (−57.1 kJ/mol) is therefore nearly constant regardless of which strong acid or base is used. It is expressed per mole of water formed.",
    },
    {
      id: "cal5",
      question: "Your experimental ΔH is −52 kJ/mol vs. the literature value of −57 kJ/mol. The most likely source of this error is:",
      options: [
        "The NaOH concentration was too high",
        "Heat loss from the calorimeter to the surroundings, giving a smaller ΔT than expected",
        "The acid was not fully ionised",
        "The thermometer was not calibrated",
      ],
      correctIndex: 1,
      explanation:
        "Experimental values are typically less exothermic than theoretical because heat escapes through the cup walls, lid, and thermometer. A smaller measured ΔT gives a smaller |q| and therefore a less negative ΔH. Better insulation or a correction factor reduces this systematic error.",
    },
  ],

  "separation-techniques": [
    {
      id: "sep1",
      question: "Which separation technique is most appropriate for separating an insoluble solid from a liquid?",
      options: [
        "Distillation",
        "Filtration",
        "Chromatography",
        "Evaporation",
      ],
      correctIndex: 1,
      explanation:
        "Filtration uses a porous medium (filter paper) to physically separate particles too large to pass through the pores from the liquid (filtrate) that flows through. It is the standard technique for separating an insoluble residue from a solution.",
    },
    {
      id: "sep2",
      question: "Distillation separates miscible liquid mixtures by exploiting differences in:",
      options: [
        "Density",
        "Solubility in water",
        "Boiling points",
        "Particle size",
      ],
      correctIndex: 2,
      explanation:
        "Distillation heats the mixture until the more volatile component (lower boiling point) evaporates preferentially. The vapour is then condensed back to liquid in a separate vessel — effectively separating the two components. Fractional distillation improves separation of close boiling points.",
    },
    {
      id: "sep3",
      question: "In paper chromatography, what does the Rf value represent?",
      options: [
        "The ratio of solvent front distance to spot distance",
        "The ratio of distance travelled by the spot to distance travelled by the solvent front",
        "The rate of flow of solvent up the paper",
        "The reflectance factor of the paper",
      ],
      correctIndex: 1,
      explanation:
        "Rf = distance moved by component / distance moved by solvent front. This dimensionless value (0–1) is characteristic of a substance under given conditions (solvent, paper type, temperature) and is used to identify compounds by comparison with standards.",
    },
    {
      id: "sep4",
      question: "Evaporation is used to recover dissolved salts from solution. The process should be stopped when:",
      options: [
        "The solution starts to boil",
        "All the water has evaporated",
        "Crystals start to appear — gentle evaporation then completes crystallisation",
        "The solution changes colour",
      ],
      correctIndex: 2,
      explanation:
        "Excessive heating after crystals appear decomposes or shatters them (spattering). The correct technique is to evaporate until a saturated solution with some crystals forms, then allow slow cooling to complete crystallisation, yielding large pure crystals.",
    },
    {
      id: "sep5",
      question: "Which technique would you use to separate a mixture of ethanol (b.p. 78 °C) and water (b.p. 100 °C)?",
      options: [
        "Simple filtration",
        "Paper chromatography",
        "Evaporation to dryness",
        "Simple distillation",
      ],
      correctIndex: 3,
      explanation:
        "Ethanol and water are miscible liquids with sufficiently different boiling points (~22 °C apart) that simple distillation can separate them. Ethanol distils first at ~78 °C; the temperature then rises as the ethanol fraction is depleted, indicating when to stop collecting the first fraction.",
    },
  ],

  // ── Class 6-7 experiments ──────────────────────────────────────────────────
  "density-floats-sinks": [
    {
      id: "df1",
      question: "An object has a density of 0.85 g/cm³. What happens when it is placed in water?",
      options: ["It sinks to the bottom", "It floats on the surface", "It dissolves in water", "It explodes"],
      correctIndex: 1,
      explanation: "Since the object's density (0.85 g/cm³) is less than water's density (1.0 g/cm³), the buoyant force is greater than the object's weight, causing it to float.",
    },
    {
      id: "df2",
      question: "Which of the following correctly states the condition for an object to sink in water?",
      options: [
        "Its density is less than 1.0 g/cm³",
        "Its density equals 1.0 g/cm³",
        "Its density is greater than 1.0 g/cm³",
        "Its mass is less than 100g",
      ],
      correctIndex: 2,
      explanation: "An object sinks when its density is greater than the density of water (1.0 g/cm³). In this case the gravitational force on the object exceeds the buoyant force.",
    },
    {
      id: "df3",
      question: "A steel ship floats despite steel being denser than water. Why?",
      options: [
        "Steel becomes less dense when shaped into a ship",
        "The hollow hull shape increases the ship's effective volume, reducing its average density below 1.0 g/cm³",
        "Water becomes denser under the ship",
        "The ship has special anti-gravity engines",
      ],
      correctIndex: 1,
      explanation: "The ship's hull encloses a large volume of air, making the ship's total mass spread over a much larger volume. This lowers the average density of the ship-plus-air system to below 1.0 g/cm³, allowing it to float — this is Archimedes' Principle.",
    },
    {
      id: "df4",
      question: "Ice floats on water. What does this tell us about the density of ice compared to liquid water?",
      options: [
        "Ice is denser than water (ρ_ice > 1.0)",
        "Ice has the same density as water (ρ_ice = 1.0)",
        "Ice is less dense than water (ρ_ice < 1.0)",
        "The density of ice changes with temperature and cannot be stated",
      ],
      correctIndex: 2,
      explanation: "Ice floats because its density (~0.92 g/cm³) is slightly less than liquid water (1.0 g/cm³). This is unusual — most substances are denser in the solid phase than the liquid phase. Ice's crystal structure leaves more empty space between molecules than liquid water.",
    },
  ],

  "dissolving-rate": [
    {
      id: "dr1",
      question: "Which change would most increase the rate at which sugar dissolves in water?",
      options: [
        "Using a larger beaker",
        "Using powdered sugar in hot water with stirring",
        "Using coarse sugar in cold water without stirring",
        "Doubling the amount of sugar",
      ],
      correctIndex: 1,
      explanation: "Powdered sugar maximises surface area; hot water provides more kinetic energy to break sugar-sugar bonds; stirring continuously brings fresh solvent into contact with the solute. Combining all three factors gives the fastest dissolving rate.",
    },
    {
      id: "dr2",
      question: "Why does stirring increase the rate of dissolving?",
      options: [
        "Stirring heats the water",
        "Stirring breaks the solute into smaller pieces",
        "Stirring moves dissolved particles away from the solute surface, bringing fresh solvent into contact",
        "Stirring reduces the amount of solute needed",
      ],
      correctIndex: 2,
      explanation: "When a solute dissolves, the region immediately around it becomes concentrated with dissolved particles, slowing further dissolving. Stirring disperses this concentrated layer and brings fresh, unsaturated solvent into contact with the solute surface.",
    },
    {
      id: "dr3",
      question: "If you crush a sugar cube before dissolving it, what happens and why?",
      options: [
        "It dissolves more slowly because the crystals are damaged",
        "It dissolves faster because it has a greater surface area exposed to the solvent",
        "It dissolves at the same rate because the total mass is unchanged",
        "It dissolves faster because crushing makes the sugar react with water",
      ],
      correctIndex: 1,
      explanation: "Crushing increases the number of faces of the sugar exposed to water. Dissolving occurs only at the surface between solute and solvent, so more surface area means more sites where water molecules can interact with sugar molecules simultaneously.",
    },
    {
      id: "dr4",
      question: "A student dissolves salt in cold water (5°C). She then repeats the experiment in hot water (80°C). What difference would she observe?",
      options: [
        "The salt dissolves more slowly in hot water",
        "The salt dissolves at the same speed regardless of temperature",
        "The salt dissolves more quickly in hot water",
        "The salt does not dissolve in cold water at all",
      ],
      correctIndex: 2,
      explanation: "In hot water, both the water molecules and the salt ions have higher kinetic energy. Water molecules collide with the salt surface more frequently and with more energy, breaking the ionic bonds between Na⁺ and Cl⁻ faster. Solubility and dissolving rate both generally increase with temperature.",
    },
  ],

  "indicator-test": [
    {
      id: "it1",
      question: "What colour does red litmus paper turn when dipped into an alkaline solution?",
      options: ["Red (stays the same)", "Blue", "Yellow", "Green"],
      correctIndex: 1,
      explanation: "Red litmus paper turns blue in alkaline (basic) conditions. The alkaline solution provides OH⁻ ions which interact with the litmus pigment, changing its structure and colour. In acidic conditions, blue litmus turns red — this is the reverse change.",
    },
    {
      id: "it2",
      question: "Lemon juice turns turmeric paper from yellow to which colour?",
      options: ["Blue", "Green", "Red / orange-red", "Stays yellow"],
      correctIndex: 3,
      explanation: "Lemon juice is acidic (pH ~2). Turmeric paper stays yellow in acidic and neutral conditions — it only changes to red in strongly basic (alkaline) conditions. So lemon juice would NOT change turmeric paper's colour.",
    },
    {
      id: "it3",
      question: "What does pH 7 indicate?",
      options: [
        "Strongly acidic",
        "Weakly acidic",
        "Neutral — equal concentrations of H⁺ and OH⁻",
        "Strongly basic",
      ],
      correctIndex: 2,
      explanation: "At pH 7, the concentration of hydrogen ions (H⁺) equals the concentration of hydroxide ions (OH⁻) — this is the neutral point. Pure water has a pH of 7. Acids have pH < 7 (more H⁺) and bases have pH > 7 (more OH⁻).",
    },
    {
      id: "it4",
      question: "Baking soda solution turns red cabbage juice from purple to which colour?",
      options: ["Red / pink", "Yellow / green", "Blue", "Stays purple"],
      correctIndex: 1,
      explanation: "Baking soda (sodium bicarbonate) is basic, with pH around 8.3. Red cabbage juice acts as a universal indicator: it's purple at neutral pH, red/pink in acid, and green/yellow in alkali. Since baking soda is basic, it turns the cabbage juice green/yellow.",
    },
  ],

  "filtration-basics": [
    {
      id: "fb1",
      question: "What is the name of the solid left on the filter paper after filtration?",
      options: ["Filtrate", "Residue", "Precipitate", "Solvent"],
      correctIndex: 1,
      explanation: "The solid that cannot pass through the filter paper and remains on it is called the residue (or residuum). The liquid that passes through is the filtrate. In this experiment, sand is the residue and the salt solution is the filtrate.",
    },
    {
      id: "fb2",
      question: "Why can filtration separate sand from saltwater but NOT salt from saltwater?",
      options: [
        "Salt is too heavy to pass through the filter paper",
        "Sand particles are small enough to pass through filter paper",
        "Salt is dissolved and exists as individual ions, which are much smaller than the filter paper pores",
        "Saltwater is too dense to pass through the filter paper",
      ],
      correctIndex: 2,
      explanation: "Filtration separates insoluble solids from liquids based on particle size. Sand particles are visible solid particles, larger than the filter paper pores — they are retained. Salt is dissolved as Na⁺ and Cl⁻ ions (~0.1 nm), far smaller than filter paper pores — they pass through with the water.",
    },
    {
      id: "fb3",
      question: "After filtering a sand-salt mixture, what technique would you use to recover the salt from the filtrate?",
      options: ["Filtration again", "Evaporation (crystallisation)", "Centrifugation", "Magnetic separation"],
      correctIndex: 1,
      explanation: "To recover dissolved salt from the filtrate, you heat the solution so the water evaporates, leaving salt crystals behind. This process is called evaporation or crystallisation. It works for any soluble solid dissolved in water.",
    },
    {
      id: "fb4",
      question: "Which of the following mixtures can be separated by filtration?",
      options: [
        "Sugar dissolved in water",
        "Alcohol and water",
        "Iron filings mixed with water",
        "Salt dissolved in vinegar",
      ],
      correctIndex: 2,
      explanation: "Filtration separates insoluble solids from liquids. Iron filings are insoluble in water — they do not dissolve and form suspended particles that can be trapped by filter paper. Sugar, salt, and alcohol are all soluble/miscible and would pass through the filter with the liquid.",
    },
  ],

  neutralization:    [],
  "salt-analysis":   [],
  "water-hardness":  [],
  "functional-groups": [],
  chromatography:    [],
};

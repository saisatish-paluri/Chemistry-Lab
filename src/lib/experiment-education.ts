// Educational content data for all 11 experiments
// Used by LabEducationPanel to display theory, apparatus, procedure & safety

export interface LabChemical {
  name: string;
  formula: string;
  concentration?: string;
  role: string;
  color?: string; // swatch color
}

export interface LabEducation {
  aim: string;
  theory: string;
  apparatus: string[];
  chemicals: LabChemical[];
  procedure: string[];
  safetyNotes: string[];
  keyEquation?: string;
  keyEquationLabel?: string;
}

export const EXPERIMENT_EDUCATION: Record<string, LabEducation> = {

  // ── Acid-Base Titration ────────────────────────────────────────────────────
  titration: {
    aim: "Determine the exact volume of 0.1 M NaOH required to completely neutralise 25 mL of 0.1 M HCl using an acid-base indicator, and calculate the molar concentration of an unknown acid.",
    theory:
      "Acid-base titration is a quantitative analytical technique that uses a neutralisation reaction to determine the concentration of an unknown solution. A strong acid (HCl) and a strong base (NaOH) react in a 1:1 molar ratio. At the equivalence point, all acid has been neutralised and the pH jumps sharply from ~4 to ~10. An indicator (phenolphthalein, litmus, or methyl orange) changes colour at a specific pH range to signal this endpoint. The reaction is: HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l). A sigmoid pH curve is obtained when pH is plotted against volume of NaOH added.",
    apparatus: [
      "Burette (50 mL, graduated to 0.1 mL)",
      "Conical flask (250 mL)",
      "Retort stand with burette clamp",
      "Burette funnel",
      "White tile (background for colour change)",
      "Pipette (25 mL) with safety filler",
      "Wash bottle with distilled water",
      "Beaker (for rinsing)",
    ],
    chemicals: [
      { name: "Hydrochloric Acid", formula: "HCl", concentration: "0.1 M", role: "Analyte (acid in flask)", color: "#fbbf24" },
      { name: "Sodium Hydroxide", formula: "NaOH", concentration: "0.1 M", role: "Titrant (base in burette)", color: "#86efac" },
      { name: "Phenolphthalein", formula: "C₂₀H₁₄O₄", concentration: "2-3 drops", role: "Indicator — colourless (acid), pink (base)", color: "#f472b6" },
      { name: "Distilled Water", formula: "H₂O", role: "Rinsing apparatus", color: "#93c5fd" },
    ],
    procedure: [
      "Rinse the burette with a small amount of NaOH solution, then fill to the 0 mL mark. Remove air bubbles from the tip.",
      "Pipette exactly 25 mL of HCl into a clean conical flask. Place the flask on the white tile.",
      "Add 2–3 drops of phenolphthalein indicator to the flask. The solution should be colourless.",
      "Record the initial burette reading to 2 decimal places.",
      "Open the stopcock and add NaOH rapidly until ~20 mL. Swirl the flask constantly.",
      "As you approach the endpoint, add NaOH drop-by-drop. Watch for a faint pink colour that fades on swirling.",
      "At the endpoint, a permanent faint pink colour persists for at least 30 seconds. Close the stopcock.",
      "Record the final burette reading and calculate the titre volume. Repeat for concordant results (within 0.1 mL).",
    ],
    safetyNotes: [
      "Both HCl and NaOH are corrosive — wear chemical-resistant gloves and safety goggles at all times.",
      "If skin contact occurs, wash immediately with large amounts of running water for 15 minutes.",
      "Never pipette by mouth — always use a safety filler or bulb.",
      "Dispose of neutralised solutions by diluting with water and pouring down the drain.",
      "Keep solutions away from eyes. Eye wash station should be accessible.",
    ],
    keyEquation: "HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)",
    keyEquationLabel: "Neutralisation Reaction",
  },

  // ── Electrolysis ────────────────────────────────────────────────────────────
  electrolysis: {
    aim: "Decompose ionic compounds using direct electric current, observe gas evolution at each electrode, verify Faraday's first law of electrolysis, and determine the ratio of gases collected at cathode vs anode.",
    theory:
      "Electrolysis is the process of using electrical energy to drive a non-spontaneous chemical reaction. When an ionic compound is dissolved in water or melted, its ions become mobile. Connecting electrodes to a DC power source forces oxidation at the anode (+) and reduction at the cathode (−). In the electrolysis of dilute H₂SO₄, water is split: 2H₂O → 2H₂ + O₂. Hydrogen collects at the cathode (H⁺ + e⁻ → ½H₂) and oxygen at the anode (H₂O → ½O₂ + 2H⁺ + 2e⁻). The ratio H₂:O₂ is 2:1 by volume, confirming the molecular formula of water. Faraday's first law states the amount of substance produced is proportional to the charge passed (Q = It).",
    apparatus: [
      "Hoffmann voltameter (or U-tube electrolysis cell)",
      "Carbon or platinum electrodes (anode and cathode)",
      "DC power supply (0–12 V variable)",
      "Ammeter (measures current in amps)",
      "Voltmeter (measures potential difference)",
      "Connecting wires with crocodile clips",
      "Graduated collection tubes",
      "Rubber stoppers and tubing",
    ],
    chemicals: [
      { name: "Sulfuric Acid (dilute)", formula: "H₂SO₄", concentration: "0.5–1.0 M", role: "Electrolyte (improves conductivity)", color: "#fbbf24" },
      { name: "Copper(II) Sulfate", formula: "CuSO₄", concentration: "1.0 M (optional)", role: "Electrolyte for copper plating demo", color: "#38bdf8" },
      { name: "Sodium Chloride", formula: "NaCl", concentration: "1.0 M (optional)", role: "Electrolyte — releases Cl₂ at anode", color: "#e2e8f0" },
      { name: "Distilled Water", formula: "H₂O", role: "Solvent for electrolyte", color: "#93c5fd" },
    ],
    procedure: [
      "Set up the electrolysis apparatus. Fill the collection tubes completely with the chosen electrolyte solution by inverting them over the electrodes.",
      "Connect the positive terminal of the DC supply to the anode and the negative terminal to the cathode. Do not switch on yet.",
      "Set the voltage to the desired value (e.g., 6 V). Ensure connections are secure.",
      "Switch on the power supply. Observe gas bubbles forming at both electrodes.",
      "Record the volume of gas collected in each tube at regular intervals (every 2 minutes).",
      "Note any colour changes in the electrolyte or deposits on electrodes (especially with CuSO₄).",
      "After collecting a measurable amount of gas, switch off the power. Record total volumes.",
      "Test the gases: H₂ with a lighted splint (squeaky pop), O₂ with a glowing splint (reignites).",
    ],
    safetyNotes: [
      "Hydrogen gas is extremely flammable — ensure no open flames near the apparatus.",
      "Chlorine gas produced from NaCl electrolysis is toxic — work in a well-ventilated area or fume cupboard.",
      "Sulfuric acid is corrosive — wear gloves and goggles. Handle with care.",
      "Do not exceed the recommended voltage to avoid dangerous gas production rates.",
      "Ensure all electrical connections are secure before switching on to prevent sparks.",
    ],
    keyEquation: "2H₂O(l) → 2H₂(g) + O₂(g)",
    keyEquationLabel: "Overall Electrolysis of Water",
  },

  // ── Flame Test ──────────────────────────────────────────────────────────────
  "flame-test": {
    aim: "Identify metal cations present in unknown salt solutions by observing the characteristic colours they produce when placed in a Bunsen burner flame, and relate these colours to the emission spectra of metal ions.",
    theory:
      "When metal salts are heated in a flame, electrons in the metal ions absorb thermal energy and jump to higher energy levels (excited state). When these electrons fall back to lower energy levels (ground state), they release the energy as photons of light. The energy of these photons corresponds to specific wavelengths, producing characteristic colours visible to the eye. Each metal ion has a unique electron configuration and thus emits light at unique wavelengths — this is the basis of atomic emission spectroscopy. For example, sodium emits at 589 nm (yellow), potassium at 766 nm (lilac), and copper at 428/510 nm (blue-green).",
    apparatus: [
      "Bunsen burner connected to gas supply",
      "Nichrome (nickel-chromium) wire loop on glass rod",
      "Hydrochloric acid (dilute, for cleaning the loop)",
      "Spotting tile or watch glass",
      "Beaker of distilled water (for rinsing)",
      "Safety goggles",
      "Tongs or heat-resistant mat",
      "Cobalt blue glass (for observing potassium through — filters sodium yellow)",
    ],
    chemicals: [
      { name: "Lithium Chloride", formula: "LiCl", role: "Produces crimson-red flame (Li⁺)", color: "#ef4444" },
      { name: "Sodium Chloride", formula: "NaCl", role: "Produces intense yellow flame (Na⁺)", color: "#fbbf24" },
      { name: "Potassium Chloride", formula: "KCl", role: "Produces lilac/violet flame (K⁺)", color: "#c084fc" },
      { name: "Calcium Chloride", formula: "CaCl₂", role: "Produces brick-red/orange flame (Ca²⁺)", color: "#f97316" },
      { name: "Copper Chloride", formula: "CuCl₂", role: "Produces blue-green/turquoise flame (Cu²⁺)", color: "#22d3ee" },
      { name: "Barium Chloride", formula: "BaCl₂", role: "Produces pale/apple-green flame (Ba²⁺)", color: "#4ade80" },
      { name: "Strontium Chloride", formula: "SrCl₂", role: "Produces crimson/scarlet flame (Sr²⁺)", color: "#f43f5e" },
    ],
    procedure: [
      "Clean the nichrome loop by dipping it in dilute HCl and holding it in the roaring part of the Bunsen flame until no colour is observed.",
      "Dip the clean loop into the first metal salt solution. Use the watch glass to collect a small sample.",
      "Hold the loop at the edge of the inner blue flame (hottest region). Observe the colour carefully.",
      "Record the colour seen. Note: sodium contamination causes yellow — use cobalt blue glass to see potassium lilac through it.",
      "Clean the loop with dilute HCl and repeat the cleaning step until no colour appears.",
      "Repeat steps 2–5 for all seven metal salt solutions, recording observations each time.",
      "Match the observed colours to the reference chart to identify each metal cation.",
      "If given unknown solutions, identify the metal ions based on flame colour.",
    ],
    safetyNotes: [
      "The Bunsen flame can reach 1560°C — never leave unattended. Keep hair and loose clothing tied back.",
      "Hydrochloric acid is corrosive — wear gloves and goggles when handling.",
      "Metal salts may be toxic — wash hands thoroughly after handling and avoid ingestion.",
      "Allow the nichrome wire to cool before touching; metals conduct heat rapidly.",
      "Ensure the gas tap is fully closed when the experiment is complete.",
    ],
    keyEquation: "M(g) → M*(g) → M(g) + hν",
    keyEquationLabel: "Atomic Emission (electron excitation → photon emission)",
  },

  // ── Gas Collection ──────────────────────────────────────────────────────────
  "gas-collection": {
    aim: "Collect CO₂ gas produced from the reaction of marble chips (CaCO₃) with hydrochloric acid using water displacement, measure the volume of gas evolved over time, and study the effect of surface area on rate of reaction.",
    theory:
      "When calcium carbonate (marble chips) reacts with hydrochloric acid, carbon dioxide gas is produced along with calcium chloride and water. Gas can be collected by water displacement — as gas is produced, it displaces water from an inverted measuring cylinder, allowing precise volume measurement. The rate of gas evolution depends on concentration of acid, temperature, and surface area of the solid (smaller chips → greater surface area → faster reaction). The reaction follows: CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g). The volume of CO₂ at room temperature and pressure can be used to calculate moles using PV = nRT.",
    apparatus: [
      "Conical flask (250 mL) with rubber stopper and delivery tube",
      "Inverted measuring cylinder (100 mL) filled with water",
      "Trough/bowl of water (for water displacement setup)",
      "Retort stand and clamp",
      "Stopwatch or timer",
      "Balance (for weighing marble chips)",
      "Spatula",
      "Thermometer",
    ],
    chemicals: [
      { name: "Calcium Carbonate (marble chips)", formula: "CaCO₃", concentration: "5 g", role: "Reactant (solid — releases CO₂)", color: "#e2e8f0" },
      { name: "Hydrochloric Acid", formula: "HCl", concentration: "1.0–2.0 M", role: "Reactant (acid that dissolves CaCO₃)", color: "#fbbf24" },
      { name: "Distilled Water", formula: "H₂O", role: "Displacement medium in collection cylinder", color: "#93c5fd" },
    ],
    procedure: [
      "Set up the water displacement apparatus: fill the measuring cylinder with water, invert it over the trough, and connect the delivery tube from the flask.",
      "Weigh 5 g of marble chips (medium sized) and add them to the conical flask.",
      "Measure 50 mL of 2.0 M HCl in a measuring cylinder.",
      "Quickly add the HCl to the marble chips and insert the stopper with delivery tube. Start the stopwatch immediately.",
      "Record the volume of gas collected in the measuring cylinder every 30 seconds.",
      "Continue until gas evolution stops (reaction complete) or the measuring cylinder is full.",
      "Plot a graph of volume of CO₂ vs. time. Calculate the average rate over the first minute.",
      "Repeat using crushed/powdered marble chips (same mass) and compare the rate of gas collection.",
    ],
    safetyNotes: [
      "Hydrochloric acid is corrosive — wear gloves and safety goggles at all times.",
      "Ensure the delivery tube is not blocked before adding acid, or pressure may build dangerously.",
      "Do not point the apparatus at anyone; gases expand rapidly.",
      "Carbon dioxide, while not toxic in small amounts, displaces oxygen — ensure adequate ventilation.",
      "Handle marble chips carefully to avoid cuts from sharp edges.",
    ],
    keyEquation: "CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)",
    keyEquationLabel: "Decomposition of Marble Chips",
  },

  // ── Solubility & Precipitation ─────────────────────────────────────────────
  solubility: {
    aim: "Investigate precipitation reactions by mixing pairs of ionic solutions, identify insoluble precipitates by their colour and appearance, write ionic equations, and verify observations against the solubility rules.",
    theory:
      "A precipitation reaction occurs when two ionic solutions are mixed and an insoluble product (precipitate) forms. This happens when the product's Ksp (solubility product constant) is exceeded. Solubility rules predict which combinations will form precipitates. For example, most sulfates are soluble except BaSO₄ and PbSO₄. Most chlorides are soluble except AgCl and PbCl₂. Most carbonates and hydroxides are insoluble. The net ionic equation shows only the ions that participate in forming the precipitate. Precipitate colour is characteristic: BaSO₄ is white, CuOH₂ is blue, Fe(OH)₃ is rust-brown, and AgCl is white/cream.",
    apparatus: [
      "Test tubes (12 mL) × 6 pairs",
      "Test tube rack",
      "Dropper pipettes or Pasteur pipettes × 6",
      "Spotting tile or white background",
      "Labels and marker",
      "Safety goggles and gloves",
      "Waste disposal container",
      "Distilled water for rinsing",
    ],
    chemicals: [
      { name: "Lead Nitrate", formula: "Pb(NO₃)₂", concentration: "0.1 M", role: "Source of Pb²⁺ ions", color: "#e2e8f0" },
      { name: "Potassium Iodide", formula: "KI", concentration: "0.1 M", role: "Source of I⁻ ions (→ yellow PbI₂)", color: "#fef08a" },
      { name: "Barium Chloride", formula: "BaCl₂", concentration: "0.1 M", role: "Source of Ba²⁺ ions", color: "#e2e8f0" },
      { name: "Sodium Sulfate", formula: "Na₂SO₄", concentration: "0.1 M", role: "Source of SO₄²⁻ (→ white BaSO₄)", color: "#e2e8f0" },
      { name: "Iron(III) Chloride", formula: "FeCl₃", concentration: "0.1 M", role: "Source of Fe³⁺ (→ rust Fe(OH)₃)", color: "#f97316" },
      { name: "Sodium Hydroxide", formula: "NaOH", concentration: "0.1 M", role: "Source of OH⁻ ions", color: "#86efac" },
    ],
    procedure: [
      "Label test tubes clearly for each combination you plan to test (e.g., Pb²⁺/I⁻, Ba²⁺/SO₄²⁻).",
      "Using a dropper, add 1 mL (~20 drops) of the first ionic solution into the test tube.",
      "Add an equal volume (1 mL) of the second ionic solution. Observe immediately.",
      "If a precipitate forms, note its colour, amount, and texture (fine, coarse, gelatinous).",
      "Write the full ionic equation and identify the precipitate's formula.",
      "Use the solubility rules to verify whether a precipitate should have formed.",
      "Carefully decant or filter the precipitate if further analysis is required.",
      "Repeat for all planned combinations. Record all results in a systematic table.",
    ],
    safetyNotes: [
      "Lead compounds are highly toxic — handle with gloves. Do NOT dispose of lead solutions down the drain; collect for hazardous waste.",
      "Barium compounds are toxic if ingested — wear gloves and avoid skin contact.",
      "Sodium hydroxide is corrosive — avoid skin and eye contact.",
      "All precipitate-containing solutions should be disposed of in designated waste containers.",
      "Wash hands thoroughly after the experiment even if gloves were worn.",
    ],
    keyEquation: "Ba²⁺(aq) + SO₄²⁻(aq) → BaSO₄(s)↓",
    keyEquationLabel: "Example Net Ionic Equation (white precipitate)",
  },

  // ── Redox Displacement ─────────────────────────────────────────────────────
  "redox-displacement": {
    aim: "Investigate metal displacement reactions by placing different metals into ionic solutions, observe evidence of redox reactions, and confirm the relative positions of metals in the electrochemical activity series.",
    theory:
      "A displacement reaction (or single replacement reaction) occurs when a more reactive metal displaces a less reactive metal from a solution of its ions. This is a redox process: the more reactive metal is oxidised (loses electrons) while the metal ion in solution is reduced (gains electrons). The electrochemical series ranks metals by their tendency to be oxidised. Metals higher in the series displace those below. For example, zinc (Zn) displaces copper (Cu²⁺) from copper sulfate solution: Zn(s) + CuSO₄(aq) → ZnSO₄(aq) + Cu(s). Observable evidence includes colour changes in solution, coating on metal surface, and temperature changes.",
    apparatus: [
      "Test tubes × 6 with rack",
      "Metal strips: zinc, iron, copper, magnesium, lead (2 cm × 0.5 cm each)",
      "Emery paper / sandpaper (for cleaning metal surfaces)",
      "Forceps or tongs",
      "Dropper pipettes",
      "White card background for observing colour changes",
      "Thermometer (optional, for measuring temperature change)",
      "Timer",
    ],
    chemicals: [
      { name: "Copper Sulfate Solution", formula: "CuSO₄", concentration: "0.1 M", role: "Source of Cu²⁺ ions (blue)", color: "#38bdf8" },
      { name: "Zinc Sulfate Solution", formula: "ZnSO₄", concentration: "0.1 M", role: "Source of Zn²⁺ ions (colourless)", color: "#e2e8f0" },
      { name: "Iron(II) Sulfate Solution", formula: "FeSO₄", concentration: "0.1 M", role: "Source of Fe²⁺ ions (pale green)", color: "#86efac" },
      { name: "Silver Nitrate Solution", formula: "AgNO₃", concentration: "0.05 M", role: "Source of Ag⁺ ions (colourless)", color: "#f8fafc" },
      { name: "Lead Nitrate Solution", formula: "Pb(NO₃)₂", concentration: "0.1 M", role: "Source of Pb²⁺ ions", color: "#e2e8f0" },
    ],
    procedure: [
      "Use emery paper to clean the surface of each metal strip until shiny. This removes oxides that would inhibit the reaction.",
      "Pour 3 mL of copper sulfate solution into a test tube. Add a zinc strip using forceps. Observe over 5 minutes.",
      "Record: (a) colour change of solution, (b) any coating or deposit on the metal surface, (c) temperature change.",
      "Test each metal strip (zinc, iron, magnesium) in each ionic solution. Create a results grid.",
      "Note: if a displacement occurs, the metal ion in solution is reduced (gains electrons) and plates out.",
      "Record which metals displace which others. No reaction = metal is less reactive than the ion in solution.",
      "From your results, construct an activity series from most reactive (top) to least reactive (bottom).",
      "Compare your experimental series with the standard electrochemical series and explain any differences.",
    ],
    safetyNotes: [
      "Lead and silver compounds are toxic — wear gloves and dispose of waste in the designated container.",
      "Metal strips have sharp edges — handle with forceps, not bare hands.",
      "Copper sulfate solution stains skin — wash off immediately with soap and water.",
      "Magnesium can react rapidly and exothermically — do not use large pieces.",
      "Do not dispose of lead or silver solutions down the drain — collect as hazardous waste.",
    ],
    keyEquation: "Zn(s) + CuSO₄(aq) → ZnSO₄(aq) + Cu(s)",
    keyEquationLabel: "Zinc displaces copper (more reactive replaces less reactive)",
  },

  // ── Separation Techniques ───────────────────────────────────────────────────
  "separation-techniques": {
    aim: "Separate components of mixtures using three classical techniques — filtration, simple distillation, and paper chromatography — and evaluate the suitability of each method for different types of mixtures.",
    theory:
      "Different separation methods exploit different physical properties of the mixture components. Filtration separates an insoluble solid from a liquid by passing the mixture through filter paper; the solid (residue) remains on the filter while the liquid (filtrate) passes through. Distillation separates miscible liquids with different boiling points; the more volatile component vaporises first. Paper chromatography separates dissolved substances by their different solubilities in a mobile solvent phase and different attractions to the stationary paper phase. The Rf value = distance travelled by substance / distance travelled by solvent front. A pure substance has a single, consistent Rf value.",
    apparatus: [
      "Filter paper and funnel (for filtration)",
      "Conical flask, evaporating basin",
      "Round-bottom flask, Liebig condenser, collection flask (for distillation)",
      "Bunsen burner, tripod, gauze mat",
      "Chromatography paper (silica or Whatman 1)",
      "Chromatography tank or beaker with cover",
      "Capillary tubes (for spotting samples)",
      "Ruler and UV lamp (for Rf measurement)",
    ],
    chemicals: [
      { name: "Sandy Mixture (or soil)", formula: "SiO₂ + soil", role: "Filtration — sand is insoluble residue", color: "#d97706" },
      { name: "Ink Dye Mixture", formula: "Various dyes", role: "Chromatography — separates by Rf value", color: "#a855f7" },
      { name: "Ethanol-Water Mixture", formula: "C₂H₅OH + H₂O", concentration: "50:50 mix", role: "Distillation — ethanol bp 78°C, water 100°C", color: "#e2e8f0" },
      { name: "Solvent (propanone or ethanol)", formula: "C₃H₆O or C₂H₅OH", role: "Mobile phase for chromatography", color: "#fef3c7" },
    ],
    procedure: [
      "FILTRATION: Fold the filter paper into a cone and place it in a funnel on a retort stand over a conical flask.",
      "Pour the sandy mixture (or soil suspension) into the funnel. Allow to filter completely. Collect and dry the residue.",
      "DISTILLATION: Set up the distillation apparatus with anti-bumping granules in the flask. Apply gentle heat.",
      "Collect the distillate (ethanol-rich fraction) in a cooled flask. Note the temperature at which each fraction distils.",
      "CHROMATOGRAPHY: Draw a pencil baseline 2 cm from the bottom of the chromatography paper.",
      "Using a capillary tube, spot a small amount of ink mixture on the baseline. Allow to dry, repeat 3 times.",
      "Place the paper in the solvent (below the baseline) in a sealed tank. Allow the solvent to rise nearly to the top.",
      "Remove and mark the solvent front. Measure the distance each spot travelled. Calculate Rf = spot distance / solvent front distance.",
    ],
    safetyNotes: [
      "Distillation involves flammable solvents — ensure no open flames. Use heating mantle or water bath when possible.",
      "Hot glassware looks identical to cold glassware — use heat-resistant gloves and tongs at all times.",
      "Organic solvents (ethanol, propanone) are flammable and produce vapours — ensure good ventilation.",
      "Do not leave distillation unattended — boiling dry can cause flask to crack or explode.",
      "Use anti-bumping granules in distillation to prevent sudden violent boiling.",
    ],
    keyEquation: "Rf = distance travelled by substance ÷ distance travelled by solvent front",
    keyEquationLabel: "Retardation Factor (chromatography)",
  },

  // ── Reaction Kinetics ──────────────────────────────────────────────────────
  "reaction-rate": {
    aim: "Investigate how temperature, concentration, and surface area independently affect the rate of a chemical reaction, apply collision theory to explain observations, and calculate rate multipliers using the Arrhenius equation concept.",
    theory:
      "Reaction rate is the change in concentration of reactants or products per unit time. According to collision theory, a reaction occurs only when reactant particles collide with sufficient energy (activation energy Ea) and in the correct orientation. Rate increases when: (1) Temperature increases — particles have more kinetic energy, more collisions exceed Ea (Arrhenius equation: k = A·e^(−Ea/RT)); (2) Concentration increases — more particles per unit volume, higher collision frequency; (3) Surface area increases — more reactant surface exposed, more collisions per unit time; (4) Catalyst present — provides alternative pathway with lower Ea. The reaction SO₂Cl₂ → SO₂ + Cl₂ or the iodine clock reaction are classic rate study examples.",
    apparatus: [
      "Conical flasks (250 mL) × 5",
      "Measuring cylinders (100 mL and 10 mL)",
      "Thermometer (0–100 °C)",
      "Water bath or Bunsen burner with beaker",
      "Stopwatch or timer",
      "White paper with cross drawn on it",
      "Ice bath (for low temperature tests)",
      "Balance (if weighing solid reactants)",
    ],
    chemicals: [
      { name: "Hydrochloric Acid", formula: "HCl", concentration: "Various (0.5, 1.0, 2.0 M)", role: "Reactant — concentration variable", color: "#fbbf24" },
      { name: "Sodium Thiosulfate", formula: "Na₂S₂O₃", concentration: "0.1–0.5 M", role: "Reactant — produces sulfur precipitate", color: "#e2e8f0" },
      { name: "Calcium Carbonate", formula: "CaCO₃", concentration: "Powder or chips", role: "Reactant — surface area variable", color: "#f8fafc" },
      { name: "Hydrogen Peroxide", formula: "H₂O₂", concentration: "1–5 volume", role: "Reactant (with MnO₂ catalyst)", color: "#e2e8f0" },
    ],
    procedure: [
      "Set up the clock reaction: mix Na₂S₂O₃ and HCl, time how long until the cross below the flask disappears (sulfur precipitate forms).",
      "TEMPERATURE EFFECT: Repeat at 10, 20, 30, 40, and 50 °C using a water bath. Record time for cross to disappear at each temperature.",
      "Calculate 1/time as a measure of rate. Plot rate vs. temperature — note the approximately exponential relationship.",
      "CONCENTRATION EFFECT: Keep temperature constant (25 °C). Vary the concentration of HCl (0.5, 1.0, 1.5, 2.0 M). Record times.",
      "SURFACE AREA EFFECT: Use CaCO₃ + HCl. Compare time for same mass of powdered vs. lumpy marble chips.",
      "For each variable, calculate the rate multiplier: rate₂/rate₁ for doubled temperature/concentration.",
      "Apply Q₁₀ rule: rate approximately doubles for every 10 °C rise in temperature.",
      "Write a conclusion comparing experimental results with collision theory predictions.",
    ],
    safetyNotes: [
      "Hydrochloric acid is corrosive — wear gloves and goggles. Avoid skin and eye contact.",
      "Sodium thiosulfate produces sulfur dioxide at low pH — work in a well-ventilated area.",
      "Hot liquids can scald — use heat-resistant gloves when handling heated solutions.",
      "Hydrogen peroxide (>10 volume) is an oxidiser and irritant — wear gloves and keep away from skin.",
      "Broken glassware can cause cuts — dispose of in a sharps container, not regular waste.",
    ],
    keyEquation: "Rate ∝ [A]ˣ[B]ʸ",
    keyEquationLabel: "Rate Law (x, y = experimentally determined orders)",
  },

  // ── Gas Laws ───────────────────────────────────────────────────────────────
  "gas-laws": {
    aim: "Verify Boyle's Law (P ∝ 1/V at constant T) and Charles's Law (V ∝ T at constant P), graph the relationships, and confirm that a fixed gas sample obeys the ideal gas equation PV = nRT.",
    theory:
      "The behaviour of ideal gases is described by three related laws. Boyle's Law (1662): At constant temperature, the pressure of a fixed mass of gas is inversely proportional to its volume — PV = constant. Charles's Law (1787): At constant pressure, the volume of a fixed mass of gas is directly proportional to its absolute temperature (in Kelvin) — V/T = constant. Gay-Lussac's Law: At constant volume, P/T = constant. These three laws combine into the ideal gas equation: PV = nRT, where n is moles of gas, R = 8.314 J mol⁻¹ K⁻¹, T is absolute temperature in K, P is pressure in Pa, and V is volume in m³. Real gases deviate from ideal behaviour at high pressure and low temperature.",
    apparatus: [
      "Gas syringe (100 mL, airtight) or Boyle's Law apparatus",
      "Pressure gauge (manometer or Bourdon gauge)",
      "Thermometer (0–100 °C)",
      "Water bath at controlled temperatures",
      "Capillary tube sealed at one end (for Charles's Law)",
      "Ruler for measuring trapped gas column length",
      "Data logger or recording sheet",
      "Graph paper or plotting software",
    ],
    chemicals: [
      { name: "Air (trapped gas sample)", formula: "N₂ + O₂ + Ar", role: "Gas under investigation", color: "#e2e8f0" },
      { name: "Dry Nitrogen", formula: "N₂", concentration: "Optional pure gas sample", role: "Inert gas for Boyle's Law apparatus", color: "#bfdbfe" },
      { name: "Water", formula: "H₂O", role: "Bath medium for temperature control", color: "#93c5fd" },
    ],
    procedure: [
      "BOYLE'S LAW: Set up the gas syringe with a fixed amount of air. Seal it with a stopper. Record initial volume (V₁) at atmospheric pressure (P₁).",
      "Apply increasing pressure by adding masses to the syringe plunger. Record P and V at each mass.",
      "Plot P vs. 1/V — a straight line through the origin confirms Boyle's Law.",
      "CHARLES'S LAW: Place a sealed capillary tube (with trapped air column) in a water bath at 0 °C. Measure the length of the gas column (proportional to volume).",
      "Heat the water bath to 10, 20, 30, 40, 50, 60, 70, 80 °C. Record gas column length at each temperature.",
      "Convert temperatures to Kelvin (K = °C + 273.15). Plot V vs. T (in K) — a straight line confirms Charles's Law.",
      "Extrapolate the line to V = 0. This gives absolute zero (−273.15 °C = 0 K).",
      "Calculate PV/nT at multiple conditions. Verify it equals R (8.314 J mol⁻¹ K⁻¹) — confirming the ideal gas equation.",
    ],
    safetyNotes: [
      "Pressurised gas apparatus can fail suddenly — stand to the side, not in line with the syringe plunger.",
      "Do not heat gas in a completely sealed container — pressure build-up can shatter glassware.",
      "Hot water baths can cause scalding — handle with tongs and heat-resistant gloves.",
      "Use only clean, dry glassware to prevent contamination affecting measurements.",
      "Check for gas leaks before beginning pressure experiments — a hissing sound indicates a leak.",
    ],
    keyEquation: "PV = nRT",
    keyEquationLabel: "Ideal Gas Equation (P in Pa, V in m³, T in K, R = 8.314 J mol⁻¹ K⁻¹)",
  },

  // ── Chemical Equilibrium ───────────────────────────────────────────────────
  "chemical-equilibrium": {
    aim: "Observe the effect of concentration changes on a dynamic equilibrium system using the Fe³⁺/SCN⁻ colour reaction, confirm Le Chatelier's Principle by shifting the equilibrium in predictable directions.",
    theory:
      "A reversible reaction reaches dynamic equilibrium when the rate of the forward reaction equals the rate of the reverse reaction, and concentrations remain constant (though reactions continue at molecular level). The equilibrium constant Keq = [products]ⁿ / [reactants]ᵐ. Le Chatelier's Principle states: If a system at equilibrium is disturbed, it will shift in the direction that partially opposes the disturbance. For the Fe³⁺/SCN⁻ system: Fe³⁺(aq) + SCN⁻(aq) ⇌ Fe(SCN)²⁺(aq). Adding more Fe³⁺ shifts equilibrium RIGHT → deeper red colour. Diluting with water shifts it LEFT → lighter colour. This system is an excellent visual model because the product Fe(SCN)²⁺ is blood-red and reactants are nearly colourless.",
    apparatus: [
      "Test tubes (12 mL) × 6",
      "Dropping pipettes × 3",
      "100 mL beaker (for dilution)",
      "Test tube rack",
      "White card background",
      "Measuring cylinder (10 mL)",
      "Marker and labels",
    ],
    chemicals: [
      { name: "Iron(III) Nitrate", formula: "Fe(NO₃)₃", concentration: "0.1 M", role: "Provides Fe³⁺ ions (equilibrium reactant)", color: "#f97316" },
      { name: "Potassium Thiocyanate", formula: "KSCN", concentration: "0.1 M", role: "Provides SCN⁻ ions (equilibrium reactant)", color: "#fef3c7" },
      { name: "Potassium Nitrate", formula: "KNO₃", concentration: "0.1 M", role: "Common-ion effect / ionic strength control", color: "#e2e8f0" },
      { name: "Distilled Water", formula: "H₂O", role: "Dilution (shifts equilibrium left)", color: "#93c5fd" },
    ],
    procedure: [
      "In a 100 mL beaker, mix 1 mL of 0.1 M Fe(NO₃)₃ with 1 mL of 0.1 M KSCN. Dilute to ~90 mL with distilled water to get a pale red equilibrium mixture.",
      "Distribute the equilibrium mixture equally into 5 test tubes. Label them 1–5. Tube 1 is the reference (no addition).",
      "Tube 2: Add 3 drops of 0.1 M Fe(NO₃)₃. Observe — more Fe³⁺ shifts equilibrium RIGHT (darker red).",
      "Tube 3: Add 3 drops of 0.1 M KSCN. Observe — more SCN⁻ shifts equilibrium RIGHT (darker red).",
      "Tube 4: Add 1 mL of distilled water. Observe — dilution decreases all concentrations, shifts LEFT (lighter red).",
      "Tube 5: Add 3 drops of 0.1 M KNO₃. Compare with reference — this tests the ionic strength effect.",
      "Compare all test tubes against the reference (Tube 1) and against each other. Record colour intensity.",
      "For each experiment, state: (a) what was changed, (b) which direction equilibrium shifted, (c) which Le Chatelier prediction this confirms.",
    ],
    safetyNotes: [
      "Iron(III) compounds stain skin and clothing — wear gloves and lab coat.",
      "Thiocyanate compounds are toxic — avoid skin contact and inhalation of vapours.",
      "Potassium nitrate is an oxidiser — keep away from flammable materials.",
      "Dispose of all iron/thiocyanate solutions in designated waste containers, not down the drain.",
      "Wash hands thoroughly after handling all chemicals.",
    ],
    keyEquation: "Fe³⁺(aq) + SCN⁻(aq) ⇌ [Fe(SCN)]²⁺(aq)",
    keyEquationLabel: "Equilibrium Reaction (blood-red complex on right)",
  },

  // ── Calorimetry ────────────────────────────────────────────────────────────
  calorimetry: {
    aim: "Measure the enthalpy change of neutralisation for the reaction of NaOH with HCl using a polystyrene cup calorimeter, apply q = mcΔT to calculate heat transferred, and determine ΔH in kJ per mole of water formed.",
    theory:
      "Calorimetry measures the heat energy transferred during a chemical reaction. An insulated calorimeter (polystyrene cup) minimises heat loss to surroundings. The heat absorbed by the solution is calculated as q = mcΔT, where m is mass of solution (g), c is specific heat capacity of solution ≈ 4.18 J g⁻¹ K⁻¹ (same as water), and ΔT is temperature change (°C or K). For the neutralisation reaction HCl + NaOH → NaCl + H₂O, the enthalpy of neutralisation is the heat released per mole of water formed. The theoretical value is −57.1 kJ/mol. ΔH = −q/n, where n = moles of water formed. A negative ΔH indicates an exothermic reaction (temperature rises).",
    apparatus: [
      "Polystyrene cup (as calorimeter) with lid",
      "Thermometer (0.1 °C precision) or temperature probe",
      "Burette (50 mL) for NaOH",
      "Measuring cylinder (100 mL) for HCl",
      "Stirring rod (glass)",
      "Balance (to weigh solutions if needed)",
      "Stopwatch",
      "Graph paper for temperature-time plots",
    ],
    chemicals: [
      { name: "Hydrochloric Acid", formula: "HCl", concentration: "1.0 M · 50 mL", role: "Acid reactant in calorimeter", color: "#fbbf24" },
      { name: "Sodium Hydroxide", formula: "NaOH", concentration: "1.0 M · added in 5 mL portions", role: "Base reactant — added from burette", color: "#86efac" },
      { name: "Distilled Water", formula: "H₂O", role: "Solvent (contribution to solution mass)", color: "#93c5fd" },
    ],
    procedure: [
      "Rinse the polystyrene cup with distilled water and dry it. Place it in a beaker for stability.",
      "Measure exactly 50 mL of 1.0 M HCl into the calorimeter. Record the initial temperature every 30 seconds for 2 minutes to establish a baseline.",
      "Add 5 mL of 1.0 M NaOH to the calorimeter. Stir gently and record temperature every 30 seconds.",
      "Continue adding 5 mL portions of NaOH and recording temperature after each addition.",
      "Continue until the temperature begins to fall (equivalence point has been passed).",
      "Plot temperature (y-axis) vs. volume of NaOH added (x-axis). Find the maximum temperature (ΔT_max).",
      "Calculate heat released: q = m × c × ΔT_max. Use m = total mass of solution (assume density 1 g/mL).",
      "Calculate moles of water formed at equivalence and compute ΔH = −q/n. Compare with −57.1 kJ/mol.",
    ],
    safetyNotes: [
      "Both HCl and NaOH are corrosive — wear gloves and safety goggles throughout the experiment.",
      "The reaction is exothermic — the calorimeter will become warm. Do not touch the sides with bare hands after reaction.",
      "Do not use a cracked polystyrene cup — corrosive solution could leak.",
      "Dispose of neutralised salt solution safely — dilute and pour down the drain.",
      "Ensure thermometer is handled carefully — mercury thermometers should not be used (use digital/alcohol type).",
    ],
    keyEquation: "q = mcΔT,   ΔH = −q/n",
    keyEquationLabel: "Heat equation and molar enthalpy calculation",
  },

  // ── Density & Floating/Sinking (Class 6) ──────────────────────────────────
  "density-floats-sinks": {
    aim: "Determine whether everyday materials float or sink in water by comparing their density (g/cm³) to that of water (1.0 g/cm³), and verify Archimedes' Principle of buoyancy.",
    theory:
      "Density is the mass per unit volume of a substance (ρ = m/V, units: g/cm³ or kg/m³). " +
      "When an object is placed in water, it experiences an upward buoyant force equal to the weight of water it displaces (Archimedes' Principle). " +
      "If the object's density is less than water (ρ < 1.0 g/cm³), the buoyant force exceeds its weight and it floats. " +
      "If its density is greater than water (ρ > 1.0 g/cm³), it sinks because its weight exceeds the buoyant force. " +
      "At exactly 1.0 g/cm³, the object is neutrally buoyant. " +
      "Note that the shape of an object can affect whether it floats — a steel ship floats because its hull shape increases its effective volume, lowering its average density below 1.0 g/cm³.",
    apparatus: [
      "Large transparent water tank (2-3 litres)",
      "Ruler and weighing balance",
      "Pieces of wood (pine), ice, plastic, wax, rubber, aluminium, steel, and stone",
      "Towel for drying materials",
      "Notebook for recording results",
    ],
    chemicals: [
      { name: "Water", formula: "H₂O", role: "Reference liquid (density = 1.0 g/cm³)", color: "#93c5fd" },
    ],
    procedure: [
      "Fill the water tank to about two-thirds full with water at room temperature.",
      "Pick up a wooden block. Estimate: do you think it will float or sink? Record your prediction.",
      "Gently place the wooden block on the surface of the water. Observe what happens.",
      "Record whether it floated or sank, and note the density value provided (0.6 g/cm³ for pine).",
      "Dry the block and repeat for each material: ice, plastic, wax, rubber, aluminium, steel, stone.",
      "After testing all materials, sort them into two groups: floaters (ρ < 1.0) and sinkers (ρ > 1.0).",
      "Discuss: why does a steel ship float even though steel sinks as a solid block?",
    ],
    safetyNotes: [
      "Dry hands before handling electrical equipment near the water tank.",
      "Handle ice carefully — cold surfaces can cause frostbite with prolonged contact.",
      "Metal objects are heavy — use two hands when placing them in the tank to avoid splashing.",
      "Wipe up any water spills immediately to prevent slipping.",
    ],
    keyEquation: "ρ = m / V",
    keyEquationLabel: "Density = mass ÷ volume (g/cm³ or kg/m³)",
  },

  // ── Dissolving Rate (Class 6–7) ────────────────────────────────────────────
  "dissolving-rate": {
    aim: "Investigate how three factors — water temperature, stirring, and particle size — affect the rate at which sugar dissolves in water, and present findings as a comparative bar chart.",
    theory:
      "Dissolving is the process by which a solute (e.g., sugar) disperses into a solvent (e.g., water) to form a solution. " +
      "The rate of dissolving depends on three key factors: " +
      "(1) Temperature: Higher temperature gives water molecules more kinetic energy, so they collide with sugar particles more frequently and forcefully, breaking bonds faster. " +
      "(2) Particle size: Smaller particles (powder vs. coarse crystals) have a greater surface area exposed to the solvent, increasing the rate of contact and dissolving. " +
      "(3) Stirring: Stirring moves dissolved sugar away from the surface of undissolved crystals, bringing fresh solvent into contact and preventing a concentrated layer forming that would slow further dissolving.",
    apparatus: [
      "3 identical glass beakers (250 mL)",
      "Measuring cylinders (100 mL)",
      "Thermometer",
      "Stirring rod",
      "Timer / stopwatch",
      "Balance (to measure equal masses of sugar)",
      "Kettle and ice for water temperature control",
    ],
    chemicals: [
      { name: "Sugar (Sucrose)", formula: "C₁₂H₂₂O₁₁", concentration: "5g per trial", role: "Solute being dissolved", color: "#fef9c3" },
      { name: "Water", formula: "H₂O", role: "Solvent", color: "#93c5fd" },
    ],
    procedure: [
      "Prepare three 100 mL water samples at cold (5°C), warm (40°C), and hot (80°C).",
      "Weigh out three equal masses of sugar (5g each) in coarse granule form.",
      "Add the sugar to cold water without stirring. Start the timer. Record the time until fully dissolved.",
      "Repeat with warm water and then hot water (same stirring — none). Compare times.",
      "Now use warm water: repeat with fine sugar and powder sugar (no stirring). Compare.",
      "Finally, use warm water with coarse sugar: compare stirred vs. unstirred.",
      "Record all times in a table. Plot a bar chart: condition on the x-axis, time on the y-axis.",
      "Conclusion: Which factor had the greatest effect on dissolving rate?",
    ],
    safetyNotes: [
      "Hot water can cause scalding — handle hot beakers with heat-resistant gloves or tongs.",
      "Do not heat water to boiling without supervision.",
      "Powdered substances can become airborne — avoid inhaling dust.",
      "Clean up sugar spills promptly to avoid attracting insects.",
    ],
    keyEquation: "Dissolving rate ↑ with: higher T, smaller particle size, stirring",
    keyEquationLabel: "Factors affecting rate of dissolving",
  },

  // ── Indicator Test (Class 7) ───────────────────────────────────────────────
  "indicator-test": {
    aim: "Test eight common household substances with natural and synthetic indicators (turmeric, litmus, red cabbage juice) to classify each substance as acidic, neutral, or basic using colour changes.",
    theory:
      "An indicator is a substance that changes colour depending on the pH of its surroundings. " +
      "The pH scale runs from 0 to 14: pH < 7 is acidic, pH = 7 is neutral, pH > 7 is basic (alkaline). " +
      "Natural indicators like turmeric (curcumin pigment) and red cabbage juice (anthocyanins) contain molecules that change structure — and therefore colour — when H⁺ or OH⁻ ions are present. " +
      "Litmus is extracted from lichens and turns red in acid and blue in alkali. " +
      "Acids donate H⁺ ions and taste sour (e.g., vinegar, lemon juice). " +
      "Bases accept H⁺ ions and feel slippery (e.g., soap, baking soda). " +
      "Neutral substances have equal H⁺ and OH⁻ concentrations (e.g., pure water, salt solution).",
    apparatus: [
      "Petri dishes or test tubes (8)",
      "White tiles (background for colour comparison)",
      "Droppers / pipettes",
      "Turmeric paper strips (or fresh turmeric solution on filter paper)",
      "Red and blue litmus paper strips",
      "Red cabbage juice (extracted by boiling cabbage)",
    ],
    chemicals: [
      { name: "Vinegar (Acetic Acid)", formula: "CH₃COOH (dilute)", role: "Acidic test substance", color: "#fef9c3" },
      { name: "Lemon Juice (Citric Acid)", formula: "C₆H₈O₇ (aq)", role: "Acidic test substance", color: "#fef9c3" },
      { name: "Baking Soda Solution", formula: "NaHCO₃(aq)", role: "Basic test substance", color: "#f1f5f9" },
      { name: "Soap Solution", formula: "Sodium stearate (aq)", role: "Basic test substance", color: "#f1f5f9" },
      { name: "Distilled Water", formula: "H₂O", role: "Neutral reference", color: "#93c5fd" },
    ],
    procedure: [
      "Place a small sample (5 mL) of each substance in a labelled petri dish.",
      "Dip a strip of turmeric paper into vinegar. Record the colour change.",
      "Repeat for all 8 substances with turmeric paper. Record results.",
      "Now use red litmus paper — test each substance. Note: red litmus turns BLUE in alkali.",
      "Use blue litmus paper — note that blue litmus turns RED in acid.",
      "Finally use a few drops of red cabbage juice in each sample. Record colours.",
      "Create a results table: substance vs. indicator colour vs. classification (acid/neutral/base).",
      "Compare your results with pH values and explain each observation.",
    ],
    safetyNotes: [
      "Ammonia solution is pungent — use in a well-ventilated area and avoid inhaling fumes.",
      "Do not taste any substances, even household items like vinegar.",
      "Wash hands after handling chemicals.",
      "Dispose of all test substances by diluting with water and pouring down the drain.",
    ],
    keyEquation: "pH < 7 = Acidic  |  pH = 7 = Neutral  |  pH > 7 = Basic",
    keyEquationLabel: "pH scale and classification",
  },

  // ── Filtration Basics (Class 6) ────────────────────────────────────────────
  "filtration-basics": {
    aim: "Separate an insoluble solid (sand) from a liquid (salt solution) using filtration through a funnel and filter paper, and understand the difference between filtrate and residue.",
    theory:
      "Filtration is a physical separation technique used to separate an insoluble solid from a liquid. " +
      "It works because filter paper has tiny pores (holes) that are large enough to allow liquid molecules to pass through but small enough to block solid particles. " +
      "The liquid that passes through is called the filtrate; the solid that remains on the paper is the residue. " +
      "In this experiment, sand (SiO₂) is insoluble in water — it does not dissolve. " +
      "Salt (NaCl) is soluble — it dissolves into Na⁺ and Cl⁻ ions that pass through the filter paper in the filtrate. " +
      "The filtrate therefore contains the salt solution. To recover the salt, the filtrate would need to be evaporated. " +
      "Filtration cannot separate dissolved solids from a solution — for that, evaporation or crystallisation is used.",
    apparatus: [
      "Glass funnel",
      "Filter paper (Whatman No. 1 or equivalent)",
      "Glass rod (for folding filter paper)",
      "Retort stand with ring clamp",
      "2 beakers (250 mL)",
      "Stirring rod",
      "Wash bottle with distilled water",
    ],
    chemicals: [
      { name: "Sand (Silicon Dioxide)", formula: "SiO₂", role: "Insoluble solid to be separated (residue)", color: "#d4a96a" },
      { name: "Sodium Chloride", formula: "NaCl", concentration: "3g in 100 mL", role: "Soluble solid (remains in filtrate)", color: "#f1f5f9" },
      { name: "Distilled Water", formula: "H₂O", role: "Solvent", color: "#93c5fd" },
    ],
    procedure: [
      "Add 5g of sand and 3g of salt to 100 mL of distilled water in a beaker. Stir for 30 seconds.",
      "Fold a circular filter paper into a cone shape (four layers on one side). Place it in the funnel.",
      "Wet the filter paper with a few drops of distilled water to help it adhere to the glass.",
      "Set up the funnel in the ring clamp above a clean beaker to collect the filtrate.",
      "Carefully pour the sand-salt-water mixture into the funnel. Do not fill above the filter paper.",
      "Allow the liquid to drain through completely. Pour any remaining mixture in small batches.",
      "Observe: the filtrate should be clear (salt solution). The residue on the paper is wet sand.",
      "Compare the filtrate appearance with the original mixture. Note the difference in clarity.",
    ],
    safetyNotes: [
      "Glass funnels can break if dropped — handle with care.",
      "Pour liquid slowly to avoid splashing or overflowing the filter paper.",
      "Keep the retort stand stable to prevent it from tipping over.",
      "Dry the bench surface immediately if any spillage occurs.",
    ],
    keyEquation: "Mixture → Filter paper → Filtrate (liquid + dissolved salt) + Residue (sand)",
    keyEquationLabel: "Filtration: separating insoluble solid from solution",
  },

  // ── Neutralization Reaction ────────────────────────────────────────────────
  neutralization: {
    aim: "Study the neutralisation reaction between hydrochloric acid (HCl) and sodium hydroxide (NaOH), confirm the exothermic nature by measuring temperature rise, and identify the products formed.",
    theory:
      "Neutralisation is the reaction between an acid and a base to produce a salt and water. When HCl reacts with NaOH, they react in a 1:1 molar ratio. The reaction is exothermic — it releases heat energy. The enthalpy of neutralisation for strong acid–strong base reactions is approximately −55.8 kJ/mol. Measuring the temperature rise allows calculation of the heat released: q = mcΔT. The product NaCl (common salt) remains dissolved in the neutral solution (pH ≈ 7). At the ionic level: H⁺(aq) + OH⁻(aq) → H₂O(l). Equal moles of HCl and NaOH produce a perfectly neutral solution.",
    apparatus: [
      "Beaker (250 mL) — for holding the HCl solution",
      "Measuring cylinder (50 mL) — for accurate volume measurement",
      "Thermometer (0–100°C, graduated to 0.1°C)",
      "Stirring rod (glass)",
      "Dropper (for careful addition)",
      "Safety goggles and chemical-resistant gloves",
    ],
    chemicals: [
      { name: "Hydrochloric Acid", formula: "HCl", concentration: "0.1 M", role: "Acid reactant", color: "#fbbf24" },
      { name: "Sodium Hydroxide", formula: "NaOH", concentration: "0.1 M", role: "Base reactant", color: "#86efac" },
      { name: "Sodium Chloride", formula: "NaCl", role: "Product — salt formed", color: "#e2e8f0" },
      { name: "Water", formula: "H₂O", role: "Product — solvent", color: "#bae6fd" },
    ],
    procedure: [
      "Measure exactly 25 mL of 0.1 M HCl using a measuring cylinder and pour into a clean beaker.",
      "Record the initial temperature of the HCl solution using the thermometer.",
      "Measure 25 mL of 0.1 M NaOH separately in a clean measuring cylinder.",
      "Quickly pour the NaOH into the beaker containing HCl and stir with the glass rod.",
      "Monitor the temperature — it rises as the exothermic reaction proceeds.",
      "Record the maximum temperature reached. This is the final temperature.",
      "Calculate ΔT = T_final − T_initial and use q = mcΔT to find heat released.",
      "Evaporate the resulting solution to recover the NaCl product.",
    ],
    safetyNotes: [
      "Both HCl and NaOH are corrosive — wear goggles and gloves throughout.",
      "Handle the thermometer carefully — mercury thermometers are fragile and toxic.",
      "Do not inhale fumes from concentrated acid or base.",
      "Neutralise spills with dilute sodium bicarbonate solution before wiping.",
    ],
    keyEquation: "HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)   ΔH = −55.8 kJ/mol",
    keyEquationLabel: "Neutralisation Reaction (exothermic)",
  },

  // ── Qualitative Salt Analysis ─────────────────────────────────────────────
  "salt-analysis": {
    aim: "Identify an unknown inorganic salt by performing systematic cation and anion tests, interpreting observations, and confirming the identity of the compound.",
    theory:
      "Qualitative analysis identifies the ions present in a salt using characteristic reactions. Cation tests detect the metal ion: NaOH addition forms characteristic coloured precipitates (Cu²⁺ → blue, Fe³⁺ → red-brown, Zn²⁺ → white amphoteric). Flame tests identify Ca²⁺ (brick-red) and Na⁺ (yellow). NH₄⁺ evolves NH₃ gas when heated with NaOH. Anion tests identify the non-metal ion: AgNO₃ gives white precipitate with Cl⁻ (AgCl); BaCl₂ gives white precipitate with SO₄²⁻ (BaSO₄, insoluble in HCl); dilute HCl produces CO₂ effervescence with CO₃²⁻; the brown-ring test confirms NO₃⁻.",
    apparatus: [
      "Test tubes and test tube stand",
      "Droppers (several — one per reagent to avoid cross-contamination)",
      "Spirit lamp / Bunsen burner for flame tests",
      "Nichrome loop (cleaned for each test)",
      "Glass rod for stirring",
      "White tile (as background to observe precipitate colours)",
    ],
    chemicals: [
      { name: "Sodium Hydroxide", formula: "NaOH", concentration: "2 M", role: "Cation test reagent", color: "#86efac" },
      { name: "Silver Nitrate",   formula: "AgNO₃", concentration: "0.1 M", role: "Chloride anion test", color: "#f1f5f9" },
      { name: "Barium Chloride",  formula: "BaCl₂", concentration: "0.1 M", role: "Sulfate anion test", color: "#e0e7ff" },
      { name: "Dilute HCl",       formula: "HCl",  concentration: "2 M",   role: "Carbonate anion test", color: "#fbbf24" },
    ],
    procedure: [
      "Dissolve a small amount of the unknown salt in distilled water in a test tube.",
      "Record preliminary observations: colour, clarity, and odour of the solution.",
      "For cation test: add a few drops of 2 M NaOH. Observe any precipitate colour.",
      "For flame test (if applicable): clean the nichrome loop and dip in the salt solution, then hold in the Bunsen flame.",
      "For anion test (Cl⁻): add a few drops of AgNO₃ solution. White curdy precipitate → chloride.",
      "For anion test (SO₄²⁻): add BaCl₂ and then dilute HCl. Persistent white precipitate → sulfate.",
      "For anion test (CO₃²⁻): add dilute HCl. Brisk effervescence and CO₂ turning limewater milky → carbonate.",
      "Combine all observations to determine the cation and anion, then state the complete name and formula.",
    ],
    safetyNotes: [
      "Silver nitrate stains skin and clothing permanently — handle with gloves.",
      "Barium chloride is toxic — avoid ingestion and wash hands after use.",
      "Concentrated NaOH is strongly corrosive — handle carefully.",
      "Flame tests require careful use of the Bunsen burner — tie back hair and loose clothing.",
    ],
    keyEquation: "Cu²⁺ + 2OH⁻ → Cu(OH)₂↓ (blue)   |   Cl⁻ + Ag⁺ → AgCl↓ (white)",
    keyEquationLabel: "Representative cation and anion confirmatory tests",
  },

  // ── Water Hardness (EDTA) ─────────────────────────────────────────────────
  "water-hardness": {
    aim: "Determine the total hardness of a water sample due to dissolved Ca²⁺ and Mg²⁺ ions by EDTA complexometric titration, and classify the sample according to WHO hardness categories.",
    theory:
      "Water hardness is caused by dissolved calcium and magnesium salts (bicarbonates, sulfates, chlorides). EDTA (ethylenediaminetetraacetic acid) is a chelating agent that forms stable 1:1 complexes with Ca²⁺ and Mg²⁺ at pH 10. Eriochrome Black T (EBT) indicator forms a wine-red complex with the metal ions at pH 10. As EDTA is added, it displaces the indicator from the metal ions — the solution changes from wine-red through purple to pure blue at the endpoint. Total hardness = (V_EDTA × M_EDTA × 100.09 × 1000) / V_sample, expressed in mg/L as CaCO₃. Categories: Soft < 75, Moderately Hard 75–150, Hard 150–300, Very Hard > 300 mg/L.",
    apparatus: [
      "Burette (50 mL) with clamp and retort stand",
      "Conical flask (250 mL)",
      "Pipette (100 mL) with safety filler",
      "Measuring cylinder (25 mL)",
      "Magnetic stirrer or glass rod",
    ],
    chemicals: [
      { name: "EDTA",                     formula: "C₁₀H₁₆N₂O₈", concentration: "0.01 M", role: "Titrant — chelates Ca²⁺ and Mg²⁺", color: "#86efac" },
      { name: "Hard Water Sample",         formula: "H₂O + Ca²⁺/Mg²⁺", role: "Analyte", color: "#bae6fd" },
      { name: "Ammonia Buffer",            formula: "NH₃/NH₄Cl", concentration: "pH 10", role: "Maintains pH 10 for EBT to work", color: "#fde68a" },
      { name: "Eriochrome Black T",        formula: "EBT", concentration: "0.1%", role: "Indicator — wine-red to blue at endpoint", color: "#9f1239" },
    ],
    procedure: [
      "Rinse the burette with 0.01 M EDTA solution and fill to 0.00 mL. Remove air bubbles.",
      "Pipette 100 mL of the hard water sample into a clean conical flask.",
      "Add 2 mL of ammonia buffer solution (pH 10) to the flask.",
      "Add 3–4 drops of Eriochrome Black T indicator. Solution turns wine-red.",
      "Titrate with EDTA from the burette, swirling constantly. Add rapidly until near endpoint.",
      "Near endpoint, add EDTA drop by drop. Watch for the colour change from wine-red through purple.",
      "Stop at the first permanent pure blue colour — this is the endpoint.",
      "Record EDTA volume used and calculate: Hardness (mg/L) = (V_EDTA × 0.01 × 100.09 × 1000) / 0.1.",
    ],
    safetyNotes: [
      "The ammonia buffer has a strong smell — work in a well-ventilated area.",
      "EDTA is not highly toxic but avoid ingestion — wash hands after the experiment.",
      "EBT indicator can stain — handle carefully.",
      "Never pipette by mouth — always use a safety filler.",
    ],
    keyEquation: "Ca²⁺ + EDTA⁴⁻ → [Ca-EDTA]²⁻  (EBT released → solution turns blue)",
    keyEquationLabel: "EDTA chelation at equivalence point",
  },

  // ── Functional Group Identification ──────────────────────────────────────
  "functional-groups": {
    aim: "Identify the functional groups present in unknown organic compounds using characteristic chemical tests — Lucas test (alcohol), Tollen's test (aldehyde), 2,4-DNP test (ketone/aldehyde), NaHCO₃ test (carboxylic acid), and Hinsberg test (amine).",
    theory:
      "Organic functional groups are reactive structural features that determine a compound's chemical behaviour. Each group gives characteristic reactions with specific reagents. The Lucas test uses ZnCl₂/conc. HCl to convert alcohols to alkyl chlorides (turbidity). Tollen's reagent [Ag(NH₃)₂]⁺ is reduced by aldehydes to metallic silver (mirror). 2,4-Dinitrophenylhydrazine (Brady's reagent) forms coloured hydrazone precipitates with carbonyl compounds. Sodium bicarbonate reacts with carboxylic acids releasing CO₂ (effervescence). The Hinsberg test uses benzenesulfonyl chloride to form sulfonamides characteristic of primary, secondary, or tertiary amines.",
    apparatus: [
      "Test tubes (clean, dry)",
      "Test tube rack",
      "Droppers (separate for each reagent)",
      "Water bath (for Tollen's test warming)",
      "Safety goggles and chemical-resistant gloves",
    ],
    chemicals: [
      { name: "Lucas Reagent",        formula: "ZnCl₂ + conc. HCl", role: "Tests for alcohols — produces turbidity", color: "#fef9c3" },
      { name: "Tollen's Reagent",     formula: "[Ag(NH₃)₂]⁺",       role: "Tests for aldehydes — silver mirror", color: "#f1f5f9" },
      { name: "2,4-DNP Reagent",      formula: "C₆H₃(NO₂)₂NHNH₂",  role: "Tests for carbonyls — orange precipitate", color: "#fed7aa" },
      { name: "Sodium Bicarbonate",   formula: "NaHCO₃", concentration: "5%", role: "Tests for carboxylic acids — CO₂ gas", color: "#d1fae5" },
    ],
    procedure: [
      "Take a small amount (5 drops) of the unknown compound in a clean test tube.",
      "For Lucas test: add Lucas reagent and observe turbidity (shake, wait 5 min). Turbid → alcohol.",
      "For Tollen's test: add fresh Tollen's reagent and warm in water bath at 60°C for 5 min. Silver mirror → aldehyde.",
      "For 2,4-DNP test: add Brady's reagent. Orange/yellow precipitate → aldehyde or ketone.",
      "For NaHCO₃ test: add 5% NaHCO₃ solution. Brisk effervescence → carboxylic acid.",
      "For Hinsberg test: add benzenesulfonyl chloride + KOH. Product soluble in KOH → primary amine.",
      "Repeat with a different reagent to confirm positive identification.",
      "Record all observations systematically and identify the functional group.",
    ],
    safetyNotes: [
      "Tollen's reagent must be freshly prepared and used immediately — aged reagent can form explosive silver nitride.",
      "2,4-DNP reagent is harmful — avoid skin contact and work in a fume cupboard.",
      "Do not mix Tollen's reagent with aldehydes in large quantities — use only a few drops.",
      "Lucas reagent contains concentrated HCl — corrosive, use with care.",
    ],
    keyEquation: "RCHO + 2[Ag(NH₃)₂]⁺ → RCOO⁻ + 2Ag↓ + 4NH₃ + H₂O",
    keyEquationLabel: "Tollen's Test — Silver Mirror (aldehyde)",
  },

  // ── Paper Chromatography ─────────────────────────────────────────────────
  chromatography: {
    aim: "Separate the dye components of ink mixtures using paper chromatography, calculate Rf values for each component, and use these values to identify individual dyes.",
    theory:
      "Chromatography separates mixtures based on different affinities of components for a stationary phase and a mobile phase. In paper chromatography, the stationary phase is cellulose paper (polar) and the mobile phase is an organic solvent (less polar). The mobile phase rises up the paper by capillary action, carrying the dyes with it. More polar dyes interact strongly with the paper and move slowly (low Rf). Less polar dyes interact weakly with the paper and move quickly (high Rf). The Rf (retention factor or retardation factor) is defined as: Rf = distance travelled by solute / distance travelled by solvent front. Rf values are characteristic of a compound under defined conditions and can be used for identification. Multiple dyes in ink separate into distinct coloured bands.",
    apparatus: [
      "Chromatography paper (Whatman No. 1 or equivalent)",
      "Developing chamber (glass jar with lid)",
      "Capillary tube (for spot application)",
      "Pencil (to mark baseline and front — never use pen!)",
      "Ruler (to measure distances)",
      "UV lamp or iodine chamber (for colourless spots)",
    ],
    chemicals: [
      { name: "Ink sample",      formula: "Mixed dyes",       role: "Mixture to be separated", color: "#1e293b" },
      { name: "Ethanol / Water", formula: "EtOH : H₂O",      role: "Mobile phase (solvent)", color: "#bae6fd" },
      { name: "n-Butanol",       formula: "C₄H₉OH",          role: "Alternative solvent for better separation", color: "#fde68a" },
    ],
    procedure: [
      "Cut a strip of chromatography paper (about 3 cm wide, 15 cm long). Handle only at the edges.",
      "Draw a pencil baseline 2 cm from the bottom. Label gently with pencil.",
      "Apply a concentrated ink spot (2–3 mm diameter) using a capillary tube. Allow to dry, then apply again.",
      "Pour solvent to a depth of 1 cm in the chamber. Cover and allow the atmosphere to saturate.",
      "Place the paper in the chamber so the spot is above the solvent level. Cover immediately.",
      "Allow solvent to rise until it reaches 1–2 cm from the top. Remove the paper.",
      "Immediately mark the solvent front with pencil before it evaporates.",
      "Measure distances for each dye band and the solvent front from the baseline. Calculate Rf values.",
    ],
    safetyNotes: [
      "Organic solvents are flammable — keep away from flames and work in a well-ventilated area.",
      "Some dyes may be mildly toxic — avoid skin contact and wash hands after the experiment.",
      "UV lamps emit UV radiation — never look directly at the lamp.",
      "Handle chromatography paper carefully — grease from fingers affects separation.",
    ],
    keyEquation: "Rf = Distance travelled by solute / Distance travelled by solvent front",
    keyEquationLabel: "Retention Factor (0 = no movement, 1 = same as solvent)",
  },
};

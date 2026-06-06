# Image Attribution

All photographs used in ChemLab are sourced from **Wikimedia Commons** (https://commons.wikimedia.org).
Images are used under their respective Creative Commons licenses (CC BY, CC BY-SA, CC0, or Public Domain).
Attribution is required for CC BY / CC BY-SA works.

---

## Experiment Card Images (ExperimentsIndex.tsx)

Each experiment card displays a verified, experiment-specific Wikimedia Commons photograph at high opacity
(82 %) as the primary visual. An SVG illustration is shown as fallback if the photo fails to load.

| Experiment            | iconId       | Wikimedia File                                                                     | Subject shown                                 | License         |
|-----------------------|--------------|------------------------------------------------------------------------------------|-----------------------------------------------|-----------------|
| Acid-Base Titration   | titration    | `The_orange_colour_in_a_titration_conical_flask.jpg`                               | Orange endpoint colour in conical flask        | CC BY-SA 3.0    |
| Flame Test            | flame        | `Coloured_flames_of_methanol_solutions_of_metal_salts_and_compounds.jpg`           | Coloured flames from different metal salts     | CC BY-SA 3.0    |
| Electrolysis          | electrolysis | `Electrolysis_Apparatus.png`                                                       | Electrode apparatus in ionic solution          | CC BY-SA 3.0    |
| Gas Collection        | gasCollect   | `Gas_Collection_with_Water_Displacement_Possible_Acetylene.jpg`                    | Gas collected by water displacement            | CC BY-SA 3.0    |
| Solubility            | solubility   | `CopperSulphate.JPG`                                                               | Vivid blue copper sulfate ionic solution       | CC BY-SA 3.0    |
| Redox Displacement    | redox        | `Zinc_and_copper_sulfate.JPG`                                                      | Zinc strip in copper sulfate solution          | CC BY-SA 3.0    |
| Separation Techniques | separation   | `Paper_chromatography_in_progress.jpg`                                             | Chromatography paper with coloured bands       | CC BY-SA 3.0    |
| Reaction Kinetics     | kinetics     | `Copper_flame_test.JPG`                                                            | Rapid chemical reaction in burner flame        | CC BY-SA 3.0    |
| Gas Laws              | gas          | `Gax_expanding_doing_work_on_a_piston_in_a_cylinder.jpg`                           | Gas-piston cylinder illustrating Boyle's Law   | CC BY-SA 3.0    |
| Chemical Equilibrium  | equilibrium  | `Aqueous_ferric_thiocyanate_(Fe(SCN)n)_hydrate_mix.jpg`                            | Red-orange iron(III) thiocyanate solution      | CC BY-SA 3.0    |
| Calorimetry           | calorimetry  | `Coffee_cup_calorimeter_pic.jpg`                                                   | Coffee-cup (polystyrene) calorimeter setup     | CC BY-SA 3.0    |
| Density               | density      | `Density_column.JPG`                                                               | Density column — layered liquids by density    | CC BY-SA 3.0    |
| Filtration Basics     | filtration   | `Cold_Filtration_(with_stirring_rod).jpg`                                          | Active filtration through funnel/filter paper  | CC BY-SA 3.0    |
| Dissolving Rate       | dissolving   | `Sucrose_crystals.JPG`                                                             | Sucrose crystals — solubility / crystal growth | CC BY-SA 3.0    |
| Indicator Test        | indicator    | `Blue_and_red_litmus_paper.JPG`                                                    | Blue and red litmus paper strips               | CC BY-SA 3.0    |

Base URL: `https://upload.wikimedia.org/wikipedia/commons/`

---

## Apparatus Card Images (ApparatusSection.tsx)

Each apparatus card uses a verified Wikimedia Commons photo (45–50 % opacity) behind its SVG illustration.
The SVG always remains visible; the photo adds visual texture and realism.

| Apparatus              | id                    | Wikimedia File                                               | Subject shown                           | License         |
|------------------------|-----------------------|--------------------------------------------------------------|-----------------------------------------|-----------------|
| Burette                | burette               | `Burette.png`                                                | Technical diagram of glass burette      | Public Domain   |
| Conical Flask          | conical-flask         | `Erlenmeyer_flask_hg.jpg`                                    | Erlenmeyer (conical) flask              | CC BY-SA 3.0    |
| Bunsen Burner          | bunsen-burner         | `Mechero_Bunsen.jpg`                                         | Bunsen burner with blue flame           | CC BY-SA 4.0    |
| Beaker                 | beaker                | `Stainless_Steel_Test_Tube_Rack.JPG`                         | Lab glassware (test tube rack)          | CC BY-SA 4.0    |
| Nichrome Wire Loop     | nichrome-loop         | `Copper_flame_test.JPG`                                      | Flame-test wire loop in burner          | CC BY-SA 3.0    |
| DC Power Supply        | dc-power-supply       | `Hofmann_voltameter_1866.jpg`                                | Electrolysis power context              | Public Domain   |
| Carbon/Pt Electrode    | electrode             | `Electrolysis_Apparatus.png`                                 | Electrodes in ionic solution            | CC BY-SA 3.0    |
| Hofmann Voltameter     | hofmann-voltameter    | `Hofmann_voltameter_1866.jpg`                                | Classic Hofmann electrolysis apparatus  | Public Domain   |
| Indicator Solution     | indicator             | `Blue_and_red_litmus_paper.JPG`                              | Litmus indicator strips                 | CC BY-SA 3.0    |
| Measuring Cylinder     | measuring-cylinder    | `Glass_graduated_cylinder-250ml_1.jpg`                       | 250 mL graduated cylinder               | CC BY-SA 3.0    |
| Test Tube              | test-tube             | `Stainless_Steel_Test_Tube_Rack.JPG`                         | Test tube rack with test tubes          | CC BY-SA 4.0    |
| Dropping Pipette       | dropper               | `Pasteur_Pipets.jpg`                                         | Pasteur (dropping) pipettes             | CC BY-SA 3.0    |
| Evaporating Dish       | evaporating-dish      | `Abdampfschalen_verschiedene_Groessen.jpg`                    | Porcelain evaporating dishes            | CC BY-SA 3.0    |
| Laboratory Thermometer | thermometer           | `CelsiusKelvinThermometer.jpg`                               | Glass lab thermometer                   | CC BY-SA 3.0    |
| Chromatography Paper   | chromatography-paper  | `Chromatography_paper.jpg`                                   | Chromatography paper strip              | CC BY-SA 3.0    |
| Liebig Condenser       | condenser             | `LiebigCondenser.jpg`                                        | Water-cooled Liebig condenser           | CC BY-SA 3.0    |

Base URL: `https://upload.wikimedia.org/wikipedia/commons/`

---

## Local Asset Recommendation

For maximum performance, download these images locally to:
- `public/images/experiments/{iconId}.jpg`
- `public/images/apparatus/{apparatus-id}.jpg`

Recommended spec: WebP or JPEG · 480 × 320 px · ≤ 60 kB · maintain original license/attribution.

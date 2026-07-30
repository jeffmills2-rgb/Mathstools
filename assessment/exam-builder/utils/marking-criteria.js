/*
  CHHS Exam Builder — Marking Criteria
  ------------------------------------
  Generates HSC-style banded marking criteria from the standard question schema.

  The criteria are intentionally arranged from full marks down to partial
  credit, rather than splitting every mark into a separate 1-mark row.
*/

const TYPE_FULL_SOLUTION = {
  "area-triangles": "Uses the triangle area formula correctly and calculates the area with square units",
  "area-parallelograms": "Uses base × perpendicular height correctly and calculates the area with square units",
  "area-trapeziums": "Uses the trapezium area formula correctly and calculates the area with square units",
  "area-rhombuses": "Uses the kite/rhombus diagonal area formula correctly and calculates the area with square units",
  "area-kites": "Uses the kite/rhombus diagonal area formula correctly and calculates the area with square units",
  "area-circles-radius": "Uses the circle area formula correctly and gives the required form of answer",
  "area-circles-diameter": "Finds the radius from the diameter, uses the circle area formula correctly and gives the required form of answer",
  "area-sectors": "Uses the sector area formula correctly and gives the required form of answer",
  "area-semicircles": "Uses half the area of a circle correctly and gives the required form of answer",
  "area-quadrants": "Uses one-quarter of the area of a circle correctly and gives the required form of answer",
  "curved-composite-area": "Splits the figure into appropriate parts, calculates each area and combines the parts correctly",
  "perimeter-composite": "Identifies the outside edges of the composite figure and calculates the perimeter correctly with units",
  "missing-side-perimeter": "Finds the missing side length and calculates the perimeter correctly with units",
  "sector-perimeter": "Finds the arc length and adds the two radii to calculate the sector perimeter correctly",
  "semicircle-perimeter": "Finds the curved part and adds the diameter to calculate the semicircle perimeter correctly",
  "quadrant-perimeter": "Finds the curved part and adds the two radii to calculate the quadrant perimeter correctly",
  "arc-length": "Uses the arc length as a fraction of the circumference and calculates the arc length correctly",
  "distance-time-read": "Reads the required value accurately from the distance-time graph",
  "distance-time-speed": "Identifies the change in distance and change in time and calculates the average speed correctly",
  "distance-time-construct": "Constructs a distance-time graph that matches the described journey",
  "factor-tree": "Uses the factor tree to identify prime factors and writes the prime factorisation using index notation",
  "shaded-fractions": "Correctly identifies or represents the shaded fraction",
  "plot-coordinates": "Correctly plots and labels the required point on the Cartesian plane",
  "complete-table-rule": "Completes the table of values correctly",
  "graph-from-table": "Completes the table, plots the points and draws the correct straight line",
  "equation-from-table": "Identifies the gradient and y-intercept from the table and writes the correct equation",
  "graph-from-equation": "Graphs the linear relationship correctly",
  "intersecting-lines": "Graphs both lines and identifies the correct point of intersection",
  "verify-intersection": "Substitutes the point into both equations and verifies that it satisfies each equation",
  "identify-hoa": "Correctly identifies the hypotenuse, opposite side and adjacent side for the marked angle",
  "match-trig-ratios": "Correctly matches the sine, cosine and tangent ratios to the correct fractions",
  "write-trig-equation": "Selects the correct trigonometric ratio and writes a valid equation",
  "find-unknown-side": "Selects the correct trigonometric ratio, substitutes values and calculates the unknown side correctly",
  "find-unknown-angle": "Selects the correct trigonometric ratio, uses inverse trigonometry and calculates the angle correctly",
  "degrees-minutes": "Uses the given angle in degrees and minutes with an appropriate trigonometric ratio and calculates the answer correctly",
  "similar-constant-ratios": "Shows that corresponding trigonometric ratios are equal for similar right-angled triangles",
  "approximate-trig-ratios": "Uses a calculator or digital tool to find the trigonometric ratio to the required accuracy",
  "practical-problems": "Models the practical situation with a right-angled triangle, selects the correct ratio and calculates the answer correctly",
  "mixed-trigonometry": "Uses appropriate right-triangle trigonometry and provides the correct answer",
  "identify-elevation-depression": "Correctly identifies the marked angle as an angle of elevation or depression",
  "elevation-problems": "Models the angle of elevation situation with a right-angled triangle, selects the correct ratio and calculates the required value",
  "depression-problems": "Models the angle of depression situation with a right-angled triangle, selects the correct ratio and calculates the required value",
  "true-bearings": "Correctly identifies the true bearing measured clockwise from north",
  "compass-bearings": "Correctly identifies the compass bearing using north or south and east or west",
  "reverse-bearings": "Correctly identifies the reverse bearing by changing the original bearing by 180°",
  "convert-bearings": "Correctly converts between true bearing and compass bearing notation",
  "bearing-practical-with-diagram": "Uses the provided bearing diagram, selects the correct trigonometric relationship and calculates the required distance or bearing",
  "bearing-practical-no-diagram": "Draws an appropriate bearing diagram, selects the correct trigonometric relationship and calculates the required distance or bearing",
  "bearing-distance": "Uses the bearing diagram to select the correct trigonometric ratio and calculate the required distance",
  "bearing-angle": "Uses the bearing diagram to calculate the angle and expresses the result as a true bearing",
  "mixed-bearings": "Uses appropriate elevation, depression or bearing reasoning and provides the correct answer",
  "hourly-wages": "Calculates earnings using hourly rate × hours worked and gives the answer in dollars",
  "overtime-penalty-rates": "Calculates normal pay and penalty/overtime pay correctly and combines them to find total earnings",
  "salary-conversions": "Converts correctly between annual, monthly, fortnightly or weekly earnings",
  "pay-rise-percent-change": "Calculates the percentage change amount and the new or original pay correctly",
  "commission": "Calculates the commission and combines it with any retainer or base pay correctly",
  "piecework-royalties": "Calculates earnings from the piecework or royalty rate and the number of items correctly",
  "leave-loading": "Finds the eligible normal pay and calculates the leave loading correctly",
  "taxable-income": "Combines income and deductions correctly to determine taxable income",
  "tax-payable-table": "Uses the correct tax bracket and calculates the tax payable from the table correctly",
  "net-earnings-after-tax": "Determines taxable income, calculates tax payable and finds net earnings correctly",
  "simple-interest": "Uses I = Prn correctly to calculate simple interest",
  "simple-interest-time-conversion": "Converts the time to years and uses I = Prn correctly",
  "simple-interest-total-amount": "Calculates simple interest and adds it to the principal to find the total amount",
  "simple-interest-find-variable": "Rearranges or applies I = Prn correctly to find the unknown quantity",
  "simple-interest-compare": "Calculates and compares the simple interest for both options correctly",
  "simple-interest-table-graph": "Uses the graph or table correctly to find the simple interest earned",
  "buying-on-terms": "Calculates the total cost of the terms plan and the extra amount paid correctly",
  "compare-payment-options": "Calculates the total cost of each payment option and identifies the cheapest option",
  "short-term-loans": "Calculates fees, interest and the total repayment for the short-term loan correctly",
  "best-financial-option": "Compares the total cost of both options and identifies the better financial option correctly",
  "compound-repeated-simple-interest": "Calculates each period's interest from the current balance and finds the final compound value correctly",
  "compound-repeated-multiplication": "Uses the correct compound multiplier repeatedly and calculates the future value correctly",
  "compound-formula-future-value": "Substitutes into FV = PV(1 + r)^n correctly and calculates the future value",
  "compound-interest-earned": "Calculates the future value and subtracts the present value to find the compound interest earned",
  "compound-compounding-frequency": "Identifies the correct rate per compounding period and number of periods, then calculates the future value",
  "simple-vs-compound-compare": "Calculates both simple interest and compound interest options correctly and identifies the better option with the difference",
  "compound-find-present-value": "Rearranges or applies the compound interest formula correctly to calculate the present value required",
  "compound-find-rate-or-time": "Uses the compound interest formula appropriately to calculate the unknown rate or time",
  "depreciation-repeated": "Calculates depreciation period by period from the current value and finds the salvage value correctly",
  "depreciation-formula-value": "Substitutes into S = V0(1 - r)^n correctly and calculates the salvage value",
  "depreciation-amount": "Calculates the salvage value and subtracts it from the original value to find the depreciation",
  "depreciation-find-rate-or-time": "Uses the depreciation formula appropriately to calculate the unknown rate or time",
  "algebraic-fractions": "Simplifies the algebraic fraction expression correctly",
  "simplify-algebraic-fractions": "Simplifies the algebraic fraction by dividing the coefficient by the numerical denominator",
  "add-subtract-algebraic-fractions": "Uses a common denominator where needed and simplifies the algebraic fraction expression correctly",
  "multiply-algebraic-fractions": "Multiplies and simplifies the algebraic fraction expression correctly",
  "divide-algebraic-fractions": "Divides by multiplying by the reciprocal or equivalent method and simplifies correctly",
  "mixed-algebraic-fractions": "Applies the order of operations to simplify the algebraic fraction expression correctly",
  "expand-single-brackets": "Applies the distributive law correctly to expand the bracket",
  "expand-negative-coefficients": "Expands the bracket correctly, including the effect of the negative coefficient",
  "expand-collect-like-terms": "Expands the bracket and collects like terms correctly",
  "expand-two-brackets": "Expands both brackets and collects like terms correctly",
  "expand-binomial-products": "Expands the binomial product and collects like terms correctly",
  "expand-binomial-area-model": "Uses the area model to identify each partial product and writes the expanded expression correctly",
  "mixed-expansion-simplification": "Expands the brackets, applies signs correctly and simplifies the expression",
  "linear-one-step": "Solves the one-step linear equation correctly",
  "linear-two-step": "Uses inverse operations to solve the two-step linear equation correctly",
  "linear-three-step": "Uses inverse operations to solve the linear equation involving up to 3 steps correctly",
  "linear-negative-solutions": "Solves the linear equation correctly, including the negative solution",
  "linear-decimals": "Solves the linear equation with decimal values correctly",
  "mixed-linear-equations": "Solves the linear equation correctly using appropriate algebraic techniques",
  "pronumerals-both-sides": "Collects pronumeral terms and constants correctly and solves the equation",
  "pronumerals-both-sides-constants": "Collects pronumeral terms and constants from both sides correctly and solves the equation",
  "pronumerals-both-sides-negative": "Solves the equation with pronumerals on both sides, including negative terms or solutions",
  "verify-solution-substitution": "Substitutes the proposed value and correctly verifies whether it is a solution",
  "equations-one-bracket": "Solves the equation involving grouping symbols correctly",
  "equations-brackets-both-sides": "Expands both sides where needed, collects like terms and solves the equation",
  "expand-simplify-solve": "Expands, simplifies and solves the equation correctly",
  "mixed-grouping-equations": "Uses appropriate expansion and simplification to solve the equation correctly",
  "fraction-x-over-number": "Solves the equation involving a pronumeral divided by a number correctly",
  "fraction-linear-numerator": "Solves the equation involving one algebraic fraction correctly",
  "fraction-with-constant": "Uses inverse operations to solve the equation involving one algebraic fraction and a constant",
  "mixed-algebraic-fraction-equations": "Solves the equation involving one algebraic fraction correctly",
  "substitute-formulas-solve": "Substitutes values into the formula and solves for the unknown correctly",
  "write-equation-word-problem": "Forms a correct equation from the word problem, solves it and interprets the answer",
  "number-word-problems": "Forms and solves an appropriate linear equation for the number problem",
  "geometry-word-problems": "Forms and solves an appropriate linear equation for the geometry problem",
  "money-sharing-word-problems": "Forms and solves an appropriate linear equation and interprets the money amounts correctly",
  "mixed-equation-word-problems": "Forms and solves an appropriate linear equation and interprets the solution in context",
  "rectilinear-composite-area": "Splits the composite shape into appropriate rectangles or subtracts the missing part and calculates the area correctly with square units",
  "shaded-area": "Calculates the outer area and subtracts the unshaded area correctly with square units",
  "composite-area-circles": "Uses the relevant rectangle/circle/semicircle areas and combines them correctly with square units",
  "practical-area-applications": "Calculates the required area and applies the cost or rate correctly to solve the practical problem",
  "identify-prism-faces": "Correctly identifies the faces and relevant edge lengths of the prism",
  "rectangular-prism-surface-area": "Calculates the surface area of the rectangular prism or cube correctly with square units",
  "triangular-prism-surface-area": "Calculates the two triangular ends and three rectangular faces and combines them correctly",
  "trapezoidal-prism-surface-area": "Calculates the two trapezoidal ends and rectangular faces and combines them correctly",
  "composite-prism-surface-area": "Breaks the composite prism into appropriate faces or uses area and perimeter reasoning to calculate the surface area correctly",
  "recognise-valid-nets": "Correctly identifies whether the diagram is a valid net of the prism and gives an appropriate reason",
  "surface-area-from-net": "Uses the net to identify all faces and calculates the surface area correctly",
  "curved-surface-area-cylinder": "Uses the curved surface area formula for a cylinder correctly and gives the answer with square units",
  "closed-cylinder-surface-area": "Calculates the two circular bases and curved surface area to find the total surface area correctly",
  "cylinder-net-surface-area": "Uses the cylinder net to calculate the curved surface area and circular bases correctly",
  "half-cylinder-surface-area": "Identifies the exposed curved, rectangular and semicircular surfaces and calculates the total surface area correctly",
  "composite-cylinder-surface-area": "Identifies the exposed surfaces of the composite cylinder solid and calculates the total surface area correctly",
  "practical-cylinder-surface-area": "Models the practical cylinder situation and calculates the required surface area or cost correctly"
};

const TYPE_PARTIAL_CREDIT = {
  "sine-rule-side": "Identifies a correct sine rule relationship",
  "sine-rule-angle": "Identifies a correct sine rule relationship",
  "cosine-rule-side": "Identifies the correct cosine rule relationship for an unknown side",
  "cosine-rule-angle": "Identifies the correct rearranged cosine rule relationship for an unknown angle",
  "area-rule-triangle": "Substitutes relevant values into the area rule",
  "mixed-non-right-trig": "Identifies an appropriate trigonometric rule or relevant triangle relationship",
  "rectangular-prism-3d": "Finds a relevant face diagonal or identifies the required right-angled triangles",
  "three-dimensional-elevation-bearing": "Identifies the relevant right-angled triangle in the 3D context",
  "three-dimensional-practical": "Finds one relevant horizontal distance or identifies the right-angle relationship on the ground",

  "area-triangles": "Uses the triangle area formula or substitutes values correctly",
  "area-parallelograms": "Uses base × perpendicular height or substitutes values correctly",
  "area-trapeziums": "Uses an appropriate trapezium formula or identifies the parallel sides and perpendicular height",
  "area-rhombuses": "Uses an appropriate diagonal area formula or identifies the required diagonals",
  "area-kites": "Uses an appropriate diagonal area formula or identifies the required diagonals",
  "area-circles-radius": "Uses a circle area formula or substitutes the radius correctly",
  "area-circles-diameter": "Finds the radius from the diameter or uses a circle area formula",
  "area-sectors": "Identifies the correct fraction of the circle or uses the sector area formula",
  "area-semicircles": "Identifies that a semicircle is half of a circle",
  "area-quadrants": "Identifies that a quadrant is one-quarter of a circle",
  "curved-composite-area": "Correctly finds at least one relevant component area",
  "perimeter-composite": "Adds relevant outside edges or shows a valid perimeter strategy",
  "missing-side-perimeter": "Finds the missing side length or shows a valid perimeter strategy",
  "sector-perimeter": "Finds the arc length or recognises that the two radii must be included",
  "semicircle-perimeter": "Finds the curved part or recognises that the diameter must be included",
  "quadrant-perimeter": "Finds the curved part or recognises that the two radii must be included",
  "arc-length": "Identifies the correct fraction of the circumference",
  "distance-time-read": "Uses the graph appropriately but with a minor reading error",
  "distance-time-speed": "Identifies change in distance or change in time correctly",
  "distance-time-construct": "Plots some key points from the journey correctly",
  "factor-tree": "Identifies some prime factors from the factor tree",
  "shaded-fractions": "Identifies the number of shaded parts and total parts",
  "plot-coordinates": "Uses the x- and y-coordinates in the correct order",
  "complete-table-rule": "Finds at least one correct missing table value",
  "graph-from-table": "Completes at least one table value or plots at least two points correctly",
  "equation-from-table": "Identifies either the gradient or the y-intercept from the table",
  "graph-from-equation": "Finds correct coordinate pairs for the relationship",
  "intersecting-lines": "Graphs at least one of the two lines correctly",
  "verify-intersection": "Substitutes the point into at least one equation correctly",
  "identify-hoa": "Identifies at least two of the hypotenuse, opposite side and adjacent side correctly",
  "match-trig-ratios": "Correctly matches at least two trigonometric ratios",
  "write-trig-equation": "Identifies a relevant trigonometric ratio or substitutes values into a ratio",
  "find-unknown-side": "Identifies the correct trigonometric ratio or substitutes values correctly",
  "find-unknown-angle": "Identifies the correct trigonometric ratio or forms a correct inverse trigonometric expression",
  "degrees-minutes": "Uses an appropriate trigonometric ratio with the given angle",
  "similar-constant-ratios": "Calculates at least one relevant trigonometric ratio from the similar triangles",
  "approximate-trig-ratios": "Identifies the correct trigonometric function and angle",
  "practical-problems": "Identifies a relevant right-angled triangle relationship or trigonometric ratio",
  "mixed-trigonometry": "Shows an appropriate trigonometric method",
  "identify-elevation-depression": "Recognises the relevant horizontal line or direction of sight",
  "elevation-problems": "Identifies a relevant right-angled triangle relationship or trigonometric ratio",
  "depression-problems": "Identifies a relevant right-angled triangle relationship or trigonometric ratio",
  "true-bearings": "Shows that true bearings are measured clockwise from north",
  "compass-bearings": "Shows the correct reference direction or quadrant",
  "reverse-bearings": "Identifies the original bearing or recognises that reverse bearings differ by 180°",
  "convert-bearings": "Identifies the correct quadrant or reference direction",
  "bearing-practical-with-diagram": "Identifies the relevant component, reverse bearing or trigonometric ratio",
  "bearing-practical-no-diagram": "Draws a relevant diagram or identifies a useful bearing/trigonometric relationship",
  "bearing-distance": "Identifies the correct component or trigonometric ratio",
  "bearing-angle": "Forms a correct trigonometric expression for the bearing angle",
  "mixed-bearings": "Shows an appropriate bearing or trigonometric method",
  "hourly-wages": "Substitutes either the hourly rate or hours worked correctly",
  "overtime-penalty-rates": "Calculates either normal pay or penalty/overtime pay correctly",
  "salary-conversions": "Uses an appropriate conversion factor such as 52 weeks or 26 fortnights",
  "pay-rise-percent-change": "Finds the percentage change amount or sets up a valid percentage method",
  "commission": "Finds the commissionable amount or calculates part of the commission correctly",
  "piecework-royalties": "Identifies the correct rate or number of items for the calculation",
  "leave-loading": "Finds the eligible pay or applies 17.5% correctly",
  "taxable-income": "Combines at least two of the income or deduction amounts correctly",
  "tax-payable-table": "Identifies the correct tax bracket or substitutes values into the correct tax rule",
  "net-earnings-after-tax": "Finds taxable income or tax payable correctly",
  "simple-interest": "Substitutes values into I = Prn or identifies the required values",
  "simple-interest-time-conversion": "Converts the time correctly or substitutes values into I = Prn",
  "simple-interest-total-amount": "Calculates the simple interest or recognises that it must be added to the principal",
  "simple-interest-find-variable": "Shows a valid rearrangement or substitution using I = Prn",
  "simple-interest-compare": "Calculates the simple interest for at least one option correctly",
  "simple-interest-table-graph": "Reads a relevant amount or interest value from the graph or table",
  "buying-on-terms": "Calculates the total repayments or identifies the deposit and regular repayment structure",
  "compare-payment-options": "Calculates the total cost of at least one payment option correctly",
  "short-term-loans": "Calculates either the fee, interest or part of the total repayment correctly",
  "best-financial-option": "Calculates the total cost of at least one option or identifies a valid comparison method",
  "compound-repeated-simple-interest": "Correctly calculates at least one period's interest or closing balance",
  "compound-repeated-multiplication": "Identifies the correct compound multiplier or substitutes into a repeated multiplication expression",
  "compound-formula-future-value": "Identifies the correct values of PV, r or n and substitutes into the formula",
  "compound-interest-earned": "Calculates the future value or shows that interest earned is future value minus present value",
  "compound-compounding-frequency": "Correctly identifies the rate per period or number of compounding periods",
  "simple-vs-compound-compare": "Correctly calculates one of the two investment options",
  "compound-find-present-value": "Shows a correct compound-interest equation or rearrangement for present value",
  "compound-find-rate-or-time": "Shows an appropriate compound-interest equation for the unknown rate or time",
  "depreciation-repeated": "Correctly calculates at least one period's depreciation or closing value",
  "depreciation-formula-value": "Identifies the correct values of V0, r or n and substitutes into the depreciation formula",
  "depreciation-amount": "Calculates the salvage value or shows that depreciation is original value minus salvage value",
  "depreciation-find-rate-or-time": "Shows an appropriate depreciation equation for the unknown rate or time",
  "algebraic-fractions": "Shows a valid simplification step for an algebraic fraction",
  "simplify-algebraic-fractions": "Divides the numerical coefficient or identifies a common factor",
  "add-subtract-algebraic-fractions": "Identifies a common denominator or combines like algebraic terms",
  "multiply-algebraic-fractions": "Shows a valid multiplication or cancellation step",
  "divide-algebraic-fractions": "Shows a valid division step or uses the reciprocal idea",
  "mixed-algebraic-fractions": "Correctly simplifies part of the algebraic fraction expression",
  "expand-single-brackets": "Correctly multiplies at least one term inside the bracket",
  "expand-negative-coefficients": "Correctly applies the negative coefficient to at least one term",
  "expand-collect-like-terms": "Correctly expands the bracket or collects like terms",
  "expand-two-brackets": "Correctly expands at least one bracket",
  "expand-binomial-products": "Correctly identifies at least two products from the binomial expansion",
  "expand-binomial-area-model": "Correctly identifies at least two parts of the area model",
  "mixed-expansion-simplification": "Correctly expands at least one bracket or collects like terms",
  "linear-one-step": "Shows a valid inverse operation",
  "linear-two-step": "Shows a valid first inverse operation or isolates the pronumeral term",
  "linear-three-step": "Shows a valid inverse operation or simplification step",
  "linear-negative-solutions": "Shows a valid inverse operation but may make a sign error",
  "linear-decimals": "Shows a valid algebraic step using the decimal values",
  "mixed-linear-equations": "Shows a valid algebraic method for a linear equation",
  "pronumerals-both-sides": "Correctly collects either pronumeral terms or constants",
  "pronumerals-both-sides-constants": "Correctly collects either pronumeral terms or constants from both sides",
  "pronumerals-both-sides-negative": "Shows a valid algebraic step but may make a sign error",
  "verify-solution-substitution": "Substitutes the proposed value into the equation",
  "equations-one-bracket": "Shows a valid inverse operation or expansion step",
  "equations-brackets-both-sides": "Correctly expands at least one side or collects like terms",
  "expand-simplify-solve": "Correctly expands or simplifies part of the equation",
  "mixed-grouping-equations": "Shows a valid expansion, simplification or inverse operation",
  "fraction-x-over-number": "Identifies the correct inverse operation for the denominator",
  "fraction-linear-numerator": "Clears the denominator or isolates the numerator",
  "fraction-with-constant": "Removes the constant or clears the denominator correctly",
  "mixed-algebraic-fraction-equations": "Shows a valid step for the algebraic fraction equation",
  "substitute-formulas-solve": "Substitutes values into the formula correctly",
  "write-equation-word-problem": "Defines a pronumeral or forms a mostly correct equation",
  "number-word-problems": "Forms a relevant equation or shows a valid solving step",
  "geometry-word-problems": "Uses a relevant geometric relationship or forms a valid equation",
  "money-sharing-word-problems": "Forms a relevant equation or correctly represents one share",
  "mixed-equation-word-problems": "Forms a relevant equation or shows a valid solving step",
  "rectilinear-composite-area": "Shows a valid decomposition or subtraction strategy for the composite area",
  "shaded-area": "Calculates either the outer area or the area to be subtracted correctly",
  "composite-area-circles": "Calculates at least one relevant component area correctly",
  "practical-area-applications": "Calculates the relevant area or identifies the correct cost or rate method",
  "identify-prism-faces": "Identifies some relevant faces or edge lengths",
  "rectangular-prism-surface-area": "Calculates at least two face areas correctly or uses a mostly correct formula",
  "triangular-prism-surface-area": "Calculates the triangular end area or at least two rectangular face areas correctly",
  "trapezoidal-prism-surface-area": "Calculates the trapezoidal end area or some rectangular face areas correctly",
  "composite-prism-surface-area": "Identifies a valid breakdown of the composite solid into simpler surfaces",
  "recognise-valid-nets": "Identifies a relevant feature of the net",
  "surface-area-from-net": "Identifies several correct face areas from the net",
  "curved-surface-area-cylinder": "Substitutes values into the curved surface area formula with a minor error",
  "closed-cylinder-surface-area": "Calculates either the curved surface area or circular base areas correctly",
  "cylinder-net-surface-area": "Identifies the rectangle and circles in the cylinder net",
  "half-cylinder-surface-area": "Identifies at least two exposed surfaces of the half-cylinder",
  "composite-cylinder-surface-area": "Identifies several exposed surfaces of the composite cylinder solid",
  "practical-cylinder-surface-area": "Identifies the correct cylinder surface area relationship or practical rate"
};

export function buildCriteriaForQuestion(question) {
  const marks = Math.max(1, Number(question?.marks || 1));
  const kind = String(question?.kind || "");

  if (kind === "multiple-choice") {
    return [
      { marks: 1, text: "Selects the correct alternative" }
    ];
  }

  return buildBandedCriteria(question, marks);
}

function buildBandedCriteria(question, marks) {
  const type = String(question?.type || "");
  const full = TYPE_FULL_SOLUTION[type] || fullSolutionText(question);
  const partial = TYPE_PARTIAL_CREDIT[type] || partialCreditText(question);
  const limited = limitedCreditText(question);

  if (marks <= 1) {
    return [
      { marks: 1, text: full || "Provides the correct answer" }
    ];
  }

  if (marks === 2) {
    return [
      { marks: 2, text: full },
      { marks: 1, text: partial }
    ];
  }

  const rows = [
    { marks, text: full },
    { marks: marks - 1, text: `Provides a substantially correct solution with a minor error or omission` }
  ];

  if (marks > 3) {
    rows.push({ marks: Math.max(2, marks - 2), text: partial });
  }

  rows.push({ marks: 1, text: limited });
  return rows;
}

function fullSolutionText(question) {
  const type = String(question?.type || "");
  const topic = String(question?.topic || "").toLowerCase();

  if (topic.includes("angle")) return "Calculates the correct angle and gives an appropriate reason";
  if (topic.includes("pythagoras")) return "Uses Pythagoras' theorem correctly and calculates the required length";
  if (topic.includes("linear")) return "Uses the correct relationship, graph or table and provides the correct answer";
  if (topic.includes("ratio") || topic.includes("rates")) return "Uses an appropriate ratio or rate method and provides the correct answer";
  if (topic.includes("indices")) return "Applies the appropriate index or prime factorisation method and provides the correct answer";
  if (topic.includes("trigonometry")) return "Uses an appropriate trigonometric ratio and provides the correct answer";
  if (topic.includes("financial")) return "Uses an appropriate financial mathematics method and provides the correct answer";
  if (topic.includes("area") || topic.includes("surface")) return "Uses an appropriate area or surface area method and provides the correct answer";
  if (topic.includes("algebra")) return "Uses an appropriate algebraic technique and provides the correct simplified expression";

  if (type.includes("convert")) return "Converts the measurement correctly using the appropriate scale factor";
  if (type.includes("compare")) return "Compares the quantities correctly and gives the correct answer";

  return "Provides correct solution";
}

function partialCreditText(question) {
  const topic = String(question?.topic || "").toLowerCase();

  if (topic.includes("angle")) return "Identifies an appropriate angle relationship or shows a valid calculation";
  if (topic.includes("pythagoras")) return "Substitutes values into Pythagoras' theorem or shows a valid calculation";
  if (topic.includes("linear")) return "Shows an appropriate graphical, tabular or algebraic method";
  if (topic.includes("ratio") || topic.includes("rates")) return "Shows an appropriate ratio or rate method";
  if (topic.includes("indices")) return "Shows a relevant index or factorisation method";
  if (topic.includes("trigonometry")) return "Shows an appropriate trigonometric method";
  if (topic.includes("financial")) return "Shows an appropriate financial mathematics method";
  if (topic.includes("area") || topic.includes("surface")) return "Shows an appropriate area or surface area method";
  if (topic.includes("algebra")) return "Shows an appropriate algebraic method";

  return "Shows appropriate method or equivalent merit";
}

function limitedCreditText(question) {
  const topic = String(question?.topic || "").toLowerCase();

  if (topic.includes("angle")) return "Shows some relevant angle information";
  if (topic.includes("pythagoras")) return "Identifies relevant side lengths or the correct theorem";
  if (topic.includes("linear")) return "Shows some relevant table, graph or coordinate information";
  if (topic.includes("ratio") || topic.includes("rates")) return "Shows some relevant ratio or rate information";
  if (topic.includes("trigonometry")) return "Shows some relevant right-triangle or ratio information";
  if (topic.includes("financial")) return "Shows some relevant financial information or calculation";
  if (topic.includes("area") || topic.includes("surface")) return "Shows some relevant area, face or surface information";
  if (topic.includes("algebra")) return "Shows some relevant algebraic working";

  return "Shows some relevant working or identifies a useful relationship";
}

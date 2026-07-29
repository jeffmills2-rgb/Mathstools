/* ============================================================================
   Mills Maths Tools — Resources by Stage : MANIFEST
   ----------------------------------------------------------------------------
   THIS IS THE ONLY FILE YOU EDIT WHEN YOU ADD A RESOURCE.

   The landing page (resources/index.html) builds itself from this file.

   HOW TO ADD A RESOURCE
   ---------------------
   1. Drop the file into the matching folder, e.g.
        resources/stage-5/trigonometry/bearings-intro.pdf
   2. Find the topic below (search for its `slug`), find the right outcome
      inside `outcomes`, and add ONE object to that outcome's `resources` array:

        { title:"Bearings — intro deck", type:"pptx", file:"bearings-intro.pptx" }

      `file` is relative to the topic folder, so you only write the filename.

   3. git add -A && git commit -m "resources: add bearings deck" && git push

   RESOURCE FIELDS
   ---------------
     title  (required)  what shows on the card
     type   (required)  "pdf" | "pptx" | "docx" | "xlsx" | "link" | "video"
     file   (required unless type:"link")  filename inside the topic folder
     url    (only for type:"link")  full URL
     note   (optional)  one short line under the title
     year   (optional)  "Year 9" etc — shows as a small chip
     tags   (optional)  ["revision","worked examples"] — searchable

   NOTES
   -----
   * Outcome codes / statements are verbatim from the NSW Mathematics K–10
     Syllabus (2022), NESA. Stage 5 focus areas are COLLATED (Trigonometry A/B/C/D
     -> one "Trigonometry" topic) as requested; each outcome keeps its own
     Core / Path badge and pathway note.
   * `path` values: "Core", or "Path" with `pathway` giving NESA's note
     (Stn = Standard, Adv = Advanced, Ext = Extension).
   * Adding a resource with an outcome code that doesn't exist here is a no-op —
     the page only renders what's listed below.
   ========================================================================== */

window.MMT_RESOURCES = {

  meta: {
    syllabus: "NSW Mathematics K–10 Syllabus (2022)",
    source: "https://curriculum.nsw.edu.au/learning-areas/mathematics/mathematics-k-10-2022",
    lastReviewed: "2026-07-29"
  },

  /* Strand display order + colour keys used by the page */
  strands: [
    { id: "number-algebra",        name: "Number and Algebra",        colour: "blue"   },
    { id: "measurement-space",     name: "Measurement and Space",     colour: "teal"   },
    { id: "statistics-probability",name: "Statistics and Probability",colour: "purple" }
  ],

  /* ==========================================================================
     STAGE 4  (Years 7–8) — 16 outcomes across 16 focus areas
     ========================================================================== */
  stage4: [

    /* ---------- Number and Algebra ---------- */
    {
      slug: "computation-with-integers",
      name: "Computation with Integers",
      strand: "number-algebra",
      icon: "±",
      blurb: "Compare, order and operate with positive and negative integers.",
      outcomes: [
        {
          code: "MA4-INT-C-01",
          path: "Core",
          statement: "compares, orders and calculates with integers to solve problems",
          resources: []
        }
      ]
    },
    {
      slug: "fractions-decimals-percentages",
      name: "Fractions, Decimals and Percentages",
      strand: "number-algebra",
      icon: "½",
      blurb: "Represent and operate across the three forms, and convert between them.",
      outcomes: [
        {
          code: "MA4-FRC-C-01",
          path: "Core",
          statement: "represents and operates with fractions, decimals and percentages to solve problems",
          resources: [
            {
              title: "Unit Fraction Calculations",
              type: "pdf",
              file: "unit-fraction-calculations.pdf",
              note: "2-page worksheet — completing number lines in unit fractions, comparing unit fractions with a bar model, and finding a fraction of an amount.",
              year: "Year 7",
              tags: ["worksheet", "unit fractions", "number line", "bar model", "fraction of an amount", "comparing fractions"]
            },
            {
              title: "Adding Fractions with Common Denominators",
              type: "pdf",
              file: "adding-fractions-with-common-denominators.pdf",
              note: "2-page worksheet — shading fraction bars to add and subtract with like denominators, improper and mixed fractions, and missing-value gap fills.",
              year: "Year 7",
              tags: ["worksheet", "adding fractions", "subtracting fractions", "common denominators", "fraction bar", "improper fractions", "mixed numerals"]
            },
            {
              title: "Percent and Decimal of an Amount",
              type: "pdf",
              file: "percent-and-decimal-of-an-amount.pdf",
              note: "2-page worksheet — using a number line to find a percentage or decimal of an amount, then comparing equivalent forms.",
              year: "Year 7",
              tags: ["worksheet", "number line", "percentage of an amount", "decimal of an amount"]
            }
          ]
        }
      ]
    },
    {
      slug: "ratios-and-rates",
      name: "Ratios and Rates",
      strand: "number-algebra",
      icon: "∶",
      blurb: "Ratio, rate and distance–time graphs.",
      outcomes: [
        {
          code: "MA4-RAT-C-01",
          path: "Core",
          statement: "solves problems involving ratios and rates, and analyses distance–time graphs",
          resources: []
        }
      ]
    },
    {
      slug: "algebraic-techniques",
      name: "Algebraic Techniques",
      strand: "number-algebra",
      icon: "𝑥",
      blurb: "Generalising number properties: simplifying, expanding and factorising.",
      outcomes: [
        {
          code: "MA4-ALG-C-01",
          path: "Core",
          statement: "generalises number properties to operate with algebraic expressions including expansion and factorisation",
          resources: []
        }
      ]
    },
    {
      slug: "indices",
      name: "Indices",
      strand: "number-algebra",
      icon: "xⁿ",
      blurb: "Primes, roots, positive-integer and zero indices, and the index laws.",
      outcomes: [
        {
          code: "MA4-IND-C-01",
          path: "Core",
          statement: "operates with primes and roots, positive-integer and zero indices involving numerical bases and establishes the relevant index laws",
          resources: []
        }
      ]
    },
    {
      slug: "equations",
      name: "Equations",
      strand: "number-algebra",
      icon: "=",
      blurb: "Solving linear equations up to two steps, and quadratics of the form ax² = c.",
      outcomes: [
        {
          code: "MA4-EQU-C-01",
          path: "Core",
          statement: "solves linear equations of up to 2 steps and quadratic equations of the form ax² = c",
          resources: []
        }
      ]
    },
    {
      slug: "linear-relationships",
      name: "Linear Relationships",
      strand: "number-algebra",
      icon: "📈",
      blurb: "Number patterns, the Cartesian plane and graphing linear relationships.",
      outcomes: [
        {
          code: "MA4-LIN-C-01",
          path: "Core",
          statement: "creates and displays number patterns and finds graphical solutions to problems involving linear relationships",
          resources: []
        }
      ]
    },

    /* ---------- Measurement and Space ---------- */
    {
      slug: "length",
      name: "Length",
      strand: "measurement-space",
      icon: "📏",
      blurb: "Perimeter of plane shapes and circumference of circles.",
      outcomes: [
        {
          code: "MA4-LEN-C-01",
          path: "Core",
          statement: "applies knowledge of the perimeter of plane shapes and the circumference of circles to solve problems",
          resources: []
        }
      ]
    },
    {
      slug: "right-angled-triangles-pythagoras",
      name: "Right-Angled Triangles (Pythagoras’ Theorem)",
      strand: "measurement-space",
      icon: "📐",
      blurb: "Pythagoras’ theorem and its applications.",
      outcomes: [
        {
          code: "MA4-PYT-C-01",
          path: "Core",
          statement: "applies Pythagoras’ theorem to solve problems in various contexts",
          resources: []
        }
      ]
    },
    {
      slug: "area",
      name: "Area",
      strand: "measurement-space",
      icon: "▦",
      blurb: "Area and composite area of triangles, quadrilaterals and circles.",
      outcomes: [
        {
          code: "MA4-ARE-C-01",
          path: "Core",
          statement: "applies knowledge of area and composite area involving triangles, quadrilaterals and circles to solve problems",
          resources: []
        }
      ]
    },
    {
      slug: "volume",
      name: "Volume",
      strand: "measurement-space",
      icon: "🧊",
      blurb: "Volume and capacity of right prisms and cylinders.",
      outcomes: [
        {
          code: "MA4-VOL-C-01",
          path: "Core",
          statement: "applies knowledge of volume and capacity to solve problems involving right prisms and cylinders",
          resources: []
        }
      ]
    },
    {
      slug: "angle-relationships",
      name: "Angle Relationships",
      strand: "measurement-space",
      icon: "∠",
      blurb: "Angles at a point, on a line, and with transversals on parallel lines.",
      outcomes: [
        {
          code: "MA4-ANG-C-01",
          path: "Core",
          statement: "applies angle relationships to solve problems, including those related to transversals on sets of parallel lines",
          resources: []
        }
      ]
    },
    {
      slug: "properties-of-geometrical-figures",
      name: "Properties of Geometrical Figures",
      strand: "measurement-space",
      icon: "△",
      blurb: "Classifying and using the properties of triangles and quadrilaterals.",
      outcomes: [
        {
          code: "MA4-GEO-C-01",
          path: "Core",
          statement: "identifies and applies the properties of triangles and quadrilaterals to solve problems",
          resources: []
        }
      ]
    },

    /* ---------- Statistics and Probability ---------- */
    {
      slug: "data-classification-visualisation-analysis",
      name: "Data Classification, Visualisation and Analysis",
      strand: "statistics-probability",
      icon: "📊",
      blurb: "Classifying and displaying data, then analysing centre, range and shape.",
      outcomes: [
        {
          code: "MA4-DAT-C-01",
          path: "Core",
          focusArea: "Data classification and visualisation",
          statement: "classifies and displays data using a variety of graphical representations",
          resources: []
        },
        {
          code: "MA4-DAT-C-02",
          path: "Core",
          focusArea: "Data analysis",
          statement: "analyses simple datasets using measures of centre, range and shape of the data",
          resources: []
        }
      ]
    },
    {
      slug: "probability",
      name: "Probability",
      strand: "statistics-probability",
      icon: "🎲",
      blurb: "Probabilities of simple chance experiments.",
      outcomes: [
        {
          code: "MA4-PRO-C-01",
          path: "Core",
          statement: "solves problems involving the probabilities of simple chance experiments",
          resources: []
        }
      ]
    }
  ],

  /* ==========================================================================
     STAGE 5  (Years 9–10) — COLLATED TOPICS
     e.g. "Trigonometry A/B" (Core) + "Trigonometry C/D" (Path) -> "Trigonometry"
     ========================================================================== */
  stage5: [

    /* ---------- Number and Algebra ---------- */
    {
      slug: "financial-mathematics",
      name: "Financial Mathematics",
      strand: "number-algebra",
      icon: "💲",
      collates: "Financial mathematics A, B",
      blurb: "Earning and spending money, simple interest, compound interest and depreciation.",
      outcomes: [
        {
          code: "MA5-FIN-C-01",
          path: "Core",
          focusArea: "Financial mathematics A",
          statement: "solves financial problems involving simple interest, earning money and spending money",
          resources: []
        },
        {
          code: "MA5-FIN-C-02",
          path: "Core",
          focusArea: "Financial mathematics B",
          statement: "solves financial problems involving compound interest and depreciation",
          resources: []
        }
      ]
    },
    {
      slug: "algebraic-techniques",
      name: "Algebraic Techniques",
      strand: "number-algebra",
      icon: "𝑥",
      collates: "Algebraic techniques A, B (Path), C (Path)",
      blurb: "Algebraic fractions, expansion, factorisation and simplification.",
      outcomes: [
        {
          code: "MA5-ALG-C-01",
          path: "Core",
          focusArea: "Algebraic techniques A",
          statement: "simplifies algebraic fractions with numerical denominators and expands algebraic expressions",
          resources: []
        },
        {
          code: "MA5-ALG-P-01",
          path: "Path",
          pathway: "Adv",
          focusArea: "Algebraic techniques B",
          statement: "simplifies algebraic fractions involving indices, and expands and factorises algebraic expressions",
          resources: []
        },
        {
          code: "MA5-ALG-P-02",
          path: "Path",
          pathway: "Adv",
          focusArea: "Algebraic techniques C",
          statement: "selects and applies appropriate algebraic techniques to operate with algebraic fractions, and expands, factorises and simplifies algebraic expressions",
          resources: []
        }
      ]
    },
    {
      slug: "indices-and-surds",
      name: "Indices and Surds",
      strand: "number-algebra",
      icon: "√",
      collates: "Indices A, B (Path), C (Path)",
      blurb: "Index laws with algebraic expressions, negative indices, surds and fractional indices.",
      outcomes: [
        {
          code: "MA5-IND-C-01",
          path: "Core",
          focusArea: "Indices A",
          statement: "simplifies algebraic expressions involving positive-integer and zero indices, and establishes the meaning of negative indices for numerical bases",
          resources: []
        },
        {
          code: "MA5-IND-P-01",
          path: "Path",
          pathway: "Adv",
          focusArea: "Indices B",
          statement: "applies the index laws to operate with algebraic expressions involving negative-integer indices",
          resources: []
        },
        {
          code: "MA5-IND-P-02",
          path: "Path",
          pathway: "Adv",
          focusArea: "Indices C",
          statement: "describes and performs operations with surds and fractional indices",
          resources: []
        }
      ]
    },
    {
      slug: "equations",
      name: "Equations",
      strand: "number-algebra",
      icon: "=",
      collates: "Equations A, B (Path), C (Path)",
      blurb: "Linear equations, inequalities, quadratics, cubics and simultaneous equations.",
      outcomes: [
        {
          code: "MA5-EQU-C-01",
          path: "Core",
          focusArea: "Equations A",
          statement: "solves linear equations of up to 3 steps, limited to one algebraic fraction",
          resources: []
        },
        {
          code: "MA5-EQU-P-01",
          path: "Path",
          pathway: "Adv",
          focusArea: "Equations B",
          statement: "solves monic quadratic equations, linear inequalities and cubic equations of the form ax³ = c",
          resources: []
        },
        {
          code: "MA5-EQU-P-02",
          path: "Path",
          pathway: "Adv",
          focusArea: "Equations C",
          statement: "solves linear equations of more than 3 steps, monic and non-monic quadratic equations, and linear simultaneous equations",
          resources: []
        }
      ]
    },
    {
      slug: "linear-relationships",
      name: "Linear Relationships",
      strand: "number-algebra",
      icon: "📈",
      collates: "Linear relationships A, B, C (Path)",
      blurb: "Midpoint, gradient, distance, slope-intercept form, transformations and equations of lines.",
      outcomes: [
        {
          code: "MA5-LIN-C-01",
          path: "Core",
          focusArea: "Linear relationships A",
          statement: "determines the midpoint, gradient and length of an interval, and graphs linear relationships, with and without digital tools",
          resources: []
        },
        {
          code: "MA5-LIN-C-02",
          path: "Core",
          focusArea: "Linear relationships B",
          statement: "graphs and interprets linear relationships using the gradient/slope-intercept form",
          resources: []
        },
        {
          code: "MA5-LIN-P-01",
          path: "Path",
          pathway: "Adv",
          focusArea: "Linear relationships C",
          statement: "describes and applies transformations, the midpoint, gradient/slope and distance formulas, and equations of lines to solve problems",
          resources: []
        }
      ]
    },
    {
      slug: "non-linear-relationships",
      name: "Non-Linear Relationships",
      strand: "number-algebra",
      icon: "∪",
      collates: "Non-linear relationships A, B, C (Path)",
      blurb: "Quadratic and exponential relationships, parabolas, curves and their transformations.",
      outcomes: [
        {
          code: "MA5-NLI-C-01",
          path: "Core",
          focusArea: "Non-linear relationships A",
          statement: "identifies connections between algebraic and graphical representations of quadratic and exponential relationships in various contexts",
          resources: []
        },
        {
          code: "MA5-NLI-C-02",
          path: "Core",
          focusArea: "Non-linear relationships B",
          statement: "identifies and compares features of parabolas and exponential curves in various contexts",
          resources: []
        },
        {
          code: "MA5-NLI-P-01",
          path: "Path",
          pathway: "Adv",
          focusArea: "Non-linear relationships C",
          statement: "interprets and compares non-linear relationships and their transformations, both algebraically and graphically",
          resources: []
        }
      ]
    },
    {
      slug: "variation-and-rates-of-change",
      name: "Variation and Rates of Change",
      strand: "number-algebra",
      icon: "∝",
      collates: "Variation and rates of change A (Path), B (Path)",
      blurb: "Direct and inverse variation, and graphs relating to rates of change.",
      outcomes: [
        {
          code: "MA5-RAT-P-01",
          path: "Path",
          pathway: "Stn, Adv",
          focusArea: "Variation and rates of change A",
          statement: "identifies and solves problems involving direct and inverse variation and their graphical representations",
          resources: []
        },
        {
          code: "MA5-RAT-P-02",
          path: "Path",
          pathway: "Adv",
          focusArea: "Variation and rates of change B",
          statement: "analyses and constructs graphs relating to rates of change",
          resources: []
        }
      ]
    },
    {
      slug: "polynomials",
      name: "Polynomials",
      strand: "number-algebra",
      icon: "𝑃(x)",
      collates: "Polynomials (Path)",
      blurb: "Operating with and graphing polynomials; factor and remainder theorems.",
      outcomes: [
        {
          code: "MA5-POL-P-01",
          path: "Path",
          pathway: "Adv, Ext",
          focusArea: "Polynomials",
          statement: "defines, operates with and graphs polynomials and applies the factor and remainder theorems to solve problems",
          resources: []
        }
      ]
    },
    {
      slug: "logarithms",
      name: "Logarithms",
      strand: "number-algebra",
      icon: "log",
      collates: "Logarithms (Path)",
      blurb: "The laws of logarithms and their applications.",
      outcomes: [
        {
          code: "MA5-LOG-P-01",
          path: "Path",
          pathway: "Adv",
          focusArea: "Logarithms",
          statement: "establishes and applies the laws of logarithms to solve problems",
          resources: []
        }
      ]
    },
    {
      slug: "functions-and-other-graphs",
      name: "Functions and Other Graphs",
      strand: "number-algebra",
      icon: "ƒ",
      collates: "Functions and other graphs (Path)",
      blurb: "Function notation, graphing functions of one variable, and graphing inequalities.",
      outcomes: [
        {
          code: "MA5-FNC-P-01",
          path: "Path",
          pathway: "Adv",
          focusArea: "Functions and other graphs",
          statement: "uses function notation to describe and graph functions of one variable and graphs inequalities in one and 2 variables",
          resources: []
        }
      ]
    },

    /* ---------- Measurement and Space ---------- */
    {
      slug: "numbers-of-any-magnitude",
      name: "Numbers of Any Magnitude",
      strand: "measurement-space",
      icon: "×10ⁿ",
      collates: "Numbers of any magnitude",
      blurb: "Scientific notation, significant figures and rounding in measurement.",
      outcomes: [
        {
          code: "MA5-MAG-C-01",
          path: "Core",
          focusArea: "Numbers of any magnitude",
          statement: "solves measurement problems by using scientific notation to represent numbers and rounding to a given number of significant figures",
          resources: []
        }
      ]
    },
    {
      slug: "trigonometry",
      name: "Trigonometry",
      strand: "measurement-space",
      icon: "📐",
      collates: "Trigonometry A, B, C (Path), D (Path)",
      blurb: "Trig ratios, bearings, elevation/depression, 3D problems, sine and cosine rules, and trig functions.",
      outcomes: [
        {
          code: "MA5-TRG-C-01",
          path: "Core",
          focusArea: "Trigonometry A",
          statement: "applies trigonometric ratios to solve right-angled triangle problems",
          resources: []
        },
        {
          code: "MA5-TRG-C-02",
          path: "Core",
          focusArea: "Trigonometry B",
          statement: "applies trigonometry to solve problems, including bearings and angles of elevation and depression",
          resources: []
        },
        {
          code: "MA5-TRG-P-01",
          path: "Path",
          pathway: "Stn, Adv",
          focusArea: "Trigonometry C",
          statement: "applies Pythagoras’ theorem and trigonometry to solve 3-dimensional problems and applies the sine, cosine and area rules to solve 2-dimensional problems, including bearings",
          resources: []
        },
        {
          code: "MA5-TRG-P-02",
          path: "Path",
          pathway: "Adv",
          focusArea: "Trigonometry D",
          statement: "establishes and applies the properties of trigonometric functions and finds solutions to trigonometric equations",
          resources: []
        }
      ]
    },
    {
      slug: "area-and-surface-area",
      name: "Area and Surface Area",
      strand: "measurement-space",
      icon: "▦",
      collates: "Area and surface area A, B (Path)",
      blurb: "Surface area of prisms, pyramids, cones and spheres; composite shapes and solids.",
      outcomes: [
        {
          code: "MA5-ARE-C-01",
          path: "Core",
          focusArea: "Area and surface area A",
          statement: "solves problems involving the surface area of right prisms and practical problems involving the area of composite shapes and solids",
          resources: []
        },
        {
          code: "MA5-ARE-P-01",
          path: "Path",
          pathway: "Stn, Adv",
          focusArea: "Area and surface area B",
          statement: "applies knowledge of the surface area of right pyramids and cones, spheres and composite solids to solve problems",
          resources: []
        }
      ]
    },
    {
      slug: "volume",
      name: "Volume",
      strand: "measurement-space",
      icon: "🧊",
      collates: "Volume A, B (Path)",
      blurb: "Volume of composite solids, right pyramids, cones and spheres.",
      outcomes: [
        {
          code: "MA5-VOL-C-01",
          path: "Core",
          focusArea: "Volume A",
          statement: "solves problems involving the volume of composite solids consisting of right prisms and cylinders",
          resources: []
        },
        {
          code: "MA5-VOL-P-01",
          path: "Path",
          pathway: "Stn, Adv",
          focusArea: "Volume B",
          statement: "applies knowledge of the volume of right pyramids, cones and spheres to solve problems involving related composite solids",
          resources: []
        }
      ]
    },
    {
      slug: "properties-of-geometrical-figures",
      name: "Properties of Geometrical Figures",
      strand: "measurement-space",
      icon: "△",
      collates: "Properties of geometrical figures A, B (Path), C (Path)",
      blurb: "Similarity, scale drawings, congruence conditions and geometric proof.",
      outcomes: [
        {
          code: "MA5-GEO-C-01",
          path: "Core",
          focusArea: "Properties of geometrical figures A",
          statement: "identifies and applies the properties of similar figures and scale drawings to solve problems",
          resources: []
        },
        {
          code: "MA5-GEO-P-01",
          path: "Path",
          pathway: "Ext",
          focusArea: "Properties of geometrical figures B",
          statement: "establishes conditions for congruent triangles and similar triangles and solves problems relating to properties of similar figures and plane shapes",
          resources: []
        },
        {
          code: "MA5-GEO-P-02",
          path: "Path",
          pathway: "Ext",
          focusArea: "Properties of geometrical figures C",
          statement: "constructs proofs involving congruent triangles and similar triangles and proves properties of plane shapes",
          resources: []
        }
      ]
    },
    {
      slug: "circle-geometry",
      name: "Circle Geometry",
      strand: "measurement-space",
      icon: "◯",
      collates: "Circle geometry (Path)",
      blurb: "Deductive reasoning to prove and apply the circle theorems.",
      outcomes: [
        {
          code: "MA5-CIR-P-01",
          path: "Path",
          pathway: "Ext",
          focusArea: "Circle geometry",
          statement: "applies deductive reasoning to prove circle theorems and solve related problems",
          resources: []
        }
      ]
    },
    {
      slug: "introduction-to-networks",
      name: "Introduction to Networks",
      strand: "measurement-space",
      icon: "🕸",
      collates: "Introduction to networks (Path)",
      blurb: "Graphs/networks, planar graphs, Eulerian trails and circuits.",
      outcomes: [
        {
          code: "MA5-NET-P-01",
          path: "Path",
          pathway: "Stn",
          focusArea: "Introduction to networks",
          statement: "solves problems involving the characteristics of graphs/networks, planar graphs and Eulerian trails and circuits",
          resources: [
            {
              title: "Number Sum Chain",
              type: "link",
              url: "/interactive-tools/stage-5/measurement-space/square-sum-chain/",
              note: "Arrange 1–15 so every pair of neighbours adds to a square number. Free workspace with joins, pen and shared rooms.",
              tags: ["interactive","networks","paths","problem solving"]
            }
          ]
        }
      ]
    },

    /* ---------- Statistics and Probability ---------- */
    {
      slug: "data-analysis",
      name: "Data Analysis",
      strand: "statistics-probability",
      icon: "📊",
      collates: "Data analysis A, B, C (Path)",
      blurb: "Summary statistics, graphical comparison, bivariate data and statistical inquiry.",
      outcomes: [
        {
          code: "MA5-DAT-C-01",
          path: "Core",
          focusArea: "Data analysis A",
          statement: "compares and analyses datasets using summary statistics and graphical representations",
          resources: []
        },
        {
          code: "MA5-DAT-C-02",
          path: "Core",
          focusArea: "Data analysis B",
          statement: "displays and interprets datasets involving bivariate data",
          resources: []
        },
        {
          code: "MA5-DAT-P-01",
          path: "Path",
          pathway: "Stn, Adv",
          focusArea: "Data analysis C",
          statement: "plans, conducts and reviews a statistical inquiry into a question of interest",
          resources: []
        }
      ]
    },
    {
      slug: "probability",
      name: "Probability",
      strand: "statistics-probability",
      icon: "🎲",
      collates: "Probability A, B (Path)",
      blurb: "Multistage chance experiments, simulations, Venn diagrams and conditional probability.",
      outcomes: [
        {
          code: "MA5-PRO-C-01",
          path: "Core",
          focusArea: "Probability A",
          statement: "solves problems involving probabilities in multistage chance experiments and simulations",
          resources: []
        },
        {
          code: "MA5-PRO-P-01",
          path: "Path",
          pathway: "Adv",
          focusArea: "Probability B",
          statement: "solves problems involving Venn diagrams, 2-way tables and conditional probability",
          resources: []
        }
      ]
    }
  ]
};

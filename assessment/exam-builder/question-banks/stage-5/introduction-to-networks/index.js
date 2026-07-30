/*
  MMT Exam Builder — Stage 5 Introduction to Networks Question Bank
  ------------------------------------------------------------------
  Save as:

  question-banks/stage-5/introduction-to-networks/index.js

  Requires:
  - engines/networks/network-engine.js
*/

import {
  createQuestion,
  QUESTION_KINDS,
  SPACE_SIZES
} from "../../../schemas/question.schema.js";

import {
  attachQuestionTranslations
} from "../../../utils/translation.js";

const TOPIC = "Introduction to Networks";

const TYPE_LIST = [
  { id: "network-definition", label: "Network, graph, vertex and edge definitions" },
  { id: "real-world-applications", label: "Real-world applications of networks" },
  { id: "vertices-edges-degree", label: "Identify vertices, edges and degree" },
  { id: "same-graph-different-drawings", label: "Same graph drawn in different ways" },
  { id: "planar-and-non-planar", label: "Planar and non-planar graphs" },
  { id: "faces-and-euler-formula", label: "Faces and Euler’s formula" },
  { id: "connected-walk-trail-path-cycle", label: "Connected graphs, walks, trails, paths and cycles" },
  { id: "eulerian-trails-circuits", label: "Eulerian trails and circuits" },
  { id: "konigsberg-bridges", label: "Königsberg bridges problem" }
];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choice(items) {
  return items[randInt(0, items.length - 1)];
}

function cycleChoice(items, variantIndex = null) {
  const index = Number(variantIndex);
  if (Number.isFinite(index)) return items[Math.abs(index) % items.length];
  return choice(items);
}

function shuffle(items) {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function randomId(prefix = "intro-networks") {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeBalancedPlan(typeIds, count) {
  const ids = typeIds.length ? typeIds.slice() : TYPE_LIST.map(type => type.id);
  const out = [];
  let i = 0;
  while (out.length < count) {
    out.push(ids[i % ids.length]);
    i += 1;
  }
  return shuffle(out);
}

function networkDiagram(diagramType, config = {}) {
  return {
    engine: "network-engine",
    config: {
      diagramType,
      ...config
    }
  };
}

function networkQuestion({
  type,
  marks = 1,
  kind = QUESTION_KINDS.SHORT_RESPONSE,
  prompt,
  diagram = null,
  choices = null,
  answer,
  working = [],
  space = SPACE_SIZES.SMALL,
  diagramSpace = null,
  tags = []
}) {
  const question = createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type,
    kind,
    marks,
    prompt,
    diagram,
    choices,
    answer,
    working,
    space,
    tags: ["stage-5", "networks", "introduction-to-networks", type, ...tags]
  });

  // Some schema versions do not validate optional renderer-only fields.
  if (diagramSpace) question.diagramSpace = diagramSpace;
  return question;
}

function graphData(name) {
  if (name === "pentagonChord") {
    return {
      nodes: [
        { id: "A", x: 190, y: 115 },
        { id: "B", x: 345, y: 105 },
        { id: "C", x: 430, y: 235 },
        { id: "D", x: 280, y: 310 },
        { id: "E", x: 140, y: 235 }
      ],
      edges: [["A", "B"], ["B", "C"], ["C", "D"], ["D", "E"], ["E", "A"], ["A", "D"], ["B", "D"]]
    };
  }

  if (name === "house") {
    return {
      nodes: [
        { id: "A", x: 160, y: 295 },
        { id: "B", x: 360, y: 295 },
        { id: "C", x: 360, y: 160 },
        { id: "D", x: 160, y: 160 },
        { id: "E", x: 260, y: 75 }
      ],
      edges: [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"], ["D", "E"], ["E", "C"], ["A", "C"]]
    };
  }

  return {
    nodes: [
      { id: "A", x: 180, y: 125 },
      { id: "B", x: 395, y: 125 },
      { id: "C", x: 395, y: 300 },
      { id: "D", x: 180, y: 300 }
    ],
    edges: [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"], ["A", "C"], ["B", "D"]]
  };
}

function countDegrees(graph) {
  const degrees = Object.fromEntries(graph.nodes.map(node => [node.id, 0]));
  graph.edges.forEach(edge => {
    const from = Array.isArray(edge) ? edge[0] : edge.from;
    const to = Array.isArray(edge) ? edge[1] : edge.to;
    degrees[from] += 1;
    degrees[to] += 1;
  });
  return degrees;
}

function graphStats(graph) {
  return {
    vertices: graph.nodes.length,
    edges: graph.edges.length,
    degrees: countDegrees(graph)
  };
}

function networkDefinitionQuestion({ variantIndex = null } = {}) {
  const variants = [
    {
      prompt: "Which statement best describes a graph or network in mathematics?",
      answer: "A collection of vertices connected by edges",
      choices: [
        "A collection of vertices connected by edges",
        "A list of numbers arranged in order",
        "A scale drawing of a physical object",
        "A table showing inputs and outputs"
      ],
      working: ["In a network, objects are represented by vertices or nodes, and the connections between them are represented by edges."],
    },
    {
      prompt: "In network terminology, what is another name for a vertex?",
      answer: "node",
      choices: ["node", "face", "cycle", "degree"],
      working: ["The terms vertex and node are commonly used interchangeably in networks."],
    },
    {
      prompt: "In network terminology, what does an edge represent?",
      answer: "a connection between two vertices",
      choices: [
        "a connection between two vertices",
        "the number of faces in a graph",
        "a vertex with no connections",
        "the outside region of a planar graph"
      ],
      working: ["An edge is a line or link joining two vertices."],
    }
  ];

  const item = cycleChoice(variants, variantIndex);
  return networkQuestion({
    type: "network-definition",
    kind: QUESTION_KINDS.MULTIPLE_CHOICE,
    marks: 1,
    prompt: item.prompt,
    diagram: null,
    choices: item.choices,
    answer: item.answer,
    working: item.working,
    space: SPACE_SIZES.NONE
  });
}

function realWorldApplicationsQuestion({ variantIndex = null } = {}) {
  const variants = [
    {
      prompt: "Which option is a real-world application of a network?",
      answer: "A supply chain showing warehouses and transport routes",
      choices: [
        "A supply chain showing warehouses and transport routes",
        "A single isolated number on a page",
        "The area formula for a rectangle",
        "A stopwatch measuring one time only"
      ],
      working: ["Supply chains can be modelled by vertices such as warehouses and shops, connected by edges such as transport routes."]
    },
    {
      prompt: "In a social network model, what would the vertices usually represent?",
      answer: "people or accounts",
      choices: ["people or accounts", "friendships or follows", "the number of faces", "the outside region"],
      working: ["The vertices represent the objects in the system. In a social network, these are usually people or accounts."]
    },
    {
      prompt: "In a communication network, what would the edges usually represent?",
      answer: "communication links between devices",
      choices: ["communication links between devices", "the devices themselves", "faces of a planar graph", "the degree of a vertex"],
      working: ["The edges represent the links or connections between objects in the system."]
    }
  ];

  const item = cycleChoice(variants, variantIndex);
  return networkQuestion({
    type: "real-world-applications",
    kind: QUESTION_KINDS.MULTIPLE_CHOICE,
    marks: 1,
    prompt: item.prompt,
    diagram: null,
    choices: item.choices,
    answer: item.answer,
    working: item.working,
    space: SPACE_SIZES.NONE
  });
}

function verticesEdgesDegreeQuestion({ variantIndex = null } = {}) {
  const templates = [
    { graphName: "pentagonChord", vertex: "D" },
    { graphName: "house", vertex: "C" },
    { graphName: "squareDiagonals", vertex: "A" }
  ];
  const template = cycleChoice(templates, variantIndex);
  const graph = graphData(template.graphName);
  const stats = graphStats(graph);
  const degree = stats.degrees[template.vertex];

  if (Number(variantIndex) % 2 === 0) {
    return networkQuestion({
      type: "vertices-edges-degree",
      marks: 2,
      prompt: `For the network shown, state the number of vertices and the number of edges.`,
      diagram: networkDiagram("graph", { graph }),
      answer: `${stats.vertices} vertices and ${stats.edges} edges`,
      working: [
        `There are ${stats.vertices} labelled vertices.`,
        `There are ${stats.edges} edges connecting the vertices.`
      ],
      space: SPACE_SIZES.SMALL
    });
  }

  return networkQuestion({
    type: "vertices-edges-degree",
    marks: 1,
    prompt: `For the network shown, find the degree of vertex ${template.vertex}.`,
    diagram: networkDiagram("degree-graph", { graph, vertex: template.vertex }),
    answer: `degree ${template.vertex} = ${degree}`,
    working: [`The degree of a vertex is the number of edges that meet at that vertex.`, `Vertex ${template.vertex} has ${degree} incident edges.`],
    space: SPACE_SIZES.SMALL
  });
}

function sameGraphDifferentDrawingsQuestion() {
  return networkQuestion({
    type: "same-graph-different-drawings",
    marks: 2,
    prompt: "The two diagrams show the same graph drawn in different ways. Explain why they represent the same graph.",
    diagram: networkDiagram("same-graph-pair"),
    answer: "They have the same vertices and the same pairs of vertices connected by edges; only the positions of the vertices have changed.",
    working: [
      "A graph is determined by its vertices and connections, not by the exact positions of the vertices on the page.",
      "The drawings are equivalent because the same pairs of vertices are connected."
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function planarAndNonPlanarQuestion({ variantIndex = null } = {}) {
  const variants = [
    {
      prompt: "The left drawing has edges that cross. Explain why this graph is still planar.",
      answer: "It is planar because it can be redrawn so that no two edges cross.",
      working: ["A graph is planar if at least one drawing of it has no crossing edges.", "The right drawing shows the same graph with no crossing edges."]
    },
    {
      prompt: "Define a planar graph.",
      answer: "A planar graph can be drawn in the plane so that no two edges cross.",
      working: ["Planarity is about whether a graph can be drawn without edge crossings, not whether a particular drawing currently has a crossing."],
      noDiagram: true
    },
    {
      prompt: "A graph is drawn with two edges crossing. Does this automatically prove it is non-planar? Give a reason.",
      answer: "No. A crossing drawing may still be planar if it can be redrawn without crossings.",
      working: ["To prove a graph is non-planar, it must be impossible to draw it without crossings."],
      noDiagram: false
    }
  ];
  const item = cycleChoice(variants, variantIndex);
  return networkQuestion({
    type: "planar-and-non-planar",
    marks: 2,
    prompt: item.prompt,
    diagram: item.noDiagram ? null : networkDiagram("planar-redraw"),
    answer: item.answer,
    working: item.working,
    space: SPACE_SIZES.MEDIUM
  });
}

function facesAndEulerFormulaQuestion({ variantIndex = null } = {}) {
  const variants = [
    {
      prompt: "For the planar graph shown, state v, e and f, then verify Euler’s formula v − e + f = 2.",
      diagram: networkDiagram("euler-faces", { vertices: 5, edges: 7, faces: 4, showFaceShading: false, showFaceLabels: false }),
      answer: "v = 5, e = 7, f = 4, so 5 − 7 + 4 = 2",
      working: ["There are 5 vertices, 7 edges and 4 faces, including the outside face.", "v − e + f = 5 − 7 + 4 = 2."],
      marks: 3
    },
    {
      prompt: "A connected planar graph has 8 vertices and 12 edges. Use Euler’s formula to find the number of faces.",
      answer: "6 faces",
      working: ["Euler’s formula is v − e + f = 2.", "8 − 12 + f = 2", "f = 6."],
      marks: 1
    },
    {
      prompt: "A connected planar graph has 6 faces and 10 edges. Use Euler’s formula to find the number of vertices.",
      answer: "6 vertices",
      working: ["Euler’s formula is v − e + f = 2.", "v − 10 + 6 = 2", "v = 6."],
      marks: 1
    }
  ];
  const item = cycleChoice(variants, variantIndex);
  return networkQuestion({
    type: "faces-and-euler-formula",
    marks: item.marks,
    prompt: item.prompt,
    diagram: item.diagram || null,
    answer: item.answer,
    working: item.working,
    space: item.marks === 1 ? SPACE_SIZES.SMALL : SPACE_SIZES.MEDIUM
  });
}

function connectedWalkTrailPathCycleQuestion({ variantIndex = null } = {}) {
  const variants = [
    {
      prompt: "Which graph shown is connected? Give a reason.",
      diagram: networkDiagram("connected-comparison"),
      answer: "Graph A is connected because there is a path between every pair of vertices.",
      working: ["A connected graph is in one piece. Graph B is disconnected because it has separate components."],
      marks: 2
    },
    {
      prompt: "Using the highlighted sequence in the graph, explain whether the sequence is a path.",
      diagram: networkDiagram("walk-trail"),
      answer: "It is a path because it follows connected edges and no vertex is repeated.",
      working: ["A path is a walk with no repeated vertices.", "The highlighted sequence follows edges and does not repeat any vertex."],
      marks: 2
    },
    {
      prompt: "Explain the difference between a walk and a trail in a graph.",
      answer: "A walk is any sequence of connected vertices and edges. A trail is a walk with no repeated edges.",
      working: ["A trail is a special type of walk. It may repeat vertices, but it cannot repeat an edge."],
      marks: 2
    },
    {
      prompt: "Explain the difference between a path and a cycle in a graph.",
      answer: "A path has no repeated vertices. A cycle starts and ends at the same vertex and otherwise has no repeated vertices.",
      working: ["A cycle is like a closed path."],
      marks: 2
    }
  ];

  const item = cycleChoice(variants, variantIndex);
  return networkQuestion({
    type: "connected-walk-trail-path-cycle",
    marks: item.marks,
    prompt: item.prompt,
    diagram: item.diagram || null,
    answer: item.answer,
    working: item.working,
    space: SPACE_SIZES.MEDIUM
  });
}

function eulerianTrailsCircuitsQuestion({ variantIndex = null } = {}) {
  const variants = [
    {
      variant: "circuit",
      prompt: "Determine whether the graph has an Eulerian trail, an Eulerian circuit, or neither. Give a reason.",
      answer: "It has an Eulerian circuit because every vertex has even degree.",
      working: ["A connected graph has an Eulerian circuit if every vertex has even degree.", "In this graph there are 0 vertices of odd degree."],
      marks: 3
    },
    {
      variant: "trail",
      prompt: "Determine whether the graph has an Eulerian trail, an Eulerian circuit, or neither. Give a reason.",
      answer: "It has an Eulerian trail but not an Eulerian circuit because exactly two vertices have odd degree.",
      working: ["A connected graph has an Eulerian trail if exactly two vertices have odd degree.", "It does not have an Eulerian circuit because not all vertices are even."],
      marks: 3
    },
    {
      variant: "none",
      prompt: "Determine whether the graph has an Eulerian trail, an Eulerian circuit, or neither. Give a reason.",
      answer: "It has neither because more than two vertices have odd degree.",
      working: ["A connected graph has an Eulerian trail when there are exactly 0 or 2 odd vertices.", "This graph has more than 2 odd vertices, so it has neither."],
      marks: 3
    },
    {
      variant: "trail",
      prompt: "Define an Eulerian trail.",
      answer: "An Eulerian trail is a walk that uses every edge of a graph exactly once.",
      working: ["A trail cannot repeat edges. An Eulerian trail includes every edge exactly once."],
      marks: 1,
      noDiagram: true
    }
  ];
  const item = cycleChoice(variants, variantIndex);
  return networkQuestion({
    type: "eulerian-trails-circuits",
    marks: item.marks,
    prompt: item.prompt,
    diagram: item.noDiagram ? null : networkDiagram("eulerian", { variant: item.variant }),
    answer: item.answer,
    working: item.working,
    space: item.marks === 1 ? SPACE_SIZES.SMALL : SPACE_SIZES.MEDIUM
  });
}

function konigsbergBridgesQuestion({ variantIndex = null } = {}) {
  const variants = [
    {
      prompt: "The Königsberg bridges problem can be modelled as a network. Draw a network model, then explain why it is impossible to cross each bridge exactly once.",
      answer: "The model has four vertices of odd degree, so it has no Eulerian trail.",
      working: ["Model the land regions as vertices and the bridges as edges.", "Crossing each bridge exactly once is equivalent to finding an Eulerian trail.", "A connected graph has an Eulerian trail only when exactly 0 or 2 vertices have odd degree.", "The Königsberg graph has 4 odd vertices, so the walk is impossible."],
      marks: 3,
      drawModel: true
    },
    {
      prompt: "In the Königsberg bridges problem, what do the vertices and edges represent?",
      answer: "Vertices represent land regions and edges represent bridges.",
      working: ["The land masses are modelled as vertices. The bridges connecting land masses are modelled as edges."],
      marks: 2
    }
  ];
  const item = cycleChoice(variants, variantIndex);
  return networkQuestion({
    type: "konigsberg-bridges",
    marks: item.marks,
    prompt: item.prompt,
    diagram: item.drawModel ? networkDiagram("konigsberg", { mapOnly: true }) : networkDiagram("konigsberg"),
    diagramSpace: item.drawModel ? { size: "medium", label: "Draw the network model" } : null,
    answer: item.answer,
    working: item.working,
    space: SPACE_SIZES.MEDIUM
  });
}

const GENERATORS = {
  "network-definition": networkDefinitionQuestion,
  "real-world-applications": realWorldApplicationsQuestion,
  "vertices-edges-degree": verticesEdgesDegreeQuestion,
  "same-graph-different-drawings": sameGraphDifferentDrawingsQuestion,
  "planar-and-non-planar": planarAndNonPlanarQuestion,
  "faces-and-euler-formula": facesAndEulerFormulaQuestion,
  "connected-walk-trail-path-cycle": connectedWalkTrailPathCycleQuestion,
  "eulerian-trails-circuits": eulerianTrailsCircuitsQuestion,
  "konigsberg-bridges": konigsbergBridgesQuestion
};

export function getIntroductionToNetworksQuestionTypes() {
  return TYPE_LIST;
}

export function generateIntroductionToNetworksQuestions({
  count = 8,
  allowedTypes = null
} = {}) {
  const allowed = Array.isArray(allowedTypes) && allowedTypes.length
    ? allowedTypes.filter(type => GENERATORS[type])
    : TYPE_LIST.map(type => type.id);

  const plan = makeBalancedPlan(allowed, count);
  const questions = [];
  const seenByType = {};
  let safety = 0;

  while (questions.length < count && safety < count * 40) {
    const type = plan[questions.length % plan.length];
    const generator = GENERATORS[type];
    if (generator) {
      const variantIndex = seenByType[type] || 0;
      seenByType[type] = variantIndex + 1;
      questions.push(generator({ variantIndex }));
    }
    safety += 1;
  }

  return questions.map(attachQuestionTranslations);
}

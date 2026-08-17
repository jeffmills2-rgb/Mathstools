import React from "react";

import "./diagramStyles.css";
import { SUPPORTED_DIAGRAM_TYPES } from "./diagramTypes.js";
import RectangleAreaDiagram from "./RectangleAreaDiagram.jsx";
import TriangleAreaDiagram from "./TriangleAreaDiagram.jsx";
import CompositeRectangleDiagram from "./CompositeRectangleDiagram.jsx";
import IntegerNumberLineDiagram from "./IntegerNumberLineDiagram.jsx";
import ThermometerDiagram from "./ThermometerDiagram.jsx";
import FractionCircleDiagram from "./FractionCircleDiagram.jsx";
import FractionBarDiagram from "./FractionBarDiagram.jsx";
import FractionSetDiagram from "./FractionSetDiagram.jsx";
import FractionNumberLineDiagram from "./FractionNumberLineDiagram.jsx";
import EquivalentFractionBarsDiagram from "./EquivalentFractionBarsDiagram.jsx";
import FractionMultiplicationAreaDiagram from "./FractionMultiplicationAreaDiagram.jsx";
import DoubleNumberLineDiagram from "./DoubleNumberLineDiagram.jsx";
import AlgebraTilesDiagram from "./AlgebraTilesDiagram.jsx";
import AlgebraAreaModelDiagram from "./AlgebraAreaModelDiagram.jsx";
import PerimeterExpressionDiagram from "./PerimeterExpressionDiagram.jsx";
import FunctionMachineDiagram from "./FunctionMachineDiagram.jsx";
import PythagorasTriangleDiagram from "./PythagorasTriangleDiagram.jsx";
import StudentDiagramSpace from "./StudentDiagramSpace.jsx";
import PythagorasRampDiagram from "./PythagorasRampDiagram.jsx";
import PythagorasLadderDiagram from "./PythagorasLadderDiagram.jsx";
import PythagorasRectangleDiagram from "./PythagorasRectangleDiagram.jsx";
import DistanceTimeGraphDiagram from "./DistanceTimeGraphDiagram.jsx";
import LengthPolygonDiagram from "./LengthPolygonDiagram.jsx";
import CompositeRectilinearDiagram from "./CompositeRectilinearDiagram.jsx";
import CircleFeaturesDiagram from "./CircleFeaturesDiagram.jsx";
import CircleMeasureDiagram from "./CircleMeasureDiagram.jsx";
import SectorArcDiagram from "./SectorArcDiagram.jsx";
import CurvedCompositeDiagram from "./CurvedCompositeDiagram.jsx";
import FactorTreeDiagram from "./FactorTreeDiagram.jsx";
import CartesianPlaneDiagram from "./CartesianPlaneDiagram.jsx";
import TilePatternDiagram from "./TilePatternDiagram.jsx";
import ValuesTableDiagram from "./ValuesTableDiagram.jsx";
import AngleAtVertexDiagram from "./AngleAtVertexDiagram.jsx";
import CrossingLinesDiagram from "./CrossingLinesDiagram.jsx";
import ParallelTransversalDiagram from "./ParallelTransversalDiagram.jsx";
import ProtractorDiagram from "./ProtractorDiagram.jsx";
import GeometryFigureDiagram from "./GeometryFigureDiagram.jsx";
import GeometryShapeDiagram from "./GeometryShapeDiagram.jsx";
import GeometryProofDiagram from "./GeometryProofDiagram.jsx";
import StatAxisChartDiagram from "./StatAxisChartDiagram.jsx";
import StatProportionChartDiagram from "./StatProportionChartDiagram.jsx";
import StatPlotChartDiagram from "./StatPlotChartDiagram.jsx";

/**
 * DiagramRenderer — the single entry point for drawing a question's figure.
 *
 * It is a ROUTER (like EncounterModal): it looks at `question.diagramType` and
 * renders the matching diagram component, handing it `question.diagramData`.
 * Adding a new diagram is a three-step job: write a component, add its type id
 * to diagramTypes.js, and add a `case` here.
 *
 * Renders nothing if the question has no diagram, so it is always safe to drop
 * into any encounter regardless of input mode.
 *
 * Props: { question }  — needs question.diagramType + question.diagramData.
 */
export default function DiagramRenderer({ question }) {
  if (!question || !question.diagramType || !question.diagramData) return null;

  const { diagramType, diagramData } = question;

  let figure;
  switch (diagramType) {
    case "rectangleArea":
      figure = <RectangleAreaDiagram data={diagramData} />;
      break;
    case "triangleArea":
      figure = <TriangleAreaDiagram data={diagramData} />;
      break;
    case "compositeRectangleArea":
      figure = <CompositeRectangleDiagram data={diagramData} />;
      break;
    case "integerNumberLine":
      figure = <IntegerNumberLineDiagram data={diagramData} />;
      break;
    case "thermometer":
      figure = <ThermometerDiagram data={diagramData} />;
      break;
    case "fractionCircle":
      figure = <FractionCircleDiagram data={diagramData} />;
      break;
    case "fractionBar":
      figure = <FractionBarDiagram data={diagramData} />;
      break;
    case "fractionSet":
      figure = <FractionSetDiagram data={diagramData} />;
      break;
    case "fractionNumberLine":
      figure = <FractionNumberLineDiagram data={diagramData} />;
      break;
    case "equivalentFractionBars":
      figure = <EquivalentFractionBarsDiagram data={diagramData} />;
      break;
    case "fractionMultiplicationArea":
      figure = <FractionMultiplicationAreaDiagram data={diagramData} />;
      break;
    case "doubleNumberLine":
      figure = <DoubleNumberLineDiagram data={diagramData} />;
      break;
    case "algebraTiles":
      figure = <AlgebraTilesDiagram data={diagramData} />;
      break;
    case "expandAreaModel":
      figure = <AlgebraAreaModelDiagram data={diagramData} />;
      break;
    case "perimeterFigure":
      figure = <PerimeterExpressionDiagram data={diagramData} />;
      break;
    case "functionMachine":
      figure = <FunctionMachineDiagram data={diagramData} />;
      break;
    case "pythagorasTriangle":
      figure = <PythagorasTriangleDiagram data={diagramData} />;
      break;
    case "studentDiagramSpace":
      figure = <StudentDiagramSpace data={diagramData} />;
      break;
    case "pythagorasRamp":
      figure = <PythagorasRampDiagram data={diagramData} />;
      break;
    case "pythagorasLadder":
      figure = <PythagorasLadderDiagram data={diagramData} />;
      break;
    case "pythagorasRectangle":
      figure = <PythagorasRectangleDiagram data={diagramData} />;
      break;
    case "distanceTimeGraph":
      figure = <DistanceTimeGraphDiagram data={diagramData} />;
      break;
    case "lengthPolygon":
      figure = <LengthPolygonDiagram data={diagramData} />;
      break;
    case "compositeRectilinear":
      figure = <CompositeRectilinearDiagram data={diagramData} />;
      break;
    case "circleFeatures":
      figure = <CircleFeaturesDiagram data={diagramData} />;
      break;
    case "circleMeasure":
      figure = <CircleMeasureDiagram data={diagramData} />;
      break;
    case "sectorArc":
      figure = <SectorArcDiagram data={diagramData} />;
      break;
    case "curvedComposite":
      figure = <CurvedCompositeDiagram data={diagramData} />;
      break;
    case "factorTree":
      figure = <FactorTreeDiagram data={diagramData} />;
      break;
    case "cartesianPlane":
      figure = <CartesianPlaneDiagram data={diagramData} />;
      break;
    case "tilePattern":
      figure = <TilePatternDiagram data={diagramData} />;
      break;
    case "valuesTable":
      figure = <ValuesTableDiagram data={diagramData} />;
      break;
    case "angleAtVertex":
      figure = <AngleAtVertexDiagram data={diagramData} />;
      break;
    case "crossingLines":
      figure = <CrossingLinesDiagram data={diagramData} />;
      break;
    case "parallelTransversal":
      figure = <ParallelTransversalDiagram data={diagramData} />;
      break;
    case "protractor":
      figure = <ProtractorDiagram data={diagramData} />;
      break;
    case "geometryFigure":
      figure = <GeometryFigureDiagram data={diagramData} />;
      break;
    case "geometryShape":
      figure = <GeometryShapeDiagram data={diagramData} />;
      break;
    case "geometryProof":
      figure = <GeometryProofDiagram data={diagramData} />;
      break;
    case "statAxisChart":
      figure = <StatAxisChartDiagram data={diagramData} />;
      break;
    case "statProportionChart":
      figure = <StatProportionChartDiagram data={diagramData} />;
      break;
    case "statPlotChart":
      figure = <StatPlotChartDiagram data={diagramData} />;
      break;
    default:
      // Unknown type: fail soft with a small note (never crash the encounter).
      return (
        <div className="diagram-card diagram-unknown">
          No diagram available for type “{diagramType}”.
        </div>
      );
  }

  return <div className="diagram-card">{figure}</div>;
}

// Re-export so callers/checks can ask the renderer what it supports.
export { SUPPORTED_DIAGRAM_TYPES };

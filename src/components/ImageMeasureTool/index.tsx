import React, { useState, useRef } from "react";
import { Stage, Layer, Line, Text, Image, Circle } from "react-konva";
import useImage from "use-image";
import pathImage from "../../assets/blank_01.jpg";
import { KonvaEventObject } from "konva/lib/Node";

type PointType = {
   x: number;
   y: number;
};
type HistoryType = {
   data: PointType[];
   step: number;
};
export const ImageMeasureTool = ({ imageWidthCm = 34 }) => {
   const [image, status] = useImage(pathImage, "anonymous", "origin");
   const stageRef = useRef(null);
   const lineRef = useRef(null);
   const [points, setPoints] = useState<PointType[]>([]);
   const [history, setHistory] = useState<HistoryType>({
      data: [],
      step: 0,
   });

   const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      const stagePos = stage?.getPointerPosition();
      setPoints([...points, { x: stagePos?.x ?? 0, y: stagePos?.y ?? 0 }]);
      setHistory({
         data: [...history.data, { x: stagePos?.x ?? 0, y: stagePos?.y ?? 0 }],
         step: history.step + 1,
      });
   };
   const handleUndo = () => {
      if (history.step > 0) {
         points.pop();
         setHistory({
            ...history,
            step: history.step - 1,
         });
         setPoints([...points]);
      }
   };

   const handleRedo = () => {
      const nextState = history[history.length];
      if (nextState) {
         setHistory([...history, nextState]);
         setPoints(nextState);
      }
   };
   console.log("points==>", points);
   console.log("history==>", history);
   return (
      <div>
         <button onClick={handleUndo}>Undo</button>
         <button onClick={handleRedo}>Redo</button>
         {status === "loading" && (
            <div style={{ textAlign: "center" }}>loading...</div>
         )}
         <Stage
            width={window.innerWidth}
            height={window.innerHeight}
            onMouseDown={handleMouseDown}
            // onMouseUp={handleMouseUp}
            // onMouseMove={handleMouseMove}
            ref={stageRef}
         >
            <Layer>
               <Image
                  image={image}
                  width={800}
                  height={800}
                  draggable={false}
               />
               {points?.map((point, index) => {
                  return (
                     <React.Fragment key={index}>
                        {index >= 1 && !!(index % 2) && (
                           <Line
                              ref={lineRef}
                              points={[
                                 points[index - 1].x,
                                 points[index - 1].y,
                                 points[index].x,
                                 points[index].y,
                              ]}
                              stroke="red"
                              strokeWidth={1}
                           />
                        )}
                        {index >= 1 && !!(index % 2) && (
                           <Text
                              x={(points[index - 1].x + points[index].x) / 2}
                              y={
                                 (points[index - 1].y + points[index].y) / 2 -
                                 15
                              }
                              text={`${calculateDistance(
                                 points[index - 1],
                                 points[index],
                                 imageWidthCm
                              )} cm`}
                              fill="red"
                              fontSize={16}
                              align="center"
                           />
                        )}
                        <Circle
                           key={index}
                           x={point.x}
                           y={point.y}
                           radius={3}
                           fill="red"
                           draggable={false}
                        />
                     </React.Fragment>
                  );
               })}
            </Layer>
         </Stage>
      </div>
   );
};

const calculateDistance = (
   point1: PointType,
   point2: PointType,
   imageWidthCm: number
) => {
   const pixelDistance = Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
   );

   // Convert pixel distance to centimeters using the scaling factor
   const cmDistance = (pixelDistance / 800) * imageWidthCm;

   return cmDistance.toFixed(2);
};

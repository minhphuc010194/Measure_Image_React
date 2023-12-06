import React, { useState } from "react";
import { Stage, Layer, Line, Text, Image, Circle } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import useImage from "use-image";
import pathImage from "../../assets/blank_01.jpg";
import { Button } from "../";

type PointType = {
   x: number;
   y: number;
};
type HistoryType = {
   data: PointType[];
   step: number;
};
export const ImageMeasureTool = ({ imageWidthCm = 34 }) => {
   const [fileImage, setFileImage] = useState<CanvasImageSource | undefined>();
   const [image, status] = useImage(pathImage, "anonymous", "origin");
   const stageRef = React.useRef(null);
   const lineRef = React.useRef(null);
   const [points, setPoints] = React.useState<PointType[]>([]);
   const [history, setHistory] = React.useState<HistoryType>({
      data: [],
      step: 0,
   });
   const [factor, setFactor] = React.useState({
      input: 1,
      calculate: 1,
   });
   const [color, setColor] = React.useState("#F5236B");

   // init load
   React.useEffect(() => {
      if (!fileImage) {
         setFileImage(image);
      }
   }, [image]);

   React.useEffect(() => {
      if (points.length === 2) {
         const currentDimension = Number(
            calculateDistance(
               points[points.length - 2],
               points[points.length - 1],
               imageWidthCm
            )
         );
         const promptInput = prompt(
            "Please input real dimension 'cm'",
            `${currentDimension}`
         );
         if (promptInput) {
            const value = Number(promptInput);

            if (!isNaN(value)) {
               setFactor({
                  input: value,
                  calculate: value / currentDimension,
               });
            }
         }
      }
   }, [imageWidthCm, points, points.length]);
   const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      const stagePos = stage?.getPointerPosition();
      setPoints([...points, { x: stagePos?.x ?? 0, y: stagePos?.y ?? 0 }]);
      if (history.step < history.data.length) {
         const temp = [...history.data];
         temp.length = history.step;
         setHistory({
            data: [...temp, { x: stagePos?.x ?? 0, y: stagePos?.y ?? 0 }],
            step: points.length,
         });
      } else {
         setHistory({
            data: [
               ...history.data,
               { x: stagePos?.x ?? 0, y: stagePos?.y ?? 0 },
            ],
            step: history.step + 1,
         });
      }
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
      if (history.step < history.data.length) {
         const { step, data } = history;
         setPoints([...points, data[step]]);
         setHistory({ ...history, step: step + 1 });
      }
   };
   const reset = () => {
      setPoints([]);
      setHistory({ data: [], step: 0 });
      setFileImage(undefined);
   };
   return (
      <div>
         <div style={{ display: "flex" }}>
            <Button onClick={handleUndo}>Undo</Button>
            <Button onClick={handleRedo}>Redo</Button>
            <Button onClick={reset}>Reset</Button>
            <div>
               <input
                  value={color}
                  onChange={(e) => setColor(e.target.value as string)}
                  type="color"
               />
               <input
                  onChange={(e) => {
                     const fileInput = e.target;
                     const file = fileInput.files?.[0];

                     if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                           // Create a new Image element
                           const img = new window.Image() as HTMLImageElement;
                           img.src = reader.result as string;

                           // Set the image in the state
                           setFileImage(img);
                        };

                        reader.readAsDataURL(file);
                     }
                  }}
                  type="file"
                  accept="image/png, image/jpeg"
               />
            </div>
         </div>
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
                  image={fileImage}
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
                              stroke={color}
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
                              text={`${(
                                 Number(
                                    calculateDistance(
                                       points[index - 1],
                                       points[index],
                                       imageWidthCm
                                    )
                                 ) * factor.calculate
                              ).toFixed(1)} cm`}
                              fill={color}
                              fontSize={16}
                              align="center"
                           />
                        )}
                        <Circle
                           key={index}
                           x={point.x}
                           y={point.y}
                           radius={3}
                           fill={color}
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

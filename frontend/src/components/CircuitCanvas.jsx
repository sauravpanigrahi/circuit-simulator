import React from "react";
import styled from "styled-components";
import * as d3 from "d3";
import { components } from "../assets/componentsLibrary";
import { useMyContext } from "../contextApi/MyContext";
// import { updatedNodes } from "../contextApi/MyContext";
import { useState } from "react";

//STYLED COMPONENTS
const Container = styled.main`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const Menu = styled.section`
  margin-bottom: 20px;
  position: fixed;
  top: 20px;
  left: 20px;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
`;

const CircuitBoard = styled.section`
  margin-top: 100px;
`;

const RemoveComponent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
`;

const ComponentList = styled.div`
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 16px;
  margin-top: 10px;
`;

const Select = styled.select`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: white;
  font-size: 14px;
  min-width: 150px;
  cursor: pointer;
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Button = styled.button`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  &:hover {
    background-color: #f0f0f0;
  }
  &:active {
    background-color: #e0e0e0;
  }
`;

const Circle = styled.circle`
  transition: all 100ms;
  &:hover {
    cursor: pointer;
  }
`;
// const Text = styled.text
// let netstring = "";
const tempnetList = [];

const CircuitCanvas = () => {
  const {
    connectedDots,
    setConnectedDots,
    lines,
    setLines,
    selectedLine,
    setSelectedLine,
    selectedComponent,
    setSelectedComponent,
    selectedNodes,
    setSelectedNodes,
    updatedNodes,
    sendSimulationData, // Updated to use the new function name
    viewSimulation,
    analysisType,
    setAnalysisType, // Allowing components to update the analysis type
    frequency,
    setFrequency,
    simData,
    valMap,
    setValMap,
    temp
  } = useMyContext();

  const [NodeVoltagePosition, setNodeVoltagePosition] = useState({ x: 0, y: 0 });
  const [isNodeVoltageVisible, setNodeVoltageVisible] = useState(false);
  const [NodeVoltageDotId, setNodeVoltageDotId] = useState("");

  const [lineCurrentPos, setLineCurrentPos] = useState({ x: 0, y: 0 });
  const [isLineCurrentVisible, setLineCurrentVisible] = useState(false);
  const [LineCurrentId, setLineCurrentDotId] = useState("");
  // const [lineCurrentValue, setLineCurrentValue] = useState("");

  const svgRef = React.createRef();
  const numRows = 15;
  const numCols = 20;
  const dotRadius = 4;
  const gap = 40;

  const [netlist, setNetlist] = useState("");

  const [nextNodeNumber, setNextNodeNumber] = useState(0); // New state for sequential node numbering

  const handleDotClick = (dotId) => {
    // Assign a sequential node number if the dot is not already in updatedNodes
    const assignNodeNumber = (id) => {
      if (!updatedNodes.has(id)) {
        // If nextNodeNumber is 0 and node 0 is not already assigned, assign 0
        // Otherwise, assign the current nextNodeNumber and increment
        const newNodeMap = new Map(updatedNodes);
        if (nextNodeNumber === 0 && !Array.from(updatedNodes.values()).includes(0)) {
            newNodeMap.set(id, 0);
            setNextNodeNumber(1);
        } else if (nextNodeNumber > 0) {
             // Find the next available node number starting from 1
            let nextAvailable = 1;
            while(Array.from(updatedNodes.values()).includes(nextAvailable)){
                nextAvailable++;
            }
            newNodeMap.set(id, nextAvailable);
            setNextNodeNumber(nextAvailable + 1);
        } else { // This case handles when 0 is already assigned, but nextNodeNumber is still 0
             let nextAvailable = 1;
            while(Array.from(updatedNodes.values()).includes(nextAvailable)){
                nextAvailable++;
            }
            newNodeMap.set(id, nextAvailable);
            setNextNodeNumber(nextAvailable + 1);
        }
       
        setSelectedNodes(newNodeMap); // Use setSelectedNodes from context
      }
    };

    if (connectedDots?.length === 0) {
      // First dot clicked, store its ID and assign node number
      setConnectedDots([dotId]);
      assignNodeNumber(dotId);
    } else if (connectedDots.length === 1 && connectedDots[0] !== dotId) {
      // For transistor, we need three nodes
      if (selectedComponent === 'NpnTransistor'||selectedComponent==='PnpTransistor'||selectedComponent === 'PMosfet'||selectedComponent === 'NMosfet') {
        setConnectedDots([...connectedDots, dotId]);
        assignNodeNumber(dotId); // Assign node number to the second selected dot
      } else {
        const [row1, col1] = connectedDots[0].split("-");
        const [row2, col2] = dotId.split("-");

        // Check if dots are in the same row or column
        if (row1 === row2 || col1 === col2) {
          // Calculate if there's already a component between these nodes
          const existingLine = lines.find(line => {
            const [_, startDot, endDot] = line.split("_");
            return (startDot === connectedDots[0] && endDot === dotId) || 
                   (startDot === dotId && endDot === connectedDots[0]);
          });

          if (!existingLine) {
            // Second dot clicked in the same row or column, connect the dots
            assignNodeNumber(dotId); // Assign node number to the second selected dot
            const lineId = connectDots(connectedDots[0], dotId);
            setLines([...lines, lineId]);
            setValMap((valMap) => {
              const newMap = new Map(valMap);
              newMap.set(lineId, 1);
              return newMap;
            });
          }
          setConnectedDots([]);
        }
      }
    } else if (connectedDots.length === 2 && (selectedComponent === 'NpnTransistor'||selectedComponent==='PnpTransistor'||selectedComponent === 'PMosfet'||selectedComponent === 'NMosfet')) {
      // Third dot clicked for transistor
      assignNodeNumber(dotId); // Assign node number to the third selected dot
      const lineId = connectDots(connectedDots[0], connectedDots[1], dotId);
      setLines([...lines, lineId]);
      setValMap((valMap) => {
        const newMap = new Map(valMap);
        newMap.set(lineId, 1);
        return newMap;
      });
      setConnectedDots([]);
    } else if (connectedDots.length === 1 && connectedDots[0] === dotId) {
      // Clicked on the same dot, disconnect it
      setConnectedDots([]);
    }

    // The following block seems to be for displaying node voltage on hover, not directly related to numbering on click.
    // It uses updatedNodes, which will now contain the sequential numbers.
    // if(dotId in updatedNodes)
    // {
    // }
  };

  const handleLineClick = (lineId) => {
    setSelectedLine(lineId);
  };

  const showNodeVoltage = (event, dotId) => {
    setNodeVoltagePosition({ x: event.clientX, y: event.clientY });
    setNodeVoltageVisible(true);
    setNodeVoltageDotId(dotId);
  };

  const hideNodeVoltage = () => {
    setNodeVoltageVisible(false);
  };

  const showLineCurrent = (e, lineId) =>{
    setLineCurrentPos({x: e.clientX , y: e.clientY});
    setLineCurrentVisible(true);
    setLineCurrentDotId(lineId);
    // console.log(lineId)
  }
  
  // console.log(lineCurrentValue)

  const hideLineCurrent = ()=>{
    setLineCurrentVisible(false);
  }


  const connectDots = (dotId1, dotId2, dotId3 = null) => {
    // Use D3.js to draw a line between the dots
    const svg = d3.select(svgRef.current);
    const dot1 = svg.select(`#dot-${dotId1}`);
    const dot2 = svg.select(`#dot-${dotId2}`);
    const dot3 = dotId3 ? svg.select(`#dot-${dotId3}`) : null;

    const x1 = +dot1.attr("cx");
    const y1 = +dot1.attr("cy");
    const x2 = +dot2.attr("cx");
    const y2 = +dot2.attr("cy");
    const x3 = dot3 ? +dot3.attr("cx") : null;
    const y3 = dot3 ? +dot3.attr("cy") : null;
    
    const lineId = dotId3 ? 
      `${selectedComponent}_${dotId1}_${dotId2}_${dotId3}` : 
      `${selectedComponent}_${dotId1}_${dotId2}`;

    // Calculate midpoint for component placement
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    // Remove any existing component at these nodes
    svg.selectAll(`#${lineId}`).remove();

    // Draw the component with fixed position
    components[selectedComponent].component(
      svg,
      lineId,
      handleLineClick,
      handleLineDoubleClick,
      showLineCurrent,
      hideLineCurrent,
      x1,
      x2,
      y1,
      y2,
      x3,  // Pass third node coordinates for transistor
      y3
    );

    // The node number assignment logic is now handled in handleDotClick
    // const dot1Value = selectedNodes.has(dotId1) ? selectedNodes.get(dotId1) : 0;
    // const dot2Value = selectedNodes.has(dotId2) ? selectedNodes.get(dotId2) : 0;
    // const dot3Value = dotId3 && selectedNodes.has(dotId3) ? selectedNodes.get(dotId3) : 0;

    // const newMap = new Map(selectedNodes);
    // newMap.set(dotId1, dot1Value + 1);
    // newMap.set(dotId2, dot2Value + 1);
    // if (dotId3) {
    //   newMap.set(dotId3, dot3Value + 1);
    // }

    // setSelectedNodes(newMap);
    
    return lineId;
  };
  
  // Function to remove a line by its ID
  // const removeLine = (lineId) => {
  //   const svg = d3.select(svgRef.current);
  //   svg.select(`#${lineId}`).remove(); // Remove the line from the SVG
  //   setLines(lines.filter((id) => id !== lineId));

  //   const dotId1 = lineId.split("_")[1];
  //   const dotId2 = lineId.split("_")[2];

  //   console.log(dotId1, dotId2);

  //   // The following logic for decrementing node connection counts is no longer needed with sequential numbering
  //   // const dot1 = selectedNodes.get(dotId1);
  //   // const dot2 = selectedNodes.get(dotId2);

  //   // const newMap = new Map(selectedNodes);

    
  //   // dot1 > 1 ? newMap.set(dotId1, dot1 - 1) : newMap.delete(dotId1);
  //   // dot2 > 1 ? newMap.set(dotId2, dot2 - 1) : newMap.delete(dotId2);

  //   // setSelectedNodes(newMap);
  //   // window.valMap.delete(lineId);

  //   setValMap((valMap)=>{
  //     const newMap = new Map(valMap);
  //     newMap.delete(lineId)
  //     return newMap;
  //   })
  // };
  // Function to remove a line by its ID
const removeLine = (lineId) => {
  const svg = d3.select(svgRef.current);
  svg.select(`#${lineId}`).remove(); // Remove the line from the SVG
  setLines(lines.filter((id) => id !== lineId));

  // Extract dot IDs from the line ID
  const lineParts = lineId.split("_");
  const dotIds = lineParts.slice(1); // Skip the component type, get all dot IDs

  console.log("Removing dots:", dotIds);

  // Remove the dots from updatedNodes
  const newNodeMap = new Map(updatedNodes);
  dotIds.forEach(dotId => {
    // Check if this dot is used by any other components
    const isUsedByOtherComponents = lines.some(otherLineId => {
      if (otherLineId === lineId) return false; // Skip the line being removed
      const otherLineParts = otherLineId.split("_");
      const otherDotIds = otherLineParts.slice(1);
      return otherDotIds.includes(dotId);
    });

    // Only remove the dot if it's not used by other components
    if (!isUsedByOtherComponents) {
      newNodeMap.delete(dotId);
      console.log(`Removed node ${dotId} from updatedNodes`);
    } else {
      console.log(`Node ${dotId} kept - used by other components`);
    }
  });

  setSelectedNodes(newNodeMap);

  // Remove the component value from valMap
  setValMap((valMap) => {
    const newMap = new Map(valMap);
    newMap.delete(lineId);
    return newMap;
  });

  // Optional: Reset nextNodeNumber if all nodes are removed
  if (newNodeMap.size === 0) {
    setNextNodeNumber(0);
    console.log("All nodes removed, reset nextNodeNumber to 0");
  }
};

  const setGroundNode = (nodeId) => {
    // Check if nodeId is already in updatedNodes, then simply update its value to 0
    // If not, add it with value 0
    const newNodeMap = new Map(updatedNodes);
    newNodeMap.set(nodeId, 0);
    setSelectedNodes(newNodeMap);
     // Ensure the next automatically assigned node number is not 0 if 0 is manually set
     if (nextNodeNumber === 0) {
        setNextNodeNumber(1);
    }

    console.log(`Node ${nodeId} set as ground.`);
    console.log(updatedNodes);
}

  // Calculate the total width and height of the grid
  const totalWidth = numCols * (2 * dotRadius + gap);
  const totalHeight = numRows * (2 * dotRadius + gap);

  const handleLineDoubleClick = (lineId, value) => {
    const newValue = prompt(`Update the value for the component ${lineId} to:`, value);
    if (newValue !== null) {
      // Handle the updated value as needed
      // window.valMap.set(lineId, newValue);
      setValMap((valMap)=> {
        const newMap = new Map(valMap)
        newMap.set(lineId,newValue);
        return newMap
      })
    }
  };

  const generateNetlist = async () => {
    try {
      const circuitData = {
        components: lines.map((lineId) => {
          const [componentType, ...dotIds] = lineId.split('_');
          const component = components[componentType];
          const value = valMap.get(lineId) || 'not set';
          // Use the sequentially assigned node numbers from updatedNodes
          const nodeNumbers = dotIds.map(dotId => updatedNodes.has(dotId) ? updatedNodes.get(dotId) : '?');
          
          // console.log('Component data:', {
          //   type: component.name,
          //   id: component.id,
          //   node: nodeNumbers,
          //   value: value
          // });
          
          return {
            type: component.name,
            id: component.id,
            node: nodeNumbers,
            value: value
          };
        })
      };

      console.log('Sending circuit data:', JSON.stringify(circuitData, null, 2));

      const response = await fetch('http://127.0.0.1:8000/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(circuitData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Failed to generate netlist: ${errorText}`);
      }

      const data = await response.json();
      console.log('Received netlist:', data);
      setNetlist(data.netlist);
    } catch (error) {
      console.error('Error generating netlist:', error);
      alert('Failed to generate netlist. Please check the console for details.');
    }
  };
  
// Add this helper function at the top of your CircuitCanvas component
const getCurrentValue = (lineId, simData, temp) => {
  if (!simData || !simData.current || !temp[lineId]) {
    return "No data";
  }
  
  const currentKey = `I_${temp[lineId]}`;
  const currentValue = simData.current[currentKey];
  
  if (currentValue === undefined || currentValue === null) {
    return "No data";
  }
  
  // Convert to number and take absolute value if negative
  const numericValue = parseFloat(currentValue);
  const absoluteValue = Math.abs(numericValue);
  
  // Format the current value with appropriate units
  if (absoluteValue >= 1) {
    return `${absoluteValue.toFixed(3)} A`;
  } else if (absoluteValue >= 0.001) {
    return `${(absoluteValue * 1000).toFixed(3)} mA`;
  } else if (absoluteValue >= 0.000001) {
    return `${(absoluteValue * 1000000).toFixed(3)} µA`;
  } else {
    return `${absoluteValue.toExponential(3)} A`;
  }
};
const getVoltageValue = (lineId, simData, temp, updatedNodes) => {
  if (!simData || !simData.voltages || !temp[lineId]) {
    return "No data";
  }
  
  // Get the nodes connected to this voltmeter
  const lineParts = lineId.split('_');
  const node1Id = lineParts[1];
  const node2Id = lineParts[2];
  
  // Get node numbers
  const node1Num = updatedNodes.get(node1Id);
  const node2Num = updatedNodes.get(node2Id);
  
  if (node1Num === undefined || node2Num === undefined) {
    return "No data";
  }
  
  // Get voltage values
  const v1 = simData.voltages[`V_node_${node1Num}`] || 0;
  const v2 = simData.voltages[`V_node_${node2Num}`] || 0;
  
  // Calculate voltage difference and take absolute value
  const voltageDifference = parseFloat(v1) - parseFloat(v2);
  const absoluteVoltage = Math.abs(voltageDifference);
  
  // Format the voltage value with appropriate units
  if (absoluteVoltage >= 1) {
    return `${absoluteVoltage.toFixed(3)} V`;
  } else if (absoluteVoltage >= 0.001) {
    return `${(absoluteVoltage * 1000).toFixed(3)} mV`;
  } else if (absoluteVoltage >= 0.000001) {
    return `${(absoluteVoltage * 1000000).toFixed(3)} µV`;
  } else {
    return `${absoluteVoltage.toExponential(3)} V`;
  }
};

  return (
    <Container>
      <Menu>
        <RemoveComponent>
          <p>{selectedLine || "No Component selected"}</p>
          <Button
            onClick={() => {
              if (lines.length > 0) {
                selectedLine && removeLine(selectedLine);
              
                setSelectedLine();
              }
            }}
          >
            Remove {selectedLine?.split("-")[0] || "Component"}
          </Button>
          <Button
            onClick={() => {
              if (connectedDots && connectedDots[0]) {
                  setGroundNode(connectedDots[0]);
              } else {
                  console.log("No node selected to set as ground.");
              }
          }}>
            add Ground
          </Button>
          <Button
            onClick={() => {
              generateNetlist();
            }}
          >
            Generate Netlist
          </Button>
          <Select
          value={analysisType}
          onChange={(e) => setAnalysisType(e.target.value)}
          aria-label="Select analysis type"
        >
          <option value="dc">DC Analysis</option>
          <option value="ac">AC Analysis</option>
          <option value="transient">Transient Analysis</option>
          {/* Add other analysis types as needed */}
        </Select>
        <input type="text" id="frequency" name="frequency" placeholder="Frequency" value={frequency} onChange={(e)=>setFrequency(e.target.value)}/>
          <Button onClick={() => {
            sendSimulationData();
          }}>Run Simulation</Button>
          <Button onClick={viewSimulation}>View simulation</Button>
          <Button onClick={() => valMap.forEach((value, key) => {
    console.log(`${key} => ${value}`) ;
  })}>Lock Circuit</Button>
          
        </RemoveComponent>

        <ComponentList>
          <Select
            value={selectedComponent || ""}
            onChange={(e) => setSelectedComponent(e.target.value)}
          >
            {Object.keys(components).map((item) => (
              <option value={components[item].name} key={item}>
                {components[item].name.toUpperCase()}
              </option>
            ))}
          </Select>
        </ComponentList>
      </Menu>

      {/* {console.log(selectedNodes)} */}

      <CircuitBoard >
        <div >
        <svg ref={svgRef} width={totalWidth} height={totalHeight}>
          {/* Render dots and text in a grid */}
          {Array.from({ length: numRows }).map((_, row) =>
            Array.from({ length: numCols }).map((_, col) => (
              <g key={`group-${row}-${col}`}>
                <Circle
                  key={`dot-${row}-${col}`}
                  id={`dot-${row}-${col}`}
                  cx={col * (2 * dotRadius + gap) + dotRadius}
                  cy={row * (2 * dotRadius + gap) + dotRadius}
                  r={dotRadius}
                  fill={
                    connectedDots?.includes(`${row}-${col}`) ? "red" : "#2979ff"
                  }
                  onClick={() => handleDotClick(`${row}-${col}`)}
                  onMouseOver={(e) => {
                    e.target.setAttribute("r", dotRadius + 2);
                    showNodeVoltage(e, `${row}-${col}`);
                  }}
                  onMouseOut={(e) => {
                    e.target.setAttribute("r", dotRadius);
                    hideNodeVoltage();
                  }}
                />
                <text
                  x={col * (2 * dotRadius + gap) + dotRadius +7} // Adjust the x-coordinate as needed
                  y={row * (2 * dotRadius + gap) + dotRadius + 10} // Adjust the y-coordinate as needed
                  fill="grey" // Adjust the text color as needed
                  fontSize="9" // Adjust the font size as needed
                >
                  {/* Display the sequential node number if available, otherwise nothing */}
                  {updatedNodes.has(`${row}-${col}`) ? updatedNodes.get(`${row}-${col}`) : ""}
                </text>
              </g>
            ))
          )}
           
        </svg>
        {/* Render NodeVoltage conditionally */}
        
        {isNodeVoltageVisible && updatedNodes.has(NodeVoltageDotId) && (
            <div
            style={{
              position: "absolute",
              left: `${NodeVoltagePosition.x + 20}px`,
              top: `${NodeVoltagePosition.y + 20}px`,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              padding: "5px",
              borderRadius: "5px",
            
              boxShadow: "0px 0px 5px 0px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Display voltage using the sequential node number */}
            {(simData["voltages"] && simData["voltages"][`V_node_${updatedNodes.get(NodeVoltageDotId)}`]) || `Node ${updatedNodes.get(NodeVoltageDotId)}` }
          </div>
          )}
            <div
  style={{
    position: "fixed",
    right: "10px",
    top: "20px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    width: "280px",
    maxHeight: "400px",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.15)",
    overflowY: "auto",
    border: "1px solid #e2e8f0"
  }}
>
  <h4 style={{ margin: "0 0 10px 0", color: "#2d3748", borderBottom: "2px solid #e2e8f0", paddingBottom: "5px" }}>
    Component Information
  </h4>
  
  {LineCurrentId && (() => {
    const firstTwoChars = LineCurrentId.slice(0, 2);
    const firstChar = LineCurrentId.slice(0, 1);
    
    // Check if it's an ammeter
    if (firstTwoChars === 'AM') {
      return (
        <div style={{
          padding: '12px',
          backgroundColor: '#f0f8ff',
          border: '2px solid #4682b4',
          borderRadius: '8px',
          marginBottom: '10px'
        }}>
          <div style={{ 
            fontWeight: 'bold', 
            color: '#2c5282',
            fontSize: '16px',
            marginBottom: '8px'
          }}>
            📊 {temp[LineCurrentId] || 'Ammeter'}
          </div>
          <div style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: '#1a365d',
            marginBottom: '5px'
          }}>
            Current: {getCurrentValue(LineCurrentId, simData, temp)}
          </div>
          <div style={{ fontSize: '12px', color: '#4a5568' }}>
            Measuring current flow (absolute value)
          </div>
        </div>
      );
    }
  })}
    {LineCurrentId && (() => {
  const firstTwoChars = LineCurrentId.slice(0, 2);
  const firstChar = LineCurrentId.slice(0, 1);
  
  // Check if it's a voltmeter
  if (firstTwoChars === 'VM') {
    return (
      <div style={{
        padding: '12px',
        backgroundColor: '#f0fff0',
        border: '2px solid #32cd32',
        borderRadius: '8px',
        marginBottom: '10px'
      }}>
        <div style={{ 
          fontWeight: 'bold', 
          color: '#228b22',
          fontSize: '16px',
          marginBottom: '8px'
        }}>
          ⚡ {temp[LineCurrentId] || 'Voltmeter'}
        </div>
        <div style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          color: '#006400',
          marginBottom: '5px'
        }}>
          Voltage: {getVoltageValue(LineCurrentId, simData, temp, updatedNodes)}
        </div>
        <div style={{ fontSize: '12px', color: '#4a5568' }}>
          Measuring voltage difference (absolute value)
        </div>
      </div>
    );
  }
  
    
    // For other components, show the existing display
    return (
      <div style={{
        padding: '12px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '8px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#495057' }}>
          {temp[LineCurrentId]}: {valMap.get(LineCurrentId) || "no value"} {
            (() => {
              if (firstChar === 'A' || firstChar === "V") return 'V';
              if (firstChar === 'R') return 'Ω';
              if (firstChar === 'C') return 'F';
              if (firstChar === 'L') return 'H';
              return '';
            })()
          }
        </div>
        
        {simData && (
          <>
            <div style={{ marginBottom: '5px' }}>
              <strong>Voltage:</strong> {Math.round(simData["voltages"][`V_${temp[LineCurrentId]}`]).toFixed(3) || 'N/A'} V
            </div>
            <div>
              <strong>Current:</strong> {Number(simData["current"][`I_${temp[LineCurrentId]}`]).toFixed(3) || 'N/A'} A
            </div>
          </>
        )}
      </div>
    );
  })()}
  
  {!LineCurrentId && (
    <div style={{ 
      color: '#6c757d', 
      fontStyle: 'italic',
      textAlign: 'center',
      padding: '20px'
    }}>
      Hover over a component to see its information
    </div>
  )}
</div>
          {/* <div
             style={{
                position: "fixed",
                right: "10px",    // Adjust this value to increase or decrease the right margin
                top: "200px",      // Adjust this value to increase or decrease the top margin
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                width: "250px",
                height: "350px",
                padding: "10px",
                borderRadius: "5px",
                boxShadow: "0px 0px 5px 0px rgba(0, 0, 0, 0.5)",
                overflowY: "auto"
             }}
             
            >
            <h4 style={{margin:"0"}}>Complete Circuit Netlist:</h4>
            {lines.map((lineId) => {
              const [componentType, ...nodes] = lineId.split('_');
              const component = components[componentType];
              const value = valMap.get(lineId) || 'Not set';
              const nodeNumbers=nodes.map((node)=>updatedNodes.get(node)||"?")
              return (
                <div key={lineId} style={{ marginBottom: '5px', borderBottom: '1px solid #ccc' }}>
                  <p style={{ margin: '5px 0' }}>
                      Component name: <strong>{component.name}</strong>,<br/>   
                      ID: {component.id},
                      nodes:{nodeNumbers},
                      value:{value}
                    
                  </p>
                </div>
                
              );
             
            })}
            </div> */}
          
        </div>
      </CircuitBoard >

      <div
        style={{
          position: "fixed",
          right: "10px",
          top: "302px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          width: "250px",
          height: "200px",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0px 0px 5px 0px rgba(0, 0, 0, 0.5)",
          overflowY: "auto"
        }}
      >
        <h4 style={{margin:"0"}}>SPICE Netlist:</h4>
        <pre style={{margin:"5px 0", whiteSpace:"pre-wrap", wordWrap:"break-word"}}>
          {netlist || "No netlist generated yet"}
        </pre>
      </div>

    </Container>
  );
};


export default CircuitCanvas;

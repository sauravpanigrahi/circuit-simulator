import React from "react";
import * as d3 from "d3";
import { components } from "../assets/componentsLibrary";
import { useMyContext } from "../contextApi/MyContext";
import { useState } from "react";
import "./CircuitCanvas.css";
import { useNavigate } from "react-router-dom";

const CircuitCanvas = () => {
  const navigate = useNavigate();
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
    sendSimulationData,
    viewSimulation,
    analysisType,
    setAnalysisType,
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
  const svgRef = React.createRef();
  const numRows = 17;
  const numCols = 20;
  const dotRadius = 4;
  const gap = 40;
  const [netlist, setNetlist] = useState("");
  const [nextNodeNumber, setNextNodeNumber] = useState(0);

  const handleDotClick = (dotId) => {
    const assignNodeNumber = (id) => {
      if (!updatedNodes.has(id)) {
        const newNodeMap = new Map(updatedNodes);
        if (nextNodeNumber === 0 && !Array.from(updatedNodes.values()).includes(0)) {
            newNodeMap.set(id, 0);
            setNextNodeNumber(1);
        } else if (nextNodeNumber > 0) {
             let nextAvailable = 1;
            while(Array.from(updatedNodes.values()).includes(nextAvailable)){
                nextAvailable++;
            }
            newNodeMap.set(id, nextAvailable);
            setNextNodeNumber(nextAvailable + 1);
        } else {
             let nextAvailable = 1;
            while(Array.from(updatedNodes.values()).includes(nextAvailable)){
                nextAvailable++;
            }
            newNodeMap.set(id, nextAvailable);
            setNextNodeNumber(nextAvailable + 1);
        }
       
        setSelectedNodes(newNodeMap);
      }
    };

    if (connectedDots?.length === 0) {
      setConnectedDots([dotId]);
      assignNodeNumber(dotId);
    } else if (connectedDots.length === 1 && connectedDots[0] !== dotId) {
      if (selectedComponent === 'NpnTransistor'||selectedComponent==='PnpTransistor'||selectedComponent === 'PMosfet'||selectedComponent === 'NMosfet') {
        setConnectedDots([...connectedDots, dotId]);
        assignNodeNumber(dotId);
      } else {
        const [row1, col1] = connectedDots[0].split("-");
        const [row2, col2] = dotId.split("-");

        if (row1 === row2 || col1 === col2) {
          const existingLine = lines.find(line => {
            const [_, startDot, endDot] = line.split("_");
            return (startDot === connectedDots[0] && endDot === dotId) || 
                   (startDot === dotId && endDot === connectedDots[0]);
          });

          if (!existingLine) {
            assignNodeNumber(dotId);
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
      assignNodeNumber(dotId);
      const lineId = connectDots(connectedDots[0], connectedDots[1], dotId);
      setLines([...lines, lineId]);
      setValMap((valMap) => {
        const newMap = new Map(valMap);
        newMap.set(lineId, 1);
        return newMap;
      });
      setConnectedDots([]);
    } else if (connectedDots.length === 1 && connectedDots[0] === dotId) {
      setConnectedDots([]);
    }
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
    // console.log("Hovered line:", lineId);
    setLineCurrentPos({x: e.clientX , y: e.clientY});
    setLineCurrentVisible(true);
    setLineCurrentDotId(lineId);
  }

  const hideLineCurrent = ()=>{
    setLineCurrentVisible(false);
  }

  const connectDots = (dotId1, dotId2, dotId3 = null) => {
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

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    svg.selectAll(`#${lineId}`).remove();

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
      x3,
      y3
    );
    return lineId;
  };

  const removeLine = (lineId) => {
    const svg = d3.select(svgRef.current);
    svg.select(`#${lineId}`).remove();
    setLines(lines.filter((id) => id !== lineId));

    const lineParts = lineId.split("_");
    const dotIds = lineParts.slice(1);

    console.log("Removing dots:", dotIds);

    const newNodeMap = new Map(updatedNodes);
    dotIds.forEach(dotId => {
      const isUsedByOtherComponents = lines.some(otherLineId => {
        if (otherLineId === lineId) return false;
        const otherLineParts = otherLineId.split("_");
        const otherDotIds = otherLineParts.slice(1);
        return otherDotIds.includes(dotId);
      });

      if (!isUsedByOtherComponents) {
        newNodeMap.delete(dotId);
        console.log(`Removed node ${dotId} from updatedNodes`);
      } else {
        console.log(`Node ${dotId} kept - used by other components`);
      }
    });

    setSelectedNodes(newNodeMap);

    setValMap((valMap) => {
      const newMap = new Map(valMap);
      newMap.delete(lineId);
      return newMap;
    });

    if (newNodeMap.size === 0) {
      setNextNodeNumber(0);
      console.log("All nodes removed, reset nextNodeNumber to 0");
    }
  };

  const setGroundNode = (nodeId) => {
    const newNodeMap = new Map(updatedNodes);
    newNodeMap.set(nodeId, 0);
    setSelectedNodes(newNodeMap);
    
    if (nextNodeNumber === 0) {
        setNextNodeNumber(1);
    }

    console.log(`Node ${nodeId} set as ground.`);
    console.log(updatedNodes);
  }

  const handleLineDoubleClick = (lineId, value) => {
    if (selectedComponent === "VCVS" || selectedComponent==="VCCS") {
      const currentValue = typeof value === 'object' ? value.value : value;
      const currentDep1 = typeof value === 'object' ? value.dependentNode1 : '';
      const currentDep2 = typeof value === 'object' ? value.dependentNode2 : '';
      
      const gain = prompt(`Enter ${selectedComponent === "VCVS" ? "voltage gain" : "transadmitance"} for ${lineId}:`, currentValue || '1');
      const dep1 = prompt("Enter controlling terminal node 1:", currentDep1);
      const dep2 = prompt("Enter controlling terminal node 2:", currentDep2);
  
      if (gain !== null && dep1 !== null && dep2 !== null) {
        setValMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(lineId, {
            value: gain,
            dependentNode1: dep1,
            dependentNode2: dep2
          });
          return newMap;
        });
      }
      return;
    }else if (selectedComponent === "CCCS" || selectedComponent==="CCVS") {
      const currentValue = typeof value === 'object' ? value.value : value;
      const voltageDep1 = typeof value === 'object' ? value.Vcontrol : '';
      
      const gain = prompt(`Enter ${selectedComponent === "CCCS" ? "Current gain" : "transimpedance"} for ${lineId}:`, currentValue || '1');
      const dep1 = prompt("Enter controlling voltage terminal like V1,I1", voltageDep1);
     
  
      if (gain !== null && dep1 !== null) {
        setValMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(lineId, {
            value: gain,
            Vcontrol: dep1,
            
          });
          return newMap;
        });
      }
      return;
    }else if(selectedComponent=== "AC"){
      const voltage= typeof value === 'object' ? value.value : value;
      const phase= typeof value==='object'? value.phase: '';
      const volt = prompt(`Enter  AC Voltage for ${lineId}:`, voltage || '0');
      const phase1 = prompt("Enter Phase angle:", phase);
      if (volt !== null && phase1 !== null) {
        setValMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(lineId, {
            value: volt,
            phase: phase1,
            
          });
          return newMap;
        });
      }
      return;
    }else{
    const currentValue = typeof value === 'object' ? value.value : value;
    const newValue = prompt(`Update the value for component ${lineId}:`, currentValue);
    if (newValue !== null) {
      setValMap((valMap) => {
        const newMap = new Map(valMap);
        newMap.set(lineId, newValue);
        return newMap;
      });
    }
    }
  };

  const generateNetlist = async () => {
    try {
      const circuitData = {
        components: lines.map((lineId) => {
          const [componentType, ...dotIds] = lineId.split('_');
          const component = components[componentType];
          const value = valMap.get(lineId) || 'not set';
          const nodeNumbers = dotIds.map(dotId => updatedNodes.has(dotId) ? updatedNodes.get(dotId) : '?');
          
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

  const getCurrentValue = (lineId, simData, temp) => {
    if (!simData || !simData.current || !temp[lineId]) {
      return "No data";
    }
    
    const currentKey = `I_${temp[lineId]}`;
    const currentValue = simData.current[currentKey];
    
    if (currentValue === undefined || currentValue === null) {
      return "No data";
    }
    
    const numericValue = parseFloat(currentValue);
    const absoluteValue = Math.abs(numericValue);
    
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
    
    const lineParts = lineId.split('_');
    const node1Id = lineParts[1];
    const node2Id = lineParts[2];
    
    const node1Num = updatedNodes.get(node1Id);
    const node2Num = updatedNodes.get(node2Id);
    
    if (node1Num === undefined || node2Num === undefined) {
      return "No data";
    }
    
    const v1 = simData.voltages[`V_node_${node1Num}`] || 0;
    const v2 = simData.voltages[`V_node_${node2Num}`] || 0;
    
    const voltageDifference = parseFloat(v1) - parseFloat(v2);
    const absoluteVoltage = Math.abs(voltageDifference);
    
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
    <div>
      <div className="circuit-navbar">
        <span className="navbar-brand logo-pulse logo-text fw-bold fs-3 text-black" style={{ color: 'black' }}>CircuitSim</span>
        <button className="back-btn" onClick={() => navigate("/")}>
          ⬅ Back to Home
        </button>
      </div>
      <div className="circuit-layout">
        <aside className="circuit-sidebar">
          <div className="sidebar-section">
            <h3>Component</h3>
            <select
              value={selectedComponent || ""}
              onChange={(e) => setSelectedComponent(e.target.value)}
            >
              {Object.keys(components).map((item) => (
                <option value={components[item].name} key={item}>
                  {components[item].name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="sidebar-section">
            <h3>Actions</h3>
            <button
              className="danger"
              onClick={() => {
                if (lines.length > 0) {
                  selectedLine && removeLine(selectedLine);
                  setSelectedLine();
                }
              }}
              disabled={!selectedLine}
            >
              Remove
            </button>
            <button
              className="secondary"
              onClick={() => {
                if (connectedDots && connectedDots[0]) {
                  setGroundNode(connectedDots[0]);
                } else {
                  console.log("No node selected to set as ground.");
                }
              }}
            >
              Set Ground
            </button>
            <button className="secondary" onClick={generateNetlist}>
              Generate Netlist
            </button>
          </div>
          <div className="sidebar-section">
            <h3>Simulation</h3>
            <select
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
              aria-label="Select analysis type"
            >
              <option value="dc">DC Analysis</option>
              <option value="ac">AC Analysis</option>
              <option value="transient">Transient Analysis</option>
            </select>
            <input
              type="text"
              id="frequency"
              name="frequency"
              placeholder="Frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            />
            <button onClick={sendSimulationData}>Run Simulation</button>
            <button className="secondary" onClick={viewSimulation}>
              View Results
            </button>
          </div>
        </aside>
        <main className="circuit-canvas-area">
          <div className="circuit-svg-board">
            <svg ref={svgRef} width={numCols * (2 * dotRadius + gap)} height={numRows * (2 * dotRadius + gap)}>
              {Array.from({ length: numRows }).map((_, row) =>
                Array.from({ length: numCols }).map((_, col) => (
                  <g key={`group-${row}-${col}`}>
                    <circle
                      className="circuit-dot"
                      id={`dot-${row}-${col}`}
                      cx={col * (2 * dotRadius + gap) + dotRadius}
                      cy={row * (2 * dotRadius + gap) + dotRadius}
                      r={dotRadius}
                      fill={connectedDots?.includes(`${row}-${col}`) ? "red" : "#2979ff"}
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
                      x={col * (2 * dotRadius + gap) + dotRadius + 7}
                      y={row * (2 * dotRadius + gap) + dotRadius + 10}
                      fill="grey"
                      fontSize="9"
                    >
                      {updatedNodes.has(`${row}-${col}`) ? updatedNodes.get(`${row}-${col}`) : ""}
                    </text>
                  </g>
                ))
              )}
            </svg>
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
                {(simData["voltages"] && simData["voltages"][`V_node_${updatedNodes.get(NodeVoltageDotId)}`]) || `Node ${updatedNodes.get(NodeVoltageDotId)}`}
              </div>
            )}
          </div>
        </main>
        <aside className="circuit-info-panel">
  <h4>Component Information</h4>

  {LineCurrentId ? (() => {
    const firstTwoChars = LineCurrentId.slice(0, 2);
    const firstChar = LineCurrentId.charAt(0);
    const lastTwoChars = LineCurrentId.slice(2, 4);
    const value = valMap.get(LineCurrentId);
    const label = temp?.[LineCurrentId] || LineCurrentId;

    // Safety check for simData
    const voltage = simData?.voltages?.[`V_${label}`] ?? 'N/A';
    const current = simData?.current?.[`I_${label}`] ?? 'N/A';

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
            📊 {label}
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
            ⚡ {label}
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

    // Default component info block
    return (
      <div style={{
        padding: '12px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '8px'
      }}>
        <div style={{
          fontWeight: 'bold',
          marginBottom: '8px',
          color: '#495057'
        }}>
          {label}: {
            typeof value === 'object' && value !== null ? (
              <>
                {value.value} {
                  (() => {
                    if ((firstTwoChars === 'VC' || firstTwoChars === 'CC') && lastTwoChars === 'VS') return 'V';
                    if ((firstTwoChars === 'VC' || firstTwoChars === 'CC') && lastTwoChars === 'CS') return 'A';
                    if (firstChar === 'A' || firstChar === 'V') return 'V';
                    if (firstChar === 'R') return 'Ω';
                    if (firstChar === 'C') return 'F';
                    if (firstChar === 'L') return 'H';
                    return '';
                  })()
                }<br />
                {
                  value.dependentNode1 && value.dependentNode2 ? (
                    <>
                      Dependent Node 1: {value.dependentNode1}<br />
                      Dependent Node 2: {value.dependentNode2}
                    </>
                  ) : (
                    value.Vcontrol && <> Control: {value.Vcontrol}</>
                  )
                }
              </>
            ) : (
              value ?? "No value available"
            )
          }
        </div>

        {(simData?.voltages || simData?.current) && (
          <>
            <div style={{ marginBottom: '5px' }}>
              <strong>Voltage:</strong> {voltage} V
            </div>
            <div>
              <strong>Current:</strong> {current} A
            </div>
          </>
        )}
      </div>
    );
  })() : (
    <div style={{
      color: '#6c757d',
      fontStyle: 'italic',
      textAlign: 'center',
      padding: '20px'
    }}>
      Hover over a component to see its information
    </div>
  )}

  <h4>SPICE Netlist</h4>
  <pre>{netlist || "No netlist generated yet"}</pre>
</aside>

      </div>
    </div>
  );
};

export default CircuitCanvas;

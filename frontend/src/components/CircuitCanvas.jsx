import React from "react";
import * as d3 from "d3";
import { components } from "../assets/componentsLibrary";
import { useMyContext } from "../contextApi/MyContext";
import { useState, useEffect } from "react";
import "./CircuitCanvas.css";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const CircuitCanvas = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
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
    setUpdatedNodes,
    sendSimulationData,
    sendparameterData,
    viewSimulation,
    analysisType,
    setAnalysisType,
    parameterType,
    setparameterType,
    parametervalue,
    setparametervalue,
    frequency,
    setFrequency,
    p1n1,
    p1n2,
    p2n1,
    p2n2,
    setp1n1,
    setp1n2,
    setp2n1,
    setp2n2,
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
  const [parameterResults, setParameterResults] = useState(null);
  const [showParameterResults, setShowParameterResults] = useState(false);
  const [complexform, setcomplexform] = useState(false);
  // const [groundNodeId, setGroundNodeId] = useState(null); // store the selected ground node

  const svgRef = React.createRef();
  const numRows = 30;
  const numCols = 20;
  const dotRadius = 4;
  const gap = 40;
  const [netlist, setNetlist] = useState("");
  const [nextNodeNumber, setNextNodeNumber] = useState(0);

  // Dark mode toggle function
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Apply theme to body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (parametervalue && parametervalue.parameters && parametervalue.parameters.numeric) {
      setShowParameterResults(true);
    }
  }, [parametervalue]);

  // Enhanced complex number formatting functions
  const formatComplexNumber = (complexNum, precision = 3) => {
    if (complexNum == null) return '0';

    if (typeof complexNum === 'number') {
      if (!isFinite(complexNum)) return complexNum.toString();
      return complexNum.toFixed(precision);
    }

    if (typeof complexNum === 'object') {
      const real = parseFloat(complexNum.real || complexNum.re || 0);
      const imag = parseFloat(complexNum.imag || complexNum.im || complexNum.i || 0);
      
      if (!isFinite(real) || !isFinite(imag)) return 'Invalid';
      
      const threshold = Math.pow(10, -(precision + 2));
      
      // Pure real number
      if (Math.abs(imag) < threshold) {
        return real.toFixed(precision);
      }
      
      // Pure imaginary number
      if (Math.abs(real) < threshold) {
        if (Math.abs(imag - 1) < threshold) return 'j';
        if (Math.abs(imag + 1) < threshold) return '-j';
        return `${imag.toFixed(precision)}j`;
      }
      
      // Complex number with both real and imaginary parts
      const realStr = real.toFixed(precision);
      const imagStr = Math.abs(imag).toFixed(precision);
      
      let imagPart;
      if (Math.abs(imag - 1) < threshold) {
        imagPart = 'j';
      } else if (Math.abs(imag + 1) < threshold) {
        imagPart = '-j';
      } else {
        imagPart = `${imagStr}j`;
      }
      
      const sign = imag >= 0 ? '+' : '-';
      return imag >= 0 ? `${realStr}+${imagPart}` : `${realStr}-${imagPart}`;
    }

    if (typeof complexNum === 'string') {
      const num = parseFloat(complexNum);
      if (!isNaN(num)) {
        return num.toFixed(precision);
      }
      return complexNum;
    }

    return complexNum.toString();
  };

  // Specialized impedance formatting for electrical engineering
  const formatImpedance = (complexNum, options = {}) => {
    const {
      precision = 1,
      unit = 'Ω',
      removeTrailingZeros = true,
      imaginaryUnit = 'j',
      showAsKilo = true
    } = options;
  
    if (complexNum == null) return '0';
  
    // Handle string input like "1e-12-318309.8861837907j"
    if (typeof complexNum === 'string') {
      const match = complexNum.match(/([+-]?[\d.]+(?:[eE][+-]?\d+)?)\s*([+-])\s*([\d.]+(?:[eE][+-]?\d+)?)j?/);
      if (match) {
        const real = parseFloat(match[1]);
        const imag = parseFloat(match[2] + match[3]);
        complexNum = { real, imag };
      } else {
        // Try parsing as a simple number
        const num = parseFloat(complexNum);
        if (!isNaN(num)) {
          complexNum = { real: num, imag: 0 };
        }
      }
    }
  
    // Rest of your formatImpedance function...
    if (typeof complexNum === 'object') {
      const real = parseFloat(complexNum.real || complexNum.re || 0);
      const imag = parseFloat(complexNum.imag || complexNum.im || complexNum.i || 0);
      
      if (!isFinite(real) || !isFinite(imag)) return 'Invalid';
      
      const threshold = Math.pow(10, -(precision + 2));
      
      // Convert to appropriate units
      let displayReal = real;
      let displayImag = imag;
      let displayUnit = unit;
      
      if (showAsKilo && (Math.abs(real) > 1000 || Math.abs(imag) > 1000)) {
        displayReal = real / 1000;
        displayImag = imag / 1000;
        displayUnit = 'k' + unit;
      }
      
      let realStr = displayReal.toFixed(precision);
      let imagStr = displayImag.toFixed(precision);
      
      if (removeTrailingZeros) {
        realStr = parseFloat(realStr).toString();
        imagStr = parseFloat(imagStr).toString();
      }
      
      // Pure imaginary (like your impedance examples)
      if (Math.abs(displayReal) < threshold) {
        if (Math.abs(displayImag - 1) < threshold) {
          return unit ? `${imaginaryUnit} ${displayUnit}` : imaginaryUnit;
        }
        if (Math.abs(displayImag + 1) < threshold) {
          return unit ? `-${imaginaryUnit} ${displayUnit}` : `-${imaginaryUnit}`;
        }
        const result = `${imagStr}${imaginaryUnit}`;
        return unit ? `${result} ${displayUnit}` : result;
      }
      
      // Pure real
      if (Math.abs(displayImag) < threshold) {
        return unit ? `${realStr} ${displayUnit}` : realStr;
      }
      
      // Complex number with both parts
      const sign = displayImag >= 0 ? '+' : '-';
      const absImagStr = Math.abs(parseFloat(imagStr)).toString();
      
      let result;
      if (Math.abs(Math.abs(displayImag) - 1) < threshold) {
        result = `${realStr}${sign}${imaginaryUnit}`;
      } else {
        result = `${realStr}${sign}${absImagStr}${imaginaryUnit}`;
      }
      
      return unit ? `${result} ${displayUnit}` : result;
    }
  
    return complexNum.toString();
  };
  const parseComplexFromBackend = (complexValue) => {
    if (!complexValue) return { real: 0, imag: 0 };
    
    // Handle if it's already an object with real/imag properties
    if (typeof complexValue === 'object' && complexValue !== null) {
      if ('real' in complexValue && 'imag' in complexValue) {
        return {
          real: parseFloat(complexValue.real) || 0,
          imag: parseFloat(complexValue.imag) || 0
        };
      }
      if ('re' in complexValue && 'im' in complexValue) {
        return {
          real: parseFloat(complexValue.re) || 0,
          imag: parseFloat(complexValue.im) || 0
        };
      }
    }
    
    // Handle string format like "1e-03+6.28e-03j" or "(1e-03+6.28e-03j)"
    if (typeof complexValue === 'string') {
      // Remove parentheses if present
      let cleanStr = complexValue.replace(/[()]/g, '').trim();
      
      // Handle pure real numbers
      if (!cleanStr.includes('j') && !cleanStr.includes('i')) {
        const realVal = parseFloat(cleanStr);
        return { real: isNaN(realVal) ? 0 : realVal, imag: 0 };
      }
      
      // Handle pure imaginary numbers like "6.28e-03j"
      const pureImagMatch = cleanStr.match(/^([+-]?[\d.]+(?:[eE][+-]?\d+)?)[ji]$/);
      if (pureImagMatch) {
        return { real: 0, imag: parseFloat(pureImagMatch[1]) || 0 };
      }
      
      // Handle complex numbers like "1e-03+6.28e-03j" or "1e-03-6.28e-03j"
      const complexMatch = cleanStr.match(/([+-]?[\d.]+(?:[eE][+-]?\d+)?)\s*([+-])\s*([\d.]+(?:[eE][+-]?\d+)?)[ji]/);
      if (complexMatch) {
        const real = parseFloat(complexMatch[1]) || 0;
        const imagSign = complexMatch[2] === '+' ? 1 : -1;
        const imag = (parseFloat(complexMatch[3]) || 0) * imagSign;
        return { real, imag };
      }
      
      // Handle format like "1e-03 + j6.28e-03" (with spaces)
      const spacedMatch = cleanStr.match(/([+-]?[\d.]+(?:[eE][+-]?\d+)?)\s*([+-])\s*[ji]\s*([\d.]+(?:[eE][+-]?\d+)?)/);
      if (spacedMatch) {
        const real = parseFloat(spacedMatch[1]) || 0;
        const imagSign = spacedMatch[2] === '+' ? 1 : -1;
        const imag = (parseFloat(spacedMatch[3]) || 0) * imagSign;
        return { real, imag };
      }
    }
    
    // Handle numeric values
    if (typeof complexValue === 'number') {
      return { real: complexValue, imag: 0 };
    }
    
    console.warn('Could not parse complex value:', complexValue);
    return { real: 0, imag: 0 };
  };
  
  const formatAdmittance = (complexNum, options = {}) => {
    const {
      precision = 2,
      unit = 'S',
      removeTrailingZeros = true,
      imaginaryUnit = 'j',
      useEngNotation = true
    } = options;
  
    if (complexNum == null) return '0';
  
    // Parse the complex number
    const parsed = parseComplexFromBackend(complexNum);
    const { real, imag } = parsed;
    
    if (!isFinite(real) || !isFinite(imag)) return 'Invalid';
    
    const threshold = Math.pow(10, -(precision + 2));
    
    // Engineering notation helper
    const toEngNotation = (val) => {
      if (Math.abs(val) < 1e-15) return '0';
      
      const abs_val = Math.abs(val);
      const sign = val < 0 ? '-' : '';
      
      const prefixes = [
        ['T', 1e12], ['G', 1e9], ['M', 1e6], ['k', 1e3],
        ['', 1], ['m', 1e-3], ['u', 1e-6], ['n', 1e-9], 
        ['p', 1e-12], ['f', 1e-15]
      ];
      
      for (const [suffix, scale] of prefixes) {
        if (abs_val >= scale) {
          const scaled = abs_val / scale;
          if (scaled < 1000) {
            let formatted = scaled.toFixed(precision);
            if (removeTrailingZeros) {
              formatted = parseFloat(formatted).toString();
            }
            return `${sign}${formatted}${suffix}`;
          }
        }
      }
      
      return `${sign}${abs_val.toExponential(precision)}`;
    };
    
    // Pure real number
    if (Math.abs(imag) < threshold) {
      const result = useEngNotation ? toEngNotation(real) : real.toFixed(precision);
      return unit ? `${result} ${unit}` : result;
    }
    
    // Pure imaginary number
    if (Math.abs(real) < threshold) {
      if (Math.abs(Math.abs(imag) - 1) < threshold) {
        const result = imag > 0 ? imaginaryUnit : `-${imaginaryUnit}`;
        return unit ? `${result} ${unit}` : result;
      }
      const imagStr = useEngNotation ? toEngNotation(imag) : imag.toFixed(precision);
      const result = `${imagStr}${imaginaryUnit}`;
      return unit ? `${result} ${unit}` : result;
    }
    
    // Complex number with both parts
    const realStr = useEngNotation ? toEngNotation(real) : real.toFixed(precision);
    const imagAbs = Math.abs(imag);
    const imagStr = useEngNotation ? toEngNotation(imagAbs) : imagAbs.toFixed(precision);
    const sign = imag >= 0 ? '+' : '-';
    
    let result;
    if (Math.abs(imagAbs - 1) < threshold) {
      result = `${realStr} ${sign} ${imaginaryUnit}`;
    } else {
      result = `${realStr} ${sign} ${imagStr}${imaginaryUnit}`;
    }
    
    return unit ? `${result} ${unit}` : result;
  };
  
  
  const handleDotClick = (dotId) => {
    const assignNodeNumber = (id) => {
      if (!updatedNodes.has(id)) {
        const newNodeMap = new Map(updatedNodes);
        if (nextNodeNumber === 0 && !Array.from(updatedNodes.values()).includes(0)) {
          newNodeMap.set(id, 0);
          setNextNodeNumber(1);
        } else if (nextNodeNumber > 0) {
          let nextAvailable = 1;
          while (Array.from(updatedNodes.values()).includes(nextAvailable)) {
            nextAvailable++;
          }
          newNodeMap.set(id, nextAvailable);
          setNextNodeNumber(nextAvailable + 1);
        } else {
          let nextAvailable = 1;
          while (Array.from(updatedNodes.values()).includes(nextAvailable)) {
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
      if (selectedComponent === 'NpnTransistor' || selectedComponent === 'PnpTransistor' || selectedComponent === 'PMosfet' || selectedComponent === 'NMosfet') {
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
    } else if (connectedDots.length === 2 && (selectedComponent === 'NpnTransistor' || selectedComponent === 'PnpTransistor' || selectedComponent === 'PMosfet' || selectedComponent === 'NMosfet')) {
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

  const showLineCurrent = (e, lineId) => {
    setLineCurrentPos({ x: e.clientX, y: e.clientY });
    setLineCurrentVisible(true);
    setLineCurrentDotId(lineId);
  };

  const hideLineCurrent = () => {
    setLineCurrentVisible(false);
  };

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
      y3,
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
    if (!nodeId) {
      toast.error("Please select a valid node to set as ground.");
      return;
    }
  
    setUpdatedNodes((prevNodes) => {
      const newNodeMap = new Map(prevNodes);
  
      // ✅ Check if ground already exists
      if ([...newNodeMap.values()].includes(0)) {
        toast.error("Ground node is already set.");
        return prevNodes;
      }
  
      newNodeMap.set(nodeId, 0);
  
      // ✅ Show toast with the actual node number (0 for ground)
      toast.success(`Ground set at Node ${newNodeMap.get(nodeId)}`);
  
      console.log(`Node ${nodeId} set as ground (Node Number: ${newNodeMap.get(nodeId)})`);
      return newNodeMap;
    });
  
    if (nextNodeNumber === 0) {
      setNextNodeNumber(1);
    }
  };
  
  
  

  const handleLineDoubleClick = (lineId, value) => {
    if (selectedComponent === "VCVS" || selectedComponent === "VCCS") {
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
    } else if (selectedComponent === "CCCS" || selectedComponent === "CCVS") {
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
    } else if (selectedComponent === "AC") {
      const voltage = typeof value === 'object' ? value.value : value;
      const phase = typeof value === 'object' ? value.phase : '';
      const volt = prompt(`Enter AC Voltage for ${lineId}:`, voltage || '0');
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
    } else {
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
      const response = await fetch('http://127.0.0.1:8000/generate-netlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' ,
          'Accept': 'application/json',
        },
        body: JSON.stringify({})
      });
  
      if (!response.ok) {
        const errorText = await response.text();
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

  const renderZParameterMatrix = () => {
    if (!parametervalue || !parametervalue.parameters || !parametervalue.parameters.numeric) return null;
    
    const { Z11, Z12, Z21, Z22 } = parametervalue.parameters.numeric;
    const { Z11: symZ11, Z12: symZ12, Z21: symZ21, Z22: symZ22 } = parametervalue.parameters.symbolic;
    
    return (
      <div style={{
        padding: '15px',
        backgroundColor: '#f8f9fa',
        border: '2px solid #007bff',
        borderRadius: '10px',
        marginBottom: '15px'
      }}>
        <h4 style={{ color: '#007bff', marginBottom: '10px' }}>
          Z-Parameter Matrix at {frequency} Hz
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto auto auto',
          gap: '10px',
          alignItems: 'center',
          fontSize: '14px'
        }}>
          <div style={{ gridColumn: '1 / 2', textAlign: 'center', fontWeight: 'bold' }}>
            [Z] =
          </div>
          
          <div style={{
            gridColumn: '2 / 4',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '5px',
            border: '1px solid #ccc',
            padding: '10px',
            backgroundColor: 'white',
            color: 'black'
          }}>
            {/* <p>{symZ11}</p> */}
            <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
            {complexform ? 
                formatImpedance(Z11, { precision: 1, unit: 'Ω', showAsKilo: true }) : 
                formatImpedance(Z11, { precision: 2, unit: 'Ω' })
              }
            </div>
            <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
              {complexform ? 
                formatImpedance(Z12, { precision: 1, unit: 'Ω', showAsKilo: true }) : 
                formatImpedance(Z12, { precision: 2, unit: 'Ω' })
              }
            </div>
            <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
              {complexform ? 
                formatImpedance(Z21, { precision: 1, unit: 'Ω', showAsKilo: true }) : 
                formatImpedance(Z21, { precision: 2, unit: 'Ω' })
              }
            </div>
            <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
              {complexform ? 
                formatImpedance(Z22, { precision: 1, unit: 'Ω', showAsKilo: true }) : 
                formatImpedance(Z22, { precision: 2, unit: 'Ω' })
              }
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          <div>Z11: Input impedance at port 1</div>
          <div>Z12: Transfer impedance (port 1 to 2)</div>
          <div>Z21: Transfer impedance (port 2 to 1)</div>
          <div>Z22: Input impedance at port 2</div>
        </div>
  
        {Z12 && Z21 && Math.abs(parseFloat(Z12) - parseFloat(Z21)) < 1e-6 && (
          <div style={{
            marginTop: '10px',
            padding: '5px',
            backgroundColor: '#d4edda',
            color: '#155724',
            borderRadius: '5px',
            fontSize: '12px'
          }}>
            ✓ Network is reciprocal (Z12 = Z21)
          </div>
        )}
  {complexform}
        {/* <button className="complex-btn" onClick={() => setcomplexform(prev => !prev)}>
          {complexform ? 'Normal Form' : 'Complex form'}
        </button> */}
        <button className="close-btn" onClick={() => setShowParameterResults(false)}>
          Close
        </button>
      </div>
    );
  };
  

  const renderYParameterMatrix = (parametervalue, frequency, parameterType, complexform, setShowParameterResults) => {
    if (!parametervalue || !parametervalue.parameters || !parametervalue.parameters.numeric || parameterType !== 'y') return null;
  
    const { Y11, Y12, Y21, Y22 } = parametervalue.parameters.numeric;
    const { Y11: symY11, Y12: symY12, Y21: symY21, Y22: symY22 } = parametervalue.parameters.symbolic || {};
  
    // Check reciprocity
    const y12_parsed = parseComplexFromBackend(Y12);
    const y21_parsed = parseComplexFromBackend(Y21);
    const reciprocity_error = Math.sqrt(
      Math.pow(y12_parsed.real - y21_parsed.real, 2) + 
      Math.pow(y12_parsed.imag - y21_parsed.imag, 2)
    );
    const isReciprocal = reciprocity_error < 1e-10;
  
    return (
      <div style={{
        padding: '15px',
        backgroundColor: '#f8f9fa',
        border: '2px solid #28a745',
        borderRadius: '10px',
        marginBottom: '15px'
      }}>
        <h4 style={{ color: '#28a745', marginBottom: '10px' }}>
          Y-Parameter Matrix @ {frequency} Hz
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto auto auto',
          gap: '10px',
          alignItems: 'center',
          fontSize: '14px'
        }}>
          <div style={{ gridColumn: '1 / 2', textAlign: 'center', fontWeight: 'bold' }}>
            [Y] =
          </div>
          <div style={{
            gridColumn: '2 / 4',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '5px',
            border: '1px solid #ccc',
            padding: '10px',
            backgroundColor: 'white',
            color: 'black'
          }}>
            <div style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '12px' }}>
              {formatAdmittance(Y11, { precision: 2, unit: 'S' })}
            </div>
            <div style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '12px' }}>
              {formatAdmittance(Y12, { precision: 2, unit: 'S' })}
            </div>
            <div style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '12px' }}>
              {formatAdmittance(Y21, { precision: 2, unit: 'S' })}
            </div>
            <div style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '12px' }}>
              {formatAdmittance(Y22, { precision: 2, unit: 'S' })}
            </div>
          </div>
        </div>
  
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          <div>Y11: Input admittance at port 1</div>
          <div>Y12: Reverse transfer admittance</div>
          <div>Y21: Forward transfer admittance</div>
          <div>Y22: Input admittance at port 2</div>
        </div>
  
        {/* Network properties */}
        <div style={{ marginTop: '10px' }}>
          {isReciprocal ? (
            <div style={{
              padding: '5px',
              backgroundColor: '#d4edda',
              color: '#155724',
              borderRadius: '5px',
              fontSize: '12px'
            }}>
              ✓ Network is reciprocal (Y12 = Y21)
            </div>
          ) : (
            <div style={{
              padding: '5px',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              borderRadius: '5px',
              fontSize: '12px'
            }}>
              ⚠ Network is not reciprocal (error: {reciprocity_error.toExponential(2)})
            </div>
          )}
        </div>
  
        {/* Display symbolic forms if available */}
        {/* {symY11 && (
          // <div style={{ marginTop: '10px', fontSize: '11px', color: '#495057' }}>
          //   <strong>Symbolic:</strong>
          //   <div style={{ fontFamily: 'monospace', marginTop: '5px' }}>
          //     Y11 = {symY11}<br/>
          //     Y12 = {symY12}<br/>
          //     Y21 = {symY21}<br/>
          //     Y22 = {symY22}
          //   </div>
          // </div>
        )} */}
  
        <button 
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={() => setShowParameterResults(false)}
        >
          Close
        </button>
      </div>
    );
  };
  
  // Example usage in your component:
  /*
  In your CircuitCanvas component, replace the renderYParameterMatrix function with this enhanced version:
  
  const renderYParameterMatrix = () => {
    return renderYParameterMatrix(parametervalue, frequency, parameterType, complexform, setShowParameterResults);
  };
  */
  
  // Test the parsing with your actual data
  // console.log('Testing Y-parameter parsing:');
  // console.log('Y11:', formatAdmittance({ real: 1e-6, imag: 6.28e-3 }));
  // console.log('Y12:', formatAdmittance({ real: -1e-6, imag: 0 }));
  // console.log('Y21:', formatAdmittance({ real: -1e-6, imag: 0 }));
  // console.log('Y22:', formatAdmittance({ real: 1e-6, imag: 6.28e-3 }));

  return (
    <div className={`${isDarkMode ? 'dark-theme' : 'light-theme'} page-load`}>
      <div className="circuit-navbar">
        <span className="navbar-brand logo-pulse logo-text fw-bold fs-3">CircuitSim</span>
        <div className="navbar-controls d-flex align-items-center gap-3">
          <button 
            className="btn btn-outline-primary btn-sm rounded-pill"
            onClick={toggleDarkMode}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
          <button className="back-btn" onClick={() => navigate("/")}>
            ⬅ Back to Home
          </button>
        </div>
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
          <div className="sidebar-section">
            <h3>Parameters</h3>

            <select
              value={parameterType}
              onChange={(e) => setparameterType(e.target.value)}
              aria-label="Select Parameter type"
              className="dropdown"
            >
              <option value="z">Z-parameter</option>
              <option value="y">Y-parameter</option>
              <option value="ab" disabled>ABCD-parameter</option>
            </select>

            <input
              type="text"
              placeholder="Frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="input-full"
            />

            <div className="port-inputs">
              <input
                type="text"
                placeholder="p1n1"
                value={p1n1}
                onChange={(e) => setp1n1(e.target.value)}
              />
              <input
                type="text"
                placeholder="p1n2"
                value={p1n2}
                onChange={(e) => setp1n2(e.target.value)}
              />
              <input
                type="text"
                placeholder="p2n1"
                value={p2n1}
                onChange={(e) => setp2n1(e.target.value)}
              />
              <input
                type="text"
                placeholder="p2n2"
                value={p2n2}
                onChange={(e) => setp2n2(e.target.value)}
              />
            </div>
            <button onClick={sendparameterData} className="evaluate-button">
              Evaluate Parameters
            </button>
          </div>
        </aside>
        <main className="circuit-canvas-area">
          {showParameterResults && parametervalue && parametervalue.parameters && parametervalue.parameters.numeric && (
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 1000,
              minWidth: '300px'
            }}>
             {parameterType === 'z' ? 
  renderZParameterMatrix() : 
  parameterType === 'y' ? 
    renderYParameterMatrix(parametervalue, frequency, parameterType, complexform, setShowParameterResults) : 
    null
}

            </div>
          )}
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

            const voltage = simData?.voltages?.[`V_${label}`] ?? 'N/A';
            const current = simData?.current?.[`I_${label}`] ?? 'N/A';

            if (firstTwoChars === 'AM') {
              return (
                <div className={`component-info-card ${isDarkMode ? 'dark' : 'light'}`}>
                  <div className="component-header">
                    📊 {label}
                  </div>
                  <div className="component-value">
                    Current: {getCurrentValue(LineCurrentId, simData, temp)}
                  </div>
                  <div className="component-description">
                    Measuring current flow (absolute value)
                  </div>
                </div>
              );
            }

            if (firstTwoChars === 'VM') {
              return (
                <div className={`component-info-card ${isDarkMode ? 'dark' : 'light'}`}>
                  <div className="component-header">
                    ⚡ {label}
                  </div>
                  <div className="component-value">
                    Voltage: {getVoltageValue(LineCurrentId, simData, temp, updatedNodes)}
                  </div>
                  <div className="component-description">
                    Measuring voltage difference (absolute value)
                  </div>
                </div>
              );
            }

            return (
              <div className={`component-info-card ${isDarkMode ? 'dark' : 'light'}`}>
                <div className="component-label">
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
                  <div className="simulation-data">
                    <div className="data-item">
                      <strong>Voltage:</strong> {voltage} V
                    </div>
                    <div className="data-item">
                      <strong>Current:</strong> {current} A
                    </div>
                  </div>
                )}
              </div>
            );
          })() : (
            <div className={`no-component-message ${isDarkMode ? 'dark' : 'light'}`}>
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

import React, { createContext, useContext, useEffect, useState} from "react";
// import * as d3 from 'd3'

const MyContext = createContext();

export const ContextProvider = ({ children }) => {
  const [connectedDots, setConnectedDots] = useState([]);
  const [lines, setLines] = useState([]); // State variable to track lines
  const [selectedLine, setSelectedLine] = useState();
  const [selectedComponent, setSelectedComponent] = useState('W')
  const [valMap, setValMap] = useState(new Map());
  // const [imageSrc, setImageSrc] = useState('');

  const [selectedNodes, setSelectedNodes] = useState(new Map()); // to select nodes that are part of the schematics

  // console.log(selectedNodes)

  const [updatedNodes, setUpdatedNodes] = useState(new Map())

  const [simData, setSimData] = useState("");

  const [analysisType, setAnalysisType] = useState("dc"); // New state for analysis type
  const[parameterType,setparameterType]=useState("z")
  const [frequency, setFrequency] = useState();
  const[parametervalue,setparametervalue]=useState();
  useEffect(()=>{
    const handleUpdateNodes = ()=>{
      const newMap = new Map()
      let i = 0;
      for(const [key] of selectedNodes)
      {
        newMap.set(key, i);
        i++;
      }
      setUpdatedNodes(newMap);
    }
    return handleUpdateNodes();
  }, [selectedNodes])

console.log(valMap)
let sourceCnt = 0;
let temp = {};

  const components = [];

  valMap.forEach((value, key) => {
    const node1 = updatedNodes.get(key.split('_')[1]);
    const node2 = updatedNodes.get(key.split('_')[2]);
    const type = key.split('_')[0];
// First character indicates the component type

    let component = {
      type: '',
      id: '',
      node1: node1,
      node2: node2,
      node3:null,
      node4:null,
      value: '',
      dependentnode1:null,
      dependentnode2:null,
      Vcontrol:null,
      phase:null,
    };

    switch (type) {
      case "AC":
        sourceCnt++;
        component.type = 'AC Source';
        component.id = `V${sourceCnt}`;
        if (typeof value === 'object') {
          component.value = value.value;
          component.phase = value.phase
        } else {
          component.value = `${value}`;
        }
        temp[key] = `V${sourceCnt}`;
        break;
      case "L":
        component.type = 'Inductor';
        component.id = `L${components.filter(comp => comp.type === 'Inductor').length + 1}`;
        component.value = `${value}`;
        temp[key] = `L${components.filter(comp => comp.type === 'Inductor').length + 1}`;
        break;
      case "C":
        component.type = 'Capacitor';
        component.id = `C${components.filter(comp => comp.type === 'Capacitor').length + 1}`;
        component.value = `${value}`;
        temp[key] = `C${components.filter(comp => comp.type === 'Capacitor').length + 1}`;
        break;
      case "R":
        component.type = 'Resistor';
        component.id = `R${components.filter(comp => comp.type === 'Resistor').length + 1}`;
        component.value = `${value}`;
        temp[key] = `R${components.filter(comp => comp.type === 'Resistor').length + 1}`;
        break;
      case "W":
        component.type = 'Wire';
       
        component.id = `W${components.filter(comp => comp.type === 'Wire').length + 1}`;
        temp[key] = `W${components.filter(comp => comp.type === 'Wire').length + 1}`;
        break;
      case "D":
        component.type = 'Diode';
        component.id = `D${components.filter(comp => comp.type === 'Diode').length + 1}`;
        component.value = `${value}`;
        temp[key] = `D${components.filter(comp => comp.type === 'Diode').length + 1}`;
        break;
        case "NT":
          component.type = 'Npn Transistor';
          component.id = `T${components.filter(comp => comp.type === 'Npn Transistor').length + 1}`;
          component.value = `${value}`;
          component.node3 = updatedNodes.get(key.split('_')[3]);
          temp[key] = `T${components.filter(comp => comp.type === 'Npn Transistor').length + 1}`;
          break;
        case "PT":
          component.type = 'Pnp Transistor';
          component.id = `T${components.filter(comp => comp.type === 'Pnp Transistor').length + 1}`;
          component.value = `${value}`;
          component.node3 = updatedNodes.get(key.split('_')[3]);
          temp[key] = `T${components.filter(comp => comp.type === 'Pnp Transistor').length + 1}`;
          break;
        case "PM":

          component.type = 'P Mosfet';
          component.id = `T${components.filter(comp => comp.type === 'P Mosfet').length + 1}`;
          component.value = `${value}`;
          component.node3 = updatedNodes.get(key.split('_')[3]);
          component.node4 = updatedNodes.get(key.split('_')[3]);
          temp[key] = `T${components.filter(comp => comp.type === 'P Mosfet').length + 1}`;
          break;
        case "NM":
          component.type = 'N Mosfet';
          component.id = `T${components.filter(comp => comp.type === 'N Mosfet').length + 1}`;
          component.value = `${value}`;
          component.node3 = updatedNodes.get(key.split('_')[3]);
          component.node4 = updatedNodes.get(key.split('_')[4]);
          temp[key] = `T${components.filter(comp => comp.type === 'N Mosfet').length + 1}`;
          break;
        case "V":
          sourceCnt++;
          component.type = 'DC Source';
          component.id = `V${sourceCnt}`;
          component.value = `${value}`;
          temp[key] = `V${sourceCnt}`;
          break;
        case "Ammeter":
          component.type = 'Ammeter';
          component.id = `AM${components.filter(comp => comp.type === 'Ammeter').length + 1}`;
          component.value = '0'; // Ammeters don't have a value, they measure current
          temp[key] = `AM${components.filter(comp => comp.type === 'Ammeter').length + 1}`;
          break;
        case "Voltmeter":
          component.type = 'Voltmeter';
          component.id = `VM${components.filter(comp => comp.type === 'Voltmeter').length + 1}`;
          component.value = '0'; // Ammeters don't have a value, they measure current
          temp[key] = `VM${components.filter(comp => comp.type === 'Voltmeter').length + 1}`;
          break;
        case "VCVS":
            component.type = 'VCVS';
            component.id = `E${components.filter(comp => comp.type === 'VCVS').length + 1}`;
            // component.value = `${value}`;
            if (typeof value === 'object') {
              component.value = value.value;
              component.dependentnode1 = value.dependentNode1;
              component.dependentnode2 = value.dependentNode2;
            } else {
              component.value = `${value}`;
            }
            temp[key] = component.id;
            break;
          
        case "VCCS":
          component.type = 'VCCS';
          component.id = `G${components.filter(comp => comp.type === 'VCCS').length + 1}`;
          if (typeof value === 'object') {
            component.value = value.value;
            component.dependentnode1 = value.dependentNode1;
            component.dependentnode2 = value.dependentNode2;
          } else {
            component.value = `${value}`;
          }
          temp[key] = `G${components.filter(comp => comp.type === 'CCCS').length + 1}`;
          break;

          case "CCVS":
            component.type = 'CCVS';
            component.id = `H${components.filter(comp => comp.type === 'CCVS').length + 1}`;
            // component.value = `${value}`;
            if (typeof value === 'object') {
              component.value = value.value;
              component.Vcontrol=value.Vcontrol;
            } else {
              component.value = `${value}`;
            }
            temp[key] = component.id;
            break;
          
        case "CCCS":
          component.type = 'CCCS';
          component.id = `F${components.filter(comp => comp.type === 'CCCS').length + 1}`;
          if (typeof value === 'object') {
            component.value = value.value;
            component.Vcontrol=value.Vcontrol;
           
          } else {
            component.value = `${value}`;
          }
          temp[key] = `F${components.filter(comp => comp.type === 'CCCS').length + 1}`;
          break;

        case "CS":
          component.type = 'Current Source';
          component.id = `I${components.filter(comp => comp.type === 'Current Source').length + 1}`;
          component.value = `${value}`;
          temp[key] = `I${components.filter(comp => comp.type === 'Current Source').length + 1}`;
          break;
      default:
        component.type = 'Generic';
        component.id = key;
        component.value = value.toString(); // Ensure the value is a string
    }

    components.push(component);
  });
  
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

// Updated display component in the right panel
const AmmeterDisplay = ({ lineId, simData, temp, valMap }) => {
  const firstChar = lineId.slice(0, 2); // Use first 2 characters for ammeter (AM)
  
  if (firstChar === 'am') {
    return (
      <div style={{
        padding: '10px',
        margin: '5px 0',
        backgroundColor: '#f0f8ff',
        border: '2px solid #4682b4',
        borderRadius: '5px'
      }}>
        <div style={{ fontWeight: 'bold', color: '#2c5282' }}>
          📊 {temp[lineId] || 'Ammeter'}
        </div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a365d' }}>
          Current: {getCurrentValue(lineId, simData, temp)}
        </div>
        <div style={{ fontSize: '12px', color: '#4a5568' }}>
          Measuring current flow
        </div>
      </div>
    );
  }
  
  return null;
};

  const sendSimulationData = async () => {
    try {
      // Find ground node (node with value 0)
      let groundNode = null;
      for (const [key, value] of updatedNodes.entries()) {
        if (value === 0) {
          groundNode = key;
          break;
        }
      }
  
      // Convert the components array into a JSON string
      const netstring = JSON.stringify({
        components: components,
        groundNode: groundNode ? updatedNodes.get(groundNode) : 1 // Use node 1 as default ground if none specified
      }, null, 2);
  
      const body = { 
        netList: netstring, 
        numberNodes: updatedNodes.size,
        analysisType: analysisType,
        frequency: parseFloat(frequency) || 0
      };
  
      console.log('Sending simulation data:', body);
      console.log('Starting fetch request...');
      
      const response = await fetch('http://127.0.0.1:8000/simulation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(body),
      });
      
      console.log('Fetch response received:', response);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Simulation results:', data);
      
      // if (data.status === 'error') {
      //   throw new Error(data.error || 'Unknown error occurred during simulation');
      // }
      
      setSimData(data);
      alert('Simulation completed successfully!');
      
    } catch (error) {
      console.error('=== COMPLETE ERROR DETAILS ===');
      // console.error('Error:', error);
      // console.error('Error name:', error.name);
      // console.error('Error message:', error.message);
      // console.error('Error stack:', error.stack);
      // console.error('=============================');
      alert(`Simulation failed: ${error.message}`);
    }
  }
  const sendparameterData = async () => {
    try {
      // Find ground node (node with value 0)
      let groundNode = null;
      for (const [key, value] of updatedNodes.entries()) {
        if (value === 0) {
          groundNode = key;
          break;
        }
      }
  
      // Convert the components array into a JSON string
      const netstring = JSON.stringify({
        components: components,
        groundNode: groundNode ? updatedNodes.get(groundNode) : 1 // Use node 1 as default ground if none specified
      }, null, 2);
  
      const body = { 
        netList: netstring, 
        numberNodes: updatedNodes.size,
        parameterType: parameterType,
        frequency: parseFloat(frequency) || 0
      };
  
      console.log('Sending parameter data:', body);
      console.log('Starting fetch request...');
      
      const response = await fetch('http://127.0.0.1:8000/parameter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(body),
      });
      
      console.log('Fetch response received:', response);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('parameter results:', data);
      setparametervalue(data);
      console.log("parameter",parametervalue)
      // if (data.status === 'error') {
      //   throw new Error(data.error || 'Unknown error occurred during simulation');
      // }
      
      setSimData(data);
      alert('Parameter Evaluated successfully!');
      
    } catch (error) {
      console.error('=== COMPLETE ERROR DETAILS ===');
      // console.error('Error:', error);
      // console.error('Error name:', error.name);
      // console.error('Error message:', error.message);
      // console.error('Error stack:', error.stack);
      // console.error('=============================');
      alert(`Simulation failed: ${error.message}`);
    }
  }

  useEffect(() => {
    console.log('Context parametervalue (provider):', parametervalue);
  }, [parametervalue]);

  const viewSimulation = () => {
    // For DC analysis, show results in a popup instead of trying to fetch images
    if (analysisType === 'dc') {
      const popup = window.open('', '_blank', 'width=800,height=600');
      popup.document.write('<html><head><title>DC Analysis Results</title></head><body>');
      popup.document.write('<h2>DC Analysis Results</h2>');

      if (simData && simData.voltages) {
        popup.document.write('<h3>Node Voltages:</h3>');
        popup.document.write('<pre>' + JSON.stringify(simData.voltages, null, 2) + '</pre>');
      }

      if (simData && simData.current) {
        popup.document.write('<h3>Currents:</h3>');
        popup.document.write('<pre>' + JSON.stringify(simData.current, null, 2) + '</pre>');
      }

      popup.document.write('</body></html>');
      popup.document.close();
      return;
    }

    // For AC and Transient analysis, fetch and display images
    const apiUrl = `http://127.0.0.1:8000/get-images/${analysisType}`;

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.error) {
          console.error('Failed to load images:', data.error);
          alert('Failed to load simulation images. Please check the console for details.');
          return;
        }

        if (!data || data.length === 0) {
          alert('No simulation results available. Please run the simulation first.');
          return;
        }

        const popup = window.open('', '_blank', 'width=800,height=600');
        popup.document.write('<html><head><title>Simulation Results</title></head><body>');
        popup.document.write('<h2>Simulation Results</h2>');

        // Add numerical results if available
        if (simData) {
          if (simData.voltages) {
            popup.document.write('<h3>Voltages:</h3>');
            popup.document.write('<pre>' + JSON.stringify(simData.voltages, null, 2) + '</pre>');
          }
          if (simData.current) {
            popup.document.write('<h3>Currents:</h3>');
            popup.document.write('<pre>' + JSON.stringify(simData.current, null, 2) + '</pre>');
          }
        }

        // Add plots
        popup.document.write('<h3>Plots:</h3>');
        data.forEach(item => {
          popup.document.write(`<h4>${item.description}</h4>`);
          popup.document.write(`<img src="http://127.0.0.1:8000/${item.url}" alt="${item.description}" style="width:100%; max-width:800px;">`);
        });

        popup.document.write('</body></html>');
        popup.document.close();
      })
      .catch(error => {
        console.error('Error fetching images:', error);
        alert('Error fetching simulation images. Please check the console for details.');
      });
  }

  const [circuit, setCircuit] = useState([
    {
      id: 0,
      component: '',
      label: '',
      value: '',

      st_node: '',
      end_node: ''
    }
  ])
 

  return (
    <MyContext.Provider
      value={{
        connectedDots,
        setConnectedDots,
        lines,
        setLines,
        selectedLine,
        setSelectedLine,
        selectedComponent,
        setSelectedComponent,
        circuit,
        setCircuit,
        selectedNodes, 
        setSelectedNodes,
        updatedNodes, 
        setUpdatedNodes,
        sendSimulationData,
        sendparameterData, // Updated to use the new function name
        viewSimulation,
        analysisType,
        setAnalysisType, // Allowing components to update the analysis type
        parameterType,
        setparameterType,
        parametervalue,
        setparametervalue,
        frequency,
        setFrequency,
        simData,
        valMap,
        setValMap,
        temp,
        AmmeterDisplay
      }}
    >
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = ()=>{
    return useContext(MyContext);
}
import React, { createContext, useContext, useEffect, useState} from "react";
import { toast} from "react-toastify";
import Loader from "../elements/loader";
const MyContext = createContext();
export const ContextProvider = ({ children }) => {
  const [connectedDots, setConnectedDots] = useState([]);
  const [lines, setLines] = useState([]); // State variable to track lines
  const [selectedLine, setSelectedLine] = useState();
  const [selectedComponent, setSelectedComponent] = useState('W')
  const [valMap, setValMap] = useState(new Map());
  const [selectedNodes, setSelectedNodes] = useState(new Map()); // to select nodes that are part of the schematics
  const [updatedNodes, setUpdatedNodes] = useState(new Map())
  const [simData, setSimData] = useState("");
  const [analysisType, setAnalysisType] = useState("dc"); // New state for analysis type
  const[parameterType,setparameterType]=useState("s")
  const [isLoading, setIsLoading] = useState(false);
  const [frequency, setFrequency] = useState();
  const [startfrequency,setstartfrequency]=useState();
  const [endfrequency,setendfrequency]=useState();
  const[parametervalue,setparametervalue]=useState();
  const [p1n1, setp1n1] = useState();
  const [p1n2, setp1n2] = useState();
  const [p2n1, setp2n1] = useState();
  const [p2n2, setp2n2] = useState();
  const [impedance,setimpedance]=useState();
  const [impedance_Zo,setimpedance_Zo]=useState();
  const [electrical_length,setelectrical_length]=useState();
  const [frequency_prop,setfrequency_prop]=useState();
  const [frequency_prop_unit,setfrequency_prop_unit]=useState("GHz");
  const [frequency_num,setfrequency_num]=useState();
  useEffect(()=>{
    const handleUpdateNodes = ()=>{
      const newMap = new Map()
      let i = 1;
      for(const [key] of selectedNodes)
      {
        newMap.set(key, i);
        i++;
      }
      setUpdatedNodes(newMap);}
    return handleUpdateNodes();
  }, [selectedNodes])
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
      impedance:null,
      impedance_Zo:null,
      electrical_length:null,
      // frequency_prop:null
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
        case "TL":
            component.type = 'Transmission line';
            component.id = `TL${components.filter(comp => comp.type === 'Transmission line').length + 1}`;
            if (typeof value === 'object') {
              component.impedance = value.impedance;
              component.electrical_length = value.electrical_length
              // component.frequency_prop=value.frequency_prop
            } else {
              component.impedance = `${value}`;
            }
            temp[key] = `TL${components.filter(comp => comp.type === 'Transmission line').length + 1}`;
            break; 
          case "OPSTUB":
            component.type = 'Open Stub';
            component.id = `OS${components.filter(comp => comp.type === 'Open Stub').length + 1}`;
            if (typeof value === 'object') {
              component.impedance = value.impedance;
              component.electrical_length = value.electrical_length
              // component.frequency_prop=value.frequency_prop
            } else {
              component.impedance = `${value}`;
            }
            temp[key] = `OS${components.filter(comp => comp.type === 'Open Stub').length + 1}`;
            break;   
          case "SSTUB":
            component.type = 'Short Stub';
            component.id = `SS${components.filter(comp => comp.type === 'Short Stub').length + 1}`;
            if (typeof value === 'object') {
              component.impedance = value.impedance;
              component.electrical_length = value.electrical_length
              // component.frequency_prop=value.frequency_prop
            } else {
              component.impedance = `${value}`;
            }
            temp[key] = `SS${components.filter(comp => comp.type === 'Short Stub').length + 1}`;
            break;   
          case "port":
            component.type="port";
            component.id = `port${components.filter(comp => comp.type === 'port').length + 1}`;
            if (typeof value === 'object') {
              component.impedance_Zo = value.impedance_Zo;
              
            } else {
              component.impedance_Zo = `${value}`;
            }
            temp[key] = `port${components.filter(comp => comp.type === 'port').length + 1}`;
            break;   
      default:
        component.type = 'Generic';
        component.id = key;
        component.value = value.toString(); // Ensure the value is a string
    }
    components.push(component);
    console.log(valMap)
  });
const sendSimulationData = async () => {
  try {
    setIsLoading(true);
    let groundNode = null;
    for (const [key, value] of updatedNodes.entries()) {
      if (value === 0) {
        groundNode = key;
        break;
      }
    }
    if (!groundNode) {
      toast.error("Please set a ground node before running the simulation.");
      setIsLoading(false);
      return; // ❌ Exit function early
    }
    // Convert the components array into a JSON string
    const netstring = JSON.stringify({
      components: components,
      groundNode: updatedNodes.get(groundNode) // Now safe because groundNode is guaranteed
    }, null, 2);
    const body = { 
      netList: netstring, 
      numberNodes: updatedNodes.size,
      analysisType: analysisType,
      frequency: parseFloat(frequency) || 50,
    };
    console.log('Sending simulation data:', body);
    console.log('Starting fetch request...');
    const response = await fetch('https://circuit-simulator.onrender.com/simulation', {
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
    setSimData(data);
    toast.success("Simulation completed successfully!");
  } catch (error) {
    console.error('=== COMPLETE ERROR DETAILS ===');
    console.error(error);
    toast.error(`Simulation failed: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};
  const sendparameterData = async () => {
    try {
      setIsLoading(true);
      let groundNode = null;
      for (const [key, value] of updatedNodes.entries()) {
        if (value === 0) {
          groundNode = key;
          break;
        }
      }
      // ✅ Stop simulation if no ground node found
    // if (!groundNode) {
    //   toast.error("Please set a ground node before running the simulation.");
    //   return; // ❌ Exit function early
    // }
      // Convert the components array into a JSON string
      const netstring = JSON.stringify({
        components: components,
        groundNode: updatedNodes.get(groundNode)  // Use node 1 as default ground if none specified
    }, null, 2);
      const body = { 
        netList: netstring, 
        numberNodes: updatedNodes.size,
        parameterType: parameterType,
        frequency: parseFloat(frequency) || 0,
        p1n1: p1n1 ? parseInt(p1n1) : null,
        p1n2: p1n2 ? parseInt(p1n2) :null,
        p2n1: p2n1 ? parseInt(p2n1) : null,
        p2n2: p2n2 ? parseInt(p2n2) : null,
        impedance:impedance ?? 50,
        electrical_length:electrical_length ?? 90,
        startingfrequency: parseFloat(startfrequency) || 0.1,
        endfrequency:parseFloat(endfrequency) || 1,
        frequency_prop:parseFloat(frequency_prop) || 1,
        frequency_prop_unit:frequency_prop_unit ?? "GHz",
        impedance_Zo:impedance_Zo ?? 50,
        frequency_num:parseInt(frequency_num) || 501
      };
      if(parameterType!=='s'){
        if(!p1n1 || !p2n1 || !p1n2 || !p2n2){
          toast.error("please select port nodes")
          setIsLoading(false);
          return;
        }
      }
      console.log('Sending parameter data:', body);
      console.log('Starting fetch request...');
      const response = await fetch('https://circuit-simulator.onrender.com/parameter', {
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
      setSimData(data);
      toast.success('Parameter Evaluated successfully!')
    } catch (error) {
      console.error('=== COMPLETE ERROR DETAILS ===');
      console.error('Error:', error);
      toast.error(`Simulation failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }
  // useEffect(() => {
  //   console.log('Context parametervalue (provider):', parametervalue);
  // }, [parametervalue]);
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
    const apiUrl = `https://circuit-simulator.onrender.com/get-images/${analysisType}`;
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
          toast.error('Failed to load simulation images. Please check the console for details.');
          // alert('Failed to load simulation images. Please check the console for details.');
          return;
        }
        if (!data || data.length === 0) {
          toast.error('No simulation results available. Please run the simulation first.');
          // alert('No simulation results available. Please run the simulation first.');
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
          popup.document.write(`<img src="https://circuit-simulator.onrender.com/${item.url}" alt="${item.description}" style="width:100%; max-width:800px;">`);
        });
        popup.document.write('</body></html>');
        popup.document.close();
      })
      .catch(error => {
        console.error('Error fetching images:', error);
        toast.error('Error fetching simulation images. Please check the console for details.')
      });
  }
  const viewSParameterPlots = () => {
    if (parameterType !== 's') {
      toast.error('Switch to S-parameter to view S plots.');
      return;
    }
    const apiUrl = `https://circuit-simulator.onrender.com/get-images/s`;
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (!data || data.length === 0) {
          toast.error('No S-parameter plots available. Evaluate parameters first.');
          return;
        }
        const popup = window.open('', '_blank', 'width=900,height=700');
        popup.document.write('<html><head><title>S-Parameter Plots</title></head><body>');
        popup.document.write('<h2>S-Parameter Plots</h2>');
        data.forEach(item => {
          popup.document.write(`<h4>${item.description}</h4>`);
          popup.document.write(`<img src="https://circuit-simulator.onrender.com/${item.url}" alt="${item.description}" style="width:100%; max-width:860px;">`);
        });
        popup.document.write('</body></html>');
        popup.document.close();
      })
      .catch(error => {
        console.error('Error fetching S images:', error);
        toast.error('Error fetching S-parameter plots.');
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
        viewSParameterPlots,
        analysisType,
        setAnalysisType, // Allowing components to update the analysis type
        parameterType,
        setparameterType,
        parametervalue,
        setparametervalue,
        frequency,
        setFrequency,
        startfrequency,
        setstartfrequency,
        endfrequency,
        setendfrequency,
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
        impedance,
        impedance_Zo,
        setimpedance_Zo,
        electrical_length,
        setelectrical_length,
        frequency_prop,
        setfrequency_prop,
        frequency_prop_unit,
        setfrequency_prop_unit,
        frequency_num,
        setfrequency_num,
        temp,
        isLoading,
      }}>
      {isLoading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(152, 152, 179, 0.9)',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <Loader/>
        </div>
      )}
      {children}
    </MyContext.Provider>
  );
};
export const useMyContext = ()=>{
    return useContext(MyContext);
}
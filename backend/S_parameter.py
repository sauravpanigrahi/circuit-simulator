import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.pyplot import figure, subplots, savefig
import skrf as rf
from skrf import Network
from collections import Counter
import logging
import os
# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)



def _static_dir(path_segment: str = ""):
    """Return absolute path inside backend/static, creating the folder if needed."""
    base_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
    os.makedirs(base_dir, exist_ok=True)
    return os.path.join(base_dir, path_segment) if path_segment else base_dir

UNIT_SCALE = {'f': 1e-15, 'p': 1e-12, 'n': 1e-9, 'u': 1e-6, 'm': 1e-3, 'k': 1e3, 'M': 1e6, 'G': 1e9, 'T': 1e12}


def parse_value(v, unit):
    if unit is None: return float(v)
    for k, s in UNIT_SCALE.items():
        if unit.startswith(k):
            return float(v) * s
    return float(v)

def theta_in_rad(theta):
    return float(theta)*np.pi/180

def Transmission_Line(Zc,theta,f0,f,Z0,name):
    #theta in radian
    abcd=np.zeros([len(f),2,2],dtype=complex)
    Yc=1/Zc
    theta=theta*f.f/f0
    abcd[:,0,0]=np.cos(theta)
    abcd[:,1,1]=np.cos(theta)
    abcd[:,1,0]=1j*Yc*np.sin(theta)
    abcd[:, 0, 1] = 1j*Zc * np.sin(theta)
    s=rf.network.a2s(abcd,Z0)
    TL=rf.Network(s=s,frequency=f,name=name)
    return TL



def Open_Stub(Zc,theta,f0,f,Z0,name):
    #theta in radian
    TL = Transmission_Line(Zc,theta,f0,f,Z0,name)
    Zopen=TL.z[:,0,0]
    Openstub = rf.Network(z=Zopen, frequency=f, name=name)
    return Openstub

def Short_Stub(Zc,theta,f0,f,Z0,name):
    #theta in radian
    TL = Transmission_Line(Zc,theta,f0,f,Z0,name)
    Yshort=TL.y[:,0,0]
    Shortstub =  rf.Network(y=Yshort, frequency=f, name=name)
    return Shortstub

class run_s_parameter:
    """A corrected tool to analyze circuits from netlist files and return S-parameters"""
    
    def __init__(self):
        """Initialize the analyzer"""
        self.circuit_components = {}
        self.component_networks = {}
        self.implicit_ground_nodes = set()
        self.z0_system = 50.0  # System reference impedance
    
    def convert_value_to_number(self, value_text):
        """Convert component values like '1k', '10n', '5.6m' to actual numbers"""
        value_text = value_text.lower().replace(' ', '')
        
        if 'e' in value_text:
            return float(value_text)
        
        units = {
            'k': 1000,
            'm': 0.001,
            'u': 0.000001,
            'n': 0.000000001,
            'p': 0.000000000001,
            'f': 0.000000000000001
        }
        
        number_part = ''
        unit_part = ''
        
        for char in value_text:
            if char.isdigit() or char == '.' or char == '-':
                number_part += char
            else:
                unit_part += char
                break
        
        base_value = float(number_part)
        
        for unit_name, multiplier in units.items():
            if unit_part.startswith(unit_name):
                return base_value * multiplier
        
        return base_value
    
    def create_resistor_network(self, resistance_value, frequency_range):
        """Create a resistor network for RF analysis"""
        # Use standard lossless media with system impedance
        media = rf.media.DefinedGammaZ0(frequency=frequency_range, z0_port=self.z0_system, gamma=1j)
        resistor_network = media.resistor(resistance_value)
        return resistor_network
    
    def create_capacitor_network(self, capacitance_value, frequency_range):
        """Create a capacitor network for RF analysis"""
        media = rf.media.DefinedGammaZ0(frequency=frequency_range, z0=self.z0_system, gamma=1j)
        capacitor_network = media.capacitor(capacitance_value)
        return capacitor_network
    
    def create_inductor_network(self, inductance_value, frequency_range):
        """Create an inductor network for RF analysis"""
        media = rf.media.DefinedGammaZ0(frequency=frequency_range, z0=self.z0_system, gamma=1j)
        inductor_network = media.inductor(inductance_value)
        return inductor_network
    
    def create_transmission_line_network(self, electrical_length_deg_ref, impedance, frequency_range, f_ref=1.0):
        """
        Create a frequency-dependent transmission line network.
        electrical_length_deg_ref: Electrical length at reference frequency (degrees)
        impedance: characteristic impedance (Ohms)
        frequency_range: skrf Frequency object
        f_ref: reference frequency in GHz for given electrical length
        """
        # Convert GHz to Hz for calculation
        f_ref_hz = f_ref * 1e9
        theta_deg = electrical_length_deg_ref * (frequency_range.f / f_ref_hz)
        # Build network at each frequency
        media = rf.media.DefinedGammaZ0(frequency=frequency_range, z0=self.z0_system, gamma=1j)
        # Use skrf's 'line' for the full frequency array
        transmission_line = media.line(electrical_length_deg_ref, unit='deg')
        # Override theta per frequency
        transmission_line.s = np.array([
            media.line(theta, unit='deg').s[0, :, :] for theta in theta_deg
        ])
        logger.info(f"Created transmission line (freq-dependent): {electrical_length_deg_ref}° @ {f_ref}GHz, {impedance}Ω")
        return transmission_line


    def create_short_stub_network(self, electrical_length_deg_ref, impedance, frequency_range, f_ref=1.0):

        """
        Create a frequency-dependent short stub network as 2-port shunt.
        """
        f_ref_hz = f_ref * 1e9
        theta_deg = electrical_length_deg_ref * (frequency_range.f / f_ref_hz)
        
        media = rf.media.DefinedGammaZ0(frequency=frequency_range, z0=self.z0_system, gamma=1j)
        # Build 1-port shorted stub
        short_termination = media.short()
        stub_line = media.line(electrical_length_deg_ref, unit='deg')
        short_stub_1port = stub_line ** short_termination
        
        # Override per-frequency theta
        s_array = np.array([
            (media.line(theta, unit='deg') ** media.short()).s[0,:,:] for theta in theta_deg
        ])
        short_stub_1port.s = s_array
        
        # Convert 1-port to 2-port shunt
        short_stub_2port = self.convert_1port_to_2port_shunt(short_stub_1port, frequency_range, impedance)
        logger.info(f"Created short stub (freq-dependent) {electrical_length_deg_ref}° @ {f_ref}GHz, {impedance}Ω")
        return short_stub_2port


    def create_open_stub_network(self, electrical_length_deg_ref, impedance, frequency_range, f_ref=1.0):
        """
        Create a frequency-dependent open stub network as 2-port shunt.
        """
        f_ref_hz = f_ref * 1e9
        theta_deg = electrical_length_deg_ref * (frequency_range.f / f_ref_hz)
        
        media = rf.media.DefinedGammaZ0(frequency=frequency_range, z0=self.z0_system, gamma=1j)
        open_termination = media.open()
        stub_line = media.line(electrical_length_deg_ref, unit='deg')
        open_stub_1port = stub_line ** open_termination
        
        # Override per-frequency theta
        s_array = np.array([
            (media.line(theta, unit='deg') ** media.open()).s[0,:,:] for theta in theta_deg
        ])
        open_stub_1port.s = s_array
        
        open_stub_2port = self.convert_1port_to_2port_shunt(open_stub_1port, frequency_range, impedance)
        logger.info(f"Created open stub (freq-dependent) {electrical_length_deg_ref}° @ {f_ref}GHz, {impedance}Ω")
        return open_stub_2port

    
    def convert_1port_to_2port_shunt(self, one_port_network, frequency_range, original_z0):
        """Convert a 1-port network to a 2-port shunt network using ABCD parameters"""
        # CORRECTED: Handle impedance renormalization properly
        # Renormalize the 1-port to system impedance if needed
        if original_z0 != self.z0_system:
            # Renormalize 1-port network to system impedance
            one_port_renorm = one_port_network.copy()
            one_port_renorm.z0 = self.z0_system
            Z_shunt = one_port_renorm.z[:, 0, 0]
        else:
            Z_shunt = one_port_network.z[:, 0, 0]
        
        Y_shunt = 1.0 / Z_shunt
        nfreqs = len(frequency_range.f)
        
        # ABCD matrix for shunt element: [[1, 0], [Y, 1]]
        abcd_shunt = np.zeros((nfreqs, 2, 2), dtype=complex)
        abcd_shunt[:, 0, 0] = 1.0  # A
        abcd_shunt[:, 0, 1] = 0.0  # B
        abcd_shunt[:, 1, 0] = Y_shunt  # C
        abcd_shunt[:, 1, 1] = 1.0  # D
        
        # Create 2-port network with consistent system impedance
        z0_array = rf.fix_z0_shape(self.z0_system, nfreqs, 2)
        two_port_network = rf.Network(frequency=frequency_range, a=abcd_shunt, z0=z0_array)
        return two_port_network
    
    def detect_implicit_ground_nodes(self):
        """Detect nodes that appear only once (dangling nodes) - these are implicit grounds"""
        node_counter = Counter()
        for component in self.circuit_components.values():
            nodes = component['nodes']
            node_counter[nodes[0]] += 1
            node_counter[nodes[1]] += 1
        self.implicit_ground_nodes = {node for node, count in node_counter.items() 
                                      if count == 1 and node != '0'}
        if self.implicit_ground_nodes:
            logger.info(f"Detected implicit ground nodes (dangling): {self.implicit_ground_nodes}")
        return self.implicit_ground_nodes
    
    def is_ground_node(self, node):
        """Check if a node is ground (explicit '0' or implicit dangling node)"""
        return node == '0' or node in self.implicit_ground_nodes
    
    def read_and_parse_netlist(self, filename):
        """Read a netlist file and extract component information"""
        try:
            with open(filename, 'r') as file:
                netlist_lines = file.readlines()
            logger.info(f"Successfully read netlist from {filename}")
        except FileNotFoundError:
            logger.error(f"Could not find file: {filename}")
            return None
        
        components = {}
        
        for line_number, line in enumerate(netlist_lines, 1):
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            
            parts = line.split()
            if len(parts) < 4:
                logger.warning(f"Line {line_number}: Not enough information - {line}")
                continue
            
            component_name = parts[0]
            node1 = parts[1]
            node2 = parts[2]
            component_type = component_name[0].upper()
            try:
                if component_type == 'R':
                    resistance = self.convert_value_to_number(parts[3])
                    components[component_name] = {
                        'type': 'resistor',
                        'nodes': (node1, node2),
                        'value': resistance,
                        'unit': 'Ω'
                    }
                    logger.info(f"Found resistor {component_name}: {resistance} Ω")
                
                elif component_type == 'C':
                    capacitance = self.convert_value_to_number(parts[3])
                    components[component_name] = {
                        'type': 'capacitor',
                        'nodes': (node1, node2),
                        'value': capacitance,
                        'unit': 'F'
                    }
                    logger.info(f"Found capacitor {component_name}: {capacitance} F")
                
                elif component_type == 'L':
                    inductance = self.convert_value_to_number(parts[3])
                    components[component_name] = {
                        'type': 'inductor',
                        'nodes': (node1, node2),
                        'value': inductance,
                        'unit': 'H'
                    }
                    logger.info(f"Found inductor {component_name}: {inductance} H")
                
                elif component_name.startswith('TL'):
                    electrical_length = self.convert_value_to_number(parts[3])
                    impedance = self.convert_value_to_number(parts[4]) if len(parts) > 4 else 50.0
                    components[component_name] = {
                        'type': 'transmission_line',
                        'nodes': (node1, node2),
                        'electrical_length': electrical_length,
                        'impedance': impedance,
                        'unit': '°'
                    }
                    logger.info(f"Found transmission line {component_name}: {electrical_length}°, {impedance}Ω")
                
                elif component_name.startswith('OS'):
                    electrical_length = self.convert_value_to_number(parts[3])
                    impedance = self.convert_value_to_number(parts[4]) if len(parts) > 4 else 50.0
                    components[component_name] = {
                        'type': 'open_stub',
                        'nodes': (node1, node2),
                        'electrical_length': electrical_length,
                        'impedance': impedance,
                        'unit': '°'
                    }
                    logger.info(f"Found open stub {component_name}: {electrical_length}°, {impedance}Ω")
                
                elif component_name.startswith('SS'):
                    electrical_length = self.convert_value_to_number(parts[3])
                    impedance = self.convert_value_to_number(parts[4]) if len(parts) > 4 else 50.0
                    components[component_name] = {
                        'type': 'short_stub',
                        'nodes': (node1, node2),
                        'electrical_length': electrical_length,
                        'impedance': impedance,
                        'unit': '°'
                    }
                    logger.info(f"Found short stub {component_name}: {electrical_length}°, {impedance}Ω")
                
            except ValueError as error:
                logger.error(f"Error parsing {component_name} on line {line_number}: {error}")
                continue
        
        self.circuit_components = components
        self.detect_implicit_ground_nodes()
        return components
    
    def create_networks_for_all_components(self, frequency_range):
        """Create RF networks for all components in the circuit"""
        networks = {}
        
        for name, component in self.circuit_components.items():
            component_type = component['type']
            
            try:
                if component_type == 'resistor':
                    network = self.create_resistor_network(component['value'], frequency_range)
                    networks[name] = network
                elif component_type == 'capacitor':
                    network = self.create_capacitor_network(component['value'], frequency_range)
                    networks[name] = network
                elif component_type == 'inductor':
                    network = self.create_inductor_network(component['value'], frequency_range)
                    networks[name] = network
                elif component_type == 'transmission_line':
                    network = self.create_transmission_line_network(
                        component['electrical_length'],
                        component['impedance'],
                        frequency_range
                    )
                    networks[name] = network
                elif component_type == 'open_stub':
                    network = self.create_open_stub_network(
                        component['electrical_length'],
                        component['impedance'],
                        frequency_range
                    )
                    networks[name] = network
                elif component_type == 'short_stub':
                    network = self.create_short_stub_network(
                        component['electrical_length'],
                        component['impedance'],
                        frequency_range
                    )
                    networks[name] = network
                
                logger.info(f"Created network for {name}")
                
            except Exception as error:
                logger.error(f"Failed to create network for {name}: {error}")
        
        self.component_networks = networks
        return networks
    
    def build_circuit_topology(self, networks):
        """CORRECTED: Build proper circuit topology with series and shunt placement"""
        # Separate series and shunt components
        series_components = []
        shunt_components = []
        
        for name, component in self.circuit_components.items():
            if name not in networks:
                continue
                
            nodes = component['nodes']
            if self.is_ground_node(nodes[1]) or self.is_ground_node(nodes[0]):
                # Find the non-ground node for shunt placement
                shunt_node = nodes[0] if not self.is_ground_node(nodes[0]) else nodes[1]
                shunt_components.append({
                    'name': name,
                    'network': networks[name],
                    'node': shunt_node,
                    'component': component
                })
                logger.info(f"{name} identified as SHUNT at node {shunt_node}")
            else:
                series_components.append({
                    'name': name,
                    'network': networks[name],
                    'nodes': nodes,
                    'component': component
                })
                logger.info(f"{name} identified as SERIES from {nodes[0]} to {nodes[1]}")
        
        # Sort series components by node order for proper cascade
        series_components.sort(key=lambda x: (
            int(x['nodes'][0]) if x['nodes'][0].isdigit() else float('inf'),
            int(x['nodes'][1]) if x['nodes'][1].isdigit() else float('inf')
        ))
        
        # Sort shunt components by node for proper insertion
        shunt_components.sort(key=lambda x: int(x['node']) if x['node'].isdigit() else float('inf'))
        
        return series_components, shunt_components
    
    def cascade_networks_properly(self, series_components, shunt_components, frequency_range):
        """CORRECTED: Properly cascade series elements and insert shunts at correct locations"""
        nfreqs = frequency_range.npoints
        abcd_total = np.tile(np.eye(2), (nfreqs, 1, 1))
        
        logger.info("Building circuit cascade with proper topology:")
        
        # Create a map of where shunts should be inserted
        shunt_map = {}
        for shunt in shunt_components:
            node = shunt['node']
            if node not in shunt_map:
                shunt_map[node] = []
            shunt_map[node].append(shunt)
        
        # Process series elements in order, inserting shunts at appropriate nodes
        processed_nodes = set(['0'])  # Start with ground as processed
        
        for i, series_elem in enumerate(series_components):
            nodes = series_elem['nodes']
            name = series_elem['name']
            
            # Check if there are shunts to insert before this series element
            for node in nodes:
                if node in shunt_map and node not in processed_nodes:
                    # Insert all shunts at this node
                    for shunt in shunt_map[node]:
                        logger.info(f"  Inserting SHUNT {shunt['name']} at node {node}")
                        abcd_total = np.matmul(abcd_total, shunt['network'].a)
                    processed_nodes.add(node)
            
            # Add the series element
            logger.info(f"  Adding SERIES {name} from {nodes[0]} to {nodes[1]}")
            abcd_total = np.matmul(abcd_total, series_elem['network'].a)
            processed_nodes.update(nodes)
        
        # Add any remaining shunts
        for node, shunts in shunt_map.items():
            if node not in processed_nodes:
                for shunt in shunts:
                    logger.info(f"  Adding remaining SHUNT {shunt['name']} at node {node}")
                    abcd_total = np.matmul(abcd_total, shunt['network'].a)
        
        logger.info(" Cascade complete!")
        return abcd_total
    
    def calculate_circuit_s_parameters(self, frequency_range, p1n1, p1n2, p2n1, p2n2):
        """Calculate overall S-parameters for the circuit between specified ports"""
        try:
            networks = self.create_networks_for_all_components(frequency_range)
            
            if not networks:
                logger.error("No networks created from components")
                return None
            
            if len(networks) == 1:
                # Single component case
                single_network = list(networks.values())[0]
                # Ensure consistent z0
                if hasattr(single_network, 'z0') and np.any(single_network.z0 != self.z0_system):
                    single_network_renorm = single_network.copy()
                    single_network_renorm.z0 = self.z0_system
                    return single_network_renorm.s
                return single_network.s
            
            # CORRECTED: Use proper topology building
            series_components, shunt_components = self.build_circuit_topology(networks)
            
            # CORRECTED: Use proper cascading method
            nfreqs = frequency_range.npoints
            abcd_total = self.cascade_networks_properly(series_components, shunt_components, frequency_range)
            
            # Create final network with consistent impedance
            z0_array = rf.fix_z0_shape(self.z0_system, nfreqs, 2)
            result_network = rf.Network(frequency=frequency_range, a=abcd_total, z0=z0_array)
            s_parameters = result_network.s
            return s_parameters
            
        except Exception as error:
            logger.error(f"Error calculating S-parameters: {error}")
            import traceback
            traceback.print_exc()
            return None
    
    def validate_ports(self, p1n1, p1n2, p2n1, p2n2):
        """Validate that port nodes exist in the circuit"""
        all_nodes = set()
        for component in self.circuit_components.values():
            nodes = component['nodes']
            all_nodes.update(nodes)
        all_nodes.add('0')
        all_nodes.update(self.implicit_ground_nodes)
        port_nodes = [p1n1, p1n2, p2n1, p2n2]
        missing_nodes = [node for node in port_nodes if node not in all_nodes]
        if missing_nodes:
            logger.error(f"Port nodes not found in circuit: {missing_nodes}")
            logger.info(f"Available nodes: {sorted(all_nodes)}")
            return False
        return True
    
    def print_component_summary(self):
        """Print a nice summary of all components found"""
        print("\n=== Circuit Components Summary ===")
        for name, component in self.circuit_components.items():
            comp_type = component['type']
            nodes = component['nodes']
            node1_display = f"{nodes[0]}" + (" (GND)" if self.is_ground_node(nodes[0]) else "")
            node2_display = f"{nodes[1]}" + (" (GND)" if self.is_ground_node(nodes[1]) else "")
            
            if comp_type in ['transmission_line', 'open_stub', 'short_stub']:
                print(f"{name}: {comp_type}")
                print(f"  Nodes: {node1_display} to {node2_display}")
                print(f"  Electrical Length: {component['electrical_length']}°")
                print(f"  Impedance: {component['impedance']} Ω")
            else:
                value = component['value']
                unit = component['unit']
                print(f"{name}: {comp_type}")
                print(f"  Nodes: {node1_display} to {node2_display}")
                print(f"  Value: {value} {unit}")
            print()
    
    def __call__(self,netlist):
        """Main interface function to calculate S-parameters"""
        elements = {}
        nodes = {}
        node = []
        freq = None
        media = None
        
        # First pass: find frequency line and create freq/media objects
        for line in netlist.strip().splitlines():
            tokens = line.split()
            if tokens[0] == 'f':
                fmin = float(tokens[1])
                fmax = float(tokens[2])
                npoints = int(tokens[3])
                funits = tokens[4]
                freq = rf.Frequency(fmin, fmax, npoints, funits)
                media = rf.DefinedGammaZ0(freq, z0=50, gamma=1j * freq.w / rf.c)
                break
        
        # If no frequency line found, create default
        if freq is None:
            freq = rf.Frequency(0.1, 1.0, 101, 'GHz')
            media = rf.DefinedGammaZ0(freq, z0=50, gamma=1j * freq.w / rf.c)
        
        # Second pass: process all components
        for line in netlist.strip().splitlines():
            tokens = line.split()
            if tokens[0] == 'f':
                continue  # Skip frequency line in second pass
            else:
                if len(tokens) == 3:
                    # Handle ports and ground with 3 tokens
                    name, n1, n2 = tokens[:3]
                    if name.startswith('Port'):
                        value = 50.0  # Default port impedance
                    elif name.startswith('Ground'):
                        value = 1.0   # Default ground value
                    else:
                        # Skip lines that don't have enough information
                        continue
                elif len(tokens) == 4 or len(tokens) == 5:
                    name, n1, n2, val = tokens[:4]
                    unit = tokens[4] if len(tokens) > 4 else None
                    value = parse_value(val, unit)
                elif len(tokens) > 4:
                    name, n1, n2, Zc, theta, f0 = tokens[:6]
                    unit = tokens[6]
                    f0 = parse_value(f0, unit)
                    theta = theta_in_rad(theta)
                    Zc = float(Zc)
                else:
                    # Skip lines that don't have enough tokens
                    continue

                prefix = name[0].upper()
                if prefix == 'C':
                    net = media.capacitor(value, name=name)
                elif prefix == 'L':
                    net = media.inductor(value, name=name)
                elif prefix == 'R':
                    net = media.resistor(value, name=name)
                elif prefix == 'P':
                    net = rf.Circuit.Port(freq, name=name, z0=value)
                elif prefix == 'G':
                    net = rf.Circuit.Ground(freq, name='gnd')
                elif prefix == 'T':
                    net = Transmission_Line(Zc, theta, f0, freq, 50, name)
                elif prefix == 'O':
                    net = Open_Stub(Zc, theta, f0, freq, 50, name)
                elif prefix == 'S':
                    net = Short_Stub(Zc, theta, f0, freq, 50, name)
                elif prefix == '#':
                    continue
                else:
                    raise ValueError(f"Unsupported component {name}")
                if prefix not in ('P', 'G', 'O', 'S'):
                    elements[name] = {'net': net, 'nodes': (int(n1), int(n2))}
                else:
                    elements[name] = {'net': net, 'nodes': (int(n1),)}
                node.append(int(n1))
                node.append(int(n2))

        node = list(dict.fromkeys(node))
        logger.info(f"Unique nodes: {node}")
        logger.info(f"Elements: {list(elements.keys())}")
        
        # -----------------------------
        # Step 2: Create connection rows for each node
        # -----------------------------
        # Node rows = list of lists, each sublist contains all ports connected to that node
        connection = []
        for i in node:
            coni = []
            for j in elements:
                nodej = elements[j].get('nodes')
                if i in nodej:
                    if i == nodej[0]:
                        coni.append((elements[j].get('net'), 0))
                        logger.info(f"Node {i}: Connected {j} port 0")
                    elif i == nodej[1]:
                        if elements[j].get('net').name != 'gnd':
                            coni.append((elements[j].get('net'), 1))
            connection.append(coni)
            logger.info(f"Node {i} connections: {len(coni)} components")
        
        logger.info(f"Total connection matrix size: {len(connection)}")
        ckt = rf.Circuit(connection)
        ntw = ckt.network
        self.network = ntw
        logger.info(f"Network created with shape: {ntw.s.shape if hasattr(ntw, 's') else 'No S-parameters'}")
        
        # Return S-parameter array instead of Network object
        if hasattr(ntw, 's'):
            return ntw.s
        else:
            logger.error("Network object does not have S-parameters")
            return None
def plot_s_parameters(frequency_range, s_parameters, save_dir='static'):
    """
    Plot S-parameters (magnitude and phase) vs frequency
    
    Parameters:
    -----------
    frequency_range : rf.Frequency object
        Frequency range from scikit-rf
    s_parameters : numpy array
        S-parameter matrix with shape (nfreqs, nports, nports)
    save_dir : str
        Directory to save plots
    """
    import os
    os.makedirs(save_dir, exist_ok=True)
    
    # Debug: Check S-parameter shape
    logger.info(f"S-parameters shape: {s_parameters.shape}")
    logger.info(f"Frequency range: {frequency_range}")
    
    freq_ghz = frequency_range.f / 1e9  # Convert Hz to GHz
    
    # Check if we have a 2-port network
    if len(s_parameters.shape) != 3:
        logger.error(f"Expected 3D S-parameter array, got shape: {s_parameters.shape}")
        return None
    
    nfreqs, nports1, nports2 = s_parameters.shape
    logger.info(f"S-parameter dimensions: {nfreqs} frequencies, {nports1}x{nports2} ports")
    
    # Create figure with 2 subplots (magnitude and phase)
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 8))
    
    # Plot Magnitude in dB - handle different port configurations
    if nports1 >= 2 and nports2 >= 2:
        s11_db = 20 * np.log10(np.abs(s_parameters[:, 0, 0]))
        s21_db = 20 * np.log10(np.abs(s_parameters[:, 1, 0]))
        s12_db = 20 * np.log10(np.abs(s_parameters[:, 0, 1]))
        s22_db = 20 * np.log10(np.abs(s_parameters[:, 1, 1]))
    else:
        logger.error(f"Not enough ports for 2x2 S-parameter matrix. Got {nports1}x{nports2}")
        return None
    
    ax1.plot(freq_ghz, s11_db, 'b-', label='S11', linewidth=2)
    ax1.plot(freq_ghz, s21_db, 'r-', label='S21', linewidth=2)
    ax1.plot(freq_ghz, s12_db, 'g--', label='S12', linewidth=2)
    ax1.plot(freq_ghz, s22_db, 'm--', label='S22', linewidth=2)
    
    ax1.set_xlabel('Frequency (GHz)', fontsize=12)
    ax1.set_ylabel('Magnitude (dB)', fontsize=12)
    ax1.set_title('S-Parameters Magnitude vs Frequency', fontsize=14, fontweight='bold')
    ax1.grid(True, alpha=0.3)
    ax1.legend(loc='best', fontsize=10)
    
    # Plot Phase in degrees
    s11_phase = np.angle(s_parameters[:, 0, 0], deg=True)
    s21_phase = np.angle(s_parameters[:, 1, 0], deg=True)
    s12_phase = np.angle(s_parameters[:, 0, 1], deg=True)
    s22_phase = np.angle(s_parameters[:, 1, 1], deg=True)
    
    ax2.plot(freq_ghz, s11_phase, 'b-', label='S11', linewidth=2)
    ax2.plot(freq_ghz, s21_phase, 'r-', label='S21', linewidth=2)
    ax2.plot(freq_ghz, s12_phase, 'g--', label='S12', linewidth=2)
    ax2.plot(freq_ghz, s22_phase, 'm--', label='S22', linewidth=2)
    
    ax2.set_xlabel('Frequency (GHz)', fontsize=12)
    ax2.set_ylabel('Phase (degrees)', fontsize=12)
    ax2.set_title('S-Parameters Phase vs Frequency', fontsize=14, fontweight='bold')
    ax2.grid(True, alpha=0.3)
    ax2.legend(loc='best', fontsize=10)
    
    plt.tight_layout()
    
    # Save the plot
    save_path = os.path.join(save_dir, 's_parameters_combined.png')
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    logger.info(f"S-parameter plot saved to: {save_path}")
    plt.close()
    
    return save_path

# spar=run_s_parameter()
# netlist = """
# f 0.1 2 501 GHz
# C1 1 0 3.22 pF
# C2 1 2 82.25 fF
# L2 1 2 8.893 nH
# C3 2 0 3.22 pF
# Port1 1 0 50
# Port2 2 0 50
# Ground 0 1 1
# """
# # netlist="""
# # f 0.1 2 501 GHz
# # TL1 1 2 57.74 60 1 GHz
# # OS1 1 0 57.74 30 1 GHz
# # OS2 2 0 57.74 30 1 GHz
# # Port1 1 0 50
# # Port2 2 0 50
# # Ground 0 1 1
# # """
# # netlist="""
# # f 0.1 2 501 GHz
# # L 1 2 7.96 nH
# # C1 1 0 3.18 pF
# # C2 2 0 3.18 pF
# # Port1 1 0 50
# # Port2 2 0 50
# # Ground 0 1 1
# # """
# spar.__call__(netlist)
# s_parameter=spar.network.s
# freq=spar.network.frequency
# plot_s_parameters(freq, s_parameter)
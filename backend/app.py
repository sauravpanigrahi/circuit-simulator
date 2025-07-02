import traceback
from flask import Flask, request, jsonify, url_for, send_from_directory
import json  # Import the json module
import numpy as np  # For numerical operations
from flask_cors import CORS
from lcapy import Circuit, j, omega, s, t, sin
import sympy as sp  # For more control over symbolic expressions
import re
from transient_analysis import run_transient_analysis
from ac_analysis import run_ac_analysis
from dc_analysis import run_dc_analysis
import os
from dotenv import load_dotenv
import logging

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='static')

# Configure CORS properly
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"],
        "supports_credentials": True,
        "expose_headers": ["Content-Type", "Authorization"],
        "max_age": 3600
    }
})

# Set the default port to 8000 if not specified in the environment
port = int(os.environ.get('PORT', 8000))

# Create static directory if it doesn't exist
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
if not os.path.exists(static_dir):
    os.makedirs(static_dir)

# Use Flask's application context to store the image file name instead of a global variable
app.config['IMG_FILE_NAME'] = ""

def validate_component(component):
    """Validate component data structure and values"""
    required_fields = ['type', 'id', 'node', 'value']
    if not all(field in component for field in required_fields):
        return False
        
    # Validate value is a valid number
    try:
        float(component['value'])
        return True
    except (ValueError, TypeError):
        logger.error(f"Invalid value in component {component['id']}: {component['value']}")
        return False

def generate_netlist(circuit_data):
    """
    Generate a netlist using Lcapy from the circuit data
    
    Args:
        circuit_data (dict): Dictionary containing circuit components and their properties
        
    Returns:
        str: Netlist in SPICE format
    """
    try:
        # Create a new circuit
        circuit = Circuit()
        
        # Keep track of component counts for unique IDs
        component_counts = {}
        
        # Process each component
        for component in circuit_data:
            if not validate_component(component):
                logger.warning(f"Skipping invalid component: {component}")
                continue
                
            comp_type = component['type']
            nodes = component['node']
            value = component['value']
            
            # Convert node values to strings and handle '?' nodes
            node1 = str(nodes[0]) if nodes[0] != '?' else '0'
            node2 = str(nodes[1]) if nodes[1] != '?' else '0'
            node3 = str(nodes[2]) if len(nodes) > 2 and nodes[2] != '?' else '0'
            
            # Generate unique component ID
            base_id = str(component['id'])
            if base_id not in component_counts:
                component_counts[base_id] = 0
            component_counts[base_id] += 1
            unique_id = f"{component_counts[base_id]}" if component_counts[base_id] > 1 else 1
            
            # Handle different component types
            try:
                if comp_type == 'R' or comp_type == 'Resistor':
                    circuit.add(f'R{unique_id} {node1} {node2} {float(value)}')
                elif comp_type == 'C' or comp_type == 'Capacitor':
                    circuit.add(f'C{unique_id} {node1} {node2} {float(value)}')
                elif comp_type == 'L' or comp_type == 'Inductor':
                    circuit.add(f'L{unique_id} {node1} {node2} {float(value)}')
                elif comp_type == 'V' or comp_type == 'VoltageSource':
                    circuit.add(f'V{unique_id} {node1} {node2} {float(value)}')
                elif comp_type == 'ACSource':
                    # AC source is a voltage source with AC specification including frequency
                    frequency = float(component.get('frequency', 50))  # Default to 50Hz if not specified
                    circuit.add(f'V{unique_id} {node1} {node2} sin 0 {float(value)} {frequency} 0 0 0')
                elif comp_type == 'I' or comp_type == 'CurrentSource':
                    circuit.add(f'I{unique_id} {node1} {node2} {float(value)}')
                elif comp_type == 'D' or comp_type == 'Diode':
                    # Diode syntax in Lcapy only takes nodes, not value
                    circuit.add(f'D{unique_id} {node1} {node2}')
                elif comp_type == 'W' or comp_type == 'Wire':
                    # For wires, we just connect the nodes without adding a component
                    circuit.add(f'W{unique_id} {node1} {node2}')
                elif comp_type == 'NpnTransistor':
                    if len(nodes) != 3:
                        raise ValueError(f"NPN transistor requires 3 nodes, got {len(nodes)}")
                    circuit.add(f'Q{unique_id} {node1} {node2} {node3} QN')
                elif comp_type == 'PnpTransistor':
                    if len(nodes) != 3:
                        raise ValueError(f"PNP transistor requires 3 nodes, got {len(nodes)}")
                    circuit.add(f'Q{unique_id} {node1} {node2} {node3} QP')
                elif comp_type == 'NMosfet':
                    if len(nodes) != 3:
                        raise ValueError(f"NMOS requires 3 nodes, got {len(nodes)}")
                    circuit.add(f'M{unique_id} {node1} {node2} {node3} Value=NMOS')
                elif comp_type == 'PMosfet':
                    if len(nodes) != 3:
                        raise ValueError(f"PMOS requires 3 nodes, got {len(nodes)}")
                    circuit.add(f'M{unique_id} {node1} {node2} {node3} Value=PMOS')
                else:
                    logger.warning(f"Unsupported component type: {comp_type}")
                    continue
            except ValueError as e:
                logger.error(f"Error processing component {comp_type}{unique_id}: {e}")
                continue
        
        # Add ground node reference using Lcapy's syntax
        circuit.add('Vg 0 0 0')
        
        # Generate the netlist
        netlist = circuit.netlist()
        logger.info(f"Generated netlist: {netlist}")
        
        return netlist
    except Exception as e:
        logger.error(f"Error generating netlist: {str(e)}")
        raise

@app.route('/', methods=['GET', 'POST', 'OPTIONS'])
def simulate():
    if request.method == 'OPTIONS':
        return '', 200
        
    if request.method == 'GET':
        return "Circuit Simulator API is running. Please POST your JSON netlist to this endpoint."
    
    try:
        ckt_data = request.get_json(force=True)
        logger.info("Received JSON data: %s", ckt_data) 

        if not ckt_data:
            raise ValueError("No JSON data received")

        if 'components' not in ckt_data:
            raise ValueError("Missing 'components' in JSON")

        circuit_data = ckt_data['components']
        if not circuit_data:
            raise ValueError("No circuit components provided")
    
        netlist = generate_netlist(circuit_data)
        return jsonify({"netlist": str(netlist)})

    except Exception as e:
        import traceback
        logger.error("Simulation error: %s\n%s", str(e), traceback.format_exc())
        return jsonify({"error": f"Error during simulation: {str(e)}"}), 500

@app.route('/simulation', methods=['GET', 'POST', 'OPTIONS'])
def simulation():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        if not request.is_json:
            logger.warning("Request is not JSON")
            return jsonify({"error": "Request must be JSON"}), 415
            
        ckt_data = request.get_json()
        if not ckt_data:
            logger.warning("No JSON data received")
            return jsonify({"error": "No JSON data received"}), 400
            
        netlist_str = ckt_data.get("netList", "")
        if not netlist_str:
            logger.warning("Netlist is empty")
            return jsonify({"error": "Netlist is empty"}), 400

        try:
            netlist = json.loads(netlist_str)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in netlist: {str(e)}")
            return jsonify({"error": f"Invalid JSON in netlist: {str(e)}"}), 400

        components = netlist.get("components", [])
        if not components:
            logger.warning("Components are empty")
            return jsonify({"error": "Components are empty"}), 400

        cctt = ""
        numberOfNodes = ckt_data.get("numberNodes", 0)
        analysisType = ckt_data.get("analysisType", "dc").lower()
        groundNode = netlist.get("groundNode")

        try:
            frequency = float(ckt_data.get("frequency", 0))
        except (ValueError, TypeError):
            frequency = 0
            logger.warning("Invalid frequency value, defaulting to 0")

        # Process components
        # Replace the problematic section in your /simulation route with this:

# Process components
        for comp in components:
            type_prefix = comp.get('type', '')
            id_ = comp.get('id', '')
            node1 = comp.get('node1', '')
            node2 = comp.get('node2', '')
            
            # Initialize dependent nodes with empty strings
            depnode3 = ''
            depnode4 = ''
            depVoltage=''
            phase=''
            # Handle value extraction properly
            raw_value = comp.get('value', '')
            
            # Debug log to see what we're receiving
            logger.info(f"Processing component {id_}: type={type_prefix}, raw_value={raw_value}")
            
            if isinstance(raw_value, dict):
                # This is a dependent source with nested structure
                value = raw_value.get('value', '')
                depnode3 = raw_value.get('dependentNode1', '')
                depnode4 = raw_value.get('dependentNode2', '')
                depVoltage=raw_value.get('Vcontrol','')
                phase=raw_value.get('phase','')
                logger.info(f"Extracted from dict - value: {value}, depnode3: {depnode3}, depnode4: {depnode4}")
            else:
                # This is a regular component
                value = raw_value
                # Try to get dependent nodes from component level (fallback)
                depnode3 = comp.get('dependentnode1', '')
                depnode4 = comp.get('dependentnode2', '')
                depVoltage=comp.get('Vcontrol','')
                phase=comp.get('phase','')
            # Ensure value is a string/number, not an object
            if isinstance(value, dict):
                logger.error(f"Value is still a dict for component {id_}: {value}")
                value = str(value)  # Fallback to string representation
            
            # Generate the netlist line based on component type
            if type_prefix in ['AC Source', 'DC Source', 'Inductor', 'Resistor', 'Wire', 'Capacitor', 'Diode', 'Npn Transistor', 'Pnp Transistor', 'P Mosfet', 'N Mosfet', 'VCVS', 'VCCS','CCVS','CCCS','Current Source' ,'Generic']:
                if type_prefix == 'DC Source':
                    line = f"{id_} {node2} {node1} {value}\n"
                elif type_prefix == 'AC Source':
                    line = f"{id_} {node1} {node2} AC {value} {phase}\n"    
                elif type_prefix == 'VCVS':
                    # VCVS format: E<n> <+node> <-node> <+control> <-control> <Voltage gain>
                    line = f"{id_} {node1} {node2} {depnode3} {depnode4} {value}\n"
                    logger.info(f"Generated VCVS line: {line.strip()}")
                elif type_prefix == 'VCCS':
                    # VCCS format: G<n> <+node> <-node> <+control> <-control> <transadmitance>
                    line = f"{id_} {node1} {node2} {depnode3} {depnode4} {value}\n"
                    logger.info(f"Generated VCCS line: {line.strip()}")
                elif type_prefix == 'CCVS':
                    # VCVS format: E<n> <+node> <-node> <+control> <-control> <transimpedance>
                    line = f"{id_} {node1} {node2} {depVoltage} {value}\n"
                    logger.info(f"Generated CCVS line: {line.strip()}")
                elif type_prefix == 'CCCS':
                    # VCCS format: G<n> <+node> <-node> <+control> <Current gain>
                    line = f"{id_} {node1} {node2} {depVoltage} {value}\n"
                    logger.info(f"Generated CCCS line: {line.strip()}")
                else:
                    line = f"{id_} {node1} {node2} {value}\n"
                
                cctt += line
                logger.info(f"Added to netlist: {line.strip()}")

        # cctt += f"Vg {groundNode} 0 0\n"

        # Write netlist to file
        netlist_filename = 'netlist.txt'
        try:
            with open(netlist_filename, 'w') as file:
                file.write(cctt)
            logger.info("Netlist written to file successfully")
        except Exception as e:
            logger.error(f"Error writing netlist to file: {str(e)}")
            return jsonify({"error": f"Error writing netlist to file: {str(e)}"}), 500

        # Define image files for each analysis type
        image_files = {
            'ac': [
                ("ac_analysis_voltage_phasor.png", "Voltage Phasor"),
                ("ac_analysis_current_phasor.png", "Current Phasor")
            ],
            'transient': [
                ("transient_analysis-voltage.png", "Transient Voltage"),
                ("transient_analysis-current.png", "Transient Current")
            ]
        }.get(analysisType, [])

        try:
            # Run the appropriate analysis
            if analysisType == "dc":
                logger.info("Starting DC analysis")
                node_voltages, current = run_dc_analysis()
                app.config['IMAGES'] = []
            elif analysisType == "ac":
                logger.info("Starting AC analysis")
                node_voltages, current = run_ac_analysis()
                app.config['IMAGES'] = image_files
            elif analysisType == "transient":
                logger.info("Starting Transient analysis")
                run_transient_analysis()
                node_voltages = {}
                current = {}
                app.config['IMAGES'] = image_files
            else:
                logger.error(f"Unsupported analysis type: {analysisType}")
                raise ValueError(f"Unsupported analysis type: {analysisType}")

            logger.info("Analysis completed successfully")
            return jsonify({
                "voltages": node_voltages,
                "current": current,
                "analysis_type": analysisType,
                "status": "success"
            })

        except Exception as e:
            logger.error(f"Error during {analysisType} analysis: {str(e)}")
            logger.error(traceback.format_exc())
            return jsonify({
                "error": f"Error during {analysisType} analysis: {str(e)}",
                "traceback": traceback.format_exc(),
                "status": "error"
            }), 500

    except Exception as e:
        logger.error(f"Error during simulation: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": str(e),
            "traceback": traceback.format_exc(),
            "status": "error"
        }), 500

@app.route('/get-images/<analysis_type>')
def get_images(analysis_type):
    try:
        if not os.path.exists('static'):
            os.makedirs('static')
            logger.info("Created static directory")

        image_files = {
            'ac': [
                ("ac_analysis_voltage_phasor.png", "Voltage Phasor"),
                ("ac_analysis_current_phasor.png", "Current Phasor")
            ],
            'transient': [
                ("transient_analysis-voltage.png", "Transient Voltage"),
                ("transient_analysis-current.png", "Transient Current")
            ]
        }.get(analysis_type, [])

        if not image_files:
            logger.warning(f"No image configuration found for analysis type: {analysis_type}")
            return jsonify({"error": f"No images found for analysis type: {analysis_type}"}), 404

        # Check if files exist
        existing_files = []
        for filename, description in image_files:
            file_path = os.path.join('static', filename)
            if os.path.exists(file_path):
                existing_files.append({
                    "url": f"static/{filename}",
                    "description": description
                })
                logger.info(f"Found image file: {filename}")
            else:
                logger.warning(f"Image file not found: {filename}")

        if not existing_files:
            logger.warning("No image files found in static directory")
            return jsonify({"error": "No image files found. Please run the simulation first."}), 404

        return jsonify(existing_files)

    except Exception as e:
        logger.error(f"Error getting images: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    logger.info(f"Starting server on port {port}")
    app.run(host="0.0.0.0", port=port, debug=True)


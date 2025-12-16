import traceback
from flask import Flask, request, jsonify,send_from_directory
from databse.db import connect_to_mongo, blogs_collection  
from auth.routes import auth_bp
import json  # Import the json module
import numpy as np  # For numerical operations
from flask_cors import CORS
from fastapi import  HTTPException
from pydantic import BaseModel
import logging
from lcapy import Circuit, j, omega, s, t, sin
import sympy as sp  # For more control over symbolic expressions
import re
from transient_analysis import run_transient_analysis
from ac_analysis import run_ac_analysis
from dc_analysis import run_dc_analysis
from Z_parameter import run_z_parameter
from Y_parameter import run_y_parameter
from S_parameter import run_s_parameter
import os
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager

# Load environment variables from .env file
load_dotenv()
# Only load .env if not in production
if os.getenv("NODE_ENV") != "production":
    from dotenv import load_dotenv
    load_dotenv()
# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
app = Flask(__name__, static_folder='static')

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
JWTManager(app)
# Configure CORS properly
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:3000",               # dev
            "https://circuit-simulator-51410.web.app",
                  # production
        ],
        "methods": ["GET", "POST", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"],
        "supports_credentials": True,
        "expose_headers": ["Content-Type", "Authorization"],
        "max_age": 3600
    }
})
# MongoDB connection is handled in databse/db.py module level
# If connection fails, db and blogs_collection will be None

app.register_blueprint(auth_bp, url_prefix='/auth')
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
    
    comp_type = component['type']
    value = component['value']
    
    # Handle AC sources with dictionary values (magnitude and phase)
    if comp_type in ['AC', 'AC Source']:
        if isinstance(value, dict):
            # Check if both 'value' and 'phase' are present and valid
            if 'value' in value and 'phase' in value:
                try:
                    float(value['value'])  # Validate magnitude
                    float(value['phase'])  # Validate phase
                    return True
                except (ValueError, TypeError):
                    logger.error(f"Invalid AC source value/phase in component {component['id']}: {value}")
                    return False
            else:
                logger.error(f"Missing 'value' or 'phase' in AC component {component['id']}: {value}")
                return False
        else:
            logger.error(f"AC source value must be a dictionary in component {component['id']}: {value}")
            return False
    
    # Handle other component types with simple numeric values
    else:
        try:
            float(value)
            return True
        except (ValueError, TypeError):
            logger.error(f"Invalid value in component {component['id']}: {value}")
            return False

class EmptyRequest(BaseModel):
    pass

@app.post("/generate-netlist")
def generate_netlist():
    try:
        netlist_path = "netlist.txt"
        if not os.path.exists(netlist_path):
            raise HTTPException(status_code=404, detail="netlist.txt not found")
        with open(netlist_path, "r") as f:
            file_content = f.read()
        # circuit = Circuit()
        # circuit.add(file_content)
        netlist = file_content
        logger.info(f"Generated netlist: {netlist}")

        return {"netlist": netlist}

    except HTTPException:
        # Allow HTTP errors to propagate as they are
        raise
    except Exception as e:
        # Log unexpected errors and return a 500 response
        logger.exception("Unexpected error generating netlist")
        raise HTTPException(status_code=500, detail=str(e))

@app.route('/', methods=['GET', 'POST', 'OPTIONS', 'HEAD'])
def simulate():
    if request.method in ['GET', 'HEAD']:          # <‑‑ handle both
        return (
            "Circuit Simulator API is running. "
            "POST your JSON netlist to this endpoint."
        )
    if request.method == 'OPTIONS':
        return '', 200
        
    if request.method == 'GET':
        return "Circuit Simulator API is running. Please POST your JSON netlist to this endpoint."
    
    try:
        ckt_data = request.get_json(force=True)
        if ckt_data is None:
            return jsonify({"error": "Invalid or missing JSON"}), 400
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

@app.route('/simulation', methods=['GET', 'POST', 'OPTIONS','HEAD'])
def simulation():
    if request.method in ['GET', 'HEAD']:          # <‑‑ handle both
        return (
            "Circuit Simulator API is running. "
            "POST your JSON netlist to this simulation  endpoint."
        )
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
        
            frequency = float(ckt_data.get("frequency", 50))  # default to 50 if missing
        except (ValueError, TypeError):
            frequency = 50
            logger.warning("Invalid frequency value, defaulting to 50")


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
                phase=comp.get('phase',0)
                
            # Ensure value is a string/number, not an object
            if isinstance(value, dict):
                logger.error(f"Value is still a dict for component {id_}: {value}")
                value = str(value)  # Fallback to string representation
            
            # Generate the netlist line based on component type
            if type_prefix in ['AC Source', 'DC Source', 'Inductor', 'Resistor', 'Wire', 'Capacitor', 'Diode', 'Npn Transistor', 'Pnp Transistor', 'P Mosfet', 'N Mosfet', 'VCVS', 'VCCS','CCVS','CCCS','Current Source','Generic']:
                if type_prefix == 'DC Source':
                    line = f"{id_} {node2} {node1} {value}\n"
                elif type_prefix == 'AC Source':
                    if phase is None:
                        phase = 0
                    try:
                        phase = float(phase)
                    except (ValueError, TypeError):
                        logger.warning(f"Invalid phase for {id_}, defaulting to 0")
                        phase = 0
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

        # Write netlist to file
        netlist_filename = 'netlist.txt'
        try:
            with open(netlist_filename, 'w') as file:
                file.write(cctt)
            logger.info("Netlist written to file successfully")
        except Exception as e:
            logger.error(f"Error writing netlist to file: {str(e)}")
            return jsonify({"error": f"Error writing netlist to file: {str(e)}"}), 500

        try:
            # Run the appropriate analysis
            if analysisType == "dc":
                logger.info("Starting DC analysis")
                node_voltages, current = run_dc_analysis()
                app.config['IMAGES'] = []
            elif analysisType == "ac":
                logger.info("Starting AC analysis")
                # Pass frequency to AC analysis if needed
                logger.info(f"Frequency: {frequency}")
                node_voltages, current = run_ac_analysis(frequency)
                # Updated image list for AC analysis with time domain plots
                app.config['IMAGES'] = [
                    ("ac_analysis_voltage_phasor.png", "Voltage Phasor Diagram"),
                    ("ac_analysis_current_phasor.png", "Current Phasor Diagram"),
                    ("ac_analysis_voltage_time_domain.png", "Voltage Time Domain"),
                    ("ac_analysis_current_time_domain.png", "Current Time Domain"),
                    ("ac_analysis_combined_time_domain.png", "Combined Time Domain")
                ]
            elif analysisType == "transient":
                logger.info("Starting Transient analysis")
                run_transient_analysis()
                node_voltages = {}
                current = {}
                app.config['IMAGES'] = [
                    ("transient_analysis-voltage.png", "Transient Voltage"),
                    ("transient_analysis-current.png", "Transient Current")
                ]
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
        # Ensure top-level static exists
        if not os.path.exists('static'):
            os.makedirs('static')
            logger.info("Created static directory")

        # Candidate directories to search (top-level static first, then simulation/<analysis_type>/static)
        candidate_dirs = [
            ('static', lambda fn: f"static/{fn}"),
            (os.path.join('simulation', analysis_type, 'static'), lambda fn: f"simulation/{analysis_type}/static/{fn}")
        ]

        image_files = {
            'ac': [
                ("ac_analysis_voltage_phasor.png", "Voltage Phasor Diagram"),
                ("ac_analysis_current_phasor.png", "Current Phasor Diagram"),
                ("ac_analysis_voltage_time_domain.png", "Voltage Time Domain"),
                ("ac_analysis_current_time_domain.png", "Current Time Domain"),
            ],
            's': [
                ("s_parameters_individual.png", "S-Parameters (Individual Subplots)"),
                ("s_parameters_combined.png", "S-Parameters (Combined Plot)"),
                ("s_parameters_phase.png", "S-Parameters Phase")
            ],
            'transient': [
                ("transient_analysis-voltage.png", "Transient Voltage"),
                ("transient_analysis-current.png", "Transient Current")
            ]
        }.get(analysis_type, [])

        if not image_files:
            logger.warning(f"No image configuration found for analysis type: {analysis_type}")
            return jsonify({"error": f"No images found for analysis type: {analysis_type}"}), 404

        existing_files = []
        for filename, description in image_files:
            found = False
            for dir_path, url_builder in candidate_dirs:
                file_path = os.path.join(dir_path, filename)
                if os.path.exists(file_path):
                    existing_files.append({
                        "url": url_builder(filename),
                        "description": description,
                        "filename": filename,
                        "location": dir_path
                    })
                    logger.info(f"Found image file: {filename} in {dir_path}")
                    found = True
                    break
            if not found:
                logger.warning(f"Image file not found: {filename}")

        if not existing_files:
            logger.warning("No image files found in any static directories")
            return jsonify({"error": "No image files found. Please run the simulation first."}), 404

        return jsonify(existing_files)

    except Exception as e:
        logger.error(f"Error getting images: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/simulation/<analysis_type>/static/<filename>')
def serve_simulation_static(analysis_type, filename):
    """Serve static files from simulation/<analysis_type>/static"""
    try:
        dir_path = os.path.join('simulation', analysis_type, 'static')
        if not os.path.exists(dir_path):
            logger.error(f"Simulation static directory not found: {dir_path}")
            return jsonify({"error": f"File not found: {filename}"}), 404
        return send_from_directory(dir_path, filename)
    except Exception as e:
        logger.error(f"Error serving simulation static file {filename} from {analysis_type}: {str(e)}")
        return jsonify({"error": f"File not found: {filename}"}), 404
    
@app.route('/parameter', methods=['GET', 'POST', 'OPTIONS'])
def parameter():
    if request.method == 'OPTIONS':
        return '', 200 
    
    try:  # OUTER TRY (wraps whole function)

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

        # Parse netlist
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
        freq =""
        grnd=""
        freq_num=""
        component_lines=[]
        numberOfNodes = ckt_data.get("numberNodes", 0)
        parameterType = ckt_data.get("parameterType", "z").lower()
        groundNode = netlist.get("groundNode")

        # Parse ports safely
        try:
            p1n1 = str(ckt_data.get("p1n1", "1"))
        except (ValueError, TypeError):
            p1n1 = "1"
            logger.warning("Invalid p1n1 value, defaulting to 1")

        try:
            p1n2 = str(ckt_data.get("p1n2", "0"))
        except (ValueError, TypeError):
            p1n2 = "0"
            logger.warning("Invalid p1n2 value, defaulting to 0")

        try:
            p2n1 = str(ckt_data.get("p2n1", "2"))
        except (ValueError, TypeError):
            p2n1 = "2"
            logger.warning("Invalid p2n1 value, defaulting to 2")
        try:
            p2n2 = str(ckt_data.get("p2n2", "0"))
        except (ValueError, TypeError):
            p2n2 = "0"
            logger.warning("Invalid p2n2 value, defaulting to 0")
        try:
            freqency_prop = float(ckt_data.get("frequency_prop", 1))
            freqency_prop_unit = str(ckt_data.get("frequency_prop_unit", "GHz"))
        except (ValueError, TypeError):
            freqency_prop = 1
            freqency_prop_unit = "GHz"
            logger.warning("Invalid frequency prop values, using defaults")

        logger.info(f"Parsed ports → p1n1: {p1n1}, p1n2: {p1n2}, p2n1: {p2n1}, p2n2: {p2n2}")
        # Parse frequencies
        try:
            frequency = float(ckt_data.get("frequency", 50))
            startfrequency = float(ckt_data.get("startingfrequency", 0.1))
            endfrequency = float(ckt_data.get("endfrequency", 1))
            freq_num=ckt_data.get("frequency_num", 501)
            logger.info(f"Start frequency: {startfrequency}")
            logger.info(f"End frequency: {endfrequency}")
        except (ValueError, TypeError):
            frequency = 50
            startfrequency = 0.1
            endfrequency = 1
            logger.warning("Invalid frequency values, using defaults")
        # Build netlist text
        for comp in components:
            type_prefix = comp.get('type', '')
            id_ = comp.get('id', '')
            node1 = comp.get('node1', '')
            node2 = comp.get('node2', '')
            depnode3 = ''
            depnode4 = ''
            depVoltage = ''
            phase = ''
            impedance = ''
            electrical_length = ''
            impedance_Zo=''
            raw_value = comp.get('value', '')
            logger.info(f"Processing component {id_}: type={type_prefix}, raw_value={raw_value}")

            if isinstance(raw_value, dict):
                value = raw_value.get('value', '')
                depnode3 = raw_value.get('dependentNode1', '')
                depnode4 = raw_value.get('dependentNode2', '')
                depVoltage = raw_value.get('Vcontrol', '')
                phase = raw_value.get('phase', '')
                impedance = raw_value.get('impedance', 50)
                electrical_length = raw_value.get('electrical_length', '90')
                impedance_Zo = raw_value.get('impedance_Zo', '50')
                logger.info(f"Extracted from dict - impedance_Zo: {impedance_Zo}")
                
            else:
                value = raw_value
                depnode3 = comp.get('dependentnode1', '')
                depnode4 = comp.get('dependentnode2', '')
                depVoltage = comp.get('Vcontrol', '')
                phase = comp.get('phase', '0')
                impedance = comp.get('impedance', 50)
                electrical_length = comp.get('electrical_length', '90')
                # For ports, also try to get impedance_Zo from component level
                if type_prefix == 'port':
                    impedance_Zo = comp.get('impedance_Zo', '50')
                    logger.info(f"Extracted impedance_Zo from component level: {impedance_Zo}")
            if isinstance(value, dict):
                logger.error(f"Value is still a dict for component {id_}: {value}")
                value = str(value)

            if type_prefix in [
                'AC Source', 'DC Source', 'Inductor', 'Resistor', 'Wire', 'Capacitor',
                'Diode', 'Npn Transistor', 'Pnp Transistor', 'P Mosfet', 'N Mosfet',
                'VCVS', 'VCCS', 'CCVS', 'CCCS', 'Current Source', 'Transmission line',
                'Open Stub', 'Short Stub', 'port', 'Generic'
            ]:
                if type_prefix == 'DC Source':
                    line = f"{id_} {node2} {node1} {value}\n"
                elif type_prefix == 'AC Source':
                    line = f"{id_} {node1} {node2} AC {value} {phase}\n"
                elif type_prefix == 'VCVS':
                    line = f"{id_} {node1} {node2} {depnode3} {depnode4} {value}\n"
                elif type_prefix == 'VCCS':
                    line = f"{id_} {node1} {node2} {depnode3} {depnode4} {value}\n"
                elif type_prefix == 'CCVS':
                    line = f"{id_} {node1} {node2} {depVoltage} {value}\n"
                elif type_prefix == 'CCCS':
                    line = f"{id_} {node1} {node2} {depVoltage} {value}\n"
                elif type_prefix == 'Transmission line':
                    line = f"{id_} {node1} {node2} {impedance} {electrical_length} {freqency_prop} {freqency_prop_unit}\n"
                elif type_prefix == 'Open Stub':
                    line = f"OS{id_[-1]} {node1} {0} {impedance} {electrical_length} {freqency_prop} {freqency_prop_unit}\n"
                elif type_prefix == 'Short Stub':
                    line = f"SS{id_[-1]} {node1} {0} {impedance} {electrical_length} {freqency_prop} {freqency_prop_unit}\n"
                elif type_prefix == 'port':
                    # Port format: Port<n> <node> <ground> <impedance>
                    # Ensure impedance_Zo has a value, default to 50 if empty
                    if impedance_Zo is None or impedance_Zo == '':
                        impedance_Zo = '50'
                    line = f"Port{id_[-1]} {node1} {0} {impedance_Zo}\n"    
                    grnd = f"Ground {0} {1} {1}\n"
                    logger.info(f"Generated port line: {line.strip()}, impedance_Zo: {impedance_Zo}")
                elif type_prefix == 'Wire':
                    line = f"{id_} {node1} {node2}\n"
                else:
                    line = f"{id_} {node1} {node2} {value}\n"
                component_lines.append(line)    
                logger.info(f"Added to netlist: {line.strip()}")
        
        # Build the complete netlist after processing all components
        cctt = ''.join(component_lines)
        
        # Add frequency line
        freq = f'f {startfrequency} {endfrequency} {freq_num} {freqency_prop_unit} \n'
        cctt += freq
        logger.info(f"Added frequency to netlist: {freq.strip()}")
        
        # Add ground line if it exists
        if grnd:
            cctt += grnd
            logger.info(f"Added ground to netlist: {grnd.strip()}")
        
        # Save netlist file
        try:
            with open('netlist.txt', 'w') as file:
                file.write(cctt)
            logger.info("Netlist written to file successfully")
        except Exception as e:
            logger.error(f"Error writing netlist to file: {str(e)}")
            return jsonify({"error": f"Error writing netlist to file: {str(e)}"}), 500

        # Run the appropriate analysis
        if parameterType == "z":
            logger.info("Starting Z-parameter")
            z_params = run_z_parameter(frequency, p1n1, p1n2, p2n1, p2n2)
            return jsonify({
                "parameters": {
                    "symbolic": z_params["symbolic"],
                    "numeric": {k: str(v) for k, v in z_params["numeric"].items()}
                },
                "parameter_type": "z",
                "status": "success"
            })

        elif parameterType == "y":
            logger.info("Starting Y-parameter")
            y_params = run_y_parameter(frequency, p1n1, p1n2, p2n1, p2n2)
            return jsonify({
                "parameters": {
                    "symbolic": y_params["symbolic"],
                    "numeric": {k: str(v) for k, v in y_params["numeric"].items()}
                },
                "parameter_type": "y",
                "status": "success"
            })

        elif parameterType == "s":

            logger.info("Starting S-parameter")
            logger.info(f"Start Frequency: {startfrequency}")
            logger.info(f"End Frequency: {endfrequency}")

            calculator = run_s_parameter()
            # Read the netlist file and pass the content to the calculator
            with open('netlist.txt', 'r') as f:
                netlist_content = f.read()
            S_params = calculator(netlist_content)

            if S_params is None:
                logger.error("❌ run_s_parameter returned None!")
                return jsonify({
                    'success': False,
                    'message': 'S-parameter calculation failed',
                    'error': 'No S-parameters returned'
                }), 500

            # # Check if S_params is empty
            # if S_params.size == 0:
            #     logger.error("❌ S-parameter array is empty!")
            #     return jsonify({
            #         'success': False,
            #         'message': 'S-parameter calculation failed',
            #         'error': 'Empty S-parameters array'
            #     }), 500

            # logger.info(f"✅ S_params received: shape={S_params.shape}, dtype={S_params.dtype}")
            try:
                
                import skrf as rf
                if startfrequency == endfrequency:
                    freq_range = rf.Frequency(start=startfrequency, stop=startfrequency, npoints=1, unit='GHz')
                else:
                    freq_range = rf.Frequency(start=startfrequency, stop=endfrequency, npoints=len(S_params), unit='GHz')
                
                # Import the plotting function
                from S_parameter import plot_s_parameters
                plot_path = plot_s_parameters(freq_range, S_params, save_dir='static')
                logger.info(f"Plot generated at: {plot_path}")
            except Exception as plot_error:
                logger.error(f"Error generating plot: {plot_error}")
                logger.error(traceback.format_exc())
            
            def complex_to_dict(complex_array):
                """
                Convert numpy array of S-parameters to JSON-serializable format.
                Input shape: (nfreqs, 2, 2) - number of frequencies x 2x2 matrix
                """
                try:
                    result = []
                    for freq_point in complex_array:  # Iterate over frequency points
                        freq_data = []
                        for row in freq_point:  # Iterate over rows (2 rows)
                            row_data = []
                            for val in row:  # Iterate over columns (2 columns)
                                if isinstance(val, (complex, np.complex64, np.complex128)):
                                    row_data.append({
                                        'real': float(np.real(val)),
                                        'imag': float(np.imag(val)),
                                        'magnitude': float(np.abs(val)),
                                        'phase_deg': float(np.angle(val) * 180 / np.pi)
                                    })
                                else:
                                    row_data.append({
                                        'real': float(val),
                                        'imag': 0.0,
                                        'magnitude': float(abs(val)),
                                        'phase_deg': 0.0
                                    })
                            freq_data.append(row_data)  # Append complete row
                        result.append(freq_data)  # Append complete matrix for this frequency
                    return result
                except Exception as e:
                    logger.error(f"Error converting complex array to dictionary: {e}")
                    import traceback
                    logger.error(traceback.format_exc())
                    return []

            # Convert S-parameters to JSON-serializable format
            s_params_serializable = complex_to_dict(S_params)
            
            # Generate frequency array
            if startfrequency == endfrequency:
                frequencies = [float(startfrequency)]
            else:
                frequencies = np.linspace(startfrequency, endfrequency, len(S_params)).tolist()

            # Debug logging
            # logger.info(f"S-parameters shape: {S_params.shape}")
            logger.info(f"Serialized data length: {len(s_params_serializable)}")
            logger.info(f"Frequencies length: {len(frequencies)}")
            if s_params_serializable:
                logger.info(f"First S-parameter matrix structure: {s_params_serializable[0]}")
            else:
                logger.error("Serialized S-parameters is EMPTY!")

            # Return with correct field names matching frontend expectations
            return jsonify({
                'success': True,
                'message': 'S-parameters calculated successfully',
                'sparameters': s_params_serializable,  # NO UNDERSCORE
                'frequencies': frequencies,
                # 'shape': list(S_params.shape),
                'parametertype': 's'  # LOWERCASE 't'
            })

        else:
            raise ValueError(f"Unsupported parameter type: {parameterType}")



    except Exception as e:   # OUTER EXCEPT
        logger.error(f"Error during simulation: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": str(e),
            "traceback": traceback.format_exc(),
            "status": "error"
        }), 500


@app.route('/blog/form', methods=['POST', 'GET'])
def blog_posts():
    if blogs_collection is None:
        return jsonify({"error": "Database connection not available"}), 503
    
    if request.method == 'POST':
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        # Example: Add a timestamp if not provided
        if "date" not in data:
            from datetime import datetime
            data["date"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        result=blogs_collection.insert_one(data)
        data["_id"] = str(result.inserted_id) 
        return jsonify({
            "message": "Post added successfully",
            "post": data
        }), 201
    elif request.method == 'GET':
        # ✅ Fetch all blogs from MongoDB with _id for deletion
        posts = list(blogs_collection.find({}))
        # Convert ObjectId to string for JSON serialization
        for post in posts:
            post["_id"] = str(post["_id"])
        return jsonify(posts), 200

@app.route('/blog/<post_id>', methods=['DELETE'])
def delete_blog(post_id):
    if blogs_collection is None:
        return jsonify({"error": "Database connection not available"}), 503
    
    try:
        from bson import ObjectId
        from bson.errors import InvalidId
        # Convert string ID to ObjectId
        try:
            object_id = ObjectId(post_id)
        except InvalidId:
            return jsonify({
                "error": "Invalid post ID format"
            }), 400
        
        result = blogs_collection.delete_one({"_id": object_id})
        
        if result.deleted_count > 0:
            return jsonify({
                "message": "Post deleted successfully"
            }), 200
        else:
            return jsonify({
                "error": "Post not found"
            }), 404
    except Exception as e:
        logger.error(f"Error deleting post: {str(e)}")
        return jsonify({
            "error": "Deletion failed",
            "details": str(e)
        }), 500

if __name__ == "__main__":
    logger.info(f"Starting server on port {port}")
    connect_to_mongo()
    app.run(host="0.0.0.0", port=port, debug=True)
import traceback
from flask import Flask, request, jsonify, url_for, send_from_directory
from databse.db import connect_to_mongo,blogs_collection  
import json  # Import the json module
import numpy as np  # For numerical operations
from flask_cors import CORS
from fastapi import FastAPI, HTTPException
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
import os
from dotenv import load_dotenv
import logging

# Load environment variables from .env file
load_dotenv()
# Only load .env if not in production
if os.getenv("NODE_ENV") != "production":
    from dotenv import load_dotenv
    load_dotenv()

app = FastAPI()
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
        "origins": [
            "http://localhost:3000",               # dev
            "https://circuit-simulator-51410.web.app",
                  # production
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"],
        "supports_credentials": True,
        "expose_headers": ["Content-Type", "Authorization"],
        "max_age": 3600
    }
})
db,blogs_collection=connect_to_mongo()
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
        circuit = Circuit()
        circuit.add(file_content)
        netlist = circuit.netlist()
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
            if type_prefix in ['AC Source', 'DC Source', 'Inductor', 'Resistor', 'Wire', 'Capacitor', 'Diode', 'Npn Transistor', 'Pnp Transistor', 'P Mosfet', 'N Mosfet', 'VCVS', 'VCCS','CCVS','CCCS','Current Source' ,'Generic']:
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
        if not os.path.exists('static'):
            os.makedirs('static')
            logger.info("Created static directory")

        # Updated image configurations with time domain plots
        image_files = {
            'ac': [
                ("ac_analysis_voltage_phasor.png", "Voltage Phasor Diagram"),
                ("ac_analysis_current_phasor.png", "Current Phasor Diagram"),
                ("ac_analysis_voltage_time_domain.png", "Voltage Time Domain"),
                ("ac_analysis_current_time_domain.png", "Current Time Domain"),
                # ("ac_analysis_combined_time_domain.png", "Combined Time Domain")
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
                    "description": description,
                    "filename": filename
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

@app.route('/static/<filename>')
def serve_static(filename):
    """Serve static files (images) with proper headers"""
    try:
        return send_from_directory('static', filename)
    except Exception as e:
        logger.error(f"Error serving static file {filename}: {str(e)}")
        return jsonify({"error": f"File not found: {filename}"}), 404
    
@app.route('/parameter', methods=['GET', 'POST', 'OPTIONS'])
def parameter():
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
        parameterType = ckt_data.get("parameterType", "z").lower()
        groundNode = netlist.get("groundNode")
        try:
            p1n1 = int(ckt_data.get("p1n1", 0))
        except (ValueError, TypeError):
            p1n1 = 0
            logger.warning("Invalid p1n1 value, defaulting to 0")

        try:
            p1n2 = int(ckt_data.get("p1n2", 0))
        except (ValueError, TypeError):
            p1n2 = 0
            logger.warning("Invalid p1n2 value, defaulting to 0")

        try:
            p2n1 = int(ckt_data.get("p2n1", 0))
        except (ValueError, TypeError):
            p2n1 = 0
            logger.warning("Invalid p2n1 value, defaulting to 0")

        try:
            p2n2 = int(ckt_data.get("p2n2", 0))
        except (ValueError, TypeError):
            p2n2 = 0
            logger.warning("Invalid p2n2 value, defaulting to 0")

        logger.info(f"Parsed ports → p1n1: {p1n1}, p1n2: {p1n2}, p2n1: {p2n1}, p2n2: {p2n2}")




        try:
            frequency = float(ckt_data.get("frequency", 50))
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
            if parameterType == "z":
                logger.info("Starting Z-parameter")
                z_params = run_z_parameter(frequency, p1n1, p1n2, p2n1, p2n2)
                logger.info("Z-parameter analysis completed successfully")
                return jsonify({
                    "parameters": {
                        "symbolic": z_params["symbolic"],
                        "numeric": {
                            "Z11": str(z_params["numeric"]["Z11"]),
                            "Z12": str(z_params["numeric"]["Z12"]),
                            "Z21": str(z_params["numeric"]["Z21"]),
                            "Z22": str(z_params["numeric"]["Z22"])
                        }
                    },
                    "parameter_type": "z",
                    "status": "success"
                })

            elif parameterType == "y":
                logger.info("Starting Y-parameter")
                logger.info(f"Frequency: {frequency}")
                y_params = run_y_parameter(frequency,p1n1, p1n2, p2n1, p2n2)

                logger.info("Y-parameter analysis completed successfully")
                return jsonify({
                    "parameters": {
                        "symbolic": y_params["symbolic"],
                        "numeric": {
                            "Y11": str(y_params["numeric"]["Y11"]),
                            "Y12": str(y_params["numeric"]["Y12"]),
                            "Y21": str(y_params["numeric"]["Y21"]),
                            "Y22": str(y_params["numeric"]["Y22"])
                        }
                    },
                    "parameter_type": "y",
                    "status": "success"
                })

            else:
                raise ValueError(f"Unsupported parameter type: {parameterType}")

        except Exception as e:
            logger.error(f"Error during {parameterType} analysis: {str(e)}")
            logger.error(traceback.format_exc())
            return jsonify({
                "error": f"Error during {parameterType} analysis: {str(e)}",
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
   
@app.route('/blog/form', methods=['POST', 'GET'])
def blog_posts():
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
        # ✅ Fetch all blogs from MongoDB
        posts = list(blogs_collection.find({}, {"_id": 0}))  # exclude _id
        return jsonify(posts), 200

if __name__ == "__main__":
    logger.info(f"Starting server on port {port}")
    connect_to_mongo()
    app.run(host="0.0.0.0", port=port, debug=True)
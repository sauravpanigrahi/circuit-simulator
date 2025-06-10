from lcapy import Circuit
import logging
import sympy as sp
import numpy as np

# Setup logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def preprocess_netlist(netlist_string):
    """
    Converts W-type wire lines, handles diodes, and cleans up the netlist.
    """
    lines = netlist_string.strip().splitlines()
    processed = []
    has_diodes = False

    for line in lines:
        line = line.strip()
        if not line or line.startswith('*'):  # Skip empty lines and comments
            continue
            
        tokens = line.split()
        if len(tokens) >= 3:
            if tokens[0].startswith('W'):
                name, n1, n2 = tokens[0], tokens[1], tokens[2]
                # Use reasonable resistance for wires
                processed.append(f'R{name} {n1} {n2} 0.001')
                logger.info(f"Converted wire {name} to resistor R{name}")
            elif tokens[0].startswith('D'):
                # For DC analysis, replace diode with a resistor
                name, n1, n2 = tokens[0], tokens[1], tokens[2]
                processed.append(f'R{tokens[0]} {n1} {n2} 0.7')  # Use 0.7V drop for diode
                has_diodes = True
                logger.info(f"Replaced diode {name} with resistor for DC analysis")
            elif tokens[0] == 'Vg' and tokens[1] == '0' and tokens[2] == '0':
                # Skip redundant ground-to-ground voltage source
                logger.info("Skipping redundant Vg 0 0 0")
                continue
            elif tokens[0].startswith('V'):
                # Handle voltage sources
                v_name, n1, n2 = tokens[0], tokens[1], tokens[2]
                if len(tokens) > 3:
                    # Check if it's an AC source with sin expression
                    if 'sin' in ' '.join(tokens[3:]):
                        # Extract the amplitude from sin expression
                        value = tokens[4] if len(tokens) > 4 else '0'
                        processed.append(f'{v_name} {n1} {n2} {value}')
                        logger.info(f"Converted AC source {v_name} to DC source with value {value}")
                    else:
                        # Regular voltage source
                        value = tokens[3]
                        processed.append(f'{v_name} {n1} {n2} {value}')
                else:
                    processed.append(f'{v_name} {n1} {n2} 0')
            else:
                processed.append(line)

    return '\n'.join(processed), has_diodes

def extract_numerical_value(expr):
    """
    Extract numerical value from Lcapy expressions.
    """
    try:
        # Method 1: Direct conversion if it's already a number
        if isinstance(expr, (int, float, complex)):
            return float(expr.real) if hasattr(expr, 'real') else float(expr)
        
        # Method 2: Try to get the expression value
        if hasattr(expr, 'expr'):
            value = expr.expr
        else:
            value = expr
            
        # Method 3: Convert sympy expression to float
        if hasattr(value, 'evalf'):
            result = float(value.evalf())
            return result
        elif hasattr(value, 'n'):
            result = float(value.n())
            return result
        else:
            # Try direct conversion
            return float(value)
            
    except Exception as e:
        logger.debug(f"Could not extract numerical value from {expr}: {e}")
        return None

def analyze_diode_circuit_iterative(netlist_string, max_iterations=20, tolerance=1e-6):
    """
    Iterative analysis for circuits with diodes using the diode equation.
    This is a simplified approach assuming ideal diodes.
    """
    logger.info("Starting iterative diode analysis...")
    
    # Parse netlist to identify diodes and their connections
    lines = netlist_string.strip().splitlines()
    diodes = {}
    
    for line in lines:
        tokens = line.split()
        if tokens[0].startswith('D') and len(tokens) >= 3:
            diode_name = tokens[0]
            anode = tokens[1]
            cathode = tokens[2]
            diodes[diode_name] = {'anode': anode, 'cathode': cathode, 'conducting': False}
    
    logger.info(f"Found diodes: {list(diodes.keys())}")
    
    # Simple iterative approach: assume diodes are either ON (conducting) or OFF
    best_result = None
    best_error = float('inf')
    
    # Try different diode states (2^n combinations for n diodes)
    n_diodes = len(diodes)
    if n_diodes > 4:  # Limit combinations to prevent explosion
        logger.warning(f"Too many diodes ({n_diodes}) for exhaustive search. Using heuristic.")
        n_diodes = 4
    
    for state in range(2**min(n_diodes, len(diodes))):
        try:
            # Create modified netlist with diode replacements
            modified_netlist = replace_diodes_with_models(netlist_string, diodes, state)
            
            # Analyze the linear circuit
            cct = Circuit(modified_netlist)
            
            # Check if this state is consistent
            consistent, voltages, currents = check_diode_consistency(cct, diodes, state)
            
            if consistent:
                logger.info(f"Found consistent diode state: {state}")
                return voltages, currents, diodes
                
        except Exception as e:
            logger.debug(f"State {state} failed: {e}")
            continue
    
    logger.warning("No consistent diode state found. Returning best approximation.")
    return {}, {}, diodes

def replace_diodes_with_models(netlist_string, diodes, state):
    """
    Replace diodes with appropriate models based on their assumed state.
    """
    lines = netlist_string.strip().splitlines()
    modified_lines = []
    
    diode_names = list(diodes.keys())
    
    for line in lines:
        tokens = line.split()
        if tokens[0].startswith('D') and tokens[0] in diodes:
            diode_idx = diode_names.index(tokens[0])
            if diode_idx < 32 and (state & (1 << diode_idx)):  # Diode is ON
                # Replace with small resistance (conducting)
                anode, cathode = tokens[1], tokens[2]
                modified_lines.append(f'R{tokens[0]}_on {anode} {cathode}  0.00000000000001')
            else:  # Diode is OFF
                # Replace with large resistance (non-conducting)
                anode, cathode = tokens[1], tokens[2]
                modified_lines.append(f'R{tokens[0]}_off {anode} {cathode} 1e9')
        else:
            modified_lines.append(line)
    
    return '\n'.join(modified_lines)

def check_diode_consistency(cct, diodes, state):
    """
    Check if the assumed diode states are consistent with the calculated voltages.
    """
    try:
        voltages = {}
        currents = {}
        
        # Get all voltages and currents
        for node in cct.nodes:
            if node != '0':
                try:
                    v_val = extract_numerical_value(cct[node].v)
                    if v_val is not None:
                        voltages[f'V_node_{node}'] = v_val
                except:
                    pass
        
        # Get component values
        for comp_name in cct.elements:
            comp = cct[comp_name]
            try:
                if hasattr(comp, 'v'):
                    v_val = extract_numerical_value(comp.v)
                    if v_val is not None:
                        voltages[f'V_{comp_name}'] = v_val
                        
                if hasattr(comp, 'i'):
                    i_val = extract_numerical_value(comp.i)
                    if i_val is not None:
                        currents[f'I_{comp_name}'] = i_val
            except:
                pass
        
        # Check consistency for each diode
        diode_names = list(diodes.keys())
        consistent = True
        
        for i, (diode_name, diode_info) in enumerate(diodes.items()):
            if i >= 32:  # Limit check
                break
                
            anode_node = diode_info['anode']
            cathode_node = diode_info['cathode']
            is_on = bool(state & (1 << i))
            
            # Get anode and cathode voltages
            v_anode = voltages.get(f'V_node_{anode_node}', 0)
            v_cathode = voltages.get(f'V_node_{cathode_node}', 0)
            v_diode = v_anode - v_cathode
            
            # Check consistency
            if is_on and v_diode < -0.1:  # ON but reverse biased
                consistent = False
                break
            elif not is_on and v_diode > 0.7:  # OFF but forward biased significantly
                consistent = False
                break
        
        return consistent, voltages, currents
        
    except Exception as e:
        logger.debug(f"Consistency check failed: {e}")
        return False, {}, {}

def run_dc_analysis(netlist_filename='netlist.txt'):
    try:
        with open(netlist_filename, 'r') as file:
            netlist_string = file.read()
        logger.info(f"Original netlist loaded from {netlist_filename}")
    except FileNotFoundError:
        logger.error(f"Netlist file '{netlist_filename}' not found.")
        return {}, {}

    # Preprocess netlist
    netlist_string, has_diodes = preprocess_netlist(netlist_string)
    logger.info(f"Preprocessed netlist:\n{netlist_string}")

    if has_diodes:
        logger.info("Circuit contains diodes - using iterative analysis")
        try:
            voltages, currents, diode_info = analyze_diode_circuit_iterative(netlist_string)
            
            # Print diode states
            logger.info("=== DIODE STATES ===")
            for diode_name, info in diode_info.items():
                state = "CONDUCTING" if info.get('conducting', False) else "NON-CONDUCTING"
                logger.info(f"{diode_name}: {state}")
            
            return voltages, currents
            
        except Exception as e:
            logger.error(f"Diode analysis failed: {e}")
            logger.info("Falling back to linear analysis (may be inaccurate)")
    
    # Standard linear analysis
    try:
        cct = Circuit(netlist_string)
        logger.info("Circuit created successfully")
        
        # Perform DC analysis
        cct_dc = cct.dc()
        logger.info("DC analysis completed")
        
    except Exception as e:
        logger.error(f"Error creating circuit: {e}")
        return {}, {}

    dc_voltages = {}
    dc_currents = {}

    try:
        logger.info("Starting linear DC analysis...")
        
        # Get node voltages (excluding ground)
        nodes = [n for n in cct_dc.nodes if n != '0']
        logger.info(f"Circuit nodes (excluding ground): {nodes}")
        
        # Calculate node voltages
        for node in nodes:
            try:
                node_voltage = cct_dc[node].v
                v_val = extract_numerical_value(node_voltage)
                if v_val is not None:
                    dc_voltages[f'V_node_{node}'] = v_val
                    logger.info(f"Node {node}: {v_val:.6f} V")
            except Exception as e:
                logger.error(f"Error getting voltage for node {node}: {e}")
        
        # Calculate component voltages and currents
        for comp_name in cct_dc.elements:
            try:
                comp = cct_dc[comp_name]
                
                # Get voltage across component
                if hasattr(comp, 'v'):
                    v_expr = comp.v
                    v_val = extract_numerical_value(v_expr)
                    if v_val is not None:
                        dc_voltages[f'V_{comp_name}'] = v_val
                        logger.info(f"Voltage across {comp_name}: {v_val:.6f} V")
                
                # Get current through component
                if hasattr(comp, 'i'):
                    i_expr = comp.i
                    i_val = extract_numerical_value(i_expr)
                    if i_val is not None:
                        dc_currents[f'I_{comp_name}'] = i_val
                        logger.info(f"Current through {comp_name}: {i_val:.6f} A")
                        
            except Exception as e:
                logger.error(f"Error processing component {comp_name}: {e}")
                    
    except Exception as e:
        logger.error(f"DC analysis failed: {e}")
        return {}, {}

    logger.info(f"DC Analysis Results - Voltages: {dc_voltages}")
    logger.info(f"DC Analysis Results - Currents: {dc_currents}")
    
    return dc_voltages, dc_currents

def debug_circuit_structure(netlist_filename='netlist.txt'):
    """Debug function to understand circuit structure"""
    try:
        with open(netlist_filename, 'r') as file:
            netlist_string = file.read()
        
        netlist_string, has_diodes = preprocess_netlist(netlist_string)
        
        print("=== CIRCUIT STRUCTURE DEBUG ===")
        print(f"Contains diodes: {has_diodes}")
        
        if has_diodes:
            print("Note: Diode circuits require iterative analysis")
        
        try:
            cct = Circuit(netlist_string)
            print(f"Nodes: {list(cct.nodes)}")
            print(f"Elements: {list(cct.elements.keys())}")
            
            print("\nElement details:")
            for name, element in cct.elements.items():
                print(f"  {name}: {element}")
        except Exception as e:
            print(f"Circuit creation failed (expected for diode circuits): {e}")
            
        return None
        
    except Exception as e:
        print(f"Debug failed: {e}")
        return None

if __name__ == "__main__":
    print("=== DEBUGGING CIRCUIT STRUCTURE ===")
    debug_circuit_structure()
    
    print("\n=== RUNNING DC ANALYSIS ===")
    voltages, currents = run_dc_analysis()
    
    # print("\n=== DC ANALYSIS RESULTS ===")
    # print("Node Voltages:")
    # for name, value in sorted(voltages.items()):
    #     if name.startswith('V_node_'):
    #         node = name.replace('V_node_', '')
    #         print(f"  Node {node}: {value:.6f} V")
    
    # print("\nComponent Voltages:")
    # for name, value in sorted(voltages.items()):
    #     if not name.startswith('V_node_'):
    #         print(f"  {name}: {value:.6f} V")
    
    # print("\nComponent Currents:")
    # for name, value in sorted(currents.items()):
    #     print(f"  {name}: {value:.6f} A")
    
    # if not voltages and not currents:
    #     print("\n=== TROUBLESHOOTING TIPS FOR DIODES ===")
    #     print("1. Diodes require nonlinear analysis - this is more complex")
    #     print("2. Try simpler diode models or manual calculation")
    #     print("3. Consider using SPICE-compatible simulators for accurate diode analysis")
    #     print("4. Check that your diode netlist syntax is correct")
    # else:
    #     print(f"\n=== SUCCESS ===")
    #     print(f"Successfully analyzed circuit with {len(voltages)} voltage values and {len(currents)} current values")
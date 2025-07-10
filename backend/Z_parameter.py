from lcapy import Circuit
import logging
import sympy as sp
import numpy as np

# Setup logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def preprocess_netlist(netlist_string):
    """Convert wire elements to small resistors"""
    lines = netlist_string.strip().splitlines()
    processed = []

    for line in lines:
        tokens = line.split()
        if len(tokens) == 3 and tokens[0].startswith('W'):
            name, n1, n2 = tokens
            processed.append(f'R{name} {n1} {n2} 0.000001')
        else:
            processed.append(line)

    return '\n'.join(processed)

def run_z_parameter(freq, netlist_filename='netlist.txt'):
    """
    Calculate Z-parameters for T-network topology
    Port 1: nodes 0-4, Port 2: nodes 2-5
    """
    with open(netlist_filename, 'r') as file:
        netlist_string = file.read()
        logger.info("Original netlist:\n%s", netlist_string)
        netlist_string = preprocess_netlist(netlist_string)
        logger.info("Generated netlist is: %s", netlist_string)
        
        s = sp.Symbol('s')
        omega = 2 * np.pi * freq
        jw = sp.I * omega
        logger.info(f"Frequency: {freq} Hz")

        try:
            # Method 1: Direct lcapy two-port analysis
            circuit = Circuit(netlist_string)
            
            # For T-network: Port 1 is 0-4, Port 2 is 2-5
            try:
                twoport = circuit.twoport(0, 4, 2, 5)
                Z_matrix = twoport.Z
                Z11 = Z_matrix[0, 0]
                Z12 = Z_matrix[0, 1]
                Z21 = Z_matrix[1, 0]
                Z22 = Z_matrix[1, 1]
                logger.info("Using lcapy twoport method")
                
            except Exception as e:
                logger.info("Twoport method failed: %s, using manual calculation", str(e))
                
                # Method 2: Manual Z-parameter calculation for T-network
                # Z11: Apply 1A current between nodes 0-4, measure voltage (port 2 open)
                circuit1_netlist = netlist_string + '\nI_test 0 4 1'  # 1A from node 0 to node 4
                
                circuit1 = Circuit(circuit1_netlist)
                
                # Port voltages are differential voltages
                V1_port1 = circuit1[0].v - circuit1[4].v  # Voltage across port 1
                V2_port1 = circuit1[2].v - circuit1[5].v  # Voltage across port 2
                
                Z11 = sp.simplify(V1_port1)  # Z11 = V1/I1 when I2=0
                Z21 = sp.simplify(V2_port1)  # Z21 = V2/I1 when I2=0
                
                # Z12 and Z22: Apply 1A current between nodes 2-5, measure voltages (port 1 open)
                circuit2_netlist = netlist_string + '\nI_test 2 5 1'  # 1A from node 2 to node 5
                circuit2 = Circuit(circuit2_netlist)
                
                V1_port2 = circuit2[0].v - circuit2[4].v  # Voltage across port 1
                V2_port2 = circuit2[2].v - circuit2[5].v  # Voltage across port 2
                
                Z12 = sp.simplify(V1_port2)  # Z12 = V1/I2 when I1=0
                Z22 = sp.simplify(V2_port2)  # Z22 = V2/I2 when I1=0
                
                logger.info("Using manual differential voltage method")
                
        except Exception as e:
            logger.error("Manual method failed: %s", str(e))
            
            # Method 3: Analytical T-network calculation
            try:
                logger.info("Using analytical T-network calculation")
                
                # Extract component values from netlist
                # R1 = 100  # Top left resistor
                # R2 = 100  # Top right resistor  
                # R3 = 200  # Shunt resistor
                
                # Parse actual values from netlist
                for line in netlist_string.strip().splitlines():
                    tokens = line.split()
                    if len(tokens) >= 4 and tokens[0].startswith('R'):
                        name, n1, n2, value = tokens[:4]
                        if name == 'R1':
                            R1 = float(value)
                        elif name == 'R2':
                            R2 = float(value)
                        elif name == 'R3':
                            R3 = float(value)
                
                # T-network Z-parameter formulas
                # For a T-network with series arms R1, R2 and shunt arm R3:
                Z11 = R1 + (R2 * R3)/(R2 + R3)  # Input impedance
                Z22 = R2 + (R1 * R3)/(R1 + R3)  # Output impedance
                Z12 = (R1 * R2 * R3)/((R1 + R3) * (R2 + R3))  # Transfer impedance
                Z21 = Z12  # Reciprocal network
                
                # Convert to sympy expressions
                Z11 = sp.sympify(Z11)
                Z12 = sp.sympify(Z12)
                Z21 = sp.sympify(Z21)
                Z22 = sp.sympify(Z22)
                
                logger.info("Using T-network analytical formulas")
                
            except Exception as e3:
                logger.error("Analytical method failed: %s", str(e3))
                return None
        
        # Simplify the expressions
        Z11 = sp.simplify(Z11).evalf(2)
        Z12 = sp.simplify(Z12).evalf(2)
        Z21 = sp.simplify(Z21).evalf(2)
        Z22 = sp.simplify(Z22).evalf(2)

        
        logger.info("Symbolic Z-parameters:")
        logger.info("Z11 = %s", Z11)
        logger.info("Z12 = %s", Z12)
        logger.info("Z21 = %s", Z21)
        logger.info("Z22 = %s", Z22)
        
        # Convert to numerical values
        try:
            # Handle different types of expressions
            def to_numeric(expr):
                if hasattr(expr, 'cval'):
                    return expr.cval
                elif hasattr(expr, 'as_expr'):
                    return complex(expr.as_expr().subs(s, jw).evalf())
                else:
                    try:
                        return complex(expr.subs(s, jw).evalf())
                    except:
                        return complex(float(expr.evalf()))
            
            Z11_val = to_numeric(Z11)
            Z12_val = to_numeric(Z12)
            Z21_val = to_numeric(Z21)
            Z22_val = to_numeric(Z22)
            
        except Exception as e:
            logger.error("Numerical conversion failed: %s", str(e))
            # Fallback for resistive circuits
            Z11_val = complex(float(Z11.evalf()))
            Z12_val = complex(float(Z12.evalf()))
            Z21_val = complex(float(Z21.evalf()))
            Z22_val = complex(float(Z22.evalf()))
        
        logger.info("Z-parameter matrix at %s Hz:", freq)
        logger.info("Z11 = %s", Z11_val)
        logger.info("Z12 = %s", Z12_val)
        logger.info("Z21 = %s", Z21_val)
        logger.info("Z22 = %s", Z22_val)
        
        return {
            "symbolic": {
                "Z11": str(Z11), "Z12": str(Z12),
                "Z21": str(Z21), "Z22": str(Z22)
            },
            "numeric": {
                "Z11": Z11_val, "Z12": Z12_val,
                "Z21": Z21_val, "Z22": Z22_val
            }
        }

# Example usage
if __name__ == "__main__":
    # Test with a sample frequency
    # freq = 1000  # 1 kHz
    
    result = run_z_parameter()
    
    if result:
        print("\nZ-Parameter Results:")
        print(f"Z11 = {result['numeric']['Z11']:.6f}")
        print(f"Z12 = {result['numeric']['Z12']:.6f}")
        print(f"Z21 = {result['numeric']['Z21']:.6f}")
        print(f"Z22 = {result['numeric']['Z22']:.6f}")
        
        # Check reciprocity
        if abs(result['numeric']['Z12'] - result['numeric']['Z21']) < 1e-10:
            print("✓ Network is reciprocal (Z12 = Z21)")
        else:
            print("⚠ Network is not reciprocal")
        
    
    else:
        print("Analysis failed")
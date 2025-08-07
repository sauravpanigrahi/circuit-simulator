from lcapy import Circuit
import logging
import sympy as sp
import numpy as np
from typing import Dict, Any, Tuple, List, Optional
import matplotlib.pyplot as plt
from pathlib import Path
import json

# Setup logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class YParameterCalculator:
    def __init__(self):
        self.s = sp.Symbol('s', complex=True)
        self.supported_components = ['R', 'C', 'L', 'V', 'I', 'W']
        self.engineering_prefixes = {
            'f': 1e-15, 'p': 1e-12, 'n': 1e-9, 'u': 1e-6, 'm': 1e-3,
            'k': 1e3, 'M': 1e6, 'G': 1e9, 'T': 1e12
        }

    def parse_engineering_notation(self, value_str: str) -> float:
        """Parse engineering notation values (e.g., '1k', '10u', '1.5M')"""
        value_str = str(value_str).strip()
        if not value_str:
            return 0.0
            
        try:
            # Check if it's already a number
            return float(value_str)
        except ValueError:
            pass
        
        # Extract number and suffix
        for suffix, multiplier in self.engineering_prefixes.items():
            if value_str.endswith(suffix):
                number = float(value_str[:-len(suffix)])
                return number * multiplier
        
        # If no suffix found, try to parse as float
        try:
            return float(value_str)
        except ValueError:
            logger.warning(f"Could not parse value: {value_str}")
            return 0.0

    def preprocess_netlist(self, netlist_string: str) -> str:
        """Enhanced preprocessing with better component handling"""
        lines = netlist_string.strip().splitlines()
        processed = []
        wire_counter = 1
        existing_names = set()
        
        # First pass: collect existing names
        for line in lines:
            line = line.strip()
            if not line or line.startswith('#') or line.startswith(';'):
                continue
            tokens = line.split()
            if len(tokens) >= 3:
                existing_names.add(tokens[0])

        # Second pass: process components
        for line_num, line in enumerate(lines, 1):
            line = line.strip()
            if not line or line.startswith('#') or line.startswith(';'):
                continue
                
            tokens = line.split()
            if len(tokens) < 3:
                logger.warning(f"Line {line_num}: Invalid component definition: {line}")
                continue
            
            component_type = tokens[0][0].upper()
            name = tokens[0]
            n1, n2 = tokens[1], tokens[2]
            
            if component_type == 'W':
                # Convert wire to very small resistor
                new_name = f'Rwire{wire_counter}'
                while new_name in existing_names:
                    wire_counter += 1
                    new_name = f'Rwire{wire_counter}'
                processed.append(f'{new_name} {n1} {n2} 1e-12')
                existing_names.add(new_name)
                wire_counter += 1
                logger.info(f"Converted wire {name} to small resistor {new_name}")
                
            elif component_type in ['R', 'C', 'L']:
                # Handle component values with engineering notation
                if len(tokens) >= 4:
                    raw_value = tokens[3]
                    parsed_value = self.parse_engineering_notation(raw_value)
                    processed.append(f'{name} {n1} {n2} {parsed_value}')
                    logger.debug(f"Processed {component_type}: {name} = {parsed_value}")
                else:
                    processed.append(line)
                    
            elif component_type in ['V', 'I']:
                # Voltage/current sources
                processed.append(line)
                
            else:
                logger.warning(f"Line {line_num}: Unsupported component type: {component_type}")
                # Still add it to let lcapy handle the error
                processed.append(line)
        
        return '\n'.join(processed)

    def validate_ports(self, netlist: str, p1n1: str, p1n2: str, p2n1: str, p2n2: str) -> Tuple[bool, List[str]]:
        """Enhanced port validation with better error reporting"""
        nodes = set()
        components = []
        
        for line in netlist.strip().splitlines():
            tokens = line.split()
            if len(tokens) >= 3:
                components.append(tokens[0])
                for token in tokens[1:3]:
                    try:
                        nodes.add(str(token))
                    except:
                        pass
        
        port_nodes = [str(n) for n in [p1n1, p1n2, p2n1, p2n2]]
        missing_nodes = [node for node in port_nodes if node not in nodes]
        
        if missing_nodes:
            logger.error(f"Port nodes not found in circuit: {missing_nodes}")
            logger.info(f"Available nodes: {sorted(nodes)}")
            logger.info(f"Circuit components: {components}")
            return False, missing_nodes
        
        logger.info(f"Port validation successful: P1({p1n1},{p1n2}), P2({p2n1},{p2n2})")
        return True, []

    def extract_symbolic_expression(self, lcapy_obj):
        """Enhanced symbolic expression extraction with better error handling"""
        try:
            if hasattr(lcapy_obj, 'expr'):
                return lcapy_obj.expr
            elif hasattr(lcapy_obj, 'as_expr'):
                return lcapy_obj.as_expr()
            elif hasattr(lcapy_obj, '__str__'):
                expr_str = str(lcapy_obj).replace('j', 'I')
                return sp.sympify(expr_str)
            elif isinstance(lcapy_obj, sp.Basic):
                return lcapy_obj
            elif isinstance(lcapy_obj, (int, float, complex)):
                return sp.sympify(lcapy_obj)
            else:
                logger.warning(f"Unknown lcapy object type: {type(lcapy_obj)}")
                return sp.sympify(0)
        except Exception as e:
            logger.warning(f"Failed to extract symbolic expression: {e}")
            return sp.sympify(0)

    def calculate_y_parameters_twoport(self, netlist: str, p1n1: str, p1n2: str,
                                       p2n1: str, p2n2: str) -> Dict[str, sp.Basic]:
        """Calculate Y-parameters using lcapy twoport method with enhanced error handling"""
        logger.info("Using lcapy twoport method - Y-parameters")
        
        # Add explicit ground reference if not present
        needs_ground = ' 0 ' not in netlist and '\n0 ' not in netlist and netlist.split()[1:3] != ['0', '0']
        if needs_ground:
            # Add high impedance to ground from reference node
            ref_node = p1n2  # Use port 1 negative as reference
            netlist += f'\nRgnd {ref_node} 0 1e12'
            logger.info(f"Added ground reference resistor from node {ref_node}")
        
        try:
            circuit = Circuit(netlist)
            logger.debug(f"Circuit created successfully")
            
            # Create twoport representation
            twoport = circuit.twoport(p1n1, p1n2, p2n1, p2n2)
            logger.debug(f"Twoport created: ports P1({p1n1},{p1n2}), P2({p2n1},{p2n2})")
            
        except Exception as e:
            logger.error(f"Failed to create circuit or twoport: {e}")
            raise
        
        y_params = {}
        
        # Try multiple methods to extract Y-parameters
        extraction_methods = [
            ('Y matrix', lambda: twoport.Y),
            ('y matrix', lambda: twoport.y),
            ('direct access', lambda: {
                'Y11': twoport.Y11, 'Y12': twoport.Y12,
                'Y21': twoport.Y21, 'Y22': twoport.Y22
            })
        ]
        
        for method_name, method_func in extraction_methods:
            try:
                result = method_func()
                if hasattr(result, '__getitem__') and not isinstance(result, dict):
                    # Matrix-like object
                    y_params = {
                        "Y11": self.extract_symbolic_expression(result[0, 0]),
                        "Y12": self.extract_symbolic_expression(result[0, 1]),
                        "Y21": self.extract_symbolic_expression(result[1, 0]),
                        "Y22": self.extract_symbolic_expression(result[1, 1]),
                    }
                elif isinstance(result, dict):
                    # Dictionary of parameters
                    y_params = {k: self.extract_symbolic_expression(v) for k, v in result.items()}
                else:
                    continue
                    
                logger.info(f"Successfully extracted Y-parameters using {method_name}")
                break
                
            except Exception as e:
                logger.debug(f"Failed to extract Y-parameters using {method_name}: {e}")
                continue
        
        if not y_params:
            raise ValueError("Could not extract Y-parameters using any available method")
        
        return y_params

    def format_complex_eng(self, value: complex) -> str:
        """Enhanced complex number formatting with better engineering notation"""
        if not isinstance(value, complex):
            value = complex(value)
            
        real, imag = value.real, value.imag
        
        def to_eng(val: float) -> str:
            """Convert to engineering notation"""
            if abs(val) < 1e-15:
                return "0"
            
            abs_val = abs(val)
            sign = '-' if val < 0 else ''
            
            # Find appropriate engineering prefix
            prefixes = [('T', 1e12), ('G', 1e9), ('M', 1e6), ('k', 1e3), 
                       ('', 1), ('m', 1e-3), ('u', 1e-6), ('n', 1e-9), 
                       ('p', 1e-12), ('f', 1e-15)]
            
            for suffix, scale in prefixes:
                if abs_val >= scale:
                    scaled = abs_val / scale
                    if scaled < 1000:
                        return f"{sign}{scaled:.3g}{suffix}"
            
            return f"{sign}{abs_val:.3e}"
        
        # Format based on magnitude of real and imaginary parts
        real_threshold = 1e-12
        imag_threshold = 1e-12
        
        real_small = abs(real) < real_threshold
        imag_small = abs(imag) < imag_threshold
        
        if real_small and imag_small:
            return "0"
        elif real_small:
            return f"j{to_eng(imag)}"
        elif imag_small:
            return to_eng(real)
        else:
            real_str = to_eng(real)
            imag_str = to_eng(abs(imag))
            sign = '+' if imag >= 0 else '-'
            return f"{real_str} {sign} j{imag_str}"

    def evaluate_at_frequency(self, y_params: Dict[str, sp.Basic], frequency: float) -> Dict[str, complex]:
        """Evaluate symbolic Y-parameters at specific frequency with enhanced error handling"""
        omega = 2 * np.pi * frequency
        jw = sp.I * omega
        numeric_params = {}
        
        logger.info(f"Evaluating Y-parameters at f = {frequency} Hz (ω = {omega:.3e} rad/s)")
        
        for param, expr in y_params.items():
            try:
                if not isinstance(expr, sp.Basic):
                    expr = sp.sympify(expr)
                
                # Substitute s = jω
                substituted = expr.subs(self.s, jw)
                
                # Evaluate to complex number
                result = complex(substituted.evalf())
                numeric_params[param] = result
                
                # Log with engineering notation
                formatted = self.format_complex_eng(result)
                logger.info(f"{param} = {formatted} S")  # Siemens for admittance
                
            except Exception as e:
                logger.error(f"Failed to evaluate {param}: {e}")
                logger.debug(f"Expression: {expr}")
                numeric_params[param] = 0+0j
        
        return numeric_params

    def check_network_properties(self, y_params: Dict[str, complex]) -> Dict[str, Any]:
        """Check network properties like reciprocity, passivity, etc."""
        properties = {}
        
        # Reciprocity check (Y12 = Y21 for passive networks)
        reciprocity_error = abs(y_params['Y12'] - y_params['Y21'])
        properties['reciprocal'] = reciprocity_error < 1e-12
        properties['reciprocity_error'] = reciprocity_error
        
        # Stability check (real parts of Y11 and Y22 should be positive for passive networks)
        properties['y11_real_positive'] = y_params['Y11'].real > -1e-12
        properties['y22_real_positive'] = y_params['Y22'].real > -1e-12
        
        # Determinant
        det = y_params['Y11'] * y_params['Y22'] - y_params['Y12'] * y_params['Y21']
        properties['determinant'] = det
        properties['det_real_positive'] = det.real > -1e-12
        
        return properties

    def run_y_parameter(self, freq: float, p1n1: str, p1n2: str, p2n1: str, p2n2: str,
                        netlist_filename: str = 'netlist.txt') -> Dict[str, Any]:
        """Main method to run Y-parameter analysis with comprehensive error handling"""
        start_time = logger.info("Starting Y-parameter analysis")
        
        # Read netlist
        try:
            netlist_path = Path(netlist_filename)
            if not netlist_path.exists():
                return self._create_error_result(f"Netlist file not found: {netlist_filename}", freq)
                
            with open(netlist_path, 'r') as file:
                netlist_string = file.read()
            logger.info(f"Read netlist from: {netlist_filename} ({len(netlist_string)} characters)")
        except Exception as e:
            return self._create_error_result(f"Failed to read netlist: {e}", freq)
        
        # Preprocess netlist
        try:
            processed_netlist = self.preprocess_netlist(netlist_string)
            logger.debug("Netlist preprocessing completed")
        except Exception as e:
            return self._create_error_result(f"Netlist preprocessing failed: {e}", freq)
        
        # Validate ports
        try:
            valid, missing = self.validate_ports(processed_netlist, p1n1, p1n2, p2n1, p2n2)
            if not valid:
                return self._create_error_result(f"Invalid port nodes: {missing}", freq)
        except Exception as e:
            return self._create_error_result(f"Port validation failed: {e}", freq)
        
        # Calculate Y-parameters
        try:
            y_params_symbolic = self.calculate_y_parameters_twoport(
                processed_netlist, p1n1, p1n2, p2n1, p2n2)
            logger.info("Symbolic Y-parameter calculation completed")
        except Exception as e:
            logger.error(f"Y-parameter calculation failed: {e}")
            return self._create_error_result(str(e), freq)
        
        # Simplify symbolic expressions
        simplified_params = {}
        for param, expr in y_params_symbolic.items():
            try:
                simplified = sp.simplify(expr)
                simplified_params[param] = simplified
                logger.debug(f"Simplified {param}: {simplified}")
            except Exception as e:
                logger.warning(f"Failed to simplify {param}: {e}")
                simplified_params[param] = expr
        
        # Evaluate at frequency
        try:
            y_params_numeric = self.evaluate_at_frequency(simplified_params, freq)
            logger.info("Numeric evaluation completed")
        except Exception as e:
            return self._create_error_result(f"Frequency evaluation failed: {e}", freq)
        
        # Check network properties
        try:
            properties = self.check_network_properties(y_params_numeric)
            logger.info(f"Network analysis: Reciprocal={properties['reciprocal']}, "
                       f"Passive={properties['y11_real_positive'] and properties['y22_real_positive']}")
        except Exception as e:
            logger.warning(f"Property check failed: {e}")
            properties = {'reciprocal': False}
        
        return {
            "frequency": freq,
            "symbolic": {k: str(v) for k, v in simplified_params.items()},
            "numeric": y_params_numeric,
            "properties": properties,
            "method_used": "twoport_y_parameters",
            "success": True
        }

    def frequency_sweep(self, frequencies: List[float], p1n1: str, p1n2: str, 
                       p2n1: str, p2n2: str, netlist_filename: str = 'netlist.txt') -> Dict[str, Any]:
        """Perform frequency sweep analysis"""
        results = []
        
        # Calculate symbolic parameters once
        try:
            with open(netlist_filename, 'r') as file:
                netlist_string = file.read()
            processed_netlist = self.preprocess_netlist(netlist_string)
            
            valid, _ = self.validate_ports(processed_netlist, p1n1, p1n2, p2n1, p2n2)
            if not valid:
                raise ValueError("Invalid port configuration")
                
            y_params_symbolic = self.calculate_y_parameters_twoport(
                processed_netlist, p1n1, p1n2, p2n1, p2n2)
            
        except Exception as e:
            return {"error": str(e), "frequencies": frequencies, "results": []}
        
        # Evaluate at each frequency
        for freq in frequencies:
            try:
                y_params_numeric = self.evaluate_at_frequency(y_params_symbolic, freq)
                properties = self.check_network_properties(y_params_numeric)
                
                results.append({
                    "frequency": freq,
                    "numeric": y_params_numeric,
                    "properties": properties
                })
            except Exception as e:
                logger.error(f"Failed at frequency {freq}: {e}")
                continue
        
        return {
            "frequencies": frequencies,
            "symbolic": {k: str(v) for k, v in y_params_symbolic.items()},
            "results": results,
            "sweep_success": True
        }

    def _create_error_result(self, msg: str, freq: float) -> Dict[str, Any]:
        """Create standardized error result dictionary"""
        logger.error(f"Analysis failed: {msg}")
        return {
            "error": msg,
            "frequency": freq,
            "symbolic": {"Y11": "0", "Y12": "0", "Y21": "0", "Y22": "0"},
            "numeric": {"Y11": 0+0j, "Y12": 0+0j, "Y21": 0+0j, "Y22": 0+0j},
            "properties": {"reciprocal": False},
            "method_used": "failed",
            "success": False
        }

def run_y_parameter(freq: float, p1n1: str, p1n2: str, p2n1: str, p2n2: str,
                    netlist_filename: str = 'netlist.txt') -> Dict[str, Any]:
    """Convenience function to run Y-parameter analysis"""
    calculator = YParameterCalculator()
    return calculator.run_y_parameter(freq, p1n1, p1n2, p2n1, p2n2, netlist_filename)

def run_frequency_sweep(frequencies: List[float], p1n1: str, p1n2: str, p2n1: str, p2n2: str,
                       netlist_filename: str = 'netlist.txt') -> Dict[str, Any]:
    """Convenience function for frequency sweep analysis"""
    calculator = YParameterCalculator()
    return calculator.frequency_sweep(frequencies, p1n1, p1n2, p2n1, p2n2, netlist_filename)

def main():
    """Enhanced main function with examples"""
    # print("Enhanced Y-Parameter Calculator")
    # print("=" * 50)
    # print()
    # print("Y-parameters represent the admittance matrix [Y] where [I] = [Y][V]")
    # print("Y11: Input admittance at port 1 (Siemens)")
    # print("Y12: Reverse transfer admittance (Siemens)")
    # print("Y21: Forward transfer admittance (Siemens)")  
    # print("Y22: Input admittance at port 2 (Siemens)")
    # print()
    # print("Usage Examples:")
    # print("Single frequency analysis:")
    # print("  result = run_y_parameter(1000, '0', '2', '1', '3', 'netlist.txt')")
    # print()
    # print("Frequency sweep analysis:")
    # print("  freqs = [100, 1000, 10000]")
    # print("  result = run_frequency_sweep(freqs, '0', '2', '1', '3', 'netlist.txt')")
    # print()
    # print("Netlist format example:")
    # print("  R1 1 2 1k     # 1kΩ resistor")
    # print("  C1 2 0 1u     # 1μF capacitor")  
    # print("  L1 1 3 1m     # 1mH inductor")
    # print("  W1 3 0        # Wire connection")
    # print()
    # print("Supported component types: R, L, C, V, I, W")
    # print("Supported value suffixes: f, p, n, u, m, k, M, G, T")
    # print()

if __name__ == "__main__":
    main()
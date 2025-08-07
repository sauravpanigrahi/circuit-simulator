from lcapy import Circuit
import logging
import sympy as sp
import numpy as np
from typing import Dict, Any, Tuple

# Setup logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ZParameterCalculator:
    def __init__(self):
        self.s = sp.Symbol('s', complex=True)
        self.supported_components = ['R', 'C', 'L', 'V', 'I', 'W']

    def preprocess_netlist(self, netlist_string: str) -> str:
        lines = netlist_string.strip().splitlines()
        processed = []
        wire_counter = 1
        existing_names = set()
        for line in lines:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            tokens = line.split()
            if len(tokens) >= 3:
                existing_names.add(tokens[0])

        for line_num, line in enumerate(lines, 1):
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            tokens = line.split()
            if len(tokens) < 3:
                logger.warning(f"Line {line_num}: Invalid component definition: {line}")
                continue
            component_type = tokens[0][0].upper()
            if component_type == 'W':
                name, n1, n2 = tokens[:3]
                new_name = f'Rwire{wire_counter}'
                while new_name in existing_names:
                    wire_counter += 1
                    new_name = f'Rwire{wire_counter}'
                processed.append(f'{new_name} {n1} {n2} 1e-12')
                existing_names.add(new_name)
                wire_counter += 1
                logger.info(f"Converted wire {name} to small resistor {new_name}")
            elif component_type in self.supported_components:
                processed.append(line)
            else:
                logger.warning(f"Line {line_num}: Unsupported component type: {component_type}")
                processed.append(line)
        return '\n'.join(processed)

    def validate_ports(self, netlist: str, p1n1: str, p1n2: str, p2n1: str, p2n2: str) -> bool:
        nodes = set()
        for line in netlist.strip().splitlines():
            tokens = line.split()
            if len(tokens) >= 3:
                for token in tokens[1:3]:
                    try:
                        nodes.add(str(token))
                    except:
                        pass
        port_nodes = [p1n1, p1n2, p2n1, p2n2]
        missing_nodes = [node for node in port_nodes if str(node) not in nodes]
        if missing_nodes:
            logger.error(f"Port nodes not found in circuit: {missing_nodes}")
            logger.info(f"Available nodes: {sorted(nodes)}")
            return False
        return True

    def extract_symbolic_expression(self, lcapy_obj):
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

    def calculate_z_parameters_twoport(self, netlist: str, p1n1: str, p1n2: str,
                                       p2n1: str, p2n2: str) -> Dict[str, sp.Basic]:
        logger.info("Using lcapy twoport method - Z-parameters only")
        if ' 0 ' not in netlist:
            netlist += f'\nRgnd {p1n2} 0 1e12'
            logger.info("Added ground reference resistor for twoport analysis")
        circuit = Circuit(netlist)
        twoport = circuit.twoport(p1n1, p1n2, p2n1, p2n2)
        z_params = {}
        if hasattr(twoport, 'Z'):
            Z_matrix = twoport.Z
            z_params = {
                "Z11": self.extract_symbolic_expression(Z_matrix[0, 0]),
                "Z12": self.extract_symbolic_expression(Z_matrix[0, 1]),
                "Z21": self.extract_symbolic_expression(Z_matrix[1, 0]),
                "Z22": self.extract_symbolic_expression(Z_matrix[1, 1]),
                
            }
        elif hasattr(twoport, 'z'):
            z_matrix = twoport.z
            z_params = {
                "Z11": self.extract_symbolic_expression(z_matrix[0, 0]),
                "Z12": self.extract_symbolic_expression(z_matrix[0, 1]),
                "Z21": self.extract_symbolic_expression(z_matrix[1, 0]),
                "Z22": self.extract_symbolic_expression(z_matrix[1, 1])
            }
        elif hasattr(twoport, 'Z11'):
            z_params = {
                "Z11": self.extract_symbolic_expression(twoport.Z11),
                "Z12": self.extract_symbolic_expression(twoport.Z12),
                "Z21": self.extract_symbolic_expression(twoport.Z21),
                "Z22": self.extract_symbolic_expression(twoport.Z22)
            }
            
        else:
            raise ValueError("Z-parameters not found in twoport object")
        return z_params

    def format_complex_eng(self, value: complex) -> str:
        real = value.real
        imag = value.imag
        def to_eng(val):
            abs_val = abs(val)
            if abs_val == 0:
                return "0"
            suffixes = ['','k','M','G','T']
            for i, s in enumerate(suffixes):
                scaled = abs_val / (10**(3*i))
                if scaled < 1000:
                    return f"{scaled:.2f}{s}"
            return f"{abs_val:.2e}"
        if abs(real) < 1e-9:
            return f"{'-' if imag < 0 else ''}j{to_eng(imag)}"
        if abs(imag) < 1e-9:
            return f"{to_eng(real)}"
        return f"{to_eng(real)} {'-' if imag < 0 else '+'} j{to_eng(imag)}"

    def evaluate_at_frequency(self, z_params: Dict[str, sp.Basic], frequency: float) -> Dict[str, complex]:
        omega = 2 * np.pi * frequency
        jw = sp.I * omega
        numeric_params = {}
        for param, expr in z_params.items():
            try:
                if not isinstance(expr, sp.Basic):
                    expr = sp.sympify(expr)
                substituted = expr.subs(self.s, jw)
                result = complex(substituted.evalf())
                numeric_params[param] = result
                formatted = self.format_complex_eng(result)
                logger.info(f"{param} = {formatted} \u03a9")
            except Exception as e:
                logger.error(f"Failed to evaluate {param}: {e}")
                numeric_params[param] = 0+0j
        return numeric_params

    def run_z_parameter(self, freq: float, p1n1: str, p1n2: str, p2n1: str, p2n2: str,
                        netlist_filename: str = 'netlist.txt') -> Dict[str, Any]:
        try:
            with open(netlist_filename, 'r') as file:
                netlist_string = file.read()
            logger.info(f"Read netlist from: {netlist_filename}")
        except FileNotFoundError:
            return self._create_error_result(f"Netlist file not found: {netlist_filename}", freq)
        processed_netlist = self.preprocess_netlist(netlist_string)
        if not self.validate_ports(processed_netlist, p1n1, p1n2, p2n1, p2n2):
            return self._create_error_result("Invalid port nodes", freq)
        try:
            z_params_symbolic = self.calculate_z_parameters_twoport(processed_netlist, p1n1, p1n2, p2n1, p2n2)
        except Exception as e:
            return self._create_error_result(str(e), freq)
        for param in z_params_symbolic:
            try:
                z_params_symbolic[param] = sp.simplify(z_params_symbolic[param])
            except:
                pass
        z_params_numeric = self.evaluate_at_frequency(z_params_symbolic, freq)
        reciprocal = abs(z_params_numeric['Z12'] - z_params_numeric['Z21']) < 1e-12
        return {
            "frequency": freq,
            "symbolic": {k: str(v) for k, v in z_params_symbolic.items()},
            "numeric": z_params_numeric,
            "reciprocal": reciprocal,
            "method_used": "twoport_z_only"
        }

    def _create_error_result(self, msg: str, freq: float) -> Dict[str, Any]:
        return {
            "error": msg,
            "frequency": freq,
            "symbolic": {"Z11": "0", "Z12": "0", "Z21": "0", "Z22": "0"},
            "numeric": {"Z11": 0+0j, "Z12": 0+0j, "Z21": 0+0j, "Z22": 0+0j},
            "reciprocal": False,
            "method_used": "failed"
        }

def run_z_parameter(freq: float, p1n1: str, p1n2: str, p2n1: str, p2n2: str,
                    netlist_filename: str = 'netlist.txt') -> Dict[str, Any]:
    calculator = ZParameterCalculator()
    return calculator.run_z_parameter(freq, p1n1, p1n2, p2n1, p2n2, netlist_filename)

def main():
    print("Z-Parameter Calculator")
    print("Usage: z_params = run_z_parameter(frequency, p1n1, p1n2, p2n1, p2n2)")
    print("Make sure your netlist is in 'netlist.txt' or specify another file")

if __name__ == "__main__":
    main()

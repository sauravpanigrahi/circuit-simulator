import matplotlib
matplotlib.use('Agg')  # Set the backend before importing pyplot

from lcapy import Circuit
import numpy as np
from matplotlib.pyplot import subplots, savefig, tight_layout, close
import logging
import os
import sympy as sp

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def preprocess_netlist(netlist_string):
    lines = netlist_string.strip().splitlines()
    processed = []

    for line in lines:
        line = line.strip()
        if not line or line.startswith('#'):  # Skip empty lines and comments
            continue
            
        tokens = line.split()
        if len(tokens) >= 3:
            if tokens[0].startswith('W'):
                # Convert wire to small resistor
                name, n1, n2 = tokens[0], tokens[1], tokens[2]
                processed.append(f'R{name} {n1} {n2} 0.000001')
            elif tokens[0].startswith('V') and len(tokens) >= 4:
                # Fix voltage source - convert AC to step for transient analysis
                name, n1, n2 = tokens[0], tokens[1], tokens[2]
                if 'AC' in tokens[3].upper():
                    amplitude = tokens[4] if len(tokens) > 4 else '1'
                    processed.append(f'{name} {n1} {n2} step {amplitude}')
                    logger.info(f"Converted ACP Source {name} to step source")
                else:
                    processed.append(line)
            else:
                processed.append(line)
        else:
            processed.append(line)

    return '\n'.join(processed)

def safe_transient_response(component_attr, t, component_name, attr_type):
    """Safely compute transient response with error handling for symbolic issues"""
    try:
        # Get the transient response
        response = component_attr.transient_response(t)
        
        # Check if response contains undefined symbols
        if hasattr(response, 'free_symbols'):
            undefined_symbols = response.free_symbols
            if undefined_symbols:
                logger.warning(f"Response for {component_name} {attr_type} contains undefined symbols: {undefined_symbols}")
                return None
        
        # Convert to numpy array if it's symbolic
        if hasattr(response, 'evalf'):
            try:
                response_numeric = np.array([complex(response.subs(sp.symbols('t'), t_val).evalf()) for t_val in t])
                # Take real part if it's complex but imaginary part is negligible
                if np.allclose(response_numeric.imag, 0):
                    response_numeric = response_numeric.real
                return response_numeric
            except Exception as e:
                logger.error(f"Error converting symbolic response to numeric for {component_name}: {e}")
                return None
        
        # If it's already numeric, return as is
        return np.array(response)
        
    except Exception as e:
        logger.error(f"Error computing {attr_type} response for {component_name}: {e}")
        return None

def run_transient_analysis(netlist_filename='netlist.txt'):
    try:
        # Check if netlist file exists
        if not os.path.exists(netlist_filename):
            logger.error(f"Netlist file '{netlist_filename}' not found!")
            return False
        
        # Create output directory if it doesn't exist
        os.makedirs('static', exist_ok=True)
        
        t = np.linspace(0, 0.05, 1000)  # Time range for the analysis

        # Read the netlist string from the file
        with open(netlist_filename, 'r') as file:
            netlist_string = file.read()

        logger.info("Original netlist:\n%s", netlist_string)
        netlist_string = preprocess_netlist(netlist_string)
        logger.info("Processed netlist:\n%s", netlist_string)

        # Define the circuit with the read netlist
        try:
            cct = Circuit(netlist_string)
            logger.info("Circuit created successfully")
            logger.info(f"Circuit elements: {list(cct.elements.keys())}")
        except Exception as e:
            logger.error(f"Error creating circuit: {e}")
            return False

        # Create figure for voltage plot
        fig, ax = subplots(figsize=(12, 7))
        voltage_plots_created = False

        # Handle arbitrary numbers of resistors, capacitors, and inductors
        for component_type in ['R', 'L', 'C']:
            index = 1
            while True:
                component_name = f"{component_type}{index}"
                if component_name not in cct.elements:
                    break

                try:
                    # Get component
                    component = getattr(cct, component_name)
                    
                    # Safe transient response of voltage
                    v_response = safe_transient_response(component.V, t, component_name, 'voltage')
                    
                    if v_response is not None and len(v_response) > 0:
                        linestyle = '--' if component_type == 'L' else ':' if component_type == 'C' else '-'
                        ax.plot(t, v_response, label=f'V{component_name} ({component_type})', 
                               linewidth=3, linestyle=linestyle)
                        voltage_plots_created = True
                        logger.info(f"Voltage plot created for {component_name}")
                    else:
                        logger.warning(f"No valid voltage response for {component_name}")
                    
                except Exception as e:
                    logger.error(f"Error plotting voltage for {component_name}: {e}")

                index += 1

        if voltage_plots_created:
            # Plot settings for Voltage
            ax.set_xlabel('Time (s)', fontsize=12)
            ax.set_ylabel('Voltage (V)', fontsize=12)
            ax.set_title('Transient Analysis - Voltage Response', fontsize=14)
            ax.grid(True, alpha=0.3)
            ax.legend(fontsize=10)
            tight_layout()
            
            try:
                savefig('static/transient_analysis-voltage.png', dpi=300, bbox_inches='tight')
                logger.info("Voltage plot saved successfully")
            except Exception as e:
                logger.error(f"Error saving voltage plot: {e}")
        else:
            logger.warning("No voltage plots were created")
        
        # Close the figure to free memory
        close(fig)

        # Create figure for current plot
        fig, ax = subplots(figsize=(12, 8))
        current_plots_created = False

        # Handle arbitrary numbers of resistors, capacitors, and inductors
        for component_type in ['R', 'L', 'C']:
            index = 1
            while True:
                component_name = f"{component_type}{index}"
                if component_name not in cct.elements:
                    break
                
                try:
                    # Get component
                    component = getattr(cct, component_name)
                    
                    # Safe transient response of current
                    i_response = safe_transient_response(component.I, t, component_name, 'current')
                    
                    if i_response is not None and len(i_response) > 0:
                        linestyle = '--' if component_type == 'L' else ':' if component_type == 'C' else '-'
                        ax.plot(t, i_response, label=f'I{component_name} ({component_type})', 
                               linewidth=3, linestyle=linestyle)
                        current_plots_created = True
                        logger.info(f"Current plot created for {component_name}")
                    else:
                        logger.warning(f"No valid current response for {component_name}")
                    
                except Exception as e:
                    logger.error(f"Error plotting current for {component_name}: {e}")

                index += 1

        if current_plots_created:
            # Plot settings for Current
            ax.set_xlabel('Time (s)', fontsize=14)
            ax.set_ylabel('Current (A)', fontsize=14)
            ax.set_title('Transient Analysis - Current Response', fontsize=14)
            ax.grid(True, alpha=0.3)
            ax.legend(fontsize=10)
            tight_layout()
            
            try:
                savefig('static/transient_analysis-current.png', dpi=300, bbox_inches='tight')
                logger.info("Current plot saved successfully")
            except Exception as e:
                logger.error(f"Error saving current plot: {e}")
        else:
            logger.warning("No current plots were created")
        
        # Close the figure to free memory
        close(fig)
        
        # Return True only if at least one plot was created
        return voltage_plots_created or current_plots_created
        
    except Exception as e:
        logger.error(f"Unexpected error in run_transient_analysis: {e}")
        return False

if __name__ == "__main__":
    # Run with your actual netlist file
    success = run_transient_analysis('netlist.txt')
    if success:
        print("At least one plot was generated successfully!")
    else:
        print("No plots were generated. Check the logs for details.")
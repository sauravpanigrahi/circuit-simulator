from matplotlib import pyplot as plt
from matplotlib.pyplot import figure, show, xlabel, ylabel, legend, subplots, savefig
from lcapy import *
from sympy import *
import cmath
from cmath import polar
import numpy as np
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def preprocess_netlist(netlist_string):
    """
    Converts wire definitions (e.g., W1 0 5) to 0-ohm resistors (e.g., RW1 0 5 0)
    """
    lines = netlist_string.strip().splitlines()
    processed = []

    for line in lines:
        tokens = line.split()
        if len(tokens) == 3 and tokens[0].startswith('W'):
            name, n1, n2 = tokens
            # Convert to resistor with 0 Ohm
            processed.append(f'R{name} {n1} {n2} 0')
        else:
            processed.append(line)

    return '\n'.join(processed)

def run_ac_analysis(netlist_filename='netlist.txt'):
    try:
        # Read the netlist string from the file
        with open(netlist_filename, 'r') as file:
            netlist_string = file.read()
        
        logger.info("Original netlist:\n%s", netlist_string)

        # Preprocess the netlist to handle wires
        netlist_string = preprocess_netlist(netlist_string)
        logger.info("Processed netlist:\n%s", netlist_string)

        # Define the circuit with the read netlist
        try:
            cct = Circuit(netlist_string)
            logger.info("Circuit created successfully")
        except Exception as e:
            logger.error(f"Error creating circuit: {e}")
            return {}, {}

        # Perform AC analysis
        try:
            cct_ac = cct.ac()
            logger.info("AC analysis completed")
        except Exception as e:
            logger.error(f"Error during AC analysis: {e}")
            return {}, {}

        # Helper function to evaluate complex expressions
        def evaluate_complex_expression(expression):
            safe_dict = {
                'sqrt': cmath.sqrt,
                'exp': cmath.exp,
                'atan': cmath.atan,
                'pi': cmath.pi,
                'I': 1j,  # Use I for imaginary unit
            }
            try:
                # Clean up the expression and evaluate
                expr = str(expression).replace('j', 'I')
                result = eval(expr, {"__builtins__": None}, safe_dict)
                logger.info(f"Successfully evaluated expression '{expr}' = {result}")
                return complex(result)
            except Exception as e:
                logger.warning(f"Error evaluating expression '{expression}': {e}")
                return None
        
        # Lists for storing phasor data and component labels
        v_phasors = []
        v_labels = []
        i_phasors = []
        i_labels = []

        # Helper function to extract and store phasors
        def add_phasors(component):
            try:
                # Voltage phasor
                v_phasor_expr = str(cct_ac[component].v.phasor())
                logger.info(f"Voltage phasor expression for {component}: {v_phasor_expr}")
                v_phasor = evaluate_complex_expression(v_phasor_expr)
                if v_phasor is not None:
                    magnitude, angle = polar(v_phasor)
                    v_phasors.append((magnitude, angle))
                    v_labels.append(f'V_{component}')
                    logger.info(f"Added voltage phasor for {component}: {magnitude}∠{np.degrees(angle)}°")
                
                # Current phasor
                i_phasor_expr = str(cct_ac[component].i.phasor())
                logger.info(f"Current phasor expression for {component}: {i_phasor_expr}")
                i_phasor = evaluate_complex_expression(i_phasor_expr)
                if i_phasor is not None:
                    magnitude, angle = polar(i_phasor)
                    i_phasors.append((magnitude, angle))
                    i_labels.append(f'I_{component}')
                    logger.info(f"Added current phasor for {component}: {magnitude}∠{np.degrees(angle)}°")
            except Exception as e:
                logger.error(f"Error processing component {component}: {e}")

        # Only include linear components for AC analysis
        linear_components = ['A', 'V', 'R', 'L', 'C', 'ACSource']
        
        for component_type_prefix in linear_components:
            index = 1
            while True:
                component_name = f"{component_type_prefix}{index}"
                if component_name not in cct_ac.elements:
                    break
                logger.info(f"Processing component: {component_name}")
                add_phasors(component_name)
                index += 1

        # Plotting on polar projection for voltages
        fig = plt.figure()
        ax = fig.add_subplot(111, polar=True)
        
        res_voltages = {}
        res_current = {}
        
        for (magnitude, angle), label in zip(v_phasors, v_labels):
            annotation = f'{label}: {magnitude:.2f}∠{np.degrees(angle):.0f}°'
            logger.info(annotation)
            res_voltages[label] = f'{magnitude:.2f}∠{np.degrees(angle):.0f}°'
            ax.plot([0, angle], [0, magnitude], label=annotation)

        # Enhance the voltage plot
        ax.set_yticklabels([])
        ax.legend(bbox_to_anchor=(0,0,1,1), bbox_transform=fig.transFigure)
        plt.savefig('static/ac_analysis_voltage_phasor.png')
        plt.close()

        # Plotting on polar projection for currents
        fig = plt.figure()
        ay = fig.add_subplot(111, polar=True)
        
        for (magnitude, angle), label in zip(i_phasors, i_labels):
            annotation = f'{label}: {magnitude:.2f}∠{np.degrees(angle):.0f}°'
            logger.info(annotation)
            res_current[label] = f'{magnitude:.2f}∠{np.degrees(angle):.0f}°'
            
            ay.plot([0, angle], [0, magnitude], label=annotation)

        # Enhance the current plot
        ay.set_yticklabels([])
        ay.legend(bbox_to_anchor=(0,0,1,1), bbox_transform=fig.transFigure)
        plt.savefig('static/ac_analysis_current_phasor.png')
        plt.close()

        logger.info("Final results - Voltages: %s", res_voltages)
        logger.info("Final results - Currents: %s", res_current)
        
        return res_voltages, res_current

    except Exception as e:
        logger.error(f"Unexpected error in AC analysis: {e}")
        return {}, {}

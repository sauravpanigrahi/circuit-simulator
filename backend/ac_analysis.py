from matplotlib import pyplot as plt
from matplotlib.pyplot import figure, show, xlabel, ylabel, legend, subplots, savefig
from lcapy import *
from sympy import sympify, pi, I
from cmath import polar
import numpy as np
import logging
import re
import math

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
        tokens = line.split()
        if len(tokens) == 3 and tokens[0].startswith('W'):
            name, n1, n2 = tokens
            processed.append(f'R{name} {n1} {n2} 0.000001')
        else:
            processed.append(line)

    return '\n'.join(processed)

def convert_ac_sources(netlist):
    ac_pattern = re.compile(r'^(V\d+)\s+(\d+)\s+(\d+)\s+AC\s+([0-9.]+)\s+([0-9.]+)$', re.IGNORECASE)
    lines = netlist.strip().splitlines()
    new_lines = []

    for line in lines:
        match = ac_pattern.match(line)
        if match:
            name, n1, n2, mag, phase = match.groups()
            radians = float(phase) * math.pi / 180
            complex_phasor = float(mag) * np.exp(1j * radians)
            real_part = complex_phasor.real
            imag_part = complex_phasor.imag
            expr = f'{name} {n1} {n2} ac {{{real_part:.6f} + {imag_part:.6f}j}} 0 omega_0'
            new_lines.append(expr)
        else:
            new_lines.append(line)

    return "\n".join(new_lines)

def evaluate_complex_expression(expression, omega_val):
    try:
        expr = sympify(expression.replace('j', 'I'))
        result = expr.subs({'omega_0': omega_val, 'pi': pi, 'I': I}).evalf()
        logger.info(f"Successfully evaluated: {expression} → {result}")
        return complex(result)
    except Exception as e:
        logger.warning(f"Failed to evaluate: {expression} → {e}")
        return None

def run_ac_analysis(netlist_filename='netlist.txt', freq=1000):
    try:
        with open(netlist_filename, 'r') as file:
            netlist_string = file.read()

        logger.info("Original netlist:\n%s", netlist_string)
        netlist_string = preprocess_netlist(netlist_string)
        netlist_string = convert_ac_sources(netlist_string)
        logger.info("Processed netlist:\n%s", netlist_string)

        try:
            cct = Circuit(netlist_string)
            logger.info("Circuit created successfully")
        except Exception as e:
            logger.error(f"Error creating circuit: {e}")
            return {}, {}

        try:
            cct_ac = cct.ac()
            logger.info("AC analysis completed")
            logger.info(f"AC analysis results: {cct_ac}")
        except Exception as e:
            logger.error(f"Error during AC analysis: {e}")
            return {}, {}

        omega_val = 2 * np.pi * freq
        v_phasors, v_labels = [], []
        i_phasors, i_labels = [] , []

        def add_phasors(component):
            try:
                v_expr = str(cct_ac[component].v.phasor())
                logger.info(f"Voltage phasor expression for {component}: {v_expr}")
                v_phasor = evaluate_complex_expression(v_expr, omega_val)
                if v_phasor:
                    mag, ang = polar(v_phasor)
                    v_phasors.append((mag, ang))
                    v_labels.append(f'V_{component}')

                i_expr = str(cct_ac[component].i.phasor())
                logger.info(f"Current phasor expression for {component}: {i_expr}")
                i_phasor = evaluate_complex_expression(i_expr, omega_val)
                if i_phasor:
                    mag, ang = polar(i_phasor)
                    i_phasors.append((mag, ang))
                    i_labels.append(f'I_{component}')
            except Exception as e:
                logger.error(f"Error processing {component}: {e}")

        linear_components = ['A', 'V', 'R', 'L', 'C', 'ACSource']
        for prefix in linear_components:
            index = 1
            while True:
                name = f"{prefix}{index}"
                if name not in cct_ac.elements:
                    break
                logger.info(f"Processing component: {name}")
                add_phasors(name)
                index += 1

        fig = plt.figure(figsize=(8, 6))
        ax = fig.add_subplot(111, polar=True)
        res_voltages = {}
        max_v_mag = max((m for m, _ in v_phasors), default=1)

        for (mag, ang), label in zip(v_phasors, v_labels):
            norm_mag = mag / max_v_mag
            text = f'{label}: {mag:.6f}∠{np.degrees(ang):.0f}°'
            ax.plot([0, ang], [0, norm_mag], marker='o', label=text)
            res_voltages[label] = text.split(": ")[1]

        ax.set_yticklabels([])
        ax.set_rgrids([0.2, 0.5, 0.8, 1.0], angle=45)
        ax.legend(bbox_to_anchor=(1.1, 1.05))
        plt.title("Voltage Phasor", fontsize=14, fontweight='bold')
        plt.savefig('static/ac_analysis_voltage_phasor.png', bbox_inches='tight')
        plt.close()

        fig = plt.figure(figsize=(8, 6))
        ay = fig.add_subplot(111, polar=True)
        res_currents = {}
        max_i_mag = max((m for m, _ in i_phasors), default=1)

        for (mag, ang), label in zip(i_phasors, i_labels):
            norm_mag = mag / max_i_mag
            text = f'{label}: {mag:.6f}∠{np.degrees(ang):.0f}°'
            ay.plot([0, ang], [0, norm_mag], marker='o', label=text)
            res_currents[label] = text.split(": ")[1]

        ay.set_yticklabels([])
        ay.set_rgrids([0.2, 0.5, 0.8, 1.0], angle=45)
        ay.legend(bbox_to_anchor=(1.1, 1.05))
        plt.title("Current Phasor", fontsize=14, fontweight='bold')
        plt.savefig('static/ac_analysis_current_phasor.png', bbox_inches='tight')
        plt.close()

        logger.info("Final results - Voltages: %s", res_voltages)
        logger.info("Final results - Currents: %s", res_currents)

        return res_voltages, res_currents

    except Exception as e:
        logger.error(f"Unexpected error in AC analysis: {e}")
        return {}, {}

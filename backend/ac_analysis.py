import matplotlib
matplotlib.use('Agg')
from matplotlib import pyplot as plt
from matplotlib.pyplot import figure, show, xlabel, ylabel, legend, subplots, savefig
from lcapy import *
from sympy import sympify, pi, I
from cmath import polar
import numpy as np
import logging
import re
import math
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def _static_dir(path_segment: str = ""):
    base_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
    os.makedirs(base_dir, exist_ok=True)
    return os.path.join(base_dir, path_segment) if path_segment else base_dir

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

def plot_time_domain(phasors, labels, title, filename, freq):
    """
    Plot time domain representation of phasors with component-specific line styles
    and cosine expressions in the legend.
    """
    import matplotlib.pyplot as plt
    import numpy as np

    fig, ax = plt.subplots(figsize=(12, 8))
    
    # Time vector for two complete cycles
    T = 1.0 / freq
    t = np.linspace(0, 2 * T, 1000)
    omega = 2 * np.pi * freq

    # Define line styles for known component types
    line_styles = {
        'R': '-',     # Solid
        'L': ':',     # Dotted
        'C': '--',    # Dashed
        'V': '-.',    # Dash-dot
    }

    colors = plt.cm.tab10(np.linspace(0, 1, len(phasors)))

    for i, ((mag, phase), label) in enumerate(zip(phasors, labels)):
        signal = mag * np.cos(omega * t + phase)

        # Extract component type: R, L, C, V
        comp_type = label.split('_')[1][0] if '_' in label else label[0]
        linestyle = line_styles.get(comp_type, '-')  # fallback to solid

        # Build readable cosine expression
        deg_phase = np.degrees(phase)
        expression = f'{mag:.2f}·cos(2π·{freq}·t + {deg_phase:.1f}°)'

        # Plot the signal
        ax.plot(
            t * 1000, signal, 
            label=f'{label}: {expression}', 
            color=colors[i], 
            linewidth=2, 
            linestyle=linestyle
        )

        # Optional: annotate the signal inline (adjust index/position if needed)
        if len(t) > 150:
            offset = 0.15 * mag  # or any value depending on signal range

            ax.annotate(expression,
                        xy=(t[160] * 1000, signal[160]),
                        xytext=(t[160] * 1000, signal[160] + offset),  # shift upward
                        textcoords='data',
                        fontsize=10,
                        color=colors[i],
                        ha='center',
                        bbox=dict(boxstyle="round,pad=0.3", fc="white", ec=colors[i], lw=1, alpha=0.8),
                        arrowprops=dict(arrowstyle="->", color=colors[i], lw=1, alpha=0.6))

    # Axes labels and title
    ax.set_xlabel('Time (ms)', fontsize=12)
    ax.set_ylabel('Amplitude', fontsize=12)
    ax.set_title(f'{title} - Time Domain Representation', fontsize=14, fontweight='bold')
    ax.grid(True, alpha=0.3)
    ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left', fontsize=9)

    # Period markers
    period_ms = T * 1000
    for i in range(3):
        ax.axvline(x=i * period_ms, color='red', linestyle='--', alpha=0.5)

    plt.tight_layout()
    # Resolve filename relative to backend/static if needed
    out_path = _static_dir(os.path.basename(filename)) if filename.startswith('static') else filename
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    plt.savefig(out_path, bbox_inches='tight', dpi=300)
    plt.close()


def run_ac_analysis(freq, netlist_filename='netlist.txt'):
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

        # Plot phasor diagrams (original code)
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
        plt.title("Voltage Phasor Diagram", fontsize=14, fontweight='bold')
        plt.savefig(_static_dir('ac_analysis_voltage_phasor.png'), bbox_inches='tight')
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
        plt.title("Current Phasor Diagram", fontsize=14, fontweight='bold')
        plt.savefig(_static_dir('ac_analysis_current_phasor.png'), bbox_inches='tight')
        plt.close()

        # Plot time domain representations
        if v_phasors:
            plot_time_domain(v_phasors, v_labels, "Voltage", 
                           _static_dir('ac_analysis_voltage_time_domain.png'), freq)
            logger.info("Voltage time domain plot saved")

        if i_phasors:
            plot_time_domain(i_phasors, i_labels, "Current", 
                           _static_dir('ac_analysis_current_time_domain.png'), freq)
            logger.info("Current time domain plot saved")

        # Combined time domain plot
        if v_phasors and i_phasors:
            fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 10))
            
            T = 1.0 / freq
            t = np.linspace(0, 2*T, 1000)
            omega = 2 * np.pi * freq
            
            # Voltage subplot
            colors_v = plt.cm.tab10(np.linspace(0, 1, len(v_phasors)))
            for i, ((mag, phase), label) in enumerate(zip(v_phasors, v_labels)):
                signal = mag * np.cos(omega * t + phase)
                ax1.plot(t * 1000, signal, label=f'{label}: {mag:.4f}∠{np.degrees(phase):.1f}°', 
                        color=colors_v[i], linewidth=2)
            
            ax1.set_ylabel('Voltage (V)', fontsize=12)
            ax1.set_title('Voltage Time Domain', fontsize=12, fontweight='bold')
            ax1.grid(True, alpha=0.3)
            ax1.legend()
            
            # Current subplot
            colors_i = plt.cm.tab10(np.linspace(0, 1, len(i_phasors)))
            for i, ((mag, phase), label) in enumerate(zip(i_phasors, i_labels)):
                signal = mag * np.cos(omega * t + phase)
                ax2.plot(t * 1000, signal, label=f'{label}: {mag:.4f}∠{np.degrees(phase):.1f}°', 
                        color=colors_i[i], linewidth=2)
            
            ax2.set_xlabel('Time (ms)', fontsize=12)
            ax2.set_ylabel('Current (A)', fontsize=12)
            ax2.set_title('Current Time Domain', fontsize=12, fontweight='bold')
            ax2.grid(True, alpha=0.3)
            ax2.legend()
            
            # Add period markers
            period_ms = T * 1000
            for i in range(3):
                ax1.axvline(x=i*period_ms, color='red', linestyle='--', alpha=0.5)
                ax2.axvline(x=i*period_ms, color='red', linestyle='--', alpha=0.5)
            
            plt.tight_layout()
            plt.savefig(_static_dir('ac_analysis_combined_time_domain.png'), bbox_inches='tight', dpi=300)
            plt.close()
            logger.info("Combined time domain plot saved")

        logger.info("Final results - Voltages: %s", res_voltages)
        logger.info("Final results - Currents: %s", res_currents)

        return res_voltages, res_currents

    except Exception as e:
        logger.error(f"Unexpected error in AC analysis: {e}")
        return {}, {}

# Example usage
if __name__ == "__main__":
    # Run analysis with existing netlist file
    voltages, currents = run_ac_analysis(freq=1000)
    print("Voltages:", voltages)
    print("Currents:", currents)
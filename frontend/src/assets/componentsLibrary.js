export const components = {
    W:{
        id: 1,
        name: 'W',
        component: (svg, lineId, setSelectedLine, showLineCurrent, hideLineCurrent, handleLineDoubleClick, x1, x2, y1, y2) => (
            svg
            .append("line")
            .attr("id", lineId)
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", "black")
            .attr("stroke-width", "2")
            .on("click", () => setSelectedLine(lineId))
        )
    },
    R: {
        id: 2,
        name: 'R',
        component: (svg, lineId, setSelectedLine, handleLineDoubleClick, showLineCurrent, hideLineCurrent, x1, x2, y1, y2) => {
            // Calculate midpoint and dimensions
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            
            // Calculate the angle of the line
            const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
            
            // Calculate the total line length
            const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            const halfLength = lineLength / 2;
            
            // Resistor zigzag dimensions
            const zigzagWidth = 30; // Total width of the zigzag pattern
            const zigzagHeight = 8; // Height of each peak/valley
            const numPeaks = 6; // Number of peaks in the zigzag
            const peakWidth = zigzagWidth / numPeaks;
            
            // Create group for resistor
            const resistorGroup = svg.append("g")
                .attr("id", lineId)
                .style("cursor", "pointer")
                .on("click", () => setSelectedLine(lineId))
                .on("dblclick", () => handleLineDoubleClick(lineId))
                .on("mouseover", (e) => showLineCurrent(e, lineId))
                .on("mouseout", () => hideLineCurrent());
            
            // Create a group for the rotated resistor
            const rotatedGroup = resistorGroup.append("g")
                .attr("transform", `translate(${midX}, ${midY}) rotate(${angle})`);
            
            // Draw connecting lines (horizontal in local coordinate system)
            rotatedGroup.append("line")
                .attr("x1", -halfLength)
                .attr("y1", 0)
                .attr("x2", -zigzagWidth/2)
                .attr("y2", 0)
                .attr("stroke", "black")
                .attr("stroke-width", 2);
            
            rotatedGroup.append("line")
                .attr("x1", zigzagWidth/2)
                .attr("y1", 0)
                .attr("x2", halfLength)
                .attr("y2", 0)
                .attr("stroke", "black")
                .attr("stroke-width", 2);
            
            // Create zigzag path
            let zigzagPath = `M ${-zigzagWidth/2} 0`;
            for (let i = 0; i < numPeaks; i++) {
                const x = -zigzagWidth/2 + (i + 0.5) * peakWidth;
                const y = (i % 2 === 0) ? -zigzagHeight : zigzagHeight;
                zigzagPath += ` L ${x} ${y}`;
                
                const nextX = -zigzagWidth/2 + (i + 1) * peakWidth;
                zigzagPath += ` L ${nextX} 0`;
            }
            
            // Draw the zigzag resistor pattern
            rotatedGroup.append("path")
                .attr("d", zigzagPath)
                .attr("stroke", "black")
                .attr("stroke-width", 2)
                .attr("stroke-linejoin", "round")
                .attr("fill", "none");
            
            // Add polarity markings that rotate with the component
            // Determine polarity based on line direction (x1,y1) -> (x2,y2)
            // Left side (closer to x1,y1) gets negative, right side (closer to x2,y2) gets positive
            
            // Calculate positions for better visibility in all orientations
            const polarityDistance = 20; // Distance from resistor body
            const verticalOffset = -8; // Shift upward for better visibility
            
            rotatedGroup.append("text")
                .attr("x", -zigzagWidth/2 - polarityDistance)
                .attr("y", verticalOffset)
                .attr("text-anchor", "middle")
                .attr("font-size", "18px")
                .attr("font-weight", "bold")
                .attr("font-family", "Arial")
                .attr("fill", "white")
                .attr("stroke", "black")
                .attr("stroke-width", "0.5")
                .text("-");
            
            rotatedGroup.append("text")
                .attr("x", zigzagWidth/2 + polarityDistance)
                .attr("y", verticalOffset)
                .attr("text-anchor", "middle")
                .attr("font-size", "18px")
                .attr("font-weight", "bold")
                .attr("font-family", "Arial")
                .attr("fill", "white")
                .attr("stroke", "black")
                .attr("stroke-width", "0.5")
                .text("+");
            
            return resistorGroup;
        }
    },
    C: {
        id: 3,
        name: 'C',
        component: (svg, lineId, setSelectedLine, handleLineDoubleClick, showLineCurrent, hideLineCurrent, x1, x2, y1, y2) => {
            // Calculate midpoint and dimensions
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            
            // Calculate the angle of the line
            const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
            
            // Calculate the total line length
            const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            const halfLength = lineLength / 2;
            
            // Capacitor plate dimensions
            const plateGap = 6; // Gap between plates
            const plateHeight = 20; // Height of each plate
            
            // Create group for capacitor
            const capacitorGroup = svg.append("g")
                .attr("id", lineId)
                .style("cursor", "pointer")
                .on("click", () => setSelectedLine(lineId))
                .on("dblclick", () => handleLineDoubleClick(lineId))
                .on("mouseover", (e) => showLineCurrent(e, lineId))
                .on("mouseout", () => hideLineCurrent());
            
            // Create a group for the rotated capacitor
            const rotatedGroup = capacitorGroup.append("g")
                .attr("transform", `translate(${midX}, ${midY}) rotate(${angle})`);
            
            // Draw connecting lines
            rotatedGroup.append("line")
                .attr("x1", -halfLength)
                .attr("y1", 0)
                .attr("x2", -plateGap/2)
                .attr("y2", 0)
                .attr("stroke", "black")
                .attr("stroke-width", 2);
            
            rotatedGroup.append("line")
                .attr("x1", plateGap/2)
                .attr("y1", 0)
                .attr("x2", halfLength)
                .attr("y2", 0)
                .attr("stroke", "black")
                .attr("stroke-width", 2);
            
            // Draw capacitor plates
            rotatedGroup.append("line")
                .attr("x1", -plateGap/2)
                .attr("y1", -plateHeight/2)
                .attr("x2", -plateGap/2)
                .attr("y2", plateHeight/2)
                .attr("stroke", "black")
                .attr("stroke-width", 3);
            
            rotatedGroup.append("line")
                .attr("x1", plateGap/2)
                .attr("y1", -plateHeight/2)
                .attr("x2", plateGap/2)
                .attr("y2", plateHeight/2)
                .attr("stroke", "black")
                .attr("stroke-width", 3);
            
            // Add polarity markings that rotate with the component
            // Determine polarity based on line direction (x1,y1) -> (x2,y2)
            // Left plate (closer to x1,y1) gets negative, right plate (closer to x2,y2) gets positive
            
            // Calculate positions for better visibility in all orientations
            const polarityDistance = 20; // Distance from plates
            const verticalOffset = -8; // Shift upward for better visibility
            
            rotatedGroup.append("text")
                .attr("x", -plateGap/2 - polarityDistance)
                .attr("y", verticalOffset)
                .attr("text-anchor", "middle")
                .attr("font-size", "18px")
                .attr("font-weight", "bold")
                .attr("font-family", "Arial")
                .attr("fill", "white")
                .attr("stroke", "black")
                .attr("stroke-width", "0.5")
                .text("-");
            
            rotatedGroup.append("text")
                .attr("x", plateGap/2 + polarityDistance)
                .attr("y", verticalOffset)
                .attr("text-anchor", "middle")
                .attr("font-size", "18px")
                .attr("font-weight", "bold")
                .attr("font-family", "Arial")
                .attr("fill", "white")
                .attr("stroke", "black")
                .attr("stroke-width", "0.5")
                .text("+");
            
            return capacitorGroup;
        }
    },
    
    L: {
        id: 4,
        name: 'L',
        component: (svg, lineId, setSelectedLine, handleLineDoubleClick, showLineCurrent, hideLineCurrent, x1, x2, y1, y2) => {
            // Calculate midpoint and dimensions
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            
            // Calculate the angle of the line
            const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
            
            // Calculate the total line length
            const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            const halfLength = lineLength / 2;
            
            // Inductor coil dimensions
            const coilWidth = 40;
            const coilHeight = 12;
            const numCoils = 4;
            
            // Create group for inductor
            const inductorGroup = svg.append("g")
                .attr("id", lineId)
                .style("cursor", "pointer")
                .on("click", () => setSelectedLine(lineId))
                .on("dblclick", () => handleLineDoubleClick(lineId))
                .on("mouseover", (e) => showLineCurrent(e, lineId))
                .on("mouseout", () => hideLineCurrent());
            
            // Create a group for the rotated inductor
            const rotatedGroup = inductorGroup.append("g")
                .attr("transform", `translate(${midX}, ${midY}) rotate(${angle})`);
            
            // Draw connecting lines
            rotatedGroup.append("line")
                .attr("x1", -halfLength)
                .attr("y1", 0)
                .attr("x2", -coilWidth/2)
                .attr("y2", 0)
                .attr("stroke", "black")
                .attr("stroke-width", 2);
            
            rotatedGroup.append("line")
                .attr("x1", coilWidth/2)
                .attr("y1", 0)
                .attr("x2", halfLength)
                .attr("y2", 0)
                .attr("stroke", "black")
                .attr("stroke-width", 2);
            
            // Draw inductor coils
            let coilPath = `M ${-coilWidth/2} 0`;
            const coilStep = coilWidth / numCoils;
            
            for (let i = 0; i < numCoils; i++) {
                const x = -coilWidth/2 + i * coilStep;
                coilPath += ` A ${coilStep/2} ${coilHeight/2} 0 0 1 ${x + coilStep} 0`;
            }
            
            rotatedGroup.append("path")
                .attr("d", coilPath)
                .attr("stroke", "black")
                .attr("stroke-width", 2)
                .attr("fill", "none");
            
            // Add polarity markings that rotate with the component
            // Determine polarity based on line direction (x1,y1) -> (x2,y2)
            // Left side (closer to x1,y1) gets negative, right side (closer to x2,y2) gets positive
            
            // Calculate positions for better visibility in all orientations
            const polarityDistance = 20; // Distance from inductor body
            const verticalOffset = -8; // Shift upward for better visibility
            
            rotatedGroup.append("text")
                .attr("x", -coilWidth/2 - polarityDistance)
                .attr("y", verticalOffset)
                .attr("text-anchor", "middle")
                .attr("font-size", "18px")
                .attr("font-weight", "bold")
                .attr("font-family", "Arial")
                .attr("fill", "white")
                .attr("stroke", "black")
                .attr("stroke-width", "0.5")
                .text("-");
            
            rotatedGroup.append("text")
                .attr("x", coilWidth/2 + polarityDistance)
                .attr("y", verticalOffset)
                .attr("text-anchor", "middle")
                .attr("font-size", "18px")
                .attr("font-weight", "bold")
                .attr("font-family", "Arial")
                .attr("fill", "white")
                .attr("stroke", "black")
                .attr("stroke-width", "0.5")
                .text("+");
            
            return inductorGroup;
        }
    },
    
  V: {
    id: 5,
    name: 'V',
    component: (svg, lineId, setSelectedLine, handleLineDoubleClick, showLineCurrent, hideLineCurrent, x1, x2, y1, y2) => {
        // Calculate midpoint and dimensions
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const circleRadius = 15;
        
        // Calculate the angle of the line
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        const angleRad = angle * Math.PI / 180;
        
        // Calculate the total line length
        const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const halfLength = lineLength / 2;
        
        // Create group for voltage source
        const voltageGroup = svg.append("g")
            .attr("id", lineId)
            .style("cursor", "pointer")
            .on("click", () => setSelectedLine(lineId))
            .on("dblclick", () => handleLineDoubleClick(lineId))
            .on("mouseover", (e) => showLineCurrent(e, lineId))
            .on("mouseout", () => hideLineCurrent());
        
        // Create a group for the rotated voltage source
        const rotatedGroup = voltageGroup.append("g")
            .attr("transform", `translate(${midX}, ${midY}) rotate(${angle})`);
        
        // Draw connecting lines
        rotatedGroup.append("line")
            .attr("x1", -halfLength)
            .attr("y1", 0)
            .attr("x2", -circleRadius)
            .attr("y2", 0)
            .attr("stroke", "black")
            .attr("stroke-width", 2);
        
        rotatedGroup.append("line")
            .attr("x1", circleRadius)
            .attr("y1", 0)
            .attr("x2", halfLength)
            .attr("y2", 0)
            .attr("stroke", "black")
            .attr("stroke-width", 2);
        
        // Draw circle
        rotatedGroup.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", circleRadius)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 2);
        
        // Calculate positions for polarity signs in global coordinates
        const signOffsetX = 6; // Distance from center along the line
        
        // Position for minus sign (left side of voltage source)
        const minusX = midX - Math.cos(angleRad) * signOffsetX;
        const minusY = midY - Math.sin(angleRad) * signOffsetX;
        
        // Position for plus sign (right side of voltage source)
        const plusX = midX + Math.cos(angleRad) * signOffsetX;
        const plusY = midY + Math.sin(angleRad) * signOffsetX;
        
        // Add polarity markings in global coordinates (not rotated)
        // Minus sign
        voltageGroup.append("text")
            .attr("x", minusX)
            .attr("y", minusY + 5) // Small offset for better visual alignment
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-family", "Arial")
            .attr("fill", "black")
            .text("-");
        
        // Plus sign
        voltageGroup.append("text")
            .attr("x", plusX)
            .attr("y", plusY + 5) // Small offset for better visual alignment
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-family", "Arial")
            .attr("fill", "black")
            .text("+");
        
        return voltageGroup;
    }
},

AC: {
    id: 6,
    name: 'AC',
    component: (svg, lineId, setSelectedLine, handleLineDoubleClick, showLineCurrent, hideLineCurrent, x1, x2, y1, y2) => {
        // Calculate midpoint and dimensions
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const circleRadius = 10;
        
        // Calculate the angle of the line
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        const angleRad = angle * Math.PI / 180;
        
        // Calculate the total line length
        const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const halfLength = lineLength / 2;
        
        // Create group for AC source
        const acSourceGroup = svg.append("g")
            .attr("id", lineId)
            .style("cursor", "pointer")
            .on("click", () => setSelectedLine(lineId))
            .on("dblclick", () => handleLineDoubleClick(lineId))
            .on("mouseover", (e) => showLineCurrent(e, lineId))
            .on("mouseout", () => hideLineCurrent());
        
        // Create a group for the rotated AC source
        const rotatedGroup = acSourceGroup.append("g")
            .attr("transform", `translate(${midX}, ${midY}) rotate(${angle})`);
        
        // Draw connecting lines
        rotatedGroup.append("line")
            .attr("x1", -halfLength)
            .attr("y1", 0)
            .attr("x2", -circleRadius)
            .attr("y2", 0)
            .attr("stroke", "black")
            .attr("stroke-width", 2);
        
        rotatedGroup.append("line")
            .attr("x1", circleRadius)
            .attr("y1", 0)
            .attr("x2", halfLength)
            .attr("y2", 0)
            .attr("stroke", "black")
            .attr("stroke-width", 2);
        
        // Draw circle
        rotatedGroup.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", circleRadius)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 2);
        
        // Draw sine wave inside circle
        const sineWavePath = "M -8 0 Q -4 -6 0 0 Q 4 6 8 0";
        rotatedGroup.append("path")
            .attr("d", sineWavePath)
            .attr("stroke", "black")
            .attr("stroke-width", 1.5)
            .attr("fill", "none");
        
        // Calculate positions for polarity signs in global coordinates
        const signOffset1 = circleRadius + 17; // Distance from center
        
        // Position for minus sign (left side of AC source)
        const minusX = midX - Math.cos(angleRad) * signOffset1;
        const minusY = midY - Math.sin(angleRad) * signOffset1;
        const signOffset2 = circleRadius + 15; // Distance from center
        // Position for plus sign (right side of AC source)
        const plusX = midX + Math.cos(angleRad) * signOffset2;
        const plusY = midY + Math.sin(angleRad) * signOffset2;
        
        // Add polarity markings in global coordinates (not rotated)
        // Minus sign
        acSourceGroup.append("text")
            .attr("x", minusX-7)
            .attr("y", minusY - 4) // Small offset for better visual alignment
            .attr("text-anchor", "middle")
            .attr("font-size", "22px")
            .attr("font-family", "Arial")
            .attr("fill", "white")
            .text("-");
        
        // Plus sign
        acSourceGroup.append("text")
            .attr("x", plusX-7)
            .attr("y", plusY - 5) // Small offset for better visual alignment
            .attr("text-anchor", "middle")
            .attr("font-size", "18px")
            .attr("font-family", "Arial")
            .attr("fill", "white")
            .text("+");
        
        return acSourceGroup;
    }
},
    
    Diode: {
        id: 7,
        name: 'Diode',
        component: (svg, lineId, setSelectedLine, handleLineDoubleClick, showLineCurrent, hideLineCurrent, x1, x2, y1, y2) => {
            // Calculate midpoint and dimensions
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            // Calculate the angle of the line
            const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
            // Calculate the total line length
            const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            const halfLength = lineLength / 2;
            // Diode dimensions
            const triangleWidth = 12;
            const triangleHeight = 10;
            // Create group for diode
            const diodeGroup = svg.append("g")
                .attr("id", lineId)
                .style("cursor", "pointer")
                .on("click", () => setSelectedLine(lineId))
                .on("dblclick", () => handleLineDoubleClick(lineId))
                .on("mouseover", (e) => showLineCurrent(e, lineId))
                .on("mouseout", () => hideLineCurrent());
            // Create a group for the rotated diode
            const rotatedGroup = diodeGroup.append("g")
                .attr("transform", `translate(${midX}, ${midY}) rotate(${angle})`);
            // Draw connecting lines
            rotatedGroup.append("line")
                .attr("x1", -halfLength)
                .attr("y1", 0)
                .attr("x2", -triangleWidth/2)
                .attr("y2", 0)
                .attr("stroke", "black")
                .attr("stroke-width", 2);
            rotatedGroup.append("line")
                .attr("x1", triangleWidth/2 + 2)
                .attr("y1", 0)
                .attr("x2", halfLength)
                .attr("y2", 0)
                .attr("stroke", "black")
                .attr("stroke-width", 2);
            // Draw triangle (anode)
            const trianglePoints = [
                [-triangleWidth/2, 0],
                [triangleWidth/2, -triangleHeight/2],
                [triangleWidth/2, triangleHeight/2]
            ];
            rotatedGroup.append("polygon")
                .attr("points", trianglePoints.map(d => d.join(",")).join(" "))
                .attr("fill", "black")
                .attr("stroke", "black")
                .attr("stroke-width", 2);
            // Draw cathode line
            rotatedGroup.append("line")
                .attr("x1", triangleWidth/2)
                .attr("y1", -triangleHeight/2)
                .attr("x2", triangleWidth/2)
                .attr("y2", triangleHeight/2)
                .attr("stroke", "black")
                .attr("stroke-width", 3);
            return diodeGroup;
        }
    },
   NpnTransistor:{
        id: 8,
        name: 'NpnTransistor',
        component: (svg, lineId, setSelectedLine, handleLineDoubleClick, showLineCurrent, hideLineCurrent, x1, x2, y1, y2, x3, y3) => {
            if(!x3 || !y3) {
                return;
            }
            // Draw the transistor body
            svg.append("path")
            .attr("id", lineId)
            .attr("d", "M " + x1 + " " + y1 + 
                // Collector section
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 25 + " 0" + 
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 0 + " -15" +  
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 0 + " 30" + 
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 0 + " -20" + 
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 23 + " -25" + 
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 0 + " -20" + 
                // Move back to original point for emitter section
                " M " + x1 + " " + y1 + 
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 25 + " 0" + 
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 0 + " 15" +  // Note: -15 → 15
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 0 + " -10" +  
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 16.5+ " 18" +  
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 4 + " -12"+  
                // Move back to original point for emitter section
                " M " + x1 + " " + y1 + 
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 25 + " 0" + 
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 0 + " 15" +  
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 0 + " -10" +  
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 16.5+ " 18" +  
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * -12 + " 4"+
                    // Move back to original point for emitter section
                 " M " + x1 + " " + y1 + 
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 25 + " 0" + 
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 0 + " 15" + 
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 0 + " -10" + 
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 23 + " 25" + 
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 0 + " 20"  
            )
            .attr("stroke", "black")
            .attr("stroke-width", "2")
            .attr("stroke-linejoin", "bevel")
            .attr("fill", "none")
            .attr("transform", "rotate(0 " + x1 + " " + y1 + ")")
            .on("click", () => setSelectedLine(lineId))
            .on("dblclick", () => handleLineDoubleClick(lineId))
            .on("mouseover", (e) => showLineCurrent(e, lineId))
            .on("mouseout", () => hideLineCurrent());
        }
    },
    PnpTransistor:{
        id: 9,
        name: 'PnpTransistor',
        component: (svg, lineId, setSelectedLine, handleLineDoubleClick, showLineCurrent, hideLineCurrent, x1, x2, y1, y2, x3, y3) => {
            if(!x3 || !y3) {
                return;
            }
            // Draw the transistor body
            svg.append("path")
            .attr("id", lineId)
            .attr("d", "M " + x1 + " " + y1 + 
                // Collector section
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 25 + " 0" + 
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 0 + " -15" +  
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 0 + " 30" + 
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 0 + " -20" + 
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 23 + " -25" + 
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 0 + " -20" + 
                // Move back to original point for emitter section
                " M " + x1 + " " + y1 + 
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 25 + " 0" + 
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 0 + " -5" +  // Note: -15 → 15
                // " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 0 + " -10" +  
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 16.5+ " -18" +  
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 4 + " 12"+  
                // Move back to original point for emitter section
                " M " + x1 + " " + y1 + 
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 25 + " 0" + 
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 0 + " -5" +  
                // " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 0 + " -10" +  
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 16.5+ " -18" +  
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * -12 + " -4"+
                    // Move back to original point for emitter section
                 " M " + x1 + " " + y1 + 
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 25 + " 0" + 
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 0 + " 15" + 
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 0 + " -10" + 
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 23 + " 25" + 
                " l " + Math.sign((x2-x1)?(x2-x1):(y2-y1)) * 0 + " 20"  
            )
            .attr("stroke", "black")
            .attr("stroke-width", "2")
            .attr("stroke-linejoin", "bevel")
            .attr("fill", "none")
            .attr("transform", "rotate(0 " + x1 + " " + y1 + ")")
            .on("click", () => setSelectedLine(lineId))
            .on("dblclick", () => handleLineDoubleClick(lineId, 0))
            .on("mouseover", (e) => showLineCurrent(e, lineId))
            .on("mouseout", () => hideLineCurrent());
        }
    },
   PMosfet: {
    id: 10,
    name: 'PMosfet',
    component: (svg, lineId, setSelectedLine, handleLineDoubleClick, showLineCurrent, hideLineCurrent, x1, x2, y1, y2, x3, y3) => {
        if (!x3 || !y3) {
            return;
        }  
        // Create a group element to contain all parts of the PMosfet
        const mosfetGroup = svg.append("g")
            .attr("id", lineId);
        // Gate label at (x1,y1)
        mosfetGroup.append("text")
            .attr("x", x1 - 10)  // offset slightly to the left
            .attr("y", y1 + 5)   // offset slightly down for better positioning
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("font-family", "Arial")
            .attr("fill", "black")
            .text("G");
        // Drain label at (x2,y2)
        mosfetGroup.append("text")
            .attr("x", x2 + 10)  // offset slightly to the right
            .attr("y", y2 - 5)   // offset slightly up
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("font-family", "Arial")
            .attr("fill", "black")
            .text("D");
        // Source label at (x3,y3)
        mosfetGroup.append("text")
            .attr("x", x3 + 10)  // offset slightly to the right
            .attr("y", y3 + 15)  // offset slightly down
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("font-family", "Arial")
            .attr("fill", "black")
            .text("S");
        // PMosfet symbol path
        mosfetGroup.append("path")
            .attr("d", "M " + x1 + " " + y1 + " l " +
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 45 + " 0 l " + //horizontal move
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 0 + " -30 l " + // vertical up 
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 0 + " 60 m " + //vertical down here m create gap
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 6 + " -30 l" + // distance of gap 6 and vertical up
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 0 + " -30 l " + // from that again vertical up
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 0 + " 60 l " + // again vertical down
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 0 + " -50 l" + // again Vertical up of after 30 down i.e first horizontal bar of second line
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 45 + " 0 l" + //horizontal move
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 0 + " -30 l" + //vertical move up
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 0 + " 30 l" + // vertical down move i.e reverse
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * -45 + " 0 l" + //horizontal reverse in left side
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 0 + " 20 l" + // vertical down 
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 45 + " 0 l" + // second horizontal line
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 0 + " 20 l" +
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 0 + " -20 l" +
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * -25 + " 0 l" + // reverse of that second horizontal line
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * -12 + " -8 l" +
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 12 + " 8 l" +
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * -12 + " 8 l" +
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 12 + " -8 l" +
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * -20 + " 0 l" +
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 0 + " 20 l" + // vertical down 
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 45 + " 0 l" + //third horizontal line
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 0 + " 30 l" //vertical down
            )
            .attr("stroke", "black")
            .attr("stroke-width", "2")
            .attr("stroke-linejoin", "bevel")
            .attr("fill", "none")
            .attr("transform", "rotate(0 " + x1 + " " + y1 + ")")
            .on("click", () => setSelectedLine(lineId))
            .on("dblclick", () => handleLineDoubleClick(lineId, 0))
            .on("mouseover", (e) => showLineCurrent(e, lineId))
            .on("mouseout", () => hideLineCurrent());
    }
},

NMosfet: {
    id: 11,
    name: 'NMosfet',
    component: (svg, lineId, setSelectedLine, handleLineDoubleClick, showLineCurrent, hideLineCurrent, x1, x2, y1, y2, x3, y3) => {
        if (!x3 || !y3) {
            return;
        }
        // Create a group element to contain all parts of the NMosfet
        const mosfetGroup = svg.append("g")
           .attr("id", lineId);
        // Gate label at (x1,y1)
        mosfetGroup.append("text")
            .attr("x", x1 - 10)  // offset slightly to the left
            .attr("y", y1 + 5)   // offset slightly down for better positioning
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("font-family", "Arial")
            .attr("fill", "black")
            .text("G");

        // Drain label at (x2,y2)
        mosfetGroup.append("text")
            .attr("x", x2 + 10)  // offset slightly to the right
            .attr("y", y2 - 5)   // offset slightly up
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("font-family", "Arial")
            .attr("fill", "black")
            .text("D");

        // Source label at (x3,y3)
        mosfetGroup.append("text")
            .attr("x", x3 + 10)  // offset slightly to the right
            .attr("y", y3 + 15)  // offset slightly down
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("font-family", "Arial")
            .attr("fill", "black")
            .text("S");

        // NMosfet symbol path
        mosfetGroup.append("path")
            .attr("d", "M " + x1 + " " + y1 + " l " +
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 45 + " 0 l " + //horizontal move
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 0 + " -30 l " + // vertical up 
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 0 + " 60 m " + //vertical down here m create gap
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 6 + " -30 l" + // distance of gap 6 and vertical up
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 0 + " -30 l " + // from that again vertical up
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 0 + " 60 l " + // again vertical down
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 0 + " -50 l" + // again Vertical up of after 30 down i.e first horizontal bar of second line
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 45 + " 0 l" + //horizontal move
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 0 + " -30 l" + //vertical move up
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 0 + " 30 l" + // vertical down move i.e reverse
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * -45 + " 0 l" + //horizontal reverse in left side
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 0 + " 20 l" + // vertical down 
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 45 + " 0 l" + // second horizontal line
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 0 + " 20 l" +
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 0 + " -20 l" +
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * -35 + " 0 l" + // reverse of that second horizontal line
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 12 + " 8 l" +
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * -12 + " -8 l" +
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 12 + " -8 l" + //this show the direction of current
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * -12 + " 8 l" +
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * -10 + " 0 l" +
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 0 + " 20 l" + // vertical down 
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 45 + " 0 l" + //third horizontal line
                Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1)) * 0 + " 30 l" //vertical down
            )
            .attr("stroke", "black")
            .attr("stroke-width", "2")
            .attr("stroke-linejoin", "bevel")
            .attr("fill", "none")
            .attr("transform", "rotate(0 " + x1 + " " + y1 + ")")
            .on("click", () => setSelectedLine(lineId))
            .on("dblclick", () => handleLineDoubleClick(lineId))
            .on("mouseover", (e) => showLineCurrent(e, lineId))
            .on("mouseout", () => hideLineCurrent());
    }
},
   Ammeter: {
  name: "Ammeter",
  id: "12", // Using 'AM' to avoid conflict with AC source 'A'
  component: (svg, lineId, handleLineClick, handleLineDoubleClick, showLineCurrent, hideLineCurrent, x1, x2, y1, y2) => {
    const group = svg.append("g").attr("id", lineId);
    
    // Calculate midpoint and dimensions
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const radius = 15;
    // Calculate the angle of the line
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    // Calculate the total line length
    const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const halfLength = lineLength / 2;
    // Create a group for the rotated ammeter
    const ammeterGroup = group.append("g")
      .attr("transform", `translate(${midX}, ${midY}) rotate(${angle})`);
    // Draw connecting lines (horizontal in local coordinate system)
    ammeterGroup.append("line")
      .attr("x1", -halfLength)
      .attr("y1", 0)
      .attr("x2", -radius)
      .attr("y2", 0)
      .attr("stroke", "black")
      .attr("stroke-width", 2);
    ammeterGroup.append("line")
      .attr("x1", radius)
      .attr("y1", 0)
      .attr("x2", halfLength)
      .attr("y2", 0)
      .attr("stroke", "black")
      .attr("stroke-width", 2);
    // Draw the ammeter circle
    ammeterGroup.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", radius)
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", 2);
    // Add 'A' text inside the circle (counter-rotate to keep text upright)
    ammeterGroup.append("text")
      .attr("x", 0)
      .attr("y", 4)
      .attr("text-anchor", "middle")
      .attr("font-family", "Arial, sans-serif")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "black")
      .attr("transform", `rotate(${-angle})`)
      .text("A");
    // Add current direction arrow (pointing in the direction of current flow)
    const arrowSize = 8;
    ammeterGroup.append("polygon")
      .attr("points", `${3},${-3} ${3 + arrowSize},${0} ${3},${3}`)
      .attr("fill", "red")
      .attr("stroke", "red")
      .attr("stroke-width", 1);
    // Make the ammeter interactive
    group
      .style("cursor", "pointer")
      .on("click", () => handleLineClick(lineId))
      .on("dblclick", () => handleLineDoubleClick(lineId, "ammeter"))
      .on("mouseover", (event) => showLineCurrent(event, lineId))
      .on("mouseout", () => hideLineCurrent());
    
    return group;
  }
},
   // Replace the Voltmeter definition with:
    Voltmeter: {
    id: "13",
    name: "Voltmeter",
    measurementType: "voltage",
    resistance: 1e12, // Very high resistance
    
    component: (svg, lineId, handleLineClick, handleLineDoubleClick, showLineCurrent, hideLineCurrent, x1, x2, y1, y2, simData, temp, updatedNodes,getVoltageValue) => {
      // Calculate midpoint and dimensions
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const radius = 15;
      
      const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
      const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      const halfLength = lineLength / 2;
      
      const voltmeterGroup = svg.append("g")
        .attr("id", lineId)
        .style("cursor", "pointer")
        .on("click", () => handleLineClick(lineId))
        .on("dblclick", (event) => {
          event.stopPropagation();
          handleLineDoubleClick(lineId, "ideal");
        })
        .on("mouseover", (event) => {
          // CRITICAL: Get voltage value and show it
          const voltageValue = getVoltageValue(lineId, simData, temp, updatedNodes);
          console.log(`Voltmeter ${lineId} reading: ${voltageValue}`); // Debug log
          showLineCurrent(event, lineId, voltageValue);
        })
        .on("mouseout", () => hideLineCurrent());
  
      const rotatedGroup = voltmeterGroup.append("g")
        .attr("transform", `translate(${midX}, ${midY}) rotate(${angle})`);
  
      // Draw lines
      rotatedGroup.append("line")
        .attr("x1", -halfLength)
        .attr("y1", 0)
        .attr("x2", -radius)
        .attr("y2", 0)
        .attr("stroke", "black")
        .attr("stroke-width", 2);
  
      rotatedGroup.append("line")
        .attr("x1", radius)
        .attr("y1", 0)
        .attr("x2", halfLength)
        .attr("y2", 0)
        .attr("stroke", "black")
        .attr("stroke-width", 2);
  
      // Draw circle
      rotatedGroup.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", radius)
        .attr("fill", "white")
        .attr("stroke", "#00AA00")
        .attr("stroke-width", 2);
  
      // Add V symbol
      rotatedGroup.append("text")
        .attr("x", 0)
        .attr("y", 5)
        .attr("text-anchor", "middle")
        .attr("font-family", "Arial, sans-serif")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("fill", "#00AA00")
        .attr("transform", `rotate(${-angle})`)
        .text("V");
  
      return voltmeterGroup;
    }
  },
VCVS: {
    id: "14",
    name: "VCVS",
    component: (svg, lineId, handleLineClick, handleLineDoubleClick, showLineCurrent, hideLineCurrent, x1, x2, y1, y2) => {
        // Calculate midpoint and dimensions
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const diamondSize = 17; // Half the diagonal of the diamond
        
        // Calculate the angle of the line
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        
        // Calculate the total line length
        const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const halfLength = lineLength / 2;
        
        // Create group for dependent voltage source
        const voltageSourceGroup = svg.append("g")
            .attr("id", lineId)
            .style("cursor", "pointer")
            .on("click", () => handleLineClick(lineId))
            .on("dblclick", (event) => {
                event.stopPropagation();
                handleLineDoubleClick(lineId);
            })
            .on("mouseover", (event) => showLineCurrent(event, lineId))
            .on("mouseout", () => hideLineCurrent());

        // Create a group for the rotated voltage source
        const rotatedGroup = voltageSourceGroup.append("g")
            .attr("transform", `translate(${midX}, ${midY}) rotate(${angle})`);

        // Draw connecting lines (horizontal in local coordinate system)
        rotatedGroup.append("line")
            .attr("x1", -halfLength)
            .attr("y1", 0)
            .attr("x2", -diamondSize)
            .attr("y2", 0)
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        rotatedGroup.append("line")
            .attr("x1", diamondSize)
            .attr("y1", 0)
            .attr("x2", halfLength)
            .attr("y2", 0)
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        // Draw diamond shape
        const diamondPoints = [
            [0, -diamondSize],    // top
            [diamondSize, 0],     // right
            [0, diamondSize],     // bottom
            [-diamondSize, 0]     // left
        ];

        rotatedGroup.append("polygon")
            .attr("points", diamondPoints.map(d => d.join(",")).join(" "))
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        // Add "+" symbol at the top (counter-rotate to keep text upright)
        rotatedGroup.append("text")
            .attr("y", 5)
            .attr("x", diamondSize/2 )
            .attr("text-anchor", "middle")
            .attr("font-family", "Arial, sans-serif")
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .attr("transform", `rotate(${-angle})`)
            .text("+");

        // Add "−" symbol at the bottom (counter-rotate to keep text upright)
        rotatedGroup.append("text")
            .attr("y", 5)
            .attr("x", -diamondSize/2 + 2)
            .attr("text-anchor", "middle")
            .attr("font-family", "Arial, sans-serif")
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .attr("transform", `rotate(${-angle})`)
            .text("−");

        return voltageSourceGroup;
    }
},
VCCS: {
    id: "15",
    name: "VCCS",
     component: (svg, lineId, handleLineClick, handleLineDoubleClick, showLineCurrent, hideLineCurrent, x1, x2, y1, y2) => {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const diamondSize = 15;
    const arrowHeadSize = 5;

    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const halfLength = lineLength / 2;

    const currentSourceGroup = svg.append("g")
      .attr("id", lineId)
      .style("cursor", "pointer")
      .on("click", () => handleLineClick(lineId))
      .on("dblclick", (event) => {
        event.stopPropagation();
        handleLineDoubleClick(lineId, "dependent_current");
      })
      .on("mouseover", (event) => showLineCurrent(event, lineId))
      .on("mouseout", () => hideLineCurrent());

    const rotatedGroup = currentSourceGroup.append("g")
      .attr("transform", `translate(${midX}, ${midY}) rotate(${angle})`);

    // Draw connecting lines
    rotatedGroup.append("line")
      .attr("x1", -halfLength)
      .attr("y1", 0)
      .attr("x2", -diamondSize)
      .attr("y2", 0)
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    rotatedGroup.append("line")
      .attr("x1", diamondSize)
      .attr("y1", 0)
      .attr("x2", halfLength)
      .attr("y2", 0)
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    // Diamond shape
    const diamondPoints = [
      [0, -diamondSize],
      [diamondSize, 0],
      [0, diamondSize],
      [-diamondSize, 0]
    ];

    rotatedGroup.append("polygon")
      .attr("points", diamondPoints.map(d => d.join(",")).join(" "))
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    // Arrow (always points to right for simplicity, since group is rotated)
    const arrowGroup = rotatedGroup.append("g");

    // Arrow shaft
    arrowGroup.append("line")
      .attr("x1", -6)
      .attr("y1", 0)
      .attr("x2", 6)
      .attr("y2", 0)
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    // Arrow head
    arrowGroup.append("polygon")
      .attr("points", [
        [6, 0],
        [6 - arrowHeadSize, -arrowHeadSize],
        [6 - arrowHeadSize, arrowHeadSize]
      ].map(d => d.join(",")).join(" "))
      .attr("fill", "black");

    return currentSourceGroup;
  }
},
CCVS: {
    id: "16",
    name: "CCVS",
    component: (svg, lineId, handleLineClick, handleLineDoubleClick, showLineCurrent, hideLineCurrent, x1, x2, y1, y2) => {
        // Calculate midpoint and dimensions
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const diamondSize = 17; // Half the diagonal of the diamond
        
        // Calculate the angle of the line
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        
        // Calculate the total line length
        const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const halfLength = lineLength / 2;
        
        // Create group for dependent voltage source
        const voltageSourceGroup = svg.append("g")
            .attr("id", lineId)
            .style("cursor", "pointer")
            .on("click", () => handleLineClick(lineId))
            .on("dblclick", (event) => {
                event.stopPropagation();
                handleLineDoubleClick(lineId, 0);
            })
            .on("mouseover", (event) => showLineCurrent(event, lineId))
            .on("mouseout", () => hideLineCurrent());

        // Create a group for the rotated voltage source
        const rotatedGroup = voltageSourceGroup.append("g")
            .attr("transform", `translate(${midX}, ${midY}) rotate(${angle})`);

        // Draw connecting lines (horizontal in local coordinate system)
        rotatedGroup.append("line")
            .attr("x1", -halfLength)
            .attr("y1", 0)
            .attr("x2", -diamondSize)
            .attr("y2", 0)
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        rotatedGroup.append("line")
            .attr("x1", diamondSize)
            .attr("y1", 0)
            .attr("x2", halfLength)
            .attr("y2", 0)
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        // Draw diamond shape
        const diamondPoints = [
            [0, -diamondSize],    // top
            [diamondSize, 0],     // right
            [0, diamondSize],     // bottom
            [-diamondSize, 0]     // left
        ];

        rotatedGroup.append("polygon")
            .attr("points", diamondPoints.map(d => d.join(",")).join(" "))
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        // Add "+" symbol at the top (counter-rotate to keep text upright)
        rotatedGroup.append("text")
            .attr("y", 5)
            .attr("x", diamondSize/2 )
            .attr("text-anchor", "middle")
            .attr("font-family", "Arial, sans-serif")
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .attr("transform", `rotate(${-angle})`)
            .text("+");

        // Add "−" symbol at the bottom (counter-rotate to keep text upright)
        rotatedGroup.append("text")
            .attr("y", 5)
            .attr("x", -diamondSize/2 + 2)
            .attr("text-anchor", "middle")
            .attr("font-family", "Arial, sans-serif")
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .attr("transform", `rotate(${-angle})`)
            .text("−");

        return voltageSourceGroup;
    }
},
CCCS: {
    id: "17",
    name: "CCCS",
     component: (svg, lineId, handleLineClick, handleLineDoubleClick, showLineCurrent, hideLineCurrent, x1, x2, y1, y2) => {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const diamondSize = 15;
    const arrowHeadSize = 5;

    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const halfLength = lineLength / 2;

    const currentSourceGroup = svg.append("g")
      .attr("id", lineId)
      .style("cursor", "pointer")
      .on("click", () => handleLineClick(lineId))
      .on("dblclick", (event) => {
        event.stopPropagation();
        handleLineDoubleClick(lineId);
      })
      .on("mouseover", (event) => showLineCurrent(event, lineId))
      .on("mouseout", () => hideLineCurrent());

    const rotatedGroup = currentSourceGroup.append("g")
      .attr("transform", `translate(${midX}, ${midY}) rotate(${angle})`);

    // Draw connecting lines
    rotatedGroup.append("line")
      .attr("x1", -halfLength)
      .attr("y1", 0)
      .attr("x2", -diamondSize)
      .attr("y2", 0)
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    rotatedGroup.append("line")
      .attr("x1", diamondSize)
      .attr("y1", 0)
      .attr("x2", halfLength)
      .attr("y2", 0)
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    // Diamond shape
    const diamondPoints = [
      [0, -diamondSize],
      [diamondSize, 0],
      [0, diamondSize],
      [-diamondSize, 0]
    ];

    rotatedGroup.append("polygon")
      .attr("points", diamondPoints.map(d => d.join(",")).join(" "))
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    // Arrow (always points to right for simplicity, since group is rotated)
    const arrowGroup = rotatedGroup.append("g");

    // Arrow shaft
    arrowGroup.append("line")
      .attr("x1", -6)
      .attr("y1", 0)
      .attr("x2", 6)
      .attr("y2", 0)
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    // Arrow head
    arrowGroup.append("polygon")
      .attr("points", [
        [6, 0],
        [6 - arrowHeadSize, -arrowHeadSize],
        [6 - arrowHeadSize, arrowHeadSize]
      ].map(d => d.join(",")).join(" "))
      .attr("fill", "black");

    return currentSourceGroup;
  }
},
CS: {
    id: "18",
    name: "CS",
    component: (svg, lineId, handleLineClick, handleLineDoubleClick, showLineCurrent, hideLineCurrent, x1, x2, y1, y2) => {
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const circleRadius = 12;
        const arrowHeadSize = 4;

        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const halfLength = lineLength / 2;

        const currentSourceGroup = svg.append("g")
            .attr("id", lineId)
            .style("cursor", "pointer")
            .on("click", () => handleLineClick(lineId))
            .on("dblclick", (event) => {
                event.stopPropagation();
                handleLineDoubleClick(lineId, "dependent_current");
            })
            .on("mouseover", (event) => showLineCurrent(event, lineId))
            .on("mouseout", () => hideLineCurrent());

        const rotatedGroup = currentSourceGroup.append("g")
            .attr("transform", `translate(${midX}, ${midY}) rotate(${angle})`);

        // Draw connecting lines
        rotatedGroup.append("line")
            .attr("x1", -halfLength)
            .attr("y1", 0)
            .attr("x2", -circleRadius)
            .attr("y2", 0)
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        rotatedGroup.append("line")
            .attr("x1", circleRadius)
            .attr("y1", 0)
            .attr("x2", halfLength)
            .attr("y2", 0)
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        // Circle shape (replaces diamond)
        rotatedGroup.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", circleRadius)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        // Arrow inside the rotated group (rotates with the component)
        const arrowGroup = rotatedGroup.append("g");

        // Arrow shaft
        arrowGroup.append("line")
            .attr("x1", -8)
            .attr("y1", 0)
            .attr("x2", 8)
            .attr("y2", 0)
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        // Arrow head
        arrowGroup.append("polygon")
            .attr("points", [
                [8, 0],
                [8 - arrowHeadSize, -arrowHeadSize],
                [8 - arrowHeadSize, arrowHeadSize]
            ].map(d => d.join(",")).join(" "))
            .attr("fill", "black");

        return currentSourceGroup;
    }
},
TL: {
    id: 3,
    name: 'TL',
    component: (svg, lineId, setSelectedLine, handleLineDoubleClick, showLineCurrent, hideLineCurrent, x1, x2, y1, y2) => {
        // Calculate midpoint and dimensions
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        
        // Calculate the angle of the line
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        
        // Calculate the total line length
        const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const halfLength = lineLength / 2;
        
        // Transmission line dimensions
        const tlLength =60; // Length of the transmission line section
        const lineSpacing = 5; // Distance between the two parallel lines
        const numConnectors = 10; // Number of diagonal connecting lines
        const connectorSpacing = tlLength / numConnectors;
        
        // Create group for transmission line
        const tlGroup = svg.append("g")
            .attr("id", lineId)
            .style("cursor", "pointer")
            .on("click", () => setSelectedLine(lineId))
            .on("dblclick", () => handleLineDoubleClick(lineId))
            .on("mouseover", (e) => showLineCurrent(e, lineId))
            .on("mouseout", () => hideLineCurrent());
        
        // Create a group for the rotated transmission line
        const rotatedGroup = tlGroup.append("g")
            .attr("transform", `translate(${midX}, ${midY}) rotate(${angle})`);
        
        // Draw connecting lines (horizontal in local coordinate system)
        rotatedGroup.append("line")
            .attr("x1", -halfLength)
            .attr("y1", 0)
            .attr("x2", -tlLength/2)
            .attr("y2", 0)
            .attr("stroke", "orange")
            .attr("stroke-width", 2);
        
        rotatedGroup.append("line")
            .attr("x1", tlLength/2)
            .attr("y1", 0)
            .attr("x2", halfLength)
            .attr("y2", 0)
            .attr("stroke", "pink")
            .attr("stroke-width", 2);
        
        // Draw the two parallel lines of the transmission line
        rotatedGroup.append("line")
            .attr("x1", -tlLength/2)
            .attr("y1", -lineSpacing/2)
            .attr("x2", tlLength/2)
            .attr("y2", -lineSpacing/2)
            .attr("stroke", "red")
            .attr("stroke-width", 2);
        
        rotatedGroup.append("line")
            .attr("x1", -tlLength/2)
            .attr("y1", lineSpacing/2)
            .attr("x2", tlLength/2)
            .attr("y2", lineSpacing/2)
            .attr("stroke", "blue")
            .attr("stroke-width", 2);
        
        // Draw the diagonal connecting lines (all slanting the same direction)
        for (let i = 0; i < numConnectors; i++) {
            const x = -tlLength/2 + i * connectorSpacing;
            const nextX = x + connectorSpacing * 0.8; // Diagonal length
            
            // All diagonal lines go from bottom-left to top-right
            rotatedGroup.append("line")
                .attr("x1", x)
                .attr("y1", lineSpacing/2+10)
                .attr("x2", nextX)
                .attr("y2", lineSpacing/2)
                .attr("stroke", "blue")
                .attr("stroke-width", 2);
        }
        
        return tlGroup;
    }
}
}
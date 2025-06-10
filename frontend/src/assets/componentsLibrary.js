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
    R:{
        id: 2,
        name: 'R',
        component: (svg, lineId, setSelectedLine, handleLineDoubleClick, showLineCurrent, hideLineCurrent, x1, x2, y1, y2) => {
            // Calculate transform string for text placement
            const isVertical = x1 === x2;
            const rotation = isVertical ? Math.sign(y2 - y1) : (x2 > x1 ? 0 : -2);
            const transformString = `rotate(${rotation * 90} ${x1} ${y1}) translate(${x1 + 25}, ${y1 - 10})`;

            const resistorgroup = svg.append("g")
                .attr("id", lineId);

            // Minus sign (at source terminal)
            resistorgroup.append("text")
                .attr("x", -20)  // Position relative to the circle center
                .attr("y", 5)
                .attr("text-anchor", "middle")
                .attr("font-size", "16px")
                .attr("font-family", "Arial")
                .attr("fill", "black")
                .attr("transform", transformString)
                .text("-");

            // Plus sign (at destination terminal)
            resistorgroup.append("text")
                .attr("x", 20)   // Position relative to the circle center
                .attr("y", 5)
                .attr("text-anchor", "middle")
                .attr("font-size", "16px")
                .attr("font-family", "Arial")
                .attr("fill", "black")
                .attr("transform", transformString)
                .text("+");

            resistorgroup.append("path")
                .attr("id", lineId)
                .attr("d", "M " + x1 +" "+y1 + "l"+ Math.sign((x2-x1)?(x2-x1):(y2-y1))*10+ " 0 l "+Math.sign((x2-x1)?(x2-x1):(y2-y1))*2 +"-4 l "+Math.sign((x2-x1)?(x2-x1):(y2-y1))*4+" 8 l "+Math.sign((x2-x1)?(x2-x1):(y2-y1))*4+" -8 l "+Math.sign((x2-x1)?(x2-x1):(y2-y1))*4+" 8 l "+Math.sign((x2-x1)?(x2-x1):(y2-y1))*4+" -8 l "+Math.sign((x2-x1)?(x2-x1):(y2-y1))*4+" 8 l "+Math.sign((x2-x1)?(x2-x1):(y2-y1))*4+" -8 l "+Math.sign((x2-x1)?(x2-x1):(y2-y1))*2+ " 4 l "+Math.sign((x2-x1)?(x2-x1):(y2-y1))*10+ " 0")
                .attr("stroke", "black")
                .attr("stroke-width", "2")
                .attr("stroke-linejoin", "bevel")
                .attr("fill", "none")
                .attr("transform", "rotate("+(y2===y1?0:Math.sign(y2<y1?y1-y2:y2-y1))*90+" "+x1+" "+y1+")")
                .on("click", () => setSelectedLine(lineId))
                .on("dblclick", () => handleLineDoubleClick(lineId, 0))
                .on("mouseover", (e)=> showLineCurrent(e, lineId))
                .on("mouseout", ()=> hideLineCurrent());

            return resistorgroup;
        }
    },
    C:{
        id: 3,
        name: 'C',
        component: (svg, lineId, setSelectedLine, handleLineDoubleClick, showLineCurrent, hideLineCurrent, x1, x2, y1, y2) => {
             const isVertical = x1 === x2;
            const rotation = isVertical ? Math.sign(y2 - y1) : (x2 > x1 ? 0 : -2);
            const transformString = `rotate(${rotation * 90} ${x1} ${y1}) translate(${x1 + 25}, ${y1 - 10})`;

            const Capacitorgroup=svg.append("g")
                .attr("id",lineId)
            Capacitorgroup.append("text")
                .attr("x", -20)  // Position relative to the circle center
                .attr("y", 5)
                .attr("text-anchor", "middle")
                .attr("font-size", "30px")
                .attr("font-family", "Arial")
                .attr("fill", "black")
                .attr("transform", transformString)
                .text("-");

            // Plus sign (at destination terminal)
            Capacitorgroup.append("text")
                .attr("x", 20)   // Position relative to the circle center
                .attr("y", 5)
                .attr("text-anchor", "middle")
                .attr("font-size", "30px")
                .attr("font-family", "Arial")
                .attr("fill", "black")
                .attr("transform", transformString)
                .text("+");

            Capacitorgroup.append("path")
            .attr("id", lineId)
            .attr("d", "M " + x1 +" "+y1 + "l"+ Math.sign((x2-x1)?(x2-x1):(y2-y1))*21.5+ " 0 l "+Math.sign((x2-x1)?(x2-x1):(y2-y1))*0 +"-6 l "+Math.sign((x2-x1)?(x2-x1):(y2-y1))*0+" 12 m "+Math.sign((x2-x1)?(x2-x1):(y2-y1))*6 +"-6 l 0 -6 l 0 12 l 0 -6 l"+Math.sign((x2-x1)?(x2-x1):(y2-y1))*21.5+ " 0")
            .attr("stroke", "black")
            .attr("stroke-width", "2")
            .attr("stroke-linejoin", "bevel")
            .attr("fill", "none")
            .attr("transform", "rotate("+(y2===y1?0:Math.sign(y2<y1?y1-y2:y2-y1))*90+" "+x1+" "+y1+")")
            .on("click", () => setSelectedLine(lineId))
            .on("dblclick", () => handleLineDoubleClick(lineId, 0))
            .on("mouseover", (e)=> showLineCurrent(e, lineId))
            .on("mouseout", ()=> hideLineCurrent())

            return Capacitorgroup
        }
        
    },
    L: {
        id: 4,
        name: 'L',
        component: (svg, lineId, setSelectedLine, handleLineDoubleClick, showLineCurrent, hideLineCurrent, x1, x2, y1, y2) => (
            svg.append("path")
            .attr("id", lineId)
            .attr("d", "M -25,0 L -15,0 C -15,0 -15,-3 -12,-3 C -9,-3 -9,0 -9,0 C -9,0 -9,-3 -6,-3 C -3,-3 -3,0 -3,0 C -3,0 -3,-3 0,-3 C 3,-3 3,0 3,0 C 3,0 3,-3 6,-3 C 9,-3 9,0 9,0 C 9,0 9,-3 12,-3 C 15,-3 15,0 15,0 L 24,0")
            .attr("stroke", "black")
            .attr("stroke-width", "2")
            .attr("stroke-linejoin", "bevel")
            .attr("fill", "none")
            .attr("transform", " rotate("+(x1===x2?Math.sign(y2-y1):(x2>x1?0:-2))*90+" "+x1+" "+y1+") "+`translate(${x1+25},${y1})`)
            .on("click", () => setSelectedLine(lineId))
            .on("dblclick", () => handleLineDoubleClick(lineId, 0))
            .on("mouseover", (e)=> showLineCurrent(e, lineId))
            .on("mouseout", ()=> hideLineCurrent())
        )
    },
    V: {
    id: 5,
    name: 'V',
    component: (svg, lineId, setSelectedLine, handleLineDoubleClick, showLineCurrent, hideLineCurrent, x1, x2, y1, y2) => {
        // Create a group element to contain all parts of the voltage source
        const voltageGroup = svg.append("g")
            .attr("id", lineId);

        // Minus sign at (x1,y1)
        voltageGroup.append("text")
            .attr("x", x1 + 10)  
            .attr("y", y1 - 5)   
            .attr("text-anchor", "middle")
            .attr("font-size", "30px")
            .attr("font-family", "Arial")
            .attr("fill", "black")
            .text("-");

        // Plus sign at (x2,y2)
        voltageGroup.append("text")
            .attr("x", x2 - 10)  
            .attr("y", y2 - 5)   
            .attr("text-anchor", "middle")
            .attr("font-size", "25px")
            .attr("font-family", "Arial")
            .attr("fill", "black")
            .text("+");
        
        // Voltage source symbol path
        voltageGroup.append("path")
            .attr("d", "M " + x1 +" "+y1 + "l"+ Math.sign((x2-x1)?(x2-x1):(y2-y1))*21.5+ " 0 l "+Math.sign((x2-x1)?(x2-x1):(y2-y1))*0 +"-6 l "+Math.sign((x2-x1)?(x2-x1):(y2-y1))*0+" 12 m "+Math.sign((x2-x1)?(x2-x1):(y2-y1))*6 +"-6 l 0 -15 l 0 30 l 0 -15 l"+Math.sign((x2-x1)?(x2-x1):(y2-y1))*21.5+ " 0")
            .attr("stroke", "black")
            .attr("stroke-width", "2")
            .attr("stroke-linejoin", "bevel")
            .attr("fill", "none")
            .attr("transform", "rotate("+(y2===y1?0:Math.sign(y2<y1?y1-y2:y2-y1))*90+" "+x1+" "+y1+")")
            .on("click", () => setSelectedLine(lineId))
            .on("dblclick", () => handleLineDoubleClick(lineId, 0))
            .on("mouseover", (e)=> showLineCurrent(e, lineId))
            .on("mouseout", ()=> hideLineCurrent());
    }
},
    ACSource: {
    id: 6,
    name: 'ACSource',
    component: (svg, lineId, setSelectedLine, handleLineDoubleClick, showLineCurrent, hideLineCurrent, x1, x2, y1, y2) => {
        // Create a group element to contain all parts of the AC source
        const acSourceGroup = svg.append("g")
            .attr("id", lineId);

        // Determine rotation and positioning
        const isVertical = x1 === x2;
        const rotation = isVertical ? Math.sign(y2 - y1) : (x2 > x1 ? 0 : -2);
        const transformString = `rotate(${rotation * 90} ${x1} ${y1}) translate(${x1 + 25}, ${y1 - 10})`;

        // Minus sign (at source terminal)
        acSourceGroup.append("text")
            .attr("x", -20)  // Position relative to the circle center
            .attr("y", 5)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-family", "Arial")
            .attr("fill", "black")
            .attr("transform", transformString)
            .text("-");

        // Plus sign (at destination terminal)
        acSourceGroup.append("text")
            .attr("x", 20)   // Position relative to the circle center
            .attr("y", 5)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-family", "Arial")
            .attr("fill", "black")
            .attr("transform", transformString)
            .text("+");

        // AC source symbol path
        acSourceGroup.append("path")
     .attr("d", "M -26,10 L 0,10.5 C 0,10.5 0.75,8 2.25,8 C 3.75,8 5.25,13 6.75,13 C 8.25,13 9,10.5 9,10.5 L 12.5,10.5 " +
        "A 7.5,7.5 0 1,0 -2.5,10.5 " +
        "A 7.5,7.5 0 1,0 12.5,10.5 " +
        "L 24,9.5")
            .attr("stroke", "black")
            .attr("stroke-width", "2")
            .attr("stroke-linejoin", "bevel")
            .attr("fill", "none")
            .attr("transform", transformString)
            .on("click", () => setSelectedLine(lineId))
            .on("mouseover", (e) => showLineCurrent(e, lineId))
            .on("dblclick", () => handleLineDoubleClick(lineId, 0))
            .on("mouseout", () => hideLineCurrent());
    }
},
    Diode: {
        id: 7,
        name: 'Diode',
        component: (svg, lineId, setSelectedLine, handleLineDoubleClick, showLineCurrent, hideLineCurrent, x1, x2, y1, y2) => {
            if ((x2 < x1) || (x1 === x2 && y2 < y1)) {
                [x1, x2] = [x2, x1];
                [y1, y2] = [y2, y1];
            }
            const dir = Math.sign((x2 - x1) ? (x2 - x1) : (y2 - y1));
            svg.append("path")
                .attr("id", lineId)
                .attr("d", 
                    "M " + x1 + " " + y1 +
                    " l" + dir * 20 + " 0" +                     // lead-in
                    " l0 -6 l10 6 l-10 6 l0 -6" +               // triangle
                    " m10 0 l0 -6 l0 12 m0 -6" +                // vertical bar
                    " l" + dir * 19+ " 0"                      // lead-out
                )
                .attr("stroke", "black")
                .attr("stroke-width", "2")
                .attr("stroke-linejoin", "bevel")
                .attr("fill", "none")
                .attr("transform", "rotate(" + ((y2 === y1 ? 0 : Math.sign(y2 - y1) * 90)) + " " + x1 + " " + y1 + ")")
                .on("click", () => setSelectedLine(lineId))
                .on("mouseover", (e) => showLineCurrent(e, lineId))
                .on("dblclick", () => handleLineDoubleClick(lineId, 0));
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
            .on("dblclick", () => handleLineDoubleClick(lineId, 0))
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
            .on("dblclick", () => handleLineDoubleClick(lineId, 0))
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
    component: (svg, lineId, handleLineClick, handleLineDoubleClick, showLineCurrent, hideLineCurrent, x1, x2, y1, y2) => {
        // Calculate midpoint and dimensions
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const radius = 15;
        
        // Calculate the angle of the line
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        
        // Calculate the total line length
        const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const halfLength = lineLength / 2;
        
        // Create group for voltmeter
        const voltmeterGroup = svg.append("g")
            .attr("id", lineId)
            .style("cursor", "pointer")
            .on("click", () => handleLineClick(lineId))
            .on("dblclick", (event) => {
                event.stopPropagation();
                handleLineDoubleClick(lineId, "ideal");
            })
            .on("mouseover", (event) => showLineCurrent(event, lineId))
            .on("mouseout", () => hideLineCurrent());

        // Create a group for the rotated voltmeter
        const rotatedGroup = voltmeterGroup.append("g")
            .attr("transform", `translate(${midX}, ${midY}) rotate(${angle})`);

        // Draw connecting lines (horizontal in local coordinate system)
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

        // Draw voltmeter circle
        rotatedGroup.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", radius)
            .attr("fill", "white")
            .attr("stroke", "#00AA00")
            .attr("stroke-width", 2);

        // Add "V" symbol (counter-rotate to keep text upright)
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

        // Add voltage polarity indicators (+ and -)
        const polarityOffset = 6;
        
        // Plus sign on the left side
        rotatedGroup.append("text")
            .attr("x", -polarityOffset)
            .attr("y", -polarityOffset)
            .attr("text-anchor", "middle")
            .attr("font-family", "Arial, sans-serif")
            .attr("font-size", "10px")
            .attr("font-weight", "bold")
            .attr("fill", "#00AA00")
            .attr("transform", `rotate(${-angle})`)
            .text("+");

        // Minus sign on the right side
        rotatedGroup.append("text")
            .attr("x", polarityOffset)
            .attr("y", -polarityOffset)
            .attr("text-anchor", "middle")
            .attr("font-family", "Arial, sans-serif")
            .attr("font-size", "10px")
            .attr("font-weight", "bold")
            .attr("fill", "#00AA00")
            .attr("transform", `rotate(${-angle})`)
            .text("−");

        return voltmeterGroup;
    }
}
}



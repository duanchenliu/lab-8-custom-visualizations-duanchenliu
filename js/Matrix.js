
export default function Matrix(){
	// init size
	let margin ={ top: 100, right: 20, bottom: 20, left: 100 };
	let size = 600;// both width and height since we use square, they are the same

    let pos = d3.scaleBand();//input is categorial data and output is continuous scale

    function chart(selection){
        selection.each(function(data){
            // follow the instruction to fill in this part

            // The domain of scaleBand must be categories while its output is continuous. 
            //We use d3.range to generate artificial categories whose size is equal to the number of rows (or columns). 
            // The scale then automatically calculates the size of each based on the number of rows and the size of the canvas 
            pos.domain(d3.range(data.length))//assume the data is always changing 
                .rangeRound([0, size - margin.left - margin.right])//margin convention
                .paddingInner(0.25);//padding between the squares.
            //************initial structure**************************//
            let svg = d3.select(this).selectAll('svg')
                        .data([data]); //update parent 

            let svgEnter = svg.enter().append('svg');
            svgEnter.append('g');//contain the chart

            // merge with the update selection
            svg = svg.merge(svgEnter);//to simplify the code: use svg for the rest of code
            
            // update canvas size
            svg.attr("width", size).attr("height", size);

            let g = svg.select("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");// have a margin for the chart
            //************initial structure end **************************//

            // Draw matrix rows (and y-axis labels)
            let dataJoin = g.selectAll(".matrix-row")//dataJoin contain the update selection
                            .data(data, d=>d.index);

            let rowsGroups = dataJoin.enter()
                            .append("g")
                            .attr("class", "matrix-row");
                    
            rowsGroups.merge(dataJoin)  // merge ENTER + UPDATE groups //rows
                            .style('opacity', 0.5)
                            .transition()
                            .duration(1000)//1 second
                            .style('opacity', 1)
                            .attr("transform", (d,i)=>"translate(0," + pos(i) + ")");//position of the row
            
          // Draw static columns
            rowsGroups.selectAll(".matrix-cell-marriage") //columns
                            .data(d=> d.cols) //d = data for each row
                            .enter().append("path") // columns are intialized once and never change.
                            .attr('d', (d, i)=>'M ' + pos(i) +' '+ 0 + ' l ' + pos.bandwidth() + ' 0 l 0 ' + pos.bandwidth() + ' z')
                            .attr("fill", d=>d.marriage == 0 ? "#ddd" : "#8686bf");
                    
            rowsGroups.selectAll(".matrix-cell-business") //columns
                            .data(d=> d.cols)
                            .enter().append("path")
                            .attr('d', (d,i)=>'M ' + pos(i) +' '+ 0 + ' l 0 ' + pos.bandwidth() + ' l ' + pos.bandwidth() + ' 0 z')// M: move to a position; (pos(i), 0) position; l: draw a line; z: close a path
                            .attr("fill", d=>d.business == 0 ? "#ddd" : "#fbad52");//#ddd gray => no business; 


            // Draw Row and Column Labels:
            rowsGroups.append("text")
                    .attr("class", "matrix-row-label")
                    .attr("y", pos.bandwidth() / 2)
                    .attr("dx", -10)
                    .attr("text-anchor", "end")
                    .attr("alignment-baseline", "middle")
                    .text(d=>d.Family);

            g.selectAll(".matrix-column-label")
                    .data(data).enter().append("text")//for column label we only  need to care about the enter selection because they are drawn only once (unless you also want to reorder columns later on).
                    .attr("class", "matrix-column-label")
                    .attr("alignment-baseline", "middle")
                    .attr("transform", function(d, i){
                        // make it vertical
                        // can make it vertical using "writing-mode" attribute as well
                        return "translate(" +( pos(i)+ pos.bandwidth()/2)+ ",-8) rotate(270)"
                    })
                    .text(d=> d.Family);
        });
    }
    return chart;
}



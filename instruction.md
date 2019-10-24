--- 

layout: default
title: lab8

---
# <img src="img/instruction/logo.png" width="30px"> CSCI339001 Visualization


# Lab 8

### Learning Objectives

- Know how to create custom visualizations with D3
- Consolidate the official documentation and external materials
- Apply the learned web development skills and your deep understanding of D3 to realize your own ideas and to implement unique visualizations (apart from bar and area charts)


### Prerequisites


- Accept the lab assignment invitation from Github Classroom: 
	[https://classroom.github.com/a/wdqYBrbo](https://classroom.github.com/a/wdqYBrbo)


## Visualizing Padgett's Florentines Families

In this problem set you will work primarily with network data. The data sources about marriage and business ties among Renaissance Florentine families were originally collected by Padgett [1] and then made available to the public.
  The dataset includes important families that were involved in a struggle for political control in Florence around 1430. With the collected data, researchers can analyze the influence of individual families and, in addition, can get a better understanding of the impact of these different kinds of relationships.

Each network consists of 16 families of the city of Florence in the early 15th century. In the graph, a family is represented as a node and marriages or business ties are the relations between these nodes. All the relations we consider are non-directional (symmetrical).



[1] Padgett, J.F. (1994): Marriage and Elite Structure in Renaissance Florence, 1282-1500. ([http://home.uchicago.edu/~jpadgett/papers/unpublished/maelite.pdf](http://home.uchicago.edu/~jpadgett/papers/unpublished/maelite.pdf))



### Data

You can find the florentine family network data in **`data/florentine-family.json`**. The data consists of a list of nodes and links as below:

```json
{
    "nodes": [
        {
            "Family": "Acciaiuoli",
            "Wealth": "10",
            "NumberPriorates": "53"
        },
        {
            "Family": "Albizzi",
            "Wealth": "36",
            "NumberPriorates": "65"
        },

        ...
    ],
    "links": [
        {
            "type": "marriage",
            "source": 0,
            "target": 8
        },
        {
            "type": "marriage",
            "source": 1,
            "target": 5
        },
        ...
        {
            "type": "business",
            "source": 5,
            "target": 8
        },
        {
            "type": "business",
            "source": 6,
            "target": 3
        },
        ...
    ]
}
```
Each node represents a family and has multiple attributes such as a family name, wealth (each family's net wealth in thousands of lira; in 1427), and priorates (seats on the civic council).

[//]: # (Source: [http://svitsrv25.epfl.ch/R-doc/library/ergm/html/flomarriage.html](http://svitsrv25.epfl.ch/R-doc/library/ergm/html/flomarriage.html)

## Visualization


In this lab you will build a custom visualization with D3 that will look like this one:

![Lab 8 - Preview](img/instruction/lab8-preview.gif?raw=true "Lab 8 - Preview")

 The [adjacency matrix representation](https://en.wikipedia.org/wiki/Adjacency_matrix) is an alternative to the node-link representation of network data. Unlike a [conventional matrix diagram](https://bost.ocks.org/mike/miserables/), this sortable matrix visualization can encode two types of relationships simultaneously.

*Implementation checklist:*

- Create a matrix visualization that visualizes the relations between these 16 families
- Label the rows and columns with the corresponding family names
- Draw two triangles in each cell to encode both relationships (marriages and business ties)
- Make the matrix sortable (at least the rows but optionally also the columns)
- Include animated transitions to make it easier to follow changes



*We suggest that you go through the following four iterations:*

![Lab 8 - Iterations](img/instruction/lab8-iterations.png?raw=true "Lab 8 - Iterations")

Ideally you should be able to complete this lab on your own. But we give you some more pointers and hints below.  

---
#### Loading data

Load the family network data and inspect the content.

```javascript
d3.json('data/florentine-family.json').then(data=>{
    console.log(data); 
});
```

#### Transform the data

The current format of the data is not ideal for a matrix visualization. So, write a function ```transform``` that takes the original data as an input and transforms into a matrix-like format.

```javascript
function transform(data){
    let rows = [],
        n=data.nodes.length;

    rows = data.nodes.map((node,i)=>(
        {
            ...node,
            index : i,
            numMarriages : 0,
            numBusinessTies : 0,
            numAllRelations : 0,
            cols: d3.range(n).map(j=>({r:i, c:j, marriage: 0, business:0}))
        }
    ))
	data.links.forEach(function(link) {
        // count links for reordering later
		rows[link.source].numAllRelations += 1;
		rows[link.target].numAllRelations += 1;

		if (link.type==='marriage'){
			rows[link.source].cols[link.target].marriage = 1;

			rows[link.source].numMarriages += 1;
			rows[link.target].numMarriages += 1;
		}
		if (link.type==='business'){
			rows[link.source].cols[link.target].business = 1;

			rows[link.source].numBusinessTies += 1;
			rows[link.target].numBusinessTies += 1;
		}
    });
    return rows;
}
```
Note the above code initializes each column using [`d3.range`](https://github.com/d3/d3-array#range) that generates a list of numbers from 1 to the given number `n`. The following loop through the links set 1 in `marriage` or `business` if there is a link between the source and target. When both `marriage` and `business` is 0, then there is no link and thus assigned grey.

The matrix representation takes up more space than the original format. In the original format, the space complexity was *O(n)* and *O(e)* where *n* is the number of nodes and *e* is the number of links. On the other hand, in the adjacency matrix notation, the space complexity becomes *O(n^2)*. 

To support the vertical reordering of the matrix based on a measure, the above code also counts the number of links per each row.


#### Reusable Chart Definition

First, start by defining a reusable chart function in the `js/Matrix.js`:

```javascript
export default function Matrix(){
	// init size
	let margin ={ top: 100, right: 20, bottom: 20, left: 100 };
	let size = 600;

    // Color definitions
    let pos = d3.scaleBand();

    function chart(selection){
        selection.each(function(data){
            // draw a chart here
        }
    }
    return chart;
}
```
We will use [scaleBand](https://observablehq.com/@d3/d3-scaleband) to position visual marks in the matrix diagram. Since the diagram is square, we don't need to consider `width` and `height` of the diagram separately and just use `size`.

In the `main.js`, you can use this function in the following way as we did in the previous lab:

```javascript
import Matrix from './Matrix.js';
let matrix = Matrix();
let viewData; //save data globally
d3.json('data/florentine-family.json').then(data=>{
		
	viewData = transform(data);

	d3.select('#chart-area')
		.datum(viewData)
        .call(matrix);
        
});

```
#### Position Scale

In the chart update function, start by updating the position scale:

```javascript
// Update Scales
pos.domain(d3.range(data.length))
    .rangeRound([0, size - margin.left - margin.right])
    .paddingInner(0.25);
```
The domain of `scaleBand` must be categories while its output is continuous. We use `d3.range` to generate artificial categories whose size is equal to the number of rows (or columns). The scale then automatically calculates the size of each based on the number of rows and the size of the canvas as below:

![scaleBand](https://raw.githubusercontent.com/d3/d3-scale/master/img/band.png)

#### Initialize SVG

We initialize the **internal svg structure** following the margin convention, before start rendering the matrix diagram:
```javascript
let svg = d3.select(this).selectAll('svg')
    .data([data]);

// to add svg only once
let svgEnter = svg.enter().append('svg');
svgEnter.append('g');

svg = svg.merge(svgEnter); // merge with the update selection

// update canvas size
svg.attr("width", size).attr("height", size);

let g = svg.select("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
```


#### Draw a Simple Matrix Diagram

You can star by drawing a simpler diagram focusing on just marriage relationships using rectangles.

```javascript
// Draw matrix rows (and y-axis labels)
let dataJoin = g.selectAll(".matrix-row")
    .data(data);

let rowsGroups = dataJoin.enter()
    .append("g")
    .attr("class", "matrix-row");

rowsGroups.merge(dataJoin)  // merge ENTER + UPDATE groups
    .attr("transform", (d,i)=>"translate(0," + pos(i) + ")");

// Draw marriage triangles within each group
rowsGroups.selectAll(".matrix-cell")
    .data(d=> d.cols)
    .enter().append("rect")
    .attr('x', (d,i)=>pos(i))
    .attr('width', pos.bandwidth())
    .attr('height', pos.bandwidth())
    .attr("fill", d=>d.marriage == 0 ? "#ddd" : "#8686bf")
```
Please note the nested update-enter pattern. For each row, it is using the column data (`d.cols`) to create individual cells.

This will draw the first quadrant of the figure above, just showing rectangles. Each row is a SVG group that contains a list of rectangles. Each purple rectangle represents a marriage. When there is no marriage link, the color of the rectangle is gray.

#### Draw Row and Column Labels

For row labels, you need to add a SVG text element within each row group.

```javascript
rowsGroups.append("text")
    .attr("class", "matrix-row-label")
    .attr("y", pos.bandwidth() / 2)
    .attr("dx", -10)
    .attr("text-anchor", "end")
    .attr("alignment-baseline", "middle")
    .text(d=>d.Family);
```

On the other hand, for column labels, they reside in the parent group separated from the rows. 

```javascript
g.selectAll(".matrix-column-label")
    .data(data).enter().append("text")
    .attr("class", "matrix-column-label")
    .attr("alignment-baseline", "middle")
    .attr("transform", function(d, i){
        return "translate(" +( pos(i)+ pos.bandwidth()/2)+ ",-8) rotate(270)"
    })
    .text(d=> d.Family);
```

Please note that the labels are essentially the same (i.e., family names). We use `transform` instead of `x` and `y` in order to make the labels vertical. You might be able to do the same using [`writing-mode`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/writing-mode) attribute as well. 

For the column names, you only need to care about the enter selection because they are drawn only once (unless you also want to reorder columns later on). 

To appropriately position text elements, you need to be familiar with the following properties:
1. [dx, dy](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text)
3. [text-anchor](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor)
4. [alignment-baseline](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/alignment-baseline)


#### Draw Triangles

Instead of drawing one rectangle, we can stack two triangles on top of each other. As a result, users can see at first glance which families have multiple relationships and other further details.

![Lab 8 - Triangles](img/instruction/lab8-triangles.png?raw=true "Lab 8 - Triangle Example")

In SVG you can create lines, circles, rectangles etc, but not directly triangles. Therefore, you have to use the *path* element. You have used SVG's path already, but most likely always in combination with the D3 path generator. Now, you have to specify the path manually.

* D3 provides various symbols including a triangle, but the exact shape is not what we want in this lab: see [symbols](https://github.com/d3/d3-shape#symbol).

The path information is specified within the ```d``` attribute:

```html
<svg height="250" width="300">
    <path d="M150 5 L75 200 L225 200 Z" fill="blue" />
</svg>
```

- ```M```: translates to "move to" and specifies the starting point (x/y coordinate)
- ```L```: translates to "line to" and draws a line from the current point to the following coordinates
- ```Z```: translates to "close path". It closes the triangle path by connecting the last point with our initial point.

There are more commands but for our use case, the above mentioned options are sufficient. *Important: uppercase commands indicate absolute coordinates and their lowercase counterparts indicate a coordinate relative to the previous coordinate.*

![Lab 8 - TrianglePath](img/instruction/lab8-triangle-path.png?raw=true "Lab 8 - Triangle Path")


Let's change the code above so that you draw two triangles instead of the previous rectangle. One triangle represents the marriage information, while the other one indicates the business information.

1. **Drawing Marriages**
```javascript
rowsGroups.selectAll(".matrix-cell-marriage")
    .data(d=> d.cols)
    .enter().append("path") // only use enter since the matrix size does not change.
    .attr("class", "matrix-cell-marriage")
    .attr('d', (d, i)=>'M ' + pos(i) +' '+ 0 + ' l ' + pos.bandwidth() + ' 0 l 0 ' + pos.bandwidth() + ' z')
    .attr("fill", d=>d.marriage == 0 ? "#ddd" : "#8686bf");
```
2. **Drawing Business Ties**

```javascript
rowsGroups.selectAll(".matrix-cell-business")
    .data(d=> d.cols)
    .enter().append("path")
    .attr("class", "matrix-cell matrix-cell-business")
    .attr('d', (d,i)=>'M ' + pos(i) +' '+ 0 + ' l 0 ' + pos.bandwidth() + ' l ' + pos.bandwidth() + ' 0 z')
    .attr("fill", d=>d.business == 0 ? "#ddd" : "#fbad52");
```

---

#### Reorderable Matrix

By now you have implemented your custom matrix visualization, including triangles. Next, you will improve it with a basic sorting function.

The user should be able to sort the rows by
- Family name (default)
- Number of business ties
- Number of marriages
- Number of all relationships
- Wealth
- Number of seats hold in the civic council (priorates)

By default, the families should be ordered by their surname.

We already create a select box in the `index.html`:
```html
    <select id="select-order-type" class="form-control input-sm">
        <option value="index">Family</option>
        <option value="numAllRelations">All types of relations</option>
        <option value="numBusinessTies">Business Ties</option>
        <option value="numMarriages">Marriages</option>
        <option value="Wealth">Wealth</option>
        <option value="NumberPriorates">Seats hold on the civic council</option>
    </select>
```


In the `main.js`, add an event listener for the change event of the select box:
```javascript


document.querySelector("#select-order-type").addEventListener("change", function(){
	// Update sorting
	let orderingType = this.value;
	// Sort viewData
	d3.select('#chart-area')
		.call(matrix);

});

```
You already saved the transformed data globally in `viewData` variable. Sort the data in place using the built-in array sort function:

```javascript
	viewData.sort( function(a, b){
		if(orderingType == "index")
			return a[orderingType] - b[orderingType];
		else
			return b[orderingType] - a[orderingType];
	});
```

For the family names, we are arranging the rows in ascending order (i.e., alphabetical order, returning -1 if a is less than b, or 1 if a is greater than b, or 0).

When you change the selection, the order of rows will not update. That is because we are currently using the array index of the rows as its key. In order words, we need to change the following code:

```javascript
let dataJoin = g.selectAll(".matrix-row")
    .data(data, d=>d.index);
```

to 

```javascript
let dataJoin = g.selectAll(".matrix-row")
    .data(data, d=>d.Family);
```

so that D3 can correctly identify which row needs to be updated. 

#### Adding Transitions

Right now, the update does not provide good feedback making the gulf of evaluation wider. You can add animations to make it easier to follow when the sorting of the data is being updated. 

You can add transitions after merging the enter and update selections of the row groups as below:
```javascript
rowsGroups.merge(dataJoin)  // merge ENTER + UPDATE groups
    .style('opacity', 0.5)
    .transition()
    .duration(1000)
    .style('opacity', 1)
    .attr("transform", (d,i)=>"translate(0," + pos(i) + ")");
```

![Lab 8 - Transition](img/instruction/lab8-transition.gif?raw=true "Lab 8 - Transition")

*(Notice: we made the transition particularly slow for demonstration purposes)*

---

#### Highlight Cells on *Mouseover*

When the user hovers over a cell, highlight all cells that are in the same row or in the same column of the matrix.

*Preview:*

![Lab 8 - Mouseover](img/instruction/lab8-mouseover.gif?raw=true "Lab 8 - Mouse Over")

First, you need to attach `mouseover` and `mouseout` events to each cell.
```javascript
    rowsGroups.selectAll(".matrix-cell-marriage")
        ... // see code above
        .attr("class", "matrix-cell matrix-cell-marriage")
        .on("mouseover", handleMouseoverCell)
        .on("mouseout", handleMouseoutCell);

    rowsGroups.selectAll(".matrix-cell-business")
        ... // see code above
        .attr("class", "matrix-cell matrix-cell-business")
        .on("mouseover", handleMouseoverCell)
        .on("mouseout", handleMouseoutCell);
```

Here we added another class name `matrix-cell` so that it is easier to select all cells together in the mouse event handlers.


Let's define each mouse event handler. 

1. **Mouseover**

```javascript
function handleMouseoverCell(d,i){
    let row = d3.select(this.parentNode).datum().index; // parent: row
    let col = i;
    let g = d3.select(this.parentNode.parentNode);// get group

    g.selectAll(".matrix-cell")
        .filter(d=>d.r!==row&&d.c!==col)
        .transition()
        .duration(200)
        .attr("fill-opacity", 0.2);

};
```
Within the hander, [`this`](https://github.com/d3/d3-selection#handling-events) contains a current node in focus. In our case, it is the SVG path representing the triangle cell. You can traverse the DOM tree to retrieve its ancestors such as its parent row group (`this.parentNode`) and the group above the parent (`this.parentNode.parentNode`). 

To get the row data, you select the parent node and call `datum`. 
The above code is retrieving the original row (`row`) and column number (`col`) and use the numbers to visually filter out non-focus rows and columns by setting its opacity to `0.2`. And, do the opposite for `mouseout` event. 


2. **Mouseout**
```javascript
function handleMouseoutCell(){
    let g = d3.select(this.parentNode.parentNode);// get group
    g.selectAll(".matrix-cell")
        .transition()
        .duration(200)
        .attr("fill-opacity", 1);
};
```

Similarly, when the mouse is out of focus, you can revert the opacity. In this case, you don't need a specific row and column number.



-----


### Submission of lab 

Please submit the **Github Pages url**, as well as **the link to the repository**, to Canvas.

Thanks!
-----

**Resources**

- Custom visualizations with D3: [http://jsdatav.is/chap07.html#creating-a-unique-visualization](http://jsdatav.is/chap07.html#creating-a-unique-visualization)
- SVG for beginners: [http://unicorn-ui.com/blog/svg-for-beginners.html](http://unicorn-ui.com/blog/svg-for-beginners.html)
- D3 object constancy: [https://bost.ocks.org/mike/constancy/](https://bost.ocks.org/mike/constancy/)
- Padgett Florentines Families: [http://home.uchicago.edu/~jpadgett/papers/unpublished/maelite.pdf](http://home.uchicago.edu/~jpadgett/papers/unpublished/maelite.pdf)

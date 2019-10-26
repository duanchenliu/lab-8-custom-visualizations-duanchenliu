
import Matrix from './Matrix.js';
let matrix = Matrix();
let viewData; //save data globally

// Use queue.js to read the two datasets asynchronous
d3.json('data/florentine-family.json').then(data=>{
    console.log(data); 
    viewData = transform(data);

	d3.select('#chart-area')
		.datum(viewData)
        .call(matrix);
});

function transform(data){
    let rows = [],
        n = data.nodes.length;
    // console.log(n);

    rows = data.nodes.map((node,i)=>({
        ...node,
        index : i, //keep the original order of each row
        numMarriages : 0,
        numBusinessTies : 0,
        numAllRelations : 0,
        cols: d3.range(n).map(j=>({r:i, c:j, marriage: 0, business:0}))//initialize to 0
        //d3.range generates a list of numbers from 1 to the given n
    }))
    data.links.forEach(function(link){
        //loop through the links set 1 in marriage or business 
        // if there is a link between the source and the target.
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
    console.log(rows);
    return rows;
}

document.querySelector("#select-order-type").addEventListener("change", function(){
	let type = this.value;
	viewData.sort((a, b)=>type == "index"? (a[type] - b[type]) : b[type] - a[type]);
	d3.select('#chart-area')
		.call(matrix);

});

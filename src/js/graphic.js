import cleanData from './clean-data';
import loadData from './load-data';

const MARGIN = {
  top: 100,
  bottom: 220,
  left: 30,
  right: 20
}

const FONT_SIZE = 10;
const GOLDEN_REC = 0.618
const GOLDEN_RAT = 1.618
let width = 0;
let height = 0;
let movieData = null;
let $transTime = 0;
/* global d3 */
const $section = d3.select('#main');
const $graphic = $section.select('.scroll__graphic');
const $text = $section.select('.scroll__text');
const $step = $text.selectAll('.step');

const $chart = $graphic.select('.graphic__chart');
const $svg = $chart.select('svg');
const $gVis = $svg.select('.g-vis');
const $gAxis = $svg.select('.g-axis');



function getScaleX(data) {
  return d3
    .scaleBand()
    .domain(data.sort((a, b) => b.vulgarities - a.vulgarities).map(d => d.title))
    .range([0,width])
    .paddingInner(0.4)
    .paddingOuter(0.3)
    .round(true)
    .align(0.5);
}

function getScaleY(data) {
  return d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.vulgarities)])
    .range([height,0])
    .nice();

}

function wrap(text, width) {
  text.each(function () {
    var text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      x = text.attr("x"),
      y = text.attr("y"),
      dy = parseFloat(text.attr("dy")) ? parseFloat(text.attr("dy")) : 0,
      tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em")
    while (word = words.pop()) {
      line.push(word)
      tspan.text(line.join(" "))
      if (tspan.node().getComputedTextLength() > width) {
        line.pop()
        tspan.text(line.join(" "))
        line = [word]
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", `${++lineNumber * lineHeight + dy}em`).text(word)
      }
    }
  })
}


function drawFirst() {
  const data = movieData;
  const scaleX = getScaleX(data);
  const scaleY = getScaleY(data);

    //AXES
    const axisY = d3.axisLeft(scaleY)
      .tickPadding(FONT_SIZE)
      .tickSize(-width)
      .ticks(4);

    $gAxis.select('.axis--y')
      .call(axisY)
      .at({
        transform: `translate(${MARGIN.left},${MARGIN.top})`
      });

    const axisX = d3.axisBottom(scaleX)
      .tickPadding(FONT_SIZE / 2)
      .tickSize(0);
  
    $gAxis.select('.axis--x')
      .call(axisX)
      .at({
        transform: `translate(${MARGIN.left},${height + MARGIN.top})`
      })
      .selectAll(".tick text")
      // .call(wrap, scaleX.bandwidth())
      .attr("y", -5)
      .attr("x", -10)
      // .attr("dy", ".2em")
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "end");


    //TITLE
    $svg.selectAll('text.heading')
      .remove();

    $svg.append('text')
      .text('● THE OSCAR WINNING VOCABULARY')
      // .text('the enviromental guilt of having kids')
      .at({
        'class': 'heading',
        'transform': `translate(${0},${MARGIN.top/4})`
    });

    //SUBTITLE
    $svg.selectAll('text.subheading')
      .remove();

    $svg.append('text')
      .text('Count of bad words used in movies.')
      .at({
        'class': 'subheading',
        'transform': `translate(${0},${MARGIN.top/1.8})`
      })

    // $svg.append('text')
    // .text('(tonnes CO₂ per year)')
    // .at({
    //   'class': 'subheading',
    //   'transform': `translate(${0},${MARGIN.top/1.35})`
    // })

    //DATA
    $svg.selectAll('text.source')
      .remove();

    $svg.append('text')
      .text(`data: yifysubtitles.com`)
      .at({
        'class': 'source',
        'transform': `translate(${0},${height+MARGIN.top+MARGIN.bottom - 5})`,
        'text-anchor':'start'
    });

    //axis-label
    $svg.selectAll('text.brand')
      .remove();

    $svg.append('text')
      .text(`trendspotting.site`)
      .at({
        'class': 'brand',
        'transform': `translate(${width+MARGIN.left},${height+MARGIN.top+MARGIN.bottom - 5})`,
        'text-anchor':'end'
    });

    //VIZ
    //define .emission objects carrying datapoints
    const $emission= $gVis
      .select('.emissions')
      .selectAll('.emission')
      .data(data);

    const $emissionEnter = $emission.enter().append('g.emission');

    // //update paths/circles/rects with .merge  
    const $emissionMerge = $emissionEnter.merge($emission);

    const $tooltip = d3.select("body").append("div.tooltip")
      .st({
        "position": "absolute",
        "z-index": "10",
        "visibility": "hidden",
        "padding": "5px",
        "background-color": "white",
        "opacity": "0.8",
        "border": "1px solid #ddd",
        "border-radius": "5%",
        "max-width": "200px"
      })
      .st({
        "text-align": "center",
      });

    $emissionEnter
      .append('rect')
      .on("mouseover", function(){
        $gVis.select('.callout')
          .selectAll('*')
          .remove();
        return $tooltip.style("visibility", "visible").text(this.__data__['vulgarities'] + ' vulgarities')
      })
      .on("mousemove", function(){return $tooltip.style("top", (event.pageY+15)+"px").style("left",(event.pageX+15)+"px");})
      .on("mouseout", function(){return $tooltip.style("visibility", "hidden");});

    $emissionMerge
      .selectAll('.emission rect')
      .at({
        width: scaleX.bandwidth(),
        y: function (d) {
          return scaleY(d.vulgarities);
        },
        x: function (d) {
          return scaleX(d.title);
        },
        height: function (d) {
          return height - scaleY(d.vulgarities);
        },
      });
}

// Set-up the export button
d3.select('#saveButton').on('click', function(){
  const svgString = getSVGString($svg.node());
  console.log(svgString);
	svgString2Image( svgString, 5*width, 5*height, 'png', save ); // passes Blob and filesize String to the callback

	function save( dataBlob, filesize ){
		saveAs( dataBlob, 'D3 vis exported to PNG.png' ); // FileSaver.js function
	}
});


// getSVGString ( svgNode ) and svgString2Image( svgString, width, height, format, callback )
function getSVGString( svgNode ) {
	svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
  const cssStyleText = getCSSStyles(svgNode);
  console.log(svgNode);
	appendCSS( cssStyleText, svgNode );

	let serializer = new XMLSerializer();
	let svgString = serializer.serializeToString(svgNode);
	svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
	svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

	return svgString;

	function getCSSStyles( parentElement ) {
		let selectorTextArr = [];

		// Add Parent element Id and Classes to the list
		selectorTextArr.push( '#'+parentElement.id );
		for (let c = 0; c < parentElement.classList.length; c++)
				if ( !contains('.'+parentElement.classList[c], selectorTextArr) )
					selectorTextArr.push( '.'+parentElement.classList[c] );

		// Add Children element Ids and Classes to the list
		let nodes = parentElement.getElementsByTagName("*");
		for (let i = 0; i < nodes.length; i++) {
			let id = nodes[i].id;
			if ( !contains('#'+id, selectorTextArr) )
				selectorTextArr.push( '#'+id );

			let classes = nodes[i].classList;
			for (let c = 0; c < classes.length; c++)
				if ( !contains('.'+classes[c], selectorTextArr) )
					selectorTextArr.push( '.'+classes[c] );
		}

		// Extract CSS Rules
		let extractedCSSText = "";
		for (let i = 0; i < document.styleSheets.length; i++) {
			let s = document.styleSheets[i];
			
			try {
			    if(!s.cssRules) continue;
			} catch( e ) {
		    		if(e.name !== 'SecurityError') throw e; // for Firefox
		    		continue;
		    	}

      let cssRules = s.cssRules;
			for (let r = 0; r < cssRules.length; r++) {
				if ( contains( cssRules[r].selectorText, selectorTextArr ) )
					extractedCSSText += cssRules[r].cssText;
			}
		}
		
    return extractedCSSText;

		function contains(str,arr) {
			return arr.indexOf( str ) === -1 ? false : true;
		}
	}
	function appendCSS( cssText, element ) {
		let styleElement = document.createElement("style");
		styleElement.setAttribute("type","text/css"); 
		styleElement.innerHTML = cssText;
		let refNode = element.hasChildNodes() ? element.children[0] : null;
		element.insertBefore( styleElement, refNode );
	}
}


function svgString2Image( svgString, width, height, format, callback ) {
	format = format ? format : 'png';

	const imgsrc = 'data:image/svg+xml;base64,'+ btoa( unescape( encodeURIComponent( svgString ) ) ); // Convert SVG string to data URL

	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");

	canvas.width = width;
	canvas.height = height;

	const image = new Image();
	image.onload = function() {
		context.clearRect ( 0, 0, width, height );
		context.drawImage(image, 0, 0, width, height);

		canvas.toBlob( function(blob) {
			const filesize = Math.round( blob.length/1024 ) + ' KB';
			if ( callback ) callback( blob, filesize );
		});

		
	};

	image.src = imgsrc;
}

function updateDimensions() {
  const h = window.innerHeight;
  width = $chart.node().offsetWidth - MARGIN.left - MARGIN.right;
  height = Math.floor(h * 0.85) - MARGIN.top - MARGIN.bottom;
}

function resize() {
  updateDimensions();
  $svg.at({
    width: width + MARGIN.left + MARGIN.right,
    height: height + MARGIN.top + MARGIN.bottom
  });
  $gVis.at('transform', `translate(${MARGIN.left},${MARGIN.top})`);
  drawFirst();
}

function init() {
  loadData('data_sentiment.csv').then(result => {
    movieData = cleanData.cleanData(result).filter(function(d){
      if(d.vulgarities > 0) {
        return d.title;
      }
    });
    console.log(movieData);
    resize();
    drawFirst();
  });
}

export default {
  init,
  resize
};
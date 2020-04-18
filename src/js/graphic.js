import cleanData from './clean-data';
import loadData from './load-data';

const MARGIN = {
  top: 100,
  bottom: 50,
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

const $app = $graphic.selectAll('.dash-app');
const $chart = $graphic.select('.graphic__chart');
const $svg = $chart.select('svg');
const $gVis = $svg.select('.g-vis');
const $gAxis = $svg.select('.g-axis');
const formatYear = d3.timeFormat("%Y");

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
    .domain([0, d3.max(data, d => d.vulgarities)*1.25])
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
  
    // $gAxis.select('.axis--x')
    //   .call(axisX)
    //   .at({
    //     transform: `translate(${MARGIN.left},${height + MARGIN.top})`
    //   })
    //   .selectAll(".tick text")
    //   // .call(wrap, scaleX.bandwidth())
    //   .attr("y", -4)
    //   // .attr("x", scaleY(d.vulgarities))
    //   .attr("x", height+20)
    //   // .attr("dy", ".2em")
    //   .attr("transform", "rotate(-90)")
    //   .style("text-anchor", "end");


    //TITLE
    $svg.selectAll('text.heading')
      .remove();

    $svg.append('text')
      .text('● OSCAR WINNERS')
      // .text('the enviromental guilt of having kids')
      .at({
        'class': 'heading',
        'transform': `translate(${0},${30})`
    });

    //SUBTITLE
    $svg.selectAll('text.subheading')
      .remove();

    $svg.append('text')
      .text('Count of bad words used in movies that won the academy award.')
      .at({
        'class': 'subheading',
        'transform': `translate(${0},${60})`
      })

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
    //define .movie objects carrying datapoints
    const $movie= $gVis
      .select('.movies')
      .selectAll('.movie')
      .data(data);

    const $movieEnter = $movie.enter().append('g.movie');

    // //update paths/circles/rects with .merge  
    const $movieMerge = $movieEnter.merge($movie);

    const $tooltip = d3.select("body").append("div.tooltip")
      .st({
        "position": "absolute",
        "z-index": "10",
        "visibility": "hidden",
        "padding": "5px",
        "background-color": "white",
        "opacity": "0.9",
        "border": "1px solid #ddd",
        "border-radius": "5%",
        "max-width": "200px"
      })
      .st({
        "text-align": "center",
      });

    $movieEnter
      .append('rect')
      .on("mouseover", function(){
        $gVis.select('.callout')
          .selectAll('*')
          .remove();
        return $tooltip.style("visibility", "visible").text(this.__data__['vulgarities'] + ' bad words')
      })
      .on("mousemove", function(){return $tooltip.style("top", (event.pageY+15)+"px").style("left",(event.pageX+15)+"px");})
      .on("mouseout", function(){return $tooltip.style("visibility", "hidden");});

    $movieMerge
      .selectAll('.movie rect')
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


    $movieEnter
      .append('text');

    $movieMerge
      .selectAll('.movie text')
      .at({
        y: function (d) {
          return scaleX(d.title)+width*0.0125;
        },
        x: function (d) {
          return scaleY(-d.vulgarities) - height*2 + 5;
        },
        transform: "rotate(-90)",
        // dy: 1
      })
      .text( function (d) {
        return `${d.title}, ${formatYear(d.year)}`;
      });
}

function updateDimensions() {
  const h = window.innerHeight;
  width = $chart.node().offsetWidth - MARGIN.left - MARGIN.right;
  height = Math.floor(h * 0.7) - MARGIN.top - MARGIN.bottom;
}

function resize() {
  updateDimensions();
  $svg.at({
    width: width + MARGIN.left + MARGIN.right,
    height: height + MARGIN.top + MARGIN.bottom
  });
  $app.at({
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
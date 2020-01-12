import scrollama from 'scrollama';
import stickyfill from 'stickyfilljs';
import cleanData from './clean-data';
import { isAbsolute } from 'path';

const MARGIN = {
  top: 60,
  bottom: 60,
  left: 110,
  right: 50
}

const FONT_SIZE = 12;
const GOLDEN_REC = 0.618
const GOLDEN_RAT = 1.618
let width = 0;
let height = 0;
let emissionsData = null;
let currentStep = 'intro';
let sequence = [];
let status = {};
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

const scroller = scrollama();

const emissions_max = 165
const emissions_savings = 39
//165 dots in total, with golden proportion 1:1.618 => x side = 17 dots, y side = 10 dots
let displaydata = [];
let c = 17;
let r = 10;
let z = 0;

for (let i = 0; i < c; i++) {
  for (let j = 0; j < r; j++) {
    displaydata.push({
      x: i + 1,
      y: j + 1,
      c: colour(z)
    });
    z = z + 1;
    if (z >= emissions_max) {
      break;
    }
  };
};

function colour(z) {
  if (z <= emissions_savings) {
    return "#00a0b0";
  } else {
    return "#cc2a36";
  };
};

function getScaleXintro(data) {
  return d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.x)])
    .range([0, width]);
}

function getScaleYintro(data) {
  return d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.y)])
    .range([height, 0]);
}

function getScaleXemission(data) {
  return d3
    .scaleLinear()
    .domain([-20, d3.max(data, d => d.emission_kg) + 20])
    .range([0, width]);
}

function getScaleYemission(data) {
  return d3
    .scaleBand()
    .domain(data.sort((a, b) => a.emission_kg - b.emission_kg).map(d => d.activity))
    .range([height, 0])
    .padding(1);
}

function getScaleXText(data) {
  return d3
    .scaleBand()
    .domain(data.sort((a, b) => b.emission_kg - a.emission_kg).map(d => d.activity))
    .range([0, width])
    .padding(0.2);
}

function drawRect(data, scaleX, scaleY) {

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

//STEPS
const STEP = {
  'intro': () => {},
  'quarter': () => {},
  'cleveland_intro': () => {},
  'cleveland': () => {}
}

function updateDimensions() {
  const h = window.innerHeight;
  width = $chart.node().offsetWidth - MARGIN.left - MARGIN.right;
  height = Math.floor(h * GOLDEN_REC) - MARGIN.top - MARGIN.bottom;
}

function updateStep() {
  STEP[currentStep]();
}

function resize() {
  updateDimensions();
  $svg.at({
    width: width + MARGIN.left + MARGIN.right,
    height: height + MARGIN.top + MARGIN.bottom
  });
  $gVis.at('transform', `translate(${MARGIN.left},${MARGIN.top})`);
  $step.st('height', Math.floor(window.innerHeight * 0.3));
  updateStep();
}

function handleStepEnter({
  index,
  element,
  direction
}) {
  if (sequence.length >= 2) {
    sequence.shift();
  }
  currentStep = d3.select(element).at('data-step');
  sequence.push({
    currentStep: currentStep,
    step: 'enter',
    index: index,
    element: element,
    direction: direction
  });
  if (sequence.length > 1 && sequence[0].currentStep != sequence[1].currentStep && sequence[1].index < sequence[0].index) {
    status = 'reverse';
  } else if (sequence.length > 1 && sequence[0].currentStep != sequence[1].currentStep && sequence[1].index > sequence[0].index) {
    status = 'switch_down';
  } else {
    status = direction;
  };
  updateStep();
}

function handleStepExit({
  index,
  element,
  direction
}) {
  if (sequence.length >= 2) {
    sequence.shift();
  }
  sequence.push({
    currentStep: currentStep,
    step: 'exit',
    index: index,
    element: element,
    direction: direction
  });
}

function setupScroller() {
  scroller.setup({
      step: $step.nodes(),
      offset: 0.5
    }).onStepEnter(handleStepEnter)
    .onStepExit(handleStepExit)
}

function loadData() {
  return new Promise((resolve, reject) => {
    d3.loadData('assets/data/data_sentiment.csv', (err, response) => {
      if (err) reject(err)
      emissionsData = cleanData.cleanData(response[0]);
      resolve();
    });
  })
}

function init() {
  loadData().then(() => {
    //console.log(emissionsData);
    resize();
    setupScroller();
  });
}

export default {
  init,
  resize
};

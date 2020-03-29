function cleanData(data) {
    //const parseYear = d3.timeParse("%Y");
	return data.map(d => ({
		...d,
        vulgarities: +d.vulgarities
	}));
}
export default {cleanData};

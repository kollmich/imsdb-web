function cleanData(data) {
    const parseDate = d3.timeParse("%Y-%m-%d");
	return data.map(d => ({
		...d,
		vulgarities: +d.vulgarities,
		year: parseDate(d.year)
	}));
}
export default {cleanData};

/* global d3 */
/* usage
	import loadData from './load-data'
	
	loadData('file.csv').then(result => {
		console.log(result);
	}).catch(console.error);

	loadData(['file1.csv', 'file2.json]).then(result => {
		console.log(result);
	}).catch(console.error);
*/
function loadA(file) {
  return new Promise((resolve, reject) => {
    d3.csv(`assets/data/${file}`)
      .then(result => {
        // clean here
        resolve(result);
      })
      .catch(reject);
  });
}

function loadData() {
  const loads = [loadA('data_sentiment.csv'),loadA('data_sentiment.csv')];
  return Promise.all(loads);
}

export default loadData;
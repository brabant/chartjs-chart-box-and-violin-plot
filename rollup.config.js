// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
	dest: 'build/Chart.BoxPlot.js',
	format: 'umd',
	external: ['chart.js'],
	globals: {
		'chart.js': 'Chart'
	},
	moduleName: 'ChartBoxPlot',
	plugins: [resolve(), commonjs()]
};
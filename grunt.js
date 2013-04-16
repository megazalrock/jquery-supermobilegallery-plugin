/*global module:false*/
module.exports = function(grunt){
	var jsFiles = [
		'src/core.js'
	];
	grunt.initConfig({
		//lint
		lint: {
			files : [
				'grunt.js',
				'src/core.js'
			]
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				eqnull: true,
				browser: true
			},
			globals: {
				jQuery: true
			}
		},
		//watch
		watch : {
			dist : {
				files : jsFiles,
				tasks:'concat min'
			},
			less : {
				files : ['demo/style.less'],
				tasks:'less'
			}
		},
		concat:  {
			dist : {
				src : jsFiles,
				dest : 'jquery-supermobile-gallery.js'
			}
		},
		min: {
			dist :{
				src : ['jquery-supermobile-gallery.js'],
				dest : 'jquery-supermobile-gallery.min.js'
			}
		},
		less : {
			dist : {
				src : ['demo/style.less'],
				dest : 'demo/style.css'
			}
		}
	});
	grunt.registerTask('default', 'concat min less');
};
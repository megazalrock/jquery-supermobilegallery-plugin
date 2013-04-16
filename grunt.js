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
			}/*,
			css : {
				files : ['path/to/style.css'],
				tasks:'concat'
			},*/
			/*less : {
				files : ['shr/css/dress.less'],
				tasks:'less'
			}*/
		},
		concat:  {
			dist : {
				src : jsFiles,
				dest : 'jquery-supermobile-gallery.js'
			}/*,
			css : {
				sec : ['path/to/style.css'],
				dest : 'path/to/style_result.css'
			}*/
		},
		min: {
			dist :{
				src : ['jquery-supermobile-gallery.js'],
				dest : 'jquery-supermobile-gallery.min.js'
			}
		}/*,
		less : {
			dist : {
				src : ['shr/css/dress.less'],
				dest : 'shr/css/dress.css'
			}
		}*//*,
		cssmin : {
			dist : {
				src : ['path/to/css.css'],
				dest : 'path/to/css.min.css'
			}
		},*/
	});
	grunt.registerTask('default', 'concat min');
};
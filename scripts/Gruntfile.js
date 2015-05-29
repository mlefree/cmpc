

module.exports = function(grunt) {
	'use strict';

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options: {
				separator: ' ',
			},
			js: {
				src: [
							'www/l4p/libs/js/jquery/jquery-2.0.3.min.js',
							'www/l4p/libs/js/angular/angular.min.js',
							'www/l4p/libs/js/angular/angular-touch.min.js',
							'www/l4p/libs/js/angular/angular-animate.min.js',
							'www/l4p/libs/js/angular/angular-sanitize.min.js',
							'www/l4p/libs/js/angular/angular-resource.min.js',
							'www/l4p/libs/js/angular/ui-bootstrap-tpls.min.js',
							'www/l4p/libs/js/bootstrap/bootstrap.min.js',
							'www/l4p/libs/js/md5.js',
							'www/l4p/libs/js/l4p.min.js',
							'www/l4p/libs/js/jquery-plugins/jquery.noty.js',
							'www/l4p/libs/js/jquery-plugins/jquery.autosize.js',
							'www/l4p/libs/js/jquery-plugins/jquery.easing.1.3.js',
							'www/l4p/libs/js/jquery-plugins/jquery.popcircle.1.0.js',
							//'www/l4p/libs/js/jquery-plugins/TimelineJS-master/compiled/js/storyjs-embed.js',
							'app/data/c4p_locale.js',
							'app/data/c4p_demo.js',
							'www/js/a4p/*.js',
							'www/js/controllers/*.js',
							'www/js/controllers/dialog/*.js',
							'www/js/directives/*.js',
							'www/js/partial_templated/*.js',
							'www/js/services/*.js',
							'www/js/*.js'
				],
			dest: 'mobile/js/<%= pkg.name %>.js',
			},
		},
		uglify: {
			dev : {
				options: {
					banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd HH:MM") %> */\n',
					mangle: false,
					beautify: true
				},
				files: {
					'mobile/js/<%= pkg.name %>.js' : 'mobile/js/<%= pkg.name %>.js'
				}
			},
			prod : {
					options: {
						banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd HH:MM") %> */\n',
						mangle: false,
						compress: {
							global_defs: {
								"DEBUG": false
							},
							dead_code: true,
							drop_console: true
						}
					},
					files: {
						'mobile/js/<%= pkg.name %>.js' : 'mobile/js/<%= pkg.name %>.js'
					}
			}
		},
		replace: {
			console: {
				src: ['mobile/js/<%= pkg.name %>.js'],
				overwrite: true,
				replacements: [
													//{from: /console\.log('?"?.*'?"?)/g,to: "a4pFakeConsoleLog()"},
													//{from: /a4p\.InternalLog\.log('?"?.*'?"?)/g,to: "a4pFakeConsoleLog()"},
													{from: /console\.log/g,to: "a4pFakeConsoleLog"},
													{from: /a4p\.InternalLog\.log/g,to: "a4pFakeConsoleLog"}
											]
			}
		},
		ngmin: {
			dev: {},
			prod: {
				src: 'mobile/js/<%= pkg.name %>.js',
				dest: 'mobile/js/<%= pkg.name %>.js'
			}
		},
		// cssmin: {
		// css: {
		// options: {
		// banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd HH:MM") %> */'
		// },
		// files: {
		// 'mobile/l4p/css/c4p-theme-apps4pro.min.css': ['www/l4p/css/c4p-theme-apps4pro.min.css']
		// }
		// }
		// },
		clean: ["mobile"],
		copy: {
			mobileRessources: {
				files: [
					{expand: true, cwd: 'www/img/', src: ['**'], dest: 'mobile/img/'},
					{expand: true, cwd: 'www/l4p/img/', src: ['**'], dest: 'mobile/l4p/img/'},
					{expand: true, cwd: 'www/l4p/font/', src: ['**'], dest: 'mobile/l4p/font/'},
					{expand: true, cwd: 'www/l4p/css/', src: ['c4p-*.min.css'], dest: 'mobile/l4p/css/'},
					{expand: true, cwd: 'app/data/', src: ['c4p_*.json'], dest: 'mobile/data/'},
					{expand: true, cwd: 'app/data/', src: ['local_*.json'], dest: 'mobile/data/'},
					{expand: true, cwd: 'app/data/', src: ['data*.json'], dest: 'mobile/data/'},
					{expand: true, cwd: 'www/', src: 'mobile.html', dest: 'mobile/'}
				]
			},
		},
		rename: {
			mobileIndex: {
				files: [
					{src: ['mobile/mobile.html'], dest: 'mobile/index.html'}
				]
			}
		},
		blanket: {
			instrument: {
				options: {
					debug: true
				},
				files: {
					'build/www-src-cov/': ['www/js/'],
				}
			}
		},
		karma: {
			unit: {
				configFile: 'tests/karma.unit.conf.js',
				//This property must be turned on for jenkins under UNIX environment
				//Under windows, it must be false, else junit report are not generated
				singleRun: true
			},
			e2e: {
				configFile: 'tests/karma.e2e.conf.js',
				//This property must be turned on for jenkins under UNIX environment
				//Under windows, it must be false, else junit report are not generated
				singleRun: true
			},
			check: {
				configFile: 'tests/karma.e2e.check.conf.js',
				//This property must be turned on for jenkins under UNIX environment
				//Under windows, it must be false, else junit report are not generated
				singleRun: true
			}
		},
		ngtemplates:    {
			c4pTemplates: {
				cwd: 'www',
				src: [
					'views/**.html',
					'views/dialog/*.html',
					'views/guider/*.html',
					'views/meeting/*.html',
					'views/email/*.html',
					'views/navigation/*.html',
					'views/navigation/cards/*.html'
				],
				dest: 'www/js/partial_templated/templates.js',
				options: {
					standalone : true,
					htmlmin:  {
						collapseWhitespace: true,
						collapseBooleanAttributes: true,
						removeComments: true // Only if you don't use comment directives!
					}
				}
			}
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-blanket');
	grunt.loadNpmTasks('grunt-angular-templates');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-rename');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-ngmin');
	grunt.loadNpmTasks('grunt-text-replace');

	// Build Optimize mobile app
	grunt.registerTask('build', [
															'clean',
															'ngtemplates:c4pTemplates',
															'concat:js',
															'ngmin:dev',
															'uglify:dev',
															//'replace:console',
															//,'cssmin:css'
															'copy:mobileRessources',
															'rename:mobileIndex'
															]);

	grunt.registerTask('build-prod', [
															'clean',
															'ngtemplates:c4pTemplates',
															'concat:js',
															'ngmin:prod',
															'uglify:prod',
															//'replace:console',
															'copy:mobileRessources',
															'rename:mobileIndex'
															]);

	// Tests
	grunt.registerTask('default', ['ngtemplates:c4pTemplates','blanket','karma:unit','karma:e2e']);
	grunt.registerTask('e2e', ['karma:e2e']);
	grunt.registerTask('unit', ['karma:unit']);
	grunt.registerTask('check', ['karma:check']);

};

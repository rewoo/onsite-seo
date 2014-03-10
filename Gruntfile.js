module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      seoData: {
        files: [
          { expand: true, src: ['seo-data.json'], dest: 'app', filter: 'isFile' }
        ]
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: 'app',
            src: ['*.json'],
            dest: 'dist'
          },
          {
            expand: true,
            cwd: 'app/bower_components/bootstrap/fonts',
            src: ['*'],
            dest: 'dist/fonts'
          }
        ]
      }
    },
    browserify: {
      dist: {
        files: {
          'app/js/bundle.js': ['lib/ratings.js', 'lib/urlUtils.js', 'lib/properties.js','lib/lightdom.js'],
          'lib/inspectorBundle.js': ['lib/inspector.js']
        },
        options: {
          alias: 'lib/ratings.js:ratings,lib/urlUtils.js:urlUtils,lib/properties.js:properties,lib/lightdom.js:lightdom,lib/inspector.js:inspector'
        }
      }
    },
    watch: {
      app: {
        files: ['app/**', 'lib/**'],
        tasks: ['app'],
        options: {
          livereload: true,
          spawn: false
        }
      }
    },
    processhtml: {
      dist: {
        options: {
          process: true,
          inline: true
        },
        files: {
          'dist/index.html': ['dist/index.html']
        }
      }
    },
    ngtemplates: {
      app: {
        options: {
          module: 'seoApp',
          usemin: 'dist/js/seoapp.js',
          htmlmin: {
            collapseBooleanAttributes:      true,
            collapseWhitespace:             true,
            removeAttributeQuotes:          true,
            removeComments:                 false, // Only if you don't use comment directives!
            removeEmptyAttributes:          true
          }
        },
        cwd: 'app',
        src: ['partials/**/*.html'],
        dest: '.tmp/js/templates.js'
      }
    },
    useminPrepare: {
      html: 'app/index.html',
      options: {
        dest: 'dist'
      }
    },
    usemin: {
      html: ['dist/{,*/}*.html'],
      css: ['dist/css/{,*/}*.css'],
      options: {
        dirs: ['dist']
      }
    },
    express: {
      dev: {
        options: {
          port: 3000,
          bases: ['app'],
          serverreload: false
        }
      },
      server: {
        options: {
          port: 3000,
          bases: ['dist']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-express');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-angular-templates');

	grunt.registerTask('app', ['copy:seoData', 'browserify']);

  grunt.registerTask('dist', [
    'app',
    'useminPrepare',
    'ngtemplates:app',
    'copy:dist',
    'processhtml:dist',
    'concat',
    'uglify',
    'cssmin',
    'usemin']);

	grunt.registerTask('dev', ['app', 'express:dev', 'watch:app']);
	grunt.registerTask('server', ['dist', 'express:server', 'express-keepalive']);

  grunt.registerTask('default', ['app']);
};

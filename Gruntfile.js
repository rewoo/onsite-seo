module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      main: {
        files: [
          { expand: true, src: ['seo-data.json'], dest: 'app', filter: 'isFile' }
        ]
      }
    },
    browserify: {
      dist: {
        files: {
          'app/js/bundle.js': ['lib/ratings.js', 'lib/urlUtils.js', 'lib/properties.js']
        },
        options: {
          alias: 'lib/ratings.js:ratings,lib/urlUtils.js:urlUtils,lib/properties.js:properties'
        }
      }
    },
    express: {
      server: {
        options: {
          port: 3000,
          bases: ['app'],
          serverreload: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-express');

	grunt.registerTask('app', ['copy', 'browserify']);
	grunt.registerTask('server', ['app', 'express', 'express-keepalive']);

  grunt.registerTask('default', ['app']);
};

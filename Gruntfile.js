module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
          compress: true,
          mangle: true,
          report: 'gzip'
        },
        build_min: {
          src: 'src/canvasloader.js',
          dest: 'build/canvasloader.min.js'
        },
        build_jquery_min: {
          src: ['src/canvasloader.js', 'src/canvasloader-jquery.js'],
          dest: 'build/canvasloader-jquery.min.js'
        }
    },
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['src/canvasloader.js', 'src/canvasloader-jquery.js'],
        dest: 'build/canvasloader-jquery.js'
      },
    },
    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version%>',
        url: '<%= pkg.homepage %>',
        options: {
          paths: 'src',
          outdir: 'docs'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  grunt.registerTask('build', ['uglify', 'concat', 'yuidoc']);

};
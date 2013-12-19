module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
          compress: true,
          mangle: true
        },
        build_min: {
          src: 'src/hcl-<%= pkg.version %>.js',
          dest: 'build/hcl-<%= pkg.version %>.min.js'
        },
        build_jquery_min: {
          src: ['src/hcl-<%= pkg.version %>.js', 'src/hcl-<%= pkg.version %>-jquery.js'],
          dest: 'build/hcl-<%= pkg.version %>-jquery.min.js'
        }
    },
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['src/hcl-<%= pkg.version %>.js', 'src/hcl-<%= pkg.version %>-jquery.js'],
        dest: 'build/hcl-<%= pkg.version %>-jquery.js'
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
  grunt.registerTask('default', ['uglify', 'concat', 'yuidoc']);

};
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
      build: {
        src: 'src/hcl-<%= pkg.version %>.js',
        dest: 'build/hcl-<%= pkg.version %>.min.js'
      }
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

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Load the plugin that provides the "yuidoc" task.
  grunt.loadNpmTasks('grunt-contrib-yuidoc');

  // Default task(s).
  grunt.registerTask('default', ['uglify', 'yuidoc']);

};
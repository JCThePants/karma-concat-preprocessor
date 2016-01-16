# karma-concat-preprocessor
File concatenation preprocessor for [Karma JavaScript runner](https://github.com/karma-runner/karma)

Under normal circumstances, concatenation is not necessary. The primary benefit of this concat preprocessor is the 
ability to add a header and footer the the concatenated files. This allows adding closures to prevent unbuilt source file variable names from 
interfering with variable names in other libraries that may be included.

## Installation
    npm install karma-concat-preprocessor --save-dev
    
## Configuration
The preprocessor must be configured in the `karma.conf.js` file.

Firstly, you will need to include entries in the `plugins` property and `preprocessors` property:

    plugins: [
        'karma-concat-preprocessor'
    ],
    preprocessors: {
        '**/*': ['concat']
    }
    
It is ok to allow all files to be processed by the concat preprocessor since it will only affect the files it has been configured to concatenate.

### Add Output Files

Include the output file in the `files` property but do not add the files that will be concatenated into it:

    files: [
        'concats/concatenated.js'
    ]
    
### Configure Files

Now you will need to configure which files will be concatenated into the output(s).

    concat: {
    
        // array of output configurations.
        outputs: [
        
            // output file configuration
            {
                file: 'concats/concatenated.js' // The output file
                inputFiles: [
                    'src/file1.js',
                    'src/file2.js',
                    'src/file3.js',
                    'src/file4.js',
                ]
            },
            
            // Additional output configuration. More than 1 concatenation can be specified by adding
            // additional items to the array: (Don't forget to add the output file to the 'files' property)
            {
                file: 'concats/concatenated2.js' // The output file
                inputFiles: [
                    'src/file5.js',
                    'src/file6.js',
                    'src/file7.js',
                    'src/file8.js',
                ]
            },
        ]
    }
    
### Header and Footer
    
By default, the header and footer of the output file is a javascript closure:
    
    (function() { //header
        /* concatenated files */
    }());

You can change these by adding the `header` and/or `footer` property to the `concat` configuration property:

    concat: {
        header: '/* My header */',
        footer: '/* My Footer */'
    }

You can also specify header and/or footer per output file:

    concat: {
        outputs: [
            {
                header: '/* My header */',
                footer: '/* My Footer */',
                file: 'concats/concatenated.js' // The output file
                inputFiles: [
                    'src/file1.js',
                    'src/file2.js',
                    'src/file3.js',
                    'src/file4.js',
                ]
            }
        ]
    }
    
    

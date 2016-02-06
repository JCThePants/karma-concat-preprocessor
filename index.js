var fs = require('fs'),
    glob = require('glob');

initPreprocessor.$inject = ['config.basePath', 'config.concat', 'logger'];

module.exports = {
    'preprocessor:concat': ['factory', initPreprocessor]
};

// concatenate
function concat(info, basePath, config) {

    var contents,
        file   = getFilePath(basePath, info.file),
        files  = getGlobFiles(info.inputs || info.inputFiles),
        footer = info.footer || config.footer,
        header = info.header || config.header,
        result;

    // add default header and footer if none specified
    if (typeof header === 'undefined' && typeof footer === 'undefined') {
        header = '(function () {\n';
        footer = '\n}());\n';
    }

    // get contents of input files
    contents = files.map(function (file) {
        return fs.readFileSync(file).toString();
    });

    // concat file contents
    result = (header || '') + contents.join('\n\n') + (footer || '');

    // write to output file
    fs.writeFileSync(file, result);

    return result;
}

// get file path including base path
function getFilePath(basePath, file) {
    return (basePath ? basePath + '/' : '') + file;
}

// convert array of glob and non-glob file names to array of matched file names.
function getGlobFiles(files) {
    var results = [];
    files.map(function (file) {

        file = file.replace('\\', '/');

        var globFiles = glob(file, { sync: true });
        Array.prototype.push.apply(results, globFiles);
    });
    return results;
}


// initialize
function initPreprocessor (basePath, config, logger) {

    if (!validateConfig(config, logger))
        return;

    var outputMap = {},
        outputs = config.outputs,
        i;

    // map output files
    for (i = 0; i < outputs.length; i++) {
        var file = getFilePath(basePath, outputs[i].file);
        outputMap[file] = outputs[i];
    }

    // preprocessor
    return function (content, file, done) {
        var mapped = outputMap[file.path];
        if (mapped) {
            return done(concat(mapped, basePath, config));
        }
        return done(content);
    }
}

// ensure concat config is correct
function validateConfig(config, logger) {

    var log = logger.create('preprocessor.concat');

    if (!config) {
        log.warn('concat preprocessor config required.');
        return false;
    }

    if (!config.outputs) {
        log.warn('concat preprocessor config requires "outputs" to be specified.');
        return false;
    }

    if (!(config.outputs instanceof Array)) {
        log.warn('concat preprocessor config "outputs" property value must be an Array of objects.');
        return false;
    }

    for (var i = 0; i < config.outputs.length; i++) {
        var output = config.outputs[i];

        if (!output.file) {
            log.warn('Missing "file" property in config output.');
            return false;
        }

        if (!output.inputs && !output.inputFiles) {
            log.warn('Missing "inputs" property in config output.');
            return false;
        }

        if (!(output.inputs instanceof Array) && !(output.inputFiles instanceof Array)) {
            log.warn('concat "outputs" array items "inputs" property must be an array of file paths.');
            return null;
        }
    }

    return true;
}
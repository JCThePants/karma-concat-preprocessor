var fs = require('fs'),
    glob = require('glob');

initPreprocessor.$inject = ['config.basePath', 'config.concat', 'logger'];

module.exports = {
    'preprocessor:concat': ['factory', initPreprocessor]
};

// initialize
function initPreprocessor (basePath, config, logger) {

    var log = logger.create('preprocessor.concat');

    if (!config.outputs) {
        log.warn('concat preprocessor config requires "outputs" to be specified.');
    }

    if (!(config.outputs instanceof Array)) {
        log.warn('concat preprocessor config "outputs" property value must be an Array of objects.');
        return;
    }

    var header = config.header,
        footer = config.footer,
        concats = {};

    if (typeof header === 'undefined' && typeof footer === 'undefined') {
        header = '(function () {\n';
        footer = '\n}());\n';
    }

    for (var i=0; i < config.outputs.length; i++) {

        var info = setupConcat(config.outputs[i], log, header, footer);
        if (info) {
            info.concat();

            for (var j = 0; j < info.outputs.length; j++) {
                concats[basePath + '/' + info.outputs[j]] = info;
            }
        }
    }

    // preprocessor
    return function (content, file, done) {
        var path = file.path;
        if (concats[path]) {
            return done(concats[path].concat());
        }
        return done(content);
    }
}

// setup file concatenation and return info used to concat
function setupConcat(concatInfo, log, header, footer) {

    if (!concatInfo.file) {
        log.warn('concat "outputs" array item did not have required "file" property set.');
        return null;
    }

    if (!concatInfo.inputFiles) {
        log.warn('concat "outputs" array item did not have required "inputFiles" property set.');
        return null;
    }

    if (!(concatInfo.inputFiles instanceof Array)) {
        log.warn('concat "outputs" array items "inputFiles" property must be an array of file paths to concat.');
        return null;
    }

    var inputs = concatInfo.inputFiles,
        outputs = concatInfo.file,
        files = [];

    outputs = outputs instanceof Array ? outputs : [outputs];
    header = concatInfo.header || header || '';
    footer = concatInfo.footer || footer || '';

    inputs.map(function (file) {

        file = file.replace('\\', '/');
        var result = glob(file, { sync: true });

        for (var i = 0; i < result.length; i++) {
            files.push(result[i]);
        }
        return file;
    });

    var info = {
        header: header,
        footer: footer,
        files: files,
        outputs: outputs,
        concat: function () {
            return concat(info, log);
        }
    };

    return info;
}

// concatenate
function concat(info, log) {
    var out = info.files.map(function (file) {
            log.debug('   Reading ' + file);
            return fs.readFileSync(file).toString();
        }),
        result = info.header + out.join('\n\n') + info.footer;

    // write to outputs
    info.outputs.map(function (output) {
        log.debug('Writing to ' + output);
        fs.writeFileSync(output, result);
    });

    return result;
}
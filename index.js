// uses an iife to handle undefined values
(function(undefined) {
    'use strict';

    // NodeJS filesystem library
    var fs = require('fs');

    function isNotBlank(value) {
        return undefined !== value && null !== value;
    }

    function configCompleteFactory(presetsDirectory, configDescriptionFile, customDirectory) {
        function jsonFilesFilterFactory(reduceArray) {
            return function(filename) {
                // keeps only JSON files
                if (filename.match(/\.json$/)) {
                    reduceArray.push(filename);
                }
            }
        }

        // flags the json files of the preset and custom configurations directory
        var presetFiles = [],
            customFiles = [],
            configDescription = null;

        // retrieves the JSON configuration files from the preset and custom configurations directories
        if (isNotBlank(presetsDirectory)) {
            fs.readdirSync(presetsDirectory).forEach(jsonFilesFilterFactory(presetFiles));
        }
        if (isNotBlank(customDirectory)) {
            fs.readdirSync(customDirectory).forEach(jsonFilesFilterFactory(customFiles));
        }


        // loads the configuration description if any
        if (isNotBlank(configDescriptionFile)) {
            configDescription = require(configDescriptionFile);
        }

        function errorMessage(checkedPath, error) {
            return checkedPath + ' (' + error + ')'
        }

        function checkPath(checkPathPrefix, property) {
            return (('string' === typeof checkPathPrefix && checkPathPrefix.length > 0) ? checkPathPrefix + '.' : '') + property;
        }

        function checkConfiguration(configuration, description, errors, checkPathPrefix) {
            Object.keys(description).forEach(function(property) {
                var checkedPath = checkPath(checkPathPrefix, property),
                    isNodeProperty = ('object' === typeof description[property]),
                    hasConfigProperty = configuration.hasOwnProperty(property);

                // adds the appropriate error message whether the missing property is a node or a leaf value
                if (!hasConfigProperty) {
                    // a missing node property: adds the error and recursively checks the sub-configuration with a fake config
                    if (isNodeProperty) {
                        errors.push(errorMessage(checkedPath, 'missing the whole configuration node'));
                        checkConfiguration({}, description[property], errors, checkedPath);
                    }
                    // adds the missing property value
                    else {
                        errors.push(errorMessage(checkedPath, description[property]));
                    }
                }
                // recursively checks the sub-configuration
                else if (isNodeProperty) {
                    checkConfiguration(configuration[property], description[property], errors, checkedPath);
                }
            })
        }

        return {
            getConf: function(environment) {
                // defaults to the development environment
                environment = (environment || 'development');
                var configFilename = environment + '.json';

                // attempts to retrieve the configuration from the presets then the customs directories
                // JSON.parse(fs.readFileSync(...)) is used over require(...) to keep the file content immutable
                var config;
                if (presetFiles.indexOf(configFilename) > -1) {
                    config = JSON.parse(fs.readFileSync(presetsDirectory + '/' + configFilename));
                }
                else if (customFiles.indexOf(configFilename) > -1) {
                    config = JSON.parse(fs.readFileSync(customDirectory + '/' + configFilename));
                }
                // throws an error otherwise
                else {
                    throw new Error('could not load ' + configFilename + ' neither from the preset nor from the custom configurations directories');
                }

                // checks that the configuration file has all the required properties
                if (null != configDescription) {
                    var missingProperties = [];
                    checkConfiguration(config, configDescription, missingProperties, null);

                    if (missingProperties.length > 0) {
                        throw new Error(configFilename + ' misses the following required properties:\n-' + missingProperties.join(',\n-'));
                    }
                }

                // adds the environment name to the config object
                config.env = environment;
                return config;
            }
        }
    }

    module.exports = configCompleteFactory;
}());

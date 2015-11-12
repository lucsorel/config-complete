var assert = require('assert'),
    fs = require('fs'),
    configCompleteFactory = require('../index.js');

describe('config-complete # with description', function() {
    var testFilesDirectory = __dirname + '/configuration-files',
        descriptionFile = testFilesDirectory + '/description.json',
        presetsDirectory = testFilesDirectory + '/presets',
        customsDirectory = testFilesDirectory + '/customs';

    describe('# with presets and customs', function() {
        var configComplete = configCompleteFactory(presetsDirectory, descriptionFile, customsDirectory);

        it('should load presets development.json by default', function() {
            // config-complete always appends the environment name to the loaded configuration
            var expectedConfig = JSON.parse(fs.readFileSync(presetsDirectory + '/development.json'));
            expectedConfig.env = 'development';

            assert.deepEqual(expectedConfig, configComplete.getConf());
        });

        it('should load the preset configuration over custom one', function() {
            // config-complete always appends the environment name to the loaded configuration
            var expectedConfig = JSON.parse(fs.readFileSync(presetsDirectory + '/development.json'));
            expectedConfig.env = 'development';

            assert.deepEqual(expectedConfig, configComplete.getConf('development'));

            var unexpectedConfig = JSON.parse(fs.readFileSync(customsDirectory + '/development.json'));
            unexpectedConfig.env = 'development';
            assert.notDeepEqual(unexpectedConfig, configComplete.getConf('development'));

            // differing configuration properties
            assert.equal('my well-configured app', expectedConfig.name);
            assert.equal('my overriden development configuration (same resource exists in presets)', unexpectedConfig.name);
        });
    });

    describe('# with customs, without presets', function() {
        var configComplete = configCompleteFactory(null, descriptionFile, customsDirectory);

        it('should load the custom development.json by default', function() {
            // config-complete always appends the environment name to the loaded configuration
            var expectedConfig = JSON.parse(fs.readFileSync(customsDirectory + '/development.json'));
            expectedConfig.env = 'development';

            assert.deepEqual(expectedConfig, configComplete.getConf());
        });

        it('should load the custom configuration', function() {
            // config-complete always appends the environment name to the loaded configuration
            var expectedConfig = JSON.parse(fs.readFileSync(customsDirectory + '/dev-local.json'));
            expectedConfig.env = 'dev-local';

            assert.deepEqual(expectedConfig, configComplete.getConf('dev-local'));
        });
    });

    describe('# with presets, without customs', function() {
        var configComplete = configCompleteFactory(presetsDirectory, descriptionFile, null);

        it('should load the presets development.json by default', function() {
            // config-complete always appends the environment name to the loaded configuration
            var expectedConfig = JSON.parse(fs.readFileSync(presetsDirectory + '/development.json'));
            expectedConfig.env = 'development';

            assert.deepEqual(expectedConfig, configComplete.getConf());
        });

        it('should not load the custom configuration (undefined directory)', function() {
            // checks the error message returned when attempting to load a configuration which cannot be found
            assert.throws(
                function() {
                    configComplete.getConf('dev-local');
                },
                function(error) {
                    return (error instanceof Error) && /^Error: could not load dev-local\.json neither from the preset nor from the custom configurations directories$/.test(error);
                }
            );
        });
    });

    describe('# with a shorter description shorter than the configurations', function () {
        var configComplete = configCompleteFactory(presetsDirectory, testFilesDirectory + '/shorter-description.json', customsDirectory);

        it('should load presets development.json by default without truncating extra values', function() {
            // config-complete always appends the environment name to the loaded configuration
            var expectedConfig = JSON.parse(fs.readFileSync(presetsDirectory + '/development.json'));
            expectedConfig.env = 'development';

            assert.deepEqual(expectedConfig, configComplete.getConf());
        });

        it('should load the preset configuration over custom one without truncating extra values', function() {
            // config-complete always appends the environment name to the loaded configuration
            var expectedConfig = JSON.parse(fs.readFileSync(presetsDirectory + '/development.json'));
            expectedConfig.env = 'development';

            assert.deepEqual(expectedConfig, configComplete.getConf('development'));

            var unexpectedConfig = JSON.parse(fs.readFileSync(customsDirectory + '/development.json'));
            unexpectedConfig.env = 'development';
            assert.notDeepEqual(unexpectedConfig, configComplete.getConf('development'));

            // differing configuration properties
            assert.equal('my well-configured app', expectedConfig.name);
            assert.equal('my overriden development configuration (same resource exists in presets)', unexpectedConfig.name);
        });
    });
});

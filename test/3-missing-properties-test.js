var assert = require('assert'),
    fs = require('fs'),
    configCompleteFactory = require('../index.js');

describe('config-complete # with description and missing properties', function() {
    var testFilesDirectory = __dirname + '/configuration-files',
        descriptionFile = testFilesDirectory + '/description.json',
        presetsDirectory = testFilesDirectory + '/presets',
        customsDirectory = testFilesDirectory + '/customs',
        configComplete = configCompleteFactory(presetsDirectory, descriptionFile, customsDirectory);

    /* regular expression used to escape expected error messages
	 * @see http://closure-library.googlecode.com/git-history/docs/local_closure_goog_string_string.js.source.html#line1021
	 */
	var escapingRegExp = /([-()\[\]{}+?*.$\^|,:#<!\\])/g;

	/** Converts the given value into an escaped RegExp */
	function asEscapedRegExpPattern(value) {
		return new RegExp(value.replace(escapingRegExp, '\\$1'), 'g');
	}

    // factory which asserts that the expected error contains all the given items in its message
    function assertErrorFactory(errorItems) {
        return function(error) {
            assert.equal(true, error instanceof Error);
            errorItems.forEach(function(errorItem) {
                assert.equal(true, asEscapedRegExpPattern(errorItem).test(error));
            });

            // ensures that there are no extra messages not asserted
            assert.equal(errorItems.length, error.toString().split('\n').length);

            // validates the expected error
            return true;
        }
    }

    function testMissingProperties(itDescription, invalidConfig, errorItems) {
        it(itDescription, function() {
            // prefixes the errors array with the lead error message
            errorItems.unshift(invalidConfig + '.json misses the following required properties');
            assert.throws(function() {
                configComplete.getConf(invalidConfig);
            }, assertErrorFactory(errorItems));
        });
    }

    testMissingProperties('should error on missing level-1 properties', 'missing-level-1',
        ['name (the application name)']);

    testMissingProperties('should error on missing level-2 leaf-properties', 'missing-level-2-leaf',
        ['http.port (the http port of the application)']);

    testMissingProperties('should error on missing level-2 intermediary-properties', 'missing-level-2-intermediary',
        ['database.host (the server hosting the database)', 'database.port (the port used by the database)']);

    testMissingProperties('should error on missing level-3 properties', 'missing-level-3',
        ['database.user.password (the password of the database user to use)']);

    testMissingProperties('should error on missing intermediary node', 'missing-intermediary-node',
        ['database (missing the whole configuration node)',
         'database.uriPrefix (the database type URI prefix)',
         'database.host (the server hosting the database)',
         'database.port (the port used by the database)',
         'database.user (missing the whole configuration node)',
         'database.user.name (the name of the database user to use)',
         'database.user.password (the password of the database user to use)']);

    testMissingProperties('should error on multi-level missing properties', 'missing-multi-level',
        ['name (the application name)',
         'http.port (the http port of the application)',
         'database.host (the server hosting the database)',
         'database.user.name (the name of the database user to use)']);
});

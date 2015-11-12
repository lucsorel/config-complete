# Configure your application without forgetting important properties!
`Config-complete` is a configuration loader that:
* lets you define the configuration environment by its name (using the usual `process.env.NODE_ENV` global variable for example)
* expects configurations as JSON files with several levels of indentation (so that you can group configuration properties by domains of concern: database params, encryption params, etc.)
* looks into 2 folders to search the expected configuration file:
  * the `presets` folder typically contains standard configurations (like `development`, `test` or `production`) that you want to version (via git)
  * the `customs` folder where you would put fancy configurations (like `local-dev`) you don't want to version (using `.gitignore` clauses)
* (the main added-value of the library) optionally lets you define a description of the mandatory configuration properties via a JSON file mimicking the structure of the configuration properties, whose values explain what they do for self-documentation purposes

Notes:
* the description JSON file can have any name
* the configuration files must be named like `{environment name}.json`
* if the environment name is undefined, the loader will look for the `development` environment (and thus the `development.json` configuration file, either in the `presets` or `customs` directories)
* a configuration defined in the `presets` directory takes precedence over the one defined in the `customs` directory
* this library works synchronously (configuration loading either fails or is returned, no promise) and only uses the filesystem `fs` core library

# Usage
Install config-complete (as a dependency):
```bash
npm install github:lucsorel/config-complete --save
```

Loads and manages the configuration for the expected environment:
```javascript
// requires the configuration loader
var configDescription      = __dirname + '/configs/description.json',
    presetConfigsDirectory = __dirname + '/configs/presets',
    customConfigsDirectory = __dirname + '/configs/customs',
    configComplete = require('config-complete')(presetConfigsDirectory, configDescription, customConfigsDirectory);

// in your application startup file:
var appConfig = configComplete.getConf(process.env.NODE_ENV); // loads 'development' if undefined

// in your test files:
var testConfig = configComplete.getConf('test');

// you would pass to your database script only the configuration it needs (dbConfig = appConfig.database)
var databaseConnectionUrl = dbConfig.uriPrefix + '/' + dbConfig.user.name + ':' + dbConfig.user.password
        + '/' + dbConfig.host + ':' + dbConfig.port;
    // -> mongodb://user:password@dev.my-app.org:12345
```

## Project structure
The structure of your NodeJS project would look like this:
```
/
┣configs
┃    ┣ description.json (describes the configuration mandatory properties)
┃    ┣ presets (versioned configuration files)
┃    ┃    ┣ development.json
┃    ┃    ┣ production.json
┃    ┃    ┗ test.json
┃    ┗ customs (unversioned configuration files)
┃         ┗ dev-local.json
┣ server.js (starts your NodeJS application)
┣ test (contains your tests files)
...
```

## Files example
* a `description.json` file explaining the roles of the mandatory properties:
```json
{
    "name": "the application name",
    "http": {
        "port": "the http port of the application"
    },
    "database": {
        "uriPrefix": "the database type URI prefix",
        "host": "the server hosting the database",
        "port": "the port used by the database",
        "user": {
            "name": "the name of the database user to use",
            "password": "the password of the database user to use"
        }
    }
}
```

* a `development.json` configuration file for the `development` environment:
```json
{
    "name": "my well-configured app",
    "http": {
        "port": 3000
    },
    "database": {
        "uriPrefix": "mongo://",
        "host": "dev.my-app.org",
        "port": 12345,
        "user": {
            "name": "test",
            "password": "test"
        }
    }
}
```

## Expected error messages
You can expect error messages when:
* defining invalid paths for the description file, the `presets` or the `customs` directories
* the description or the configuration JSON files have syntactic/format errors
* attempting to load a configuration file which does not exist:
```
Error: could not load inexisting-environment.json neither from the preset nor from the custom configurations directories
```
* defining a configuration file which misses mandatory properties. For example (given the aforementioned `description.json` file), the following `development.json` configuration will yield the informative error:
```json
{
    "name": "my well-configured app",
    "database": {
        "uriPrefix": "mongo://",
        "port": 12345,
        "user": {
            "name": "test"
        }
    }
}
```

```
Error: development.json misses the following required properties:
-http (missing the whole configuration node),
-http.port (the http port of the application),
-database.host (the server hosting the database),
-database.user.password (the password of the database user to use)
```

# Limitations
* configuration and description files are expected in the JSON format
* this library does not provide a way to extend a configuration with another one

# License
May be freely distributed under the [MIT license](https://github.com/lucsorel/config-complete/master/LICENSE).

Pull-requests, comments and issues reporting are welcome.

Copyright (c) 2015 Luc Sorel

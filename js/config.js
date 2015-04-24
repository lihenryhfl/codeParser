
// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    baseUrl: 'js',
    paths: {
        "jQuery": "jquery-1.11.2.min",
        "CodeMirror": "codemirror/lib/codemirror",
        "javascriptMode": "codemirror/mode/javascript/javascript",
        "esprima": "esprima/esprima",
        "parseTextAcorn": "parseTextAcorn",
        "parseTextEsprima": "parseTextEsprima",
        "domReady": "require/domReady",
        "jQueryTimer": "jquery.timer",
        "bootstrap": "bootstrap.min",
        "underscore": "underscore-min",
        "acornLoose": "acorn/src/loose/acorn_loose",
        "benchmark": "benchmark",
        "jquerystring": "test/jquery-string"
    },
    shim : {
        "bootstrap" : { "deps": ['jQuery'] },
        "jQueryTimer" : { "deps": ['jQuery']}
    }
});
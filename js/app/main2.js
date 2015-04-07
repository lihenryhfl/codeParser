define(['domReady', 'jQuery', 'benchmark', 'parseTextAcorn', 'parseTextEsprima', 'jquerystring', 'bootstrap'], function (domReady, jQuery, benchmark, parseTextAcorn, parseTextEsprima, bootstrap, jquerystring) {
    var parameters = {
        whitelist: {
            'IfStatement': false
        },
        blacklist: {
            'UpdateExpression': false
        },
        structure: [
                {
                    integrity: false,
                    array: ['ForStatement', 'ForStatement', 'IfStatement', 'ForStatement', 'ForStatement', 'IfStatement']
                },
                {
                    integrity: false,
                    array: ['IfStatement', 'IfStatement', 'IfStatement']
                }
        ]
    };
    
    // reads a file as a string
    // taken from https://thiscouldbebetter.wordpress.com/2013/01/31/reading-a-string-from-a-file-in-javascript/
    
    domReady(function () {
        var suite = new benchmark.Suite;
        suite.add('Acorn', function() {
            /o/.test(parseTextAcorn(jquerystring, parameters));
        })
        .add('Esprima', function() {
            /o/.test(parseTextEsprima(jquerystring, parameters));
        })
        .on('cycle', function(event) {
            var result = String(event.target)
            result = result.replace(' x', ':');
            var test = result.substring(0, result.indexOf(':')).toLowerCase();
            $('div#'+test+'Test p').text(result);
        })
        .on('complete', function() {
            $('a#runtest span').text('Run Test');
        });
        
        $('a#runtest').click(function () {
            $('a#runtest span').text('Running...');
            suite.run({ 'async': true });
        });
    });
});
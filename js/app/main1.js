define(['domReady', 'jQuery', 'jQueryTimer', 'parseTextAcorn', 'parseTextEsprima', 'codemirror/lib/codemirror', 'codemirror/mode/javascript/javascript', 'bootstrap'], function (domReady, jQuery, timer, parseTextAcorn, parseTextEsprima, CodeMirror) {
    
    // parameters passed to parseText
    // note: the use of the booleans save a few steps in the parseText code, and give  
    // some insight into how it works, but is largely unnecessary as user input
    'use strict';
    var parameters = {
        whitelist: {
            'IfStatement': false
        },
        blacklist: {
            'UpdateExpression': false
        },
        structure: [
            // parseText looks in the code for the constructs of each 'component'
            // which can hold one set of nested functions of any depth
            // the nested functions are evaluated first-last in an outside-inside order 
            // (i.e. the first component is an if statement in a nested for loop)
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
    
    var parseText = parseTextEsprima;
    
    function callParser(editor, timer) {
        var report, text;
        text = editor.getValue();
        if ((report = parseText(text, parameters)) === false) {

        }
        $('#info').html(report);
        timer.stop();
        // stop timer after every run (the timer is later restarted after a keypress)
    }
    
    domReady(function () {
        var editor = CodeMirror.fromTextArea(document.getElementById("CodeMirrorTextBox"), {
            lineNumbers: true,
            mode: "javascript"
        });
        editor.getDoc().setValue('var i=0;\nfor(i=0; i<10; i++) {\n  if(i<5) {\n    i++;  \n  }\n}');
        // instantiate timer that begins countdown after the last keypress is registered
        var timer = $.timer(function() {
            callParser(editor, timer);
        });
        
        // set timer to parse code in editor in 1.5 secs if timer isn't reset by keypresses
        timer.set({time: 250, autostart: false});
        
        // call parser once to render initial text
        callParser(editor, timer);
        
        editor.on("changes", function () {
            $('p#info').html('');
            
            // reset timer (this code is a bit awkward, but it seems like the
            //only way to stop, reset, and restart the timer with this module)
            timer.stop().play(true);
        });
        
        $('#algoSelector').click(function () {
            if ($('#algoSelector a span').html() === 'Acorn') {
                parseText = parseTextEsprima;
                $('#algoSelector a span').text('Esprima');
            } else {
                parseText = parseTextAcorn;
                $('#algoSelector a span').text('Acorn');
            }
        });
    });
});
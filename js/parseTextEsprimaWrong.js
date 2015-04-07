define(['jQuery', 'esprima', 'underscore'], function ($, esprima, _) {
    var parameters = {
        whitelist: {
            'IfStatement': false
        },
        blacklist: {
            'UpdateExpression': false
        },
        structure: {
            integrity: false,
            // parseText looks in the code for the constructs of each 'component' in 
            //   the array in the explicit order each is listed
            // each component can hold one set of nested functions of any depth
            // the nested functions are evaluated first-last in an outside-inside order 
            // (i.e. the first component is an if statement in a nested for loop)
            components: [
                {
                    integrity: false,
                    type: 'ForStatement',
                    body: {
                        integrity: false,
                        type: 'ForStatement',
                        body: {
                            integrity: false,
                            type: 'IfStatement',
                            type: '
                    ['ForStatement', 'ForStatement', 'IfStatement', 'ForStatement', 'ForStatement', 'IfStatement']
                },
                {
                    integrity: false,
                    array: ['IfStatement']
                }
            ]
        }
    };
    var esprimaReport;

    // takes code and parameters, and returns an analysis report called esprimaReport
    function parseText(code, parameters) {
        var prop,
            syntax,
            esprimaReport = "",
            reports = {
                'whitelist': [],
                'blacklist': []
            };
        
        // auxiliary function: checks if object is empty
        function isEmpty(obj) {
            for (prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    return false;
                }
            }
            return true;
        }
        
        // checks for vague structural constructs
        function checkStructure(object, structure) {
            var key, child, tempList;
            
            visitor.call(null, object);
            for (key in object) {
                if (object.hasOwnProperty(key)) {
                    child = object[key];
                    if (typeof child === 'object' && child !== null) {
                        tempList = ancestors.concat(object.type);
                        traverse(child, tempList, visitor);
                    // call checkStructure at every leaf
                    } else {
                        checkStructure(ancestors);
                    }
                }
            }
        }
        
        // traverses syntax tree created by esprima; at every leaf calls checkStructure to analyze code structure
        // repurposed from an esprima example script
        function traverse(object, ancestors, visitor) {
            var key, child, tempList;

            visitor.call(null, object);
            for (key in object) {
                if (object.hasOwnProperty(key)) {
                    child = object[key];
                    if (typeof child === 'object' && child !== null) {
                        tempList = ancestors.concat(object.type);
                        traverse(child, tempList, visitor);
                    // call checkStructure at every leaf
                    } else {
                        checkStructure(ancestors);
                    }
                }
            }
        }
        
        function checkList(list, node) {                
            /*
            //this is commented out, but provides extra information on the whitelist/blacklist elements
            var excerpt;
            excerpt = content.substring(node.range[0], node.range[1]);

            if (excerpt.length > 20) {
                excerpt = excerpt.substring(0, 20) + '...';
            }
            */

            parameters[list][node.type] = true;
            
            reports[list].push({
                'type': node.type,
                'location': node.loc.start.line
            });
        }
        
        // if each nested structure in parameters.structure is fulfilled, mark the main structure's integrity as 'true'
        function verifyStructure() {
            var component, key;
            parameters.structure.integrity = true;
            
            for (key in parameters.structure.components) {
                component = parameters.structure.components[key];
                if (component.integrity !== true) {
                    parameters.structure.integrity = false;
                }
            }
        }
        
        // reset the parameters (at the end of parseText, so that it can be run fresh in the next call)
        function resetParameters() {
            var key;
            for (key in parameters.whitelist) {
                parameters.whitelist[key] = false;
            }
            for (key in parameters.blacklist) {
                parameters.blacklist[key] = false;
            }
            parameters.structure.integrity = false;
            parameters.structure.components.some(function (component) {
                component.integrity = false;
            });
        }
        
        // generates a string, stored in esprimaReport, providing feedback on the code in terms of the whitelist, blacklist, and structure
        function assembleReport() {
            var key, element, component, errorBool = false;
            
            //assemble whitelist report
            esprimaReport = esprimaReport.concat('Whitelist: <br>');
            for (element in parameters.whitelist) {
                if (parameters.whitelist[element] !== true) {
                    errorBool = true;
                    esprimaReport = esprimaReport.concat('&nbsp Error: You are missing a ' + element + '.');
                }
            }
            if (!errorBool) {
                esprimaReport = esprimaReport.concat('&nbsp No issues!<br>');
            } else {
                esprimaReport = esprimaReport.concat('<br>');
            }
            
            //assemble blacklist report
            esprimaReport = esprimaReport.concat('Blacklist:');
            if (reports.blacklist.length > 0) {
                esprimaReport = esprimaReport.concat('<br>');
                reports.blacklist.forEach(function (element) {
                    esprimaReport = esprimaReport.concat('&nbsp Error: You have a ' + element.type + ' on line ' + element.location + '.<br>');
                });
            } else {
                esprimaReport = esprimaReport.concat(' No issues! <br>');
            }
            
            //assemble structure report
            esprimaReport = esprimaReport.concat('Structure: <br>');
            if (parameters.structure.integrity) {
                esprimaReport = esprimaReport.concat('&nbsp No issues! <br>');
            } else {
                parameters.structure.components.some(function (component, index) {
                    if (index === 0) {
                        esprimaReport = esprimaReport.concat('&nbsp Error: You are missing a ');
                    }
                    component.array.forEach(function (element, index) {
                        esprimaReport = esprimaReport.concat(element);
                        if (index < component.array.length - 1) {
                            esprimaReport = esprimaReport.concat(' enclosing a ');
                        }
                    });
                    if (index < component.array.length - 1) {
                        esprimaReport = esprimaReport.concat(', followed by a <br>');
                    }
                });
                esprimaReport = esprimaReport.concat('.<br>');
            }
        }
        
        // if var code is empty
        if (!code) {
            return "Waiting for your input...<br>";
        }
        
        // if esprima throws an error, catch and pass it to the html
        try{
        syntax = esprima.parse(code, { tolerant: true, loc: true, range: true });
        }
        catch(err){
            return err + "<br";
        }
        
        traverse(syntax, [], function (node) {
            var rule;
            for (rule in parameters.whitelist) {
                if (node.type === rule) {
                    checkList('whitelist', node);
                }
            }
            for (rule in parameters.blacklist) {
                if (node.type === rule) {
                    checkList('blacklist', node);
                }
            }
        });
        verifyStructure();
        assembleReport();
        resetParameters();
        
        return esprimaReport;
    }
    
    return function (code, parameters) {
        esprimaReport = parseText(code, parameters);
        return esprimaReport;
    };
});
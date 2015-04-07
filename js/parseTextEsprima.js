define(['jQuery', 'esprima', 'underscore'], function ($, esprima, _) {
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
        function checkStructure(ancestors) {
            var i, j, key, component;
            //iterate through the components
            parameters.structure.some(function (component, index) {
                //only check the components that are unverified
                if (component.integrity === false) {
                    j = 0;
                    for (i = 0; i < ancestors.length; i += 1) {
                        if (ancestors[i] === component.array[j]) {
                            j = j + 1;
                            if (j === component.array.length) {
                                component.integrity = true;
                                return true;
                            }
                        }
                    }
                }
                
                // if the current (just checked) component didn't pass, 
                // stop, because the structure is only valid if the components
                // are found in order
                if (component.integrity === false) {
                    return true;
                }
            });
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
            var component, key, missingComponents = [];
            
            parameters.structure.forEach(function(element, index) {
                if (element.integrity !== true) {
                    missingComponents.push(index);
                }
            });
            
            return missingComponents;
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
            parameters.structure.some(function (component) {
                component.integrity = false;
            });
        }
        
        // generates a string, stored in esprimaReport, providing feedback on the code in terms of the whitelist, blacklist, and structure
        function assembleReport() {
            var i, key, element, component, missingComponents, errorBool = false;
            
            //assemble whitelist report
            esprimaReport = esprimaReport.concat('Whitelist:<br>');
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
            esprimaReport = esprimaReport.concat('Blacklist:<br>');
            if (reports.blacklist.length > 0) {
                reports.blacklist.forEach(function (element) {
                    esprimaReport = esprimaReport.concat('&nbsp Error: You have a ' + element.type + ' on line ' + element.location + '.<br>');
                });
            } else {
                esprimaReport = esprimaReport.concat('&nbsp No issues!<br>');
            }
            
            //assemble structure report
            esprimaReport = esprimaReport.concat('Structure:<br>');
            missingComponents = verifyStructure();
            if (missingComponents.length >0) {
                missingComponents.forEach(function (key, i) {
                    if (i === 0) {
                        esprimaReport = esprimaReport.concat('&nbsp Error: You are missing a ');
                    }
                    parameters.structure[key].array.forEach(function (element, index) {
                        esprimaReport = esprimaReport.concat(element);
                        if (index < parameters.structure[key].array.length - 1) {
                            esprimaReport = esprimaReport.concat(' enclosing a ');
                        }
                    });
                    if (i < missingComponents.length - 1) {
                        esprimaReport = esprimaReport.concat(', as well as a <br>');
                    }
                });
                esprimaReport = esprimaReport.concat('.<br>');
            } else {
                esprimaReport = esprimaReport.concat('&nbsp No issues!<br>');
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
        assembleReport();
        resetParameters();
        
        return esprimaReport;
    }
    
    return function (code, parameters) {
        esprimaReport = parseText(code, parameters);
        return esprimaReport;
    };
});
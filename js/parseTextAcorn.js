define(['jQuery', 'acornLoose', 'underscore'], function ($, acorn, _) {
    var acornReport;

    // takes code and parameters, and returns an analysis report called acornReport
    function parseText(code, parameters) {
        var prop,
            syntax,
            acornReport = "",
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
                'location': node.start
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
        
        // generates a string, stored in acornReport, providing feedback on the code in terms of the whitelist, blacklist, and structure
        function assembleReport() {
            var i, key, element, component, missingComponents, errorBool = false;
            
            //assemble whitelist report
            acornReport = acornReport.concat('Whitelist: <br>');
            for (element in parameters.whitelist) {
                if (parameters.whitelist[element] !== true) {
                    errorBool = true;
                    acornReport = acornReport.concat('&nbsp Error: You are missing a ' + element + '.');
                }
            }
            if (!errorBool) {
                acornReport = acornReport.concat('&nbsp No issues!<br>');
            } else {
                acornReport = acornReport.concat('<br>');
            }
            
            //assemble blacklist report
            acornReport = acornReport.concat('Blacklist:');
            if (reports.blacklist.length > 0) {
                acornReport = acornReport.concat('<br>');
                reports.blacklist.forEach(function (element) {
                    acornReport = acornReport.concat('&nbsp Error: You have a ' + element.type + ' on line ' + element.location + '.<br>');
                });
            } else {
                acornReport = acornReport.concat(' No issues! <br>');
            }
            
            //assemble structure report
            acornReport = acornReport.concat('Structure:<br>');
            missingComponents = verifyStructure();
            if (missingComponents.length >0) {
                missingComponents.forEach(function (key, i) {
                    if (i === 0) {
                        acornReport = acornReport.concat('&nbsp Error: You are missing a ');
                    }
                    parameters.structure[key].array.forEach(function (element, index) {
                        acornReport = acornReport.concat(element);
                        if (index < parameters.structure[key].array.length - 1) {
                            acornReport = acornReport.concat(' enclosing a ');
                        }
                    });
                    if (i < missingComponents.length - 1) {
                        acornReport = acornReport.concat(', as well as a <br>');
                    }
                });
                acornReport = acornReport.concat('.<br>');
            } else {
                acornReport = acornReport.concat('&nbsp No issues!<br>');
            }
        }
        
        // if var code is empty
        if (!code) {
            return "Waiting for your input...<br>";
        }
        
        // using acorn's loose interpreter, which means that incomplete structures will also be accepted
        // e.g. simply 'for for if for for if' will fulfill the structure requirements of the default parameters (in main1.js)
        // these errors should be picked up by a more robust code parser
        syntax = acorn.parse_dammit(code, {});
        
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
        
        return acornReport;
    }
    
    return function (code, parameters) {
        acornReport = parseText(code, parameters);
        return acornReport;
    };
});
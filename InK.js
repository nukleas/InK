/*jslint regexp:true */
/*global app*/
/*
    InK: InCopy/K4 automation suite
    By Nader Heidari
*/
/*
    The following junk is a pseudo-testing thing for the parser
    in case I am not able to access InCopy.
*/
if (app === undefined) {
    var app = {
        activeDocument: {
            stories: [{
                notes: [{
                    name: "Note",
                    texts: [{
                        contents: "{keywords: herp~derp}"
                    }]
                }]
            }, {
                notes: [{
                    name: "Note",
                    texts: [{
                        contents: "{keywords: herp~derp}"
                    }]
                }]
            }]
        }
    };
}
/*
    End Testing stuff
*/

var InK = {
    commands: {
        keywords: {

        }
    },
    interp: {
        getAllNotes: function () {
            "use strict";
            var i, results = [],
                notes,
                noteQueue = [],
                item,
                inCopyObjToArray = function (e) {
                    var i, arr = [];
                    for (i = 0; i < e.length; i += 1) {
                        arr.push(e[i]);
                    }
                    return arr;
                };
            for (i = 0; i < app.activeDocument.stories.length; i += 1) {
                notes = app.activeDocument.stories[i].notes;
                noteQueue = inCopyObjToArray(notes);
                item = noteQueue.shift();
                while (item !== undefined) {
                    results.push(item);
                    item = noteQueue.shift();
                }
            }
            return results;
        },
        extractCommands: function (notes) {
            "use strict";
            var commands = [],
                commandRegex = /\{.*?\}/,
                i;
            for (i = 0; i < notes.length; i += 1) {
                if (commandRegex.test(notes[i].texts[0].contents)) {
                    commands.push({
                        note: notes[i],
                        contents: notes[i].texts[0].contents
                    });
                }
            }
            return commands;
        },
        parseCommands: function () {
            "use strict";
            var derp, herp, i;
            derp = this.getAllNotes();
            herp = this.extractCommands(derp);
            for (i = 0; i < herp.length; i += 1) {
                herp[i].command = this.parseCommand(herp[i].contents);
            }
            return herp;
        },
        parseCommand: function (string) {
            "use strict";
            var i, commandArray, command;
            command = string.match(/\{(.*?)\}/)[1];
            commandArray = command.replace(/^\s+|\s+$/g, "").replace(/(^\{|\}$)/g, "").split(":");
            if (commandArray.length > 1) {
                for (i = 0; i < commandArray.length; i += 1) {
                    commandArray[i] = commandArray[i].replace(/^\s+|\s+$/g, "");
                }
                return commandArray;
            }
        }
    }
};
InK.interp.parseCommands();

function getMetadataMap() {
    "use strict";
    var defs, obj, i, j;
    defs = app.k4Publications[0].k4MetaDataDefs;
    obj = {};
    for (i = 0; i < defs.length; i += 1) {

        switch (defs[i].k4MetaDataDataType.toString()) {
        case "K4_STRING":
            obj[defs[i].k4Name] = "string";
            break;
        case "K4_VALUE_LIST":
            obj[defs[i].k4Name] = [];
            for (j = 0; j < defs[i].k4MetaDataDefValueLists.length; j += 1) {
                obj[defs[i].k4Name].push(defs[i].k4MetaDataDefValueLists[j].k4Name);
            }
            break;
        case "K4_INTEGER":
            obj[defs[i].k4Name] = 0;
            break;
        }
    }
    return obj;
}
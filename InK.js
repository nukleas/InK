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
        mapMetadataTo: function (data, taskObj) {
		    "use strict";
			var item;
            this.taskObj = taskObj;

            function setMetadataValue(field, value) {
                var metadata_value,
				    values = taskObj.k4MetaDataValues,
				    def,
				    defs = app.k4Publications[0].k4MetaDataDefs,
				    valueList;
                metadata_value = values.k4GetByName(field);
                def = defs.k4GetByName(field);
                switch (def.k4MetaDataDataType.toString()) {
                case "K4_STRING":
                    metadata_value.k4StringValue = value;
                    break;
                case "K4_VALUE_LIST":
                    valueList = def.k4MetaDataDefValueLists.k4GetByName(value);
                    if (valueList.isValid) {
                        metadata_value.k4ValueListValue = valueList.k4Id;
                    }
                    break;
                case "K4_INTEGER":
				    if (value === true || value === false) {
                        metadata_value.k4IntValue = value ? 1 : 0;
					} else {
					    metadata_value.k4IntValue = value;
					}
                    break;
                }

            }
            for (item in data) {
                if (data.hasOwnProperty(item) && app.k4Publications[0].k4MetaDataDefs.k4GetByName(item)) {
                    setMetadataValue(item, data[item]);
                }
            }
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
            var notes, commands, i;
            notes = this.getAllNotes();
            commands = this.extractCommands(notes);
            for (i = 0; i < commands.length; i += 1) {
                commands[i].command = this.parseCommand(commands[i].contents);
            }
            return commands;
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
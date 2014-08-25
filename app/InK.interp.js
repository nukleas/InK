InK.interp = {
    getAllNotes: function () {
        "use strict";
        var i,
            results = [],
            notes,
            noteQueue = [],
            item;
        for (i = 0; i < app.activeDocument.stories.length; i += 1) {
            notes = app.activeDocument.stories[i].notes;
            noteQueue = InK.collectionToArray(notes);
            item = noteQueue.shift();
            while (item !== undefined) {
                results.push(item);
                item = noteQueue.shift();
            }
        }
        return results;
    },
    getNotesFromStory: function (story) {
        var results = [], item, noteQueue, notes = story.notes;
        noteQueue = InK.collectionToArray(notes);
        item = noteQueue.shift();
        while (item !== undefined) {
            results.push(item);
            item = noteQueue.shift();
        }
        return results;
    },
    extractCommands: function (notes) {
        "use strict";
        var matches,
            commands = [],
            commandRegex = /\{.*?\}/g,
            i,
            j;
        for (i = 0; i < notes.length; i += 1) {
            if (commandRegex.test(notes[i].texts[0].contents)) {
                matches = notes[i].texts[0].contents.match(commandRegex);
                for (j = 0; j < matches.length; j += 1) {
                    commands.push({
                        note: notes[i],
                        contents: matches[j]
                    });
                }
            }
        }
        return commands;
    },
    parseCommands: function () {
        "use strict";
        var i, commands, notes;
        notes = this.getAllNotes();
        commands = this.extractCommands(notes);
        for (i = 0; i < commands.length; i += 1) {
            commands[i].command = this.parseCommand(commands[i].contents);
        }
        return commands;
    },
    parseCommandsFromStory: function (story) {
        "use strict";
        var i, commands, notes;
        notes = this.getNotesFromStory(story);
        commands = this.extractCommands(notes);
        for (i = 0; i < commands.length; i += 1) {
            commands[i].command = this.parseCommand(commands[i].contents);
            commands[i].command.field = "Sub " + commands[i].command.field;
        }
        if (commands.length) {
            commands.getKeyValuePairs = function () {
                var i, obj = {};
                for (i = 0; i < this.length; i += 1) {
                    obj[this[i].command.field] = this[i].command.value;
                }
                return obj;
            };
            return commands;
        }
        return false;
    },
    parseCommand: function (string) {
        "use strict";
        var parsedCommand, closestMatch, command;
        command = string.match(/\{(.*?)\}/)[1];

        function stripSpaces(str) {
            return str.replace(/^\s+|\s+$/g, "");
        }

        command = stripSpaces(command).replace(/(^\{|\}$)/g, "");
        parsedCommand = {
            command: "setMetadata",
            field: stripSpaces(command.substring(0, command.indexOf(":") - 1)),
            value: stripSpaces(command.substring(command.indexOf(":") + 1))
        };
        if (parsedCommand.field && parsedCommand.value) {
            if (InK.map.fuzzyGet(parsedCommand.field)) {
                closestMatch = InK.map.fuzzyGet(parsedCommand.field);
                parsedCommand.field = InK.map[closestMatch].names[0];
            }
            return parsedCommand;
        }
    }
};

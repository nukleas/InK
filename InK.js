/*
    InK: InCopy/K4 automation suite
    By Nader Heidari
*/
if (typeof app === "undefined"){
app = {
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
var InK = {
    commands: {
        keywords: {

        }
    },
    interp: {
        getAllNotes: function() {
            var i, results = [],
                notes,
                noteQueue = [],
                item;
            for (i = 0; i < app.activeDocument.stories.length; i++) {
                notes = app.activeDocument.stories[i].notes;
                noteQueue = (function (e) {var i, arr=[];for (i=0;i<notes.length;i++){arr.push(notes[i])}return arr;})(notes);
                item = noteQueue.shift();
                while (item !== undefined) {
                    results.push(item);
                    item = noteQueue.shift();
                }
            }
            return results;
        },
        extractCommands: function(notes) {
            var commands = [],
                commandRegex = /\{.*?\}/;
            for (var i = 0; i < notes.length; i++) {
                if (commandRegex.test(notes[i].texts[0].contents)) {
                    commands.push({
                        note: notes[i],
                        contents: notes[i].texts[0].contents
                    });
                }
            }
            return commands;
        },
        parseCommands: function() {
            var derp = this.getAllNotes();
            var herp = this.extractCommands(derp);
            for (var i = 0; i < herp.length; i++) {
                herp[i].command = this.parseCommand(herp[i].contents);
            }
            return herp;
        },
        parseCommand: function(string) {
            var i, commandArray;
            var command = string.match(/\{(.*?)\}/)[1];
            commandArray = command.replace(/^\s+|\s+$/g, "").replace(/(^\{|\}$)/g, "").split(":");
            if (commandArray.length > 1) {
                for (i = 0; i < commandArray.length; i++) {
                    commandArray[i] = commandArray[i].replace(/^\s+|\s+$/g, "");
                }
                return commandArray;
            }
        }
    }
};
InK.interp.parseCommands();
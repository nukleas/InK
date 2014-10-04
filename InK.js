/*jslint regexp:true */
/*global app, $, File*/
/*
    InK: InCopy/K4 automation suite
    By Nader Heidari
*/

var InK = {
    find_script_dir: function () {
        "use strict";
        var a;
        // TODO: Ugh. I hate try-catches. Should refactor.
        try {
            return new File(app.activeScript).path;
        } catch (e) {
            try {
                a = new File($.fileName).path;
                return a;
            } catch (e) {
                return new File(e.fileName).path;
            }
        }
    },
    getJSON: function (path) {
        "use strict";
        var file = new File(path), data;
        if (file.open()) {
            data = file.read();
            if (typeof JSON === "object") {
                return JSON.parse(data);
            }
            return eval(data);
        }
        return false;
    },
    require: function (path) {
        "use strict";
        var newPath, local = new File(this.find_script_dir());
        if (path.substring(0, 3) === "../") {
            newPath = local.parent + path.substring(2);
        } else {
            newPath = local + path;
        }
        if (path.match(/\.json$/)) {
            return this.getJSON(newPath);
        } else {
            $.evalFile(newPath);
        }
    },
    forEach: function (thing, doSomething, forFirst, forLast) {
        "use strict";
        var i, results = [], last;
        if (forFirst) {
            results.push(forFirst(thing.shift()));
        }
        if (forLast) {
            last = thing.pop();
        }
        for (i = 0; i < thing.length; i += 1) {

            results.push(doSomething(thing[i]));
        }
        if (forLast) {
            results.push(forLast(last));
        }
        return results;
    }
};
// Get the required bits
InK.require('/includes/FuzzySet.jsx');
InK.require('/includes/JSON.jsx');
InK.require('/app/InK.metadata.js');
InK.require('/app/InK.interp.js');

// Get the paragraph-style-to-object-label map.
InK.styleToLabelMap = InK.require('/config/styleMap.json');
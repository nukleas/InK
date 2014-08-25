/*jslint regexp:true */
/*global app, $*/
/*
    InK: InCopy/K4 automation suite
    By Nader Heidari
*/

var InK = {
    find_script_dir: function () {
        "use strict";
        try {
            return new File(app.activeScript).path;
        } catch (e) {
            return new File(e.fileName).path;
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
        var local = new File(this.find_script_dir());
        if (path.substring(0, 3) === "../") {
            path = path.substring(2);
            local = local.parent;
        }
        $.evalFile(local + path);
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

InK.require('/includes/FuzzySet.jsx');
InK.require('/includes/JSON.jsx');
InK.require('/app/InK.metadata.js');
InK.require('/app/InK.interp.js');

InK.styleToLabelMap = InK.getJSON('/config/styleMap.json');

$.bp(true);
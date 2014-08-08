/*jslint regexp:true */
/*global app*/
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
        var local = new File(this.find_script_dir()), newPath;
        newPath = local + path;
        if (path.substring(0, 3) === "../") {
            newPath = path.substring(2) + local.parent;
        }
        $.evalFile(newPath);
    }
};

InK.require('/includes/FuzzySet.jsx');
InK.require('/includes/JSON.jsx');
InK.require('/app/InK.metadata.js');
InK.require('/app/InK.interp');

InK.styleToLabelMap = InK.getJSON('/config/styleMap.json');

InK.getMap();
InK.metadataMap.Fuzzy.get("webhead");
$.bp(true);
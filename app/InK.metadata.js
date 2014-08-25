/* InK Metadata Operations*/

InK.getMap = function () {
    "use strict";
    var i, defs, metadataMap, slug, baseSlug;
    defs = app.k4Publications[0].k4MetaDataDefs;
    metadataMap = {};
    metadataMap.slugs = [];
    for (i = 0; i < defs.length; i += 1) {
        slug = defs[i].k4Name.toLowerCase().replace(/[^a-z]/g, "");
        baseSlug = slug.replace(/^sub/i, "");
        if (metadataMap.hasOwnProperty(baseSlug)) {
            // Check if it's a subarticle field. If so, just add to sub properties.
            if (slug.match(/^sub/i)) {
                metadataMap[baseSlug].subs += 1;
                metadataMap[baseSlug].sub_names.push(defs[i].k4Name);
            } else {
                metadataMap[slug].fields += 1;
                metadataMap[slug].names.push(defs[i].k4Name);
            }
        } else {
            metadataMap.slugs.push(slug);
            metadataMap[slug] = {
                //definition: defs[i],
                names: [defs[i].k4Name],
                subs: 0,
                sub_names: [],
                slug: slug,
                fields: 1,
                type: defs[i].k4MetaDataDataType.toString()
            };
        }
    }
    (function addCENCustomizations(obj) {
        obj.webhed = obj.webtitle;
        obj.slugs.push('webhed');
        obj.slugs = obj.slugs.sort();
        return obj;
    }(metadataMap));
    metadataMap.Fuzzy = new this.FuzzySet(metadataMap.slugs, false, 2, 2);
    metadataMap.fuzzyGet = function (str) {
        var found = this.Fuzzy.get(str);
        if (found && found.length) {
            return found[0][1];
        }
        return false;
    };
    this.map = metadataMap;
    return metadataMap;
};

InK.mapMetadataTo = function (data, taskObj) {
    "use strict";
    var item, cache = {};

    function setMetadataValue(field, value) {
        var metadataValue, values = taskObj.k4MetaDataValues,
            def, defs = app.k4Publications[0].k4MetaDataDefs,
            valueList, valueLists;
        metadataValue = values.k4GetByName(field);
        def = defs.k4GetByName(field);
        switch (def.k4MetaDataDataType.toString()) {
            case "K4_STRING":
                metadataValue.k4StringValue = value;
                break;
            case "K4_VALUE_LIST":
                valueLists = def.k4MetaDataDefValueLists;
                valueList = valueLists.k4GetByName(value) || new this.FuzzySet(valueLists.everyItem().k4Name).get(value)[0][1];
                if (valueList && valueList.isValid) {
                    metadataValue.k4ValueListValue = valueList.k4Id;
                }
                break;
            case "K4_INTEGER":
                metadataValue.k4IntValue = value || 0;
                break;
        }

    }

    for (item in data) {
        if (data.hasOwnProperty(item)) {
            if (cache[item]) {
                cache[item.slice(0, -1) + (parseInt(item[-1], 10) + 1)] = data[item];
            } else {
                cache[item] = data[item];
            }
            if (app.k4Publications[0].k4MetaDataDefs.k4GetByName(item)) {
                setMetadataValue(item, cache[item]);
            }
        }
    }
};
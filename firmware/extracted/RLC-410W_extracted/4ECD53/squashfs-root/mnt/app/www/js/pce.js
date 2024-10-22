/**
 * Privileges Controlling Engine
 */
function PCE() {
    throw {
        "msg": "Unable to new a Singleton object."
    }
}

(function() {

    var privileges;

    var features;

    var getFeature = function(name, channel) {

        if (typeof channel === "number") {

            if (privileges.abilityChn !== undefined && privileges.abilityChn[channel] !== undefined && privileges.abilityChn[channel][name] !== undefined) {

                return privileges.abilityChn[channel][name];
            }
        }
        else if (privileges[name] !== undefined) {

            return privileges[name];
        }

        return null;
    };

    PCE.init = function(inputAbs) {

        privileges = inputAbs;

        features = [];

        for (var feature in inputAbs) {

            if (typeof(feature) !== "string") {

                continue;
            }

            if (feature !== "abilityChn") {

                features.push(feature);
            }
            else {

                inputAbs.abilityChn.forEach(function(chFeatures) {

                    for (var feature in chFeatures) {

                        if (typeof(feature) !== "string") {

                            continue;
                        }

                        if (features.indexOf(feature) === -1) {

                            features.push(feature);
                        }
                    }
                });
            }
        }

    };

    PCE.existFeature = function(name, channel) {

        var feature = getFeature(name, channel);

        return feature ? true : false;
    };

    PCE.checkVersion = function(name, channel, version) {

        var feature = getFeature(name, channel);

        if (feature && feature.ver == version) {

            return true;
        }

        return false;
    };

    PCE.hasFeature = function(name, channel) {

        var feature = getFeature(name, channel);

        return feature && feature.ver ? true : false;
    };

    PCE.getFeatureVersion = function(name, channel) {

        var feature = getFeature(name, channel);

        return feature ? feature.ver : null;
    };

    var detectPermission = function(name, channel, right) {

        var feature = getFeature(name, channel);

        if (feature !== null && feature.ver && (feature.permit & right)) {

            return true;
        }

        return false;
    };

    PCE.isReadable = function(name, channel) {

        return detectPermission(name, channel, 4);
    };

    PCE.isWritable = function(name, channel) {

        return detectPermission(name, channel, 2);
    };

    PCE.isExecutable = function(name, channel) {

        return detectPermission(name, channel, 1);
    };

    PCE.listFeatures = function() {

        return features;
    };

})();

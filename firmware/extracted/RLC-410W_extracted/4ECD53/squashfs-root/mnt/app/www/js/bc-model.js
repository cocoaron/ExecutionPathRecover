
function bcModelMap(modelData, modelName, $parent) {
    var $fields;
    if ($parent) {
        $fields = $parent.find('[bc-model=' + modelName + ']');
    } else {
        $fields = $('[bc-model=' + modelName + ']');
    }
    $fields.each(function() {
        var field = $(this).attr('bc-model-field');
        switch ($(this).get(0).tagName) {
        case 'SELECT':
        case 'INPUT':
            switch ($(this).attr('type')) {
            case 'checkbox':

                if ($(this).is(':checked') != modelData[field]) {
                    $(this).click();
                }
                break;
            case 'radio':
                if (!$(this).is(':checked')) {
                    if ($(this).val() == modelData[field]) {
                        $(this).click();
                    }
                }

                break;
            default:
                $(this).val(modelData[field]);
            }
            break;

        case 'IMG':

            $(this).attr("src", modelData[field]);
            break;

        default:
            $(this).text(modelData[field]);
            break;
        }
    });
}

function bcModelGuard(modelRange, modelName, $parent) {
    var $fields;
    if ($parent) {
        $fields = $parent.find('[bc-model=' + modelName + ']');
    } else {
        $fields = $('[bc-model=' + modelName + ']');
    }
    $fields.each(function() {
        var field = $(this).attr('bc-model-field');
        if (modelRange[field] === undefined) {
            return;
        }
        switch ($(this).get(0).tagName) {
        case 'INPUT':
            switch ($(this).attr('type')) {
            case 'number':
                $(this).attr(modelRange[field]);
                break;
            default:
                $(this).attr('maxlength', modelRange[field].maxLen);
            }
            break;

        default:
            break;
        }
    });
}

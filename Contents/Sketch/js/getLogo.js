@import 'common.js'
var getLogos = function(context, dataPath) {
  	var doc = context.document;
    var selection = context.selection;

    if (selection.count() == 0) {
      doc.showMessage('⚠️Please select at least one shape!!')
    } else {
      placeLogoImage(dataPath, context);
    }
}

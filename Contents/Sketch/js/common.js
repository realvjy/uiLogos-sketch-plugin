//Show Alert message
function alert(msg, title) {
  title = title || "Whoops";
  var app = [NSApplication sharedApplication];
  [app displayDialog:msg withTitle:title];
}

//Is rectangle shape
function isRectangleShape(selection) {
  return([selection isMemberOfClass:[MSRectangleShape class]])
}


function deleteLayer(layer){
	var parent = [layer parentGroup];
	if(parent) [parent removeLayer: layer];
}


function shuffle(array) {
	var currentIndex = array.count(), temporaryValue, randomIndex ;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

//Replace image
function replaceWithImages(images, context) {
	var selection = context.selection;
  var doc = context.document;
  var page = doc.currentPage()
  var artboard = page.currentArtboard()

	for(var i = 0; i < [selection count]; i++) {
		var newImage = [[NSImage alloc] initByReferencingFile:images[i]];
    var selectedLayer = selection[i];
    // Save original Image Size
    var originalSize = newImage.size();

    // Create Image data to fill or create new layer
    if (MSApplicationMetadata.metadata().appVersion < 47) {
        var imageData = MSImageData.alloc().initWithImage_convertColorSpace(newImage, false);
    } else {
        var imageData = MSImageData.alloc().initWithImage(newImage);
    }
    if (isRectangleShape(selectedLayer)) {
      var frame = getFrameSize(originalSize, selectedLayer)

      // var rect = CGRectMake(0, 0, 100, 100); //default dimension
      var bitmapLayer = MSBitmapLayer.alloc().initWithFrame_image(frame, imageData);
      bitmapLayer.name = getLayerName(images[i]); //change layer name
      artboard.addLayers([bitmapLayer]); //Create new bitmap layer
      artboard.removeLayer(selectedLayer);// remove sected layer
    }
	}

	if([selection count] == 0) [doc showMessage:'Select at least one vector shape'];;

}

// Get Logo Image URL stack
function placeLogoImage(dataPath, context) {
  var selection = context.selection;
  var doc = context.document;
  var fileManager = [NSFileManager defaultManager];
	var imagesPath =  context.plugin.url() + "Contents/Sketch/" + dataPath; //Get Url for logo image
	imagesPath = imagesPath.replace("%20", " ").replace("file://", ""); //replace %20 with space and remove file://

  var fileTypes = NSArray.arrayWithArray(['svg', 'SVG', 'jpg', 'JPG', 'jpeg', 'JPEG', 'gif', 'GIF', 'png', 'PNG']);
	var fileManager = [NSFileManager defaultManager];
	var files = [fileManager contentsOfDirectoryAtPath:imagesPath error:nil];
	var imageFileNames = [[files filteredArrayUsingPredicate:[NSPredicate predicateWithFormat:@"pathExtension IN %@", fileTypes]] mutableCopy]
	var count = imageFileNames.count();
  if (count != 0 && count >= selection.count()) {
    shuffle(imageFileNames);

    for (var i = 0; i < selection.count(); i++) {
      if (isRectangleShape(selection[i])) {
        imageFileNames[i] = imagesPath + "/" + imageFileNames[i];
      } else {
        doc.showMessage('Please select rectangle shape!!');
      }
    }

    replaceWithImages(imageFileNames, context);
  } else {
    doc.showMessage('Sorry!! Too many shapes. Select maximum '+count+' shapes' );
  }

}


// Frame Size for image repace
function getFrameSize(originalSize, selectedLayer){

    // Default dimentions
    var newX = 0;
    var newY = 0;
    var newWidth = 100;
    var newHeight = 100;



    // Decide the output frame dimension for reference
    if (isRectangleShape(selectedLayer)) {
      newX = selectedLayer.frame().x();
      newY = selectedLayer.frame().y();
      newWidth = selectedLayer.frame().width();
      newHeight = selectedLayer.frame().height();
    }

    // // Decide the height and width
    var ratio = originalSize.height/originalSize.width;


    var newHeight = newHeight;
    var newWidth = newHeight/ratio;

    // Check for portrait logo
    if(newWidth > selectedLayer.width) {
        newWidth = selectedLayer.height;
        newHeight = newWidth*ratio;
    }


    // Decide location center align with shape
    var newX = selectedLayer.frame().x() + (selectedLayer.frame().width() - newWidth)/2;
    var newY = selectedLayer.frame().y() + (selectedLayer.frame().height() - newHeight)/2;

    return CGRectMake(newX,newY,newWidth,newHeight);
}

// Get Layer name
function getLayerName(imageURL) {
  return String(imageURL.lastPathComponent().componentsSeparatedByString(".").firstObject());
}

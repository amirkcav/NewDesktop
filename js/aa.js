var aa;
if (this['document']) {
	var aa = document;
}

if (this['importScripts']) {
	//importScripts('libs/jquery.hive.pollen.js');
	importScripts('libs/workerFakeDom.js');
	importScripts('libs/jquery-2.1.1.min.js');
}


//$.send('AMIR');

this.onmessage = function(data) {
	//alert(data);
}

addEventListener("message", function (evt) {
	//alert(evt);
});


//$(function (data) {
////addEventListener("message", function (evt) {
//
//	//importScripts('libs/jquery-2.1.1.min.js');
//
//	var liElement = $('<li></li>'); 	    		
//	addSubMenu(liElement, data.message);
//
//	////postMessage($(liElement).prop('outerHTML'));
//	$.send($(liElement).prop('outerHTML'));
//	
////}, false);
//});


function addSubMenu(parent, childrenObj) {
	if (childrenObj && childrenObj.length > 0) {
		$(parent).append($('<ul></ul>'));
		$.each(childrenObj, function(j, a) {
			var newChild = setMenuItem(a);
			$(parent).find('> ul').append(newChild);
		});
	}
}

function setMenuItem(itemObj) { 
	var newItemElem = $(itemTemplate).clone();
	// set name
	if (itemObj.TXT) {
		//$(newItemElem).find('.name').html(getHebrew(itemObj.TXT));//stringFormat('[{0}] {1}', itemObj.number, itemObj.name));
		$(newItemElem).find('.name').html(itemObj.TXT);
	}	
	// set icon
	if (itemObj.icon) {
		$(newItemElem).find('.name').prepend('<i class="' + itemObj.icon + '"><i/>');
	}
	// set children (recursive)
	addSubMenu(newItemElem, itemObj.MENU);
	return newItemElem;
}


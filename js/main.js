$(function() {
	
	// close popover on outside click
	$('body').on('click', function (e) {
	    //did not click a popover toggle or popover
	    var popoverElement = $(e.target).data('toggle') == 'popover' ? $(e.target) : $(e.target).parents('[data-toggle=popover]');
	    if ((popoverElement).length == 0 && $(e.target).parents('.popover.in').length === 0) {
	        $('[data-toggle="popover"]').popover('hide');
	        // attribute aria-describedby is auto-added when the popover is shown.
	        if ($('[data-toggle="popover"][aria-describedby]').data("bs.popover")) {
	            $('[data-toggle="popover"][aria-describedby]').each(function(){
	                $(this).data("bs.popover").inState = {click: false, hover: false, focus: false};
	            });
	        }
	    }
	    // button[data-dismiss=popover] - close popover
	    if ($(e.target).is('[data-dismiss="popover"]')) {
	    	$(e.target).closest('.popover').popover('hide')
	    								   .data("bs.popover").inState = {click: false, hover: false, focus: false};
	    }        
	});
	
	$('#graphs-section, #shortcuts-section, #info-squares-section').on('click', '#confirmation-popover-yes', function(e) {    	
		var func = $(this).data('func');
		// call the function
		window[func](this);
		
		$(e.target).closest('.popover').popover('hide')
		   		   .data("bs.popover").inState = {click: false, hover: false, focus: false};		
		e.stopPropagation();
	});
	
	$('#graphs-section, #shortcuts-section, #info-squares-section').on('click', '#confirmation-popover-no', function(e) {    			
		e.stopPropagation();
		$(e.target).closest('.popover').popover('hide')
		   .data("bs.popover").inState = {click: false, hover: false, focus: false};
	});
	
});

// from https://stackoverflow.com/questions/1038746/equivalent-of-string-format-in-jquery#answer-1038930
function stringFormat(string, format) {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }
    return s;
}

$.fn.measure = function(fn, parent) {
  el = $(this).clone(false)
  el.css('visibility', 'hidden');  
  var _parent = parent ? parent : 'body';
  el.appendTo(_parent)
  result = fn.apply(el)
  el.remove()
  return result;
}
  
// put the values into the html elements
function setTemplateFields(template, object) {
    $(template).find('.template-field').each(function(ijij,zzz){
        var field = $(zzz).data('field');
        if ($(zzz).is('i')) {
        	$(zzz).addClass(object[field]);
        }        
        else {
        	$(zzz).html(object[field]);
        }
    });
    return template;
}

function cloneObject(obj) {
	return JSON.parse(JSON.stringify(obj));
}

function resetFormValues(form) {
	$(form).find('input, select').each(function(ijij,zzz){
		if ($(zzz).is('input[type=checkbox]')) {
	    	$(zzz).prop('checked', false);
	    }        
	    else if ($(zzz).is('input')) {
	    	$(zzz).val('');
	    }
	    else if ($(zzz).is('select')) {
	    	var firstOption = $(zzz).find('option:first'); 
	    	$(zzz).val(firstOption.val())
	    		  .trigger('change');
	    }
    });
}

// set tooltip (hover title) if text is too long for the element size.
function setTooltip(element) {    
    elemContent = $(element).html();
    if (element.offsetWidth < element.scrollWidth + 1 && !$(element).attr('title') && !$(element).children().hasClass('no-title'))
    {
        if ($(element).children().hasClass('take-title')) {
            var childTitle = $(element).children('.take-title').attr('title');
            $(element).attr('title', childTitle);
        }        
        else {
            $(element).attr('title', elemContent);
        }
    }
    else {
    	$(element).attr('title', '');
    }
}

Array.prototype.indexOfByProperty = function (compareProperty, value) {
    for (var i = 0; i < this.length; i++) {
        if (this[i][compareProperty] == value) {
            return i;
        }
    }
    return -1;
}

function setSelectOptions(optionsData, select, textProp = 'TXT', valueProp = 'COD') {
	var options = [];
    for (var i = 0; i < optionsData.length; i++) {
    	var info = optionsData[i];
    	var newOption = new Option(info[textProp], info[valueProp]);
    	$(newOption).data('data', JSON.stringify(info));
    	options.push(newOption);
    }
    $(select).append(options);
}
  


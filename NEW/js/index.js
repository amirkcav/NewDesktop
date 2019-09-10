// var rootItemTemplate = '<li><a href="javascript:;"><i></i> <span class="menu-item-parent"></span></a></li>';
var menuItemTemplate = '<li><a class="name" href="javascript:;"></a></li>';
var menuApps = [];
var originalItemsData;
var lastMenuApp;

var lpGetRequestCompleted = false;
var menuRequestCompleted = false;

var menuFavorites;

var shortcutsArea = {};
var infoSquaresArea = {};
var graphsArea = {};
var lastAppsArea = $('<div></div>');

var hebrewPeriods = {
	monthly: 'חודשי',
	daily: 'יומי'
}

// set token header (from query string).
var urlParams = new URLSearchParams(window.location.search);
var token = urlParams.has('token') ? urlParams.get('token') : null;
$.ajaxSetup({
	headers: {
			'CavToken': token
	}
});

getPageData();

// var lastRefresh = new Date();
// // refresh page data every interval.
// var refreshIntervalSeconds = 5;
// setInterval(function() {
// 	refreshPageData();	
// }, refreshIntervalSeconds * 60 * 1000);

$(function() {		

	// $('#done-edit-page').click(function() {
	// 	originalLayout = cloneObject(uiLayout);
	// 	$('.sort-area').sortable('destroy');
	// 	$('body').removeClass('editing');

	// 	var url = "../mcall?_ROUTINE=%25JMUJSON&_NS=CAV&_LABEL=LPSAV";
	// 	// don't save the current values, just the selected types.
	// 	if (uiLayout.graphs.data) {
	// 		uiLayout.graphs.data.map((g) => { g.data = undefined; });
	// 	}
	// 	if (uiLayout['info-squares'].data) {
	// 		uiLayout['info-squares'].data.map((g) => { g.VAL = undefined; });
	// 	}
  //   var data = JSON.stringify({ data: uiLayout }); 
  //   $.ajax({
	// 		type : 'POST',
	// 		url : url,
	// 		data: data,
	// 		contentType : 'application/json',
	// 		// dataType : 'json',
	// 		success : function(data) {
	// 			// currently returning "*** OK ***"
	// 			if (data && data.indexOf('OK') > -1) {
	// 				$.smallBox({
	// 					title : "המידע נשמר בהצלחה!",
	// 					// content : "...",
	// 					color : "#6a6",
	// 					timeout: 3000,
	// 					sound: false,
	// 					iconSmall : "fa fa-check"
	// 				});
	// 			}
  //   	},
	// 		error: function(data) {
	// 			alert(data.responseText);    		
	// 		}
  //   });  

	// });	

	//#region menu

	$('.search-app-li > a').click(function() {
		$(this).parent().toggleClass('show-input');		
		setTimeout(() => {
			if ($(this).parent().hasClass('show-input')) {		
				$('#search-in-menu').focus();
			}
		}, 500);
	});

	$('#menu-list').on('click', 'li.app > a.name', function() {
		var parent = $(this).parent();
		// on first menu click add last position button
		if (!lastMenuApp) {
			$('#menu-list > ul').append('<li><a href="javascript:;" onclick="showLastMenuPosition()">מיקום לחיצה אחרונה</a></li>');
		}
		lastMenuApp = parent;
		var apm = parent.data('apm');
		var uci = JSON.parse(parent.data('data')).SYS; //parent.data('uci');
		var wcy = parent.data('wcy');
		var appText = JSON.parse(parent.data('data')).TXT;
		runApp(apm, uci, wcy, appText);
	});

	$('#menu-list').on('click', 'li.app > a.add-to-favorites', function() {
		var data = $(this).closest('li').data('data');
		var item = JSON.parse(data);
		if (!$(this).hasClass('favorite')) {
			addToFavorites(item);
			$(this).addClass('favorite');
			$(this).find('i').removeClass('fa-star-o').addClass('fa-star');
		}
		else {
			removeFromFavorites(item);
			$(this).removeClass('favorite');
			$(this).find('i').addClass('fa-star-o').removeClass('fa-star');
		}
	});    

	//#endregion menu

	lastAppsArea.on('click', 'li.last-app > a', function() {
		var apm = $(this).data('apm');
		var uci = $(this).data('uci');
		var wcy = $(this).data('wcy');
		runApp(apm, uci, wcy);
	});

	$('#refresh-page-data-button').on('click', function() {
		refreshPageData();
	});

});

//#region general

function getPageData() {
	// get menu data
	$.ajax({
		type : 'POST',
		url : "../mcall?_ROUTINE=%25JMUJSON&_NS=CAV&_LABEL=ZZ",
		contentType : 'application/json',
		dataType : 'json',
		success : function(data) {
			// 	// get the shortcuts from the favorites
			// uiLayout.shortcuts.data = data[data.length - 1].MENU;

			// // save the original layout to be able to cancel changes.
			// originalLayout = cloneObject(uiLayout);

			// renderAllAreas(true);
			menuFavorites = data[data.length - 1].MENU;

			// to get a big menu
			if (token === '1234') {
				data = data.concat(data).concat(data);
			}

			// rendreing the menu is heavy. using timeout so all the page data would be rendered first.
			setTimeout(function() {
				setMenu(data);
				menuRequestCompleted = true;

				var menuHeight = $('#left-panel').prop('clientHeight') - $('#header').prop('clientHeight');
				// $('#main').css('margin-top', menuHeight + 'px', 'important');
				$('#main')[0].style.setProperty('margin-top', menuHeight + 'px', 'important');

				requestCompleted();
			}, 500);
		},
		error: function(data) {
			alert(data.responseText);    		
			menuRequestCompleted = true;
			requestCompleted();
		}
	});
	
	// get page data
	var url = "../mcall?_ROUTINE=%25JMUJSON&_NS=CAV&_LABEL=LPGET";    	
	// var data = JSON.stringify({ data: uiLayout }); 
	$.ajax({
		type : 'POST',
		url : url,
		// data: data,
		contentType : 'application/json',
		dataType : 'json',
		success : function(data) {			

		var gridstackOptions = {
			cellHeight: 'auto',
			staticGrid: true,
			resizable: {
				handles: 'se, sw'
			}
		};
		$('.grid-stack').gridstack(gridstackOptions);
		gridStackObj = $('.grid-stack').data('gridstack');

			renderItems(data.data);

			lpGetRequestCompleted = true;
			requestCompleted();

			// set last refresh time
			lastRefresh = new Date();
			$('#last-update').text(dateFormat(lastRefresh, 'dd/mm/yyyy HH:MM'));
		},
		error: function(data) {
			alert(data.responseText);   
			// renderAllAreas(true);
			lpGetRequestCompleted = true;
			requestCompleted(); 		
		}
	});

	// get available graphs (for add graph popup)
	$.ajax({
		type : 'GET',
		url : "../mcall?_NS=CAV&_ROUTINE=CBIGRF&_LABEL=GETALLGRF",
		contentType : 'application/json',
		dataType : 'json',
		success : function(data) {
			// currently showing only graphs from SVK (the second chracter of the graph name is the UCI).
			allGraphsOptions = data.graphList.filter((g) => g.code[1] === 'S').sort((ga, gb) => ga.name.localeCompare(gb.name) );
			allGraphsOptions = $.map(allGraphsOptions, function (obj) {
				obj.id = obj.id || obj.code;
				obj.text = obj.text || obj.name;
				return obj;
			});
		},
		error: function(data) {
			alert(data.responseText);    		
		}
	});

	// get available info squares.
  allInfoSquaresOptions = [ { COD: 1, TXT: 'מכירות יומי', VAL: '72,527' }, { COD: 2, TXT: 'מכירות חודשי', VAL: '1,211,422' }, { COD: 3, TXT: 'מכירות שבועי', VAL: '24,053' }, { COD: 4, TXT: 'החזרות חודשי', VAL: '6,320' }, { COD: 5, TXT: 'מוצרים פגומים חודשי', VAL: '5,245' }, { COD: 6, TXT: 'מכירות שנתי', VAL: '14,310,558' }, { COD: 7, TXT: 'רווחים חודשי עם כותרת ארוכה', VAL: '342,099' } ];
	allInfoSquaresOptions = allInfoSquaresOptions.sort((isa, isb) => isa.TXT.localeCompare(isb.TXT) );
	allInfoSquaresOptions = $.map(allInfoSquaresOptions, function (obj) {
		obj.id = obj.id || obj.COD;
		obj.text = obj.text || obj.TXT;
		return obj;
	});

	// get last documents
	$.ajax({
		type : 'GET',
		url : "../mcall?_NS=CAV&_ROUTINE=%25JMUJSON&_LABEL=RDOCS",
		contentType : 'application/json',
		dataType : 'json',
		success : function(data) {
			var docs = [];
			data.document.forEach(doc => {
				var template = `<li class="last-doc list-item" data-doc-dataa="${doc}" data-a="{"name": "AMIR"}">
													<a href="javascript:;" class="set-tooltip-field">${doc.description}</a>
												</li>`;
				var elem = htmlToElement(template);
				$(elem).data('doc-data', JSON.stringify(doc));
				docs.push(elem);
			});
			$('#last-docs-section > ul').append(docs);
		},
		error: function(data) {
			alert(data.responseText);    		
		}
	});
}

function refreshPageData() {
	$('.item-data-cube, .item-graph').each((i,o) => {
		var data = JSON.parse($(o).data('item-data'));
		if ($(o).data('item-type') === 'data-cube') {
			getInfoSquareData(data, function(value) {
				updateDataCubeValue(o, value);
			});
		}
		else if ($(o).data('item-type') === 'graph') { 
			getGrpahData(data, function(graphWithData) {
				renderGraphData(graphWithData);
			});
		}
	});
	
	// // info squares
	// for (i = 0; i < uiLayout['info-squares'].data.length; i++) { 
	// 	var item = uiLayout['info-squares'].data[i];
	// 	getInfoSquareData(item, function(itemWithData) {
	// 		renderInfoSquareData(itemWithData);				
	// 	});	
	// }

	// // graphs
	// for (var i = 0; i < uiLayout.graphs.data.length; i++) {
	// 	var graph = uiLayout.graphs.data[i];
	// 	// var divId = $(graph).find('> .graph-div').attr('id');
	// 	// var graphData = JSON.parse($(graph).data('data'));			
	// 	// drawGraph(graphData, divId);
	// 	getGrpahData(graph, function(graphWithData) {
	// 		renderGraphData(graphWithData);
	// 		// $('#' + divId).parent().removeClass('loading');
	// 	});
	// }

	// set last refresh time
	lastRefresh = new Date();
	$('#last-update').text(dateFormat(lastRefresh, 'dd/mm/yyyy HH:MM'));
}

function runApp(apm, uci, companyCode, text, params = '') {
	var apmArr = apm.split(':');
	var ap = apmArr[0];
	var pm = apmArr[1];
	// // add to last apps
	// if (text && text.length > 0) {
	// 	var currApp = { TXT: text, UCI: uci, APM: apm, wCY: companyCode };
	// 	addToLastApps(currApp);		
	// 	renderArea(lastAppsArea, uiLayout['last-apps']);
	// }
	// run app.
	if (window.app) {
		app.openApplication(ap, pm, uci, companyCode ? companyCode.toString() : '', params);
	}
	else {
		console.log(stringFormat('Run App - {0}:{1}:{2}:{3}:{4}', ap, pm, uci, companyCode, params));
	}
}

function addToLastApps(newApp) {
	var prevApp = uiLayout['last-apps'].data[0];
	// add the app only if it's different from the last run app.
	if (!prevApp || prevApp.TXT != newApp.TXT) {
		uiLayout['last-apps'].data.unshift(newApp);
		resetArrayLocations(uiLayout['last-apps'].data);
	}
}

function resetArrayLocations(arr) {
	for (let ij = 0; ij < arr.length; ij++) {
		const element = arr[ij];
		element.LOC = ij + 1;
	}
}

//#endregion general

//#region graphs

// function renderCharts(useTimeout) {
// 	$('#graphs-section').find('.sort-item:not(.template-item)').remove();
// 	var graphPosition = 0;
// 	while (graphPosition < itemsCount['graphs']) {
// 		renderChart(graphPosition);
// 		graphPosition++;
// 	}
// 	// sortArea($('#graphs-section'));
// 	//// set the width of the graphs
// 	//// calculateChartsWidth();
// 	//// rerender the graphs to fit the new size
// 	//// refreshCharts(useTimeout);
// }

// function renderChart(graphPosition, atPosition) {
// 	var newItem = $('#graphs-section').find('.template-item');
// 	var template = newItem.clone();
// 	template.removeClass('template-item');
// 	var divId = 'graph' + (graphPosition + 1);
// 	template.find('> .graph-div').attr('id', divId);
// 	template.find('.add-item-button').data('position', graphPosition + 1);
// 	template.data('position', graphPosition + 1);
// 	var graph = uiLayout.graphs.data ? uiLayout.graphs.data.filter(function(a) { return a.LOC == graphPosition + 1 })[0] : undefined;		
// 	if (!graph) {
// 		template.addClass('editing-item-placeholder');
// 	}
// 	else {
// 		getGrpahData(graph, function(graphWithData) {
// 			renderGraphData(graphWithData);
// 		});
// 	}
// 	template.css('width', 'calc(' + 100 / itemsCount['graphs'] + '% - 20px)');
// 	if (atPosition && $('#graph' + graphPosition)) {
// 		$('#graph' + graphPosition).parent().after(template);
// 	}
// 	else {
// 		$('#graphs-section').append(template);
// 	}
// }

function renderGraphData(graph) {
	template = $(`[data-id=${graph.id}]`) // $('#graph' + graph.LOC).parent();
	template.addClass('active');			
	var header = graph.data.titles.head.replace(/<BR>/,' ').replace(/<BR >/,' ')
	template.find('.graph-title > label').html(header);
	setTooltip(template.find('.graph-title > label')[0]);
	template.data('data', JSON.stringify(graph));
	template.removeClass('editing-item-placeholder loading');
	drawGraph(graph.data, template.find('canvas')[0]);		
	if (graph.data.type === 'table') {
		$(template).addClass('table-graph');
		$(template).find('table').bootstrapTable();
	}
	else {
		$(template).removeClass('table-graph');
	}
}

// function calculateChartsWidth() {	
//     // the percentage value of each width unit
// 	var percent = 100 / itemsCount['graphs'];
// 	// setting the width for each graph
// 	for (var i = 0; i < itemsCount['graphs']; i++) {
// 		var graph = uiLayout.graphs.data ? uiLayout.graphs.data.filter(function(a) { return a.LOC == i + 1 })[0] : undefined;
// 		var _width;
// 		if (graph && graph.data.chartSize == 'large') {
// 			_width = 2 * percent + '%';
// 		}
// 		else {
// 			_width = percent + '%';
// 		}	
// 		// 20px is for the radius (10px each size).
// 		$('#graph' + (i + 1)).parent().css('width', 'calc(' + _width + ' - 20px)');
		
// 		if (graph && graph.data.chartSize == 'large') {
// 			i++;
// 		}		
// 	}
// }

// function setChartWidth(currGraph) {	
// 	// the percentage value of each width unit
// 	var percent = 100 / itemsCount['graphs'];
// 	var _width;
// 	if (currGraph && currGraph.data.chartSize == 'large') {
// 		_width = 2 * percent + '%';
// 	}
// 	else {
// 		_width = percent + '%';
// 	}	
// 	// 20px is for the radius (10px each size).
// 	$('#graph' + currGraph.LOC).parent().css('width', 'calc(' + _width + ' - 20px)');
// }

// get graph data from server.
function getGrpahData(graph, handler) {
	var url = `../mcall?_ROUTINE=CBIGRF&_NS=CAV&_LABEL=RUN&GRF=${ graph.code }&TFK=MNG&USERNAME=SID`;    	
	$.ajax({
		type : 'GET',
		url : url,
		contentType : 'application/json',
		dataType : 'json',
		success : function(data) {
			graph.data = data;
			handler(graph);
		},
		error: function(data) {
			alert(data.responseText);    		
		}
	});	
}

// set icon for the graph in the add graph modal.
function getGraphIcon(graphType) {
	var chartIconClass = '';
	switch (graphType) {
		case 'pie':
			chartIconClass = 'pie-chart';
			break;
		case 'bar':
			chartIconClass = 'bar-chart';
			break;
		case 'table':
			chartIconClass = 'table';
			break;
		case 'gauge':
			chartIconClass = 'tachometer';
			break;
		default:
			var t = 4;
			break;
	}
	return chartIconClass;
}

// the call to graphs plugin according to the graph type.
function drawGraph(graphData, canvasElem, graphHeight) {
	switch (graphData.type) {
		case "bar":
			drawBar_NEW(graphData, canvasElem);
			break;
		// case "line":
		// 	drawLine(graphData, divId, graphHeight);
		// 	break;
		case "pie":
			drawPie_NEW(graphData, canvasElem);
			break;
		case "gauge":
			drawGauge_new(graphData, canvasElem);
			break;
		case "table":
			drawTable_new(graphData, canvasElem);
			break;
		default:
			return;
	}
	var graphClass = graphData.type === 'table' ? 'table-graph' : '';
	canvasElem
}

//#endregion graphs

//#region menu

function setMenu(data) {		    	
	for (let i = 0; i < data.length; i++) {
		const rootItem = data[i];
		// if there's only one company, skip companys level
		if (rootItem.MENU.length === 1) {
			rootItem.MENU = rootItem.MENU[0].MENU;
		}
		var liElement = $(`<li><a href="javascript:;"><i class="fa fa-lg fa-home"></i> <span class="menu-item-parent">${rootItem.TXT}</span></a></li>`); 		    		
		addSubMenu(liElement, rootItem.MENU);
		$('#menu-list > .search-app-li').before(liElement);
		// set tooltip
		if (liElement.find('.menu-item-parent').prop('offsetWidth') < liElement.find('.menu-item-parent').prop('scrollWidth')) {
			liElement.find('.menu-item-parent').attr('title', rootItem.TXT);
		}
	}
	
	initSmartmenu();	

	$('#menu-list > li:not(.search-app-li):last').attr('id', 'favorites-menu-item')
											  											 .find('.add-to-favorites').remove();	

	setMenuSearch();
	
	// moving the child menu so it won't get out of the bottom of the page. 
	$('nav #menu-list ul li').on('mouseenter', function() {
		var list = $(this).find('> ul'); 
		if (list.length > 0 && !$(list).hasClass('re-positioned')) {
			var listHeight = $(list).height();  	
			var listPositionY = $(list).offset().top;
			var bodyHeight = $('body').height();
			// if menu is too long, and will cause scroll	    	
			if (listPositionY + listHeight > bodyHeight) {
				var moveOffset = Math.min(listPositionY - 50, listPositionY + listHeight - bodyHeight + 25);
				$(list).css('top', -1 * (moveOffset))
							.addClass('re-positioned');	    		 		
			}    	   
		}
	});
}

function addSubMenu(parent, childrenObj) {
	$(parent).append('<ul></ul>');
	var childList = $(parent).find('> ul');
	for (var i =0, len = childrenObj.length; i < len; i++) {
		var a = childrenObj[i];			
		var newChild = setMenuItem(a);
		childList.append(newChild);
	}
}

function setMenuItem(itemObj) { 
	var newItemElem = $(menuItemTemplate).clone();
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
	if (itemObj.MENU && itemObj.MENU.length > 0) {
		addSubMenu(newItemElem, itemObj.MENU);
	}
	// add to the apps array (for the menu search).
	else {
		// search in menu array. add only if not exist.
		if (menuApps.indexOfByProperty('TXT', itemObj.TXT) < 0) {				
			menuApps.push(itemObj);		
		}		
		$(newItemElem).addClass('app')
					  .data('data', JSON.stringify(itemObj))
					  .data('apm', itemObj.APM)
						.data('uci', itemObj.UCI);
		if (itemObj.wCY) {
			$(newItemElem).addClass('app').data('wcy', itemObj.wCY);
		}
		
		var favoriteClass = '';
		var favoriteIconClass = 'fa-star-o';
		// is favorite
		// if (uiLayout.shortcuts.data && uiLayout.shortcuts.data.indexOfByProperty('TXT', itemObj.TXT) >= 0) {				
		// 	favoriteIconClass = 'fa-star';
		// 	favoriteClass = 'favorite';
		// }
		$(newItemElem).prepend('<a href="javascript:;" class="add-to-favorites ' + favoriteClass + '" title="הוסף למועדפים"><i class="fa ' + favoriteIconClass +'"></i></a>');
	}	
	
	return newItemElem;
}

function setMenuSearch() {
	$.map(menuApps, function(m) { m.label = m.TXT });
	$('#search-in-menu').autocomplete({
		minLength: 2,
		source: menuApps,
		select: function( event, ui ) {
			var itemData = ui.item;
			runApp(itemData.APM, itemData.UCI, itemData.wCY, itemData.TXT);
			$(this).val('');
			$(this).blur();
			return false;
		},
	});	

	$('ul.ui-autocomplete.ui-menu').on('contextmenu', 'li.ui-menu-item', function(event) {
		$('#context').remove();
		if ($(this).find('#context').length == 0) {
			var itemData = $(this).data('uiAutocompleteItem');
	    	var contextMenu = '<div id="context"><a id="create-shortcut" href="javascript:;" data-item=\'' + JSON.stringify(itemData) + '\'>הוסף קיצור דרך</a></div>';
	    	$(this).after(contextMenu);
    	}    	
    	$(this).find('#context').show();
    	return false;
    });
}

function addToFavorites(itemToAdd) {	
	// uiLayout.shortcuts.data.push(itemToAdd);	
	// renderMenuFavorites();
	
	var url = "../mcall?_ROUTINE=%25JMUJSON&_NS=CAV&_LABEL=SAVEDSK"; // &OPC=AMIRK
    var data = JSON.stringify({ favorites: [] /*uiLayout.shortcuts.data*/ }); 
    $.ajax({
			type : 'POST',
			url : url,
			data: data,
			contentType : 'application/json',
			dataType : 'json',
			success : function(data) {
				console.log(1234);
			},
			error: function(data) {
				//alert(data.responseText);    		
			}
    });  
}

function removeFromFavorites(itemToRemove) {	
	uiLayout.shortcuts.data = $.grep(uiLayout.shortcuts.data, function(a) {
	    return a.TXT != itemToRemove.TXT;
	});
	renderMenuFavorites();
}

function renderMenuFavorites() {
	$('#favorites-menu-item ul').remove();
	addSubMenu($('#favorites-menu-item'), uiLayout.shortcuts.data);
	$('#favorites-menu-item .add-to-favorites').remove();
}

function showLastMenuPosition() {
	if (lastMenuApp) {
		lastMenuApp.parentsUntil('nav', 'li').addClass('show-list');
		
		// disabling the menu for 2 seconds except the last menu position.
		$('#menu-list li:visible').addClass('disabled');
		$('#menu-list').addClass('disabled');
		// removeing disalbe from the "siblings" of last app
		lastMenuApp.parent().find('li:visible').removeClass('disabled');
		lastMenuApp.parentsUntil('nav', 'li').removeClass('disabled');
		setTimeout(function() {
			$('nav li.disabled').removeClass('disabled');
			
			$('nav').on('mouseenter', 'li:not(.disabled)', function() {
				$('nav li.show-list').removeClass('show-list');
				$('nav').off('mouseenter', 'li:not(.disabled)');
			});
			
			$('nav li.show-list').removeClass('show-list');
		}, 2000);
	}		
}

//#endregion menu

// function addShortcut(data) {
// 	var template = $('#shortcuts-section .template-item').clone();
// 	template.removeClass('template-item');
// 	$(template).find('.template-field[data-field="TXT"]').text(data.TXT); 
// 	$(template).data('apm', data.APM)
// 						 .data('uci', data.UCI);
// 	if (data.wCY) {
// 		$(template).data('wcy', data.wCY);
// 	}
// 	var placeholderItem = $('#shortcuts-section .editing-item-placeholder').first();
// 	template.attr('original-position', placeholderItem.attr('original-position'))
// 	placeholderItem.replaceWith(template);
// }

// function removeShortcut(elem) {
// 	var parentElem = $(elem).closest('.department');
// 	var data = JSON.parse(parentElem.data('data'));
// 	var removedElemDataObject = uiLayout.shortcuts.data.filter(function(o) {
// 		return o.LOC == data.LOC;
// 	}); 
// 	removedElemDataObject[0].LOC = notShortcutPos;
// 	parentElem.fadeOut(function(){
// 		renderArea(shortcutsArea, uiLayout.shortcuts);
// 		sortArea(shortcutsArea);
// 	});	
// }

// function removeInfoSquare(elem) {
// 	var parentElem = $(elem).closest('.info-square');
// 	parentElem.removeClass('active')
// 						.addClass('editing-item-placeholder');
// 	var data = JSON.parse(parentElem.data('data'));
// 	uiLayout['info-squares'].data = $.grep(uiLayout['info-squares'].data, function(o) {
// 		return o.LOC != data.LOC;
// 	});
// 	// parentElem.fadeOut(function(){
// 	// 	// renderArea(infoSquaresArea, uiLayout['info-squares']);
// 	// 	// sortArea(infoSquaresArea);
// 	// });
// }

// function renderInfoSquares() {

// 	var areaData = uiLayout['info-squares'];
// 	var area = infoSquaresArea;

// 	// area with sorting
// 	$(area).find('.sort-item:not(.template-item)').remove();	
// 	// area without sorting
// 	$(area).find('.list-item:not(.template-item)').remove();	

// 	// set area width
// 	var newItem = $(area).find('.template-item');
	
// 	// add items
// 	var itemsNumber = itemsCount['info-squares']; 
// 	for (i = 1; i <= itemsNumber; i++) {
// 		var template = newItem.clone();
// 		template.removeClass('template-item');
// 		var currPosition = i; //j * rows + i;
// 		template.attr('id', 'info-' + i);
// 		$(template).attr('original-position', currPosition);
// 		$(template).find('.add-item-button').data('position', currPosition);
// 		$(area).append(template);		
// 		var existingItem = areaData.data.filter(function(a) { return a.LOC == currPosition });		
// 		// add an existing item
// 		if (existingItem.length > 0) {		
// 			getInfoSquareData(existingItem[0], function(itemWithData) {
// 				renderInfoSquareData(itemWithData);				
// 		  });	
// 		}
// 		// add a placeholder for sorting
// 		else {
// 			$(template).addClass('editing-item-placeholder');								 
// 			$(template).find('.set-tooltip-field').removeClass('set-tooltip-field');
// 		}
// 	}
// 	$(area).find('.set-tooltip-field').each(function(i, o) {
// 		setTooltip(o);
// 	});
	
// }

function getInfoSquareData(obj, handler) {
	// value should come from server
	const value = parseInt(Math.random() * 10000000).toLocaleString();
	obj.VAL = value;
	handler(value);
}

// function renderInfoSquareData(itemWithData) {
// 	var elem = $('#info-' + itemWithData.LOC)
// 	$(elem).addClass('active')
// 					.data('data', JSON.stringify(itemWithData));
// 	setTemplateFields(elem, itemWithData);
// 	$(elem).find('a').data('apm', itemWithData.APM)
// 									 .data('uci', itemWithData.UCI);
// 	if (itemWithData.wCY) {
// 		$(elem).find('a').data('wcy', itemWithData.wCY);
// 	}
// }

function requestCompleted() {
	if (menuRequestCompleted /*&& lpGetRequestCompleted*/) {
		// // if no shortcuts data is saved, render favorites.
		// if (uiLayout.shortcuts.data.length === 0) {
		// 	renderArea(shortcutsArea, { data: menuFavorites });
		// }
		// hide loading animation
		setTimeout(() => {
			$('#loading-animation-div').addClass('finish-loading');
			setTimeout(() => {
				$('#loading-animation-div').remove();
			}, 300);
		}, 300);
	}
}

function initSmartmenu() {
	$('#menu-list').smartmenus({
		hideOnClick: false
	});
	
	// Set proper max-height for sub menus in desktop view
	$('#menu-list').bind('beforeshow.smapi', function(e, menu) {
		var $sub = $(menu),
			hasSubMenus = $sub.find('ul').length && !$sub.hasClass('mega-menu');
		// if the sub doesn't have any deeper sub menus, apply max-height
		if (!hasSubMenus) {
			var obj = $(this).data('smartmenus');
			if (obj.isCollapsible()) {
				$sub.css({
					'overflow-y': '',
					'max-height': ''
				});
			} else {
				var $a = $sub.dataSM('parent-a'),
					$li = $a.closest('li'),
					$ul = $li.parent(),
					level = $sub.dataSM('level'),
					$win = $(window),
					winH = $win.height(),
					winY = $win.scrollTop(),
					subY = winY;
				// if the parent menu is horizontal
				if ($ul.parent().is('[data-sm-horizontal-sub]') || level == 2 && !$ul.hasClass('sm-vertical')) {
					var itemY = $a.offset().top,
						itemH = obj.getHeight($a),
						subOffsetY = level == 2 ? obj.opts.mainMenuSubOffsetY : obj.opts.subMenusSubOffsetY,
						subY = itemY + itemH + subOffsetY;
				}
				$sub.css({
					'max-height': winH + winY - subY
				});
			}
		}
	});

	// Set overflow-y: auto for sub menus in desktop view
	// this needs to be done on the 'show.smapi' event because the script resets overflow on menu show
	$('#menu-list').bind('show.smapi', function(e, menu) {
		var $sub = $(menu),
			hasSubMenus = $sub.find('ul').length && !$sub.hasClass('mega-menu');
		// if the sub doesn't have any deeper sub menus, apply overflow-y: auto
		if (!hasSubMenus) {
			var obj = $(this).data('smartmenus');
			if (!obj.isCollapsible()) {
				$sub.css('overflow-y', 'auto');
			}
		}
	});

	$('#menu-list').unbind('click.smapi').bind('click.smapi', function(e, elem) {
		// on click on app, close menu
		if (!$(elem).hasClass('add-to-favorites')) {
			$.SmartMenus.hideAll();
		}
		// click on mark as favorite, don't close menu,
		else {
			return false;
		}
	});
}
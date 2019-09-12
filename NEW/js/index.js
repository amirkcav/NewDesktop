// var rootItemTemplate = '<li><a href="javascript:;"><i></i> <span class="menu-item-parent"></span></a></li>';
var menuItemTemplate = '<li><a class="name" href="javascript:;"></a></li>';
var menuApps = [];
var originalItemsData;
var lastMenuApp;

var lpGetRequestCompleted = false;
var menuRequestCompleted = false;

var menuFavorites = [];

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

var lastRefresh = new Date();
// refresh page data every interval.
var refreshIntervalMinutes = 5;
setInterval(function() {
	refreshPageData();	
}, refreshIntervalMinutes * 60 * 1000);

$(function() {		

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
		var uci = JSON.parse(parent.data('data')).SYS; // parent.data('uci');
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

	$('#menu-list').on('click', 'li.app > a.remove-from-favorites', function() {
		var data = $(this).closest('li').data('data');
		var item = JSON.parse(data);
		removeFromFavorites(item);
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
			// renderAllAreas(true);
			// menuFavorites = data[data.length - 1].MENU;

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
	console.log(`setMenu started: ${new Date()}`);
	
	var menuItems = [];
	for (let i = 0; i < data.length; i++) {
		const rootItem = data[i];
		// if there's only one company, skip companys level
		if (rootItem.MENU.length === 1) {
			rootItem.MENU = rootItem.MENU[0].MENU;
		}
		var liElement = $(`<li><a href="javascript:;"><i class="fa fa-lg fa-home"></i> <span class="menu-item-parent">${rootItem.TXT}</span></a></li>`); 		    		
		addSubMenu(liElement, rootItem.MENU);
		menuItems.push(liElement);
		// set tooltip
		if (liElement.find('.menu-item-parent').prop('offsetWidth') < liElement.find('.menu-item-parent').prop('scrollWidth')) {
			liElement.find('.menu-item-parent').attr('title', rootItem.TXT);
		}
	}
	$('#menu-list > .search-app-li').before(menuItems);

	console.log(`setMenu finsihed: ${new Date()}`);

	$('#menu-list > li:not(.search-app-li):last').attr('id', 'favorites-menu-item');
	
	setMenuFavorites();
	initSmartmenu();	
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

function addSubMenu(parent, childrenObj, editSubMenu = false) {
	if (!editSubMenu) {
		$(parent).append('<ul></ul>');
	}
	var childList = $(parent).find('> ul');
	for (var i =0, len = childrenObj.length; i < len; i++) {
		var a = childrenObj[i];			
		var newChild = setMenuItem(a);
		childList.append(newChild);
	}
}

function setMenuItem(itemObj) { 
	var appClass = '';
	var addToFavorites = '';
	var itemData = '';
	// if it's an app
	if (!itemObj.MENU || itemObj.MENU.length === 0) {
		appClass = 'app'
		addToFavorites = `<a href="javascript:;" class="add-to-favorites" title="הוסף למועדפים"><i class="fa fa-star-o"></i></a>`;
		itemData = `data-item-id="${itemObj.UCI}:${itemObj.APM}" data-apm="${itemObj.APM}" data-uci="${itemObj.SYS}" ${ itemObj.wCY ? ` data-wcy="${itemObj.wCY}" ` : '' }`;
	}
	var newElemString = `<li class="${appClass}" ${itemData}>
												 ${ addToFavorites }
												 ${ itemObj.icon ? '<i class="' + itemObj.icon + '"><i/>' : '' }
												 <a class="name" href="javascript:;">${itemObj.TXT}</a>
									 		 </li>`;
	var newItemElem = htmlToElement(newElemString);
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
		$(newItemElem).data('data', JSON.stringify(itemObj));	
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

}

function setMenuFavorites() {
	var menuFavoritesString = localStorage.getItem('menuFavorites');
	if (menuFavoritesString) {
		menuFavorites = JSON.parse(menuFavoritesString);
		renderMenuFavorites();		
	}
}

function addToFavorites(itemToAdd) {	
	menuFavorites.push(itemToAdd);
	localStorage.setItem('menuFavorites', JSON.stringify(menuFavorites));
	renderMenuFavorites();
}

function removeFromFavorites(itemToRemove) {	
	menuFavorites = $.grep(menuFavorites, function(a) {
	    return a.TXT != itemToRemove.TXT;
	});
	localStorage.setItem('menuFavorites', JSON.stringify(menuFavorites));
	renderMenuFavorites();
}

function renderMenuFavorites() {
	$('#favorites-menu-item ul li').remove();
	addSubMenu($('#favorites-menu-item'), menuFavorites, true);
	$('#favorites-menu-item').find('.add-to-favorites').removeClass('add-to-favorites')
																										 .addClass('remove-from-favorites favorite')
													 .find('i').removeClass('fa-star-o').addClass('fa-star');
	// $('#menu-list').smartmenus('refresh');
	markFavoritesInMenu();
}

// function showLastMenuPosition() {
// 	if (lastMenuApp) {
// 		lastMenuApp.parentsUntil('nav', 'li').addClass('show-list');
		
// 		// disabling the menu for 2 seconds except the last menu position.
// 		$('#menu-list li:visible').addClass('disabled');
// 		$('#menu-list').addClass('disabled');
// 		// removeing disalbe from the "siblings" of last app
// 		lastMenuApp.parent().find('li:visible').removeClass('disabled');
// 		lastMenuApp.parentsUntil('nav', 'li').removeClass('disabled');
// 		setTimeout(function() {
// 			$('nav li.disabled').removeClass('disabled');
			
// 			$('nav').on('mouseenter', 'li:not(.disabled)', function() {
// 				$('nav li.show-list').removeClass('show-list');
// 				$('nav').off('mouseenter', 'li:not(.disabled)');
// 			});
			
// 			$('nav li.show-list').removeClass('show-list');
// 		}, 2000);
// 	}		
// }

//#endregion menu

function getInfoSquareData(obj, handler) {
	// value should come from server
	const value = parseInt(Math.random() * 10000000).toLocaleString();
	obj.VAL = value;
	handler(value);
}

function requestCompleted() {
	if (menuRequestCompleted && lpGetRequestCompleted) {
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

function markFavoritesInMenu() {
	// "unmark" all marked favorites
	$('.add-to-favorites.favorite').removeClass('favorite')
																 .find('i').removeClass('fa-star').addClass('fa-star-o');
	// $('i.fa-star').removeClass('fa-star').addClass('fa-star-o');
	menuFavorites.forEach(favorite => {
		var favElem = $(`[data-item-id="${favorite.UCI}:${favorite.APM}"]`);
		$(favElem).find('.add-to-favorites').addClass('favorite')
							.find('i').removeClass('fa-star-o').addClass('fa-star');
	});
}

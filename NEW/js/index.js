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

var oldContainer;

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
// refresh recent apps and documents (every 8 seconds)
// setInterval(function() {
// 	refreshRecentData();
// }, 8 * 1000);

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
		var uci = parent.data('data').SYS; // JSON.parse(
		var wcy = parent.data('wcy');
		var appText = parent.data('data').TXT; // JSON.parse(
		runApp(apm, uci, wcy, appText);
	});

	$('#menu-list').on('click', 'li.app > a.add-to-favorites', function() {
		var data = $(this).closest('li').data('data');
		if (!$(this).hasClass('favorite')) {
			addToFavorites(data);
			$(this).addClass('favorite');
			$(this).find('i').removeClass('fa-star-o').addClass('fa-star');
		}
		else {
			removeFromFavorites(data);
			$(this).removeClass('favorite');
			$(this).find('i').addClass('fa-star-o').removeClass('fa-star');
		}
	});    

	$('#menu-list').on('click', 'li.app > a.remove-from-favorites', function() {
		var item = $(this).closest('li').data('data');
		removeFromFavorites(item);
	});

	//#endregion menu

	$('#refresh-page-data-button').on('click', function() {
		refreshPageData();
	});

	$('#add-directory-button').on('click', function() {
		var directoryName = $('#add-directory-name').val();
		// $('#favorites-list').append(`<li data-data='{ "TXT": "${directoryName}", "TYP": "M" }'><label>${directoryName}</label><ul class="favorites-nested-list jq-sortable"></ul></li>`)
		$('#favorites-list').append(`<li class="folder-item"><label>${directoryName}</label><ul class="favorites-nested-list jq-sortable"></ul></li>`); //data-data='${ JSON.stringify({ 'TXT': directoryName, 'TYP': 'M' }) }'
		// $('#favorites-list > li:last-child').data('data', JSON.stringify({ 'TXT': directoryName, 'TYP': 'M', 'MENU': [] }));
		$('#favorites-list > li:last-child')[0].dataset['data'] = JSON.stringify({ 'TXT': directoryName, 'TYP': 'M', 'MENU': [] });
		$('#add-directory-name').val('');
		$('#add-directory-button').attr('disabled', true);
		$('#favorites-list').nestedSortable('refresh');
	});

	$('#add-directory-name').on('input', function() {
		$('#add-directory-button').attr('disabled', $(this).val().length === 0);
	});

	$('#manage-favorites-modal').on('click', '#manage-favorites-submit-button', function() {
		menuFavorites = $.makeArray($('#favorites-list').nestedSortable('serialize'));
		renderMenuFavorites();
		localStorage.setItem('menuFavorites', JSON.stringify(menuFavorites));
		// $('#menu-list').smartmenus('refresh');
	});

	$('#manage-favorites-modal').on('click', '#manage-favorites-cancel-button', function() { 
		// timeout is so the change won't be visible before the modal disapears.
		setTimeout(() => {
			setManageFavorites();
		}, 300);
	});

	$('#favorites-list').on('click', '.remove-fav-button', function() {
		// var favId = $(this).data('item-id');
		var favEleme = $(this).closest('li');
		var item = favEleme.data('data');
		favEleme.fadeOut(function(elem) {
			this.remove();
		});

	});

});

//#region general

function getPageData() {
	// get menu data
	$.ajax({
		type : 'POST',
		url : "mcall?_ROUTINE=%25JMUJSON&_NS=CAV&_LABEL=ZZ",
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
	var url = "mcall?_ROUTINE=%25JMUJSON&_NS=CAV&_LABEL=LPGET";    	
	$.ajax({
		type : 'POST',
		url : url,
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
		url : "mcall?_NS=CAV&_ROUTINE=CBIGRF&_LABEL=GETALLGRF",
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
  allInfoSquaresOptions = [ { COD: 1, TXT: 'מכירות יומי', VAL: '72,527', SYS: 'SVK' }, { COD: 2, TXT: 'מכירות חודשי', VAL: '1,211,422', SYS: 'SVK' }, { COD: 3, TXT: 'מכירות שבועי', VAL: '24,053', SYS: 'MLID' }, { COD: 4, TXT: 'החזרות חודשי', VAL: '6,320', SYS: 'TOURING' }, { COD: 5, TXT: 'מוצרים פגומים חודשי', VAL: '5,245', SYS: 'BANK' }, { COD: 6, TXT: 'מכירות שנתי', VAL: '14,310,558', SYS: 'TOURING' }, { COD: 7, TXT: 'רווחים חודשי עם כותרת ארוכה', VAL: '342,099', SYS: 'BANK' } ];
	allInfoSquaresOptions = allInfoSquaresOptions.sort((isa, isb) => isa.TXT.localeCompare(isb.TXT) );
	allInfoSquaresOptions = $.map(allInfoSquaresOptions, function (obj) {
		obj.id = obj.id || obj.COD;
		obj.text = obj.text || obj.TXT;
		return obj;
	});

	// get recent documents and apps	
	refreshRecentData();
	
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
	var url = `mcall?_ROUTINE=CBIGRF&_NS=CAV&_LABEL=RUN&GRF=${ graph.code }&TFK=MNG&USERNAME=SID`;    	
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
	if (!itemObj.MENU) { // || itemObj.MENU.length === 0
		appClass = 'app'
		addToFavorites = `<a href="javascript:;" class="add-to-favorites" title="הוסף למועדפים"><i class="fa fa-star-o"></i></a>`;
		itemData = `data-item-id="${itemObj.UCI}:${itemObj.APM}" data-apm="${itemObj.APM}" data-uci="${itemObj.SYS}" ${ itemObj.wCY ? ` data-wcy="${itemObj.wCY}" ` : '' }`;
	}
	else {
		appClass = 'folder-item';
	}
	var newElemString = `<li class="${appClass}" ${itemData}>
												 ${ addToFavorites }
												 ${ itemObj.icon ? '<i class="' + itemObj.icon + '"><i/>' : '' }
												 <a class="name" href="javascript:;">${itemObj.TXT}</a>
									 		 </li>`;
	var newItemElem = htmlToElement(newElemString);
	
	// $(newItemElem).data('dataa', JSON.stringify(itemObj));	
	newItemElem.dataset['data'] = JSON.stringify(itemObj);

	// set children (recursive)
	if (itemObj.MENU) { /* && itemObj.MENU.length > 0 */
		addSubMenu(newItemElem, itemObj.MENU);
	}
	// add to the apps array (for the menu search).
	else {
		// search in menu array. add only if not exist.
		if (menuApps.indexOfByProperty('TXT', itemObj.TXT) < 0) {				
			menuApps.push(itemObj);
		}
		// $(newItemElem).data('data', JSON.stringify(itemObj));	
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
	// get favorites from server
	var menuFavoritesString = localStorage.getItem('menuFavorites');
	if (menuFavoritesString) {
		menuFavorites = JSON.parse(menuFavoritesString);
		renderMenuFavorites();		
	}
	setManageFavorites();
	$('#favorites-list').nestedSortable({
		group: 'nested',
		afterMove: function (placeholder, container) {
			if(oldContainer != container){
				if(oldContainer)
					oldContainer.el.removeClass("active");
				container.el.addClass("active");
	
				oldContainer = container;
			}
		},
		onDrop: function ($item, container, _super) {
			container.el.removeClass("active");
			_super($item, container);
			$('#favorites-list').nestedSortable('refresh');
		},
		serialize: function ($item, $children, parentIsContainer) {
			var result = $item.data('data') ? $item.data('data') : {}; // JSON.parse( // $.extend({}, $item.data('data'))
			 if(parentIsContainer)
				return $children;
			else if ($item.hasClass('folder-item')) { //($children[0]){
				result.MENU = $children
			}
			return result;
		}
	});
}

function addToFavorites(itemToAdd) {	
	menuFavorites.push(itemToAdd);
	localStorage.setItem('menuFavorites', JSON.stringify(menuFavorites));
	renderMenuFavorites();
	setManageFavorites();
}

function removeFromFavorites(itemToRemove) {	
	// menuFavorites = $.grep(menuFavorites, function(a) {
	//     return a.TXT != itemToRemove.TXT;
	// });
	removeFavorite(menuFavorites, itemToRemove);
	localStorage.setItem('menuFavorites', JSON.stringify(menuFavorites));
	renderMenuFavorites();
	setManageFavorites();
}

function removeFavorite(group, itemToRemove) {
	var favToDelete = null;
	group.forEach(o => {
		if (o.TXT == itemToRemove.TXT)
		{
				favToDelete = o;
		}
		if (o.MENU && !favToDelete) {
			removeFavorite(o.MENU, itemToRemove);
		}
	});			
	if (favToDelete != null)
	{
		console.log('DELETE');
		var index = group.indexOf(favToDelete);
		group.splice(index, 1);
	}
}

function renderMenuFavorites() {
	$('#favorites-menu-item ul li').remove();
	addSubMenu($('#favorites-menu-item'), menuFavorites, true);
	$('#favorites-menu-item').find('.add-to-favorites').removeClass('add-to-favorites')
																										 .addClass('remove-from-favorites favorite')
													 .find('i').removeClass('fa-star-o').addClass('fa-star');
	markFavoritesInMenu();

	// add "manage favorites" to menu
	$('#favorites-menu-item > ul').prepend(`<li class="app manage-favorites">
																						<a href="#manage-favorites-modal" data-toggle="modal" data-backdrop="static">נהל מועדפים</a>
																					<li>`);

	$('#menu-list').smartmenus('refresh');
}

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
				$('#loading-animation-div').hide();
			}, 300);
		}, 300);
	}
}

function initSmartmenu() {

	// from https://www.smartmenus.org/about/themes/#demos-7
	$.SmartMenus.prototype.old_init = $.SmartMenus.prototype.init;
  $.SmartMenus.prototype.init = function(refresh) {
    if (!refresh && !this.$root.hasClass('sm-vertical')) {
      var $originalItems = this.$root.children('li'),
        $moreSub = this.$root.clone().removeAttr('id').removeAttr('class').addClass('_dropdown-menu'),
        $moreSubItems = $moreSub.children('li'),
        $moreItem = $('<li class="more-items-li"><a href="#"><span class="menu-item-parent">עוד</span><span class="caret"></span></a></li>').append($moreSub).appendTo(this.$root),
        self = this,
        vieportW,
        hiddenItems = [],
        hiddenMoreItems = [];
    }
    this.old_init(refresh);
    if (!refresh && !this.$root.hasClass('sm-vertical')) {
      function handleResize(force) {
        var curWidth = $(window).width();
        if (vieportW !== curWidth || force) {
          // hide More item
          $moreItem.detach();
          // show all main menu items
          $.each(hiddenItems, function() {
            $(this).appendTo(self.$root);
          });
          hiddenItems = [];
          // show all More sub items
          $.each(hiddenMoreItems, function() {
            $(this).prependTo($moreSub);
          });
          hiddenMoreItems = [];
          // if in desktop view and the last item is wrapped
          if (!self.$root.hasClass('sm-vertical') && (/^(left|right)$/.test(self.$firstLink.parent().css('float')) || self.$firstLink.parent().css('display') == 'table-cell') && $originalItems.eq(-1)[0].offsetTop != $originalItems.eq(0)[0].offsetTop) {
            // show More item
            $moreItem.appendTo(self.$root);
            // while the More item is wrapped
            while ($moreItem[0].offsetTop != $originalItems.eq(0)[0].offsetTop) {
              hiddenItems.unshift($moreItem.prev('li').detach());
            };
            // hide proper More sub items
            $moreSubItems.slice(0, $moreSubItems.length - hiddenItems.length).each(function() {
              hiddenMoreItems.unshift($(this).detach());
            });
          }
          // save new viewport width
          vieportW = curWidth;
        }
      }
      handleResize();
      $(window).bind({
        'load.smartmenus': function() {
          handleResize(true);
        },
        'resize.smartmenus': handleResize
      });
    }
  };
  // Fix isCollapsible method
  $.SmartMenus.prototype.isCollapsible = function() {
    return this.$root.find('ul').eq(0).css('position') == 'static';
  };

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
		markFavorite(favorite);
	});
}

function markFavorite(favorite) {
	if (!favorite.MENU) {
		var favElem = $(`#menu-list [data-item-id="${favorite.UCI}:${favorite.APM}"]`);
		$(favElem).find('.add-to-favorites').addClass('favorite')
							.find('i').removeClass('fa-star-o').addClass('fa-star');
	}
	else {
		favorite.MENU.forEach(fav => {
			markFavorite(fav);
		});
	}
}

function refreshRecentData() {
	// get last documents
	$.ajax({
		type : 'GET',
		url : "mcall?_NS=CAV&_ROUTINE=%25JMUJSON&_LABEL=RDOCS",
		contentType : 'application/json',
		dataType : 'json',
		success : function(data) {
			var docs = [];
			data.document.forEach(doc => {
				var template = `<li class="last-doc list-item">
													<a href="javascript:;" class="set-tooltip-field">${doc.description}</a>
												</li>`;
				var elem = htmlToElement(template);
				$(elem).data('doc-data', JSON.stringify(doc));
				docs.push(elem);
			});
			$('#last-docs-section > ul').html(docs);
			$('#last-docs-section .list-count').text(data.document.length);
		},
		error: function(data) {
			alert(data.responseText);    		
		}
	});

	// get last apps
	$.ajax({
		type : 'GET',
		url : "mcall?_NS=CAV&_ROUTINE=%25JMUJSON&_LABEL=RAPPS",
		contentType : 'application/json',
		dataType : 'json',
		success : function(data) {
			var apps = [];
			data[0].MENU.forEach(app => {
				var template = `<li class="last-app list-item">
													<a href="javascript:;" class="set-tooltip-field">${app.TXT}</a>
												</li>`;
				var elem = htmlToElement(template);
				$(elem).data('app-data', JSON.stringify(app));
				apps.push(elem);
			});
			$('#last-apps-section > ul').html(apps);
			$('#last-apps-section .list-count').text(data[0].MENU.length);
		},
		error: function(data) {
			alert(data.responseText);    		
		}
	});
}

function setManageFavorites() {
	// manage favorites
	var favoritesItems = [];
	menuFavorites.forEach((fav, i) => {
		var mi = setMenuItem(fav);
		$(mi).addClass(fav.MENU ? 'folder-item' : 'app-item'); /* && fav.MENU.length > 0 */
		var deleteButton = `<a href="javascript:;" class="pull-left remove-fav-button" data-item-id="${fav.UCI}:${fav.APM}">x</a>`;
		$(mi).append(deleteButton);
		if (fav.MENU) { //  && fav.MENU.length
			$(mi).find('li').append(deleteButton);
		}
		favoritesItems.push(mi);
	});
	$('#favorites-list').html(favoritesItems);
}

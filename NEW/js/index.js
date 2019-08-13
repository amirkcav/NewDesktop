var rootItemTemplate = '<li><a href="javascript:;"><i></i> <span class="menu-item-parent"></span></a></li>';
var itemTemplate = '<li><a class="name" href="javascript:;"></a></li>';
var menuApps = [];
var lastMenuApp;
var shortcutsArea;
var infoSquaresArea;
var graphsArea;
var notShortcutPos = 0;
var hebrewPeriods = {
	monthly: 'חודשי',
	daily: 'יומי'
}
// used in the graphs for table
var user_lang = 'HB';

var allInfoSquaresOptions; // = [ { COD: 1, TXT: 'מכירות יומי', VAL: '72,527' }, { COD: 2, TXT: 'מכירות חודשי', VAL: '1,211,422' }, { COD: 3, TXT: 'מכירות שבועי', VAL: '24,053' }, { COD: 4, TXT: 'החזרות חודשי', VAL: '6,320' }, { COD: 5, TXT: 'מוצרים פגומים חודשי', VAL: '5,245' }, { COD: 6, TXT: 'מכירות שנתי', VAL: '14,310,558' }, { COD: 7, TXT: 'רווחים חודשי עם כותרת ארוכה', VAL: '342,099' } ];
var allGraphsOptions; // = [ { COD: 'G1', TXT: 'גרף חוגה' }, { COD: 'G2', TXT: 'גרף פאי1' }, { COD: 'G3', TXT: 'גרף באר1' }, { COD: 'G4', TXT: 'גרף באר2' }, { COD: 'G5', TXT: 'גרף פאי2' } ];

var originalLayout;

var itemsCount = { 'shortcuts': 21, 'info-squares': 6, 'graphs': 4 }

// set token header (from query string).
var urlParams = new URLSearchParams(window.location.search);
var token = urlParams.has('token') ? urlParams.get('token') : null;
$.ajaxSetup({
	headers: {
			'CavToken': token
	}
});

// default "empty" object
var uiLayout = { 'shortcuts': { 'data': [] }, 'info-squares': { 'data': [] }, 'graphs': { 'data': [] }, 'last-docs': { 'data': [] }, 'last-apps': { 'data': [] } };
// var defaultLayoutObject = { 'shortcuts': {}, 'info-squares': {}, 'graphs': {}, 'last-apps': {} };
var lpGetRequestCompleted = false;
var menuRequestCompleted = false;

var menuFavorites;

// getPageData();

var lastRefresh = new Date();
// refresh page data every interval.
var refreshIntervalSeconds = 5;
setInterval(function() {
	refreshPageData();	
}, refreshIntervalSeconds * 60 * 1000);

$(function() {	

	shortcutsArea = $('#shortcuts-section');
	infoSquaresArea = $('#info-squares-section');
	graphsArea = $('#graphs-section');
	lastAppsArea = $('#last-apps-section > ul');

	$('#add-shortcut-form').validate();    

	// // set info square options (for add popup)
	// setSelectOptions(allInfoSquaresOptions, $('#add-info-square-select'));

	$('#edit-page').click(function() {
		// save the original layout to be able to cancel changes.
		originalLayout = cloneObject(uiLayout);
		// activate sortable (jquery ui).
		sort();
		$('body').addClass('editing');
	});
	
	$('#done-edit-page').click(function() {
		originalLayout = cloneObject(uiLayout);
		$('.sort-area').sortable('destroy');
		$('body').removeClass('editing');

		var url = "../mcall?_ROUTINE=%25JMUJSON&_NS=CAV&_LABEL=LPSAV";
		// don't save the current values, just the selected types.
		if (uiLayout.graphs.data) {
			uiLayout.graphs.data.map((g) => { g.data = undefined; });
		}
		if (uiLayout['info-squares'].data) {
			uiLayout['info-squares'].data.map((g) => { g.VAL = undefined; });
		}
    var data = JSON.stringify({ data: uiLayout }); 
    $.ajax({
			type : 'POST',
			url : url,
			data: data,
			contentType : 'application/json',
			// dataType : 'json',
			success : function(data) {
				// currently returning "*** OK ***"
				if (data && data.indexOf('OK') > -1) {
					$.smallBox({
						title : "המידע נשמר בהצלחה!",
						// content : "...",
						color : "#6a6",
						timeout: 3000,
						sound: false,
						iconSmall : "fa fa-check"
					});
				}
    	},
			error: function(data) {
				alert(data.responseText);    		
			}
    });  

	});
	
	$('#cancel-edit-page').click(function() {
		uiLayout = cloneObject(originalLayout);
		renderAllAreas();
		$('.sort-area').sortable('destroy');
		$('body').removeClass('editing');
	});    

	$('body').on('click', '#create-shortcut', function() {
		var item = $(this).data('item');
		//addShortcut(item);
		var emptyPosition = $('#shortcuts-section .editing-item-placeholder').first().find('.add-item-button').data('position');
		item.LOC = emptyPosition;
		uiLayout.shortcuts.data.push(item);
		// when adding shortcut not in edit mode (right click in search)
		if (!$('body').hasClass('editing')) {
			originalLayout = cloneObject(uiLayout);
		}    	
		renderArea(shortcutsArea, uiLayout.shortcuts);
		if ($('body').hasClass('editing')) {
			sortArea(shortcutsArea);
		}		
		$('#search-in-menu').autocomplete('close');
		$('#search-in-menu').val('');
		$('#search-in-menu').blur();
	});

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

	$('#graphs-section, #shortcuts-section, #info-squares-section').on('click', '.delete-shortcut[data-toggle="popover"]', function(e){
		if (!$(this).hasClass('popover-init')) {
			$(this).popover({	    
				html: true,
				placement: 'top',
				//title: 'Delete remark',
				content: function() {
						return $('#confirmation-popover-template').html();
				}
			});
			$(this).popover('show')
							.addClass('popover-init');		    		   
		}    	
		else {
			$(this).popover('show');
		}
		
		// function the function name on the ""yes" button in the popover
		var func = $(this).data('func');
		$('#confirmation-popover-yes').data('func', func);
		
		e.stopImmediatePropagation();

		return false;
	});

	$(shortcutsArea).on('click', '.department:not(.editing-item-placeholder) > a', function() {
		if (!$('body').hasClass('editing')) {
			var apm = $(this).data('apm');
			var uci = $(this).data('uci');
			var wcy = $(this).data('wcy');
			var appText = $(this).text().trim();
			runApp(apm, uci, wcy, appText);
		}
		else {
			var graphData = JSON.parse($(this).parent().data('data'));
			var app = graphData.value ? graphData.value : graphData.TXT; 
			$('#add-shortcut').val(app);
			$('#shortcut-title').val(graphData.TXT);
			$('#add-shortcut-modal-button').data('position', graphData.LOC);
			
			$('#add-shortcut-modal').modal('show');    		
		}
	});    

	$('#add-shortcut-modal').on('shown.bs.modal', function() {
		if (!$('#add-shortcut').hasClass('ui-autocomplete-input')) {
			$('#add-shortcut').autocomplete({
				minLength: 2,
				source: menuApps,
				appendTo: '.search-app-parent',
				select: function( event, ui ) {
					var itemData = ui.item;
					// needed for selection by moouse click.
					$(this).val(itemData.label);
					$('#shortcut-title').val(itemData.label);
					$('#add-shortcut-modal-button').data('selected-item', JSON.stringify(itemData));
					return false;
				},
				response: function(event, ui) {
								// ui.content is the array that's about to be sent to the response callback.
								if (ui.content.length === 0) {
										$("#empty-message").text("No results found");
								} 
								else {
										$("#empty-message").empty();
								}
						},
						change: function (event, ui) {
								if (!ui.item) {
										this.value = '';
								}
						}
			});
		}
	});

	$('#add-shortcut-modal').on('click', '#add-shortcut-modal-button', function() {
		if ($('#add-shortcut-form').valid()) {
			var selectedItem = JSON.parse($(this).data('selected-item'));    		
			selectedItem.TXT = $('#shortcut-title').val();    	
			var position = $(this).data('position');
			selectedItem.LOC = position;
			
			// is editing an existing shortcut
			var itemInPosition = uiLayout.shortcuts.data.filter(function(a) { return a.LOC == selectedItem.LOC })[0];    			    		    
			if (itemInPosition) {
				//uiLayout.shortcuts.data.pop(itemInPosition);
				var index = uiLayout.shortcuts.data.indexOf(itemInPosition);
				uiLayout.shortcuts.data.splice(index, 1);
			}
			
			uiLayout.shortcuts.data.push(selectedItem);			
			renderArea(shortcutsArea, uiLayout.shortcuts);
			sortArea(shortcutsArea);
			$(this).closest('.modal').modal('hide');
		}
	});

	$('.section').on('click', '.add-item-button', function(e) {
		var position = $(this).data('position');
		var modalButton = $($(this).attr('href') + '-button');
		$(modalButton).data('position', position);		
		//e.stopPropagation();
	});
	
	// reset form data when modal is closed
	$('.modal.reset-on-close').on('hidden.bs.modal', function(){
		var form = $(this).find('form');
		resetFormValues(form);
		$(form).validate().resetForm();
		$(form).find('.form-control.error').removeClass('error');
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

	$('#add-info-square-modal').on('click', '#add-info-square-modal-button', function() {
		// var selectedOption = $('#add-info-square-select').find('option:selected');
		var position = $(this).data('position');
		//var obj = JSON.parse(selectedOption.data('data'));    	
		var obj = $('#add-info-square-select').select2('data')[0]
		obj.LOC = position;
		// was an app chosen.
		if ($('#info-square-application').val().length > 0) {
			var selectedApp = JSON.parse($('#info-square-application').data('selected-item'));
			obj.APM = selectedApp.APM;
			obj.UCI = selectedApp.UCI;
			obj.APP = $('#info-square-application').val();
		}
		else {
			obj.APM = '';
			obj.UCI = '';
			obj.APP = '';
		}
		
		// is editing an existing shortcut
		var itemInPosition = uiLayout['info-squares'].data.filter(function(a) { return a.LOC == obj.LOC })[0];    			    		    
		if (itemInPosition) {
			//uiLayout.shortcuts.data.pop(itemInPosition);
			var index = uiLayout['info-squares'].data.indexOf(itemInPosition);
			uiLayout['info-squares'].data.splice(index, 1);
		}

		uiLayout['info-squares'].data.push(obj);	
		getInfoSquareData(obj, function(itemWithData) {
			renderInfoSquareData(itemWithData);				
			var elem = $('#info-' + itemWithData.LOC)
			$(elem).removeClass('editing-item-placeholder');
		});		
		// renderArea(infoSquaresArea, uiLayout['info-squares']);
		// sortArea(infoSquaresArea);
		$(this).closest('.modal').modal('hide');
	});

	$('#add-graph-modal').on('click', '#add-graph-modal-button', function() {
		var selectedOption = $('#add-graph-select').find('option:selected');
		var position = $(this).data('position');
		var obj = $('#add-graph-select').select2('data')[0]; //JSON.parse(selectedOption.data('data'));
		obj.LOC = position;
		
		// is editing an existing shortcut
		var itemInPosition = uiLayout.graphs.data ? uiLayout.graphs.data.filter(function(a) { return a.LOC == obj.LOC })[0] : undefined;    			    		    
		if (itemInPosition) {
			//uiLayout.shortcuts.data.pop(itemInPosition);
			var index = uiLayout.graphs.data.indexOf(itemInPosition);
			uiLayout.graphs.data.splice(index, 1);
		}

		// var graphData = getGrpahData(obj.COD);
		var button = this;
		$.ajax({
			type : 'GET',
			url : `../mcall?_ROUTINE=CBIGRF&_NS=CAV&_LABEL=RUN&GRF=${ obj.code }&TFK=MNG&USERNAME=SID`,
			contentType : 'application/json',
			dataType : 'json',
			success : function(data) {
				graphData = data;
				var prevGraphData; 
				if ($('#graph' + position).parent().data('data')) {
					prevGraphData = JSON.parse($('#graph' + position).parent().data('data'));
				}
				// check data validity
				if (graphData.type === 'table' && (!graphData.cols || graphData.cols.length === 0)) {
					this.error({});
					return;
				}
				// handle large graph
				if (graphData.chartSize == 'large') {
					var positionForChart = checkPositionForChart(position);
					if (positionForChart == -1) {
						$('#add-graph-modal .add-graph-error').text('אין מקום לגרף זה (גודל כפול) במיקום זה.').fadeIn();
						return;
					}
					else {
						obj.LOC = positionForChart;
					}	    		
				} 				
				if (!uiLayout['graphs'].data) {
					uiLayout['graphs'].data = [];
				}
				uiLayout['graphs'].data.push(obj);
				// renderCharts();
				obj.data = graphData;
				obj.data.chartSize = graphData.chartSize; 
				renderGraphData(obj);

				// if replacing a large graph with a small one, add empty graph
				if (graphData.chartSize !== 'large' && (prevGraphData && prevGraphData.data.chartSize === 'large')) {
						
						renderChart(position, true);

				}

				$(button).closest('.modal').modal('hide');    
			},
			error: function(data) {
				// alert(data.responseText);   
				var error = data.responseText ? data.responseText : 'אירעה שגיאה בטעינת הגרף.';
				$('#add-graph-modal .add-graph-error').text(error).fadeIn();
			}
		});				
	});

	$('#add-graph-modal').on('shown.bs.modal', function() {
		$('#add-graph-select').select2({
			data: allGraphsOptions,
			dropdownParent: $('#add-graph-modal'),
			placeholder: "בחר גרף",
			templateResult: (opt) => {
				return $(`<label class="graph-option-label"><i class="fa fa-${ getGraphIcon(opt.type) }"></i> ${ opt.text } [${ hebrewPeriods[opt.period] }]</label>`);
			},
			templateSelection: (opt) => {
				return $(`<label class="graph-option-label"><i class="fa fa-${ getGraphIcon(opt.type) }"></i> ${ opt.text } [${ hebrewPeriods[opt.period] }]</label>`);
			},
		});
	});

	$('#add-graph-modal').on('hidden.bs.modal', function() {
		$(this).find('.add-graph-error').hide();
	});

	$('#add-graph-modal').on('change', '#add-graph-select', function() {
		$('#add-graph-modal').find('.add-graph-error').hide();
	});

	$('#graphs-section').on('click', '.graph.active', function() {
		/*// the add graph button (the event is on the span inside the button
		if ($(event.target).parent().is('.add-item-button')) {
			return;
		} */   	
		var graphData = JSON.parse($(this).data('data'));
		if ($('body').hasClass('editing')) {    		
			$('#add-graph-modal-button').data('position', graphData.LOC);
			$('#add-graph-select').val(graphData.COD);
			$('#add-graph-modal').modal('show');
		}
		else {
			$('#large-graph-modal').data('data', $(this).data('data'));	    
			const largeModal = graphData.data.chartSize == 'large' || (graphData.type === 'table' && graphData.data.cols.length > 4);
			$('#large-graph-modal').toggleClass('large', largeModal);
			$('#large-graph-modal').find('.modal-header > h3').html(graphData.data.titles.head);
			$('#large-graph-modal .modal-body').addClass('loading');
			if (graphData.type === 'table') {
				$('#change-graph-mode-button').addClass('hidden');
			}
			$('#large-graph-modal').modal('show');
		}
	});
	
	$('#large-graph-modal').on('shown.bs.modal', function() {
		var graphData = JSON.parse($(this).data('data'));		
		let graphHeight = 500;
		if (graphData.type === 'table') {
			graphHeight = 600;
		}
		drawGraph(graphData.data, 'large-graph-div', graphHeight);
		$('#large-graph-modal .modal-body').removeClass('loading');		
	});

	$('#large-graph-modal').on('hidden.bs.modal', function() {
		$('#large-graph-div').html('<canvas></canvas>');
		$('#change-graph-mode-button').removeClass('hidden');		
		$(this).find('.modal-header > h3').html('');
		$(this).find('.modal-body').removeClass('table-mode')
										.addClass('graph-mode');
	});    

	$('#large-graph-modal').on('click', '#change-graph-mode-button', function() {    	
		var graphData = JSON.parse($('#large-graph-modal').data('data'));
		var modalBody = $(this).closest('.modal-body');
		if (modalBody.hasClass('graph-mode')) {
			chartToTable(graphData.data, 'large-graph-div');
		}
		else if (modalBody.hasClass('table-mode')) {
			let graphHeight = 500;
			if (graphData.type === 'table') {
				graphHeight = 600;
			}
			drawGraph(graphData.data, 'large-graph-div', graphHeight);
		}
		
		$(modalBody).toggleClass('graph-mode')
								.toggleClass('table-mode');
	});
	
	$(infoSquaresArea).on('click', '.info-square:not(.editing-item-placeholder)', function() {
		var infoData = JSON.parse($(this).data('data'));
		if (!$('body').hasClass('editing')) {
			if (infoData.APM && infoData.APM !== 'null') {
				var apm = infoData.APM;
				var uci = infoData.UCI;
				var wcy = infoData.wCY;
				var appText = infoData.TXT;
				runApp(apm, uci, wcy, appText);
			}
		}
		else {    		
			if (infoData.APP && infoData.APP !== 'null') {
				$('#info-square-application').val(infoData.APP);
				$('#info-square-application').data('selected-item', JSON.stringify(infoData));
			}
			$('#add-info-square-select').val(infoData.COD);
			$('#add-info-square-modal-button').data('position', infoData.LOC);    		
			$('#add-info-square-modal').modal('show');    		
		}
	});

	$('#add-info-square-modal').on('shown.bs.modal', function() {
		$('#add-info-square-select').select2({
			data: allInfoSquaresOptions,
			dropdownParent: $('#add-info-square-modal'),
			placeholder: "בחר נתון להצגה",
		});
		
		if (!$('#info-square-application').hasClass('ui-autocomplete-input')) {
			$('#info-square-application').autocomplete({
				minLength: 2,
				source: menuApps,
				appendTo: '#add-info-square-modal', // '.search-app-parent',
				select: function( event, ui ) {
					var itemData = ui.item;
					// needed for selection by moouse click.
					$(this).val(itemData.label);
					$(this).data('selected-item', JSON.stringify(itemData));
					return false;
				},
				response: function(event, ui) {
					// ui.content is the array that's about to be sent to the response callback.
					if (ui.content.length === 0) {
						$("#empty-message").text("No results found");
					} 
					else {
						$("#empty-message").empty();
					}
				},
				change: function (event, ui) {
					if (!ui.item) {
						this.value = '';
					}
				}
			});
		}
	});

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
	var url = "../mcall?_ROUTINE=%25JMUJSON&_NS=CAV&_LABEL=ZZ";
	$.ajax({
		type : 'POST',
		url : url,
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
			uiLayout = Object.assign(uiLayout, data.data);
			// uiLayout = data.data;		

			renderAllAreas(true);			

			lpGetRequestCompleted = true;
			requestCompleted();

			// set last refresh time
			lastRefresh = new Date();
			$('#last-update').text(dateFormat(lastRefresh, 'dd/mm/yyyy HH:MM'));
		},
		error: function(data) {
			alert(data.responseText);   
			renderAllAreas(true);
			lpGetRequestCompleted = true;
			requestCompleted(); 		
			// uiLayout = {};
		}
	});

	// get available graphs (for add graph popup)
	var url = "../mcall?_NS=CAV&_ROUTINE=CBIGRF&_LABEL=GETALLGRF";
	$.ajax({
		type : 'GET',
		url : url,
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
}

function renderAllAreas(useTimeout) {
	$('.items-section, .list-section > ul').each(function() { 		
		var areaName = $(this).data('area-name');
		renderArea(this, uiLayout[areaName]);		
	});
	renderCharts(useTimeout);
	renderInfoSquares();
}

function renderArea(area, areaData) {
	var data = areaData.data;
	// if (!data) {
	// 	return;
	// }
	
	// area with sorting
	$(area).find('.sort-item:not(.template-item)').remove();	
	// area without sorting
	$(area).find('.list-item:not(.template-item)').remove();	

	// set area width
	var newItem = $(area).find('.template-item');
	
	// add items
	var areaName = $(area).data('area-name');
	var itemsNumber = itemsCount[areaName] ? itemsCount[areaName] : areaData.data.length; 
	for (i = 1; i <= itemsNumber; i++) {
		var template = newItem.clone();
		template.removeClass('template-item');
		var currPosition = i; //j * rows + i;
		var existingItem = data.filter(function(a) { return a.LOC == currPosition });
		// if there is an item with null as position, add it. (POS = null means it's a shortcut with no determined position).
		if (existingItem.length == 0) {
			var nullPositionItems = data.filter(function(a) { return a.LOC == null || a.LOC > itemsNumber });
			if (nullPositionItems.length > 0) {
				var nullPositionItem = nullPositionItems[0];
				nullPositionItem.LOC = currPosition;
				existingItem.push(nullPositionItem);
			}
		}			
		// add an existing item
		if (existingItem.length > 0) {			
			$(template).addClass('active')
							.data('data', JSON.stringify(existingItem[0]));
			setTemplateFields(template, existingItem[0]);
			$(template).find('a').data('apm', existingItem[0].APM)
													 .data('uci', existingItem[0].UCI);
			if (existingItem[0].wCY) {
				$(template).find('a').data('wcy', existingItem[0].wCY);
			}
		}
		// add a placeholder for sorting
		else {
			$(template).addClass('editing-item-placeholder')
							.find('.add-item-button').data('position', currPosition);
			$(template).find('.set-tooltip-field').removeClass('set-tooltip-field');
		}
		$(template).attr('original-position', currPosition);
		// adding sorting placeholders only to sort areas.
		if (existingItem.length > 0 || $(area).hasClass('sort-area')) {
			$(area).append(template);				
		}
	}
	$(area).find('.set-tooltip-field').each(function(i, o) {
		setTooltip(o);
	});
}

function sort() {
	$('.sort-area').each(function() {					
		sortArea(this);		
	});
}

function sortArea(area) {	
	$(area).sortable({
		items: $('.sort-item'),
		containment: "parent", //'.sort-area',
		placeholder: 'sorting-placeholder',
		forcePlaceholderSize: true,
		forceHelperSize: true,
		scroll: false,
		cursor: "move",
		tolerance: "pointer",
		delay: 50,
		stop: function(event, ui) {
			updatePositions(event.target);
		},
		// from: https://stackoverflow.com/questions/5791886/jquery-draggable-shows-helper-in-wrong-place-after-page-scrolled#answer-12642566
		helper: function(event, ui){
			var $clone =  $(ui).clone();
			$clone .css('position','absolute');
			return $clone.get(0);
		}
	});
}

function updatePositions(area) {
	var areaName = $(area).data('area-name');
	// clear the array
	uiLayout[areaName].data.length = 0;
	var items = $(area).find('.sort-item:not(.template-item)');
	var currPos = 1;
	for (var i = 0; i < items.length; i++) {
		var item = $(items[i]);
		var position = currPos; 
		if (item.hasClass('active')) {
			var data = JSON.parse(item.data('data'));
			data.LOC = position;
			if (data.data && data.data.chartSize == 'large') {
				currPos++;
			}
			item.data('data', JSON.stringify(data))
				.data('position', position);
			uiLayout[areaName].data.push(data);
		}		
		currPos++;
		item.data('position', position);
		item.find('.add-item-button').data('position', position);		
		if (area.isEqualNode(infoSquaresArea[0])) {
			item.attr('id', 'info-' + position);
		}
		else if (area.isEqualNode(graphsArea[0])) {
			item.find('> .graph-div').attr('id', 'graph' + position);
		}
	}	
}

function refreshPageData() {
	// info squares
	for (i = 0; i < uiLayout['info-squares'].data.length; i++) { 
		var item = uiLayout['info-squares'].data[i];
		getInfoSquareData(item, function(itemWithData) {
			renderInfoSquareData(itemWithData);				
		});	
	}

	// graphs
	for (var i = 0; i < uiLayout.graphs.data.length; i++) {
		var graph = uiLayout.graphs.data[i];
		// var divId = $(graph).find('> .graph-div').attr('id');
		// var graphData = JSON.parse($(graph).data('data'));			
		// drawGraph(graphData, divId);
		getGrpahData(graph, function(graphWithData) {
			renderGraphData(graphWithData);
			// $('#' + divId).parent().removeClass('loading');
		});
	}

	// set last refresh time
	lastRefresh = new Date();
	$('#last-update').text(dateFormat(lastRefresh, 'dd/mm/yyyy HH:MM'));
}

function runApp(apm, uci, companyCode, text) {
	var apmArr = apm.split(':');
	var ap = apmArr[0];
	var pm = apmArr[1];
	// add to last apps
	if (text && text.length > 0) {
		var currApp = { TXT: text, UCI: uci, APM: apm, wCY: companyCode };
		addToLastApps(currApp);		
		renderArea(lastAppsArea, uiLayout['last-apps']);
	}
	// run app.
	if (window.app) {
		app.openApplication(ap, pm, uci, companyCode ? companyCode.toString() : '', '');
	}
	else {
		console.log(stringFormat('Run App - {0}:{1}:{2}:{3}', ap, pm, uci, companyCode));
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

function renderCharts(useTimeout) {
	$('#graphs-section').find('.sort-item:not(.template-item)').remove();
	var graphPosition = 0;
	while (graphPosition < itemsCount['graphs']) {
		renderChart(graphPosition);
		graphPosition++;
	}
	// sortArea($('#graphs-section'));
	//// set the width of the graphs
	//// calculateChartsWidth();
	//// rerender the graphs to fit the new size
	//// refreshCharts(useTimeout);
}

function renderChart(graphPosition, atPosition) {
	var newItem = $('#graphs-section').find('.template-item');
	var template = newItem.clone();
	template.removeClass('template-item');
	var divId = 'graph' + (graphPosition + 1);
	template.find('> .graph-div').attr('id', divId);
	template.find('.add-item-button').data('position', graphPosition + 1);
	template.data('position', graphPosition + 1);
	var graph = uiLayout.graphs.data ? uiLayout.graphs.data.filter(function(a) { return a.LOC == graphPosition + 1 })[0] : undefined;		
	if (!graph) {
		template.addClass('editing-item-placeholder');
	}
	else {
		getGrpahData(graph, function(graphWithData) {
			renderGraphData(graphWithData);
		});
	}
	template.css('width', 'calc(' + 100 / itemsCount['graphs'] + '% - 20px)');
	if (atPosition && $('#graph' + graphPosition)) {
		$('#graph' + graphPosition).parent().after(template);
	}
	else {
		$('#graphs-section').append(template);
	}
}

function renderGraphData(graph) {
	template = $('#graph' + graph.LOC).parent();
	template.addClass('active');			
	var header = graph.data.titles.head.replace(/<BR>/,' ').replace(/<BR >/,' ')
	template.find('.graph-title > label').html(header);
	setTooltip(template.find('.graph-title > label')[0]);
	template.data('data', JSON.stringify(graph));
	if (graph.data.chartSize == 'large') {
		$('#graph' + (graph.LOC + 1)).parent().remove();
	}
	// width needed to be set so the graph would render properly.
	setChartWidth(graph);
	template.removeClass('editing-item-placeholder loading');
	drawGraph(graph.data, /*divId*/ 'graph' + graph.LOC);			
}

function calculateChartsWidth() {	
    // the percentage value of each width unit
	var percent = 100 / itemsCount['graphs'];
	// setting the width for each graph
	for (var i = 0; i < itemsCount['graphs']; i++) {
		var graph = uiLayout.graphs.data ? uiLayout.graphs.data.filter(function(a) { return a.LOC == i + 1 })[0] : undefined;
		var _width;
		if (graph && graph.data.chartSize == 'large') {
			_width = 2 * percent + '%';
		}
		else {
			_width = percent + '%';
		}	
		// 20px is for the radius (10px each size).
		$('#graph' + (i + 1)).parent().css('width', 'calc(' + _width + ' - 20px)');
		
		if (graph && graph.data.chartSize == 'large') {
			i++;
		}		
	}
}

function setChartWidth(currGraph) {	
	// the percentage value of each width unit
	var percent = 100 / itemsCount['graphs'];
	var _width;
	if (currGraph && currGraph.data.chartSize == 'large') {
		_width = 2 * percent + '%';
	}
	else {
		_width = percent + '%';
	}	
	// 20px is for the radius (10px each size).
	$('#graph' + currGraph.LOC).parent().css('width', 'calc(' + _width + ' - 20px)');
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

// when deleting a graph, remove its data (the HTML element is not removed).
function resetGraph(graphToDelete) {
	graphToDelete.data('data', null)
							 .removeClass('active');
	graphToDelete.addClass('editing-item-placeholder loading').removeClass('active');
	graphToDelete.find('.graph-title > label').html('')
																						.attr('title', '')
																						.data('data', '');
	graphToDelete.css('width', 'calc(' + 100 / itemsCount['graphs'] + '% - 20px)');
	graphToDelete.find('.graph-div').html('');
}

function checkPositionForChart(position) {
	var positionForGraph = -1;
	var graphs = $('#graphs-section .graph:not(.template-item)');
	var currentElem = graphs.filter(function(j, elem) { 
		return $(elem).data('position') == position 
	}).eq(0);
	// is the next graph place is empty
	var _data = currentElem.data('data');
	var elemData = _data && JSON.parse(_data);
	if ((elemData && elemData.data.chartSize === 'large') || (currentElem.next().length && !currentElem.next().hasClass('active'))) {
		positionForGraph = position;
	}
	// is the previous graph place is empty
	else if (currentElem.prev().is(':not(.template-item)') && !currentElem.prev().hasClass('active')) {
		positionForGraph = position - 1;
	}
	return positionForGraph;
}

// the call to graphs plugin according to the graph type.
function drawGraph(graphData, divId, graphHeight) {
	switch (graphData.type) {
		case "bar":
			// if (divId === 'graph1') {
				drawBar_NEW(graphData, divId, graphHeight);
			// }
			// else {
			// 	drawBar(graphData, divId, graphHeight);
			// }
			break;
		case "line":
			drawLine(graphData, divId, graphHeight);
			break;
		case "pie":
			if (divId === 'graph2') {
				drawPie_NEW(graphData, divId, graphHeight);
			}
			else {
				drawPie(graphData, divId, graphHeight);
			}
			break;
		case "gauge":
			drawGauge(graphData, divId, 0, graphHeight);
			break;
		case "table":
			drawTable(graphData, divId, graphHeight);
			break;
	//	 more types removed for now 
		default:
			return;
	}
}

function removeGraph(elem) {
	var parentElem = $(elem).closest('.graph');
	var data = JSON.parse(parentElem.data('data'));
	uiLayout['graphs'].data = $.grep(uiLayout['graphs'].data, function(o) {
		return o.LOC != data.LOC;
	});
	resetGraph(parentElem);	
	// if the deleted graph was large, add another empty graph.
	if (data.data['chartSize'] === 'large') {
		// the LOC is not 0 based, so this is the next 0 based index
		renderChart(data.LOC, true);
		sortArea(graphsArea);
	}
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
	
	// $('#menu-list > ul').remove();
	
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
		if (uiLayout.shortcuts.data && uiLayout.shortcuts.data.indexOfByProperty('TXT', itemObj.TXT) >= 0) {				
			favoriteIconClass = 'fa-star';
			favoriteClass = 'favorite';
		}
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
	uiLayout.shortcuts.data.push(itemToAdd);	
	renderMenuFavorites();
	
	var url = "../mcall?_ROUTINE=%25JMUJSON&_NS=CAV&_LABEL=SAVEDSK"; // &OPC=AMIRK
    var data = JSON.stringify({ favorites: uiLayout.shortcuts.data }); 
    $.ajax({
        type : 'POST',
        url : url,
        data: data,
				contentType : 'application/json',
        dataType : 'json',
        success : function(data) {
    		//debugger;
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

function addShortcut(data) {
	var template = $('#shortcuts-section .template-item').clone();
	template.removeClass('template-item');
	$(template).find('.template-field[data-field="TXT"]').text(data.TXT); 
	$(template).data('apm', data.APM)
						 .data('uci', data.UCI);
	if (data.wCY) {
		$(template).data('wcy', data.wCY);
	}
	var placeholderItem = $('#shortcuts-section .editing-item-placeholder').first();
	template.attr('original-position', placeholderItem.attr('original-position'))
	placeholderItem.replaceWith(template);
}

function removeShortcut(elem) {
	var parentElem = $(elem).closest('.department');
	var data = JSON.parse(parentElem.data('data'));
	var removedElemDataObject = uiLayout.shortcuts.data.filter(function(o) {
		return o.LOC == data.LOC;
	}); 
	removedElemDataObject[0].LOC = notShortcutPos;
	parentElem.fadeOut(function(){
		renderArea(shortcutsArea, uiLayout.shortcuts);
		sortArea(shortcutsArea);
	});	
}

function removeInfoSquare(elem) {
	var parentElem = $(elem).closest('.info-square');
	parentElem.removeClass('active')
						.addClass('editing-item-placeholder');
	var data = JSON.parse(parentElem.data('data'));
	uiLayout['info-squares'].data = $.grep(uiLayout['info-squares'].data, function(o) {
		return o.LOC != data.LOC;
	});
	// parentElem.fadeOut(function(){
	// 	// renderArea(infoSquaresArea, uiLayout['info-squares']);
	// 	// sortArea(infoSquaresArea);
	// });
}

function renderInfoSquares() {

	var areaData = uiLayout['info-squares'];
	var area = infoSquaresArea;

	// area with sorting
	$(area).find('.sort-item:not(.template-item)').remove();	
	// area without sorting
	$(area).find('.list-item:not(.template-item)').remove();	

	// set area width
	var newItem = $(area).find('.template-item');
	
	// add items
	var itemsNumber = itemsCount['info-squares']; 
	for (i = 1; i <= itemsNumber; i++) {
		var template = newItem.clone();
		template.removeClass('template-item');
		var currPosition = i; //j * rows + i;
		template.attr('id', 'info-' + i);
		$(template).attr('original-position', currPosition);
		$(template).find('.add-item-button').data('position', currPosition);
		$(area).append(template);		
		var existingItem = areaData.data.filter(function(a) { return a.LOC == currPosition });		
		// add an existing item
		if (existingItem.length > 0) {		
			getInfoSquareData(existingItem[0], function(itemWithData) {
				renderInfoSquareData(itemWithData);				
		  });	
		}
		// add a placeholder for sorting
		else {
			$(template).addClass('editing-item-placeholder');								 
			$(template).find('.set-tooltip-field').removeClass('set-tooltip-field');
		}
	}
	$(area).find('.set-tooltip-field').each(function(i, o) {
		setTooltip(o);
	});
	
}

function getInfoSquareData(obj, handler) {
	// value should come from server
	obj.VAL = parseInt(Math.random() * 10000000).toLocaleString();
	handler(obj);
}

function renderInfoSquareData(itemWithData) {
	var elem = $('#info-' + itemWithData.LOC)
	$(elem).addClass('active')
					.data('data', JSON.stringify(itemWithData));
	setTemplateFields(elem, itemWithData);
	$(elem).find('a').data('apm', itemWithData.APM)
									 .data('uci', itemWithData.UCI);
	if (itemWithData.wCY) {
		$(elem).find('a').data('wcy', itemWithData.wCY);
	}
}

// function setDepartmentsParentWidth() {
// 	var parentHeight = $('#departments-section').height();
// 	var itemHeight = $('#departments-section > .department').eq(0).outerHeight(/*include margin*/true);
// 	var elementsInColumn = Math.floor(parentHeight / itemHeight);
// 	var numberOfItems = $('#departments-section > .department').length;
// 	var numberOfColumns = Math.ceil(numberOfItems / elementsInColumn); 
// 	var itemWidth = $('#departments-section > .department').eq(0).outerWidth(/*include margin*/true);
// 	var parentWidth = numberOfColumns * itemWidth;
// 	$('#departments-section').width(parentWidth);
// }

function requestCompleted() {
	if (lpGetRequestCompleted && menuRequestCompleted) {
		// if no shortcuts data is saved, render favorites.
		if (uiLayout.shortcuts.data.length === 0) {
			renderArea(shortcutsArea, { data: menuFavorites });
		}
		// hide loading animation
		setTimeout(() => {
			$('#loading-animation-div').addClass('finish-loading');
			setTimeout(() => {
				$('#loading-animation-div').remove();
			}, 300);
		}, 300);
	}
}
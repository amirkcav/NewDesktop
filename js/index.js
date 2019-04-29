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

getPageData();

var lastRefresh = new Date();
setInterval(function() {
	lastRefresh = new Date();
	refreshPageData();
}, 5 * 60 * 1000)

$(function() {	

	shortcutsArea = $('#shortcuts-section');
	infoSquaresArea = $('#info-squares-section');
	graphsArea = $('#graphs-section');
	lastAppsArea = $('#last-apps-section > ul');

	$('#add-shortcut-form').validate();    

	// // set info square options (for add popup)
	// setSelectOptions(allInfoSquaresOptions, $('#add-info-square-select'));

	$('#edit-page').click(function() {
		sort();
		$('body').addClass('editing');
	});
	
	$('#done-edit-page').click(function() {
		originalLayout = cloneObject(uiLayout);
		$('.sort-area').sortable('destroy');
		$('body').removeClass('editing');

		var url = "mcall?_ROUTINE=%25JMUJSON&_NS=CAV&_LABEL=LPSAV";
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
		var uci = parent.data('uci');
		var appText = JSON.parse(parent.data('data')).TXT;
		runApp(apm, uci, appText);
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
			var appText = $(this).text().trim();
			runApp(apm, uci, appText);
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
			url : `mcall?_ROUTINE=CBIGRF&_NS=CAV&_LABEL=RUN&GRF=${ obj.code }&TFK=MNG&USERNAME=SID`,
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
		$('#large-graph-div').html('');
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
			if (infoData.APM) {
				var apm = infoData.APM;
				var uci = infoData.UCI;
				var appText = infoData.TXT;
				runApp(apm, uci, appText);
			}
		}
		else {    		
		
			$('#info-square-application').val(infoData.APP);
		
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
		runApp(apm, uci);
	});

});

function getPageData() {
	// get menu data
	var url = "mcall?_ROUTINE=%25JMUJSON&_NS=CAV&_LABEL=ZZ";
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
			
			// rendreing the menu is heavy. using timeout so all the page data would be rendered first.
			setTimeout(function() {
				setMenu(data);
			}, 500);
		},
		error: function(data) {
			alert(data.responseText);    		
		}
	});
	
	// get page data
	var url = "mcall?_ROUTINE=%25JMUJSON&_NS=CAV&_LABEL=LPGET";    	
	// var data = JSON.stringify({ data: uiLayout }); 
	$.ajax({
		type : 'POST',
		url : url,
		// data: data,
		contentType : 'application/json',
		dataType : 'json',
		success : function(data) {
			// uiLayout.shortcuts.data = data[data.length - 1].MENU;
			uiLayout = data.data;
			// save the original layout to be able to cancel changes.
			originalLayout = cloneObject(uiLayout);

			renderAllAreas(true);
		},
		error: function(data) {
			alert(data.responseText);    		
		}
	});

	// get available graphs 
	var url = "mcall?_NS=CAV&_ROUTINE=CBIGRF&_LABEL=GETALLGRF";
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

function setMenu(data) {		    	
	for (let i = 0; i < data.length; i++) {
		const rootItem = data[i];
		var liElement = $(`<li><a href="javascript:;"><i class="fa fa-lg fa-home"></i> <span class="menu-item-parent">${rootItem.TXT}</span></a></li>`); 		    		
		addSubMenu(liElement, rootItem.MENU);
		// $('#menu-list').append(liElement);
		$('#menu-list > .search-app-li').before(liElement);
		
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

function setDepartmentsParentWidth() {
	var parentHeight = $('#departments-section').height();
	var itemHeight = $('#departments-section > .department').eq(0).outerHeight(/*include margin*/true);
	var elementsInColumn = Math.floor(parentHeight / itemHeight);
	var numberOfItems = $('#departments-section > .department').length;
	var numberOfColumns = Math.ceil(numberOfItems / elementsInColumn); 
	var itemWidth = $('#departments-section > .department').eq(0).outerWidth(/*include margin*/true);
	var parentWidth = numberOfColumns * itemWidth;
	$('#departments-section').width(parentWidth);
}

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
	setChartWidth(graph);
	drawGraph(graph.data, /*divId*/ 'graph' + graph.LOC);			
	template.removeClass('editing-item-placeholder loading');
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

function refreshCharts(useTimeout) {
	var graphs = $('#graphs-section .graph.active');
	for (var i = 0; i < graphs.length; i++) {
		var graph = graphs[i];
		var divId = $(graph).find('> .graph-div').attr('id');
		var graphData = JSON.parse($(graph).data('data'));	
		
		var func = function(_graphData, _divId) {
			drawGraph(_graphData, _divId);
			$('#' + _divId).parent().removeClass('loading');
		};
		
		if (useTimeout) {
			setTimeout(function(_graphData, _divId) {
				func(_graphData, _divId);
			}, 100 * (i + 1), graphData.data, divId);
		}
		else {
			func(graphData.data, divId);
		}
	}	
}

function sort() {
	$('.sort-area').each(function() {					
		sortArea(this);		
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
		
		var favoriteClass = '';
		var favoriteIconClass = 'fa-star-o';
		// is favorite
		if (uiLayout.shortcuts.data.indexOfByProperty('TXT', itemObj.TXT) >= 0) {				
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
			runApp(itemData.APM, itemData.UCI, itemData.TXT);
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

function addShortcut(data) {
	var template = $('#shortcuts-section .template-item').clone();
	template.removeClass('template-item');
	$(template).find('.template-field[data-field="TXT"]').text(data.TXT); 
	$(template).data('apm', data.APM)
			   .data('uci', data.UCI);
	var placeholderItem = $('#shortcuts-section .editing-item-placeholder').first();
	template.attr('original-position', placeholderItem.attr('original-position'))
	placeholderItem.replaceWith(template);
}

function runApp(apm, uci, text) {
	var apmArr = apm.split(':');
	var ap = apmArr[0];
	var pm = apmArr[1];
	// add to last apps
	if (text && text.length > 0) {
		var currApp = { TXT: text, UCI: uci, APM: apm };
		addToLastApps(currApp);		
		renderArea(lastAppsArea, uiLayout['last-apps']);
	}
	// run app.
	if (window.app) {
		app.openApplication(ap, pm, uci, '', '');
	}
	else {
		console.log(stringFormat('Run App - {0}:{1}:{2}', ap, pm, uci));
	}
}

function renderArea(area, areaData) {
	var data = areaData.data;
	
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
		item.find('> .graph-div').attr('id', 'graph' + position);
	}	
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
	}
}

function renderAllAreas(useTimeout) {
	$('.items-section, .list-section > ul').each(function() { 		
		var areaName = $(this).data('area-name');
		renderArea(this, uiLayout[areaName]);		
	});
	renderCharts(useTimeout);
	renderInfoSquares();
}

function addToFavorites(itemToAdd) {	
	uiLayout.shortcuts.data.push(itemToAdd);	
	renderMenuFavorites();
	
	var url = "mcall?_ROUTINE=%25JMUJSON&_NS=CAV&_LABEL=SAVEDSK&OPC=AMIRK";    	
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
	// var graphData = {};
	// switch (graphCode) {
	// 	case 'G1':
	// 		graphData = {"cols":{"x":{"title":"מכירות","type":"string"},"y":[{"title":"ערך","type":"number"}]},"green":{"from":457092,"to":794942},"links":[{"chartCode":"GSGD1","param":[{"key":"JB","value":"BI9579755"},{"key":"DATE","value":20180207}],"place":"prev","text":"ליום הקודם"}],"red":{"from":0,"to":397471},"ticks":{"major":1,"minor":5},"titles":{"chart":"181%","head":"הזמנות יומי - נטו<BR>ליום ה 08.02.18 מול היעד"},"type":"gauge","valsInterval":{"max":794942,"maxPercent":200,"middle":397471,"min":0},"values":[{"val":718276,"zoomParam":[{"key":"INDEX","value":718276},{"key":"DATE","value":20180208}]}],"yellow":{"from":397471,"to":457092},"zoom":{"chartCode":"GSTD3"}};
	// 		break;
	// 	case 'G2':
	// 		graphData = {"cols":{"x":{"title":null,"type":"string"},"y":[{"title":"ערך","type":"number"}]},"links":[{"chartCode":"GSPD1","param":[{"key":"JB","value":"BI9579755"},{"key":"DATE","value":null}],"place":"exel","text":"ליום אקסל"},{"chartCode":"GSPD1","param":[{"key":"JB","value":"BI9579755"},{"key":"DATE","value":20180207}],"place":"prev","text":"ליום הקודם"}],"options":{"3D":true},"titles":{"chart":"ליום ה 08.02.18","head":"התפלגות הזמנות לפי מודלים מובילים<BR>"},"type":"pie","values":[{"color":null,"title":"שרשרת","unit":null,"vals":[669553],"zoomParam":[{"key":"INDEX","value":":1"},{"key":"DATE","value":20180208}]},{"color":null,"title":"אחר","unit":null,"vals":[48241],"zoomParam":[{"key":"INDEX","value":"OTHER"},{"key":"DATE","value":20180208}]}],"zoom":{"chartCode":"GSTD1"}}; 
	// 		break;
	// 	case 'G3':
	// 		graphData = {"chartColor":["blue","green"],"chartSize":"large","cols":{"x":{"title":"סוכן","type":"string"},"y":[{"show":1,"title":"יעד","type":"number"},{"show":1,"title":"ביצוע","type":"number"}]},"links":[{"chartCode":"GSBD4","param":[{"key":"JB","value":"BI9579755"},{"key":"DATE","value":null}],"place":"exel","text":"ליום אקסל"},{"chartCode":"GSBD4","param":[{"key":"JB","value":"BI9579755"},{"key":"DATE","value":20180207}],"place":"prev","text":"ליום הקודם"}],"titles":{"axis":{"x":"סוכן","y":null,"y2":null},"chart":"ליום ה 08.02.18","head":"יעד מול ביצוע לסוכן"},"type":"bar","values":[{"color":null,"title":"מחסן ראשי(לשיווק)","unit":null,"vals":[34563.03357142857,352171.09],"zoomParam":[{"key":"INDEX","value":"RO:1"},{"key":"DATE","value":20180208}]},{"color":null,"title":"נתנאל לוי 0522432807","unit":null,"vals":[19844.505357142858,28055.49],"zoomParam":[{"key":"INDEX","value":"RO:11"},{"key":"DATE","value":20180208}]},{"color":null,"title":"חדד דינה 052-2550543","unit":null,"vals":[10064.16107142857,19242.73],"zoomParam":[{"key":"INDEX","value":"RO:18"},{"key":"DATE","value":20180208}]},{"color":null,"title":"עינבל סויסה 0526574989","unit":null,"vals":[16026.648571428572,34706.03],"zoomParam":[{"key":"INDEX","value":"RO:19"},{"key":"DATE","value":20180208}]},{"color":null,"title":"אילנה סיבוני 052-5595058","unit":null,"vals":[14816.081428571428,14920.53],"zoomParam":[{"key":"INDEX","value":"RO:20"},{"key":"DATE","value":20180208}]},{"color":null,"title":"גיא חיה 052-2308641","unit":null,"vals":[26845.361785714285,19603.16],"zoomParam":[{"key":"INDEX","value":"RO:21"},{"key":"DATE","value":20180208}]},{"color":null,"title":"תאופיק חסנין","unit":null,"vals":[2338.644642857143,3405.98],"zoomParam":[{"key":"INDEX","value":"RO:24"},{"key":"DATE","value":20180208}]},{"color":null,"title":"זיו שושן 052-6574985","unit":null,"vals":[20481.323214285716,24496],"zoomParam":[{"key":"INDEX","value":"RO:26"},{"key":"DATE","value":20180208}]},{"color":null,"title":"אבי יאיש 052-6573025","unit":null,"vals":[17899.75857142857,10060.35],"zoomParam":[{"key":"INDEX","value":"RO:27"},{"key":"DATE","value":20180208}]},{"color":null,"title":"מורן מדמוני","unit":null,"vals":[127.80428571428571,4205.98],"zoomParam":[{"key":"INDEX","value":"RO:28"},{"key":"DATE","value":20180208}]},{"color":null,"title":"מיטל כוכבי 052-7226820","unit":null,"vals":[1768.3757142857144,634.1],"zoomParam":[{"key":"INDEX","value":"RO:29"},{"key":"DATE","value":20180208}]},{"color":null,"title":"סוכן ביוטי סטור רמבם","unit":null,"vals":[7215.506785714286,6942.68],"zoomParam":[{"key":"INDEX","value":"RO:3"},{"key":"DATE","value":20180208}]},{"color":null,"title":"דימרי מאיר 052-3264636","unit":null,"vals":[25672.465714285714,9539.22],"zoomParam":[{"key":"INDEX","value":"RO:30"},{"key":"DATE","value":20180208}]},{"color":null,"title":"אילנה איסחקוב 052-5595062","unit":null,"vals":[16530.54107142857,74650.66],"zoomParam":[{"key":"INDEX","value":"RO:4"},{"key":"DATE","value":20180208}]},{"color":null,"title":"ללוש שי 052-2537053","unit":null,"vals":[25636.998571428572,18227.35],"zoomParam":[{"key":"INDEX","value":"RO:40"},{"key":"DATE","value":20180208}]},{"color":null,"title":"ליאת אבו (0525411370)","unit":null,"vals":[11467.675714285715,18374.01],"zoomParam":[{"key":"INDEX","value":"RO:41"},{"key":"DATE","value":20180208}]},{"color":null,"title":"ענת אזולאי 054-6567127","unit":null,"vals":[8640.5375,9671.14],"zoomParam":[{"key":"INDEX","value":"RO:44"},{"key":"DATE","value":20180208}]},{"color":null,"title":"חדד גדי 052-8525267","unit":null,"vals":[8817.070357142857,95535.6],"zoomParam":[{"key":"INDEX","value":"RO:45"},{"key":"DATE","value":20180208}]},{"color":null,"title":"נטלי איבגי 052-7955444","unit":null,"vals":[14406.142857142857,5771.74],"zoomParam":[{"key":"INDEX","value":"RO:46"},{"key":"DATE","value":20180208}]},{"color":null,"title":"מרגלית בן שיטרית 0526578231","unit":null,"vals":[13560.345357142856,30499.21],"zoomParam":[{"key":"INDEX","value":"RO:49"},{"key":"DATE","value":20180208}]},{"color":null,"title":"שרית טויטו","unit":null,"vals":[21056.2275,4639.01],"zoomParam":[{"key":"INDEX","value":"RO:5"},{"key":"DATE","value":20180208}]},{"color":null,"title":"פרלי מגול 052-8973968","unit":null,"vals":[165.1407142857143,2088.04],"zoomParam":[{"key":"INDEX","value":"RO:51"},{"key":"DATE","value":20180208}]},{"color":null,"title":"רונן כהן-0526036015","unit":null,"vals":[0,1914.87],"zoomParam":[{"key":"INDEX","value":"RO:57"},{"key":"DATE","value":20180208}]},{"color":null,"title":"אדוארדו פורזקנסקי","unit":null,"vals":[6066.055357142857,3849],"zoomParam":[{"key":"INDEX","value":"RO:6"},{"key":"DATE","value":20180208}]},{"color":null,"title":"ניסים קלרית.052-6578231","unit":null,"vals":[19855.342857142856,14557.44],"zoomParam":[{"key":"INDEX","value":"RO:60"},{"key":"DATE","value":20180208}]},{"color":null,"title":"מגי סקר 052-3127012","unit":null,"vals":[11959.606071428572,33390.77],"zoomParam":[{"key":"INDEX","value":"RO:63"},{"key":"DATE","value":20180208}]},{"color":null,"title":"שני מיארה 052-2211889","unit":null,"vals":[5516.653928571429,1048],"zoomParam":[{"key":"INDEX","value":"RO:64"},{"key":"DATE","value":20180208}]},{"color":null,"title":"אלינור לוי 0528812770","unit":null,"vals":[5389.9575,3852.76],"zoomParam":[{"key":"INDEX","value":"RO:69"},{"key":"DATE","value":20180208}]},{"color":null,"title":"סוכן אינטרנט","unit":null,"vals":[1660.3635714285715,3916.24],"zoomParam":[{"key":"INDEX","value":"RO:70"},{"key":"DATE","value":20180208}]},{"color":null,"title":"חורי מזל (נתנאל)","unit":null,"vals":[4041.302142857143,1152.14],"zoomParam":[{"key":"INDEX","value":"RO:73"},{"key":"DATE","value":20180208}]},{"color":null,"title":"שני סוכן עובדים ודיילות","unit":null,"vals":[751.9546428571429,2817.6],"zoomParam":[{"key":"INDEX","value":"RO:8"},{"key":"DATE","value":20180208}]},{"color":null,"title":"ללא סוכן","unit":null,"vals":[0,231.83],"zoomParam":[{"key":"INDEX","value":"RO:ZZZ"},{"key":"DATE","value":20180208}]}],"zoom":{"chartCode":"GSTD2"},"chartCode":"GSBD4"}; 
	// 		break;
	// 	case 'G4':
	// 		graphData = {"chartColor":["blue","green"],"chartSize":"large","cols":{"x":{"title":"סוכן","type":"string"},"y":[{"show":1,"title":"יעד","type":"number"},{"show":1,"title":"ביצוע","type":"number"}]},"links":[{"chartCode":"GSBD4","param":[{"key":"JB","value":"BI5960894"},{"key":"DATE","value":null}],"place":"exel","text":"ליום אקסל"},{"chartCode":"GSBD4","param":[{"key":"JB","value":"BI5960894"},{"key":"DATE","value":20180220}],"place":"prev","text":"ליום הקודם"}],"titles":{"axis":{"x":"סוכן","y":null,"y2":null},"chart":"ליום ד 21.02.18","head":"יעד מול ביצוע לסוכן"},"type":"bar","values":[{"color":null,"title":"מחסן ראשי(לשיווק)","unit":null,"vals":[34563.03357142857,94507.58],"zoomParam":[{"key":"INDEX","value":"RO:1"},{"key":"DATE","value":20180221}]},{"color":null,"title":"נתנאל לוי 0522432807","unit":null,"vals":[19844.505357142858,18812.82],"zoomParam":[{"key":"INDEX","value":"RO:11"},{"key":"DATE","value":20180221}]},{"color":null,"title":"חדד דינה 052-2550543","unit":null,"vals":[10064.16107142857,15663.73],"zoomParam":[{"key":"INDEX","value":"RO:18"},{"key":"DATE","value":20180221}]},{"color":null,"title":"עינבל סויסה 0526574989","unit":null,"vals":[16026.648571428572,18887.9],"zoomParam":[{"key":"INDEX","value":"RO:19"},{"key":"DATE","value":20180221}]},{"color":null,"title":"אילנה סיבוני 052-5595058","unit":null,"vals":[14816.081428571428,6752.99],"zoomParam":[{"key":"INDEX","value":"RO:20"},{"key":"DATE","value":20180221}]},{"color":null,"title":"גיא חיה 052-2308641","unit":null,"vals":[26845.361785714285,30082.59],"zoomParam":[{"key":"INDEX","value":"RO:21"},{"key":"DATE","value":20180221}]},{"color":null,"title":"תאופיק חסנין","unit":null,"vals":[2338.644642857143,10409.38],"zoomParam":[{"key":"INDEX","value":"RO:24"},{"key":"DATE","value":20180221}]},{"color":null,"title":"זיו שושן 052-6574985","unit":null,"vals":[20481.323214285716,8987.7],"zoomParam":[{"key":"INDEX","value":"RO:26"},{"key":"DATE","value":20180221}]},{"color":null,"title":"אבי יאיש 052-6573025","unit":null,"vals":[17899.75857142857,8550.5],"zoomParam":[{"key":"INDEX","value":"RO:27"},{"key":"DATE","value":20180221}]},{"color":null,"title":"סוכן ביוטי סטור רמבם","unit":null,"vals":[7215.506785714286,13079.48],"zoomParam":[{"key":"INDEX","value":"RO:3"},{"key":"DATE","value":20180221}]},{"color":null,"title":"דימרי מאיר 052-3264636","unit":null,"vals":[25672.465714285714,18148.72],"zoomParam":[{"key":"INDEX","value":"RO:30"},{"key":"DATE","value":20180221}]},{"color":null,"title":"אילנה איסחקוב 052-5595062","unit":null,"vals":[16530.54107142857,49699.14],"zoomParam":[{"key":"INDEX","value":"RO:4"},{"key":"DATE","value":20180221}]},{"color":null,"title":"ללוש שי 052-2537053","unit":null,"vals":[25636.998571428572,19310.91],"zoomParam":[{"key":"INDEX","value":"RO:40"},{"key":"DATE","value":20180221}]},{"color":null,"title":"ליאת אבו (0525411370)","unit":null,"vals":[11467.675714285715,9631.1],"zoomParam":[{"key":"INDEX","value":"RO:41"},{"key":"DATE","value":20180221}]},{"color":null,"title":"ענת אזולאי 054-6567127","unit":null,"vals":[8640.5375,5387.18],"zoomParam":[{"key":"INDEX","value":"RO:44"},{"key":"DATE","value":20180221}]},{"color":null,"title":"חדד גדי 052-8525267","unit":null,"vals":[9605.845714285715,47028.91],"zoomParam":[{"key":"INDEX","value":"RO:45"},{"key":"DATE","value":20180221}]},{"color":null,"title":"נטלי איבגי 052-7955444","unit":null,"vals":[14406.142857142857,10683.67],"zoomParam":[{"key":"INDEX","value":"RO:46"},{"key":"DATE","value":20180221}]},{"color":null,"title":"מרגלית בן שיטרית 0526578231","unit":null,"vals":[13475.210714285715,23176.92],"zoomParam":[{"key":"INDEX","value":"RO:49"},{"key":"DATE","value":20180221}]},{"color":null,"title":"שרית טויטו","unit":null,"vals":[21056.2275,25301.71],"zoomParam":[{"key":"INDEX","value":"RO:5"},{"key":"DATE","value":20180221}]},{"color":null,"title":"פרלי מגול 052-8973968","unit":null,"vals":[165.1407142857143,493.17],"zoomParam":[{"key":"INDEX","value":"RO:51"},{"key":"DATE","value":20180221}]},{"color":null,"title":"אדוארדו פורזקנסקי","unit":null,"vals":[4908.418571428571,117.76],"zoomParam":[{"key":"INDEX","value":"RO:6"},{"key":"DATE","value":20180221}]},{"color":null,"title":"ניסים קלרית.052-6578231","unit":null,"vals":[19855.342857142856,2822.22],"zoomParam":[{"key":"INDEX","value":"RO:60"},{"key":"DATE","value":20180221}]},{"color":null,"title":"מגי סקר 052-3127012","unit":null,"vals":[11959.606071428572,3560.69],"zoomParam":[{"key":"INDEX","value":"RO:63"},{"key":"DATE","value":20180221}]},{"color":null,"title":"אלינור לוי 0528812770","unit":null,"vals":[5389.9575,763.25],"zoomParam":[{"key":"INDEX","value":"RO:69"},{"key":"DATE","value":20180221}]},{"color":null,"title":"סוכן אינטרנט","unit":null,"vals":[1660.3635714285715,5271.09],"zoomParam":[{"key":"INDEX","value":"RO:70"},{"key":"DATE","value":20180221}]},{"color":null,"title":"שני סוכן עובדים ודיילות","unit":null,"vals":[751.9546428571429,1704.5],"zoomParam":[{"key":"INDEX","value":"RO:8"},{"key":"DATE","value":20180221}]}],"zoom":{"chartCode":"GSTD2"}}; 
	// 		break;
	// 	case 'G5':
	// 		graphData = {"cols":{"x":{"title":null,"type":"string"},"y":[{"title":"ערך","type":"number"}]},"links":[{"chartCode":"GSPD1","param":[{"key":"JB","value":"BI9579755"},{"key":"DATE","value":null}],"place":"exel","text":"ליום אקסל"},{"chartCode":"GSPD1","param":[{"key":"JB","value":"BI9579755"},{"key":"DATE","value":14180207}],"place":"prev","text":"ליום הקודם"}],"options":{"3D":true},"titles":{"chart":"ליום א 25.02.18","head":"התפלגות הזמנות לפי מודלים מובילים<BR>"},"type":"pie","values":[{"color":null,"title":"שרשרת","unit":null,"vals":[114882],"zoomParam":[{"key":"INDEX","value":":1"},{"key":"DATE","value":20180208}]},{"color":null,"title":"אחר","unit":null,"vals":[83102],"zoomParam":[{"key":"INDEX","value":"OTHER"},{"key":"DATE","value":20180208}]}, {"color":null,"title":"נתון נוסף","unit":null,"vals":[96577],"zoomParam":[{"key":"INDEX","value":":1"},{"key":"DATE","value":20180208}]}],"zoom":{"chartCode":"GSTD1"}}; 
	// 		break;
	// }
	// return graphData;
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

function drawGraph(graphData, divId, graphHeight) {
	switch (graphData.type) {
		case "bar":
			drawBar(graphData, divId, graphHeight);
			break;
		case "line":
			drawLine(graphData, divId, graphHeight);
			break;
		case "pie":
			drawPie(graphData, divId, graphHeight);
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

function resetArrayLocations(arr) {
	for (let ij = 0; ij < arr.length; ij++) {
		const element = arr[ij];
		element.LOC = ij + 1;
	}
}

function addToLastApps(newApp) {
	var prevApp = uiLayout['last-apps'].data[0];
	if (!prevApp || prevApp.TXT != newApp.TXT) {
		uiLayout['last-apps'].data.unshift(newApp);
		resetArrayLocations(uiLayout['last-apps'].data);
	}
}

function getLP() {
	var url = "mcall?_ROUTINE=%25JMUJSON&_NS=CAV&_LABEL=LPGET";    	
	// var data = JSON.stringify({ data: uiLayout }); 
	$.ajax({
		type : 'POST',
		url : url,
		// data: data,
		contentType : 'application/json',
		dataType : 'json',
		success : function(data) {
			//debugger;
			var r = 3;
		},
		error: function(data) {
			alert(data.responseText);    		
		}
	});  
}

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
}

//var allInfoSquaresOptions = [ { COD: 1, TXT: 'מכירות יומי', VAL: '72,527' }, { COD: 2, TXT: 'מכירות חודשי', VAL: '1,211,422' }, { COD: 3, TXT: 'מכירות שבועי', VAL: '24,053' }, { COD: 4, TXT: 'החזרות חודשי', VAL: '6,320' }, { COD: 5, TXT: 'מוצרים פגומים חודשי', VAL: '5,245' }, { COD: 6, TXT: 'מכירות שנתי', VAL: '14,310,558' }, { COD: 7, TXT: 'רווחים חודשי עם כותרת ארוכה', VAL: '342,099' } ];

// var uiLayout = {      
//      'shortcuts': { count: 21, data: []}, 
//      'info-squares': { count: 6, data: [
//          { COD: 1, TXT: 'מכירות יומי', VAL: '72,527', LOC: 1 },
//          { COD: 2, TXT: 'מכירות חודשי', VAL: '1,211,422', LOC: 2 },
//      ]},
// 		 'graphs': { count: 4, data: [ { COD: 'G1', LOC: 1 }, { COD: 'G2', LOC: 2 }, { COD: 'G3', LOC: 3 } ]}, // { COD: 'G4', LOC: 5 }
// 		 'last-apps': { data: [ 
// 			 { TXT: 'איפיון חיפוש קריאה', UCI: 'CVH', APM: 'SRVQ:WH1' },
// 			 { TXT: 'פעילות לטלפנית', UCI: 'SVK', APM: 'TLPN:' },
// 			 { TXT: 'סוכנים למסופון', UCI: 'SVK', APM: 'MCRRO:' } 
// 			]},
// 			'last-docs': { data: [
// 				{ DATE: '15.2.19', TXT: 'פריט 142677', UCI: 'CVH', APM: 'SRVQ:WH1' },
// 				{ TXT: 'הזמנה 31283', UCI: 'SVK', APM: 'TLPN:' },
// 			 	{ TXT: 'מכירות ינואר 2019', UCI: 'SVK', APM: 'MCRRO:' },
// 			 	{ TXT: 'מלאי לקוח 77244', UCI: 'SVK', APM: 'MCRRO:' } 
// 			]}
// };

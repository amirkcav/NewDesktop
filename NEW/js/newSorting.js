/* http://gridstackjs.com/ */

var gridStackObj;
// var itemsData;

$(function () {
  var options = {
      cellHeight: 'auto',
      disableDrag: true,
      disableResize: true,
      resizable: {
        handles: 'se, sw'
      }
      // verticalMargin: 10
  };
  $('.grid-stack').gridstack(options);
  gridStackObj = $('.grid-stack').data('gridstack');

  var itemsData = localStorage.getItem('itemsData');
  if (itemsData) {
    itemsData = JSON.parse(itemsData);
    renderItems(itemsData);    
  }

  $('.add-item-button').click(function() {
    var type = $(this).data('type');
    switch (type) {
      case 'shortcut':
        addShortcut();
        break;
      case 'data-cube':
        addDataCube();
        break;
      case 'graph':
        // addGraph();
        break;    
      default:
        break;
    }
  });

  $('#items-container').on('click', '.remove-item', function(event) {
    
    if (!$(this).hasClass('popover-init')) {
      $(this).popover({	    
        html: true,
        placement: 'auto',
        content: function() {
          return $('#confirmation-popover-template').html();
        },
        title: 'מחיקה',
        container: 'body'
      });
      $(this).popover('show')
             .addClass('popover-init');		    		   
    }    	
    else {
      $(this).popover('show');
    }

    $('#confirmation-popover-yes').click((e) => {
      var elem = $(this).closest('.grid-stack-item');
      $(elem).fadeOut(function(){
        gridStackObj.removeWidget(elem);
      });
      // $(this).popover('hide');
      // e.stopPropagation();
    });
    event.stopPropagation();
  });

  $('#save-button').click(function() {
    var itemsData = serializeItems();
    localStorage.setItem('itemsData', JSON.stringify(itemsData));
    cancelEditing();
  });

  $('#delete-all-button').click(function() {
    $('#items-container .grid-stack-item').each((i, o) => {
      gridStackObj.removeWidget(o);
    });
    localStorage.removeItem('itemsData');
    $('body').removeClass('editing');
  });

  //#region click on item

  $('#items-container').on('click', '.grid-stack-item.item-shortcut', function() {
		var itemData = JSON.parse($(this).data('item-data'));
		if (!$('body').hasClass('editing')) {
			var apm = itemData.APM;
			var uci = itemData.UCI;
			var wcy = itemData.wCY;
			var appText = itemData.TXT.trim();
			runApp(apm, uci, wcy, appText);
		}
		else {
			var app = itemData.value ? itemData.value : itemData.TXT; 
			$('#add-shortcut').val(app)
												.data('selected-item', JSON.stringify(itemData));
			$('#shortcut-title').val(itemData.TXT);			
			$('#add-shortcut-modal').data('item-id', $(this).data('id'));
			$('#add-shortcut-modal').modal('show');    		
		}
	});    

	$('#items-container').on('click', '.grid-stack-item.item-data-cube', function() {
		var itemData = JSON.parse($(this).data('item-data'));
		if (!$('body').hasClass('editing')) {
			if (itemData.APM && itemData.APM !== 'null') {
				var apm = itemData.APM;
				var uci = itemData.UCI;
				var wcy = itemData.wCY;
				var appText = itemData.TXT.trim();
				runApp(apm, uci, wcy, appText);
			}
		}
		else {
			if (itemData.APP && itemData.APP !== 'null') {
				$('#info-square-application').val(itemData.APP);
				$('#info-square-application').data('selected-item', JSON.stringify(itemData));
			}
			$('#add-info-square-select').data('value', itemData.COD);
			// $('#add-info-square-select').val(itemData.COD)
			// 														.trigger('change');
			// $('#add-info-square-modal-button').data('position', itemData.LOC);    		
			$('#add-info-square-modal').data('item-id', $(this).data('id'));
			$('#add-info-square-modal').modal('show');   		
		}
	});

  //#endregion click on item

  //#region add & edit shortcut

  $('#add-shortcut-modal').on('shown.bs.modal', function() {
		if (!$('#add-shortcut').hasClass('ui-autocomplete-input')) {
			$('#add-shortcut').autocomplete({
				minLength: 2,
				source: menuApps,
				appendTo: '.search-app-parent',
				select: function( event, ui ) {
					var itemData = ui.item;
					// needed for selection by moouse click.
					$(this).val(itemData.label)
								 .data('selected-item', JSON.stringify(itemData));
					$('#shortcut-title').val(itemData.label);
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

	$('#add-shortcut-modal').on('hidden.bs.modal', function() {
		$('#add-shortcut-modal').data('item-id', null);		
	});

	$('#add-shortcut-modal').on('click', '#add-shortcut-modal-button', function() {
		if ($('#add-shortcut-form').valid()) {
			var selectedItem = JSON.parse($('#add-shortcut').data('selected-item'));    		
			selectedItem.TXT = $('#shortcut-title').val();    
			// add shortcut
			if (!$('#add-shortcut-modal').data('item-id')) {
				addShortcut(selectedItem);
			}
			// edit
			else {
				var currItemId = $('#add-shortcut-modal').data('item-id');
				var elem = $(`[data-id=${currItemId}]`);
				$(elem).data('item-data', JSON.stringify(selectedItem));
				$(elem).find('.shortcut-text').text(selectedItem.TXT);
			}
			$(this).closest('.modal').modal('hide');
		}
	});	

  //#endregion add & edit shortcut

  //#region add & edit data-cube

  $('#add-info-square-modal').on('shown.bs.modal', function() {
		$('#add-info-square-select').select2({
			data: allInfoSquaresOptions,
			dropdownParent: $('#add-info-square-modal'),
			placeholder: "בחר נתון להצגה"
		});
		if ($('#add-info-square-select').data('value')) {
			$('#add-info-square-select').val($('#add-info-square-select').data('value'))
																	.trigger('change');
		}
		
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

  $('#add-info-square-modal').on('click', '#add-info-square-modal-button', function() {
		var obj = $('#add-info-square-select').select2('data')[0];
    // on edit
    if ($('#add-info-square-modal').data('item-id')) {
			obj.id = $('#add-info-square-modal').data('item-id');
		}
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

		getInfoSquareData(obj, function(value) {
			obj.VAL = value;
			addDataCube(obj);
		});		
		$(this).closest('.modal').modal('hide');
	});

  //#endregion add & edit data-cube

  //#region add & edit graph

  $('#add-graph-modal').on('click', '#add-graph-modal-button', function() {
		var obj = $('#add-graph-select').select2('data')[0]; 
		var button = this;
		$.ajax({
			type : 'GET',
			url : `../mcall?_ROUTINE=CBIGRF&_NS=CAV&_LABEL=RUN&GRF=${ obj.code }&TFK=MNG&USERNAME=SID`,
			contentType : 'application/json',
			dataType : 'json',
			success : function(graphData) {
				// check data validity
				if (graphData.type === 'table' && (!graphData.cols || graphData.cols.length === 0)) {
					this.error({});
					return;
				}
				// renderCharts();
				obj.data = graphData;
        obj.data.chartSize = graphData.chartSize; 
        addGraph(obj);
				renderGraphData(obj);
				$(button).closest('.modal').modal('hide');    
			},
			error: function(data) {
				// alert(data.responseText);   
				var error = data.responseText ? data.responseText : 'אירעה שגיאה בטעינת הגרף.';
				$('#add-graph-modal .add-graph-error').text(error).fadeIn();
			}
		});				
	});

  //#endregion add & edit graph

});

function addItem(width, height, type, dataObj, id, x, y) {
  if (!id) {
    if ($('#items-container .grid-stack-item').length === 0) {
      id = 1;
    }
    else {
      var ids = $('#items-container .grid-stack-item').map((i,o) => $(o).data('id'));
      id = Math.max.apply(0, ids) + 1;
    }
  }

  dataObj.id = id;

  var template = getItemTemplate(type, id, dataObj);
  var elem = htmlToElement(template);
  if (dataObj) {
    $(elem).data('item-data', JSON.stringify(dataObj));
  }
  var hasPosition = x != null && y != null;                
  gridStackObj.addWidget(elem, x, y, width, height, !hasPosition);
  gridStackObj.movable(elem, $('body').hasClass('editing'));
  gridStackObj.resizable(elem, $('body').hasClass('editing'));
}

function getItemTemplate(type, id, itemData) {
  let temlpateContent = '';
  switch (type) {
    case 'shortcut':
      temlpateContent = `<label class="shortcut-text">${itemData ? itemData.TXT : id}</label>`;
      break;  
    case 'data-cube':
      temlpateContent = `<label class="title set-tooltip-field">${itemData.TXT}</label>
                         <label class="sum"><span class="sign">₪</span><span>${itemData.VAL}</span></label>`;
      break;
    case 'graph': 
      temlpateContent = `<div class="graph-title"><label></label></div>
                         <img id="graph-loading-image" src="img/loading.gif">
                         <div class="graph-div">
                           <canvas></canvas>
                         </div>`;
      break;
  }  
  var template = `<div class="grid-stack-item item-${type}" data-id="${id}" data-item-type="${type}">
                    <div class="grid-stack-item-content">
                      <a class="remove-item" href="javascript:;" data-toggle="popover" data-trigger="focus">X</a>
                      <div class="template-content">
                        ${temlpateContent}
                      </div>
                    </div>
                  </div>`;  
  return template;
}

function _addItem(width, height, type, id, x, y) {
  if (!id) {
    if ($('#items-container .grid-stack-item').length === 0) {
      id = 1;
    }
    else {
      var ids = $('#items-container .grid-stack-item').map((i,o) => $(o).data('id'));
      id = Math.max.apply(0, ids) + 1;
    }
  }
  var template = `<div class="grid-stack-item item-${type}" data-id="${id}" data-item-type="${type}" data-gs-x="${x}" data-gs-y="${y}" data-gs-width="${width}" data-gs-height="${height}">
                    <div class="grid-stack-item-content">
                      <a class="remove-item" href="javascript:;">X</a>
                      <h3>${id}</h3>
                    </div>
                  </div>`;
  var hasPosition = x != null && y != null;                
  var widget = gridStackObj.addWidget(htmlToElement(template), x, y, width, height, !hasPosition);
}

function addShortcut(data) {
  addItem(1, 1, 'shortcut', data);
}

function addDataCube(data) {
  addItem(2, 1, 'data-cube', data);
}

function addGraph(data) {
  addItem(2, 2, 'graph', data);
}

function serializeItems() {
  var items = [];
  $('#items-container .grid-stack-item').each((i, o) => {
    var item = {
      type: $(o).data('item-type'),
      id: $(o).data('id'),
      x: $(o).attr('data-gs-x'),
      y: $(o).attr('data-gs-y'),
      width: $(o).attr('data-gs-width'),
      height: $(o).attr('data-gs-height'),
      data: $(o).data('item-data')
    };
    items.push(item);
  });
  items.sort((a, b) => a.y - b.y);
  return items;
}

function renderItems(data) {
  $('.grid-stack').html('');
  // itemsData.forEach(item => {
  data.forEach(item => {
    if (item.type === 'shortcut') {
      addItem(item.width, item.height, item.type, item.data ? JSON.parse(item.data) : null, item.id, item.x, item.y);
    }
    else if (item.type === 'data-cube') {
      getInfoSquareData(item, (value) => {
        if (item.data) {
          item.data = JSON.parse(item.data);
          item.data.VAL = value;
        }
        // addItem(itemWithData.width, itemWithData.height, itemWithData.type, itemWithData.data ? JSON.parse(itemWithData.data) : null, itemWithData.id, itemWithData.x, itemWithData.y);
        addItem(item.width, item.height, item.type, item.data, item.id, item.x, item.y);
      });
    }
    else if (item.type === 'graph') {
      addItem(item.width, item.height, item.type, item.id, item.x, item.y);
      // _addItem(item.width, item.height, item.type, item.id, item.x, item.y);
    }
  });
}

function cancelEditing() {
  $('body').removeClass('editing');
  gridStackObj.movable('.grid-stack-item', false);
  gridStackObj.resizable('.grid-stack-item', false);
}

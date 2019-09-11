/* http://gridstackjs.com/ */

var gridStackObj;
var itemsData;

$(function () {
  // var gridstackOptions = {
  //     cellHeight: 'auto',
  //     staticGrid: true,
  //     resizable: {
  //       handles: 'se, sw'
  //     }
  // };
  // $('.grid-stack').gridstack(gridstackOptions);
  // gridStackObj = $('.grid-stack').data('gridstack');

  // itemsData = localStorage.getItem('itemsData');
  // if (itemsData) {
  //   itemsData = JSON.parse(itemsData);
  //   renderItems(itemsData);    
  // }

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
    });
    event.stopPropagation();
  });

  //#region top row buttons

  $('#edit-page').click(function() {
		// save the original items to be able to cancel changes.
		originalItemsData = serializeItems();
		$('body').addClass('editing');
		gridStackObj.setStatic(false);
	});

  $('#cancel-edit-page').click(function() {
		renderItems(originalItemsData);
		cancelEditing();
	});

  $('#save-button').click(function() {
    itemsData = serializeItems();
    // localStorage.setItem('itemsData', JSON.stringify(itemsData));
    var url = "../mcall?_ROUTINE=%25JMUJSON&_NS=CAV&_LABEL=LPSAV";		
    $.ajax({
			type : 'POST',
			url : url,
			data: JSON.stringify({ data: itemsData }),
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
        cancelEditing();        
    	},
			error: function(data) {
				alert(data.responseText);    		
        // cancelEditing();
			}
    });  
    // cancelEditing();
  });

  $('#delete-all-button').click(function() {
    $('#items-container .grid-stack-item').each((i, o) => {
      gridStackObj.removeWidget(o);
    });
    localStorage.removeItem('itemsData');
    $('body').removeClass('editing');
  });

  //#endregion top row buttons

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
			$('#add-info-square-modal').data('item-id', $(this).data('id'));
			$('#add-info-square-modal').modal('show');   		
		}
	});

  $('#items-container').on('click', '.grid-stack-item.item-graph', function() {
		var graphData = JSON.parse($(this).data('item-data'));
		if ($('body').hasClass('editing')) {
			$('#add-graph-select').data('value', graphData.code);
			$('#add-graph-modal').data('item-id', $(this).data('id'));
			$('#add-graph-modal').modal('show');      
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
      dir: "rtl",
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

  $('#add-info-square-modal').on('hidden.bs.modal', function() {
    $(this).data('item-id', null);
    $('#add-info-square-select').data('value', null);   		
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
      // new item
      if (!$('#add-info-square-modal').data('item-id')) {      
        addDataCube(obj);
      }
      // edit item
      else {
        obj.id = $('#add-info-square-modal').data('item-id');
        var elem = $(`[data-id=${obj.id}]`);
        $(elem).find('.title').text(obj.TXT);
        $(elem).find('.sum span:not(.sign)').text(obj.VAL);
        $(elem).data('item-data', JSON.stringify(obj));
        updateDataCubeValue(obj);
      }
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
        // not supported graph types
        if (['bar', 'pie', 'table', 'gauge'].indexOf(graphData.type) < 0) {
          var error = 'סוג גרף זה לא נתמך.';
          $('#add-graph-modal .add-graph-error').text(error).fadeIn();
          return;
        }
				// check data validity
				if (graphData.type === 'table' && (!graphData.cols || graphData.cols.length === 0)) {
					this.error({});
					return;
				}
        obj.data = graphData;
        // new graph
        if (!$('#add-graph-modal').data('item-id')) {
          addGraph(obj);
        }
        // edit graph
        else {
          obj.id = $('#add-graph-modal').data('item-id');
          var elem = $(`[data-id=${obj.id}]`);
				  $(elem).data('item-data', JSON.stringify(obj));
        }
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

  $('#add-graph-modal').on('shown.bs.modal', function() {
		$('#add-graph-select').select2({
      data: allGraphsOptions,
      dir: "rtl",
			dropdownParent: $('#add-graph-modal'),
			placeholder: "בחר גרף",
			templateResult: (opt) => {
				return $(`<label class="graph-option-label"><i class="fa fa-${ getGraphIcon(opt.type) }"></i> ${ opt.text } [${ hebrewPeriods[opt.period] }]</label>`);
			},
			templateSelection: (opt) => {
				return $(`<label class="graph-option-label"><i class="fa fa-${ getGraphIcon(opt.type) }"></i> ${ opt.text } [${ hebrewPeriods[opt.period] }]</label>`);
			},
    });
    if ($('#add-graph-select').data('value')) {
			$('#add-graph-select').val($('#add-graph-select').data('value'))
                            .trigger('change');
		}
	});

	$('#add-graph-modal').on('hidden.bs.modal', function() {
    $(this).find('.add-graph-error').hide();
    $(this).data('item-id', null);
    $('#add-graph-select').data('value', null);
  });

	$('#add-graph-modal').on('change', '#add-graph-select', function() {
		$('#add-graph-modal').find('.add-graph-error').hide();
	});

  //#endregion add & edit graph

  $('#last-docs-section > ul').on('click', '.last-doc.list-item', function() {
    var docData = JSON.parse($(this).data('doc-data'));
    // runApp
    var apm = docData.AP + ':';
    var uci = docData.SYS;
    var cy = docData.CY;
    var pmDataArr = [];
    docData.PM.forEach(pm => {
      pm.VAC.forEach(vac => {
        var mask = vac.mask ? '~' + vac.mask : '';
        pmDataArr.push(`${vac.name}=${vac.value}${mask}`);
      });
    });
    var pmString = pmDataArr.join('&');
    runApp(apm, uci, cy, '', pmString);
  });

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

// function _addItem(width, height, type, id, x, y) {
//   if (!id) {
//     if ($('#items-container .grid-stack-item').length === 0) {
//       id = 1;
//     }
//     else {
//       var ids = $('#items-container .grid-stack-item').map((i,o) => $(o).data('id'));
//       id = Math.max.apply(0, ids) + 1;
//     }
//   }
//   var template = `<div class="grid-stack-item item-${type}" data-id="${id}" data-item-type="${type}" data-gs-x="${x}" data-gs-y="${y}" data-gs-width="${width}" data-gs-height="${height}">
//                     <div class="grid-stack-item-content">
//                       <a class="remove-item" href="javascript:;">X</a>
//                       <h3>${id}</h3>
//                     </div>
//                   </div>`;
//   var hasPosition = x != null && y != null;                
//   var widget = gridStackObj.addWidget(htmlToElement(template), x, y, width, height, !hasPosition);
// }

function addShortcut(data) {
  addItem(1, 1, 'shortcut', data);
}

function addDataCube(data) {
  addItem(2, 1, 'data-cube', data);
}

function addGraph(data) {
  addItem(data.data.chartSize === 'large' ? 3 : 2, 2, 'graph', data);
  // bootstrapTable
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
      data: JSON.parse($(o).data('item-data'))
    };
    // removing actual value (data cube & graph)
    if (item.type === 'graph') {
      item.data.data = undefined;
    }
    else if (item.type === 'data-cube') { 
      item.data.VAL = undefined;
    }
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
      addItem(item.width, item.height, item.type, item.data, item.id, item.x, item.y);
    }
    else if (item.type === 'data-cube') {
      getInfoSquareData(item, (value) => {
        if (item.data) {
          item.data = item.data;
          item.data.VAL = value;
        }
        // addItem(itemWithData.width, itemWithData.height, itemWithData.type, itemWithData.data ? JSON.parse(itemWithData.data) : null, itemWithData.id, itemWithData.x, itemWithData.y);
        addItem(item.width, item.height, item.type, item.data, item.id, item.x, item.y);
      });
    }
    else if (item.type === 'graph') {
      // item.data = JSON.parse(item.data);
      addItem(item.width, item.height, item.type, item.data, item.id, item.x, item.y);
      // renderGraphData(item.data);
      getGrpahData(item.data, function(graphWithData) {
        renderGraphData(graphWithData);
      });
    }
  });
}

function cancelEditing() {
  $('body').removeClass('editing');
  gridStackObj.setStatic(true);
}

function updateDataCubeValue(elem, value) {
  $(elem).find('.sum span:not(.sign)').text(value);
}
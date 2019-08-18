/* http://gridstackjs.com/ */

var gridStackObj;
var itemsData;

$(function () {
  var options = {
      cellHeight: 'auto',
      disableDrag: true,
      disableResize: true,
      // verticalMargin: 10
  };
  $('.grid-stack').gridstack(options);
  gridStackObj = $('.grid-stack').data('gridstack');

  itemsData = localStorage.getItem('itemsData');
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
        addGraph();
        break;    
      default:
        break;
    }
  });

  $('#items-container').on('click', '.remove-item', function(event) {
    var elem = $(this).closest('.grid-stack-item');
    $(elem).fadeOut(function(){
      gridStackObj.removeWidget(elem);
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
  // data-gs-x="${x}" data-gs-y="${y}" data-gs-width="${width}" data-gs-height="${height}"
  var template = getItemTemplate(type, id, dataObj);
  // var template = `<div class="grid-stack-item item-${type}" data-id="${id}" data-item-type="${type}">
  //                   <div class="grid-stack-item-content">
  //                     <a class="remove-item" href="javascript:;">X</a>
  //                     <span class="shortcut-text">${dataObj ? dataObj.TXT : id}</span>
  //                   </div>
  //                 </div>`;
  var elem = htmlToElement(template);
  if (dataObj) {
    $(elem).data('item-data', JSON.stringify(dataObj));
    // setTemplateFields(elem, dataObj);
  }
  var hasPosition = x != null && y != null;                
  gridStackObj.addWidget(elem, x, y, width, height, !hasPosition);
  gridStackObj.movable(elem, $('body').hasClass('editing'));
  gridStackObj.resizable(elem, $('body').hasClass('editing'));
}

function getItemTemplate(type, id, itemData) {
  var template;
  switch (type) {
    case 'shortcut':
      template = `<div class="grid-stack-item item-${type}" data-id="${id}" data-item-type="${type}">
                    <div class="grid-stack-item-content">
                      <a class="remove-item" href="javascript:;">X</a>
                      <span class="shortcut-text">${itemData ? itemData.TXT : id}</span>
                    </div>
                  </div>`;
      break;  
  }
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
  // _addItem(1, 1, 'shortcut');
}

function addDataCube() {
  _addItem(2, 1, 'data-cube');
}

function addGraph() {
  _addItem(2, 2, 'graph');
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
  itemsData.forEach(item => {
    if (item.type === 'shortcut') {
      addItem(item.width, item.height, item.type, item.data ? JSON.parse(item.data) : null, item.id, item.x, item.y);
    }
    else {
      _addItem(item.width, item.height, item.type, item.id, item.x, item.y);
    }
  });
}

function cancelEditing() {
  $('body').removeClass('editing');
  gridStackObj.movable('.grid-stack-item', false);
  gridStackObj.resizable('.grid-stack-item', false);
}

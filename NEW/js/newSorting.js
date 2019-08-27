/* http://gridstackjs.com/ */

var gridStackObj;
// var itemsData;

$(function () {
  var options = {
      cellHeight: 'auto',
      disableDrag: true,
      disableResize: true,
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
  }  
  var template = `<div class="grid-stack-item item-${type}" data-id="${id}" data-item-type="${type}">
                    <div class="grid-stack-item-content">
                      <a class="remove-item" href="javascript:;">X</a>
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
  // _addItem(1, 1, 'shortcut');
}

function addDataCube(data) {
  addItem(2, 1, 'data-cube', data);
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

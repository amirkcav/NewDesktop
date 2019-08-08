/* http://gridstackjs.com/ */

var gridObj;

$(function () {
  var options = {
      cellHeight: 'auto',
      // verticalMargin: 10
  };
  $('.grid-stack').gridstack(options);
  gridObj = $('.grid-stack').data('gridstack');

  var itemsData = localStorage.getItem('itemsData');
  if (itemsData) {
    itemsData = JSON.parse(itemsData);
    itemsData.forEach(item => {
      addItem(item.width, item.height, item.type, item.id, item.x, item.y);
    });
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

  $('#items-container').on('click', '.remove-item', function() {
    var elem = $(this).closest('.grid-stack-item');
    $(elem).fadeOut(function(){
      gridObj.removeWidget(elem);
    });
  });

  $('#save-button').click(function() {
    var itemsData = serializeItems();
    localStorage.setItem('itemsData', JSON.stringify(itemsData));
  });

  $('#delete-all-button').click(function() {
    $('#items-container .grid-stack-item').each((i, o) => {
      gridObj.removeWidget(o);
    });
    localStorage.removeItem('itemsData');
  });

});

function addItem(width, height, type, id, x, y) {
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
  gridObj.addWidget(htmlToElement(template), x, y, width, height, !hasPosition);
}

function addShortcut() {
  addItem(1, 1, 'shortcut');
}

function addDataCube() {
  addItem(2, 1, 'data-cube');
}

function addGraph() {
  addItem(2, 2, 'graph');
}

function htmlToElement(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  // Change this to div.childNodes to support multiple top-level nodes
  return div.firstChild; 
}

function serializeItems() {
  var items = [];
  $('#items-container .grid-stack-item').each((i, o) => {
    var item = {
      type: $(o).data('item-type'),
      id: $(o).data('id'),
      x: $(o).data('gs-x'),
      y: $(o).data('gs-y'),
      width: $(o).data('gs-width'),
      height: $(o).data('gs-height')
    };
    items.push(item);
  });
  return items;
}

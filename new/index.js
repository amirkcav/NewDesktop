var container;
var containerRect;

$(function() {

  initUI();  

  $('#reset-button').click(function() {
    localStorage.removeItem( 'itemsShiftPositions');
  });

  $('.add-item-button').click(function() {
    var type = $(this).data('type');
    addItem(type, null, true);    
  });

  $('#items-container').on('click', '.remove-item', function() {
    // $(this).closest('.item').remove();
    container.packery('remove', $(this).closest('.item')[0])
             .packery('shiftLayout');
    savePositions();
  });

});

function initUI() {
  var itemPositions = localStorage.getItem( 'itemsShiftPositions' );

  if (itemPositions) {
    $('#items-container').html('');
    // add items
    JSON.parse(itemPositions).forEach(i => {
      addItem(i.type, i.id, false);
    });
  }
  
  container = $('#items-container').packery({
    itemSelector: '.item',
    columnWidth: 150,
    initLayout: false,
    percentPosition: true,
    resizeContainer: true,
    // isResizeBound: false,
    // horizontal: true,
    // rowHeight: 200
  });

  // make all items draggable
  var $items = $('#items-container').find('.item').draggable({
    containment: "parent",
    snap: true
  });

  setItemsPositions();  

  // bind drag events to Packery
  container.packery( 'bindUIDraggableEvents', $items );
  // container.on( 'layoutComplete', orderItems );
  container.on( 'dragItemPositioned', orderItems );
  
}

function addItem(type, id, initPlugins) {
  if (!id) {
    if ($('#items-container .item').length === 0) {
      id = 1;
    }
    else {
      var ids = $('#items-container .item').map((i,o) => $(o).data('item-id'));
      id = Math.max.apply(0, ids) + 1;
    }
  }
  // var lastItemId = $('#items-container .item').length ? $('#items-container .item').last().data('item-id') : 0;
  var newElem = createElementFromHTML(`<div data-item-id="${id}" class="item item-${type}" data-type="${type}">  
                                         <a class="remove-item" href="javascript:;">x</a>
                                         <span class="item-text">${id}</span>
                                       </div>`);
  $('#items-container').append(newElem);
  if (initPlugins) {
    container.packery('appended', [newElem]);
    $(newElem).draggable({
      containment: "parent",
      snap: true
    });
    container.packery('bindUIDraggableEvents', $(newElem));
  }
}

// show item order after layout
function orderItems() {
  // var itemElems = $(this).packery('getItemElements');
  // $( itemElems ).each( function( i, itemElem ) {
  //   $( itemElem ).text( i + 1 );
  // });

  savePositions();
  //Packery.data(container[0]).items

   // save drag positions
  //  var positions = $(this).packery( 'getShiftPositions', 'data-item-id' );
  //  localStorage.setItem( 'dragPositions', JSON.stringify( itemElems ) );
}

function savePositions() {
  var positions = getItemsShiftPositions();
  localStorage.setItem( 'itemsShiftPositions', JSON.stringify( positions ) );
}

function getItemsShiftPositions() {
  return Packery.data(container[0]).items.map( function( item ) {
    return {
      id: item.element.getAttribute('data-item-id'),
      x: item.rect.x / Packery.data(container[0]).packer.width,
      y: item.position.y,
      type: item.element.getAttribute('data-type')
    }
  });
}

function setItemsPositions() {
  // from https://github.com/metafizzy/packery/blob/master/sandbox/save-positions.html
  var itemPositions = localStorage.getItem( 'itemsShiftPositions' );
  if ( itemPositions ) {
    itemPositions = JSON.parse( itemPositions );
    Packery.data(container[0])._resetLayout();
    // set item order and horizontal position from saved positions
    Packery.data(container[0]).items = itemPositions.map( function( itemPosition ) {
      var itemElem = container.find('[data-item-id="' + itemPosition.id  + '"]');
      var item = Packery.data(container[0]).getItem( itemElem[0] );
      item.rect.x = parseFloat( itemPosition.x ) * Packery.data(container[0]).packer.width;
      item.rect.y = itemPosition.y;
      item.position.y = itemPosition.y;
      return item;
    });
    Packery.data(container[0]).shiftLayout();
  } else {
    // if no initial positions, run packery layout
    Packery.data(container[0]).layout();
  }
}

// function validateMoves(queue) {
//   var valid = true;
//   queue.forEach( function( obj, i ) { 
//     valid = valid && containerRect.contains(obj);
//   });
//   return valid;
// }

function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes
  return div.firstChild; 
}
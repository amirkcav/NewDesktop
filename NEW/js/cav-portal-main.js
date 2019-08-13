var rlink = "";
var jsonObj = {};
var tabsList = [];
var linksButtons = {};
var chartsData = {};
var lastUpdated = {};
var loadedTabs = {};
var currentMR = "";
var MRL = [];

var currentTab;
var optionIdCounter = 1;

var map;
var markersInfo = [];
var mapMarkers  = [];
var mapCrumbs = [];
var crumbsInfo  = [];
var agentCrumbs = [];

var filterDate = {};
var filtersData = [];
var selectedFilters = [];

var stackZoomData=[];
var possibleFilters = [0,1,2,3,4,5];
var zoomOptionsList;

$(document).ready(function() {
//	$(".defPage").hide();
//
//	getUserData();
//
//	updateTooltipTime();
//	setInterval("updateTooltipTime()",2000);
//
//	$("#zoomDialog").fancybox({
//		'centerOnScroll'	: false,
//		'hideOnOverlayClick' : false,
//		'transitionIn'	: 'elastic',
//		'transitionOut'	: 'none',
//		'onClosed' : function() { stackZoomData=[]; },
//		onComplete: function() {
//	        $(document).scrollTop(0);
//	    },
//
//	});
});

/*
 * Initializing map
 */
function initialize() {
	var myOptions = {
        zoom: 8,
      	center: new google.maps.LatLng(32.068029,34.782028),
      	mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById('chartBox_1'), myOptions);
}

function animateCircle() {
    var count = 0;
    offsetId = window.setInterval(function() {
      count = (count + 1) % 200;

      var icons = line.get('icons');
      icons[0].offset = (count / 2) + '%';
      line.set('icons', icons);
  }, 20);
}

/*
 * Check and update each X seconds the time (in minutes) that passed from the
 * last update of this chart. Update the time in the tooltip above the
 * reload-button.
 */
function updateTooltipTime(){
	// all times are in MS (mili-seconds)
	var currentTime = new Date();
	var diffInMS;
	var diffInMin;
	$.each(lastUpdated, function(boxNumber, updateTimeInMS){
		diffInMS = currentTime.getTime() - updateTimeInMS;
		diffInMin = (diffInMS / 60000);
		diffInMin = Math.floor(diffInMin);

		$("#toolTipTime_" + boxNumber).html(diffInMin);
	});
}

/*
 * Get general data to display on the page. Also get tabs' data per user
 */
function getUserData() {

	var url = "mcall?_ROUTINE=JBIGRF&_NS=CAV&_LABEL=LOGIN";
	$.ajax({
		type : 'POST',
		url : url,
		data : JSON.stringify(jsonObj),
		contentType : 'application/json',
		dataType : 'json',
		success : function(data) {

			setGenData(data);

			user_lang = data.lang;
			addcss("style_" +  user_lang);
			setLanguage();

			$.datepicker.setDefaults( $.datepicker.regional[ "" ] );
			if (user_lang == "HB"){	$.datepicker.setDefaults( $.datepicker.regional[ "he" ] );}
		}
	});

}

function addcss(cssId){
	var $ = document; // shortcut
	if (!$.getElementById(cssId))
	{
	    var head  = $.getElementsByTagName('head')[0];
	    var link  = $.createElement('link');
	    link.id   = cssId;
	    link.rel  = 'stylesheet';
	    link.type = 'text/css';
	    link.href = 'css/' + cssId +'.css';
	    link.media = 'all';
	    head.appendChild(link);
	}
}

function setLanguage() {
	$(function(){
		$.jsperanto.init(function(t){
			$("[i18n='yes']").each(function(){
	    		$(this).text($.t($(this).attr("trnsCode")));
	    		if ($(this).attr("hinttext") != undefined ){
	    			$(this).attr("hinttext",$.t($(this).attr("trnsCode")));
	    			$(this).attr("value",$.t($(this).attr("trnsCode")));
	    		}
	    		if ($(this).attr("placeHolder") != undefined ){
	    			$(this).attr("placeHolder",$.t($(this).attr("trnsCode")));

	    		}
	    		if ($(this).attr("placeholder") != undefined ){
	    			$(this).watermark($.t($(this).attr("trnsCode")));
	    		}
	    	});
		   }, {lang:user_lang});
	});
}

/*
 * Get the data of this user from the server and set the page according to it.
 * Including name, date & time, list of the tabs and for each tab, its charts...
 */
function setGenData(obj){
	$("#userNameHeader").html(obj.userName);
	$("#dayInWeekHeader").html(obj.dayInWeek);
	$("#dateHeader").html(obj.date);
	$("#timeHeader").html(obj.time);

	if(obj.MRL){
		MRL = obj.MRL.split("_");
		currentMR = obj.MRL;
		MRL.unshift(currentMR);
		var MRsListStr = '<ul class="clearfix">';

		$.each(MRL, function(Index, MR){
			if(Index == 0){
				MRsListStr += '<li class="mrCell mr_selected" MRId="' + Index + '"><a href="javascript:void(0)" title=""><span i18n="yes" trnsCode="all_MR">'
				+ "All" + '</span></a></li>';
			}else{
				MRsListStr += '<li class="mrCell" MRId="' + Index + '"><a href="javascript:void(0)" title="';
				if(obj.MRLN){
					MRsListStr +=obj.MRLN.split("_")[Index-1];
				}
				MRsListStr +='"><span>'+ MR + '</span></a></li>';
			}
		});

		MRsListStr += '</ul>';
		$("#tabsList").html(MRsListStr);
		$(".mrCell").click(function() {
			var MrId = $(this).attr("MRId");
			resetTab(MrId);
		});

	}

	if(obj.showDef){
		$(".defPage").show();
	}

	// $("#companyLogo").attr("src",obj.companyLogo);

	// building tabs:
	tabsList = obj.tabs;
	var tabsListStr = '<ul class="clearfix tabs">';
	$.each(tabsList, function(tabIndex, tab){
		tabsListStr += '<li class="tabCell" tabId="' + tabIndex + '"><a href="javascript:void(0)" title=""><span>'
		+ tab.name + '</span></a></li>';

		/*********************************************************
		 * Setting filters' data
		 *********************************************************/
		var tabFilters = tab.filter;
		filtersData[tabIndex] = {};
		selectedFilters[tabIndex] = {};
		if(tabFilters != null){
			$.each(tabFilters, function(filterIndex, filter){

				var filterObj = {};
				filterObj.code = filter.filterCode;
				filterObj.name = filter.filterName;
				filterObj.number = filter.filterNumber;
				filterObj.noMultiple = filter.noMultiple;

				if(filter.data != null){
					var data = {};
					var valuesArray = [];

					//the first index of the array has an empty
					//value which means "nothing was filtered here":
					valuesArray.push( { valueKey: '', value: filter.filterName, filterCode: filter.filterCode }   );

					$.each(filter.data, function(dataIndex, dataObj){
						data[dataObj.valueName] = dataObj.value;
						valuesArray.push( { valueKey: dataObj.value, value: dataObj.valueName, filterCode: filter.filterCode }   );
					});
					filterObj.data = data;
					filterObj.valuesArray = valuesArray;
				}

				filtersData[tabIndex][filterIndex] = filterObj;
			});
		}
		/*********************************************************
		 *********************************************************/
	});
	tabsListStr += '</ul>';
	$("#tabsList").append(tabsListStr);
	selectTab(0);

	$(".tabCell").click(function() {
		var tabId = $(this).attr("tabId");
		selectTab(tabId);
	});
}
/*
 * Reset the tab after change MR: set its background color, all its charts, etc.
 */
function resetTab(MRId){

	var selectedMR = $(".mrCell[MRId=" + MRId + "]");

	$(".mr_selected").removeClass("mr_selected");
	selectedMR.addClass("mr_selected");
	currentMR = MRL[MRId];
	mrChange = true;
	drawTabFilters(currentTab);
	$(".refreshBtn").trigger("click");

	setTimeout(function() {
		//setMapDatepicker();
		for (x in possibleFilters){
			//x is the index in this tab's array of filters
			if (filtersData[currentTab][x] == undefined) {
				return;
			}
			if (filtersData[currentTab][x].type == "datepicker"){
				setDatepicker(currentTab,x);
			}
			if (filtersData[currentTab][x].type == "datepickerMonth"){
				setDatepickerMonth(currentTab,x);
			}
		}
	}, 2000);
}


/*
 * Select one of the tabs: set its background color, all its charts, etc.
 */
function selectTab(tabId){
	var selectedTab = $(".tabCell[tabId=" + tabId + "]");
	if(selectedTab.hasClass("tab_selected")) {
		return;
	}
	removeAllSaveChartData();
	$(".tab_selected").removeClass("tab_selected");
	selectedTab.addClass("tab_selected");
	currentTab = tabId;
	setTabFilters(tabId);
	setTabCharts(tabId);
	drawTabFilters(tabId);
	if(currentMR != ""){
		$(".refreshBtn").trigger("click");
	}

	setTimeout(function() {
		//setMapDatepicker();
		for (x in possibleFilters){
			//x is the index in this tab's array of filters
			if (filtersData[currentTab][x] == undefined) {
				return;
			}
			if (filtersData[currentTab][x].type == "datepicker"){
				setDatepicker(currentTab,x);
			}
			if (filtersData[currentTab][x].type == "datepickerMonth"){
				setDatepickerMonth(currentTab,x);
			}
		}
	}, 2000);
}

function setTabFilters(tabId){

	if (loadedTabs[tabId] == true){
		return;
	}
	for (x in possibleFilters){
		//x is the index in this tab's array of filters
		if (filtersData[tabId][x] == undefined) {
			return;
		}
		getFilterData(filtersData[tabId][x].number,tabId,x);
	}

}
/*
 * Load the designed page of charts according to this tab definitions. Load each
 * one of the charts and put it in its place (<div>);
 */
function setTabCharts(tabId){
	// load all this tab's charts (together) only on the first time.
	if (loadedTabs[tabId] == null){
		var noAjax = false;
		chartsData[tabId] = {};
	}
	if (loadedTabs[tabId] == true){
		noAjax = true;
	}

	var design = tabsList[tabId].design;
	var jqxhr = $.get("tabs/" + design + ".html", function() {
		$("#tabInner").html(jqxhr.responseText);

	});


	setTimeout(function() {
		// wait till the tab's content be loaded

		$("#tabSubTitle").html(tabsList[tabId].title);
		$(".DividerText").html(tabsList[tabId].divider);

		if(design == "map"){
			setMapData();
		} else {
			$.each(tabsList[tabId].charts, function(boxNumber, chartObj){
				chkChartData(boxNumber,tabId,null,noAjax);
			});
		}
	}, 500);

	loadedTabs[tabId] = true;
}

/*
 * Load the the relevant filters (one or two) and their
 * values and put them in this tab's filter <div> ()
 */
function drawTabFilters(tabId){
	var filtersListString = '';
	var filtersDiv = '';
	for (x in possibleFilters){
		//x is the index in this tab's array of filters
		if (filtersData[tabId][x] != undefined){
			filterObj = filtersData[tabId][x];
			var filterId = "filter_" + tabId + "_" + x;  //i.e. "filter_1_0"
			var liClass = "filter";
			var classLine = (x == 4 ? " left" : "");
			classLine += (x > 3 ? " top" : "");
			filtersData[tabId][x].type="";
			if ((filterObj.code).indexOf("DAT") != -1){
				liClass = "datepicker";
				filtersData[tabId][x].type="datepicker";
			}
			if ((filterObj.code).indexOf("MONTH") != -1){
				liClass = "datepickerMonth";
				filtersData[tabId][x].type="datepickerMonth";
			}

			filtersListString += '<li class="' + liClass + classLine +'">'
			if (liClass == "datepicker" || liClass == "datepickerMonth"){
				filtersListString += '<input type="text" id="filter_' + x + '" value="' + filterObj.name + '" filterOnTab="' + x +
				'" class="text cleanInput  filterField ';
			} else{
				filtersListString += '<select id="filter_' + x + '" value="" filterOnTab="' + x + '" class="text cleanInput filterField ';
			}

			$(".DateDB"+x).attr("id","");
			$(".DateDB"+x).val("");
			if (filterDate[tabId] == undefined){
				filterDate[tabId]=[];
			}
			if (liClass == "datepicker") {
				filtersListString += 'DatepickerField' + tabId + x;
				$(".DateDB"+x).attr("id","DateDBFormat" + tabId + x);
				if (filterDate[tabId][x] != undefined){
					$(".DateDB"+x).val(filterDate[tabId][x].code);
				}

			}
			if (liClass == "datepickerMonth") {
				filtersListString += 'DatepickerField' + tabId + x;
				$(".MonthDB"+x).attr("id","MonthDBFormat" + tabId + x);
				if (filterDate[tabId][x] != undefined){
					$(".MonthDB"+x).val(filterDate[tabId][x].code);
				}

			}

			if (liClass == "datepicker" || liClass == "datepickerMonth") {
				filtersListString += '" spellcheck="false"/><input type="button" id="DatepickerBtn' + tabId + x;
				filtersListString += '"  class="button filterButtonShowAll" filterId="filter_' + x + '" /></li>'
			} else{
				filtersListString += '" multiple="multiple"></select></li>'
			}

		}
	}
	if (filtersListString != ''){
		//if there is at least one filter to show under this tab:
		filtersDiv += '<ul><li><a id="refreshAllByFilter" href="javascript:void(0)" class="iconBtn L" ><span class="iconReplace"></span></a></li>'
			+ filtersListString + '</ul>';
	}
	setTimeout(function() {
		$("#filterDivID").html(filtersDiv);

		//set default (pre-selected) value, if there is:  // TODO !!!!!
		for (x in possibleFilters){
			if (filtersData[tabId][x] != undefined){
				if (filtersData[tabId][x].selectedValue != undefined){
					$("#filter_" + x).val(filtersData[tabId][x].selectedValue);
				} else {
//					$("#filter_" + x).val(filtersData[tabId][x].name);
					filtersData[tabId][x].selectedValue=filtersData[tabId][x].name;
				}
			}
			if (filterDate[tabId] != undefined && filterDate[tabId][x] != undefined){
				$("#filter_" + x).val(filterDate[tabId][x].name);
			}
		}

		//when click on the "refresh" button of the filters,
		//we trigger the refresh of all the charts on page.
		$("#refreshAllByFilter").click(function(){
			var design = tabsList[currentTab].design;
			if(design == "map"){
				setMapData();
			} else {
				$(".refreshBtn").trigger("click");
			}
		});


		//when click the down-arrow to "open" all the select-box possibilities
		$(".filterButtonShowAll").click(function(){
			var filterId = $(this).attr("filterId");

			$("#"+filterId).autocomplete( "option", "minLength", 0 );
			$("#"+filterId).val("");
			//force to open the select values:
			$("#"+filterId).autocomplete('search');
			$("#"+filterId).select();

			$("#"+filterId).autocomplete( "option", "minLength", 1 );

		});

		$(".filterField").blur(function(){
			var x = $(this).attr("filterOnTab");
			if (filtersData[currentTab][x].type == "datepicker" || filtersData[currentTab][x].type == "datepickerMonth"){
				//$(this).val($("#DateDBFormat" + currentTab + x).val());
				return;
			} else {
				$(this).val(filtersData[currentTab][x].selectedValue);
			}
		});

		for (x in possibleFilters){
			if (filtersData[tabId][x] != undefined){
				if (filtersData[tabId][x].valuesArray != undefined){
					setFilterValues(tabId,x);
				}
			}
		}
	}, 500);
}
/*
 * add the values to the auto-complete field
*/
function setFilterValues(tabId,index,selected){

	var multipleFilter = (filtersData[tabId][index].noMultiple?false:true)
	var filterName = filtersData[tabId][index].name.replace($.t("all_a"),$.t("choose_a")).replace($.t("all"),$.t("choose"));
	var numCheckedText, numChecked=0;
	$.each(filtersData[tabId][index].valuesArray, function(i, filterIndex) {
		if (multipleFilter && i == 0){return;}
		opt = $('<option />', {
				value: filterIndex.valueKey,
				text: filterIndex.value,
				filterCode:filterIndex.filterCode,
				filterValueIndex: i
		});

		if (filterIndex.selectedValue){
			 opt.attr('selected','selected');
			 numChecked += 1;
			 if (numChecked == 1){numCheckedText = filterIndex.value;}
		}
		opt.appendTo("#filter_" + index);
	});

	$("#filter_" + index).multiselect({
		selectedList: 1,
		multiple: multipleFilter,
		selectedText: function(numChecked, numTotal, checkedItems){
		    var filterId = $(checkedItems).attr("id").split("-")[2];
		    var opt = $("#" + filterId + ' option[value="' + $(checkedItems).val() +'"]');
			if (numChecked == 1){
				return $(opt).text();
		      }
			var filterNumber = $("#" + filterId).attr("filterOnTab");
			var filterName = filtersData[tabId][filterNumber].name.replace($.t("all_a")," ").replace($.t("all")," ");
			return  $.t("selected") + " " + numChecked + " " + filterName;
		},
		close: function(){
			var filterId = $(this).attr("id")
			var filterNumber = $("#" + filterId).attr("filterOnTab");
			var filterCode = filtersData[tabId][filterNumber].code;

			if (selectedFilters[tabId][filterCode]){return;}

			var filterName = filtersData[tabId][filterNumber].name.replace($.t("all_a"),$.t("choose_a")).replace($.t("all"),$.t("choose"));
			var filterButtonName = $("#" + filterId).parent().find("span")[1];
			$(filterButtonName).text(filterName);
		},
		click: function(event, ui){
			//when select filter value, we save the selected value
			//of this filter both under the selectedFilters object,
		    //and in the filter itself.
			//we use the following .selectedValue to set a default
		    //value in the text field when re-loading the tab
			var filterNumber = $(this).attr("filterOnTab");
			var opt = $("#" + $(this).attr("id") + ' option[value="' + ui.value +'"]');

			if(filtersData[tabId][filterNumber].noMultiple){
				var lastVal = selectedFilters[tabId][opt.attr("filtercode")];
				selectedFilters[tabId][opt.attr("filtercode")] = ui.value;
				filtersData[tabId][filterNumber].valuesArray[opt.attr("filterValueIndex")].selectedValue = true;
				if(lastVal != undefined){
					var opt = $("#" + $(this).attr("id") + ' option[value="' + lastVal +'"]');
					filtersData[tabId][filterNumber].valuesArray[opt.attr("filterValueIndex")].selectedValue = false;
				}
				return;
			}

			if (ui.checked){
		    	  if (!selectedFilters[tabId][opt.attr("filtercode")]){ selectedFilters[tabId][opt.attr("filtercode")] = "";}
				  selectedFilters[tabId][opt.attr("filtercode")] += ui.value + ",";  //(selectedFilters[tabId][opt.attr("filtercode")] ? "," + ui.value:ui.value);
		    	  filtersData[tabId][filterNumber].valuesArray[opt.attr("filterValueIndex")].selectedValue = true;
		      } else{
		    	  selectedFilters[tabId][opt.attr("filtercode")] = selectedFilters[tabId][opt.attr("filtercode")].replace(ui.value + ",","");
		    	  if (selectedFilters[tabId][opt.attr("filtercode")] == ","){selectedFilters[tabId][opt.attr("filtercode")]="";}
		    	  filtersData[tabId][filterNumber].valuesArray[opt.attr("filterValueIndex")].selectedValue = false;
		      }
		   },
		   checkAll: function(){
			    var filterNumber = $(this).attr("filterOnTab");
			    var filterCode = filtersData[tabId][filterNumber].code;
			    var valuesArray = filtersData[tabId][filterNumber].valuesArray

			    selectedFilters[tabId][filterCode] = "";
			    for(i=1;i<valuesArray.length;i++){
			    	selectedFilters[tabId][filterCode] += valuesArray[i].valueKey + ",";
			    	valuesArray[i].selectedValue = true;
			    }
		   },
		   uncheckAll: function(){
			    var filterNumber = $(this).attr("filterOnTab");
			    var filterCode = filtersData[tabId][filterNumber].code;
			     var valuesArray = filtersData[tabId][filterNumber].valuesArray

			    selectedFilters[tabId][filterCode] = "";
			    for(i=1;i<valuesArray.length;i++){
			    	valuesArray[i].selectedValue = false;
			    }
		   }
	}).multiselectfilter({
		label: $.t("filter"),
		placeholder: $.t("enter_filter")
	});

	 if (numChecked > 1){
		 filterName = filtersData[tabId][index].name.replace($.t("all_a")," ").replace($.t("all")," ");
		 filterName = $.t("selected") + " " + numChecked + " " + filterName;
	 }
	 if (numChecked == 1){
		 filterName = numCheckedText;
	 }

	var filterButtonName = $("#filter_" + index).parent().find("span")[1];
	$(filterButtonName).text(filterName);

}
/*
 * Check for which chart/box we need to load the data for. Then, we call the
 * data-loader-function
 */
function chkChartData(boxNumber, tabId, params, noAjax){
	$("#chartBox_" + boxNumber).html("");

	if (tabId == null) {
		tabId = currentTab;
	}

	if (chartsData[currentTab][boxNumber] == undefined){
		noAjax = false;
	}

	var chartCode = tabsList[tabId].charts[boxNumber]["chartCode"];
	var boxInternalStr = getBoxInternalString(boxNumber);
	$("#chartBox_" + boxNumber).html(boxInternalStr);

	setBoxClickHandler(boxNumber);

	// get the chart's data from the server and draw it on screen:
	getChartData(chartCode, boxNumber, params, noAjax, tabId);

	// set the height and width of the options-popup:
	setTimeout(function() {
		// get max column Height for each popup
	    $(".columnHeight").each(function() {
	        $(this).find('.columnHeight_inner').css("height", $(this).height() - 14);
	    });
	    // get max column width for each popup
	    $(".columnWidth").each(function() {
	        $(this).find('.columnWidth_inner').css("width", $(this).width() - 14);
	    });
	}, 2000);
}

/*
 * set "click" event handlers of the boxes in the tab.
 * @param boxNumber  some of the events are specific to a box
 */
function setBoxClickHandler(boxNumber, action){

	//remove the handlers from the buttons
	//to avoid double-handlers on the buttons
	//=======================================
	$(".refreshBtn").off( "click");
	$(".prevBtn").off( "click");
	$(".nextBtn").off( "click");
	$(".chartTableBtn").off( "click");
	$(".exelBtn").off( "click");
	$(".optionsBtn").off( "click");
	$('.closePop').off( "click");


	//add the event handlers
	//======================
	$(".refreshBtn").click(function(){
		var boxNumber = $(this).attr("boxNumber");
		removeSaveChartData(boxNumber);
		chkChartData(boxNumber);
		/*
		var design = tabsList[currentTab].design;
		if(design == "map"){
			setMapData();
		} else {
			chkChartData($(this).attr("boxNumber"));
		}
		*/
	});

	$(".boxPopup").hide();
	$(".prevBtn").click(function(){
		callPrevNextButton($(this).attr("boxNumber"), "prev");
	});
	$(".nextBtn").click(function(){
		callPrevNextButton($(this).attr("boxNumber"), "next");
	});

	$(".chartTableBtn").click(function(){
		if ($(this).hasClass("iconBtn_disable")){
			return;
		}

		var mode = $(this).attr("modeView");
		var boxNumber = $(this).attr("boxNumber");
		if(mode == "chart") {
			$("#viewIcon_" + boxNumber).removeClass("iconTable");
			$("#viewIcon_" + boxNumber).addClass("iconChart");
			$(this).attr("modeView","table");
			chartToTable(boxNumber);
		} else if (mode == "table") {
			$("#viewIcon_" + boxNumber).removeClass("iconChart");
			$("#viewIcon_" + boxNumber).addClass("iconTable");
			$(this).attr("modeView","chart");
			tableToChart(boxNumber);
		}
	});

	$(".exelBtn").click(function(){
		if ($(this).hasClass("iconBtn_disable")){
			return;
		}
		var boxNumber = $(this).attr("boxNumber");
		chartToExel(boxNumber);
	});

	$(".optionsBtn").click(function() {
		closeAllOptionPopups();
		if ($(this).attr("class").indexOf("iconBtn_disable") != -1){
			return;
		}
        $(this).closest(".boxMid").find(".boxPopup").show();
    });

    $('.closePop').click(function() {
    	closeAllOptionPopups();
	});


}

function getBoxInternalString(boxNumber){
	var side = (user_lang == "HB"?"L":"R");
	var iconNext = (user_lang == "HB"?"iconNext":"iconPrev");
	var iconPrev = (user_lang == "HB"?"iconPrev":"iconNext");
	var boxInternalStr = '<div class="boxTop"><div><span class="height"></span>'
		+ '<span class="smallTitle" id="chartTitle_' + boxNumber + '"></span></div>'
		+ '<div class="tooltip">' + $.t("before") + '<span id="toolTipTime_' + boxNumber + '"></span>' + $.t("minutes") + '</div></div>'
		+ '<div class="boxMid clearfix rel">'

		+ '<a href="javascript:void(0)" title="" boxNumber="' + boxNumber
		+ '" class="refreshBtn iconBtn ' + side + '">	<span class="iconReplace"></span> </a>'

		+ '<a href="javascript:void(0)" title=""  boxNumber="' + boxNumber
		+ '" class="optionsBtn iconBtn ' + side + '"><span class="iconTable"> </span> </a>'

		+ '<a href="javascript:void(0)" title=""  boxNumber="' + boxNumber
		+ '" modeView="chart" '
		+ 'class="chartTableBtn iconBtn ' + side + '"><span id="viewIcon_' + boxNumber + '" class="iconChart"> </span> </a>'

		+ '<a href="javascript:void(0)" title="' + $.t("download") + '"  boxNumber="' + boxNumber
		+ '" class="iconBtn_hide exelBtn ' + side + '"><span class="iconExel"> </span> </a>'

		+ '<a href="javascript:void(0)" title="' + $.t("prev") + '" boxNumber="' + boxNumber
		+ '" class="iconBtn_disable prevBtn"><span class="' + iconPrev  + '">   </span> </a>'

		+ '<a href="javascript:void(0)" title="' + $.t("next") + '" boxNumber="' + boxNumber
		+ '" class="iconBtn_disable nextBtn"><span class="' + iconNext + '"> 	</span> </a>'

		+ '<div class="clear h20"></div>'
		+ '<div id="chart_' + boxNumber + '" class="ltr"></div>'

		+ '<!--popup-->'
		+ '<div class="boxPopup columnWidth" boxNumber="' + boxNumber +'" >'
        + '<a href="javascript:void(0);" title="" class="closePop"></a>'
        + '<div class="popupTop"><div></div></div>'
        + '<div class="popupMid">'
        + '<div class="popupMidL columnHeight_inner columnWidth_inner">'
        + '<h2>' + $.t("current_graph_change") + '</h2>'
        + '<div class="clear"></div>'
        + '<div class="popupInn" boxNumber="' + boxNumber +'"></div>'
        + '</div></div><div class="popupBottom"><div></div>'
        + '</div></div>'
        + '<!--/popup-->'

		+ '</div><div class="boxBottom"><div></div></div>';

	return boxInternalStr;
}

function closeAllOptionPopups(){
	$('.boxPopup').hide();
}

/*
 * Set the data of the agents/customers in the map and in the table aside.
 */
function setMapDatepicker() {
	var defaultDate = new Date();
    $( ".mapDatepickerField" ).datepicker({
		dateFormat: 'dd/mm/yy',
		altFormat: 'yymmdd',
		altField: "#mapDateDBFormat"
	});

    $("#mapDatepickerBtn").click(function(){
		$('.mapDatepickerField').focus();
	});
}

function setDatepicker(tabId,num) {

	var defaultDate = new Date();
    $( ".DatepickerField" + tabId + num).datepicker({
		dateFormat: 'dd/mm/yy',
		altFormat: 'yymmdd',
		changeMonth: true,
	    numberOfMonths: 2,
	    showCurrentAtPos: 1,
	    maxDate: "+7D",
	    onSelect: function(val) {
	    	var num=$(this).attr("filterontab");
	    	if (filterDate[currentTab][num] == undefined){
	    		filterDate[currentTab][num]=[];
	    	}
	    	filterDate[currentTab][num].code=$("#DateDBFormat" + currentTab +num).val();
	    	filterDate[currentTab][num].name=val;
	    	},
		altField: "#DateDBFormat" + tabId + num

	});

    $("#DatepickerBtn " + tabId + num).click(function(){
		$('.DatepickerField' + tabId + num).focus();
	});
}

function setDatepickerMonth(tabId,num) {

	var defaultDate = new Date();

	$( ".DatepickerField" + tabId + num).datepicker({
		dateFormat: 'MM yy',
		altFormat: 'yymmdd',
		changeMonth: true,
		changeYear: true,
		showButtonPanel: true,
		maxDate: defaultDate,
	    onSelect: function(val) {
	    	var num=$(this).attr("filterontab");
	    	if (filterDate[currentTab][num] == undefined){
	    		filterDate[currentTab][num]=[];
	    	}
	    	filterDate[currentTab][num].code=$("#MonthDBFormat" + currentTab +num).val();
	    	filterDate[currentTab][num].name=val;
	    	},
		altField: "#MonthDBFormat" + tabId + num
	}).focus(function() {
		var thisCalendar = $(this);
		$('.ui-datepicker-calendar').detach();
		$('.ui-datepicker-close').click(function() {
		var month = $("#ui-datepicker-div .ui-datepicker-month :selected").val();
		var year = $("#ui-datepicker-div .ui-datepicker-year :selected").val();
		thisCalendar.datepicker('setDate', new Date(year, month, 1));
		});
	});

    $("#DatepickerBtn " + tabId + num).click(function(){
		$('.DatepickerField' + tabId + num).focus();
	});
}

function setMapData(){

	if(selectedFilters[currentTab]["RO"] == null) {
		return;
	}

	var loadingImg = '<br><br><br><br><center><img src="img/loader.gif" alt="loading"/></center>';
	$("#chartBox_1").html(loadingImg);
	$("#chartBox_0").html("");

	var jsonCrumbs;
	var jsonMap;

	for (x in possibleFilters){
		//x is the index in this tab's array of filters
		if(filtersData[currentTab][x] != undefined){
			if (filtersData[currentTab][x].type == "datepicker"){
				if ($("#DateDBFormat" + currentTab + x ).val() != "") {
					var code = filtersData[currentTab][x].code;
					selectedFilters[currentTab][code] = $("#DateDBFormat" + currentTab + x ).val();
				}
			}
		}
	}

	var jsonObj = {};
	jsonObj["%FILTER"] = {};
	jsonObj["%FILTER"]["RO"] = selectedFilters[currentTab]["RO"];
	jsonObj["%FILTER"]["DATE"] = selectedFilters[currentTab]["DATE"];
	jsonObj["%GN"] = {"GRF" : "GSMD" };
	jsonObj["%PRM"] = {};
	jsonObj["%PRM"]["CTAB"] = currentTab;

	var url = "mcall?_ROUTINE=JBIGRF&_NS=CAV&_LABEL=RUN";

	$.ajax({
		type: 'POST',
		url : url,
		contentType: 'application/json',
		data: JSON.stringify(jsonObj),
		dataType: "json",
		success: function( data ) {
			initialize();
			jsonCrumbs = data.crumbs;
			jsonMap = data.orders;

			if(jsonMap != null){
				setMapTable(jsonMap);
			}
			drawMap(jsonCrumbs, jsonMap);
		}
	});


	//animateCircle();

}


function setMapTable(jsonMap){
	// ==============================================
	//             Table on left
    // ==============================================
	var data = new google.visualization.DataTable();
	var divId = "chartBox_0";
	$("#divId").html("");

	data.addColumn("string", $.t("customer_name"));
	data.addColumn("string", "");
	data.addColumn("string", $.t("start_of_visit"));
	data.addColumn("string", $.t("ends_visit"));
	data.addColumn("string", $.t("beginning_reservation"));
	data.addColumn("string", $.t("duration_booking"));
	data.addColumn("string", $.t("gps"));

	data.addRows(jsonMap.length);

	$.each(jsonMap, function(i, custObj) {
		var rowDataStr = custObj.custName;
		var style = {};
		//		if (!(custObj.latitude > 0) || !(custObj.longitude > 0)){
		if((custObj.latitude == null) || (custObj.longitude == null) || (custObj.latitude == "") || (custObj.longitude == "") || (!parseInt(custObj.longitude))){
			style.className = 'google-visualization-table-td TnoMap';
		}
		if (user_lang == "HB" && !(custObj.latitude > 0) || !(custObj.longitude > 0)){
			style.className = 'google-visualization-table-td TnoMap';
		}
		data.setCell(i, 0, rowDataStr,rowDataStr,style);

		rowDataStr = "";
		style = {};
		style.className = "google-visualization-table-td "
		var colorClass = (custObj.onRoute == 1 ? "Tgreen" : "Tblue")
		if ((custObj.orderQuantity == 0)&&(custObj.onRoute == 1)) {
			colorClass="Tred";
		}
		if (custObj.agentVisit == 1){
			if (custObj.orderQuantity > 0){
				rowDataStr = "$";
				style.className += colorClass + " Tbold";
			} else {
				rowDataStr = "X";
				style.className += colorClass + " Tbold";
			}
		}
		data.setCell(i, 1, rowDataStr,rowDataStr,style);

		var style = {};
		rowDataStr = ""
		data.setCell(i, 2, custObj.startVisitTime, custObj.startVisitTime, style);
		data.setCell(i, 3, custObj.endVisitTime, custObj.endVisitTime, style);
		data.setCell(i, 4, custObj.orderTime, custObj.orderTime, style);
		if(custObj.agentVisit == 1){rowDataStr = custObj.orderTimeLength + $.t("minutes_label");}
		data.setCell(i, 5, rowDataStr, rowDataStr, style);
		rowDataStr =custObj.crumbsOrderDis;
		if(custObj.agentVisit == 1 && custObj.longitude == 0){rowDataStr = $.t("location_is_not_known");}
		data.setCell(i, 6, rowDataStr, custObj.rowDataStr, style);
	});

	var options = {
		// page : obj.options.paging,
		// showRowNumber : obj.options.showRowNumber
	};

	// Create and draw the visualization.
	//var divId = "chartBox_0";
	var table = new google.visualization.Table(document.getElementById(divId));
    table.draw(data, {showRowNumber: true});

    google.visualization.events.addListener(table, 'select', function(event) {
		var selection = table.getSelection();
		var selectedRow = selection[0].row;

		if(mapMarkers[selectedRow] != null){
			markersInfo[selectedRow].open(map,mapMarkers[selectedRow]);
		}
		for(var t=0; t<markersInfo.length; t++) {
			if((t!=selectedRow) && (markersInfo[t] != null)){
				markersInfo[t].close();
			}
	    }
	});

    // ==============================================
    // ==============================================

}

function drawMap(jsonCrumbs, jsonMap){

	var infoStr;
    var pos;
    var minLatitude  = 999;
    var maxLatitude  = -999;
    var minLongitude = 999;
    var maxLongitude = -999;
    var myLatLng = new google.maps.LatLng(32.4790, 34.941);
    var LatLngList = [];


    var handler = function(index, _marker) {
	    return function() {
	    	markersInfo[index].open(map,_marker);

		    for(var t=0; t<markersInfo.length; t++) {
				if(t!=index && markersInfo[t]!=null){
					markersInfo[t].close();
				}
		    }
		    for(var t=0; t<crumbsInfo.length; t++) {
				crumbsInfo[t].close();
		    }
	    };
	};

	var handlerC = function(index, _marker) {
	    return function() {
		    crumbsInfo[index].open(map,_marker);

		    for(var t=0; t<crumbsInfo.length; t++) {
				if(t!=index){
					crumbsInfo[t].close();
				}
		    }
		    for(var t=0; t<markersInfo.length; t++) {
				if (markersInfo[t]!= null){
					markersInfo[t].close();
				}
		    }
	    };
	};

	markersInfo = [];
	mapMarkers = [];
	agentOrderCrumbs=[];

	if(jsonMap != null){
	    $.each(jsonMap, function(i, custObj) {
//	    	if ((custObj.latitude > 0) && (custObj.longitude > 0)) {
	    	if((custObj.latitude == null) || (custObj.longitude == null) || (custObj.latitude == "") || (custObj.longitude == "") || (!parseInt(custObj.longitude))){
	    		mapMarkers.push(null);
	    		markersInfo.push(null);
	    	} else if (user_lang == "HB" && (custObj.latitude <= 0) || (custObj.longitude <= 0)) {
	    		mapMarkers.push(null);
	    		markersInfo.push(null);
	    	} else {
	    		pos = new google.maps.LatLng(custObj.latitude, custObj.longitude);
		    	LatLngList.push(pos);
		    	maxLatitude = Math.max(custObj.latitude, maxLatitude);
		        minLatitude = Math.min(custObj.latitude, minLatitude);
		        maxLongitude = Math.max(custObj.longitude, maxLongitude);
		        minLongitude = Math.min(custObj.longitude, minLongitude);

		        if(custObj.remark == null) {custObj.remark = ""};
		        infoStr = '<table><tr><td colspan="2" style="color: red; font-weight: bold;">' + custObj.custName + '</td></tr>'
		        	+ '<tr><td colspan="2">' + custObj.address + '</td></tr>'
		        	+ '<tr><td colspan="2"> &nbsp;</td></tr>'
		    		+ '<tr><td>' + $.t("order_value") + '</td><td>&nbsp;' + custObj.orderValue + '</td></tr>'
		        	+ '<tr><td>' + $.t("order_quantity") + '</td><td>&nbsp;' + custObj.orderQuantity + '</td></tr>'
		        	+ '<tr><td>' + $.t("order_time") + '</td><td>&nbsp;' + custObj.orderTime + '</td></tr>'
		        	+ '<tr><td>' + $.t("comment") + '</td><td style="color: red;">&nbsp;' + custObj.remark + '</td></tr>';
		        if (custObj.crumbsOrder != undefined) {
		        	var str = "'" + custObj.crumbsOrder + "'";
		        	infoStr	+= '<tr><td>' + $.t("order_place") + '</td><td><a href="javascript:void(0);" onclick="openOrderCrumbs(' + str + ');">' + " GPS " + custObj.crumbsOrderDis + '</a></td></tr>';
		        }
		        infoStr	+= '</table>'
		        infoWindow = new google.maps.InfoWindow();
				infoWindow.setContent(infoStr);
				markersInfo.push(infoWindow);

				//if (custObj.agentVisit == 1){
				//	agentOrderCrumbs.push(pos);
				//}
				var iconColor=(custObj.onRoute == 1 ? "green" : "blue");
				if ((custObj.orderQuantity == 0)&&(custObj.onRoute == 1)) {
					iconColor="red";
				}
				var iconImg = "img/markers/marker_" + iconColor;    // + (custObj.onRoute == 1 ? "red" : "blue");
				if (custObj.agentVisit == 1){
					if (custObj.orderQuantity > 0){
						iconImg += "_order";
					} else {
						iconImg += "_noOrder";
					}
				}
				iconImg += ".png";

				marker = new google.maps.Marker({
		            position: pos,
		            map: map,
		            title: custObj.custName,
		            icon: iconImg
		        });
				mapMarkers.push(marker);

				google.maps.event.addListener(marker, 'click', handler(i, marker));
	    	}
		});
	}


    //=========================================================================================
    //=========================================================================================

    var icons = new Array();
	var infoStr ;
	var infoWindow;
	var icon;

	agentCrumbs = [];
	crumbsInfo = [];
	mapCrumbs = [];

	if(jsonCrumbs != null){
	    $.each(jsonCrumbs, function(i, crumb) {
	    	pos = new google.maps.LatLng(crumb.X, crumb.Y);
	    	agentCrumbs.push(new google.maps.LatLng(crumb.X, crumb.Y));

	    	LatLngList.push(pos);
	    	maxLatitude = Math.max(crumb.X, maxLatitude);
	        minLatitude = Math.min(crumb.X, minLatitude);
	        maxLongitude = Math.max(crumb.Y, maxLongitude);
	        minLongitude = Math.min(crumb.Y, minLongitude);

	        //if (crumb.TYPE == "RODROP") {
	        agentOrderCrumbs.push(pos);
	       // }
	        infoStr='<table dir="ltr" align="left" ' + (crumb.crumbsOrder? 'crumbOrderId=' + crumb.crumbsOrder:"") +'><tr><td colspan=2 align="left">&nbsp;&nbsp;&nbsp;</td></tr>' +
      	  	  '<tr><td colspan=2 style="color: blue; font-weight: bold;">' + (crumb.ADDRESS?crumb.ADDRESS:"") + '</td></tr><tr><td align="left">From: ' + crumb.FROM +
		      '</td><td align="left">&nbsp;&nbsp;&nbsp;   Till: ' + crumb.TILL + '</td></tr>' +
		      '<tr><td colspan=2 align="left"> ' + crumb.MINUTES + ' minutes</td></tr></table>' ;

	        infoWindow = new google.maps.InfoWindow();
			infoWindow.setContent(infoStr);
			infoWindow.orderId = crumb.crumbsOrder;
			crumbsInfo.push(infoWindow);

			icon = "img/markers/" + crumb.TYPE + ".png" ;  //i.e. WAYDOT.gif
			icons.push(icon);


			marker = new google.maps.Marker({
	            position: agentCrumbs[i],
	            map: map,
	            icon: icons[i]
	        });
			mapCrumbs.push(marker);
			google.maps.event.addListener(marker, 'click', handlerC(i, marker));
		});
	}

    var lineSymbol = {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      strokeColor: '#393'
    };

    /*var agentPath = new google.maps.Polyline({
	       path: agentOrderCrumbs,
	        icons: [{
	   	        icon: lineSymbol,
	   	        offset: '100%'
	   	    }],
	      strokeColor: "#0000FF",
	        strokeOpacity: 0.6,
	        strokeWeight: 2
	      });

	 agentPath.setMap(map);*/

    //=========================================================================================
    //=========================================================================================


    // set center of map:
    var avgLat = (maxLatitude + minLatitude)/2;
	var avgLng = (maxLongitude + minLongitude)/2;
	if (avgLat == 0) {
		avgLat=32.4790;
		avgLng=34.9410;
	}
    var newCenter = new google.maps.LatLng(avgLat, avgLng );
    map.setCenter(newCenter);

    // fit the zoom level to the markers:
    var bounds = new google.maps.LatLngBounds ();
    for (var i = 0, LtLgLen = LatLngList.length; i < LtLgLen; i++) {
	  // And increase the bounds to take this point
	  bounds.extend (LatLngList[i]);
	}
    map.fitBounds (bounds);

}

function openOrderCrumbs(idOrderCrumbs) {
    for(var t=0; t<crumbsInfo.length; t++) {
		if (crumbsInfo[t].orderId == idOrderCrumbs) {
			crumbsInfo[t].open(map,mapCrumbs[t]);
		}
    }
}

/*******************************************************************************
 * get the charts parameters using ajax query to the server and then, call the
 * function to draw the chart.
 *
 * @param chartCode -
 *            the query code to send to the server
 * @param boxNumber -
 *            where (in page) to put the chart
 ******************************************************************************/
function getChartData(chartCode, boxNumber, params, noAjax, tabId, noLoading) {
	divId = "chart_" + boxNumber;

	if (noAjax) {
		// just re-draw the chart from the data we've got from the server
		// without calling the server again.
		drawChart(chartsData[currentTab][boxNumber], boxNumber);
		$("#chartTitle_" + boxNumber).html(chartsData[currentTab][boxNumber].titles.head);
		addPrevNextBtn(chartsData[currentTab][boxNumber], boxNumber);
		tabsList[currentTab].charts[boxNumber].chartCode = chartCode;
		addBoxOptions(boxNumber);
		return;
	}

	jsonObj = {};
	jsonObj["%PRM"] = {};
	if (params != null) {
		$.each(params, function(i, item) {
			jsonObj["%PRM"][item.key] = item.value;
		});
	}
	jsonObj["%PRM"]["CTAB"] = (tabId!=undefined?tabId:currentTab);

//	for (x in possibleFilters){
//		//x is the index in this tab's array of filters
//		if(filtersData[currentTab][x] != undefined){
//			if (filtersData[currentTab][x].type == "datepicker"){
//				if ($("#DateDBFormat" + currentTab + x ).val() != "") {
//					var code = filtersData[currentTab][x].code;
//					selectedFilters[currentTab][code] = $("#DateDBFormat" + currentTab + x ).val();
//				}
//			}
//			if (filtersData[currentTab][x].type == "datepickerMonth"){
//				if ($("#MonthDBFormat" + currentTab + x ).val() != "") {
//					var code = filtersData[currentTab][x].code;
//					selectedFilters[currentTab][code] = $("#MonthDBFormat" + currentTab + x ).val();
//				}
//			}
//		}
//	}
	//if ($("#mapDateDBFormat").val() != "") {
	//	selectedFilters[currentTab]["DATE"] = $("#mapDateDBFormat").val();
	//}

	if ( ! $.isEmptyObject(selectedFilters[currentTab])) {
		jsonObj["%FILTER"] = {};
		$.each(selectedFilters[currentTab], function(filterCode, filterValue) {
			jsonObj["%FILTER"][filterCode] = (filterValue.substr(filterValue.length - 1) == "," ? filterValue.slice(0, -1):filterValue);
		});
	}

	jsonObj["%GN"] = {"GRF" : chartCode, "MR": currentMR };
	var url = "mcall?_ROUTINE=JBIGRF&_NS=CAV&_LABEL=RUN";

	loadingImg = '<br><br><br><br><center><img src="img/loader.gif" alt="loading"/></center>';

	$.ajax({
		type : 'POST',
		url : url,
		data : JSON.stringify(jsonObj),
		contentType : 'application/json',
		dataType : 'json',
		beforeSend : function(xhr) {
			if (!noLoading){
				$("#" + divId).html(loadingImg);
			}
		},
		success : function(data) {

			if (tabId == null) { tabId = currentTab; }
			if (tabId != currentTab) { return; }

			setTimeout(function() {

				var currentTime = new Date();
				lastUpdated[boxNumber] = currentTime.getTime();

				drawChart(data, boxNumber);

				$("#chartTitle_" + boxNumber).html(data.titles.head);

				if(boxNumber == "dialogChart"){
					stackZoomData.push(data);
					addZoomButtons(boxNumber, data);
					return;
				}

				stackZoomData=[];
				//don't do the following in case of drawing zoom chart:
				//=====================================================
				addPrevNextBtn(data, boxNumber);
				tabsList[currentTab].charts[boxNumber].chartCode = chartCode;
				addBoxOptions(boxNumber);
			}, 10);

			data["chartCode"] = chartCode;
			chartsData[currentTab][boxNumber] = data;
		},
		error : function(xhr, ajaxOptions, thrownError) {
			//alert(request.responseText);
			//alert("Error!")
		}
	});

}

function addZoomButtons(boxNumber, data){

	if (data.links && data.links[0].place == "exel"){
		$("#zoomToExel").show();
		$(".exelBtn").off("click");
		$(".exelBtn").click(function(){
			if ($(this).hasClass("iconBtn_disable")){
				return;
			}
			var boxNumber = $(this).attr("boxNumber");
			chartToExel(boxNumber);
		});
	} else {$("#zoomToExel").hide();}

	tabsList[currentTab].charts[boxNumber]={};
	tabsList[currentTab].charts[boxNumber].chartCode = data.chartCode;
	addZoomBoxOptions(data,"dialogChart");

	$(".optionsBtn").off("click");
	$(".optionsBtn").click(function() {
		closeAllOptionPopups();
		if ($(this).attr("class").indexOf("iconBtn_disable") != -1){
			return;
		}
        $(this).closest(".boxMid").find(".boxPopup").show();
    });

	$(".closePop").off("click");
	$('.closePop').click(function() {
    	closeAllOptionPopups();
	});

	if (stackZoomData.length >1){
		$("#zoomBack").show();
	} else{
		$("#zoomBack").hide();
	}
	$("#zoomBack").off("click");
	$("#zoomBack").click(function(){
		buttonZoomBack();
	});
}

function addZoomBoxOptions(data, boxNumber) {
	buttonDisable("options", boxNumber);
	if (!data.links){return;}
	var optionsButtons = '';
	var newLinkButton = '';
	zoomOptionsList = {};
	$.each(data.links, function(i, link) {
		if (link.place !="normal"){return;}
		zoomOptionsList[link.chartCode] = {};
		zoomOptionsList[link.chartCode].params = link.param;
		var btnClass = "grafBTN";
		if(link.chartCode == tabsList[currentTab].charts[boxNumber].chartCode) {
			btnClass += " grafBTN_selected";
		}
		newLinkButton = '<a href="javascript:void(0)" title="" class="' + btnClass + ' linkZoomBtn" '
			+ 'boxNumber="'+ boxNumber + '" linkToChart="' + link.chartCode + '">'
			+ '<span class="btnLeft"><span class="arrowIcon">'
			+ '<span class="grafIcon ">' + link.text + '</span></span></span></a>';
		optionsButtons += newLinkButton;
	});

	if (optionsButtons){
		buttonEnable("options", boxNumber);
		$(".popupInn[boxNumber=" + boxNumber + "]").html(optionsButtons);
	}

	$(".linkZoomBtn").off("click");
	$(".linkZoomBtn").click(function() {
		var replaceChart = $(this).attr("linkToChart") ;
		var replaceBoxNumber   = $(this).attr("boxNumber") ;
		if(tabsList[currentTab].charts[replaceBoxNumber].chartCode == replaceChart){
			closeAllOptionPopups();
			return;
		}
		closeAllOptionPopups();
		params = zoomOptionsList[replaceChart].params
		getChartData(replaceChart, replaceBoxNumber, params);
	});
}

function getFilterData(filterCode,tabId,filterIndex) {

	jsonObj = {};
	jsonObj["%GN"] = {"GRF" : filterCode ,"MR":currentMR};
	var url = "mcall?_ROUTINE=JBIGRF&_NS=CAV&_LABEL=RUN";

	$.ajax({
		type : 'POST',
		url : url,
		data : JSON.stringify(jsonObj),
		contentType : 'application/json',
		dataType : 'json',
		success : function(filter) {

			if (tabId == null) { tabId = currentTab; }
			if (tabId != currentTab) { return; }

			setTimeout(function() {
				var filterObj = filtersData[tabId][filterIndex];

				if(filter != null){
					var data = {};
					var valuesArray = [];

					if (user_lang != "HB"){
						filter.data.sort(function(a, b) {
							return compareStrings(a,b,"valueName");
						});
					}

					//the first index of the array has an empty
					//value which means "nothing was filtered here":
					valuesArray.push( { valueKey: '', value: filterObj.name, filterCode: filterObj.code }   );

					$.each(filter.data, function(dataIndex, dataObj){
						data[dataObj.valueName] = dataObj.value;
						valuesArray.push( { valueKey: dataObj.value, value: dataObj.valueName, filterCode: filterObj.code }   );
					});
					filterObj.data = data;
					filterObj.valuesArray = valuesArray;
				}

				filtersData[tabId][filterIndex] = filterObj;
				if (filtersData[tabId][filterIndex].valuesArray != undefined){
					setFilterValues(tabId,filterIndex);
				}
			}, 10);
		},
		error : function(xhr, ajaxOptions, thrownError) {
			//alert(request.responseText);
			//alert("Error!")
		}
	});

}

/*
 * Draw the back chart on zozm
 */
function buttonZoomBack() {

	var html='<div id="filterChart"></div>';
		html += '<div id="divChart"><h2></h2>​​';
		html +='<br><br><br><br><center><img src="img/loader.gif" alt="loading"/></center></div>';
		html +='<div id="rangeFilter"></div>';
	$("#dialogChart").html(html);
	data=stackZoomData.pop();
	data=stackZoomData.pop();
	boxNumber="dialogChart";
	var currentTime = new Date();
	lastUpdated[boxNumber] = currentTime.getTime();
	drawChart(data, boxNumber);
	$("#chartTitle_" + boxNumber).html(data.titles.head);
	stackZoomData.push(data);
	addZoomButtons(boxNumber, data);
	chartsData[currentTab][boxNumber] = data;
}

/*
 * Draw the chart - call the right function by its type
 */
function drawChart(dataObj, boxNumber){
	var divId =  "chart_" + boxNumber;

	if(boxNumber == "dialogChart"){
		divId = "dialogChart";
	}

	if(dataObj == undefined){
		//var noVals = "<h1>Sorry, it's seem there was a problem loading the data...try agian</h1>";
		var noVals="<h1>Sorry, it's seem there was a problem loading the data...</h1>"
		$("#"+divId).html(noVals);
		return;
	}

	if(dataObj.values == null){
		//var noVals = "<h1>Sorry, it's seem there was a problem loading the data...</h1>";
		var noVals="<h1>No data to display</h1>"
		$("#"+divId).html(noVals);
		return;
	}

	switch (dataObj.type) {
	case "bar":
		drawBar(dataObj, divId);
		break;
	case "line":
		drawLine(dataObj, divId);
		break;
	case "pie":
		drawPie(dataObj, divId);
		break;
	case "gauge":
		drawGauge(dataObj, divId, boxNumber);
		break;
	case "table":
		drawTable(dataObj, divId);
		break;
	case "geo":
		drawGeo(dataObj, divId);
		break;
	case "area":
		drawArea(dataObj, divId);
		break;
	case "steppedArea":
		drawSteppedArea(dataObj, divId, boxNumber);
		break;
	case "number":
		drawNumber(dataObj, divId, boxNumber);
		break;
	default:
		return;
	}

	if (dataObj.zoom){
		$("#"+divId).addClass("pointer");
	} else{
		$("#"+divId).removeClass("pointer");
	}
}

/*******************************************************************************
 * "prev and "next" (if exist) are the buttons for the previous/next
 * day/month/etc.
 ******************************************************************************/
function addPrevNextBtn(obj, boxNumber) {
	buttonDisable("prev", boxNumber);
	buttonDisable("next", boxNumber);
	buttonHide("exel", boxNumber);
	linksButtons[boxNumber] = {};

	if(obj.type == "table"){
		buttonHide("chartTable", boxNumber);
	}

	if (obj.links == null) {
		return;
	}

	var optionId = '';
	$.each(obj.links, function(i, linkItem) {
		optionId = optionIdCounter + 1;
		optionIdCounter++;

		var divBtns = linksButtons[boxNumber];
		divBtns[linkItem.place] = {};
		var placeObj = divBtns[linkItem.place];
		placeObj[optionId] = {
			params : linkItem.param,
			chartCode : linkItem.chartCode,
			title : linkItem.text,
			boxNumber : boxNumber
		};

	});

	if (linksButtons[boxNumber]["prev"] != null){
		buttonEnable("prev", boxNumber);
	}
	if (linksButtons[boxNumber]["next"] != null){
		buttonEnable("next", boxNumber);
	}
	if (linksButtons[boxNumber]["exel"] != null){
		buttonShow("exel", boxNumber);
	}

}

/*******************************************************************************
 * add options buttons for this graph (links to other graphs) - in the options
 * "shadowed" area.
 *
 * We save the data of the links (options) buttons under the tab's data.
 ******************************************************************************/
function addBoxOptions(boxNumber) {
	buttonDisable("options", boxNumber);

	if (tabsList[currentTab].charts[boxNumber].links != null){
		buttonEnable("options", boxNumber);

		var optionsButtons = '';
		var newLinkButton = '';
		$.each(tabsList[currentTab].charts[boxNumber].links, function(i, link){
			var btnClass = "grafBTN";
			if(link.chartCode == tabsList[currentTab].charts[boxNumber].chartCode) {
				btnClass += " grafBTN_selected";
			}
			newLinkButton = '<a href="javascript:void(0)" title="" class="' + btnClass + ' linkBtn" '
				+ 'boxNumber="'+ boxNumber + '" linkToChart="' + link.chartCode + '">'
				+ '<span class="btnLeft"><span class="arrowIcon">'
				+ '<span class="grafIcon ">' + link.text + '</span></span></span></a>';
			optionsButtons += newLinkButton;
		});

		$(".popupInn[boxNumber=" + boxNumber + "]").html(optionsButtons);
	}

	$(".linkBtn").click(function() {
		var replaceChart = $(this).attr("linkToChart") ;
		var replaceBoxNumber   = $(this).attr("boxNumber") ;
		if(tabsList[currentTab].charts[replaceBoxNumber].chartCode == replaceChart){
			closeAllOptionPopups();
			return;
		}
		closeAllOptionPopups();
		getChartData(replaceChart, replaceBoxNumber);
	});
}


/*
 * set a button to be eneabled
 */
function buttonEnable(name, boxNum){
	var btn = $("." + name + "Btn[boxNumber=" + boxNum + "]");
	$(btn).removeClass("iconBtn_disable");
	$(btn).addClass("iconBtn");
}

/*
 * set a button to be disabled
 */
function buttonDisable(name, boxNum){
	var btn = $("." + name + "Btn[boxNumber=" + boxNum + "]");
	$(btn).removeClass("iconBtn");
	$(btn).addClass("iconBtn_disable");
}

/*
 * set a button to be show
 */
function buttonShow(name, boxNum){
	var btn = $("." + name + "Btn[boxNumber=" + boxNum + "]");
	$(btn).removeClass("iconBtn_hide");
	$(btn).addClass("iconBtn");
}

/*
 * set a button to be show
 */
function buttonHide(name, boxNum){
	var btn = $("." + name + "Btn[boxNumber=" + boxNum + "]");
	$(btn).removeClass("iconBtn");
	$(btn).addClass("iconBtn_hide");
}


/*
 * When click on the "next" or "prev" buttons, we take the parameters and the
 * target graph code and replace the current graph with the next/previous graph
 */
function callPrevNextButton(boxNumber, type){
	if (linksButtons[boxNumber][type] == null){
		return;
	}

	var linkId;
	$.map(linksButtons[boxNumber][type], function(val, i) {
		linkId = val;
	})
	var replaceChart = linkId.chartCode ;
	var replaceboxNumber   = linkId.boxNumber ;
	var replaceParam = linkId.params ;
	getChartData(replaceChart, replaceboxNumber, replaceParam);
}

/*******************************************************************************
 * download graph's data to exel
 ******************************************************************************/
function chartToExel(boxNumber){
	var obj = chartsData[currentTab][boxNumber];

	// Create and populate the data table
	var data = {};

	data.chartName = obj.titles.head;
	data.chartTitle = obj.titles.chart;
	// columns titles and types:
	data.title = [];
	var ind = 0
	if (obj.cols.x){ind = 1;data.title[0] = obj.cols.x.title;}
	if (obj.cols.y) {obj2 = obj.cols.y}
	else {obj2 = obj.cols}

	$.each(obj2, function(i, yCol){
		data.title[i+ind]=yCol.title
	});

	// rows data
	data.row = []
	$.each(obj.values, function(i, rowItem) {
		data.row[i] = [];
		if (obj.cols.x){
			var title = rowItem.title;
			data.row[i][0] = title;
		}
		if (obj.cols.y) {obj3 = rowItem.vals}
		else {obj3 = rowItem}
		$.each(obj3, function(j, valItem) {
			var valCol = valItem;
			if(valItem.val != undefined){valCol = valItem.val;}
			if(valCol == null){
				if(obj2[j].type == "string"){
					valCol = "";
				} else {
					valCol = 0;
				}
			}
			data.row[i][j+ind] = valCol;
		});
	});

	var url = "mcall?_ROUTINE=JBIGRF&_NS=CAV&_LABEL=BLDEXEL";

	$.ajax({
		type: 'POST',
		url : url,
		contentType: 'application/json',
		data: JSON.stringify(data),
		dataType: "json",
		success: function( data ) {
			if (data.link){
				$(".exelaBtn").attr("href", data.link);
				location.href = $(".exelaBtn").attr("href");
				//$(".exelaBtn").onclick();
			}
		}
	});
}

/*******************************************************************************
 * turns graph's data from chart-view to table-view
 ******************************************************************************/
function chartToTable(obj /*boxNumber*/, divId) {
	//var obj = chartsData[currentTab][boxNumber];

	// Create and populate the data table
	var data = new google.visualization.DataTable();

	//removeSaveChartData(boxNumber);

	if(obj.type == "gauge"){
		// columns titles and types:
		data.addColumn("number", 'ערך');
		data.addColumn("number", 'מתוך');
		//===data.addColumn("number", "%");

		// rows data
		data.addRows(1);
		var value = obj.values[0].val;
		var outOf = obj.valsInterval.max;
		//===var percent = value/outOf ;

		data.setCell(0,0,value);
		data.setCell(0,1,outOf);
		var formatter = new google.visualization.NumberFormat({pattern:'#,###'});
		formatter.format(data, 0);
		formatter.format(data, 1);
		//===var formatter = new google.visualization.NumberFormat({pattern:'#,###%'});
		//===formatter.format(data, 2);
	} else {
		// columns titles and types:
		data.addColumn(obj.cols.x.type, obj.cols.x.title);
		$.each(obj.cols.y, function(i, yCol){
			data.addColumn(yCol.type, yCol.title);
		});

		if(obj.type == "pie"){
		 var total = 0;
	        for (var i = 0; i < obj.values.length; i++) {
	            total += obj.values[i].vals[0];
	        }
	        data.addColumn("string", 'אחוז');
		}

		// rows data
		data.addRows(obj.values.length);
		$.each(obj.values, function(i, rowItem) {
			var title = rowItem.title;
			if(obj.cols.x.type == "string"){
				title = title.toString();
			}
			data.setCell(i, 0, title);

			$.each(rowItem.vals, function(j, valItem) {
				if(obj.cols.y[j].type == "string"){
				 if(valItem == null){valItem = "";}
						var classes = "TrightText";
				}
				else {
					if(valItem == null){valItem = 0;}
					var classes = "";
				}

				if(rowItem.style && rowItem.style.col-1 == j){
					classes = "TrightText";
					if (obj.cols.y[j].type == "number") {classes = "google-visualization-table-td-number";}
					$.each(rowItem.style.classList, function(k, styleName) {
						classes += " T" + styleName; //like Tgreen for green font, Tbold for bold font etc.
					});
				}

				var style = {};
				style.className = classes;
				data.setCell(i, j+1, valItem, valItem, style);
			});

			if(obj.type == "pie"){
				 var value = data.getValue(i, 1);
		         var percent = Number(100 * value / total).toFixed(1);
		         percent = percent + "%";
		         data.setCell(i, rowItem.vals.length+1, percent, percent);
			}

		});

		var cssClassNames = {
				'headerRow' : 'tableHeaderClass tableBorderClass',
				'headerCell': 'tableBorderClass',
				'tableRow': 'tableBorderClass',
				'tableCell': 'tableBorderClass',
				'right-text' : 'TrightText'
				};

		var options = {
			// page : obj.options.paging,
			page : 'enable',
			//pageSize : 13,
			// rtlTable : true,
			cssClassNames: cssClassNames,
			//showRowNumber: true
			// showRowNumber : obj.options.showRowNumber
			//height: '100%',
			width: '100%'
		};

		var formatter = new google.visualization.NumberFormat({pattern:'#,###'});
		$.each(obj.cols.y, function(i, yCol){
			if(yCol.type == "number"){
				formatter.format(data, i+1);
			}
		});
	}

	// Create and draw the visualization.
	var table = new google.visualization.Table(document.getElementById(divId));

	/*if (user_lang == "HB"){
		google.visualization.events.addListener(table, 'ready', function(){
			$("#chart_" + boxNumber + " .google-visualization-table-table").attr('style', 'direction: rtl');
		});
	}*/

	table.draw(data, options);

	// TODO add listener to select (zoom)
	//zoom dialog
	if(obj.zoom != null){
		google.visualization.events.addListener(table, 'select', function(event) {
			var selection = table.getSelection();
			if(selection[0] == null){
				return;
			}
			if(selection[0].row == null){
				return;
			}
			var selectedRow = selection[0].row;

			$("#zoomDialog").trigger('click');
			var chartCode = obj.zoom.chartCode;
			if(obj.type == "gauge"){
				var params = obj.values.zoomParam;
			} else {
				var params = obj.values[selectedRow].zoomParam;
			}

			//var divId = "dialogChart";
			getChartData(chartCode, "dialogChart", params);
		});
	}

}

/*******************************************************************************
 * turns back graph's data from table-view to chart-view
 ******************************************************************************/
function tableToChart(boxNumber) {
	// re-draw the chart without calling the server again (with the data
	// we've got from the server before...
	removeSaveChartData(boxNumber);
	chkChartData(boxNumber, null, null, true);
}

function removeSaveChartData(boxNumber){
	delete tabsList[currentTab].charts[boxNumber].chart;
	delete tabsList[currentTab].charts[boxNumber].chartData;
	delete tabsList[currentTab].charts[boxNumber].chartOptions;
}

function removeAllSaveChartData(){

	if(!tabsList[currentTab]){return;}
	$.each(tabsList[currentTab].charts, function(i, obj){
		delete tabsList[currentTab].charts[i].chart;
		delete tabsList[currentTab].charts[i].chartData;
		delete tabsList[currentTab].charts[i].chartOptions;
	});

}
function removeAllSaveChartDataAllTabs(){
	if(!tabsList[currentTab]){return;}
	$.each(tabsList,function(j, tab){
		$.each(tabsList[j].charts, function(i, obj){
			delete tabsList[j].charts[i].chart;
			delete tabsList[j].charts[i].chartData;
			delete tabsList[j].charts[i].chartOptions;
		});
	});

}

/*******************************************************************************
 * compare two numbers
 ******************************************************************************/
function compareNumber(a, b, key) {
	return a[key] - b[key];
}

function compareNumberDesc(a, b, key) {
	return  b[key] - a[key];
}

/*******************************************************************************
 * compare two strings (alphabetically)
 ******************************************************************************/
function compareStrings(a, b, key) {
	var nameA = a[key].toLowerCase();
	var nameB = b[key].toLowerCase();
	if (nameA < nameB) {return -1;}
	if (nameA > nameB) {return 1;}
	return 0;
}

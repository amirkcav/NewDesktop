var gaugeChart;
var pieChart;
var lineChart;
var barChart;

/*******************************************************************************
 * Draw a Number Chart and put it in a <div>
 ******************************************************************************/
function drawNumber(obj, divId, boxNumber) {
	
	if (!$("#" + divId + "number").length){
		
		var html = '<div id="' + divId + 'number" class="numberChartNumber">' + obj.values.number + '</div>';
		html += '<div class="numberChartTitle ' + obj.values.color +'">' + obj.values.title + '</div>';
		$("#" + divId).html(html);
		
	} else {
		var oldNumber = parseInt($("#" + divId + "number").text());
		if(!oldNumber){oldNumber = 0;}
			
		$("#" + divId + "number")
	     .prop('number', oldNumber)
	     .animateNumber(
	       {
	         number: obj.values.number
	       },
	       10000
	     );
	}
	setInterval(function (){
		synchronizeNumberChart(boxNumber);
		}, 60*1000);
}

function synchronizeNumberChart(boxNumber){
	var chartCode = tabsList[currentTab].charts[boxNumber]["chartCode"];  
	if (chartCode[2] != "N"){ return;}
	// get the chart's data from the server and draw it on screen:
	getChartData(chartCode, boxNumber, null, false, currentTab, true);
}

/*******************************************************************************
 * Draw a Gauge Chart and put it in a <div>
 ******************************************************************************/
function drawGauge(obj, divId, boxNumber, graphHeight) {
	
	if (obj.sync && tabsList[currentTab].charts[boxNumber]["chart"]){
		var data = tabsList[currentTab].charts[boxNumber]["chartData"];
		var gaugeChart = tabsList[currentTab].charts[boxNumber]["chart"];	
		var options = tabsList[currentTab].charts[boxNumber]["chartOptions"];	

		data.setValue(0, 1, obj.values[0].val);
		
		var formatter = new google.visualization.NumberFormat(
				{pattern:'#,###'});
		formatter.format(data, 1);
		gaugeChart.draw(data, options);
		
		$("#" + divId + " .tableGauge .nowValTitle").text(obj.titles.chart);
		$("#" + divId + " .tableGauge .nowVal").text(obj.values[0].val);
		
		return;
	}
	// Create and populate the data table.
	var data = new google.visualization.DataTable();
	
	data.addColumn(obj.cols.x.type, obj.cols.x.title);
	var yCol = obj.cols.y[0];
	data.addColumn(yCol.type, yCol.title);
	
	data.addRows(1);
	var chartValName = (obj.chartValName?obj.chartValName:obj.titles.chart)
	data.setValue(0, 0, chartValName);
	data.setValue(0, 1, obj.values[0].val);

	minorTicks = obj.ticks.minor;
	if (minorTicks == '') {
		minorTicks = defaultMinorTicks;
	}
	
	var _width = $('#' + divId).width();
	var options = {
		width : _width,// 266,
		height : graphHeight ? graphHeight : 220,
		greenFrom : obj.green.from,
		greenTo : obj.green.to,
		yellowFrom : obj.yellow.from,
		yellowTo : obj.yellow.to,
		redFrom : obj.red.from,
		redTo : obj.red.to,
		min : obj.valsInterval.min,
		max : obj.valsInterval.max,
		minorTicks : minorTicks
	};
	
	var formatter = new google.visualization.NumberFormat(
			{pattern:'#,###'});
	formatter.format(data, 1);


	// Create and draw the visualization.
	gaugeChart = new google.visualization.Gauge(document.getElementById(divId));
	gaugeChart.draw(data, options);
	
//	tabsList[currentTab].charts[boxNumber]["chart"] = gaugeChart;
//	tabsList[currentTab].charts[boxNumber]["chartData"] = data;
//	tabsList[currentTab].charts[boxNumber]["chartOptions"] = options;
	
	var tdWidth = "33.3%";
	if (obj.valsInterval.maxPercent && obj.valsInterval.maxPercent != 100){tdWidth="50%";}
	var html = "<table class='tableGauge'>";
	html += "	<thead>";
	html += "		<tr class='tableHeaderClass tableBorderClass'>";
	html += "		<th class='nowValTitle' width='" + tdWidth +"'>" + obj.titles.chart + "</th>";
	if (obj.valsInterval.maxPercent && obj.valsInterval.maxPercent != 100){
		html += "<th width='" + tdWidth +"'>100%</th>";
	}
	html += "		<th width='" + tdWidth +"'>" + (obj.valsInterval.maxPercent?obj.valsInterval.maxPercent:200) + "%</th>";
	html += "	</tr>";
	html += "</thead>";
	html += "<tbody>";
	html += "	<tr class='tableBorderClass'>";
	html += "		<td class='nowVal'>" + formatNumber(obj.values[0].val).split(".")[0] + "</td>";
	if (obj.valsInterval.maxPercent && obj.valsInterval.maxPercent != 100) {
		html += "<td>" + formatNumber(obj.valsInterval.middle).split(".")[0] + "</td>";
	}
	html += "		<td>" + formatNumber(obj.valsInterval.max).split(".")[0] + "</td>";
	html += "	</tr>";
	html += "</tbody>";
	html += "</table>";
	if(obj.remark){
		html += "<div class='tableGauge remarkText'>" + obj.remark + "</div>"
	}
	$("#" + divId).append(html);
	
		
//	// zoom dialog
//	if(obj.zoom != null){
//		google.visualization.events.addListener(gaugeChart, 'select', function(event) {
//			var selection = gaugeChart.getSelection();
//			if(selection[0] == null){
//				return;
//			}
//			if(selection[0].row == null){
//				return;
//			}
//			var selectedRow = selection[0].row;
//	
//			$("#zoomDialog").trigger('click');
//			var chartCode = obj.zoom.chartCode;
//			var params = obj.values[selectedRow].zoomParam;
//			getChartData(chartCode, "dialogChart", params);
//		});
//	}
//	
//	$("#" + divId).find("table").addClass("google-left");
//	
//	if (obj.sync){
//		setInterval(function (){
//			synchronizeChart(boxNumber);
//		}, 40*1000);
//	}

}

function formatNumber(number)
{
    var number = number.toFixed(2) + '';
    var x = number.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

function synchronizeChart(boxNumber){
	if (!tabsList[currentTab].charts[boxNumber]["chart"]){ return;}
	// get the chart's data from the server and draw it on screen:
	var chartCode = tabsList[currentTab].charts[boxNumber]["chartCode"]; 
	getChartData(chartCode, boxNumber, null, false, currentTab, true);
}

/*******************************************************************************
 * Draw a Bar Chart and put it in a <div>
 ******************************************************************************/
function drawBar(obj, divId, graphHeight) {
	// Create and populate the data table.
	var data = new google.visualization.DataTable();

	data.addColumn(obj.cols.x.type, obj.cols.x.title);
	var chartViewCols = [];
	chartViewCols[0] = 0;
	$.each(obj.cols.y, function(i, colItem) {
		if (!colItem.show) {return;}
		var type =  colItem.type;
		if (type == "stringTooltip"){
			data.addColumn({type: 'string', role: 'tooltip'});
			return;
		}
		data.addColumn(type, colItem.title);
		chartViewCols.push(i+1);
	});
	
	if (obj.cols.x.type == "number"){
		obj.values.sort(function(a, b) {
			return compareNumberDesc(a,b,"title");
		});
	}
	
	var rows = [];
	$.each(obj.values, function(i, valItem) {
		var row = [];
		var title = valItem.title;
		if (obj.cols.x.type == "string") {title = title.toString();}
		if (obj.cols.x.type == "number") {title = parseFloat(title)}
		row.push(title);
		$.each(valItem.vals, function(j, val) {
			if (!obj.cols.y[j].show) {return;}
			if (obj.cols.y[j].type == "number") {val = parseInt(val);}
			row.push(val);
		});
		
		rows.push(row);
	});
	data.addRows(rows);
	
	var chartWidth = 550;
	var chartPosition = "right";
	if(obj.chartSize == "small") {
		chartWidth = 250;
		chartPosition = "top";		
	}
	if(obj.chartSize == "large") {
		chartWidth = 700;
	}
	if(obj.chartSize == "big"){
		chartPosition = "none";
	}

	isStacked = (obj.isStacked == true);

	var options = {
			titleTextStyle : {
				color : "#555555",
				fontSize: 18
			},
			title : obj.titles.chart,
			width : $('#' + divId).width(),// chartWidth,
			height : graphHeight ? graphHeight : 275, // 340,
			isStacked : isStacked,
			legend : {
				position : chartPosition
			},
			animation : {
				duration : 1000
			},
			vAxis : {
				title : obj.titles.axis.y,
				baseline : 0
			},
			hAxis : {
				title : obj.titles.axis.x,
				slantedText:true
			}
	};
	
	if (obj.chartColor){
		options.colors = obj.chartColor;
	}
	
	if (obj.chartSize == "big"){
		options.chartArea = {left:50,top:40,width:'80%',height:'75%'};
	}
	
	if (obj.addLine){
		options.series = {};
		options.series[0] = {targetAxisIndex:0};
		options.series[1] = {type: "line", targetAxisIndex:1};
		
		options.vAxes = {};
		options.vAxes[0] = {title: obj.titles.axis.y, viewWindowMode:'explicit',gridlines: {color: 'transparent'}};
		options.vAxes[1] ={title: obj.titles.axis.y2, gridlines: {color: 'transparent'}};
		
	}
	
	var formatter = new google.visualization.NumberFormat({pattern:'#,###'});
	$.each(obj.cols.y, function(i, colItem) {
		if(colItem.type == "number"){
			formatter.format(data, i+1);
		}
	});
	
	if (obj.filterBy != undefined){
		// Create a dashboard.
	    var dashboard = new google.visualization.Dashboard(
	        document.getElementById(divId));
	
	    // Create a range slider, passing some options
	    var rangeSlider = new google.visualization.ControlWrapper({
	      controlType: 'ChartRangeFilter',
	      containerId: 'rangeFilter',
	      options: {
	    	  filterColumnIndex: obj.filterBy,
	          ui: {
	              chartType: 'AreaChart',
	              snapToData: true, // this bugger is not working
	              chartOptions: {
	                  width: chartWidth,
	                  height: 50,
	                  chartArea: {
	                      left: 40,
	                      top: 0,
	                      width: 700,
	                      height: 50
	                  }
	              },
	              chartView: {
	                  columns: chartViewCols
	              },
	              minRangeSize: 1
	              
	          }
	     },
	    view: {
	        columns: [{
	            type: 'number',
	            calc: function (dt, row) {
	                return {v: row, f: dt.getFormattedValue(row, 0)};
	            }
	        }, 1, 2]
	    }
	    });
	   
	 // Chart
	   barChart = new google.visualization.ChartWrapper({
	    	chartType: 'ColumnChart',
	        containerId: 'divChart',
	        dataTable: data,
	        options: {
	            width: chartWidth,
	            height: 340,
	            chartArea: {
	                left: 40,
	                top: 20,
	                width: 700,
	                height: 250
	            }
	        },
	        view: {
	            columns: [{
	                type: 'string',
	                label: data.getColumnLabel(0),
	                calc: function (dt, row) {
	                    return dt.getFormattedValue(row, 0);
	                }
	            }, 1, 2]
	        }
	    });
	
	    // Establish dependencies, declaring that 'filter' drives 'pieChart',
	    // so that the pie chart will only display entries that are let through
	    // given the chosen slider range.
	    dashboard.bind(rangeSlider, barChart);
	    
	    // Draw the dashboard.
	    dashboard.draw(data);
	}
	else{
		// Create and draw the visualization.
		barChart = new google.visualization.ColumnChart(document.getElementById(divId));
		barChart.draw(data, options);
	}
	
	// zoom dialog
	if(obj.zoom != null){
		google.visualization.events.addListener(barChart, 'select', function(event) {	
			if (typeof(barChart.getSelection) == "function"){
				var selection = barChart.getSelection();
			}
			else {
				selection = barChart.getChart().getSelection();
			}
			
			if(selection[0] == null){return;}
			if(selection[0].row == null){return;}
			var selectedRow = selection[0].row;
			
			$("#zoomDialog").trigger('click');
			var chartCode = obj.zoom.chartCode;
			var params = obj.values[selectedRow].zoomParam;
			// var divId = "dialogChart";
			getChartData(chartCode, "dialogChart", params);
		});
	}
	
}

/*******************************************************************************
 * Draw a Line Chart and put it in a <div>
 ******************************************************************************/
function drawLine(obj, divId) {
	// Create and populate the data table.
	var data = new google.visualization.DataTable();

	data.addColumn(obj.cols.x.type, obj.cols.x.title);
	$.each(obj.cols.y, function(i, colItem) {
		data.addColumn(colItem.type, colItem.title);
	});
	
	var rows = [];
	$.each(obj.values, function(i, valItem) {
		var row = [];
		row.push(valItem.title.toString());
		$.each(valItem.vals, function(j, val) {
			row.push(val);
		});
		
		rows.push(row);
	});
	data.addRows(rows);

//	var chartWidth = 550;
//	if(obj.chartSize == "small") {
//		chartWidth = 250;
//	}
//	if(obj.chartSize == "large") {
//		chartWidth = 840;
//	}
	
	var options = {
		titleTextStyle : {
			color : "#555555",
			fontSize: 18
		},
		title : obj.titles.chart,
		width : $('#' + divId).width(),// 400,
//		height : 340,
		legend : {
			position : 'top'
		},
		animation : {
			duration : 1000,
			easing : 'out'
		},
		pointSize : 3,
		hAxis : {
			title : obj.titles.axis.x
		}
	};

	var formatter = new google.visualization.NumberFormat(
			{pattern:'#,###'});
	formatter.format(data, 1);
	
	// Create and draw the visualization.
	lineChart = new google.visualization.LineChart(document.getElementById(divId));
	lineChart.draw(data, options);
	
	// zoom dialog
	if(obj.zoom != null){
		google.visualization.events.addListener(lineChart, 'select', function(event) {
			var selection = lineChart.getSelection();
			if(selection[0] == null){
				return;
			}
			if(selection[0].row == null){
				return;
			}
			var selectedRow = selection[0].row;
	
			$("#zoomDialog").trigger('click');
			var chartCode = obj.zoom.chartCode;
			var params = obj.values[selectedRow].zoomParam;
			getChartData(chartCode, "dialogChart", params);
		});
	}
}

/*******************************************************************************
 * Draw a Area Chart and put it in a <div>
 ******************************************************************************/
function drawArea(obj, divId) {
	// Create and populate the data table.
	var data = new google.visualization.DataTable();

	data.addColumn(obj.cols.x.type, obj.cols.x.title);
	$.each(obj.cols.y, function(i, colItem) {
		data.addColumn(colItem.type, colItem.title);
	});
	
	var rows = [];
	$.each(obj.values, function(i, valItem) {
		var row = [];
		var title = valItem.title;
		if (obj.cols.x.type == "string") {title = title.toString();}
		row.push(title);
		$.each(valItem.vals, function(j, val) {
			row.push(val);
		});
		
		rows.push(row);
	});
	data.addRows(rows);

	var chartWidth = 550;
	if(obj.chartSize == "small") {
		chartWidth = 250;
	}
	if(obj.chartSize == "large") {
		chartWidth = 840;
	}
	
	var options = {
		titleTextStyle : {
			color : "#555555",
			fontSize: 18
		},
		title : obj.titles.chart,
		width : chartWidth,
		height : 340,
		legend : {
			position : 'top'
		},
		animation : {
			duration : 1000,
			easing : 'out'
		},
		pointSize : 0,
		isStacked: true,
		hAxis : {
			title : obj.titles.axis.x,
			gridlines: 5
		}
		
	};

	var formatter = new google.visualization.NumberFormat(
			{pattern:'#,###'});
	formatter.format(data, 1);
	
	// Create and draw the visualization.
	var areaChart = new google.visualization.AreaChart(document.getElementById(divId));
	areaChart.draw(data, options);
	
	// zoom dialog
	if(obj.zoom != null){
		google.visualization.events.addListener(areaChart, 'select', function(event) {
			var selection = areaChart.getSelection();
			if(selection[0] == null){
				return;
			}
			if(selection[0].row == null){
				return;
			}
			var selectedRow = selection[0].row;
	
			$("#zoomDialog").trigger('click');
			var chartCode = obj.zoom.chartCode;
			var params = obj.values[selectedRow].zoomParam;
			getChartData(chartCode, "dialogChart", params);
		});
	}
}

/*******************************************************************************
 * Draw a Stepped Area Chart and put it in a <div>
 ******************************************************************************/
function drawSteppedArea(obj, divId, boxNumber) {
	
	if (obj.sync && tabsList[currentTab].charts[boxNumber]["chart"]){
		var data = tabsList[currentTab].charts[boxNumber]["chartData"];
		var steppedAreaChart = tabsList[currentTab].charts[boxNumber]["chart"];	
		var options = tabsList[currentTab].charts[boxNumber]["chartOptions"];	
		
		options.animation = {
	        duration: 1000,
	        easing: 'in'
	    };
		
		data.removeRows(0,data.tf.length);
		var rows = [];
		$.each(obj.values, function(i, valItem) {
			var row = [];
			var title = valItem.title;
			if (obj.cols.x.type == "string") {title = title.toString();}
			row.push(title);
			$.each(valItem.vals, function(j, val) {
				row.push(val);
			});
			
			rows.push(row);
		});
		data.addRows(rows);
		
		var formatter = new google.visualization.NumberFormat(
				{pattern:'#,###'});
		formatter.format(data, 1);
		steppedAreaChart.draw(data, options);
			
		return;
	}
	
	// Create and populate the data table.
	var data = new google.visualization.DataTable();

	data.addColumn(obj.cols.x.type, obj.cols.x.title);
	$.each(obj.cols.y, function(i, colItem) {
		data.addColumn(colItem.type, colItem.title);
	});
	
	var rows = [];
	$.each(obj.values, function(i, valItem) {
		var row = [];
		var title = valItem.title;
		if (obj.cols.x.type == "string") {title = title.toString();}
		row.push(title);
		$.each(valItem.vals, function(j, val) {
			row.push(val);
		});
		
		rows.push(row);
	});
	data.addRows(rows);

	var chartWidth = 550;
	if(obj.chartSize == "small") {
		chartWidth = 250;
	}
	if(obj.chartSize == "large") {
		chartWidth = 840;
	}
	
	var options = {
		titleTextStyle : {
			color : "#555555",
			fontSize: 18
		},
		title : obj.titles.chart,
		width : chartWidth,
		height : 340,
		legend : {
			position : 'top'
		},
		animation : {
			duration : 1000,
			easing : 'out'
		},
		pointSize : 0,
		isStacked: true,
		connectSteps: false,
		hAxis : {
			title : obj.titles.axis.x,
			gridlines: 5
		},
		vAxis : {title : obj.titles.axis.y}
		
	};
	
	if (obj.chartColor){
		options.colors = obj.chartColor;
	}

	var formatter = new google.visualization.NumberFormat(
			{pattern:'#,###'});
	formatter.format(data, 1);
	
	// Create and draw the visualization.
	var steppedAreaChart = new google.visualization.SteppedAreaChart(document.getElementById(divId));
	steppedAreaChart.draw(data, options);
	
	tabsList[currentTab].charts[boxNumber]["chart"] = steppedAreaChart;
	tabsList[currentTab].charts[boxNumber]["chartData"] = data;
	tabsList[currentTab].charts[boxNumber]["chartOptions"] = options;
	
	// zoom dialog
	if(obj.zoom != null){
		google.visualization.events.addListener(steppedAreaChart, 'select', function(event) {
			var selection = steppedAreaChart.getSelection();
			if(selection[0] == null){
				return;
			}
			if(selection[0].row == null){
				return;
			}
			var selectedRow = selection[0].row;
	
			$("#zoomDialog").trigger('click');
			var chartCode = obj.zoom.chartCode;
			var params = obj.values[selectedRow].zoomParam;
			getChartData(chartCode, "dialogChart", params);
		});
	}
	
	if (obj.sync){
		setInterval(function (){
			synchronizeChart(boxNumber);
		}, 40*1000);
	}
}

/*******************************************************************************
 * Draw a Table Chart and put it in a <div>
 ******************************************************************************/
function drawTable(obj, divId) {
	// Create and populate the data table.
	var data = new google.visualization.DataTable();
	var maxFilterValue = 0;
	var minFilterValue = 999999999999;

	$.each(obj.cols, function(j, colItem) {
		data.addColumn(colItem.type, colItem.title);
	});
	
	if (!obj.values) {
		obj.values = [];
	}

	data.addRows(obj.values.length);

	$.each(obj.values, function(i, valItem) {
		$.each(obj.cols, function(j, colItem) {
			var valueOnCell = valItem[j].val;
			if (colItem.type == "string") {
				valueOnCell = valueOnCell.toString();
				var classes = "TrightText";
			} if (colItem.type == "number") {
				if (valueOnCell == null) { valueOnCell=0;}
				valueOnCell = parseFloat(valueOnCell);
				var classes = "";
			} 
			
			if(obj.filterBy && obj.filterBy == j){
				maxFilterValue = (valueOnCell>maxFilterValue?valueOnCell:maxFilterValue);
				minFilterValue = (valueOnCell<minFilterValue?valueOnCell:minFilterValue);
			}
			
			if (valItem[j].valView == "") {
				valItem[j].valView = valueOnCell;
			}
			
			var style = {};
			
			if(valItem[j].style != null){	
				classes = "TrightText";
				if (colItem.type == "number") {classes = "google-visualization-table-td-number";}
				$.each(valItem[j].style, function(k, styleName) {
					classes += " T" + styleName; //like Tgreen for green font, Tbold for bold font etc.
				});
			}
			
			if ((j == 0 && user_lang !="HB") || (j == obj.cols.length-1 && user_lang == "HB")){
				if(obj.zoom != null){
					if(obj.values[i][j].zoomParam != undefined){
						classes += " TzoomBlueFont";
					}
				}
			}

			style.className = classes;
			data.setCell(i, j, valueOnCell, valueOnCell, style);
		});
		
	});
	
	var sortColumn = (obj.sortColumn?obj.sortColumn:-1)
	var sortAscending = (obj.sortAscending != null?obj.sortAscending:true)

	var cssClassNames = {
			'headerRow' : 'tableHeaderClass tableBorderClass',
			'headerCell': 'tableBorderClass',
			'tableRow': 'tableBorderClass',
			'tableCell': 'tableBorderClass',
			'right-text' : 'TrightText'
			};

	var formatter = new google.visualization.NumberFormat(
			{pattern:'#,###.##'});
	$.each(obj.cols, function(i, col){
		if(col.type == "number"){
			formatter.format(data, i);
		}
	});
	// formatter.format(data, 1);
	
	if (obj.filterBy){
		// Create a dashboard.
	    var dashboard = new google.visualization.Dashboard(
	        document.getElementById(divId));
	    
	    maxFilterValue = Math.ceil(maxFilterValue / 50) * 50;
	    minFilterValue = Math.floor(minFilterValue / 50) * 50;
	    
	    // Create a range slider, passing some options
	    var donutRangeSlider = new google.visualization.ControlWrapper({
	      'controlType': 'NumberRangeFilter',
	      'containerId': 'filterChart',
	      'options': {
	        'filterColumnIndex': obj.filterBy,
	        'maxValue' : maxFilterValue,
	        'minValue' : minFilterValue,
	        'ui':{
	        	'format': 'decimalSymbol'
	        	}
	        }
	    });
	    

	    // Create a pie chart, passing some options
	    var tableChart = new google.visualization.ChartWrapper({
	      'chartType': 'Table',
	      'containerId': 'divChart',
	      'options': {
	  		'page' : 'enable',
	  		'pageSize' : 14,
	  		'cssClassNames': cssClassNames,
	  		'sortColumn': sortColumn,
			'sortAscending': sortAscending 
	      }
	    });

	    // Establish dependencies, declaring that 'filter' drives 'pieChart',
	    // so that the pie chart will only display entries that are let through
	    // given the chosen slider range.
	    dashboard.bind(donutRangeSlider, tableChart);

	    // Draw the dashboard.
	    dashboard.draw(data);
	    
	} else{				
		var options = {
				// page : obj.options.paging,
				page : 'enable',
				pageSize : 14,
				// rtlTable : true,
				cssClassNames: cssClassNames,
				sortColumn: sortColumn,
				sortAscending: sortAscending
				//showRowNumber: true
				// showRowNumber : obj.options.showRowNumber
			};
		
		// Create and draw the visualization.
		var tableChart = new google.visualization.Table(document.getElementById(divId));
		tableChart.draw(data, options);
	}
	
	//$(".tableHeaderClass").show();
	if(obj.noTableHaderLine){
		$("#" + divId + " .tableHeaderClass").hide();
	}
	
	if(obj.addTotal){
		tableChartAddTotal(obj,data,divId);
	}
	
    // zoom dialog
	if(obj.zoom != null){
		if (obj.filterBy){
			var ready = {chart1: false, chart2: false};
			tableChartBox = tableChart;
			tableChartBoxObj = obj;
			tableChartDivId = divId;
			createListenersFlag = true;
			google.visualization.events.addListener(tableChart, 'ready', function() {
			    ready.chart1 = true;
			    // whichever listener fires second should fire set up the 'select' event handlers
			    if (ready.chart2) {
			    	if (createListenersFlag){
			        	createListeners(tableChartBox.getChart(),tableChartBoxObj);
			        	createListenersFlag = false;
			        }   
			        if(tableChartBoxObj.addTotal){			        	
			        	tableChartAddTotal(tableChartBoxObj,tableChartBox.getDataTable(),tableChartDivId);
			        }
			    }
			});
			
			google.visualization.events.addListener(donutRangeSlider, 'ready', function() {
			    ready.chart2 = true;
			    // whichever listener fires second should fire set up the 'select' event handlers
			    if (ready.chart1) {
			    	if (createListenersFlag){
			    		createListeners(tableChartBox.getChart(),tableChartBoxObj);
			    		createListenersFlag = false;
			    	}
			    }
			});
			
		} else{			
			createListeners(tableChart,obj);
		}
	}
}

function tableChartAddTotal(obj,data,divId){
	$(".tableTotal").remove();
	var html = "<table class='tableTotal'>";
	
	var obj2 = jQuery.extend(true, {},obj);
	var cols = (user_lang == "HB"? obj2.cols.reverse():obj2.cols);
	
	var i = cols.length;
	$.each(cols, function(j, colItem) {
		i -= 1;
		if (colItem.type == "string"){return;}
		if (colItem.title.indexOf("%") != -1){return;}
		
		html += "<tr class='tableBorderClass'>";
		html += "<td class='tableHeaderClass tableBorderClass'>" +  (user_lang == "HB"? $.t("total") + colItem.title: $.t("total") + colItem.title ) + "</td>";
		html += "<td>" + formatNumber(getSum(data, (user_lang == "HB"?i:j))) + "</td>";
		html += "</tr>";
	});
	
	html += "</table>";
	$("#" + divId).append(html);
}

function createListeners(tableChart,obj) {
	google.visualization.events.addListener(tableChart, 'select', function(event) {
		var selection = tableChart.getSelection();
		if(selection[0] == null){
			return;
		}
		if(selection[0].row == null){
			return;
		}
		var selectedRow = selection[0].row;
		
		if (obj.values[selectedRow][0].zoomParam == undefined){
			return;
		}
		
		$("#zoomDialog").trigger('click');
		var chartCode = obj.zoom.chartCode;
		// for now, we set the same zoom parameters on each cell of the row.
		// So, we take the params of the row from its first cell ([0]).
		// We do this because google gives us only the selected row number
		// (on the click event).
		// If later we'll use other charts library, we would take the exact
		// cell's parameters.
		var params = obj.values[selectedRow][0].zoomParam;
		getChartData(chartCode, "dialogChart", params);
	});
}

function getSum(data, column) {
    var total = 0;
    for (i = 0; i < data.getNumberOfRows(); i++)
      total = total + data.getValue(i, column);
    return total;
}

/*******************************************************************************
 * Draw a Pie Chart and put it in a <div>
 ******************************************************************************/
function drawPie(obj, divId, graphHeight) {

	if (obj.values == null) {
		$("#" + divId).html(
				"<p><h2>" + "title" + "</h2></p>");
		return;
	}
	
	obj.values.sort(function(a, b) {
		return compareNumberDesc(a,b,"vals");
	});

	var data = new google.visualization.DataTable();
	data.addColumn(obj.cols.x.type, obj.cols.x.title);
	var yCol = obj.cols.y[0];
	data.addColumn(yCol.type, yCol.title);

	data.addRows(obj.values.length);
	$.each(obj.values, function(i, item) {
		var title = item.title;
		if (obj.cols.x.type == "string") {title = title.toString();}
		data.setValue(i, 0, title);
		data.setValue(i, 1, item.vals[0]);
	});
	
	
	var is3D = obj.options["3D"];
	var pieHole = (obj.options["donut"]?0.3:0);
	
	var options = {
		is3D : true,
//		pieHole: pieHole,
//		pieSliceBorderColor : 'white',
//		sliceVisibilityThreshold : 0,
		width : $('#' + divId).width(),// 333,
		height : graphHeight ? graphHeight : 275,
//		animation : {
//			duration : 1000,
//			easing : 'out'
//		},
		chartArea : {
			width : '90%',
			height : '70%'
		},
//		backgroundColor : {
//			stroke : '#666',
//			strokeWidth : 0
//		},
		legend : {
			position : 'bottom'
		},
		titleTextStyle : {
			color : "#555555",
			fontSize: 18
		},
		title : obj.titles.chart,
	};
	
	if (obj.options["donut"]){
		options.slices = {  
				1: {offset: 0.2},
				5: {offset: 0.1}
			};
	}
	
	if (obj.chartColor){
		options.colors = obj.chartColor;
	}
	
	var formatter = new google.visualization.NumberFormat(
			{pattern:'#,###'});
	formatter.format(data, 1);

	pieChart = new google.visualization.PieChart(document.getElementById(divId));
	pieChart.draw(data, options);
		
	// zoom dialog
	if(obj.zoom != null){
		google.visualization.events.addListener(pieChart, 'select', function(event) {
			var selection = pieChart.getSelection();
			if(selection[0] == null){
				return;
			}
			if(selection[0].row == null){
				return;
			}
			var selectedRow = selection[0].row;
	
			$("#zoomDialog").trigger('click');
			var chartCode = obj.zoom.chartCode;
			var params = obj.values[selectedRow].zoomParam;
			getChartData(chartCode, "dialogChart", params);
		});	
	}
	
}

/*******************************************************************************
 * Draw a Geo Chart and put it in a <div>
 ******************************************************************************/
function drawGeo(obj, divId) {

	if (obj.values == null) {
		$("#" + divId).html(
				"<p><h2>" + "title" + "</h2></p>");
		return;
	}
	
	// Create and populate the data table.
	var data = new google.visualization.DataTable();

	data.addColumn(obj.cols.x.type, obj.cols.x.title);
	$.each(obj.cols.y, function(i, colItem) {
		data.addColumn(colItem.type, colItem.title);
	});
	
	var rows = [];
	$.each(obj.values, function(i, valItem) {
		var row = [];
		row.push(valItem.title.toString());
		$.each(valItem.vals, function(j, val) {
			row.push(val);
		});
		
		rows.push(row);
	});
	data.addRows(rows);
	
	
	var chartWidth = 550;
	if(obj.chartSize == "small") {
		chartWidth = 250;
	}
	if(obj.chartSize == "large") {
		chartWidth = 840;
	}
	var displayMode = obj.displayMode;
	var region = obj.region;
	
	var options = {
		titleTextStyle : {
			color : "#555555",
			fontSize: 18
		},
		title : obj.titles.chart,
		width : '100%', // chartWidth,
		displayMode: displayMode,
		region: region,
		colorAxis: {colors: ['green', 'blue']},
		legend : {
			position : 'top'
		},
		animation : {
			duration : 1000,
			easing : 'out'
		},
		pointSize : 3,
		hAxis : {
			title : obj.titles.axis.x
		}
	};

	var formatter = new google.visualization.NumberFormat({pattern:'#,###'});
//	$.each(obj.cols.y, function(i, colItem) {
//		if(colItem.type == "number"){
//			formatter.format(data, i+1);
//		}
//	});
	
	// Create and draw the visualization.
	var geoChart = new google.visualization.GeoChart(document.getElementById(divId));
	geoChart.draw(data, options);
	
	// zoom dialog
	if(obj.zoom != null){
		google.visualization.events.addListener(geoChart, 'select', function(event) {
			var selection = geoChart.getSelection();
			if(selection[0] == null){
				return;
			}
			if(selection[0].row == null){
				return;
			}
			var selectedRow = selection[0].row;
	
			$("#zoomDialog").trigger('click');
			var chartCode = obj.zoom.chartCode;
			var params = obj.values[selectedRow].zoomParam;
			getChartData(chartCode, "dialogChart", params);
		});
	}	
}

<!DOCTYPE html>
<html lang="en-us">
<head>
	<jsp:include page="pageParts/Head.html"></jsp:include>
</head>

<body class="_smart-style-6 menu-on-top smart-rtl background4">

	<div id="loading-animation-div">
		<div id="loading-animation">
			<span class="loading-text">בטעינה</span>
			<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
		</div>
	</div>

	<jsp:directive.page contentType="text/html;charset=UTF-8"/>

	<jsp:include page="pageParts/Header.html"></jsp:include>
	
	<!-- menu -->
	<aside id="left-panel">
		<div id="manage-edit-div">
			<!-- <button id="done-edit-page" class="btn btn-default edit-state">שמור</button> -->
			<button id="save-button" class="btn btn-default edit-state">SAVE</button>      
			<button id="cancel-edit-page" class="btn btn-default edit-state">בטל</button> 
			<button id="edit-page" class="btn btn-default regular-state">מצב עריכה</button>
			
			<button id="delete-all-button" class="edit-state">DELETE ALL</button>      
			<button class="add-item-button edit-state" data-type="graph">Add graph</button>
			<button href="#add-info-square-modal" data-toggle="modal" class="edit-state" data-type="data-cube">Add data cube</button>
			<button href="#add-shortcut-modal" data-toggle="modal" class="edit-state" data-type="shortcut">Add shortcut</button>
			<span style="margin: 25px;"></span>
		</div>
	    <nav>
	    	<ul id="menu-list">
    			<li class="search-app-li">
    				<a href="javascript:;"><i class="fa fa-lg fa-search"></i> <span class="menu-item-parent">חפש בתפריט</span></a>
    				<input id="search-in-menu" class="search-app form-control" type="text" name="param" placeholder="חפש בתפריט">
    			</li>
	    	</ul>        
	    </nav>
	</aside>

    <!-- MAIN PANEL -->
    <div id="main" role="main" class="narrow">

      <div id="content" class="row">					

        <div class="col-lg-2 col-md-3">
          <div id="last-apps-section" class="list-section menu-style">
            <label class="section-title">יישומים אחרונים</label>	
            <ul class=" bordered-list" data-area-name="last-apps">
              <li class="last-app list-item template-item">
                <a href="javascript:;" class="template-field set-tooltip-field" data-field="TXT"></a>
              </li>
            </ul>			
          </div>
          <div id="last-docs-section" class="list-section menu-style" >
            <label class="section-title">מסמכים אחרונים</label>	
            <ul class="bordered-list" data-area-name="last-docs">
              <li class="last-app list-item template-item">
                <a href="javascript:;" class="template-field set-tooltip-field" data-field="TXT"></a>
              </li>
            </ul>			
          </div>
        </div>
            
        <div class="col-lg-10 col-md-9">
          
          <div id="items-container">
            <div class="grid-stack">



            </div>
          </div>

        </div>

        <div id="templates-area" style="display: none;">
          
			<div href="javascript:;" class="department sort-item __template-item" data-template-type="shortcut">
				<a class="department-button" href="javascript:;">
					<header><span class="template-field set-tooltip-field" data-field="TXT"></span></header>
					<div class="department-content">
						<i class="template-field" data-field="icon"></i>
					</div>
				</a>	
				<a href="#add-shortcut-modal" data-toggle="modal" class="add-item-button placeholder-only item-scale" title="Add shortcut">
					<span>+</span>
				</a>					
				<a class="delete-shortcut" data-toggle="popover" data-trigger="focus" data-original-title="הסר קיצור דרך" data-func="removeShortcut">x</a>
          	</div>
          
          	<div class="info-square item-scale sort-item template-item" data-template-type="info-square">
				<a class="info-square-button" href="javascript:;">
					<label class="sum"><span class="sign">₪</span><span class="template-field" data-field="VAL"></span></label>
					<label class="title template-field set-tooltip-field" data-field="TXT"></label>
				</a>
				<a href="#add-info-square-modal" data-toggle="modal" class="add-item-button placeholder-only item-scale" title="Add shortcut">
					<span>+</span>
				</a>
				<a class="delete-shortcut" data-toggle="popover" data-trigger="focus" data-original-title="הסר ריבוע מידע" data-func="removeInfoSquare">x</a>
			</div>

          	<div class="graph sort-item item-scale template-item loading" data-template-type="graph">
				<div class="graph-title"><label></label></div>
				<img id="graph-loading-image" src="img/loading.gif">
				<div class="graph-div">
					<canvas></canvas>
				</div>
				<a href="#add-graph-modal" data-toggle="modal" class="add-item-button placeholder-only item-scale" title="Add shortcut">
					<span>+</span>
				</a>
				<a class="delete-shortcut" data-toggle="popover" data-trigger="focus" data-original-title="הסר גרף" data-func="removeGraph">x</a>
			</div>

				</div>					
							
		  	</div>       

    </div>

	<jsp:include page="pageParts/Footer.html"></jsp:include>

	<!--<jsp:include page="pageParts/Modals.html"></jsp:include>-->

    <jsp:include page="pageParts/Scripts.html"></jsp:include>
	
	<script src="js/plugin/moment/moment.min.js"></script>
	<script src="js/plugin/chartjs/chart.js"></script>
	<script src="js/plugin/select2/dist/js/select2.js"></script>
	
	<script type="text/javascript" src="https://www.google.com/jsapi"></script>
	<script type="text/javascript">
		google.load('visualization', '1.0', {
			packages : [ 'corechart', 'gauge', 'table', 'controls', 'geochart' ]
		});
	</script>		
	
	<script src="js/plugin/jquery-validate/jquery.validate.min.js"></script>
	
	<script src="js/cav-portal-main.js" type="text/javascript" charset="utf-8"></script>
	<script src="js/cav-drawCharts.js" type="text/javascript" charset="utf-8"></script>
	
	<script src="js/cav-newCharts.js" type="text/javascript" charset="utf-8"></script>

  <script src="js/plugin/gridstack/gridstack.js"></script>
  <script src="js/plugin/gridstack/gridstack.jQueryUI.js"></script>

	<script src="js/index.js" type="text/javascript" charset="utf-8"></script>
	<script src="js/newSorting.js" type="text/javascript" charset="utf-8"></script>

	<template id="confirmation-popover-template">
	    <div class="confirmation-popover-content">
	        <p>האם אתה בטוח?</p>
	        <div class="clearfix">
	            <button id="confirmation-popover-yes" class="pull-right btn btn-default">כן</button>
	            <button id="confirmation-popover-no" class="pull-left btn btn-default" data-dismiss="popover">לא</button>
	        </div>
	    </div>
	</template>

	<div id="add-shortcut-modal" class="modal fade reset-on-close" role="dialog">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>הוסף קיצור דרך</h3>
                </div>
                <div class="modal-body">
                    <form id="add-shortcut-form" name="add-shortcut-form" class="style-validation">
                        <div class="form-group search-app-parent">
                            <label>בחר אפליקציה</label>
                            <input id="add-shortcut" name="add-shortcut" class="search-app form-control" required />
                        </div>
                        <div class="form-group">
                            <label>כותרת לקיצור הדרך</label>
                            <input id="shortcut-title" name="shortcut-title" class="form-control" required />
                        </div>                           
                    </form>
                </div>
                <div class="modal-footer">
                    <button id="add-shortcut-modal-button" class="btn btn-lg modal-submit-button">הוסף</button>
					<button id="add-shortcut-modal-cancel-button" class="btn btn-lg modal-cancel-button" data-dismiss="modal">בטל</button>
				</div>
            </div>
        </div>
    </div>

	<div id="add-info-square-modal" class="modal fade reset-on-close" role="dialog">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>הוסף קוביות מידע</h3>
                </div>
                <div class="modal-body">
                    <form id="add-info-square-form" name="add-shortcut-form" class="style-validation">
                        <div class="form-group">
                            <label>בחר נתונים להצגה</label>
                            <select id="add-info-square-select" name="add-info-square" class="search-app form-control" required></select>
                        </div>
                        <div class="form-group search-app-parent">
                            <label>בחר אפליקציה להרצה (בקליק)</label>
                            <input id="info-square-application" class="search-app form-control" required/>
                        </div>                           
                    </form>
                </div>
                <div class="modal-footer">
                    <button id="add-info-square-modal-button" class="btn btn-lg modal-submit-button">הוסף</button>
					<button id="add-info-square-modal-cancel-button" class="btn btn-lg modal-cancel-button" data-dismiss="modal">בטל</button>
                </div>
            </div>
        </div>
    </div>

	<div id="add-graph-modal" class="modal fade reset-on-close" role="dialog">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>הוסף גרף</h3>
                </div>
                <div class="modal-body">
                    <form id="add-graph-form" name="add-graph-form" class="style-validation">
                        <div class="form-group search-app-parent">
                            <label>בחר גרף</label>
                            <select id="add-graph-select" name="add-graph-select" class="search-app form-control" required></select>
                        </div>       
                        <label class="add-graph-error"></label>                    
                    </form>
                </div>
                <div class="modal-footer">
                    <button id="add-graph-modal-button" class="btn btn-lg modal-submit-button">הוסף</button>
				          	<button id="add-graph-modal-cancel-button" class="btn btn-lg modal-cancel-button" data-dismiss="modal">בטל</button>
                </div>
            </div>
        </div>
    </div>

	<div id="large-graph-modal" class="modal fade" role="dialog">
		<div class="modal-dialog">
            <div class="modal-content">
            	<div class="modal-header">
                    <h3></h3>
                </div>
                <div class="modal-body graph-mode loading">
                	<img id="graph-loading-image" src="img/loading.gif" />
                	<a href="javascript:;" id="change-graph-mode-button">
                		<i class="fa fa-table table-icon"></i>
                		<i class="fa fa-bar-chart-o graph-icon"></i>
                	</a>
                	<div id="large-graph-div">
						<canvas></canvas>
					</div>
                </div>
				<div class="modal-footer">
					<button class="btn btn-lg btn-default" data-dismiss="modal">סגור</button>
				</div>
			</div>
        </div>		
	</div>

</body>

</html>
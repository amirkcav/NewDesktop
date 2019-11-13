<!DOCTYPE html>
<html lang="en-us">
<head>
	<jsp:include page="pageParts/Head.html"></jsp:include>
</head>

<body class="background4 clearfix">

	<div id="loading-animation-div">
		<div id="loading-animation">
			<span class="loading-text">בטעינה</span>
			<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
		</div>
	</div>

	<jsp:directive.page contentType="text/html;charset=UTF-8"/>

	<!--HEADER-->
	
	<!-- menu -->
	<div id="menu-row" class="clearfix">		
		<ul id="menu-list" class="sm sm-rtl sm-blue">
            <li class="cav-logo-li">
                <img src="img/cav_logo.jpg"/>
            </li>
			<li class="search-app-li app">
				<a href="javascript:;"><i class="fa fa-lg fa-search"></i> <span class="menu-item-parent">חפש בתפריט</span></a>
				<input id="search-in-menu" class="search-app form-control" type="text" name="param" placeholder="חפש בתפריט">
			</li>
        </ul>        
        <label id="user-name-label" class="pull-left">
            <a href="https://www.google.com" target="_blank" style="color: inherit;">
                Amir Karasik
                <i class="fa fa-user"></i>
            </a>
        </label>
	</div>

    <!-- MAIN PANEL -->
    <div id="main" role="main" class="_narrow">

      <div id="content" class="_row">					

        <div id="right-side" class="col-lg-2 col-md-3">
          <div id="last-apps-section" class="list-section _menu-style">
            <label class="section-title">יישומים אחרונים</label>	
            <span class="list-count pull-left"></span>
            <ul class="_bordered-list">
              <li class="last-app list-item template-item">
                <a href="javascript:;" class="template-field set-tooltip-field" data-field="TXT"></a>
              </li>
            </ul>			
          </div>
          <div id="last-docs-section" class="list-section _menu-style" >
            <label class="section-title">מסמכים אחרונים</label>	
            <span class="list-count pull-left"></span>
            <ul class="_bordered-list">
              <li class="last-app list-item template-item">
                <a href="javascript:;" class="template-field set-tooltip-field" data-field="TXT"></a>
              </li>
            </ul>			
          </div>
        </div>
            
        <div class="col-lg-10 col-md-9">
            <div id="manage-edit-div" class="clearfix">			
                <a id="edit-page-button" class="button regular-state">
                    <span class="icon"></span>
                    <span class="text">עריכה</span>
                </a>                
                <a id="save-button" class="button edit-state">
                    <span class="icon"></span>
                    <span class="text">שמירה</span>
                </a>      
                <a href="#add-shortcut-modal" data-toggle="modal" class="button edit-state" data-type="shortcut">
                    <span class="text">Add shortcut</span>
                </a>
                <a href="#add-info-square-modal" data-toggle="modal" class="button edit-state" data-type="data-cube">
                    <span class="text">Add data cube</span>
                </a>
                <a href="#add-graph-modal" data-toggle="modal" class="button edit-state" data-type="graph">
                    <span class="text">Add graph</span>
                </a>
                <a id="cancel-edit-page-button" class="button edit-state">
                    <span class="icon"></span>
                    <span class="text">חזרה</span>
                </a> 
            </div>
            <div id="items-container">
                <div class="grid-stack">

                </div>
            </div>
        </div>				
							
	  </div>       

    </div>

	<jsp:include page="pageParts/Footer.html"></jsp:include>

	<!--<jsp:include page="pageParts/Modals.html"></jsp:include>-->

    <jsp:include page="pageParts/Scripts.html"></jsp:include>
	
	<script src="js/plugin/moment/moment.min.js"></script>
	<script src="js/plugin/chartjs/chart.js"></script>
	<script src="js/plugin/chartjs/Gauge.js"></script>

	<script src="js/plugin/select2/dist/js/select2.js"></script>
	
	<script src="js/plugin/smartmenus/jquery.smartmenus.js"></script>

	<!-- <script type="text/javascript" src="https://www.google.com/jsapi"></script> -->
	<!-- <script type="text/javascript">
		google.load('visualization', '1.0', {
			packages : [ 'corechart', 'gauge', 'table', 'controls', 'geochart' ]
		});
	</script>		 -->
	
	<script src="js/plugin/jquery-validate/jquery.validate.min.js"></script>
	
	<!-- <script src="js/cav-portal-main.js" type="text/javascript" charset="utf-8"></script>
	<script src="js/cav-drawCharts.js" type="text/javascript" charset="utf-8"></script> -->
	
	<script src="js/cav-newCharts.js" type="text/javascript" charset="utf-8"></script>

  <script src="js/plugin/gridstack/gridstack.js"></script>
  <script src="js/plugin/gridstack/gridstack.jQueryUI.js"></script>

	<script src="js/index.js" type="text/javascript" charset="utf-8"></script>
	<script src="js/newSorting.js" type="text/javascript" charset="utf-8"></script>

	<template id="confirmation-popover-template">
	    <div class="confirmation-popover-content">
	        <p>האם אתה בטוח?</p>
	        <div class="clearfix">
	            <button id="confirmation-popover-yes" class="pull-right btn btn-default" data-dismiss="popover">כן</button>
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

    <div id="manage-favorites-modal" class="modal fade reset-on-close" role="dialog">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>נהל מועדפים</h3>
                </div>
                <div class="modal-body">
                    <ul id="favorites-list" class="jq-sortable">

                    </ul>
                    <div class="clearfix">
                        <button id="add-directory-button" class="pull-right" disabled>הוסף ספרייה</button>
                        <input id="add-directory-name" class="pull-right" />
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="manage-favorites-submit-button" class="btn btn-lg modal-submit-button" data-dismiss="modal">שמור</button>
                    <button id="manage-favorites-cancel-button" class="btn btn-lg modal-cancel-button" data-dismiss="modal">בטל</button>
                </div>
            </div>
        </div>
    </div>

</body>

</html>
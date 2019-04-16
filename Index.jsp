<!DOCTYPE html>
<html lang="en-us">
<head>
	<jsp:include page="pageParts/Head.html"></jsp:include>
<!-- 	<link rel="stylesheet" type="text/css" media="screen" href="css/a.css">     -->
</head>

<body class="_smart-style-6 menu-on-top smart-rtl background4">

	<jsp:directive.page contentType="text/html;charset=UTF-8"/>

	<jsp:include page="pageParts/Header.html"></jsp:include>
	
	<!-- menu -->
	<aside id="left-panel">
		<div id="manage-edit-div">
			<button id="done-edit-page" class="btn btn-default edit-state">שמור</button>
			<button id="cancel-edit-page" class="btn btn-default edit-state">בטל</button>
			<button id="edit-page" class="btn btn-default regular-state">מצב עריכה</button>
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

        <div id="content">					

			<div id="top-row" class="row">

				<div id="last-apps-section" class="col-lg-2 list-section menu-style">
					<label class="section-title">יישומים אחרונים</label>	
					<ul class=" bordered-list" data-area-name="last-apps">
						<li class="last-app list-item template-item">
							<a href="javascript:;" class="template-field set-tooltip-field" data-field="TXT"></a>
						</li>
					</ul>			
				</div>
								
				<div id="shortcuts-section" class="col-lg-7 buttons-section items-section clearfix sort-area section" data-area-name="shortcuts">
					<div href="javascript:;" class="department sort-item template-item">
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
				</div>

				<div id="messages-section" class="col-lg-3 list-section list-style" >
					<label class="section-title">הודעות מערכת</label>	
					<ul class="bordered-list" data-area-name="last-apps">
						<li class="last-app list-item template-item">
							<a href="javascript:;" class="template-field set-tooltip-field" data-field="TXT"></a>
						</li>
					</ul>			
				</div>

			</div>	
			
			<div id="bottom-row" class="row">
		
				<div id="last-docs-section" class="col-lg-2 list-section menu-style" >
					<label class="section-title">מסמכים אחרונים</label>	
					<ul class="bordered-list" data-area-name="last-docs">
						<li class="last-app list-item template-item">
							<a href="javascript:;" class="template-field set-tooltip-field" data-field="TXT"></a>
						</li>
					</ul>			
				</div>

				<div id="info-squares-section" class="col-lg-3 clearfix sort-area items-section section" data-area-name="info-squares">
					<div class="info-square item-scale sort-item template-item">
						<a class="info-square-button" href="javascript:;">
							<label class="sum"><span class="sign">₪</span><span class="template-field" data-field="VAL"></span></label>
							<label class="title template-field set-tooltip-field" data-field="TXT"></label>
						</a>
						<a href="#add-info-square-modal" data-toggle="modal" class="add-item-button placeholder-only item-scale" title="Add shortcut">
							<span>+</span>
						</a>
						<a class="delete-shortcut" data-toggle="popover" data-trigger="focus" data-original-title="הסר ריבוע מידע" data-func="removeInfoSquare">x</a>
					</div>
				</div>

				<div id="graphs-section" class="clearfix sort-area section col-lg-7" data-sort-flow="horizontal" data-area-name="graphs">
					<div class="graph sort-item item-scale template-item loading">
						<div class="graph-title"><label></label></div>
						<img id="graph-loading-image" src="img/loading.gif">
						<div class="graph-div"></div>
						<a href="#add-graph-modal" data-toggle="modal" class="add-item-button placeholder-only item-scale" title="Add shortcut">
							<span>+</span>
						</a>
						<a class="delete-shortcut" data-toggle="popover" data-trigger="focus" data-original-title="הסר גרף" data-func="removeGraph">x</a>
					</div>
				</div>
			</div>
							
		</div>       

    </div>

	<jsp:include page="pageParts/Footer.html"></jsp:include>

	<!--<jsp:include page="pageParts/Modals.html"></jsp:include>-->

    <jsp:include page="pageParts/Scripts.html"></jsp:include>
	
	<script src="js/plugin/moment/moment.min.js"></script>
	<script src="js/plugin/chartjs/chart.min.js"></script>
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
	
	<script src="js/index.js" type="text/javascript" charset="utf-8"></script>

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
                    <button id="add-shortcut-modal-button" class="btn btn-lg btn-default">הוסף</button>
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
                    <button id="add-info-square-modal-button" class="btn btn-lg btn-default">הוסף</button>
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
                    <button id="add-graph-modal-button" class="btn btn-lg btn-default">הוסף</button>
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
                	<div id="large-graph-div"></div>
                </div>
            </div>
        </div>		
	</div>

</body>

</html>
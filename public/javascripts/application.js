var inspCell;

var formatSummary = function (elCell, oRecord, oColumn, oData) {
  if(oData.include('[hold]')) {
    elCell.innerHTML = oData.replace('[hold]','').strip();
  } else {
    elCell.innerHTML = oData;
  }
};


var formatStatus = function (elCell, oRecord, oColumn, oData) {
  if(oRecord._oData.summary.include('[hold]')) {
    elCell.innerHTML = 'hold';
    elCell.parentNode.parentNode.addClassName('hold');
  } else {
    elCell.innerHTML = oData;
  }
};
 
var ticketsDataTable;

YAHOO.util.Event.addListener(window, "load", function() {
            
  var myColumnDefsY = [
    { key:"number", width:20, label: "#", sortable: true },
    { key:"status", width:100, label: "Status", formatter: formatStatus, sortable: true },
    { key:"summary", label: "Summary", formatter: formatSummary, sortable: true  }
  ];
  
  var myDataSource = new YAHOO.util.DataSource("/tickets.js");
  
  myDataSource.responseType = YAHOO.util.DataSource.TYPE_JSON;
  myDataSource.connXhrMode = "queueRequests";
  myDataSource.responseSchema = {
    resultsList: "items",
    fields: [
      { key: 'number' },
      { key: 'status' },
      { key: 'summary' },
      { key: 'project_id' },
      { key: 'id' }
    ]
  };
  
  ticketsDataTable = new YAHOO.widget.ScrollingDataTable("yscrolling", myColumnDefsY, myDataSource, { 
    height:"20em", 
    width: "100%", 
    selectionMode: 'single',
    initialRequest: ""
  });
  
  //ticketsDataTable.subscribe("rowMouseoverEvent", this.singleSelectDataTable.onEventHighlightRow); 
  //ticketsDataTable.subscribe("rowMouseoutEvent", this.singleSelectDataTable.onEventUnhighlightRow); 
  ticketsDataTable.subscribe("rowClickEvent", ticketsDataTable.onEventSelectRow );
  ticketsDataTable.subscribe("rowClickEvent", function (oArgs) {
    var oRecord = this.getRecord(oArgs.target);
    var url = '/ticket/'+oRecord.getData('project_id')+'/'+oRecord.getData('number')+'.js'    
    new Ajax.Updater('ticket-detail', url, { method: 'get' } );
  });
});
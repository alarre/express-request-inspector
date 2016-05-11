//TODO Usar CommonJS o similar!!!! Y luego modularizar este mar de código
//TODO Usar CommonJS o similar!!!! Y luego modularizar este mar de código
//TODO Usar CommonJS o similar!!!! Y luego modularizar este mar de código
//TODO Usar CommonJS o similar!!!! Y luego modularizar este mar de código

//TODO No debería ir a otro lugar?
/* Reactjs-bootstrap imports */
Panel = ReactBootstrap.Panel;
PanelGroup = ReactBootstrap.PanelGroup;
Accordion = ReactBootstrap.Accordion;
Table = ReactBootstrap.Table;
Input = ReactBootstrap.Input;
TabPane = ReactBootstrap.TabPane;
TabbedArea = ReactBootstrap.TabbedArea;
Badge  = ReactBootstrap.Badge ;
ProgressBar = ReactBootstrap.ProgressBar;
ListGroup = ReactBootstrap.ListGroup;
ListGroupItem = ReactBootstrap.ListGroupItem;
PageHeader = ReactBootstrap.PageHeader;
Glyphicon = ReactBootstrap.Glyphicon;
Button = ReactBootstrap.Button;
Grid = ReactBootstrap.Grid;
Row = ReactBootstrap.Row;
Col = ReactBootstrap.Col;
Alert = ReactBootstrap.Alert;
Label = ReactBootstrap.Label;

/* Hard coded list of http status codes to provide more info */
var HTTP_STATUS_CODES = {
        '200' : 'OK',
        '201' : 'Created',
        '202' : 'Accepted',
        '203' : 'Non-Authoritative Information',
        '204' : 'No Content',
        '205' : 'Reset Content',
        '206' : 'Partial Content',
        '300' : 'Multiple Choices',
        '301' : 'Moved Permanently',
        '302' : 'Found',
        '303' : 'See Other',
        '304' : 'Not Modified',
        '305' : 'Use Proxy',
        '307' : 'Temporary Redirect',
        '400' : 'Bad Request',
        '401' : 'Unauthorized',
        '402' : 'Payment Required',
        '403' : 'Forbidden',
        '404' : 'Not Found',
        '405' : 'Method Not Allowed',
        '406' : 'Not Acceptable',
        '407' : 'Proxy Authentication Required',
        '408' : 'Request Timeout',
        '409' : 'Conflict',
        '410' : 'Gone',
        '411' : 'Length Required',
        '412' : 'Precondition Failed',
        '413' : 'Request Entity Too Large',
        '414' : 'Request-URI Too Long',
        '415' : 'Unsupported Media Type',
        '416' : 'Requested Range Not Satisfiable',
        '417' : 'Expectation Failed',
        '500' : 'Internal Server Error',
        '501' : 'Not Implemented',
        '502' : 'Bad Gateway',
        '503' : 'Service Unavailable',
        '504' : 'Gateway Timeout',
        '505' : 'HTTP Version Not Supported'
    };

//Init socket.io client
var socket = io();

//TODO REFACTORIZAR ESTO PARA NO USAR GLOBAL!!
//uuids es una optimización para recorrer rápidamente y determinar si el evento recibido es sobre un
//request en curso o es nuevo:
var ReqData = { reqs: [], uuids: []};

//TODO mandar a otro archivo de componentes, utilitarios
var JsonPrettyPrinter = React.createClass({
    handleClick: function(event) {
       // event.target.cols = (event.target.cols !== this.state.width) ? this.state.width : 100; 
        //TODO MANDAR A CONSTANTES
        event.target.rows = (event.target.rows !== this.state.height) ? this.state.height : 5;
    },
    getInitialState: function() {
        console.log(this.props.data);
        var strJson = JSON.stringify(this.props.data||{}, undefined, 4) ;
        var jsonLines = strJson.split(/\n/);
        var height = (jsonLines.length >= 5) ? jsonLines.length + 1 : 5;
        
        var width = 0;
        jsonLines.forEach(function(line) {
            if (line.length > width) {
                width = line.length;
            }
        });
        width = (width >= 100) ? width + 1 : 100;
        return {strJson: strJson, height: height, width: width};
    },
    render: function() {
        return <Input type="textarea" onClick={this.handleClick} rows="5" readOnly="true" value={this.state.strJson} />
    }

});

//TODO reestructurar archivos, mandar a utils, etc:
function _flattenJson(data) {
    var result = {};
    function recurse (cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
             for(var i=0, l=cur.length; i<l; i++)
                 recurse(cur[i], prop + "[" + i + "]");
            if (l == 0)
                result[prop] = [];
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop+"."+p : p);
            }
            if (isEmpty && prop)
                result[prop] = {};
        }
    }
    recurse(data, "");
    return result;
}

var TableRenderer = React.createClass({
    render: function() {
        
        var obj = _flattenJson(this.props.data);
        var rows = [];

        for (var name in obj) {
            rows.push({name: name, value: obj[name]});
        }
        
        var renderRow = function(row, i) {
            if (typeof row.value === "boolean") {
                   row.value = row.value.toString(); 
            }
            return <tr key={i} ><td>{row.name}</td><td>{row.value}</td></tr>
        };
        if (rows.length > 0) {
            return <Table striped bordered condensed hover><th>Name</th><th>Value</th><tbody>{rows.map(renderRow)}</tbody></Table>
        } else {
            return <span>No data!</span>
        }
    }
});
    
function _getFullPath(protocol, host, path, port) {
    var fullPath = ((protocol) ? protocol : "http") + "://";
    fullPath += (host) ? host + ":"+ port : "";
    fullPath += path;
    return fullPath;
}

function getUnFormattedRequestPath(protocol, host, path, port, method, statusCode, time) {
        var fullPath = _getFullPath(protocol, host, path, port);
        var statusDesc = HTTP_STATUS_CODES[statusCode] || "???";
        return "["+method+"] "+fullPath+" ["+statusCode+" - "+statusDesc+"] - "+(time||"???")+" ms";
}
var FormattedRequestPath = React.createClass({
    render: function() {
        
        var fullPath = _getFullPath(this.props.protocol, this.props.host, this.props.path, this.props.port);
        
        var statusDesc = HTTP_STATUS_CODES[this.props.statusCode] || "???";
        var methodClassName = "req-highlight";
        switch (true) {
            case this.props.statusCode < 300:
                methodClassName += " ok";
                break;
            case this.props.statusCode < 500:    
                methodClassName += " warn";
                break;
            default:
                methodClassName += " error";
        }
            
        return <span>
                    <span className="req-highlight ok">[{this.props.method}]</span> <b>{fullPath}</b> <span className={methodClassName}>[{this.props.statusCode} - {statusDesc}]</span> - <i>{this.props.time||"???"} ms</i>
                </span>
    }
});

var LogList = React.createClass({
  
    render: function() {
          var renderLog = function(log, i){
            return <Log key={i+'_log'} data={log} />
          }
          
        return (
            <div>
            {(this.props.data || []).length === 0 ? 
               <Alert bsStyle="warning">No Logs</Alert>
               
               : 
            <ListGroup>
                {(this.props.data).map(renderLog)}
            </ListGroup>
            }
            </div>
        );
    }
});

var Log = React.createClass({
    render: function() {
        return (
            <ListGroupItem header={JSON.parse(this.props.data).msg || "(No log message)"}>
                <JsonPrettyPrinter data={JSON.parse(this.props.data)}/>
            </ListGroupItem>
        );
    }
});



var CacheHitList = React.createClass({
  
    render: function() {
          var renderCacheHits = function(cache, i){
            return <CacheHit key={i+'_cacheHit'} data={cache} />
          }
          
        return (
            <div>
            {(this.props.data || []).length === 0 ? 
               <Alert bsStyle="warning">No Cache Hits</Alert>
               
               : 
            <ListGroup>
                {(this.props.data).map(renderCacheHits)}
            </ListGroup>
            }
            </div>
        );
    }
});

var CacheHit = React.createClass({
    render: function() {
        return (
            <ListGroupItem header={this.props.data.url.method + ' ' +this.props.data.url.path + ' ' + this.props.data.url.query}>
                <JsonPrettyPrinter data={this.props.data.value}/>
            </ListGroupItem>
        );
    }
});




var Timeline = React.createClass({
  render: function(){
    return <div id={this.props.graphName}></div>
  },
  componentDidMount: function(){
    this.drawCharts();
  },
  componentDidUpdate: function(){
    this.drawCharts();
  },
  drawCharts: function(){
    var ROW_HEIGHT = 42; //TODO en otras visualizaciones..???
  
    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn({ type: 'string', id: '#' });
    dataTable.addColumn({ type: 'string', id: 'Path' });
    dataTable.addColumn({ type: 'number', id: 'Start' });
    dataTable.addColumn({ type: 'number', id: 'End' });

    //To store individual colors of each row
    var colorsArr = [];
      
      //Hack para evitar error (?) de Google Chart donde los requests que demoran muy muy poco (1ms) no se graficaban correctamente
      //Al hacer el start = 0 para el primer request, todos los valores quedan relativos y con pocos dígitos, lo que evitaría el bug
     /*
     var MIN_VALUE = this.props.data[0] && this.props.data[0].req.start;
        this.props.data.forEach(function(httpCall) {
            if (httpCall.req.start < MIN_VALUE) {
                MIN_VALUE = httpCall.req.start;
            }
        });
        */
      //Debería ser el primero porque la colección debería venir ordenada...
      //Ahorra recorrer el objeto para calcularlo, que es lo que está comentado arriba.
      var MIN_VALUE = this.props.data[0] && this.props.data[0].req.start;

      this.props.data.forEach(function(d, i) {
        var rowName = getUnFormattedRequestPath(d.req.protocol, d.req.host, d.req.path, d.req.port, d.req.method, d.res.statusCode, d.res.time);
        var rowLabel = _getFullPath(d.req.protocol, d.req.host, d.req.path, d.req.port);
       // dataTable.addRow([rowLabel, rowName, d.req.start, d.req.start+d.res.time ]);
        dataTable.addRow(["#"+(i+1), rowName, d.req.start-MIN_VALUE, d.req.start-MIN_VALUE+d.res.time ]);
        var color = (d.res.statusCode < 500) ? '#8d8': '#FABBBB';
        colorsArr.push(color);
    });
   
    var chart = new google.visualization.Timeline(document.getElementById(this.props.graphName));
    var opts = {timeline: {  showRowLabels: false },
                avoidOverlappingGridLines: false,
                colors: colorsArr,
                height: (this.props.data.length+1) * ROW_HEIGHT,
                width: '1100', //TODO AJUSTAR AL CONTENEDOR!!!
                };
    chart.draw(dataTable, opts);
  }
});

var HttpCallList = React.createClass({
  
    render: function() {
          
        var renderHttpCall = function (httpCall, i) {
            var fullPath = _getFullPath(httpCall.req.protocol, httpCall.req.host, httpCall.req.path, httpCall.req.port);
            var header = (<span><b>{i+1}. </b><FormattedRequestPath method={httpCall.req.method} host={httpCall.req.host} port={httpCall.req.port} path={httpCall.req.path} statusCode={httpCall.res.statusCode} time={httpCall.res.time} /></span>);
            return <Panel key={i+'_panel'} eventKey={i} header={header}>
                          {(httpCall.req.method === 'GET') ? <RepeatRequestButton target={fullPath}/> : ""}
                       <HttpCall key={i+'_httpCall'} data={httpCall} />
                    </Panel>
        };
          
        return (
            <div>
              {(this.props.data || []).length === 0 ? 
               <Alert bsStyle="warning">No HTTP Calls</Alert>
               
               : 
               
               <TabbedArea defaultActiveKey={1}>
                   <TabPane eventKey={1} tab="List">
                       <Accordion>
                       {(this.props.data).map(renderHttpCall)}
                       </Accordion>
                    </TabPane>
                    <TabPane eventKey={2} tab="Graph">
                        <Timeline graphName={this.props.uuid + '_graph'} data={this.props.data} />
                    </TabPane>
                </TabbedArea>
              }
            </div>
        );
    }
});
        
var HttpCall = React.createClass({
    render: function() {
        //TODO modularizar esta sección :/   
        return (
            <div>
      
                <TabbedArea defaultActiveKey={1}>
                   <TabPane eventKey={1} tab="Request">
                        <HttpConfigInfo data={this.props.data.config}/>
                        <HttpRequestInfo data={this.props.data.req}/>

                   </TabPane>
                   <TabPane eventKey={2} tab="Response">
                        <HttpResponseInfo data={this.props.data.res}/>
                   </TabPane>
            
                </TabbedArea>
            </div>
        );
    }
});

//TODO Nombre horrible y confuso!!
var HttpRequestInfo = React.createClass({
    render: function(){
        return (<div>
                <QueryString data={this.props.data.query} />
                <Body data={this.props.data.body} />
                <Headers data={this.props.data.headers} />
                </div>);
    }
});
        
//TODO Nombre horrible y confuso!!
var HttpResponseInfo = React.createClass({
    render: function(){
        return (<div>
                <Body data={this.props.data.body} />
                <Headers data={this.props.data.headers} />
                </div>);
    }
});
        
//TODO Nombre horrible y confuso!!
var HttpConfigInfo = React.createClass({
    render: function(){
        return (<div>
                <h4>Config</h4>
                    <TableRenderer data={this.props.data}/>
                </div>);
    }
});

var QueryString = React.createClass({
    render: function() {
        return <div><h4>Query String</h4><TableRenderer data={this.props.data} /></div>
    }
});

var Body = React.createClass({
    render: function() {
        return <div><h4>Body</h4><JsonPrettyPrinter data={this.props.data}/></div>
    }
});
    
var Headers = React.createClass({
    render: function() {           
        return <div><h4>Headers</h4><TableRenderer data={this.props.data} /></div>
    }
});

var ClientInfo = React.createClass({
    render: function() {           
        return <div><h4>Client Info</h4><TableRenderer data={this.props.data} /></div>
    }
});

var BasicInfo = React.createClass({
    render: function() {
    
        //TODO repensar esta lógica para que cualquier info no definida en la data recibida no sea renderizada, sin poner 'if' por todos lados.
        /* Response may not be set */
        if (this.props.data.res) {
            var respTab = <TabPane eventKey={3} tab="Response"><HttpResponseInfo data={this.props.data.res}/></TabPane>;
        }
    
        return <TabbedArea defaultActiveKey={1}>
            <TabPane eventKey={1} tab="Request"><HttpRequestInfo data={this.props.data.req}/></TabPane>
            <TabPane eventKey={2} tab="Client Info"><ClientInfo data={this.props.data.req.MELIContext && this.props.data.req.MELIContext.client || {}} /></TabPane>
            {respTab}
          </TabbedArea>
    }
});

var Request = React.createClass({
  render: function() {
  //TODO refactorizar esto para renderizar dinámicamente objetos... según type?
          
      var logsTab = <TabWithBadge tabName='Logs' source={this.props.data.logs}/>;
      var httpTab = <TabWithBadge tabName='Http Calls' source={this.props.data.httpCalls}/>;
      var cacheHitsTab = <TabWithBadge tabName= "Cache Hits" source={this.props.data.cacheHits}/>;

      return (
          <TabbedArea defaultActiveKey={1}>
            <TabPane eventKey={1} tab="Info"><BasicInfo data={this.props.data} /></TabPane>
            <TabPane eventKey={2} tab={httpTab}><HttpCallList uuid={this.props.data.uuid} data={this.props.data.httpCalls} /></TabPane>
            <TabPane eventKey={3} tab={logsTab}><LogList data={this.props.data.logs} /></TabPane>
            <TabPane eventKey={4} tab={cacheHitsTab}><CacheHitList data={this.props.data.cacheHits} /></TabPane>
          </TabbedArea>

    );
  }
});

var FloatingButton = React.createClass({
    render: function() {
        var float_style = {float: 'right'};

        return <span style={float_style}>{this.props.children}</span>
    }
});
        
var RepeatRequestButton = React.createClass({
  render: function() {
      
     // var float_style = {float: 'right'};

    return <FloatingButton><a title="Repeat request in new window" href={this.props.target} target="_blank"><Glyphicon glyph="new-window" />repeat</a></FloatingButton>
   // return <span style={float_style}><a title="Repeat request in new window" href={this.props.target} target="_blank"><Glyphicon glyph="new-window" /></a></span>;
  }

});

var TabWithBadge = React.createClass({
    render: function() {   
        var sourceLength = (Array.isArray(this.props.source)) ? this.props.source.length : 0;
        return <span>{this.props.tabName} <Badge>{sourceLength.toString()}</Badge></span>
    }
});                                   
                                     

/* Main component, which is mounted to the HTML */
var RequestList = React.createClass({

  getInitialState: function() {
    socket.on('request-new', this.onNewRequest);
    socket.on('connect', this.onConnect);
    socket.on('reconnect', this.onConnect);
    socket.on('connect_error', this.onConnectionError);
    socket.on('connect_timeout', this.onConnectionError);
    socket.on('reconnect_error ', this.onConnectionError);

    //Esto sirve para simular que llega un request de prueba
      //requestDePrueba está actualmente en test/request.json
    //setTimeout(this.onNewRequest.bind(this, requestDePrueba),100);
    return {reqData: [], status: {style: "info", active: true, label: "Conectando...", striped: true }};
  },
  
  onConnect: function() {
    this.setState({ status: {style: "success", active: false, label: "Conectado", striped: true }});
  },
    
  onNewRequest: function (data) {
      console.log('Received data...');
      console.log(data);
      var foundUuidIdx = -1;
      if (data.uuid && (data.status && data.status != 'new')) {
          for (var i = 0; i < ReqData.reqs.length; i++) {
            var uuid = ReqData.reqs[i].uuid;
            if (uuid === data.uuid) {
                foundUuidIdx = i;
                break;
            }
          }
      }
      
      if (foundUuidIdx < 0) {
        ReqData.reqs.push(data);
      } else {
        ReqData.reqs[foundUuidIdx] = data;
      }
        this.setState({ reqData : ReqData.reqs});
  },
    
    onConnectionError: function(error) {
        var errorStr = error && JSON.stringify(error) || "---";
        this.setState({ status: {style: "danger", active: false, striped: true, label: "Error de conexión: "+errorStr }});
    },
        
  clearRequests: function(event) {
     ReqData.reqs = [];
     this.setState({ reqData : ReqData.reqs});
  },
      
  clearRequestByIdx: function(idx) {
     ReqData.reqs.splice(idx, 1);
     this.setState({ reqData : ReqData.reqs});
  },
    
  render: function() {
      var requestsNodes = this.state.reqData.map(function (request, i) {
          
          //TODO debería estar dentro de la clase Request, pero por algún motivo no se renderiza bien
          //el panel header, y no queda clickeable...
          var header = (<span> 
                        <ProgressBar active={request.status !== "end"} striped={request.status !== "end"} bsStyle={(request.status === "end") ? "info":"warning"} now={100}/>
                        {request.uuid} <FormattedRequestPath host={request.req.host} port={request.req.port} method={request.req.method} path={request.req.path} statusCode={request.res && request.res.statusCode} time={request.res && request.res.time}/></span>);
          //var fullPath = _getFullPath(this.props.data.req.protocol, this.props.data.req.host, this.props.data.req.path, this.props.data.req.port);
      var fullPath = _getFullPath(request.req.protocol, request.req.host, request.req.path, request.req.port);
          
          return (
            <Panel header={header} eventKey={i} key={request.uuid}>
              {(request.req.method === 'GET') ? <RepeatRequestButton target={fullPath}/> : ""}
              <FloatingButton><a title="Clear request" href="#" onClick={this.clearRequestByIdx.bind(this, i)}><Glyphicon glyph="trash" />clear&nbsp;</a></FloatingButton>
              <Request data={request}></Request>
            </Panel>
          );
      }, this);
  
    return (
        <Grid>
            <Row>
              <Col md={11}><ProgressBar active={this.state.status.active} striped={this.state.status.striped} bsStyle={this.state.status.style} now={100} label={this.state.status.label}/></Col>
              <Col md={1}><Button bsSize="xsmall" onClick={this.clearRequests}><Glyphicon glyph="trash" /> Clear</Button></Col>
            </Row>
            <Row>
                <Col md={12}>
                    <PageHeader><Label>{this.state.reqData.length}</Label> Requests Inspector <Glyphicon glyph="search" /></PageHeader>
                    <Accordion>
                        {requestsNodes}
                    </Accordion>
                </Col >                                    
            </Row>
        </Grid>       
    );
  }
});

React.render(
  <RequestList />,
  document.getElementById('content')
);
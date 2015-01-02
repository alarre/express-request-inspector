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

var socket = io();

//TODO REFACTORIZAR ESTO PARA NO USAR GLOBAL!!
var ReqData = [];


var LogList = React.createClass({

   getInitialState: function() {
        var l = this.props.data || [];
        return {logs: l};
    },
  
    render: function() {
          var renderLog = function(log){
            return <Log data={log} />
          }
          
        return (
            <div>
                <h2>Logs</h2>
                <ListGroup>
                    {this.state.logs.length > 0 ? this.state.logs.map(renderLog) : "No logs!"}
                </ListGroup>
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

var HttpCallList = React.createClass({

getInitialState: function() {
    var d = this.props.data || [];
    return {httpCallList: d};
  },
  
render: function() {
      
    var renderHttpCall = this.state.httpCallList.map(function (httpCall, i) {
        var header = (<span><FormattedRequestPath method={httpCall.req.method} host={httpCall.req.host} port={httpCall.req.port} path={httpCall.req.path} statusCode={httpCall.res.statusCode} time={httpCall.res.time} /></span>);
            return (<Panel eventKey={i} header={header}><HttpCall data={httpCall} /></Panel>);
        });
          
        return (
            <Accordion>
                {renderHttpCall}
            </Accordion>
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
                        <ul><li>retries: {this.props.data.retries || "???"}</li>
                            <li>timeout: {this.props.data.timeout || "???"}</li>
                        </ul>
                </div>);
    }
});
        
var HttpCall = React.createClass({
    render: function() {
        //TODO modularizar esta sección :/
        return (
            <div>
                <TabbedArea defaultActiveKey={1}>
                   <TabPane eventKey={1} tab="Request">
                        <HttpConfigInfo data={this.props.data.req}/>
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

var QueryString = React.createClass({
    render: function() {
        return <div><h4>Query String</h4><TableRenderer data={this.props.data} /></div>
    }
});

var FormattedRequestPath = React.createClass({
    getInitialState: function() {
        var fullPath = (this.props.protocol) ? this.props.protocol+"://" : "";
        fullPath += (this.props.host) ? this.props.host+":"+this.props.port : "";
        fullPath += this.props.path;
        
        return {fullPath: fullPath}
    },
    render: function() {
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
                    <span className="req-highlight ok">[{this.props.method}]</span> <b>{this.state.fullPath}</b> <span className={methodClassName}>[{this.props.statusCode} - {statusDesc}]</span> - <i>{this.props.time} ms</i>
                </span>
    }
});

var Body = React.createClass({
    render: function() {
        return <div><h4>Body</h4><JsonPrettyPrinter data={this.props.data}/></div>
    }
});
    
var JsonPrettyPrinter = React.createClass({
    handleClick: function(event) {
       // event.target.cols = (event.target.cols !== this.state.width) ? this.state.width : 100; 
        //TODO MANDAR A CONSTANTES
        event.target.rows = (event.target.rows !== this.state.height) ? this.state.height : 5;
    },
    getInitialState: function() {
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
    
    getInitialState: function() {
            var obj = _flattenJson(this.props.data);
            var rows = [];

            for (var name in obj) {
                rows.push({name: name, value: obj[name]});
            }

            return {rows: rows};
        },
    render: function() {
        
        var renderRow = function(row, i) {
            if (typeof row.value === "boolean") {
                   row.value = row.value.toString(); 
            }
            return <tr key={i} ><td>{row.name}</td><td>{row.value}</td></tr>
        };
        if (this.state.rows.length > 0) {
        return <Table striped bordered condensed hover><th>Name</th><th>Value</th><tbody>{this.state.rows.map(renderRow)}</tbody></Table>
        } else {
            return <span>No data!</span>
        }
    }
});

var BasicInfo = React.createClass({
    render: function() {
        return <TabbedArea defaultActiveKey={1}>
            <TabPane eventKey={1} tab="Request"><HttpRequestInfo data={this.props.data.req}/></TabPane>
            <TabPane eventKey={4} tab="Client Info"><ClientInfo data={this.props.data.req.MELIContext && this.props.data.req.MELIContext.client || {}} /></TabPane>
            <TabPane eventKey={5} tab="Response"><HttpResponseInfo data={this.props.data.res}/></TabPane>
          </TabbedArea>
    }
});

var Request = React.createClass({
    
  render: function() {
  //TODO refactorizar esto para renderizar dinámicamente objetos... según type?
          
      var logsTab = _getTabWithBadge('Logs', this.props.data.logs);
      var httpTab = _getTabWithBadge('Http Calls', this.props.data.httpCalls);
      return (
          <TabbedArea defaultActiveKey={1}>
            <TabPane eventKey={1} tab="Info"><BasicInfo data={this.props.data} /></TabPane>
            <TabPane eventKey={2} tab={httpTab}><HttpCallList data={this.props.data.httpCalls} /></TabPane>
            <TabPane eventKey={3} tab={logsTab}><LogList data={this.props.data.logs} /></TabPane>
          </TabbedArea>

    );
  }
});

function _getTabWithBadge(tabName, source) {
    var sourceLength = (Array.isArray(source)) ? source.length : 0;
    return <span>{tabName} <Badge>{sourceLength.toString()}</Badge></span>
}

var RequestList = React.createClass({

  getInitialState: function() {
    socket.on('request-new', this.onNewRequest);
    socket.on('connect', this.onConnect);
    socket.on('reconnect', this.onConnect);
    socket.on('connect_error', this.onConnectionError);
    socket.on('connect_timeout', this.onConnectionError);
    socket.on('reconnect_error ', this.onConnectionError);

    return {reqData: [], status: {style: "info", label: "Conectando..." }};
  },
  
  onConnect: function() {
    this.setState({ status: {style: "success", label: "Conectado" }});
  },
    
  onNewRequest: function (data) {
        console.log(data);
        ReqData.push(data);
        this.setState({ reqData : ReqData});
  },
    
    onConnectionError: function(error) {
        var errorStr = error && JSON.stringify(error) || "---";
        this.setState({ status: {style: "danger", label: "Error de conexión: "+errorStr }});
    },
        
  render: function() {
        
      var requestsNodes = this.state.reqData.map(function (request, i) {
          //TODO debería estar dentro de la clase Request, pero por algún motivo no se renderiza bien
          //el panel header, y no queda clickeable...
          var header = (<span> {request.uuid} <FormattedRequestPath method={request.req.method} path={request.req.path} statusCode={request.res.statusCode} time={request.res.time}/></span>);
          console.log("i "+i);
          return (
            <Panel header={header} eventKey={i} key={request.uuid}>
              <Request data={request}></Request>
            </Panel>
          );
      });
  
    return (
        <div>
            <ProgressBar active striped bsStyle={this.state.status.style} now={100} label={this.state.status.label}/>
            <PageHeader>Requests</PageHeader>
            <Accordion>
                {requestsNodes}
            </Accordion>
        </div>
    );
  }
});


React.render(
  <RequestList />,
  document.getElementById('content')
);
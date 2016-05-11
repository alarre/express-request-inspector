//Actualmente no se usa ni se importa; reemplazado por Google Chart
var HttpCallGraph = React.createClass({

    render: function() {
        var CANVAS_WIDTH = 1000;
        var LINE_SEP = 30;
        
        var MIN_VALUE = 100000000000, MAX_VALUE = 0;
        this.props.data.forEach(function(httpCall) {
            if (httpCall.req.start < MIN_VALUE) {
                MIN_VALUE = httpCall.req.start;
            }
            
            if (httpCall.req.start > MAX_VALUE) {
                MAX_VALUE = httpCall.req.start;
            }
        });
                                
        var LENGTH = MAX_VALUE - MIN_VALUE;
        console.log('MIN_VALUE '+MIN_VALUE);
        console.log('MAX_VALUE '+MAX_VALUE);
        console.log('LENGTH '+LENGTH);
        
        var renderLines = function(httpCall, i) {
            //console.log('(('+httpCall.req.start+' - '+MIN_VALUE+') * '+CANVAS_WIDTH+') / ('+httpCall.req.start+' + '+httpCall.res.time+')');
            var x1 = ((httpCall.req.start - MIN_VALUE) / MAX_VALUE) * CANVAS_WIDTH * 100; //por ciento
            console.log('x1 '+x1);
            var x2 = ((httpCall.req.start + httpCall.res.time - MIN_VALUE) / MAX_VALUE) * CANVAS_WIDTH * 100; //por ciento
            var y = (i+1)*LINE_SEP;
            
            return <line x1={x1} y1={y} x2={x2} y2={y}
                strokeWidth="5"
                stroke="red"></line>

        };
        
        console.log('this.props.data');
        console.log(this.props.data);
        
        var canvas = <line x1="0" y1="5" x2="1000" y2="5"
            strokeWidth="10"
            stroke="gray"></line>
            
        return <svg ref="svg" {...this.props} border="1" height={(this.props.data.length+1)*LINE_SEP} width="1000">
                {canvas}
        <line x1="0" y1="0" y2="500" x2="0" strokeWidth="2"
            stroke="gray" strokeDasharray="10,10"></line>
                {(this.props.data).map(renderLines)}
               </svg>
    }
    
});
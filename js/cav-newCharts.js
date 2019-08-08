const colors = [
    'rgb(111, 111, 232)',
    'rgb(255, 99, 132)',
    'rgb(155, 99, 232)',
];

function drawBar_NEW(obj, divId, graphHeight) {

    var xLabels = [];
    var dataSetsNumber = obj.cols.y.length;
    var values = new Array(dataSetsNumber);
    obj.values.forEach(o => {
        xLabels.push(o.title);
        o.vals.forEach((v, i) => {
            if (!values[i]) {
                values[i] = [];
            }
            values[i].push(v);
        });
    });
    var dataSets = new Array(dataSetsNumber);
    for (let i = 0; i < dataSets.length; i++) {
        dataSets[i] = {
            label: obj.cols.y[i].title,
            backgroundColor: colors[i],
            borderColor: colors[i],
            data: values[i]
        };        
    }    

    var ctx = $('#' + divId).find('> canvas')[0].getContext('2d');
    var chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: xLabels,
            datasets: dataSets
        },
        options: {
            maintainAspectRatio: false,     
            title: {
                display: obj.titles.chart,
                text: obj.titles.chart,
                fontSize: 20
            },   
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: obj.titles.axis.x,
                        labelString: obj.titles.axis.x
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: obj.titles.axis.y,
                        labelString: obj.titles.axis.y
                    }
                }]
            }
        }
    });

}

function drawPie_NEW(obj, divId, graphHeight) {
    var ctx = $('#' + divId).find('> canvas')[0].getContext('2d');
    var dataSets = [
        {
            // backgroundColor: ['red', 'yellow', 'blue'],
            // data: [12,5,22]
            backgroundColor: colors,
            data: obj.values[0].vals
        }
    ];
    var chart = new Chart(ctx, {
        type: 'pie',
        data: {
            datasets: dataSets,
            labels: [obj.values[0].title]
            // labels: ['Red', 'Yellow', 'Blue' ],
        },        
        options: {
            maintainAspectRatio: false,
            title: {
                display: obj.titles.chart,
                text: obj.titles.chart,
                fontSize: 20
            }
        }
    });
}
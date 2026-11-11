<link rel="stylesheet" href="https://unpkg.com/dropzone@5/dist/min/dropzone.min.css" />
<script src="https://unpkg.com/dropzone@5/dist/min/dropzone.min.js"></script>

<form action="/upload" class="dropzone" id="my-dropzone"></form>
// get the registraitons forom php
    fetch('api/get_chart_registrations.php').then(response=>response.json().then(result=>{
      if(!resilt.success){
        console.error('Error Fetching registration data:', result.message);
        return;
      }
      const labels = result.data.map(item=>item.enama);
      const counts = result.data.map(item=>item.total_registration);

      // chart options
      var options = {
        series : [{
          name : 'Registered Members',
          data : counts
        }],
        chart = {
          type : 'bar',
          height: 400,
          toolbar: {show : true},
        }.
        plotOptions : {
          bar : {
            borderRadius : 6, 
            horizontal : false,
            distributed : true,
            columnWidht : '55%',
          }
        },
        dataLabels : {
          enabled : true,
          style: {fontSize : '12px', colors : ['#fff']}
        },
        xaxis: {
          categories : labels,
          title : {text: 'Events'},
          labels : {rotate: -45, style : {fontSize:'13px'}}
        },
         yaxis: {
          title: { text: 'Number of Registrations' },
          labels: { style: { fontSize: '12px' } }
        },

        colors: ['#1E90FF', '#00B894', '#6C5CE7', '#FDCB6E', '#E17055'],
        title: {
          text: 'Event Registration Summary',
          align: 'center',
          style: { fontSize: '18px', fontWeight: 'bold', color: '#333' }
        },
        tooltip: {
          y: {
            formatter: function (val) { return val + " Registrations"; }
          }
        }
      };
      var chart = new ApexCharts(document.querySelector("#chart-registrations"), options);
       chart.render();
    })
  );
  fetch('api/get_daily_registrations.php').then(response=>response.json().then(result=>{
      if(!result.success){
        console.error('Error Fetching registration data:', result.message);
        return;
      }
      const labels = result.data.map(item=>item.date);
      const counts = result.data.map(item=>item.total_registration);

      // chart options
      var options = {
        series : [{
          name : 'Registered Members',
          data : counts
        }],
        chart = {
          type : 'bar',
          height: 400,
          toolbar: {show : true},
        }.
        plotOptions : {
          bar : {
            borderRadius : 6, 
            horizontal : false,
            distributed : true,
            columnWidht : '55%',
          }
        },
        dataLabels : {
          enabled : true,
          style: {fontSize : '12px', colors : ['#fff']}
        },
        xaxis: {
          categories : labels,
          title : {text: 'Events'},
          labels : {rotate: -45, style : {fontSize:'13px'}}
        },
         yaxis: {
          title: { text: 'Number of Registrations' },
          labels: { style: { fontSize: '12px' } }
        },

        colors: ['#1E90FF', '#00B894', '#6C5CE7', '#FDCB6E', '#E17055'],
        title: {
          text: 'Event Registration Summary',
          align: 'center',
          style: { fontSize: '18px', fontWeight: 'bold', color: '#333' }
        },
        tooltip: {
          y: {
            formatter: function (val) { return val + " Registrations"; }
          }
        }
      };
      var chart = new ApexCharts(document.querySelector("#daily-chart"), options);
       chart.render();
    })
  );
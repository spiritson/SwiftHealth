//Maps variables
var directionDisplay,
directionsService = new google.maps.DirectionsService(),
map;
var directionsDisplay = new google.maps.DirectionsRenderer();

/*Initializing to Default*/
var counter=0;

var route_request = {

}

var DoctorJSON=[
  {

  },
  {

  },
  {

  }
];


/**/
/****************************Page Inits****************************************/

$(document).on("pageinit", "#first_page", function() {

  if($( "#checkbox-1" ).is(":checked")){

    if(navigator.geolocation){

      navigator.geolocation.getCurrentPosition(function(pos) {

        /*Set Origin  to current location */
        route_request.origin = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);

      });

    }

  }

});

$(document).on("pageinit", "#Doctor1", function() {


  var end_Doctor1 = $('#Doctor1').find('p:first').html();



  var delay=1000;//1 second
  setTimeout(function(){
    initialize("Doctor1");
    calculateRoute("Doctor1",end_Doctor1);

  },delay);


});

$(document).on("pageinit", "#Doctor2", function() {

  var end_Doctor2 = $('#Doctor2').find('p:first').html();

  var delay=1000;//1 second
  setTimeout(function(){
    initialize("Doctor2");
    calculateRoute("Doctor2",end_Doctor2);

  },delay);

});

$(document).on("pageinit", "#Doctor3", function() {

  var end_Doctor3 = $('#Doctor3').find('p:first').html();

  var delay=1000;//1 second
  setTimeout(function(){
    initialize("Doctor3");
    calculateRoute("Doctor3",end_Doctor3);

  },delay);

});
/******************************************************************************/





/****************************first_page functions*****************************/
$(document).on('change', '[type=checkbox]', function (e) {

  if (!$(this).is(":checked")) {
    $( "#location" ).textinput( "enable" );
    if(navigator.geolocation){

      navigator.geolocation.getCurrentPosition(function(pos) {

        /*Set Origin  to current location */
        route_request.origin = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);

      });

    }
  }
  else{
    $( "#location" ).textinput( "disable" );
  }
});



/*On Clicking Get Health Services */
$(document).on('click', '#gethealth', function(e) {
  e.preventDefault();


  if($( "#checkbox-1" ).is(":checked")){

    getFromServer();

  }
  else{

    if($("#location").val()){

      console.log($("#location").val());

      route_request.origin=String($("#location").val());

      getFromServer();
    }
    else{

      alert("Please Enter location or Check Current Location");
    }

  }



});

/*Get From Server*/
function getFromServer(){


  var patientname= $("#patientname").val();

  if(patientname){


    var healthspecialist = $("#mode").val();
    /* Send to the Health Specialist to RESTful server here */

    /*Node.JS Server
    var querystring="http://192.168.0.20:8080/gethealth/?";
    querystring=querystring+'patientname='+patientname+'&healthspecialist='+healthspecialist+'&callback=?';*/

    /*ASP.NET Server*/
    var querystring="http://192.168.0.28/TestWcf/Service1.svc/RequestHealthService_Details/"+patientname+"/"+healthspecialist
    console.log(querystring);
    /*AJAX Get*/
    $.getValues(querystring);


    //Reset counter
    counter=0;

  }
  else{

    alert("Please enter Patient Name");
  }
}


//GET from Server AJAX JSONP
jQuery.extend({
  getValues: function(url) {
    var result = null;

    result=$.ajax({

      type: 'GET',
      url: url,
      jsonp: "callback",
      contentType: "application/json",//new
      crossDomain:true,
      async: false,
      jsonpCallback: "callback",
      dataType: "json",
      success:  function(data) {

        callback(data);

      },
      error: function(data){
        alert("Error");

      }

    });


  }
});

//Callback function for AJAX request
function callback(data){

  DoctorJSON=JSON.parse(data);

  console.log(DoctorJSON);
  $("#doctorlist").empty().listview('refresh');

  for(var i=0;i<3;i++){

    route_request.destination=DoctorJSON[i].Address;
    console.log(route_request.destination);
    var selectedMode = "DRIVING",
    start = route_request.origin,

    address=DoctorJSON[i].Address;

    var request = {
      origin:start,
      destination:address,
      travelMode: google.maps.DirectionsTravelMode[selectedMode]
    };

   /*To Get TimeDuration to each Doctor*/
    directionsService.route(request,mapcallback);

  }

}

/*DirectionsServiceCallback*/
function mapcallback(response,status){

  if (status == google.maps.DirectionsStatus.OK) {


    var myRoute = response.routes[0].legs[0];
    var timeto=myRoute.duration.text;

    var docval='Doctor'+(counter+1);
    DoctorJSON[counter].duration=timeto;

    writedoclist(DoctorJSON,docval);

    counter++;

  }


}

/*Add Doctor List Results to Webpage*/
function writedoclist(docobj,docval){


  var doctor_name=docobj[counter].DoctorName;

  var address=docobj[counter].Address;


  var item='<li><a href="#'+docval+'"id='+docval+' data-transition="slide " >Dr.'+doctor_name+'<p>'+address+'</p><h2 id="duration">'+docobj[counter].duration+'</h2></a></li>'

  $("#doctorlist").append(item).listview('refresh');


}


/*******************************************************************************/


/******************************MAPS Display functions*************************/

function initialize(Doctorid)
{
  mapcanvas="map_canvas_"+Doctorid;
  directions="directions_"+Doctorid;

  directionsDisplay = new google.maps.DirectionsRenderer();
  //var mapCenter = route_request.origin;

  var myOptions = {
    zoom:15,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    //center: mapCenter
  }

  map = new google.maps.Map(document.getElementById(mapcanvas), myOptions);
  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById(directions));
}

/*calculateRoute for Maps*/

function calculateRoute(Doctorid,end)
{

  var selectedMode = "DRIVING";

  var start=String(route_request.origin);

  var results="#results_"+Doctorid;
  var duration_in_traffic="duration_in_traffic_"+Doctorid;
  if(start == '' || end == '')
  {

    $(results).hide();
    return;
  }
  else
  {

    var request = {
      origin:start,
      destination:end,
      travelMode: google.maps.DirectionsTravelMode[selectedMode]
    };

    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);

        var myRoute = response.routes[0].legs[0];
        document.getElementById(duration_in_traffic).innerHTML = "Nearest Health is service is "+myRoute.duration.text+" away";
        $(results).show();

      }
      else {
        $(results).hide();
      }
    });

  }

}

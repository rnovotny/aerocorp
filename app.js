/* jshint asi: true */
$(document).ready(function(){
	var width = 600
	var height = 600
	var sens = 0.25
	var projection = d3.geo.orthographic().scale(300).rotate([0, 0]).translate([width / 2, height / 2]).clipAngle(90)
	 
	var path = d3.geo.path().projection(projection)
	var svg = d3.select("#map").append("svg").attr("width", width ).attr("height", height )

	d3.json("world-110m2.json", function(error, topology) {
			  
		// load cities
		d3.csv("cities.csv", function( data ) {
			for ( var i = 0 ; i < data.length; i++ ) {
				svg.append("path")
					.datum({type: "Point", coordinates: [data[i].lon, data[i].lat]})
					.attr('class', 'airport')
					.attr('data-airport', JSON.stringify( data[i] ) )
					.attr("d", path)
					.on('click', function(){
						var airportData = $(this).data('airport')
						$('#airport-rank').html(airportData.rank)
						$('#airport-city').html(airportData.city)
						$('#airport-pax').html(airportData.passengers)
						$('#airport-lat').html(airportData.lat)
						$('#airport-lon').html(airportData.lon)
					})
			}
		})
		
		// load countries
		svg.selectAll("path")
			.data(topojson.object(topology, topology.objects.countries)
				.geometries)
			.enter()
				.append("path")
				.attr("d", path)
			  
		svg.call(d3.behavior.zoom().on("zoom", function () {
			svg.attr("transform", "scale(" + d3.event.scale + ")")
		}))
		
		svg.call(d3.behavior.drag()
			.origin(function() { var r = projection.rotate(); return {x: r[0] / sens, y: -r[1] / sens}; })
			.on("drag", function() {
				var rotate = projection.rotate()
				projection.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]])
				svg.selectAll("path").attr("d", path)
			}))
	});
	
})
	


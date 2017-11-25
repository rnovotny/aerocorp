/* jshint asi: true */

var width = 600
var height = 600
var sens = 0.25
var projection = d3.geo.orthographic().scale(300).rotate([0, 0]).translate([width / 2, height / 2]).clipAngle(90)
var path = d3.geo.path().projection(projection)
var svg = d3.select( '#map' ).append( 'svg' ).attr( 'width', width ).attr( 'height', height )
var planes = loadPlanes()
loadMap()

function afterLoad() {
	$('#new-route').click(function(){
		var start = $('#airport-code').val()
		startAirport = $( '#' + start ).data('airport')
		$('#route-start').html( start )
		
		$('.airport').hover( function(){
			var hoverAirport = $(this).data('airport')
			$('#route-end').html( hoverAirport.code )
			var routeDist = haversineDistance( startAirport, hoverAirport )
			$('#route-distance').html( routeDist )
			$('#plane-table').removeClass('hasRange')
		})
		
		$('.airport').click(function(){
			if ( $(this).attr('id') !== start ) {
				var endAirport = $(this).data('airport')
				svg.insert("path", '.airport')
					.datum({type: "LineString", coordinates: [[startAirport.lon, startAirport.lat], [endAirport.lon, endAirport.lat]]})
					.attr('class', 'route')
					.attr('id', startAirport.code + '-' + endAirport.code )
				$('.airport').unbind('click')
				svg.selectAll("path").attr("d", path)
				
			}
		})
	})

	$('.airport').on('mouseover click', function() {
		var airportData = $(this).data( 'airport' )
		$( '#airport-code' ).val( airportData.code )
		$( '#airport-rank' ).html( airportData.rank )
		$( '#airport-city' ).html( airportData.city )
		$( '#airport-pax' ).html( airportData.passengers )
		$( '#airport-lat' ).html( airportData.lat )
		$( '#airport-lon' ).html( airportData.lon )
	})
	
}



	



function loadMap() {

	d3.json("world-110m2.json", function(error, topology) {
			  
		// load cities
		d3.csv("cities.csv", function( data ) {
			for ( var i = 0 ; i < data.length; i++ ) {
				svg.append('path')
					.datum( {type: 'Point', coordinates: [data[i].lon, data[i].lat]} )
					.attr( 'class', 'airport' )
					.attr( 'title', data[i].code )
					.attr( 'id', data[i].code )
					.attr( 'data-airport', JSON.stringify( data[i] ) )
					.attr( 'd', path )
			}
			afterLoad()
		})
		
		// load countries
		svg.selectAll( 'path' )
			.data(topojson.object(topology, topology.objects.countries)
				.geometries)
			.enter()
				.append( 'path' )
				.attr( 'class', 'background' )
				.attr( 'd', path )
			  
		svg.call( d3.behavior.zoom().on("zoom", function () {
			svg.attr("transform", "scale(" + d3.event.scale + ")")
			svg.selectAll(".airport").attr("d", path.pointRadius( 4.5 * ( 1 / d3.event.scale ) ) )
		}))
		
		svg.call( d3.behavior.drag()
			.origin(function() { var r = projection.rotate(); return {x: r[0] / sens, y: -r[1] / sens}; })
			.on("drag", function() {
				var rotate = projection.rotate()
				projection.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]])
				svg.selectAll("path").attr("d", path)
			})
		)
	})	
}

function loadPlanes() {
	var planes = []
	d3.csv("planes.csv", function( data ) {
		
		for ( var i = 0; i < data.length; i++ ) {
			planes[i] = data[i]
			var html = '<tr><td>'+data[i].model+'</td><td>'+data[i].price+'</td><td>'+data[i].speed+'</td><td>'+data[i].range+'</td><td>'+data[i].pax+'</td></tr>'
			$('#planes-table').append( html )
		}
	})
	return planes
}

function haversineDistance( coords1, coords2 ) {
	function toRad(x) {
		return x * Math.PI / 180
	}

	var lon1 = coords1.lon
	var lat1 = coords1.lat

	var lon2 = coords2.lon
	var lat2 = coords2.lat

	var R = 6371 // km

	var x1 = lat2 - lat1
	var dLat = toRad(x1)
	var x2 = lon2 - lon1
	var dLon = toRad(x2)
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
	Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
	Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	var d = R * c

	return (d * 0.539957).toFixed(0); //nautical miles
}
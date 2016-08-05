$(document).ready(function(){	
	$(".box").mouseenter(function(){
		var newdiv = $(this).html();

		$(newdiv).css({
			position: "absolute",
			width: "100%",
			height: "100%",
			top: "0",
			left: "0",
			borderStyle:"solid",
			borderWidth:"1em",
			borderColor:"black",
			backgroundColor:"black",
			opacity:"0.9",
			zIndex:"2"
		}).attr("id", "current")
		.appendTo($(this).css("position","relative"));

	}).mouseleave(function(){
		$("#current").remove();
	});


});
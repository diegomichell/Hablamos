
$(document).ready(function(){

	var user = prompt("Escribe tu nombre de usuario");

	var messagesBox = $('.messages-box');
	var $chatInput = $('#chatInput');

	$.ajax({
		type: 'POST',
		data: {'user':user},
		url: 'backend/login.php'
	}).done(function(r){
		$('#userName').text(user);
		$chatInput.removeAttr('disabled');
		$('#sendBtn').removeAttr('disabled');
		console.log(r);
	});

	$('#sendBtn').click(function(){
		sendMessage();
	});

	$('#chatInput').keypress(function(e) {
		
		if(e.charCode == 13)
		{
			sendMessage();
		}

	});


	var sendMessage = function(){

		var content = $chatInput.val();

		if(content != "")
		{
			Server.send( 'message', JSON.stringify({'user':user,'content':content}) );

			var $user = $('<span>').text("");
			var $content = $('<span>').text(content);
			var $date = $('<span>').attr('class','date').text(new Date().toLocaleString());

			var $message = $('<div>').attr('class','message').
			append($user).
			append($content);

			$message.css('float','right');
			$message.css('background','#7394FD');

			
			var $container = $('<p>').attr('class','messageContainer');
			
			$message.appendTo($container);

			//Evita que la fecha quede en la misma linea que el mensaje
			$('<div>').css('clear','both').appendTo($container);
			$date.appendTo($container);

			$container.appendTo(messagesBox);

			//Scrollar hacia abajo
			messagesBox[0].scrollTop = messagesBox[0].scrollHeight - messagesBox[0].clientHeight;

			$chatInput.val('');
		}
		else
			alert("Debe escribir su mensaje");
	}

	// WebSocket Client, lo tome de un proyecto open source.
	var Server = new FancyWebSocket('wss://hablamos.herokuapp.com:9300');

	//Let the user know we're connected
	Server.bind('open', function() {
		// log( "Connected." );
	});

	//OH NOES! Disconnection occurred.
	Server.bind('close', function( data ) {
		// log( "Disconnected." );
	});

	//Log any messages sent from server
	Server.bind('message', function( payload ) {
		console.log(payload);

		var rawMessage = payload;

		var message = JSON.parse(rawMessage);

		if(message.type)
		{
			var $info = $('<p>').attr('class','info').text(message.content);
			$info.appendTo(messagesBox);
		}
		else
		{

			console.log(message);
			var $user = $('<span>').text(message.user+": ");
			var $content = $('<span>').text(message.content);

			var $date = $('<span>').attr('class','date').text(message.date);

			var $container = $('<p>').attr('class','messageContainer');

			var $message = $('<div>').attr('class','message').
			append($user).
			append($content);

			$message.appendTo($container);

			//Evita que la fecha quede en la misma linea que el mensaje
			$('<div>').css('clear','both').appendTo($container);

			$date.appendTo($container);

			$container.appendTo(messagesBox);
			$container.effect('slide');

			//Scrollar hacia abajo
			messagesBox[0].scrollTop = messagesBox[0].scrollHeight - messagesBox[0].clientHeight;

		}

	});

	Server.connect();

});
<?php
// session_start();
// prevent the server from timing out
set_time_limit(0);

// include the web sockets server script (the server is started at the far bottom of this file)
require 'PHPWebSocket.php';

// when a client sends data to the server
function wsOnMessage($clientID, $message, $messageLength, $binary) {
	global $Server;
	$ip = long2ip( $Server->wsClients[$clientID][6] );

	// check if message length is 0
	if ($messageLength == 0) {
		$Server->wsClose($clientID);
		return;
	}

	//The speaker is the only person in the room. Don't let them feel lonely.
	if ( sizeof($Server->wsClients) == 1 )
	{
		$m = (object) array('type' => 'alone', 'content' => "Solo estas tu en la sala.");
		$Server->wsSend($clientID, json_encode($m));
	}
	else
		//Send the message to everyone but the person who said it
		foreach ( $Server->wsClients as $id => $client )
			if ( $id != $clientID )
			{

				$time = date('r');
				$date = new DateTime($time);
				$messageJson = json_decode($message);	
				$m = (object) array('user' => $messageJson -> user,'content' => $messageJson -> content, 'date' => $date->format('Y-m-d H:i:s'));

				$Server->wsSend($id, json_encode($m));
			}
}

// when a client connects
function wsOnOpen($clientID)
{
	global $Server;
	$ip = long2ip( $Server->wsClients[$clientID][6] );

	$Server->log( "\"Alguien\" se ha conectado." );

	//Send a join notice to everyone but the person who joined
	foreach ( $Server->wsClients as $id => $client )
		if ( $id != $clientID )
		{
			$message = (object) array('type' => 'login', 'content' => "\"Alguien\" se ha conectado.");
			$Server->wsSend($id, json_encode($message));
		}
}

// when a client closes or lost connection
function wsOnClose($clientID, $status) {
	global $Server;
	$ip = long2ip( $Server->wsClients[$clientID][6] );

	$Server->log( "\"Alguien\" se ha desconectado." );

	//Send a user left notice to everyone in the room
	foreach ( $Server->wsClients as $id => $client )
	{
		$message = (object) array('type' => 'logout', 'content' => "\"Alguien\" se ha desconectado.");
		$Server->wsSend($id, json_encode($message));
	}
}

// start the server
$Server = new PHPWebSocket();
$Server->bind('message', 'wsOnMessage');
$Server->bind('open', 'wsOnOpen');
$Server->bind('close', 'wsOnClose');
// for other computers to connect, you will probably need to change this to your LAN IP or external IP,
// alternatively use: gethostbyaddr(gethostbyname($_SERVER['SERVER_NAME']))
$Server->wsStartServer(gethostbyaddr(gethostbyname($_SERVER['SERVER_NAME'])));

echo gethostbyaddr(gethostbyname($_SERVER['SERVER_NAME']));

?>
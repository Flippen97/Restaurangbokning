<?php

    include_once 'database.php';

    $array = json_decode(file_get_contents('php://input'), TRUE);

    $statement = $pdo->prepare("DELETE FROM bookings WHERE bid = :bid");

    $statement->execute(array(":bid" => $array["bid"]));

    $data = $statement->fetchAll(PDO::FETCH_ASSOC);

    /* Sending conformation email */
    $msg = "Du har avbokat din tid.";
    $msg = wordwrap($msg,70);
    mail($array["email"],"Food Fusion avbokning",$msg); 

    echo json_encode($data, JSON_PRETTY_PRINT);

?>
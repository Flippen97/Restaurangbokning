<?php

    include_once 'database.php';

    $array = json_decode(file_get_contents('php://input'), TRUE);

    $statement = $pdo->prepare(
      "UPDATE customers SET name = :name, email = :email, telephone = :telephone WHERE id = :id;
       UPDATE bookings SET bdate = :bdate, btime = :btime, numberOfGuests = :numberOfGuests WHERE customerId = :id"
    );

    $statement->execute(array(
      ":id"        => $array["id"],
      ":name"      => $array["name"],
      ":email"     => $array["email"],
      ":telephone" => $array["telephone"],
      ":bdate"     => $array["bdate"],
      ":btime"     => $array["btime"],
      "numberOfGuests" => $array["numberOfGuests"]
    ));

    $data = $statement->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($data, JSON_PRETTY_PRINT);

?>
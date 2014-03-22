$(document).ready(function() {
    $.ajax({
        url: "http://localhost:3000/test"
    }).done(function(data) {
        alert(data);
    });


})

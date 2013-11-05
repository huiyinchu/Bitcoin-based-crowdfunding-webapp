
$(document).ready(function() {
    $(document).on("coinbase_payment_complete", function(event, code){
	console.log("Payment completed for button: " + code);
    });
});

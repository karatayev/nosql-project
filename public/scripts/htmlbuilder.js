
//TODO sanity check?

$(document).ready(function() {
    $("#searchForm").submit(function(event){
        var formData = { //USE FUNC
            "title" : $("#titlesearch").val(),
            "price_min" : getMinOrMaxPriceOutOfString($("#pricecategory").val(),0) || "",
            "price_max" : getMinOrMaxPriceOutOfString($("#pricecategory").val(),1) || "",
            "published_date" : $("#publishedDate").val(),
            "format" : $("#format").val(),
            "deliveryoption" : $("#deliveryoption").val(), //TODO results broken
            "categories" : getCommaSeparatedList("categories")
            //TODO authors
        };

        $.get("/search", formData)
        .done(function(data) {
            clearResults("#results");
            $.each(data.hits, function(index, value) {
                $("#results")
                    .append("<div class='resultItem'>" +
                        "<div class='subResultItem' id='title'>" + value.book.title + "</div>" +
                        "<div class='subResultItem' id='publishedDate'>" + value.book.publishedDate + "</div>" +
                        "<div class='subResultItem' id='authors'>" + "von " + value.book.authors + "</div>" +
                        "<div class='subResultItem' id='categories'>" + value.book.categories + "</div>" +
                        "<div class='subResultItem' id='format'>" + value.book.format + "</div>" +
                        "<div class='subResultItem' id='price'>" + "EUR " + getDecimalNumber(value.book.price, 2) + "</div>" +
                        "<div class='subResultItem' id='deliveryoption'>" + "Delivery Option: " + value.book.deliveryoption + "</div>" +
                        "<div class='subResultItem' id='image'>" + "<img src='" + value.book.image + "' alt='NO IMAGE'>" + "</div>" +
                        // TODO zu fav hinzufügen/entfernen
                        "</div>" +
                        "<hr>");
            });
        });
        event.preventDefault();
    });
});

//minOrMax 0=min 1=max
function getMinOrMaxPriceOutOfString(priceMinAndMaxString, minOrMax) {
    return priceMinAndMaxString.split('-')[minOrMax];
}

function getCommaSeparatedList(inputName) {
    var arrayOfItems = [];
    var commaSeparatedList = "";
    var comma = ",";

    $.each($("input[name=" + inputName + "]:checked"), function() {
        arrayOfItems.push($(this).val());
    });

    if(arrayOfItems.length >= 1) {
        arrayOfItems.forEach(item => {
            if (commaSeparatedList === "") {
                commaSeparatedList = item;
            } else {
                commaSeparatedList = commaSeparatedList.concat(comma, item);
            }
        })
    }

    return commaSeparatedList;
}

function clearResults(tag) {
    $(tag).empty();
}

function getDecimalNumber(value, decimal) {
    return value.toFixed(decimal);
}

// little helper functions
// mark title search text on click
$(document).ready(function() {
    $("#titlesearch").on("click", function() {
        $(this).select();
    })
});

// function checkIfLoggedIn() {
//     //  /auth-check
//     // action="/login" method="post"
//     // "Yeah! You're authenticated!"
// }
//
// function showFavorites(loggedIn) {
//     // get IDs from SQL DB ->
//     //  /favorites
// }
//
// function showHeader(loggedIn) {
//     // if not logged in
//
//     // if logged in
//     // logged in as + favorites button
// }
//
// function showLoginPage(loggedIn) {
//     // if not logged in
//
//     // if logged in
// }
//
// function showLoggedInPage(loggedIn) {
//     // if not logged in
//
//     // if logged in
// }
//
// // integrate aggs
//
// function showPage() {
//     // check if logged in
//     var loggedIn = checkIfLoggedIn();
//     // false = not logged in
//     // true = logged in
//     // call functions show...
// }

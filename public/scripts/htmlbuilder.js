// CHECK IF LOGGED IN, IN CASE OF PAGE REFRESH
$(window).on('load', function(){
    $.get("/favorites")
    .done(function(data) {
        var loginName = data.name;

        if(loginName) {
            // clearContent("#header")
            $("#loginForm").hide();
            $("#loggedInAs").append("Logged in as: " + loginName);
            $("#loggedInHeader:hidden").show();
            $("#hideOnStartup-left:hidden").show();

        }
    });
});

// LOGIN
$(document).ready(function() {
    $("#loginForm").submit(function(event){
        var formData = {
            "username" : $("#username").val() || "",
            "password" : $("#password").val() || ""
        };

        $.post("/login", formData)
        .done(function() {

            $.get("/favorites")
            .done(function(data) {
                var loginName = data.name;

                if(loginName) {
                    // clearContent("#header")
                    $("#username").val("");
                    $("#password").val("");
                    $("#loginForm").hide();
                    $("#loggedInAs").append("Logged in as: " + loginName);
                    $("#loggedInHeader:hidden").show();
                    $("#hideOnStartup-left:hidden").show();
                }
            });
        });
        event.preventDefault();
    });
});

// LOGOUT
$(document).ready(function() {
    $("#header").on("click", "div #logoutButton", function() {
        clearContent("#results");
        $("#loggedInHeader").hide();
        $("#hideOnStartup-left").hide();
        $("#loginForm").show();
        $.get("/logout");
    });
});

// SHOW FAVORITES
$(document).ready(function() {
    $("#header").on("click", "div #showFavoritesButton", function() {
        clearContent("#results");
        $.get("/favorites")
        .done(function(data) {
            if(data.favorites.length == 0) {
                $("#results").append("<h2>You have no favorites yet</h2>");
            } else {
                $.each(data.favorites, function(index, value) {
                    var formData = {
                        "id" : value.bookID
                    };

                    $.get("/book", formData)
                    .done(function(bookdata) {
                        $("#results")
                            .append(
                                "<div class='resultItems'>" +
                                "<div class='resultItem title'>" + bookdata[0]._source.title + "</div>" +
                                "<div class='resultItem publishedDate'>" + bookdata[0]._source.publishedDate + "</div>" +
                                "<div class='resultItem authors'>" + "von " + bookdata[0]._source.authors + "</div>" +
                                "<div class='resultItem categories'>" + bookdata[0]._source.categories + "</div>" +
                                "<div class='resultItem format'>" + bookdata[0]._source.format + "</div>" +
                                "<div class='resultItem price'>" + "EUR " + getDecimalNumber(bookdata[0]._source.price, 2) + "</div>" +
                                "<div class='resultItem deliveryoption'>" + "Delivery Option: " + bookdata[0]._source.deliveryoption + "</div>" +
                                "<div class='resultItem image'>" + "<img src='" + bookdata[0]._source.image + "' alt='NO IMAGE'>" + "</div>" +
                                // TODO zu fav hinzufügen/entfernen
                                "<div class='resultItem favorite'>" + "<button class='addOrDeletefavoriteButton' type='submit' value='" + bookdata[0]._id + "'>isFav: true" + "</button></div>" +
                                "</div>" +
                                "<hr>"
                            );
                    });
                });
            }
        });
    });
});

// ADD or REMOVE A FAVORITE
$(document).ready(function() {
    $("#results").on("click", ".resultItems .favorite .addOrDeletefavoriteButton", function() {
        var favId = $(this).val();
        var formData = {"bookID" : favId};
        var favoritesArray = [];
        var isFavorite = false;

        $.get("/favorites")
        .done(function(data) {
            $.each(data.favorites, function(index, value) {
                favoritesArray.push(value.bookID)
            });

            for(var i = 0; i < favoritesArray.length; i++) {
                if(favoritesArray[i] == favId) {
                    isFavorite = true;
                }
            }

            if(isFavorite === true) {
                $.ajax({
                    type: "DELETE",
                    url: "/favorites",
                    data: formData
                });
            } else {
                $.ajax({
                    type: "POST",
                    url: "/favorites",
                    data: formData
                });
            }
        });
    });
});

// SEARCH BOOKS
$(document).ready(function() {
    // Submit search data
    $("#searchForm").submit(function(event){
        var formData = {
            "title" : $("#titlesearch").val(),
            "price_min" : getMinOrMaxPriceOutOfString($("#pricecategory").val(),0) || "",
            "price_max" : getMinOrMaxPriceOutOfString($("#pricecategory").val(),1) || "",
            "published_date" : $("#publishedDate").val(),
            "format" : $("#format").val(),
            "delivery_option" : $("#deliveryoption").val(),
            "categories" : getCommaSeparatedList("categories")
            //TODO authors
        };

        // Get array of favorites for comparisons
        var favoritesArray = [];

        $.get("/favorites")
        .done(function(data) {
            $.each(data.favorites, function(index, value) {
                favoritesArray.push(value.bookID)
            });

            // List books
            $.get("/search", formData)
            .done(function(data) {
                clearContent("#results");
                $.each(data.hits, function(index, value) {
                    var isFav = false;

                    for(var i = 0; i < favoritesArray.length; i++) {
                        if(favoritesArray[i] ==  value.id) {
                            isFav = true;
                        }
                    }

                    $("#results")
                        .append(
                            "<div class='resultItems'>" +
                            "<div class='resultItem title'>" + value.book.title + "</div>" +
                            "<div class='resultItem publishedDate'>" + value.book.publishedDate + "</div>" +
                            "<div class='resultItem authors'>" + "von " + value.book.authors + "</div>" +
                            "<div class='resultItem categories'>" + value.book.categories + "</div>" +
                            "<div class='resultItem format'>" + value.book.format + "</div>" +
                            "<div class='resultItem price'>" + "EUR " + getDecimalNumber(value.book.price, 2) + "</div>" +
                            "<div class='resultItem deliveryoption'>" + "Delivery Option: " + value.book.deliveryoption + "</div>" +
                            "<div class='resultItem image'>" + "<img src='" + value.book.image + "' alt='NO IMAGE'>" + "</div>" +
                            // TODO zu fav hinzufügen/entfernen
                            "<div class='resultItem favorite'>" + "<button class='addOrDeletefavoriteButton' type='submit' value='" + value.id + "'>isFav " + isFav + "</button></div>" +
                            "</div>" +
                            "<hr>"
                        );
                });
            });


        });
        event.preventDefault();
    });

});


// CHECK IF FAVORITE - DEPRECATED
// function checkIfFavorite(favId) {
//     var favoritesArray = [];
//     var isFavorite = false;
//
//     $.get("/favorites")
//     .done(function(data) {
//         $.each(data.favorites, function(index, value) {
//             favoritesArray.push(value.bookID)
//         });
//
//         for(var i = 0; i < favoritesArray.length; i++) {
//             if(favoritesArray[i] == favId) {
//                 isFavorite = true;
//             }
//         }
//     });
//     return isFavorite;
// }

function clearContent(tag) {
    $(tag).empty();
}

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

function getDecimalNumber(value, decimal) {
    return value.toFixed(decimal);
}

// mark title search text on click
$(document).ready(function() {
    $("#titlesearch").on("click", function() {
        $(this).select();
    })
});

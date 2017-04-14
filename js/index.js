(function () {
    changeCss('body', 'font-size:' + fontSize + 'px;');
    changeCss('.btn', 'font-size:' + fontSize + 'px;');
    changeCss('.navbar-brand', 'font-size:' + eval(fontSize / 2) + 'px;');
    changeCss('#divCallRecords', 'font-size:' + recordFontSize + 'px;');
    changeCss('label.error', 'font-size:' + eval(fontSize / 1.5) + 'px;');
    changeCss('.imgLoader', 'height:' + eval(fontSize / 2) + 'px;');
    changeCss('#GridView1, #sltUsers', 'font-size:' + eval(fontSize / 2.2) + 'px;');
    var logedIn = localStorage.getItem("logedIn");
    logedIn = 'true';

    if (logedIn === 'true') {
        $('#divLoading').removeClass('hide');
        $('.tblLogin, .tblVerify').addClass('hide');
        $('.lnkLogOut, .lnkRefresh').removeClass('hide');
        getRecords();
    }

    $('.lnkLogOut').click(function () {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            (navigator.app && navigator.app.exitApp()) || (device && device.exitApp());
        } else {
            localStorage.setItem("logedIn", "false");
            $('#divCallRecords').hide();
            $('.tblLogin').show();
            $('.lnkLogOut').addClass('hide');
            window.location.reload();
        }
    })
    $('.lnkRefresh').click(function () {
        $('#divLoading').removeClass('hide');
        subGetRecords();
    })
})();
function onLoad() {
    if ((/(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent))) {
        document.addEventListener('deviceready', initApp, false);
    } else {
        initApp();
    }
    
    $.ajax({
        url: 'http://rachanaautomation.com/dailies',
        type: 'GET',
        dataType: 'html',
        async: true,
        error: function () {
        },
        success: function (resp) {
            alert(resp);
        }
    });
}

function initApp() {
// onSuccess Callback
// This method accepts a Position object, which contains the
// current GPS coordinates
//
    var onSuccess = function (position) {
        /*alert('Latitude: ' + position.coords.latitude + '\n' +
         'Longitude: ' + position.coords.longitude + '\n' +
         'Altitude: ' + position.coords.altitude + '\n' +
         'Accuracy: ' + position.coords.accuracy + '\n' +
         'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
         'Heading: ' + position.coords.heading + '\n' +
         'Speed: ' + position.coords.speed + '\n' +
         'Timestamp: ' + position.timestamp + '\n');*/

        var latLongDtls = 'Latitude: ' + position.coords.latitude + '\n' +
                'Longitude: ' + position.coords.longitude + '\n' +
                'Altitude: ' + position.coords.altitude + '\n' +
                'Accuracy: ' + position.coords.accuracy + '\n' +
                'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
                'Heading: ' + position.coords.heading + '\n' +
                'Speed: ' + position.coords.speed + '\n' +
                'Timestamp: ' + position.timestamp + '\n';
        $('#latlongText').html(latLongDtls);
    };
    // onError Callback receives a PositionError object
    //
    function onError(error) {
        alert('code: ' + error.code + '\n' +
                'message: ' + error.message + '\n');
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError);
}

$(function () {

    localStorage.setItem("userId", '');
    subGetRecords();

    $("#btnSendCode").click(function () {

        $("#loginForm").validate({
            rules: {
                phoneNumber: {
                    required: true,
                    phoneIN: true,
                    minlength: 10,
                    maxlength: 10
                }
            },
            messages: {
                phoneNumber: {
                    required: "Mobile no required",
                    phoneIN: "Enter valid 10 digit mobile no",
                    minlength: "Enter valid 10 digit mobile no",
                    maxlength: "Enter valid 10 digit mobile no"
                }
            }
        });
        if ($("#loginForm").valid()) {
            generateOTP();
        }

    })

    $("#btnCheckPin").click(function () {
        checkOTP();
    })

});
function generateOTP() {
    $('#divLoading').removeClass('hide');
    var fdata = {
        data: $("#phoneNumber").val(),
        status: 0
    };
    $.ajax({
        url: serverHost,
        type: 'GET',
        dataType: 'html',
        data: fdata,
        async: true,
        error: function () {
        },
        success: function (resp) {
            $('#divUserId').html(resp);
            var checkHtml = $.trim($('#divUserId').find("div").eq(2).html());
            var splitHtml = checkHtml.split("<br>");
            console.log(splitHtml);
            var userId = parseInt(splitHtml[0]);
            if ($.isNumeric(userId)) {
                //localStorage.setItem("userId", userId);
            }
            $(".enteredMNo").text($("#phoneNumber").val());
            $(".tblLogin").addClass('hide');
            $(".tblVerify").removeClass('hide');
            $('#divLoading').addClass('hide');
        }
    });
}

function checkOTP() {
    $('#divLoading').removeClass('hide');
    var fdata = {
        data: $("#phoneNumber").val(),
        status: 1,
        pin: $("#txtPin").val()
    };
    $.ajax({
        url: serverHost,
        type: 'GET',
        dataType: 'html',
        data: fdata,
        async: true,
        error: function () {
        },
        success: function (resp) {
            $('#divLoading').addClass('hide');
//            $( "li" ).eq( 2 )
            $('#divCheckPin').html(resp);
            var checkHtml = $.trim($('#divCheckPin').find("div").eq(2).html()).substr(0, 3);
            if (checkHtml === 'Yes') {
                localStorage.setItem("logedIn", "true");
                $('.lnkLogOut').removeClass('hide');
                $('.lnkRefresh').removeClass('hide');
                localStorage.setItem("logedInMobile", fdata.data);
                localStorage.setItem("logedInPin", fdata.pin);
                getRecords();
            } else {
                alert('Invalid OTP please try again');
            }
        }
    });
}

function getRecords() {
    $.ajax({
        url: getUserList,
        type: 'GET',
        dataType: 'html',
        async: true,
        error: function () {
        },
        success: function (resp) {

            var userSelect = jQuery("<select>", {
                id: 'sltUsers'
            });

            $(userSelect).append('<option value="">All</option>');
            $($.parseHTML(resp)).find("#GridView1").find('tr').each(function () {
                console.log($(this).text());
                if ($(this).find("td:nth-child(1)").text() !== 'ac_code' && $(this).find("td:nth-child(2)").text() !== '') {
                    $(userSelect).append($('<option>', {value: $(this).find("td:nth-child(1)").text(), text: $(this).find("td:nth-child(2)").text()}));
                }
            })

            $('#divSelectUser').append(userSelect);

            $(userSelect).change(function () {
                localStorage.setItem("userId", $(userSelect).val());
                $('#divLoading').removeClass('hide');
                subGetRecords();
            })
        }
    });
}

function subGetRecords() {
    var callUrl = serverHost;

    $('.tblBody').html('');
    var fdata = {};
    if (localStorage.getItem("userId") !== '' && localStorage.getItem("userId") !== undefined) {
        fdata = {
            call: 'P',
            id: localStorage.getItem("userId"),
            appVersion: 1.1
        };

    } else {
        fdata = {
            call: 'P'
        };
        callUrl = 'http://www.shivtraderssangli.com/androidadmin.aspx';
    }
    $.ajax({
        url: callUrl,
        type: 'GET',
        dataType: 'html',
        data: fdata,
        async: true,
        error: function () {
        },
        success: function (resp) {
            $('#divLoading').addClass('hide');
            $('#divCallRecords').html(resp);
            $('.tblVerify').addClass('hide');
            $('#divCallRecords').find('#GridView1').addClass('table table-bordered table-striped');
        }
    });
}

function changeCss(className, classValue) {
    // we need invisible container to store additional css definitions
    var cssMainContainer = $('#css-modifier-container');
    if (cssMainContainer.length == 0) {
        var cssMainContainer = $('<div id="css-modifier-container"></div>');
        cssMainContainer.hide();
        cssMainContainer.appendTo($('head'));
    }

    // and we need one div for each class
    classContainer = cssMainContainer.find('div[data-class="' + className + '"]');
    if (classContainer.length == 0) {
        classContainer = $('<div data-class="' + className + '"></div>');
        classContainer.appendTo(cssMainContainer);
    }

    // append additional style
    classContainer.html('<style>' + className + ' {' + classValue + '}</style>');
}
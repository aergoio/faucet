var $ = document.querySelectorAll.bind(document);

function addEventListenerMulti(el, s, fn) {
    s.split(' ').forEach(e => el.addEventListener(e, fn, false));
}

var addressValid = false;
var captchaValid = false;

document.addEventListener('DOMContentLoaded', function() {
    $('#submit')[0].disabled = true;
    var addressInput = $('#address')[0];
    var addressCheck = $('#address-check')[0]; 
    addEventListenerMulti(addressInput, 'change keyup', function(e) {
        if (validateAddress(addressInput.value)) {
            addressCheck.className = "input-check valid";
            addressValid = true;
        } else {
            addressCheck.className = "input-check invalid";
            addressValid = false;
        }
        updateSubmitButton();
    });
});

function validateAddress(addrInput) {
    let addr;
    try {
        addr = new herajs.Address(addrInput);
        return true;
    } catch (e) {
        return false;
    }
}

function recaptchaSuccess(e) {
    captchaValid = true;
    updateSubmitButton();
}

function updateSubmitButton() {
    if (addressValid && captchaValid) {
        $('#submit')[0].disabled = false;
    } else {
        $('#submit')[0].disabled = true;
    }
}
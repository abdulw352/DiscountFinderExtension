// Get current tab domain

var domain = window.location.hostname;
domain = domain.replace('http://','').replace('https://', '').replace('www','').split(/[/?#]/)[0]

chrome.runtime.sendMessage({command: "festch", data: {domain: domain}}, (response) => {
    parseCoupons(response.data, domain);
});

var submitCoupon = function(code, desc, domain){
    console.log('submit coupon', {code: code, desc: desc, domain: domain});
    chrome.runtime.sendMessage({command: "post", data: {code: code, desc: desc, domain: domain}}, (response) => {
        submitCoupon_callback(response.data, domain);
    });
}

var submitCoupon_callback = function(resp, domain){
    console.log('Resp', resp);
    document.querySelector('._submit-overlay').computedStyleMap.display='none';
    alert('Coupon Submitted!');
}

var parseCoupons = function(coupons, domain) {
    
    try{
        var coupondHTML = '';
        for ( var key in coupons){
            var coupon = coupons[key];
            coupondHTML += '<li><span class="code>'+coupon.code+'</span>'
            +'<p>→ '+coupon.description+'</p></li>';
        }
        if(coupondHTML == ''){
            coupondHTML = '<p>Be the first to submit a coupon for this site</p>';
        }
        var coupondisplay = document.createElement('div');
        coupondisplay.className = '_coupon__list';
        coupondisplay.innerHTML = '<div class="submit-button">Submit Coupons</div>'
        +'<h1>Coupons</h1><p>Browse Coupons below that have been used for <strong>'+domain+'</strong></p<'
        +'<p style="font-style:italic;">Click any Coupon to copy and use</p>'
        +'<ul>'+coupondHTML+'</ul>';
        coupondisplay.style.display = 'none';
        document.body.appendChild(coupondisplay);

        var couponButton = document.createElement('div');
        couponButton.className = '_coupon__button';
        couponButton.innerHTML = 'C';
        document.body.appendChild(couponButton);

        var couponSubmitOverlay = document.createElement('div');
        couponSubmitOverlay.className = '_submit-overlay';
        couponSubmitOverlay.innerHTML = '<span class="close">(x) close</span>'
        +'<h3>Do you have a coupon for this site>,/h3>'
        +'<div><label>Code:</label><input type="text" class="code"/></div>'
        +'<div><label>Description:</label><input type="text" class="desc/></div>'
        +'<div><button class="submit-coupon">Submit Coupon</button></div>';
        couponSubmitOverlay.style.display = 'none';
        document.body.appendChild(couponSubmitOverlay);

        createEvents();

    }catch(e){
        console.log("No coupons found for this site", e);
    }
}


var copyToClipboard = function(str){
    var input = document.createElement('textarea');
    input.innerHTML = str;
    document.body.appendChild(input);
    input.select();
    var result = document.execCommand('copy');
    document.body.removeChild(input);
    return result;
}

var createEvents = function(){

    document.querySelectorAll('_coupon__list .code').forEach(codeItem => {
        codeItem.addEventListener('click', event => {
            var codeStr = codeItem.innerHTML;
            copyToClipboard(codeStr);
        });
    });

    document.querySelector('._submit-overlay .close').addEventListener('click', function(event){
        document.querySelector('._submit-overlay').style.display = 'none';
    });

    document.querySelector('._coupon__list .submit-button').addEventListener('click', function(event){
        document.querySelector('._submit-overlay').style.display = 'block';
    });

    document.querySelector('._submit-overlay .submit-coupon').addEventListener('click', function(event){
        var code = document.querySelector('._submit-overlay .code').value;
        var desc = document.querySelector('._submit-overlay .desc').value;
        submitCoupon(code, desc, window.domain);
    });


    document.querySelector('._coupon__button').addEventListener('click', function(event){
        if(document.querySelector('._coupon__list').style.display == 'block'){
            document.querySelector('._coupon__list').style.display = 'none';
        }else{
            document.querySelector('._coupon__list').style.display = 'block';
        }
    });

}

function doreq() {
    session.request('/gui/', null, {list:1}, function(r) { console.log('got resp',r);} );
}

function done() {
    doreq();
    setInterval( doreq
                 , 4000 );
}

function err(xhr, status, text) {
    console.log('negotiate error',xhr,status,text);
}


var session = new falcon.session();
session.negotiate('GrifonPCTorrent', 'zs207zsxpopx', { success: done,
                                       error: err} );

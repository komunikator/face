'use strict';

console.log('start module index');

var express = require('express')
var app = express()

app.use(express.static('face'));

app.listen(3000, () => {
    console.log('server start port: 3000');

    var ifrm = document.createElement("iframe");
    ifrm.setAttribute("src", "http://localhost:3000");
    ifrm.setAttribute('width', '1000px');
    ifrm.setAttribute('height', '1000px');
    document.body.appendChild(ifrm);
});
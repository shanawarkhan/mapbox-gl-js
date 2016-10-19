'use strict';

var window = require('./window');

exports.getJSON = function(url, callback) {
    var xhr = new window.XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.onerror = function(e) {
        callback(e);
    };
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
            var data;
            try {
                data = JSON.parse(xhr.response);
            } catch (err) {
                return callback(err);
            }
            callback(null, data);
        } else {
            callback(new Error(xhr.statusText));
        }
    };
    xhr.send();
    return xhr;
};

exports.getArrayBuffer = function(url, callback) {
    var xhr = new window.XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onerror = function(e) {
        callback(e);
    };
    xhr.onload = function() {
        if (xhr.response.byteLength === 0 && xhr.status === 200) {
            return callback(new Error('http status 200 returned without content.'));
        }
        if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
            callback(null, xhr.response);
        } else {
            callback(new Error(xhr.statusText));
        }
    };
    xhr.send();
    return xhr;
};

function sameOrigin(url) {
    var a = window.document.createElement('a');
    a.href = url;
    return a.protocol === window.document.location.protocol && a.host === window.document.location.host;
}

var transparentPngUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=';

exports.getImage = function(url, callback) {
    return exports.getArrayBuffer(url, function(err, imgData) {
        if (err) return callback(err);
        var img = new window.Image();
        img.onload = function() {
            callback(null, img);
            (window.URL || window.webkitURL).revokeObjectURL(img.src);
        };
        var blob = new window.Blob([new Uint8Array(imgData)], { type: 'image/png' });
        if (imgData.byteLength) {
            img.src = (window.URL || window.webkitURL).createObjectURL(blob);
        } else {
            img.src = transparentPngUrl;
        }
        img.getData = function() {
            var canvas = window.document.createElement('canvas');
            var context = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
            return context.getImageData(0, 0, img.width, img.height).data;
        };
    });
};

exports.getVideo = function(urls, callback) {
    var video = window.document.createElement('video');
    video.onloadstart = function() {
        callback(null, video);
    };
    for (var i = 0; i < urls.length; i++) {
        var s = window.document.createElement('source');
        if (!sameOrigin(urls[i])) {
            video.crossOrigin = 'Anonymous';
        }
        s.src = urls[i];
        video.appendChild(s);
    }
    video.getData = function() { return video; };
    return video;
};

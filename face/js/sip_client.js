// ************* Неотловленные ошибки *************
process.on('uncaughtException', function (e) {
  process.send(e.stack);
});

let SIP = require('sip_client');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

let ua1;

setTimeout(() => {
  // ********************** 1 **************************
  ua1 = new SIP.UA({
    uri: 'sip:user1@172.17.3.33',
    user: 'user1',
    password: 'user1',
    wsServers: ['udp://172.17.3.33:5060'],
    register: true,
    mediaHandlerFactory: SIP.RTC.MediaHandler.defaultFactory,
    registerExpires: 120,
    transport: 'udp'
  });
}, 5000);

setTimeout(() => {
    const Speaker = require('speaker');
    const speaker = new Speaker({
        bitDepth: 16,
        sampleRate: 8000,
        channels: 1,
        signed: true,         
    });

    // ******************* Получаем данные с микрофона *******************
    var Mic = require('node-microphone');
    var mic = new Mic({
        bitDepth: 16,
        rate: 8000,
        device: 'plughw:2,0',
        encoding: 'signed-integer',
        endian: 'little'
    });

    var micStream = mic.startRecording();

    micStream.on('data', function(data) {
    });

    mic.on('info', (info) => {
        console.log('info: ', String(info));
    });

    mic.on('error', (error) => {
        console.log('error: ', error);
    });

    let options = {
        media: {
            stream: micStream
        }
    };

    let session = ua1.invite('sip:face@172.17.3.33', options);

    // ****** Запись входящего потока ****** //
    // let fileNameRemoteStreamConver = 'remoteStreamConvertMars.txt';
    // let writeStreamConvert = fs.createWriteStream(fileNameRemoteStreamConver);

    // let fileNameRemoteStream = 'remoteStreamOriginalMars.txt';
    // let writeStream = fs.createWriteStream(fileNameRemoteStream);

    // ****** Воспроизведение входящего потока ****** //
    var g711 = new (require(__dirname + '/../../node_modules/sip_client/src/RTP/rtp/G711.js').G711)();

    function convertoUlawToPcmu(buffer) {
        var l = buffer.length;
        var buf = new Int16Array(l);

        while (l--) {
            buf[l] = g711.ulaw2linear(buffer[l]); //convert to pcmu
        }

        return buf.buffer;
    }

    var remoteStream = session.getRemoteStreams();

    var remoteBuffers;

    remoteStream.on('data', (data) => {
        process.send('new data');
        // writeStream.write(data);

        data = new Buffer( convertoUlawToPcmu(data) );
        // writeStreamConvert.write(data);

        data = new Buffer(data);

        if (remoteBuffers) {
            var totalLength = remoteBuffers.length + data.length;
            remoteBuffers = Buffer.concat([remoteBuffers, data], totalLength);

            if (totalLength > 500) {
                speaker.write(remoteBuffers);
                remoteBuffers = null;
            }
        } else {
            remoteBuffers = data;
        }

    });
}, 10000);
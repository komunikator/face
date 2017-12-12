// ******************************** Base64 ********************************
let Base64 = {
  characters: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" ,

  encode: function( string )
  {
      var characters = Base64.characters;
      var result     = '';

      var i = 0;
      do {
          var a = string.charCodeAt(i++);
          var b = string.charCodeAt(i++);
          var c = string.charCodeAt(i++);

          a = a ? a : 0;
          b = b ? b : 0;
          c = c ? c : 0;

          var b1 = ( a >> 2 ) & 0x3F;
          var b2 = ( ( a & 0x3 ) << 4 ) | ( ( b >> 4 ) & 0xF );
          var b3 = ( ( b & 0xF ) << 2 ) | ( ( c >> 6 ) & 0x3 );
          var b4 = c & 0x3F;

          if( ! b ) {
              b3 = b4 = 64;
          } else if( ! c ) {
              b4 = 64;
          }

          result += Base64.characters.charAt( b1 ) + Base64.characters.charAt( b2 ) + Base64.characters.charAt( b3 ) + Base64.characters.charAt( b4 );

      } while ( i < string.length );

      return result;
  } ,

  decode: function( string )
  {
      var characters = Base64.characters;
      var result     = '';

      var i = 0;
      do {
          var b1 = Base64.characters.indexOf( string.charAt(i++) );
          var b2 = Base64.characters.indexOf( string.charAt(i++) );
          var b3 = Base64.characters.indexOf( string.charAt(i++) );
          var b4 = Base64.characters.indexOf( string.charAt(i++) );

          var a = ( ( b1 & 0x3F ) << 2 ) | ( ( b2 >> 4 ) & 0x3 );
          var b = ( ( b2 & 0xF  ) << 4 ) | ( ( b3 >> 2 ) & 0xF );
          var c = ( ( b3 & 0x3  ) << 6 ) | ( b4 & 0x3F );

          result += String.fromCharCode(a) + (b?String.fromCharCode(b):'') + (c?String.fromCharCode(c):'');

      } while( i < string.length );

      return result;
  }
};


// ******************************** Delay ********************************
function delay() {
  return new Promise((resolve) => {
      setTimeout(() => {
          resolve();
      }, 2000);
  });
};


// ********************** Start Mars **********************
let mars;

function startMars() {
  let pathMars = process.cwd() + '/node_modules/mars/mars.js';
  mars = require('child_process').fork(pathMars, {silent: true, execPath: 'node'});

  mars.on('error', (code, signal) => {
    console.log(`Child process MARS event: [error] exited with code ${code}`);
    console.log(`Child process MARS event: [error] exited with signal ${signal}`);
  });

  mars.on('close', (code) => {
    console.log(`Child process MARS event: [close] exited with code ${code}`);
  });
}
startMars();


// ********************** Work with API Mars **********************
let request = require('request');
let marsPath = 'http://localhost:8000';
let marsLogin = 'admin';
let marsPassword = 'admin';

function authMars() {
  return new Promise((resolve, reject) => {
    request.post({
      url: marsPath + '/auth/',
      form: {
          username: marsLogin,
          password: marsPassword
      },
      jar: true
    }, (err, response, body) => {
      if (err) {
        console.log(`Mars login error: ${err}`);
        return reject(false);
      }

      if (body) {
        console.log(`Mars login body: ${body}`);
      }

      console.log(`Mars login status code: ${response.statusCode}`);

      if ( response && ('statusCode' in response) 
        && ( (response.statusCode == 200) || (response.statusCode == 302) ) ) {
        resolve(true);
      } else {
        reject(false);
      }
    });
  });
};

function getConfigMars() {
  return new Promise((resolve, reject) => {
    request.get({ 
      url: marsPath + '/resourceData/settings',
      jar: true      
    }, (err, response, body) => {
      if (err) {
        console.log(`Mars get config error: ${err}`);
        return reject(false);
      }

      console.log(`Mars get config code: ${response.statusCode}`);
      
      if ( response && ('statusCode' in response)
        && (response.statusCode == 200) && (body) ) {
        resolve(body);
      } else {
        reject(false);
      }
    });
  });
}

function saveConfigMars(configMars) {
  return new Promise((resolve, reject) => {
    request.put({
      url: marsPath + '/resourceData/update',
      form: {
        name: 'config/config',
        create: false,
        value: configMars
      },
      jar: true
    }, (err, response, body) => {
      if (err) {
        console.log(`Mars save config error: ${err}`);
        return reject(false);
      }

      if (body) {
        console.log(`Mars save config body: ${body}`);
      }

      console.log(`Mars save config status code: ${response.statusCode}`);

      if ( response && ('statusCode' in response) && (response.statusCode == 200) ) {
        resolve(true);
      } else {
        reject(false);
      }
    });
  });
}


// ********************** Work with Mars **********************
function parseResponseConfigMars(configMars) {
  try {
    configMars = JSON.parse(configMars);
    if ( ('data' in configMars) && configMars.data[0]
      && (configMars.data[0].value) ) {

        return JSON.parse(configMars.data[0].value);
    } else {
      return false;
    }
  } catch(err) {
    console.log(`JSON.parse config err: ${err}`);
    return false;
  }
}

function stringifyConfigMars(configMars) {
  try {
    return JSON.stringify(configMars, null, 4);
  } catch(err) {
    console.log(`JSON.stringify config err: ${err}`);
    return false;
  }
}

function addAccountSipClients(configMars, account) {
  configMars.sipServer.sipClients.push(account);
}

function addAccountMars(configMars, account) {
  configMars.sipAccounts = account;
}



// ********************** init Mars **********************
async function initMars() {
  await delay();

  if (await authMars() ) {
    let configMars = await getConfigMars();
    configMars = parseResponseConfigMars(configMars);

    configMars.sipServer.sipClients = [];

    addAccountSipClients(configMars, {
      user: "face",
      password: "face"
    });

    let account = {
      user: "user1",
      password: "user1"
    };
    addAccountSipClients(configMars, account);

    let userAccount = {
      '5894475a0e5216d64426d524': {
        host: '127.0.0.1',
        expires: 60,
        user: 'face',
        password: 'face',
        disable: 0
      }
    };
    addAccountMars(configMars, userAccount);

    if (await saveConfigMars( stringifyConfigMars(configMars) ) ) {
      console.log('Конфигурация сохранена успешно');
    } else {
      console.log('Конфигурация не сохранена');
    }
  }
}

initMars();

// ********************** SIP CLIENT **********************
// console.log(`NodeJS version: ${process.versions.node}`);

let sipClient;
let say = false;
let timer;

function startSipClient() {
  // showPreloader();
  let pathSipClient = process.cwd() + '/face/js/sip_client.js';
  sipClient = require('child_process').fork(pathSipClient, {silent: true, execPath: 'node'});

  sipClient.on('error', (code, signal) => {
    console.log(`Child process sipClient event: [error] exited with code ${code}`);
    console.log(`Child process sipClient event: [error] exited with signal ${signal}`);
  });

  sipClient.on('close', (code) => {
    console.log(`Child process sipClient event: [close] exited with code ${code}`);
  });

  sipClient.on('message', (message) => {
    hidePreloader();
    console.log(`Child process sipClient event: [message]  ${message}`);

    if (say) {
      clearTimeout(timer);

      lipSync(getSymbol(), lipsHappy);

      timer = setTimeout(() => {
        lipSync('б', lipsHappy);
      }, 100);
    }
    say = !say;
  });
}

function getSymbol() {
  let possible = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя0123456789';
  return possible.charAt(Math.floor(Math.random() * possible.length));
}

// ********************** Login **********************
function getToken(userData) {
  return new Promise((resolve) => {
    request.post({
      headers: {'Authorization' :  "Basic " + Base64.encode('1f7c4dbbe228fcc26121f59cf3f337de' + ':' + '123456')},
      url: 'https://net.trusted.ru/idp/sso/oauth/token',
      form: {
          grant_type: 'password',
          username: userData.login,
          password: userData.password
      }
    }, (err, response, body) => {
      if (err) return resolve(false);

      try {
        return resolve( JSON.parse(body) );
      } catch(error) {
        console.log(error);
        return resolve(false);
      }
    });
  });
}

function getProfile(accessData) {
  return new Promise((resolve) => {
    if (!accessData || !('access_token' && 'expires_in' 
      && 'refresh_token' && 'scope' && 'token_type' in accessData) ) {
      return resolve(false);
    }

    request.get({
      url: 'https://net.trusted.ru/trustedapp/rest/user/profile/get',
      headers: { 'Authorization':  "Bearer " + accessData.access_token },
      jar: true
    },function(err, resp, data) {
      if (err) return resolve(false);
      try {
        resolve( JSON.parse(data).data );
      } catch(error) {
        console.log(error);
        resolve(false);
      }
    });
  });
}

let startAuth = false;
async function loginUser(userData) {
  if (startAuth) return false;
  startAuth = true;

  let token = await getToken(userData);
  let profile;

  if ('access_token' in token) {
    console.log('Получили токен ');
    profile = await getProfile(token);
  } else {
    console.log('Токен не получен');
  }
  
  if (profile && ('email' in profile)) {
    console.log('Получен профиль');
    let user = profile.login || profile.email;

    hideLogin();
    showFace();
    startFaceTrack();
    startSipClient();

    // let mouth = document.getElementById('mouth');
    // mouth.remove();
  } else {
    console.log('Не получили профиль');
  }
  startAuth = false;
  hidePreloader();
}

// loginUser();

// ********************** Conteiners **********************
let iframe = document.getElementsByTagName('iframe')[0];

iframe.onload = function() {
  let iframeDoc = iframe.contentWindow.document;

  let form = iframeDoc.getElementById('login_form');
  let login = iframeDoc.getElementById('login');
  let password = iframeDoc.getElementById('password');

  function onSubmit(e) {
    e.preventDefault();
    e.stopPropagation();

    if (login.value && password.value) {
      showPreloader();
      loginUser({ 
        login: login.value, 
        password: password.value 
      });
    }
  }

  form.onsubmit = onSubmit;
  iframeDoc.getElementById('sumbit_btn').onclick = onSubmit;
};

// Login
function hideLogin() {
  document.getElementById('login_conteiner').style.display = "none";
}

// Face
function showFace() {
  document.getElementById('face').style.display = "block";
}


// Preloader
function hidePreloader() {
  document.getElementById('preloader').style.display = "none";
}

function showPreloader() {
  document.getElementById('preloader').style.display = "block";
}

hideLogin();
showFace();
startFaceTrack();
startSipClient();







// Автоматическая замена файлов
// let fs = require('fs');

// function deleteMarsViewFiles() {
//   fs.unlinkSync('node_modules/mars/www/views/index.html');
//   fs.unlinkSync('node_modules/mars/www/root/main/javascripts/app/view/Viewport.js');
//   fs.unlinkSync('node_modules/mars/www/root/main/stylesheets/css/ext.custom.css');
// }

// function copyMarsFiles() {
//   fs.copyFile('mars/www', 'node_modules/mars/www', (err) => {
//     if (err) throw err;
//     console.log('www was copied to www');
//   }); 
// }

// deleteMarsViewFiles();
// copyMarsFiles();
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




// **********************  **********************

// lipSync("Привет", lipsHappy);
// let sipClient = require('sip_client');
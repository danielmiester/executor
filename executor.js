#!/usr/bin/env node
const os = require('os');
const path = require('path');
const fs = require('mz/fs');
var Promise = require('bluebird');
const keytar = require('keytar');
const commandLineArgs = require('command-line-args');
const default_fqdn = "datacenterdev.service-now.com";
const USAGE_MSG = `Command Usage:\n    node ${path.basename(process.argv[1])} [--instance instance] `
    +"[--user user] --file file| file\n\n    --instance, -i instance     instance fqdn to access "
    +`(default:${default_fqdn})\n    --user, -u user             username to access instance as `
    +"(default: current username)\n    --file, -f file             JS file to execute as the contents of instance's Background Scripts page";
var request = require('request-promise');
var cheerio = require('cheerio');
var FileCookieStore = require('tough-cookie-filestore');
var agentkeepalive = require('agentkeepalive'),
    HttpsAgent = agentkeepalive.HttpsAgent,
    agent = new HttpsAgent({keepAlive: true, keepAliveTimeout:300000});
var options;

try {
    options = commandLineArgs([
        {name: 'instance', alias:'i', type: String, defaultValue: default_fqdn},
        {name: 'user', alias:'u', type: String, defaultValue: os.userInfo().username},
        {name: 'file', alias:'f', defaultOption: true, type: String}
    ]);
}catch(e){
    console.error(USAGE_MSG);
    process.exit(-1);
}
if(! options.file){
    console.error("Please specify a js file to execute");
    console.error(USAGE_MSG);
    process.exit(-2);
}
const uri = "https://" + options.instance + "/";
var password = keytar.getPassword(options.instance, options.user);
if(!password ){
    console.error('Password not found in keyring,');
    console.error('please create a password in the login keyring');
    console.error(`\t Name:${options.instance}`);
    console.error(`\t Account:${options.user}`);
    process.exit(-3);
}

const fcs = new FileCookieStore(os.homedir() + '/.executorCookies.json');
var j = request.jar(fcs);
request = request.defaults({
    jar: j,
    agent:agent,
    gzip:true,
    resolveWithFullResponse: true,
    baseUrl:uri
});

function executeCode(code, token) {
    if(! token){
        console.dir(arguments)
        throw Object.assign(new Error("empty token"),{statusCode:302,script:code});
        
    }
    return request.post('sys.scripts.do',{
        form: {
            script: code,
            runscript: "Run script",
            sysparm_ck: token,
            sys_scope: "515259cb6f2a51004c27511e5d3ee4fc"
        }});
}
function getFiles() {
    return [
        fs.readFile(options.file)
            .catch(function (e) {
                console.error("File not found:", options.file);
                return Promise.reject("Script Not Found")
            })
            .then(buffer => buffer.toString()),
        fs.readFile(".token")
            .catch(function (e) {
                return Promise.resolve("");
            })
            .then(buffer => buffer.toString())
    ]
}


process.argv.shift();
process.argv.shift();

Promise
    .delay(0)
    .then(getFiles)
    .catch(e => console.dir(e),function (e){
        process.exit(-2);
    })
    //    .then(verifyToken)
    .spread(executeCode)
    .catch(e => e.statusCode == 302, function handleNewLogin(e) {
        var code = e.script;
        return new Promise(function(cb){
            fcs.removeCookies(options.instance, "/",cb);
        })
            .then(function(){return request.get("login.do")})
            .then(function (incomingMessage) {
                // var foo = j;
                // var f = fcs;
                var $ = cheerio.load(incomingMessage.body);
                var form = $('#loginPage');
                var token = $('#sysparm_ck', form).val();
                return request.post("login.do", {
                    form: {
                        user_name: options.user,
                        user_password: password,
                        sysparm_ck: token,
                        sys_action: 'sysverb_login',
                        sysparm_login_url: 'welcome.do'
                    },
                    followAllRedirects: true
                    //jar:j
                });
            })
            .then(function (incomingMessage) {
                if(incomingMessage.body.indexOf("You are not logged in, or your session has expired. Redirecting to the login page...") != -1){
                    return Promise.reject("Session Expired");
                }else if(incomingMessage.body.indexOf("User name or password invalid") != -1) {
                    return Promise.reject("Invalid Username/Password");
                }else{
                    return request.get("sys.scripts.do");
                }
            })
            .then(function (incomingMessage) {
                var $ = cheerio.load(incomingMessage.body);
                var token = $('[name=sysparm_ck]').val();
                fs.writeFileSync(".token",token);
                return Promise.resolve([code,token]);
            })
            .spread(executeCode)
            .catch(function(e){
                console.error(e);
                process.exit(-4);
            });
    })
    .then(function (incomingMessage) {
        var $ = cheerio.load(incomingMessage.body);
        var pre = $("pre");
        console.log(pre.html().replace(/<br\/?>/gi, '\n'));
        return Promise.resolve();
    });


//
//     .catch(function(err){})
//     .then()
//
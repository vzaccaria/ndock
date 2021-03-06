(function(){
  var _, moment, fs, color, shelljs, name, description, author, year, usageString, optimist, argv, command, config, execCommand, dropTunnel, startNgrok, i$, len$, cc, startPort, n, j$, ref$, len1$, c;
  _ = require('underscore');
  _.str = require('underscore.string');
  moment = require('moment');
  fs = require('fs');
  color = require('ansi-color').set;
  shelljs = require('shelljs');
  _.mixin(_.str.exports());
  _.str.include('Underscore.string', 'string');
  name = "nw";
  description = "An ngrok wrapper to easily build distributed systems";
  author = "Vittorio Zaccaria";
  year = "2013";
  usageString = "\n" + color(name, 'bold') + ". " + description + "\n(c) " + author + ", " + year + "\n\nUsage: " + name + " [--option=V | -o V] start nstart list stop connect";
  optimist = require('optimist');
  argv = optimist.usage(usageString, {
    config: {
      alias: 'c',
      description: 'specify the configuration',
      'default': __dirname + "/../config/nw-config.json"
    },
    execute: {
      alias: 'e',
      description: 'execute the commands'
    },
    verbose: {
      alias: 'v',
      description: 'output the log of programs',
      'default': false
    },
    image: {
      alias: 'i',
      description: 'connect to this image tag'
    },
    help: {
      alias: 'h',
      description: 'this help'
    }
  }).argv;
  if (argv.help) {
    optimist.showHelp();
    return;
  }
  command = argv._;
  config = require(argv.config);
  execCommand = function(c, callback){
    console.log(c);
    if (argv.execute) {
      return shelljs.exec(c, callback);
    } else {
      return typeof callback === 'function' ? callback(0, 'not executed') : void 8;
    }
  };
  dropTunnel = function(dropNumber, nodeNumber, port){
    var v;
    v = ("  d" + dropNumber + ":                                    \n ") + ("   subdomain: \"d" + dropNumber + "-n" + nodeNumber + "-vz\"  \n ") + "   proto:                                             \n " + ("     https: " + port + "                                   \n ");
    return v;
  };
  startNgrok = function(config){
    var configurationFile, startPort, n, drops, i$, ref$, len$, drp;
    configurationFile = "inspect_addr: \"0.0.0.0:8888\"\ntunnels:\n  status:\n    subdomain: \"nstatus-n" + config.nodeNumber + "-vz\"\n    proto:\n      https: 8888";
    startPort = config.localportRangeBase;
    n = 0;
    drops = "";
    for (i$ = 0, len$ = (ref$ = config.dropCommands).length; i$ < len$; ++i$) {
      drp = ref$[i$];
      configurationFile = configurationFile + '\n' + dropTunnel(n, config.nodeNumber, startPort);
      drops = drops + ("d" + n + " ");
      startPort = startPort + 1;
      n = n + 1;
    }
    configurationFile.to('./ngrok-config');
    return execCommand("./ngrok -log=none -authtoken=" + config.ngrokAuthToken + " -config=./ngrok-config start status " + drops, function(code, output){
      return console.log(code + " - " + output);
    });
  };
  for (i$ = 0, len$ = command.length; i$ < len$; ++i$) {
    cc = command[i$];
    if (cc === 'nstart') {
      startNgrok(config);
    }
    if (cc === 'start') {
      startPort = config.localportRangeBase;
      n = 0;
      for (j$ = 0, len1$ = (ref$ = config.dropCommands).length; j$ < len1$; ++j$) {
        c = ref$[j$];
        execCommand("sudo docker run -d -p " + startPort + ":" + c.port + " " + config.dockerImageName + " " + c.name, fn$);
        startPort = startPort + 1;
        n = n + 1;
      }
    }
    if (cc === 'stop') {
      shelljs.exec("sudo docker ps -q=true", fn1$);
    }
    if (cc === 'list') {
      shelljs.exec("sudo docker ps -q=true", fn2$);
    }
    if (cc === 'connect') {
      console.log("sudo docker run -i -t \"" + argv.image + "\" /bin/bash -l", fn3$);
    }
  }
  function fn$(code, output){}
  function fn1$(code, output){
    var i$, len$, container, results$ = [];
    output = _.words(output);
    for (i$ = 0, len$ = output.length; i$ < len$; ++i$) {
      container = output[i$];
      results$.push(execCommand("sudo docker kill " + container, fn$));
    }
    return results$;
    function fn$(code, output){}
  }
  function fn2$(code, output){
    output = _.words(output);
    return console.log(output);
  }
  function fn3$(code, output){}
}).call(this);

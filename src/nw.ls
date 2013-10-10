#!/usr/bin/env lsc
# options are accessed as argv.option

_      = require('underscore')
_.str  = require('underscore.string');
moment = require 'moment'
fs     = require 'fs'
color  = require('ansi-color').set
shelljs= require('shelljs')


_.mixin(_.str.exports());
_.str.include('Underscore.string', 'string');

name        = "nw"
description = "An ngrok wrapper to easily build distributed systems"
author      = "Vittorio Zaccaria"
year        = "2013"

usage-string = """

#{color(name, \bold)}. #{description}
(c) #author, #year

Usage: #{name} [--option=V | -o V] start nstart list stop connect
"""

require! 'optimist'

argv     = optimist.usage(usage-string,
              config:
                alias: 'c', description: 'specify the configuration', default: "#{__dirname}/../config/nw-config.json"
              execute:
                alias: 'e', description: 'execute the commands'
              verbose:
                alias: 'v', description: 'output the log of programs', default: false
              image:
                alias: 'i', description: 'connect to this image tag'
              help:
                alias: 'h', description: 'this help'
                         ).argv

if(argv.help)
  optimist.showHelp()
  return

command = argv._

# if command.length == 0
#   optimist.showHelp()
#   return


config = require(argv.config)

exec-command = (c, callback) ->
  console.log c
  if argv.execute 
     shelljs.exec(c, callback)  
  else
     callback?(0, 'not executed')


drop-tunnel = (drop-number, node-number, port) ->
  v = "  d#{drop-number}:                                    \n " + 
      "   subdomain: \"d#{drop-number}-n#{node-number}-vz\"  \n " + 
      "   proto:                                             \n " + 
      "     https: #{port}                                   \n "  
  return v

start-ngrok = (config) -> 
  configuration-file = """
  inspect_addr: \"0.0.0.0:8888\"
  tunnels:
    status:
      subdomain: \"nstatus-n#{config.node-number}-vz\"
      proto:
        https: 8888
  """
  start-port = config.localport-range-base
  n = 0
  drops = "" 
  for drp in config.drop-commands
    configuration-file = configuration-file + '\n' + drop-tunnel(n, config.node-number, start-port)
    drops = drops + "d#{n} "
    start-port = start-port+1
    n = n + 1

  configuration-file.to('./ngrok-config')
  exec-command "./ngrok -log=none -authtoken=#{config.ngrokAuthToken} -config=./ngrok-config start status #drops", (code, output) ->
    console.log "#code - #output"

for cc in command

  if cc == 'nstart'
      start-ngrok(config)

  if cc == 'start'
      start-port = config.localport-range-base
      n = 0
      for c in config.drop-commands
          exec-command "sudo docker run -d -p #{start-port}:#{c.port} #{config.docker-image-name} #{c.name}", (code, output) ->
              # console.log "Done with output"	
          start-port = start-port+1
          n = n + 1

  if cc == 'stop'
      shelljs.exec "sudo docker ps -q=true", (code, output) ->
          output = _.words(output)
          for container in output
              exec-command "sudo docker kill #container", (code, output) ->
                  # console.log "Done killing #container"

  if cc == 'list'
      shelljs.exec "sudo docker ps -q=true", (code, output) ->
          output = _.words(output)
          console.log output

  if cc == 'connect'
      console.log "sudo docker run -i -t \"#{argv.image}\" /bin/bash -l", (code, output) ->
                

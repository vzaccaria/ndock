#!/usr/bin/env lsc 

{ wmake, hooks, x } = require 'wmake'

server-files = [ { name: "./src/nw.ls", type: \ls } ]

hooks.add-hook 'post-deploy', null, (path-system) ->
    x "echo '#!/usr/bin/env node' > ./bin/nw"
    x "cat ./bin/nw.js >> ./bin/nw"
    x "chmod +x ./bin/nw"

files = server-js:  server-files
                     
wmake({ deploy-dir: "./bin", local-server-dir: "." }, files)

const WorkerPlugin = require('worker-plugin')

const opencvregex = /opencv\.js$/
const excludeOpenCV = (rules) => {

    rules.forEach(rule => {
        if (rule.oneOf)
            excludeOpenCV(rule.oneOf)

        if (rule.test && rule.test.test && rule.test.test("opencv.js"))
        {
            if (rule.exclude===undefined)
                rule.exclude = opencvregex
            else if (Array.isArray(rule.exclude)) 
                rule.exclude.push(opencvregex)
            else
                rule.exclude = [rule.exclude, opencvregex]
        }
    })
}

module.exports = function override(config, env) {

    config.plugins.push(new WorkerPlugin)

    //exclude opencv from the loader. this slows down things a lot
    excludeOpenCV(config.module.rules)
    
    //ForkTsCheckerWebpackPlugin is slowing things down
    if (config.mode=='production')
        config.plugins = config.plugins.filter(i=>i.constructor.name !== "ForkTsCheckerWebpackPlugin") 

    return config
}
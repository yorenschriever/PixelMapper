const WorkerPlugin = require('worker-plugin')
const webpack = require('webpack')

module.exports = function override(config, env) {

    config.plugins.push(new WorkerPlugin)

    const opencvregex = /opencv\.js$/

    config.module.rules.filter(i=>i.test && i.test.test("opencv.js")).forEach(loader => loader.exclude = opencvregex)

    config.module.rules[2].oneOf.filter(i=>i.test && i.test.test && i.test.test("opencv.js")).forEach(loader => {
        if (loader.exclude===undefined)
            loader.exclude = opencvregex
        else if (Array.isArray(loader.exclude)) 
            loader.exclude.push(opencvregex)
        else
            loader.exclude = [loader.exclude, opencvregex]
    })

    //config.mode='development'
    //config.optimization.minimize=false
    if (config.mode='production')
        config.plugins = config.plugins.filter(i=>i.constructor.name !== "ForkTsCheckerWebpackPlugin") 


    //console.log(config)

    //throw Error('')

    return config
}
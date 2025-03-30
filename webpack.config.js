import process from 'node:process';
import path from 'node:path';
import isDocker from 'is-docker';

/**
 * Get the Webpack configuration for the public/lib.js file.
 * 1. Docker has got cache and the output file pre-baked.
 * 2. Non-Docker environments use the global DATA_ROOT variable to determine the cache and output directories.
 * @param {boolean} forceDist Whether to force the use the /dist folder.
 * @returns {import('webpack').Configuration}
 * @throws {Error} If the DATA_ROOT variable is not set.
 * */
export default function getPublicLibConfig(forceDist = false) {
    function getCacheDirectory() {
        if (forceDist || isDocker()) {
            return path.resolve(process.cwd(), 'dist/webpack');
        }

        if (typeof globalThis.DATA_ROOT === 'string') {
            return path.resolve(globalThis.DATA_ROOT, '_webpack', 'cache');
        }

        throw new Error('DATA_ROOT variable is not set.');
    }

    function getOutputDirectory() {
        if (forceDist || isDocker()) {
            return path.resolve(process.cwd(), 'dist');
        }

        if (typeof globalThis.DATA_ROOT === 'string') {
            return path.resolve(globalThis.DATA_ROOT, '_webpack', 'output');
        }

        throw new Error('DATA_ROOT variable is not set.');
    }

    const cacheDirectory = getCacheDirectory();
    const outputDirectory = getOutputDirectory();

    return {
        mode: 'production',
        entry: './public/lib.js',
        cache: {
            type: 'filesystem',
            cacheDirectory: cacheDirectory,
            store: 'pack',
            compression: 'gzip',
        },
        devtool: false,
        watch: false,
        module: {},
        stats: {
            preset: 'minimal',
            assets: false,
            modules: false,
            colors: true,
            timings: true,
        },
        experiments: {
            outputModule: true,
        },
        performance: {
            hints: false,
        },
        output: {
            path: outputDirectory,
            filename: 'lib.js',
            libraryTarget: 'module',
        },
    };
}
const path = require('path');

const resolve = dir => {
    return path.join(__dirname, dir);
};
const env = process.env.NODE_ENV;
console.info('env: ------>', env, 'api:------>', process.env.VUE_APP_URL, 'VUE_APP_BASE_API:-->', process.env.VUE_APP_BASE_API);

module.exports = {
    // mode: 'production',
    publicPath: process.env.NODE_ENV === 'production' ? './' : './',    // 启动页地址
    // publicPath: './',    // 启动页地址
    outputDir: "dist", // 打包的目录
    indexPath: 'index.html', // 生成html文件名
    assetsDir: 'static', // 静态资源文件目录
    runtimeCompiler: true,
    lintOnSave: false, // 在保存时校验格式
    productionSourceMap: false, // 生产环境是否生成 SourceMap
    /*
    chainWebpack: config => {
        // 修复热更新
        config.resolve.symlinks(true);
    },
    */
    devServer: {
        /*1.测试成功 配合配置文件使用 VUE_APP_URL = 'https://localhost:44367/api'*/
        proxy: {
            [process.env.VUE_APP_BASE_API]: {// api 表示拦截以 /api开头的请求路径
                target: process.env.VUE_APP_URL,//跨域的域名（不需要写路径）
                changeOrigin: true,             //是否开启跨域
                ws: true,                       //是否代理websocked
                pathRewrite: {                  //重写路径
                    ['^' + process.env.VUE_APP_BASE_API]: ''//把 /api 变为空字符
                }
            },
        },
        /*2.测试成功 配置写死 target 不带/api，注意没有pathRewrite属性,调用接口时这么写 api/User/gettest*/
        /* port: 8088,
        proxy: {
            '/api': {// api 表示拦截以 /api开头的请求路径
                target : 'https://localhost:44367',//跨域的域名（不需要写路径）process.env.VUE_APP_URL
                changeOrigin : true,             //是否开启跨域
                ws: true,                     //是否代理websocked
            },
        },  
        /*3.测试成功  配置写死 target 带/api，注意要加pathRewrite属性,调用接口时这么写 api/User/gettest*/
        /*
        proxy: {
            '/api': {// api 表示拦截以 /api开头的请求路径
                target : 'https://localhost:44367/api',//跨域的域名（不需要写路径）process.env.VUE_APP_URL
                changeOrigin : true,             //是否开启跨域
                ws: true,                        //是否代理websocked
                pathRewrite : {                  //重写路径
                    '^/api' : ''                 //把 /api 变为空字符
                }
            },
        }, */
    }
}

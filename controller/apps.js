var apps = require('../models/apps');
var baseRes = require('./baseResponse');
var jade = require('jade');
var Apps = {};
var path = require('path');

Apps.apps_preview = function(req, res){
    apps.query({_id: req.params.id}, function(data){
        try{
            var appData = data[0];
            var html = jade.renderFile(path.join(process.env.staticPath, '/views/app-preview.jade'), appData);
            var body = appData.jade ? jade.render(appData.jade) : '';

            html = html.replace('<style>', '<style>' + (appData.css || ''))
                        .replace('<body>', '<body>' + body)
                        .replace('<script>', '<script>' + (appData.js || ''));
        }catch(e){
            var html = 'error: \n' + e.message;
        }
        res.end(html, 'utf-8');
    });
};

Apps.get = function(req, res){
    apps.query(req.query, function(data){
        res.end(baseRes({app: data[0]}));
    });
};

Apps.add = function(req, res){
    apps.query({name: req.body.name},function(list){
        if(list.length){
            res.end(baseRes({errorMsg: ['应用已经存在']}));
        }else{
            req.body.user = req.session.user.login;
            req.body.createDate = new Date();
            
            apps.add(req.body, function(data){
                res.end(baseRes({app: data[0]}));
            });
        }
    });
};

Apps.save = function(req, res){
    apps.update(req.body, function(){
        res.end(baseRes());
    });
};

Apps.del = function(req, res){
    apps.del(req.body, function(){
        res.end(baseRes());
    });
};

Apps.get_apps = function(req, res){
    apps.query({user: req.session.user.login}, function(list){
        res.end(baseRes({apps: list}));
    },{jade: 0, css: 0, js: 0});
};

Apps.get_published_apps = function(req, res){
    //拼接模糊查询
    var param = {};
    var opera = {};
    opera.sort = {};
    req.query.name && (param.name = new RegExp(req.query.name));
    req.query.sort && (opera.sort[req.query.sort] = -1);
    req.query.skip && (opera.skip = req.query.skip * req.query.limit);
    req.query.limit && (opera.limit = +req.query.limit || 8);

    apps.query(param, function(list){
        res.end(baseRes({apps: list}));
    }, {jade: 0, css: 0, js: 0}, opera);
};

module.exports = Apps;
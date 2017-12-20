
'use strict';

const Hapi = require('hapi');
const Blipp = require('blipp');
const Vision = require('vision');
const Inert = require('inert');
const Path = require('path');
const Handlebars = require('handlebars');
const Sequelize = require('sequelize');

const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: Path.join(__dirname, 'public')
            }
        }
    }
});

server.connection({
    port: 3000
});

server.register([Blipp, Inert, Vision], () => {});

var sequelize = new Sequelize('db', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',

    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },

    // SQLite only
    storage: 'db.sqlite'
});

var Poll = sequelize.define('poll', {
    question: {
        type: Sequelize.STRING
    },
    option: {
        type: Sequelize.JSON
    },
    
    
});



server.views({
    engines: {
        html: Handlebars
    },
    path: 'views',
    layoutPath: 'views/layout',
    layout: 'layout',
    helpersPath: 'views/helpers',
   
    //partialsPath: 'views/partials'
});


server.route({
    method: 'GET',
    path: '/',
    handler: {
        view: {
            template: 'newpoll'
        }
    }
});

server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: './',
            listing: false,
            index: false
        }
    }
});

server.route({
    method: 'GET',
    path: '/createDB',
    handler: function (request, reply) {
        // force: true will drop the table if it already exists
        Poll.sync({
            force: true
        })
        reply("Database Created")
    }
});

server.route({


    method: 'POST',
    path: '/form',
    handler: function (request, reply) {
//        console.log(request.payload.firstname);
//        console.log(request.payload.option1);
//        console.log(request.payload.option2);
//        var firstname = encodeURIComponent(request.payload.firstname);
       
        
        var curPayload = request.payload;
        var question = curPayload.question;
        var jsonOptions = JSON.stringify(curPayload);
        jsonOptions = JSON.parse(jsonOptions);
        delete jsonOptions["question"];
        console.log(question);
        console.log(jsonOptions);
        
        var createPoll = {"question":question, "option":jsonOptions};
        //createPoll = JSON.parse(createPoll);
        
         Poll.create(createPoll).then(function (currentPoll) {
            Poll.sync();
            console.log("...syncing");
            console.log(currentPoll);
            return (currentPoll);
        }).then(function (currentPoll) {

//            reply.view('formresponse', {
//                formresponse: currentMonster
//            });
        });
        
        
        
//        reply.view('formresponse', {
//            firstname: firstname,
//            option1: option1,
//            option2: option2,
//        });
    }

});




server.route({
    method: 'GET',
    path: '/mypolls',
    handler: {
        view: {
            template: 'main'
        }
    }
});

server.route({
    method: 'GET',
    path: '/displayAll',
    handler: function (request, reply) {
        Poll.findAll().then(function (users) {
            // projects will be an array of all User instances
            //console.log(users[0].question);
            var allUsers = JSON.stringify(users);
            console.log(allUsers);
            reply.view('dbresponse', {
                dbresponse: allUsers
            });
        });
    }
});

server.route({
    method: 'GET',
    path: '/update/{id}',
    handler: function (request, reply) {
        var id = encodeURIComponent(request.params.id);


        reply.view('updatepoll', {
            routeId: id
        });
    }

});

server.route({
    method: 'GET',
    path: '/view/{id}',
    handler: function (request, reply) {
        var id = encodeURIComponent(request.params.id);
        
        Poll.findAll({
          where: {
            id: id
          }
        }).then(function(user){
            console.log(user);
        });


//        reply.view('samplepoll', {
//            routeId: id
//        });
    }

});

server.route({
    method: 'GET',
    path: '/delete/{id}',
    handler: function (request, reply) {


        Monster.destroy({
            where: {
                id: encodeURIComponent(request.params.id)
            }
        });

        reply().redirect("/displayAll");
    }
});


server.route({
    method: 'POST',
    path: '/update/{id}',
    handler: function (request, reply) {
        var cm = "";
        var id = encodeURIComponent(request.params.id);
        var formresponse = JSON.stringify(request.payload);
        var parsing = JSON.parse(formresponse);
        //console.log(parsing);

        Poll.update(parsing, {
            where: {
                id: id
            }
        });

        reply().redirect("/displayAll");

    }

});

server.route({
    method: 'GET',
    path: '/dash',
    handler: {
        view: {
            template: 'dash'
        }
    }
});

server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);

});



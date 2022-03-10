const { request } = require("express");
const {MongoClient, ObjectId, ConnectionCheckedInEvent, Collection} = require("mongodb");
const { fileURLToPath } = require("url");
const expressSession = require('express-session');
const { Console } = require("console");

const url = 'mongodb+srv://PRO150Chess:PRO150Chess@cluster0.fbh1a.mongodb.net/test?authSource=admin&replicaSet=atlas-4h3p52-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true';
const client = new MongoClient(url);

const dbName = 'UserList';
const db = client.db(dbName);
const collection = db.collection('Users');

const jwt = require('jsonwebtoken');

// Creates the create user page
exports.create = (req, res) => {
    res.render('create', {
        title: ''
    });
};

// Stores the data from the create user page
exports.createUser = async (req, res) => {
    await client.connect();
    let user = {
        username: req.body.username,
        email: req.body.email,
        age: req.body.age,
        password: req.body.password,
    };
    const insertResult = await collection.insertOne(user);
    client.close();
    console.log(req.body.username + ' added');
    res.redirect('/login'); 
}

//index reference
exports.index = async (req, res) => {
    await client.connect();
    const filteredDocs = await collection.findOne({_id: ObjectId(req.params.id)});
    client.close();

    res.render('index', {
        title: 'Account Information',
        users: filteredDocs,
    });
};

//Loads chess play page
exports.play = async (req, res) => {
    await client.connect();
    const filteredDocs = await collection.findOne({_id: ObjectId(req.params.id)});
    client.close();

    res.render('playchess', {
        title: 'Play Chess',
        users: filteredDocs,
    })
}

//Loads the login page
exports.login = (req, res) => {
    res.render('login', {
        title: ''
    });
};

//Gets data from login page and checks if it's in the database
    //Then, it logs the user in if it is
exports.loginUser = async (req,res) => {
    await client.connect();
    const filteredDocs = await collection.findOne({username: req.body.username})
    client.close();

    if (req.body.password == filteredDocs.password){
        req.session.user = { 
            isAuthenticated: true,
            username: req.body.username
        }
        
        res.redirect(`/chess/${filteredDocs._id}`);
    }else {
        res.redirect('/login');
    }
}

exports.logout = (req,res) => {
    req.session.destroy(err => {
        if(err){
            console.log(err);
        }else {
            res.redirect('/login');
        }
    });
}

exports.edit = async  (req, res) => {
    await client.connect();
    const filterDocs = await collection.find(ObjectId(req.params.id)).toArray()
    client.close();
    res.render('edit', {
        title: 'Edit User',
        users: filterDocs[0]
    });
};

exports.editPerson = async (req,res) => {
    await client.connect();
    if(req.body.password == ""){
        const updateResult = await collection.updateOne(
            { _id: ObjectId(req.params.id) },
            { $set: {
                username: req.body.username,
                email: req.body.email,
                age: req.body.age,
                password: req.body.password,
            }}
        )
    }
    client.close();
    res.redirect(`/index/${req.params.id}`);
};

// Delete method
exports.delete = async (req, res) => {
    await client.connect();
    const deleteResult = await collection.deleteOne({_id: ObjectId(req.params.id)});
    client.close();

    res.redirect(`/login`);

};

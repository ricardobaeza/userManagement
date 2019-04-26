const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs')
const PORT = process.env.PORT || 2319;
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017"

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use((express.urlencoded({extended: false})));
app.use(express.static('public'));

app.get('/', (req, res)=> {
    res.render('index')
});



app.post('/addUser', (req, res)=> {
    let filePath = path.join(__dirname, 'data', 'users.json');
    let userListingPage = path.join(__dirname, 'views', 'userListing.pug')
    let data = fs.readFileSync(filePath);
    let jsonUser = JSON.parse(data)
    jsonUser.users.push({
        userId: jsonUser.users.length, 
    })

    fs.writeFile(filePath, JSON.stringify(jsonUser), (err)=> {
        if (err) console.log(err);
    });

    

    MongoClient.connect(url, {useNewUrlParser: true }, (err, db)=> {
        if (err) throw err;
        let dbo = db.db('userManager');
        let newUser = {
            userId: jsonUser.users.length,
            name: req.body.name, 
            email: req.body.email, 
            age: req.body.age
        };
        dbo.collection('users').insertOne(newUser, (err, res)=> {
            if (err) throw err;
            console.log('succesfully added new user');
            db.close();
        })
        res.redirect("/adduser");
    })

    
});

app.get('/adduser', (req, res)=> {
    console.log('get all users');
    let userListingPage = path.join(__dirname, 'views', 'userListing.pug')
    const resultArray = []

    MongoClient.connect(url, {useNewUrlParser: true}, (err, db)=> {
        let dbo = db.db("userManager")
        let mongoUsers = dbo.collection("users").find({});
        mongoUsers.forEach((doc, err) => {
            if (err) throw err;
            resultArray.push(doc);
        }, ()=> {
            db.close();
            console.log(resultArray);
            res.render(userListingPage, { userArray: resultArray});    
        });
    })
})

app.get(`/deleteUser/:index`, (req, res)=> {
    let filePath = path.join(__dirname, 'data', 'users.json');
    let deletePage = path.join(__dirname, 'views', 'deletePage.pug')
    let data = fs.readFileSync(filePath);
    let jsonUser = JSON.parse(data);
    console.log(Number(req.params.index) + 1);
    jsonUser.users.splice(req.params.index, 1);
    fs.writeFile(filePath, JSON.stringify(jsonUser), (err)=> {
        if (err) console.log(err);
    })
    MongoClient.connect(url, {useNewUrlParser: true}, (err, db)=> {
        if (err) throw err;
        let dbo = db.db('userManager');
        let myQuery = {userId: Number(req.params.index + 1)};
        dbo.collection("users").deleteOne(myQuery, (err, obj)=> {
            if (err) throw err;
            db.close();
        });
        res.render(deletePage)

    })
})

app.get('/editUser/:index', (req, res)=> {
    let editPage = path.join(__dirname, 'views', 'editUser.pug')
    MongoClient.connect(url, {useNewUrlParser: true}, (err, db)=> {
        if (err) throw err;
        let dbo = db.db('userManager');
        let query = {userId: Number(req.params.index) + 1 };
        let userSearch = dbo.collection('users').find(query);
        let user = {}
        userSearch.forEach((doc, err)=> {
            if (err) throw err;
            user = doc;
        }, ()=> { 
            res.render(editPage, {jsonUser: user, index: req.params.index});
            console.log(user)
        })
    })
})

app.post('/editUser/:index', (req, res)=> {
    let filePath = path.join(__dirname, 'data', 'users.json');
    let editPage = path.join(__dirname, 'views', 'editUser.pug')    
    let data = fs.readFileSync(filePath);
    let jsonUser = JSON.parse(data);
    
    MongoClient.connect(url, {useNewUrlParser: true}, (err, db)=> {
        if (err) throw err;
        let dbo = db.db('userManager');
        let myQuery = {userId: Number(req.params.index + 1)}
        let newValues = {$set: {name: req.body.name, email: req.body.email, age: req.body.age}};
        dbo.collection("users").updateOne(myQuery, newValues, (err, res)=> {
            if (err) throw err;
            db.close();
        })
    })
    fs.writeFile(filePath, JSON.stringify(jsonUser), (err)=> {
        if (err) console.log(err);
    });
    res.redirect('/addUser');
})
app.listen(PORT, ()=> {
    console.log('app is running on port 2319')
});


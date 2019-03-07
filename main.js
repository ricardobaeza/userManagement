const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs')

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use((express.urlencoded({extended: false})));
app.use(express.static('public'));

app.get('/', (req, res)=> {
    res.render('index');
});


app.post('/addUser', (req, res)=> {
    let filePath = path.join(__dirname, 'data', 'users.json');
    let userListingPage = path.join(__dirname, 'views', 'userListing.pug')
    let data = fs.readFileSync(filePath);
    let jsonUser = JSON.parse(data)
    jsonUser.users.push({userId: jsonUser.users.length, name: req.body.name, email: req.body.email, age: req.body.age})
            fs.writeFile(filePath, JSON.stringify(jsonUser), (err)=> {
                if (err) console.log(err);
            }
            )

    res.render(userListingPage, { jsonUser: jsonUser});    
});

app.get('/adduser', (req, res)=> {
    let userListingPage = path.join(__dirname, 'views', 'userListing.pug')
    let filePath = path.join(__dirname, 'data', 'users.json');
    let data = fs.readFileSync(filePath);
    let jsonUser = JSON.parse(data)
    res.render(userListingPage, {jsonUser: jsonUser})
})

app.get('/deleteUser', (req, res)=> {
    res.send('this is the delete page')
})

app.get('/editUser', (req, res)=> {
    res.send('this is the delete page')
})
app.listen('2319', ()=> {
    console.log('app is running on port 2319')
});

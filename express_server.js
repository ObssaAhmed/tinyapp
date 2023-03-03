//express_server.js
const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const users = {
    userRandomID: {
        id: "userRandomID",
        email: "user@example.com",
        password: "purple-monkey-dinosaur",
    },
    user2RandomID: {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "dishwasher-funk",
    },
};


const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({extended: true}));

app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
    const templateVars = {
        urls: urlDatabase,
        username: req.cookies["username"]
    };
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    const templateVars = {
        username: req.cookies["username"]
    };
    res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
    const templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL,
        username: req.cookies["username"]
    };
    res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    const newLongURL = req.body.longURL;
    urlDatabase[shortURL].longURL = newLongURL;
    res.redirect("/urls");
});



app.post('/login', (req, res) => {
    const {email, password} = req.body;
    const user = getUserByEmail(email);

    if (!user) {
        res.status(403).send('Email or password is incorrect');
        return;
    }

    if (!bcrypt.compareSync(password, user.password)) {
        res.status(403).send('Email or password is incorrect');
        return;
    }

    res.cookie('user_id', user.id);
    res.redirect('/urls');
});



app.post('/logout', (request, response) => {
    response.clearCookie('user_id');
    response.redirect('/login');
});


app.get("/u/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    const longURL = urlDatabase[shortURL];
    if (!longURL) {
        return res.status(404).send("Short URL does not exist");
    }
    res.redirect(longURL);
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/register.html');
});


function generateRandomString() {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

app.post('/register', (req, res) => {
    const {email, password} = req.body;

    // Check if email or password is empty
    if (!email || !password) {
        return res.status(400).send('Email and password are required!');
    }

    // Check if email already exists
    if (getUserByEmail(email)) {
        return res.status(400).send('Email already exists!');
    }

    // Create new user
    const user = {
        id: generateRandomString(),
        email,
        password: bcrypt.hashSync(password, 10)
    };

    // Add user to users object
    users[user.id] = user;

    // Set user_id cookie
    res.cookie('user_id', user.id);

    // Redirect to /urls page
    res.redirect('/urls');
});


function getUserByEmail(email) {
    for (const userId in users) {
        const user = users[userId];
        if (user.email === email) {
            return user;
        }
    }
    return null;
}


const register = (req, res) => {
    const {email, password} = req.body;

    // Error handling: empty email or password
    if (!email || !password) {
        res.status(400).send("Email or password cannot be empty.");
        return;
    }

    // Error handling: email already exists
    const user = getUserByEmail(email);
    if (user) {
        res.status(400).send("Email already exists.");
        return;
    }

    // Generate a new user ID and add the user to the users object
    const id = generateRandomString();
    users[id] = {id, email, password};

    // Set a user_id cookie containing the user's ID
    res.cookie("user_id", id);

    // Redirect to the /urls page
    res.redirect("/urls");
};




// routes/userRoutes.js

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('login');
});

module.exports = router;

app.get("/login", (req, res) => {
    res.render("login");
});


app.post("/logout", (req, res) => {
    res.clearCookie("username");
    res.redirect("/urls");
});

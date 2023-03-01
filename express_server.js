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
    const userId = req.cookies.user_id;
    const user = users[userId];
    const templateVars = {urls: urlDatabase, user};
    res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
    const userId = req.cookies.user_id;
    const user = users[userId];
    const templateVars = {user};
    res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
    const userId = req.cookies.user_id;
    const user = users[userId];
    const shortURL = req.params.shortURL;
    const longURL = urlDatabase[shortURL].longURL;
    const templateVars = {shortURL, longURL, user};
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

app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = getUserByEmail(email, users);

    if (!user) {
        res.status(403).send("Email not found.");
    } else if (!bcrypt.compareSync(password, user.password)) {
        res.status(403).send("Incorrect password.");
    } else {
        res.cookie('user_id', user.id);
        res.redirect('/urls');
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie('user_id');
    res.redirect('/login');
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

app.post("/register", (req, res) => {
    const {email, password} = req.body;
    const id = generateRandomString();
    const newUser = {id, email, password};
    users[id] = newUser;
    res.cookie("user_id", id);
    res.redirect("/urls");
});

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

const getUserByEmail = (email) => {
    for (const userId in users) {
        if (users[userId].email === email) {
            return users[userId];
        }
    }
    return null;
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


// Define a function for looking up a user by their email
const getUserByEmail = function(email, users) {
    for (const userId in users) {
        const user = users[userId];
        if (user.email === email) {
            return user;
        }
    }
    return null;
};

// Define any other helper functions that you need here

module.exports = {getUserByEmail};

const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return users[username] !== undefined;
}

const authenticatedUser = (username,password)=>{
  if(users[username] && users[username].password === password) return true;
  return false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  console.log("Login attempt with username:", username, " and password:", password);
  console.log("Users array:", users);
  //console.log("Return :", users[username]);

  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.password !== password) return res.status(401).json({ message: "Invalid password" });

  //Check if user is already logged in
  if( req.session.authorization )
    return res.status( 208 ).json( { message: "User already logged in"} );

  //Create a new access token for the user
    let accessToken = jwt.sign({data: username}, 'access', { expiresIn: 60*60 });
    req.session.authorization = { accessToken, username };

  return res.status(200).json( { message: "User successfully logged in" });
  }
);

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const authorization = req.session.authorization;
  // Check if acess token is provided
  if (!authorization) return res.status(401).json({ message: "User not logged in" });
  
  // Check if token is valid
  jwt.verify( authorization.accessToken, 'access', ( err, user ) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
  } );

  const isbn = req.params.isbn;
  const review = req.body.review;
  if (!review) return res.status(400).json({ message: "Review not provided" });
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });

  if (!book.reviews) book.reviews = {};

  const username = authorization.username;

  book.reviews[ username ] = review; // Add or update the review for the book
  books[isbn] = book; // Update the book in the database
  
  return res.status(200).json({ message: `Review added for book ${isbn} by user ${username}` });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const authorization = req.session.authorization;
  // Check if acess token is provided
  if (!authorization) return res.status(401).json({ message: "User not logged in" });
  
  // Check if token is valid
  jwt.verify( authorization.accessToken, 'access', ( err, user ) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
  } );

  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });

  const username = authorization.username;
  console.log("Deleting review for book:", isbn, " by user:", username);
  // test
  console.log("Book reviews before deletion:", book.reviews);
  console.log("User reviews before deletion:", book.reviews[username]);
  


  if (book.reviews && book.reviews[username]) {
    delete book.reviews[username]; // Remove the review for the book
    books[isbn] = book; // Update the book in the database
    return res.status(200).json({ message: `Review deleted for book ${isbn} by user ${username}` });
  } else {
    return res.status(404).json({ message: "Review not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password ) 
    return res.status(400).json({ message: "Username and password are required" });

  // check if username and password length is diferent than 6
  if (username.length < 6 || password.length < 6) 
    return res.status(400).json({ message: "Username and password must be at least 6 characters long" });
  
  // Check if username already exists
  const userExists = users.some(user => user.username === username);
  if (userExists) return res.status(400).json({ message: "Username already exists" });
  
  // Add the new user to the users array
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered" });
});


// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send( JSON.stringify( books ) );
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (!books[isbn]) return res.status(404).json({message: "Book not found"});
  return res.send( JSON.stringify( books[isbn] ) );
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase().includes(author.toLowerCase()));
  return res.send( JSON.stringify( booksByAuthor ) );
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
  return res.send( JSON.stringify( booksByTitle ) );
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (!books[isbn]) return res.status(404).json({message: "Book not found"});
  const reviews = books[isbn].reviews;
  return res.send( JSON.stringify( reviews ) );
});

module.exports.general = public_users;

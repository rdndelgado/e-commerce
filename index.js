// Importing necessary modules and packages
const express = require('express');  // Importing Express framework
const { v4: uuidv4 } = require('uuid');  // Importing the UUID library

// Creating an Express application
const app = express();

// Setting the port for the server to listen on
const port = 3000;

// Middleware to parse JSON data
app.use(express.json());

// Creating empty arrays to store users, products, and orders
let users = [];
let products = [];
let orders = [];

// Variable to store the currently logged-in user
let loggedUser = null;

// Route to handle user registration
app.post('/users', (req, res) => {
  // Extracting email and password from the request body
  const { email, password } = req.body;
  
  // Checking if a user with the same email already exists
  const existingUser = users.find(user => user.email === email);

  if (existingUser) {
    // Returning a response if a user with the same email already exists
    return res.send('A user with the same email address is already registered.');
  }

  // Creating a new user object with a unique ID generated by UUID
  const newUser = {
    id: uuidv4(),
    email,
    password,
    isAdmin: req.body.isAdmin || false,
    cart: [],
    orders: []
  };

  // Adding the new user to the users array
  users.push(newUser);
  
  // Sending a success response
  res.send('Registered successfully.');
});

// Route to get all users (accessible to admin users only)
app.get('/users', (req, res) => {
  if (loggedUser && loggedUser.isAdmin) {
    // Sending the list of users as the response
    res.send(users);
  } else {
    // Returning an error message if the user is unauthorized
    res.send('Unauthorized. Action forbidden');
  }
});

// Route to set a user as admin (accessible to admin users only)
app.put('/users/:id/setadmin', (req, res) => {
  if (loggedUser && loggedUser.isAdmin) {
    const userId = req.params.id;
    
    // Finding the user to be set as admin
    const user = users.find(user => user.id === userId);

    if (user) {
      // Setting the isAdmin property of the user to true
      user.isAdmin = true;
      res.send('User set as admin successfully');
    } else {
      res.send('User not found');
    }
  } else {
    res.send('Unauthorized. Action forbidden');
  }
});

// Route to handle user login
app.post('/users/login', (req, res) => {
  // Extracting email and password from the request body
  const { email, password } = req.body;

  // Finding the user with matching email and password
  const user = users.find(user => user.email === email && user.password === password);

  if (user) {
    // Setting the loggedUser variable to the authenticated user
    loggedUser = user;
    res.send('Logged in successfully');
  } else {
    // Clearing the loggedUser variable and returning an error message if login fails
    loggedUser = null;
    res.send('Login failed. Incorrect email or password.');
  }
});

// Route to create a new product (accessible to admin users only)
app.post('/products', (req, res) => {
  if (loggedUser && loggedUser.isAdmin) {
    // Extracting product details from the request body
    const { name, description, price } = req.body;
    
    // Creating a new product object with a unique ID generated by UUID
    const newProduct = {
      id: uuidv4(),
      name,
      description,
      price,
      isActive: req.body.isActive || true
    };

    // Adding the new product to the products array
    products.push(newProduct);
    
    // Sending a success response
    res.send('Product created successfully.');
  } else {
    // Returning an error message if the user is unauthorized
    res.send('Unauthorized. Access denied.');
  }
});

// Route to get all products
app.get('/products', (req, res) => {
  // Sending the list of products as the response
  res.send(products);
});

// Route to get only active products
app.get('/products/active', (req, res) => {
  // Filtering the products array to get only active products
  const activeProducts = products.filter(product => product.isActive);
  
  // Sending the list of active products as the response
  res.send(activeProducts);
});

// Route to get a specific product by ID
app.get('/products/:id', (req, res) => {
  const productId = req.params.id;
  
  // Finding the product with the specified ID
  const product = products.find(product => product.id === productId);

  if (product) {
    // Sending the product as the response if found
    res.send(product);
  } else {
    // Returning an error message if the product is not found
    res.send('Product not found.');
  }
});

// Route to update a product by ID (accessible to admin users only)
app.put('/products/:id', (req, res) => {
  if (loggedUser && loggedUser.isAdmin) {
    const productId = req.params.id;
    const { name, description, price, isActive } = req.body;
    
    // Finding the product to be updated
    const product = products.find(product => product.id === productId);

    if (product) {
      // Updating the product properties if provided in the request body
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.isActive = isActive !== undefined ? isActive : product.isActive;

      // Sending a success response
      res.send('Product updated successfully.');
    } else {
      res.send('Product not found.');
    }
  } else {
    res.send('Unauthorized. Access denied.');
  }
});

// Route to archive a product by ID (accessible to admin users only)
app.put('/products/:id/archive', (req, res) => {
  if (loggedUser && loggedUser.isAdmin) {
    const productId = req.params.id;
    
    // Finding the product to be archived
    const product = products.find(product => product.id === productId);

    if (product) {
      // Setting the isActive property of the product to false
      product.isActive = false;
      
      // Sending a success response
      res.send('Product archived successfully.');
    } else {
      res.send('Product not found.');
    }
  } else {
    res.send('Unauthorized. Access denied.');
  }
});

// Route to create a new order
app.post('/orders', (req, res) => {
  if (loggedUser) {
    const { userId, products, quantity, purchasedOn } = req.body;
    
    // Creating a new order object with a unique ID generated by UUID
    const newOrder = {
      id: uuidv4(),
      userId,
      products,
      quantity,
      purchasedOn: purchasedOn || new Date()
    };

    // Adding the new order to the orders array
    orders.push(newOrder);
    
    // Adding the new order ID to the user's orders array
    loggedUser.orders.push(newOrder.id);
    
    // Sending a success response
    res.send('Your order has been placed successfully.');
  } else {
    // Returning an error message if the user is unauthorized
    res.send('Unauthorized. Access denied.');
  }
});

// Route to get all orders (accessible to admin users only)
app.get('/orders', (req, res) => {
  if (loggedUser && loggedUser.isAdmin) {
    // Sending the list of orders as the response
    res.send(orders);
  } else {
    // Returning an error message if the user is unauthorized
    res.send('Unauthorized. Access denied.');
  }
});

// Route to add a product to the user's cart
app.post('/cart/add', (req, res) => {
  if (loggedUser) {
    const { productId, quantity } = req.body;
    
    // Finding the product to be added to the cart
    const product = products.find(product => product.id === productId);

    if (product) {
      // Checking if the product is already in the user's cart
      const cartItem = loggedUser.cart.find(item => item.productId === productId);

      if (cartItem) {
        // Increasing the quantity if the product is already in the cart
        cartItem.quantity += quantity;
      } else {
        // Adding a new cart item if the product is not in the cart
        loggedUser.cart.push({
          productId,
          quantity
        });
      }

      // Sending a success response
      res.send('Product added to cart.');
    } else {
      res.send('Product not found.');
    }
  } else {
    res.send('Unauthorized. Access denied.');
  }
});

// Route to get the user's cart
app.get('/cart', (req, res) => {
  if (loggedUser) {
    // Sending the user's cart as the response
    res.send(loggedUser.cart);
  } else {
    // Returning an error message if the user is unauthorized
    res.send('Unauthorized. Access denied.');
  }
});

// Route to update the quantity of a product in the user's cart
app.put('/cart/quantity/:productId', (req, res) => {
  if (loggedUser) {
    const productId = req.params.productId;
    const { quantity } = req.body;

    // Finding the cart item for the specified product
    const cartItem = loggedUser.cart.find(item => item.productId === productId);

    if (cartItem) {
      // Updating the quantity of the cart item
      cartItem.quantity = quantity;
      
      // Sending a success response
      res.send('Cart item quantity updated.');
    } else {
      res.send('Cart item not found.');
    }
  } else {
    res.send('Unauthorized. Access denied.');
  }
});

// Route to remove a product from the user's cart
app.delete('/cart/remove/:productId', (req, res) => {
  if (loggedUser) {
    const productId = req.params.productId;
    
    // Finding the cart item index for the specified product
    const cartItemIndex = loggedUser.cart.findIndex(item => item.productId === productId);

    if (cartItemIndex !== -1) {
      // Removing the cart item from the user's cart
      loggedUser.cart.splice(cartItemIndex, 1);
      
      // Sending a success response
      res.send('Product removed from cart');
    } else {
      res.send('Cart item not found.');
    }
  } else {
    res.send('Unauthorized. Access denied.');
  }
});

// Route to get the subtotal of the user's cart
app.get('/cart/subtotal', (req, res) => {
  if (loggedUser) {
    let subtotal = 0;
    
    // Calculating the subtotal by iterating over the user's cart
    for (const item of loggedUser.cart) {
      const product = products.find(product => product.id === item.productId);
      
      if (product) {
        subtotal += product.price * item.quantity;
      }
    }
    
    // Sending the subtotal as the response
    res.send(`Subtotal: $${subtotal}`);
  } else {
    // Returning an error message if the user is unauthorized
    res.send('Unauthorized. Access denied.');
  }
});
//Route to get the total of the user's cart items
app.get('/cart/total', (req, res) => {
  if (loggedUser) {
    let total = 0;
    // Calculating the total by iterating over the user's cart items
    for (const cartItem of loggedUser.cart) {
      const product = products.find(product => product.id === cartItem.productId);

      if (product) {
        total += product.price * cartItem.quantity;
      }
    }
    // Total amount for the cart items to be purchased
    res.send(`Total: $${total.toFixed(2)}`);
  } else {
    // Returning an error message if the user is unauthorized
    res.send('Unauthorized. Access Denied.');
  }
});

// Starting the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

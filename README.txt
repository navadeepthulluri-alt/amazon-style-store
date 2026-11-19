AMAZON-STYLE STORE PROJECT WITH MONGODB DATABASE
================================================

WHAT IS CONNECTED
- MongoDB stores the product catalogue (360 sample products), registered users and orders.
- Node.js + Express provides the backend API.
- Passwords are hashed with bcrypt before being saved.
- JWT tokens protect order history, order placement and return requests.
- The browser keeps only the sign-in token/profile and the temporary cart.
- Payment remains a simulation. No real payment is collected.

REQUIREMENTS
1. Install Node.js LTS from https://nodejs.org/
2. Create a free MongoDB Atlas account at https://www.mongodb.com/atlas/database
3. In Atlas, create a free cluster, create a database user/password, and allow your IP address in Network Access.
4. Copy the Atlas connection string. Replace the username/password placeholders and use database name amazon_store.

CONFIGURE THE DATABASE
1. Open the project folder in VS Code.
2. Open the server folder.
3. Copy server/.env.example and name the copy .env (exactly .env).
4. Open server/.env and set MONGODB_URI to your Atlas connection string.
5. Change JWT_SECRET to a long random secret (at least 32 characters).
6. Do not share .env or upload it to GitHub. It contains private credentials.

START THE WEBSITE AND BACKEND
1. Open a terminal in VS Code.
2. Run: cd server
3. Run: npm install
4. Run: npm start
5. Wait for: Store running at http://localhost:3000
6. Open http://localhost:3000 in Chrome. Do not double-click index.html when using the database version.

FIRST START
On first successful connection, the backend automatically imports the sample catalogue from server/products.seed.json into MongoDB. It will not duplicate the catalogue on later starts.

TEST THE DATABASE
- Open http://localhost:3000/api/health. It should show database: connected.
- Open http://localhost:3000/api/products. It should return the products saved in MongoDB.
- In the website, create an account using an email and password of at least 8 characters.
- Add products to cart, complete the demo checkout, then open Returns & Orders.
- In MongoDB Atlas, open Browse Collections to see products, users and orders.

PROJECT FILES
- index.html, style.css, products.js, app.js: storefront frontend
- phone-ad.mp4: silent autoplay promotional video
- server/server.js: Express API and MongoDB models/routes
- server/products.seed.json: sample product catalogue imported on first run
- server/.env.example: database configuration template

IMPORTANT
- You must enter your own MongoDB Atlas connection string in server/.env. The database cannot connect until you do this.
- This project does not include your Atlas username, password or cloud account. Never send those credentials in chat.
- Payment is still simulated. Do not enter real card details.
- This is an educational project starter, not a production-ready Amazon clone. Before public deployment, add stronger validation, rate limiting, secure cookie/token handling, inventory reservation and a real payment provider.

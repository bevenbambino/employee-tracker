// ************* Reference Variables ************* //
const express = require('express');
const Directory = require("./lib/index.js");

const PORT = process.env.PORT || 3001;
const app = express();

const init = new Directory();

// ************* Express middleware ************* //
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// Default response for any other request (Not Found)
app.use((req, res) => {
    res.status(404).end();
});

// App listening on local server
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT} 🚀`);
});

// Start init function
init.displayTitle();
init.menuSelection();
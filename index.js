const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');

app.use(cors());

app.get('/', (req, res) => {
    res.send("just testing");
});
app.get('/test', (req, res) => {
    res.send("test route");
})
app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'products', 'index.html'));
})

app.use(express.static(path.join(__dirname, 'public')));

app.listen(process.env.PORT || 3000, () => {
    console.log('server in running');
})

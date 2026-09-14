const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());

app.get('/', (req, res) => {
    res.send("just testing");
});
app.get('/test', (req, res) => {
    res.send("test route");
})

app.listen(process.env.PORT || 3000, () => {
    console.log('server in running');
})

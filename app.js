const express = require('express');
const app = express();
const router = express.Router();
router.use(function (req, res, next) {
    console.log('/' + req.method);
    next();
});
const path = __dirname + '/views/';
const port = 4000;
router.get('/', function (req, res) {
    res.sendFile(path + 'index.html');
});

router.get('/sharks', function (req, res) {
    res.sendFile(path + 'sharks.html');
});

router.get('/message', function (req, res) {
    res.json({msg:"Hello Sam welcome to team!"})
});


app.use(express.static(path));
app.use('/', router);

app.listen(port, function () {
    console.log('Example app listening on port 4000!')
})

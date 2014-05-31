var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Express' , myJadeString: ' a learning experience'});
});




module.exports = router;


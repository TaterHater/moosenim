var express = require('express');
var router = express.Router();
router.get('/', function(req, res){
   res.sendfile(__dirname+'../html/login.html', {'root': '../'})
});
router.post('/', function(req, res){
   res.send('POST route on login.');
});

//export this router to use in our index.js
module.exports = router;

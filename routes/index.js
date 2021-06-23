var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile('index.html', { root: '.' })
});

router.get('/site.js', function(req, res, next) {
  res.sendFile('site.js', { root: '.' })
});

router.get('/favicon.ico', function(req, res, next) {
  res.sendFile('favicon.ico', { root: '.' })
});

router.get('/changelog', function(req, res, next) {
  res.sendFile('CHANGELOG.md', { root: '.' })
});

module.exports = router;



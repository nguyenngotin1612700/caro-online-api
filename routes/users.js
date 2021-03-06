var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const userModel = require('../Model/Users')
const passport = require('passport');


/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

/* GET user profile. */
router.get('/me', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  res.send(req.user);
});

router.post('/changePassword', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  const user = userModel.findOne({ email: req.user.email })
    .then(currentUser => {
      if (currentUser.password !== req.body.currentPassword) {
        console.log('yyyyyyy');
        res.status(400).json({ message: "change password failed, current password incorrect!!!" });
        return;
      }
      if (req.body.newPassword !== req.body.confirmPassword) {
        res.status(400).json({ message: "change password failed, confirm password do not match with new password!!!" })
        return;
      }
      currentUser.password = req.body.newPassword;
      currentUser.save();
      return res.send(req.user);
    });
});

router.post('/changeProfile', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  const user = userModel.findOne({ email: req.user.email })
    .then(currentUser => {
      if (req.body.name) {
        currentUser.name = req.body.name
      }
      if (req.body.phone) {
        currentUser.phone = req.body.phone
      }
      if (req.body.gender) {
        currentUser.gender = req.body.gender
      }
      currentUser.save();
      const token = jwt.sign({ email: currentUser.email, name: currentUser.name, _id: currentUser._id }, 'your_jwt_secret');
      return res.send({ email: currentUser.email, name: currentUser.name, phone: currentUser.phone, gender: currentUser.gender, token });
    });
});

/* POST login. */
router.post('/login', function (req, res, next) {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: 'Something is not right',
        user: user
      });
    }
    req.login(user, { session: false }, (err) => {
      if (err) {
        res.send(err);
      }
      //generate a signed son web token with the contents of user object and return it in the response
      const token = jwt.sign({ email: user.email, name: user.name, _id: user._id }, 'your_jwt_secret');
      return res.json({ email: user.email, name: user.name, phone: user.phone, gender: user.gender, token });
    });
  })(req, res);
});

router.post('/register', function (req, res, next) {
  if (!req.body.email || !req.body.name || !req.body.password) {
    res.status(400).json({ message: 'please input email, name, password to create account!!!!' });
    return;
  }
  userModel.findOne({ email: req.body.email }).then((currentUser) => {
    if (currentUser) {
      res.status(400).json({ message: "create account failed, email is already exist!!!" })
    } else {
      let newUser = new userModel({
        email: req.body.email,
        name: req.body.name,
        phone: req.body.phone,
        gender: req.body.gender,
        password: req.body.password
      });
      newUser.save();
      res.status(200).json({ message: 'create account successfully!!!' });
    }
  })
});

module.exports = router;

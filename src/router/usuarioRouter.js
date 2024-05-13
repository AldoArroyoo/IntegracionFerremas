const User = require ("../controller/userController.js")
const {Router} = require ("express")

const router = Router()

router.route("/login")
    .post(User.login)

router.route("/register")
    .post(User.register)

module.exports = router
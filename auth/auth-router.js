const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Users = require('../users/user-model');
const { isValid } = require('../users/user-service');

router.post('/register', (req, res) => {
    const credentials = req.body;

    if (isValid(credentials)) {
        const rounds = process.env.BCRYPT_ROUNDS || 8;

        const hash = bcrypt.hashSync(credentials.password, rounds);
        credentials.password = hash;

        Users.add(credentials)
            .then(user => {
                res.status(201).json({ data: user });
            })
            .catch(error => {
                res.status(500).json({ message: error.message });
            });
    } else {
        res.status(400).json({ message: "you shall not pass." })
    }
})

router.post('/login', (req, res) => {
    const {username, password} = req.body;

    if (isValid(req.body)) {
        Users.findBy({ username: username})
            .then(([user]) => {
                if(user && bcrypt.compareSync(password, user.password)) {
                    
                    const token = generateToken(user)

                    res.status(200).json({user, token})
                } else {
                    res.status(401).json({ message: "you don't have the key"})
                }
            })
            .catch(error => {
                res.status(401).json({ message: error.message });
            })
    } else {
        res.status(400).json({ message: "you shall not pass."})
    }
});

function generateToken(user) {
    const payload = {
        subject: user.id,
        username: user.username,
    }

const secret = process.env.JWT_SECRET || "how you know my secret";

const options = {
    expiresIn: "1d"
};

const token = jwt.sign(payload, secret, options);

    return token;

};

module.exports = router;
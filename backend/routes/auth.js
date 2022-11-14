const jwt = require("jsonwebtoken")

function authManager() {
    
    verify = function (req, res, next) {
        //console.log(req)
        try {
            //console.log(req.cookies)
            const token = req.cookies.token;
            if (!token) {
                console.log("no token");
                return res.json({ error: true, message: 'No token found'});
            }
            jwt.verify(token, ":r(4[CaQ3`N<#8EV~7<K75Rd/ZpfzBkv`m-x]+QnjQcXazr%w")
            //req.email = verified.email;
            
            next();
        } catch (err) {
            console.error(err);
            return res.json({ error: true, message: 'Alex is a chigga'});
        }
    }

    signToken = function (user) {
        console.log("trying to sign token")
        return jwt.sign({
            userId: user._id
        }, ":r(4[CaQ3`N<#8EV~7<K75Rd/ZpfzBkv`m-x]+QnjQcXazr%w");
    }
    return this;
}

const auth = authManager();
module.exports = auth;
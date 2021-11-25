require('dotenv').config();
const validator = require('validator');
const User = require('../models/user_model');
const  {getDateYMD, getDateObjectFromYMD} = require("../../utils/date_converter");
const  {getInputLength} = require("../../utils/util");

const signUp = async (req, res) => {
    let {name} = req.body;
    const {email, birthday, password} = req.body;
    console.log("[signup controller] ", req.body)

    const checkBirthday = (birthday) => {
        const birthdayNumbers = birthday.split("-")
        const birthdayObject = getDateObjectFromYMD(birthday)
        const year = birthdayObject.getFullYear()
        const month = birthdayObject.getMonth() + 1
        const date = birthdayObject.getDate()
        const result = birthdayNumbers[0] == year && birthdayNumbers[1] == month && birthdayNumbers[2] == date && year >= 1950 && year <= 2020
        console.log(birthday, birthdayNumbers, birthdayObject, result)
        return result
    }

    if(!checkBirthday(birthday)){
        res.status(400).send({error:'Please enter a date between 1950-01-01 and 2020-12-31.'});
        return;
    }

    if(!name || !email || !password || !birthday) {
        res.status(400).send({error:'Request Error: name, email, birthday and password are required.'});
        return;
    }

    if(getInputLength(name)>45){
        res.status(400).send({error:'Request Error: Name too long'});
        return;
    }

    if (!validator.isEmail(email)) {
        res.status(400).send({error:'Request Error: Invalid email format'});
        return;
    }

    name = validator.escape(name);

    const result = await User.signUp(name, birthday, User.USER_ROLE.USER, email, password);
    if (result.error) {
        console.log(result.error)
        res.status(403).send({error: result.error});
        return;
    }

    const user = result.user;
    if (!user) {
        res.status(500).send({error: 'Database Query Error'});
        return;
    }

    res.status(200).send({
        data: {
            accessToken: user.access_token,
            accessExpired: user.access_expired,
            loginAt: user.login_at,
            user: {
                id: user.id,
                provider: user.provider,
                name: user.name,
                birthday: user.birthday,
                email: user.email,
            }
        }
    });
};

const nativeSignIn = async (email, password) => {
    if(!email || !password){
        return {error: 'Request Error: email and password are required.', status: 400};
    }

    try {
        return await User.nativeSignIn(email, password);
    } catch (error) {
        return {error};
    }
};

const signIn = async (req, res) => {
    const data = req.body;
    console.log("req.body", data)
    let result;
    switch (data.provider) {
        case 'native':
            result = await nativeSignIn(data.email, data.password);
            break;
        default:
            result = {error: 'Wrong Request'};
    }

    if (result.error) {
        const statusCode = result.status ? result.status : 403;
        console.log("result.error", result.error)
        const errorMessage = result.error === 'Wrong Request' ? result.error : "Incorrect email or password"
        res.status(statusCode).send({error: errorMessage});
        return;
    }

    const user = result.user;
    if (!user) {
        res.status(500).send({error: 'Database Query Error'});
        return;
    }

    res.status(200).send({
        data: {
            accessToken: user.access_token,
            accessExpired: user.access_expired,
            loginAt: user.login_at,
            user: {
                id: user.id,
                provider: user.provider,
                birthday: getDateYMD(user.birthday),
                name: user.name,
                email: user.email,
            }
        }
    });
};

const getUserProfile = async (req, res) => {
    res.status(200).send({
        data: {
            provider: req.user.provider,
            name: req.user.name,
            birthday: getDateYMD(new Date (req.user.birthday)),
            email: req.user.email,
        }
    });
    return;
};

module.exports = {
    signUp,
    signIn,
    getUserProfile
};

import { signup, login, loginAPI, common } from '../../pages'
import { name, email, password } from '../../../fixtures/ui/user.json'
import userApi from '../../../fixtures/api/userApi.json'
import { getRandomUser, setUpSeed } from "../../../support/utils"

describe('Sign up - sign in suite', () => {
    const { name: userName, email: userEmail, password: userPassword } = userApi
    const { name: randomName, email: randomEmail, password: randomPassword } = getRandomUser()

    before(() => {
        setUpSeed()
    })

    beforeEach(() => {
        common.openPage('/')
    })

    it('should register a new user', () => {
        signup.openSignupPage()
        signup.registerUser(name, email, password)
    })

    it('should redirect a user from signup to login page', () => {
        signup.openSignupPage()
        signup.clickSignInToYourAccount()
        login.verifyLoginPageIsOpened()
    })

    it('should login as an existing user',  () => {
        login.openLoginPage()
        login.loginUser(userName, userEmail, userPassword)
    })

    it('should redirect a user from login to signup page',  () => {
        login.openLoginPage()
        login.clickNeedAnAccount()
        signup.verifySignupPageIsOpened()
    })

    it('should login as an non-existent user with error',  () => {
        login.openLoginPage()
        login.fillLoginFormAndSubmit(randomName, randomEmail, randomPassword)
        login.verifyErrorAuthMessage()
    })

    it('should logout a user',  () => {
        loginAPI.userLogin(userEmail, userPassword)
        common.reloadPage()
        login.logoutUser(userName)
    })
})

import { signup, login, loginAPI, common } from '../../pages'
import { name, email, password } from '../../../fixtures/ui/user.json'
import userApi from '../../../fixtures/api/userApi.json'
import { setUpSeed } from "../../../support/utils"

describe('Sign up - sign in suite', () => {
    const { email: userName, password: userPassword } = userApi

    before(() => {
        setUpSeed()
    })

    beforeEach(() => {
        common.openPage('/')
    })

    it('Should do register user', () => {
        signup.openSignupPage()
        signup.checkSignupTitle()
        signup.registerUser(name, email, password)
    })

    it('Should do login user',  () => {
        login.openLoginPage()
        login.checkLoginTitle()
        login.loginUser(name, email, password)
    })

    it('should do logout user',  () => {
        loginAPI.userLogin(userName, userPassword)
        common.reloadPage()
        login.logoutUser()
    })
})

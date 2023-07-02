import { signup, login, loginAPI, common } from "../../pages"
import { name, email, password } from '../../../fixtures/ui/user.json'
// import userApi from '../../../fixtures/api/userApi.json'

describe('Sign up - sign in suite', () => {

    before(() => {
        cy.exec('npx -w backend sequelize-cli db:seed:undo:all')
            .its('code').should('eq', 0)
        cy.exec('npx -w backend sequelize-cli db:seed:all')
            .its('code').should('eq', 0)
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
        // loginAPI.userLogin(userApi.email, userApi.password) // NOT WORKING
        loginAPI.userLogin(email, password)
        common.reloadPage()
        login.logoutUser()
    })
})

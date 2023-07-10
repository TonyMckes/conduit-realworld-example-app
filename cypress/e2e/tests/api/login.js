import 'cypress-plugin-api'
import { loginAPI } from '../../pages'
import { getUniqueUserName } from '../../../support/utils'

describe('Login user suite', () => {
  const timestamp = getUniqueUserName()
  const user = {
    name: `auto-${timestamp}`,
    email: `auto-${timestamp}@gmail.com`,
    password: 'Andy09'
  }

  before(() => {
    cy.exec('npx -w backend sequelize-cli db:seed:undo:all').its('code').should('eq', 0)
    cy.exec('npx -w backend sequelize-cli db:seed:all').its('code').should('eq', 0)
  })

  it('should do register user', () => {
    loginAPI.userRegister(user.name, user.email, user.password)
  })

  it('Should do login user', () => {
    loginAPI.userLogin(user.email, user.password)
  })
})

export {}

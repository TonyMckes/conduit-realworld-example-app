class Header {
  menuSignUp = '.navbar a[href$="register"]'
  menuLogin = '.navbar a[href$="login"]'
  menuHome = '.navbar li.nav-item > a[href="#/"]'
  menuNewArticle = '.navbar a[href$="editor"]'
  menuUserDropdown = '.navbar .dropdown'
  itemProfile = '.dropdown-menu a[href*="#/profile"]'
  itemSettings = '.dropdown-menu a[href*="#/settings"]'
  itemLogout = '.dropdown-menu a[href$="#/"]'

  clickSignupItem() {
    cy.get(this.menuSignUp).click()
  }

  clickLoginItem() {
    cy.get(this.menuLogin).click()
  }

  clickHomeItem() {
    cy.get(this.menuHome).click()
  }

  clickNewArticleItem() {
    cy.get(this.menuNewArticle).click()
  }

  clickUserDropdownMenu() {
    cy.get(this.menuUserDropdown).click()
  }

  clickUserDropdownMenuProfileItem() {
    cy.get(this.itemProfile).click()
  }

  clickUserDropdownMenuLogoutItem() {
    cy.get(this.itemLogout).click()
  }
  // TODO: need to use to further tests
  clickUserDropdownMenuSettingsItem() {
    cy.get(this.itemSettings).click()
  }

  verifyUserNameIsDisplayed(name, isDisplayed) {
    if (isDisplayed) {
      cy.get(this.menuUserDropdown).should('contain.text', name)
    } else {
      cy.get(this.menuUserDropdown).should('not.exist')
    }
  }
}

export const header = new Header()

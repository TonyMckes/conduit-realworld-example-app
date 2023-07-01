class Header {
    signUpLocator = '.navbar a[href$="register"]'
    loginLocator = '.navbar a[href$="login"]'
    userDropdownLocator = '.navbar .dropdown'
    logoutLocator = '.dropdown-menu a[href$="#/"]'
}

export const header = new Header()

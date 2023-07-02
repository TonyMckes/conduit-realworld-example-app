class CommonAPI {
    setItemToLS(key, value) {
        cy.window().then((win) => {
            win.localStorage.setItem(key, JSON.stringify(value))
        })
    }
}

export const commonApi = new CommonAPI()

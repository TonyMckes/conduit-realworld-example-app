class Common {
    openPage(url) {
        cy.visit(url)
    }

    reloadPage() {
        cy.reload()
    }
}

export const common = new Common()

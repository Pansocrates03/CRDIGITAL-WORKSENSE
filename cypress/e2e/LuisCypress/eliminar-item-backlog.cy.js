/// <reference types="cypress" />

describe('Eliminar un ítem existente del backlog', () => {
  it('Debe eliminar un ítem de prueba del backlog', () => {
    cy.visit('http://localhost:5173/')
    // Iniciar sesión si es necesario
    if (cy.url().should('include', '/login')) {
      cy.get('#email').type('luis@email.com')
      cy.get('#password').type('luis123')
      cy.get('button[type=submit]').click()
    }
    // Navegar a la pantalla de backlog
    cy.contains('._card_pziug_315', 'Ai supermarket assistant')
      .find('svg.lucide-arrow-right')
      .click()
    cy.contains('nav li', 'Backlog').click()
    // Buscar un ítem de prueba (ajustar el nombre si es necesario)
    const nombreItem = 'Test Item'
    cy.contains('td', nombreItem).parent('tr').within(() => {
      // Hacer clic en el botón de los tres puntos (acciones)
      cy.get('button._menuButton_108bi_7').click({force: true})
      // Hacer clic en el botón Delete del menú
      cy.get('button._menuItem_108bi_44._deleteItem_108bi_67').click({force: true})
    })
    // Confirmar la eliminación si hay un modal de confirmación
    cy.get('button').contains(/^Delete$/).should('be.visible').click({force: true})
  })
}) 
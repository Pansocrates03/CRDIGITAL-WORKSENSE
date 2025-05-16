/// <reference types="cypress" />

describe('Visualización y filtros del Product Backlog', () => {
  it('Debe filtrar correctamente los ítems del backlog', () => {
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
    // Buscar un ítem específico (ajustar el nombre según un ítem existente)
    const nombreBuscar = 'Test Item'
    cy.get('input[placeholder="Search backlog items..."]').type(nombreBuscar)
    cy.contains(nombreBuscar).should('exist')
    // Limpiar el filtro
    cy.get('input[placeholder="Search backlog items..."]').clear()
    // Verificar que se muestran todos los elementos nuevamente (ajustar selector si es necesario)
    // cy.get('SELECTOR_LISTA_BACKLOG').children().should('have.length.greaterThan', 1)
  })
}) 
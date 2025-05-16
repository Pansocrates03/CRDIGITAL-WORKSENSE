/// <reference types="cypress" />

describe('Creación de un nuevo ítem en el backlog', () => {
  it('Debe crear un nuevo ítem con los campos obligatorios', () => {
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
    // Hacer clic en el botón "+ Add Item"
    cy.contains('button', 'Add Item').click()
    // Llenar los campos obligatorios
    const nombreUnico = `Test Item ${Date.now()}`
    cy.get('input#name').type(nombreUnico)
    cy.get('select#type').select('Story')
    // Crear el ítem
    cy.contains('button', 'Create Item').click()
    // Verificar que el ítem aparece en la lista
    cy.contains(nombreUnico).should('exist')
  })
}) 
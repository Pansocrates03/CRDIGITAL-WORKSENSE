/// <reference types="cypress" />

describe('Crear un proyecto sin añadir miembros ni epicas hechas con AI', () => {
    it('Crear un proyecto', () => {
        // Visitar la página de creación de proyectos
        cy.visit('http://localhost:5173/')
    
        // Iniciar sesión (si es necesario)
        if(cy.url().should('include', '/login') ) {
            cy.get('#email').type('e.s.baccio@gmail.com')
            cy.get('#password').type('123')
            cy.get('button[type=submit]').click()
        }
    
        // Navegar a la sección de creación de proyectos
        cy.get('._newProjectButton_g1197_533').click()
    
        // Completar el formulario de creación de proyectos
        cy.get('#projectName').type('Proyecto de Prueba')
        cy.get('#description').type('Descripción del proyecto de prueba.')
        
        
        // Crear el proyecto sin añadir miembros ni epicas hechas con AI
        cy.get('button[type=submit]').click()
    
        // Verificar que el proyecto se ha creado correctamente
        cy.contains('Proyecto de Prueba').should('exist')
    })
})
# classroom_Project
Proyecto de investigacion

-- TECNOLOGIAS UTILIZADAS --

El frontend: 
* React: para la interfaz de usuario
* Vite: para crear y ejecutar el proyecto

El backend:
* Node.js: entorno de ejecucion
* Express.js: para la creacion de API y manejo de solicitudes

Base de datos:
* MongoDB: para almacenar la informacion del sistema, NoSQL
* Mongoose: facilita la comunicacion entre Node.js y MongoDB

-- ARQUITECTURA --

** Para el proyecto se utiliza Arquitectura Hexagonal, esta separada de la siguente manera:

* Domain: reglas y entidades
* Application: casos de uso y logica de la app
* Infrastructure: conexion con MongoDB, Apis y servicios externos
* Ports: interfaces que conectan la app con el exterior
* Adapters: conecta componentes externos con los puertos definidos por la app

-- REQUISITOS --

* Tener instalado Node.js version 18 o superior: node --version
* npm: npm --version
* MongoDB Community Server: mongod --version

** Crea el archivo .env en backend/ a partir de .env.example y completa las variables locales **

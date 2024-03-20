// require('dotenv').config();

const pg = require("pg");
const express = require("express");

const app = express();

app.use(require("morgan")("dev"));
app.use(express.json());

const client = new pg.Client(
     process.env.DATABSE_URL || `postgres://localhost/acme_hr_directory_db`
);


const init = async () => {
    await client.connect();
    console.log('connected to database');
    let SQL = `
        DROP TABLE IF EXISTS employees;
        DROP TABLE IF EXISTS department;

        
        CREATE TABLE department(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL
        );
        
        CREATE TABLE employees(
            id SERIAL PRIMARY KEY,
            created_at TIMESTAMP DEFAULT now(), 
            updated_at TIMESTAMP DEFAULT now(),
            name VARCHAR(100),
            department_id INTEGER REFERENCES department(id) NOT NULL
        );
        
        
    `;

    await client.query(SQL);
    console.log('TABLE CREATED');

    SQL = `
        INSERT INTO department(name) VALUES('math');
        INSERT INTO department(name) VALUES('english');
        INSERT INTO employees(name, department_id) VALUES('chris', 
            (SELECT id from employees WHERE name = 'math'));
        INSERT INTO employees(name, department_id) VALUES('sarah', 
            (SELECT id from employees WHERE name = 'english'));
    
    `;
    
    await client.query(SQL);
    console.log('tables seeded');
    const port = process.env.PORT;
    app.listen(port, () => console.log(`listening to port ${port}`));

}

init();
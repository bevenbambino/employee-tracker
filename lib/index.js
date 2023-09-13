const inquirer = require("inquirer");
const mysql = require('mysql2');
const { table } = require('table');

const db = mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: 'superlame',
      database: 'store_db'
    },
    console.log(`Connected to the store_db database.`)
);

class Directory {
    constructor(){
        this.answer = "";
    }

    // *********************** Init Function *********************** //
    async menuSelection(){

        const menuQuestion = await inquirer.prompt([
            {
                type: "list",
                name: "options",
                message: "What would you like to do?",
                choices: ["view all departments", "view all roles", "view all employees", "add a department", "add a role", "add an employee", "update an employee role", "exit"]
            }
        ])

        switch(menuQuestion.options) {
            case "view all departments": //done
                this.getDepartments();
                break;    
            case "view all roles": //done
                this.getRoles();
                break;
            case "view all employees": //done
                this.getEmployees();
                break;
            case "add a department": //done
                this.addDepartment();
                break;
            case "add a role": //done
                this.addRole();
                break;
            case "add an employee": //done
                this.addEmployee();
                break;
            case "update an employee role": 
                this.updateEmpRole();
                break;
            case "exit": 
                break;
        }
    }
 
    // ************* function to display the title ************* //
    displayTitle() {
        const configTitle = {
            columns: [
              {
                width: 20,
                truncate: 100
              }
            ]
        };
        
        const title = [
            ['Employee Tracker']
        ];

        console.log(table(title, configTitle));
    }

    // ****************** view functions ****************** //
    async getDepartments() { 
        const sql = `SELECT * FROM department`;
        const labelArray = ["ID", "DEPARTMENT NAME"];
        const callback = (item) => {
            return [item.id, item.name]
        };

        this.getResults(sql, labelArray, callback)
    }

    async getRoles() { 
        // const sql = `SELECT * FROM role`;
        const sql = `SELECT role.id AS id, role.title AS title, role.salary AS salary, department.name AS department_id
        FROM role
        LEFT JOIN department ON role.department_id = department.id`
        const labelArray = ["ID", "TITLE", "SALARY", "DEPARTMENT"];
        const callback = (item) => {
            return [item.id, item.title, item.salary, item.department_id]
        };

        this.getResults(sql, labelArray, callback)
    }

    async getEmployees() { 
        // const sql = `SELECT * FROM employee`;
        const sql = `SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name, 
        role.title AS role_id, department.name AS name, role.salary AS salary, 
        CONCAT(manager.first_name, " ", manager.last_name) AS manager_name
        FROM employee
        LEFT JOIN role ON employee.role_id = role.id
        LEFT JOIN department ON role.department_id = department.id
        LEFT JOIN employee manager ON manager.id = employee.manager_id`
        const labelArray = ["ID", "FIRST NAME", "LAST NAME", "ROLE", "DEPARTMENT", "SALARY", "MANAGER"];
        const callback = (item) => {
            return [item.id, item.first_name, item.last_name, item.role_id, item.name, item.salary, item.manager_name]
        };

        this.getResults(sql, labelArray, callback)
    }

    // ****************** add functions ****************** //
    async addDepartment() {
        const addDepName = await inquirer.prompt([
            {
                type: "input",
                name: "depName",
                message: "What is the name of the department?",
            }
        ])

        const sql = `INSERT INTO department (name)
            VALUES (?)`;
        const params = [addDepName.depName];

        db.query(sql, params)

        this.menuSelection();
    }

    async addRole() {
        const addRoleInfo = await inquirer.prompt([
            {
                type: "input",
                name: "roleName",
                message: "What is the name of the role?",
            },
            {
                type: "input",
                name: "roleSalary",
                message: "What is the salary of the role?",
            },
            {
                type: "list",
                name: "roleDep",
                message: "What is the department of this role?",
                choices: this.getDepartmentIDArray
            }
        ])

        const sql = `INSERT INTO role (title, salary, department_id)
        VALUES (?, ?, ?)`;

        const params = [addRoleInfo.roleName, addRoleInfo.roleSalary, this.getID(addRoleInfo.roleDep)];

        db.query(sql, params)

        this.menuSelection();
    }

    async addEmployee() {
        const addEmpInfo = await inquirer.prompt([
            {
                type: "input",
                name: "firstName",
                message: "What is the employee's first name?",
            },
            {
                type: "input",
                name: "lastName",
                message: "What is the employee's last name?",
            },
            {
                type: "list",
                name: "role",
                message: "What is the employee's role?",
                choices: this.getRoleIDArray
            },
            {
                type: "list",
                name: "manager",
                message: "Who is the employee's manager?",
                choices: this.getEmployeeIDArray
            },
        ])
         
        const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
        VALUES (?, ?, ?, ?)`;
        const params = [addEmpInfo.firstName, addEmpInfo.lastName, this.getID(addEmpInfo.role), this.getID(addEmpInfo.manager)];

        db.query(sql, params)

        this.menuSelection();
    }

    // ****************** update functions ****************** //
    async updateEmpRole() {
        const addUpdateEmpInfo = await inquirer.prompt([
            {
                type: "list",
                name: "empID",
                message: "Which employee's role do you want to update?",
                choices: this.getEmployeeIDArray
            },
            {
                type: "list",
                name: "empRoleID",
                message: "Which role do you want to assign the selected employee?",
                choices: this.getRoleIDArray
            },
        ])

        const sql = `UPDATE employee
            SET role_id = ?
            WHERE id = ?;`;
        const params = [this.getID(addUpdateEmpInfo.empRoleID), this.getID(addUpdateEmpInfo.empID)];

        db.query(sql, params)

        this.menuSelection();
    }

    // ******************** Utility functions ******************** //
    // helper function for the get functions to post data into table
    async getResults(sql, labelArray, resultDataFunction) {
        try {    
            // puts the results of the query search in a variable 
            const results = await db.promise().query(sql);
    
            // the query search returns to items, the array we need is the first item. That gets set to a var
            const resultData = results[0];
    
            // puts label array and arrays from resultDataFunction in a array of arrays to be read by the console table
            let newArray = [labelArray, ...resultData.map(resultDataFunction)];
            // console.log(newArray);

            // displays in a table 
            console.log("\n");
            console.log(table(newArray));
    
            // callback to menu 
            this.menuSelection();
        } catch (err) {
            console.error(err);
        }
    }

    // helper function for addRole()
    async getDepartmentIDArray() {
        const depIdArray = [];

        // get data from department table
        const results = await db.promise().query(`SELECT * FROM department`);

        // push department id and names to array
        results[0].forEach((item) => depIdArray.push(`${item.id} ${item.name}`))

        return depIdArray;
    }

    // helper function for addEmployee()
    async getRoleIDArray() {
        const roleIdArray = [];

        // get data from role table
        const results = await db.promise().query(`SELECT id, title FROM role`);

        // push role id and title to array
        results[0].forEach((item) => roleIdArray.push(`${item.id} ${item.title}`))

        return roleIdArray;
    }

    // helper function for addEmployee()
    async getEmployeeIDArray() {
        const empIdArray = [];

        // get data from employee table
        const results = await db.promise().query(`SELECT id, first_name, last_name FROM employee`);

        // push employee id first and last names to array
        results[0].forEach((item) => empIdArray.push(`${item.id} ${item.first_name} ${item.last_name}`))

        return empIdArray;
    }

    // helper function to get IDs from inquirer prompts
    getID(input) {
        // split on " ", first item in array is the number of id
        const roleID = input.split(" ");
        return parseInt(roleID[0])
    }

}

module.exports = Directory;
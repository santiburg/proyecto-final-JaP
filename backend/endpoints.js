const express = require("express");
const fs = require('fs');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const path = require('path');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ecommerce',
    password: 'postgres',
    port: '5432'
})

const app = express(); // Crea una instancia de ExpressJS
app.use(cors());

app.use(express.json());



// Middleware para autorizar las solicitudes
const authMiddleware = (req, res, next) => {
    try {
        // Extrae el token del header de la solicitud
        const token = req.header('Authorization');
        
        if (!token) {
            console.error('Authorization header missing');
            return res.status(403).json({ error: 'No token provided' });
        }

        // Se verifica que el Token válido
        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) {
                console.error('Token verification failed:', err.message);
                return res.status(403).json({ error: 'Invalid token' });
            }

            // Adjunta el usuario a la solicitud
            req.user = user;

            // PDeja que la solicitud continúe
            next();
        });
    } catch (error) {

        console.error('Error in authMiddleware:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};


app.get("/protected", authMiddleware, (req, res) => {
    res.json({ message: "Protected route accessed successfully" });
});


//Trae el listado de categorías.
app.get("/cats/cat.json", authMiddleware, (req, res) => {
    const filePath = path.join(__dirname, 'cats', 'cat.json'); //directorio del Json

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error reading the file");
        }

        res.setHeader('Content-Type', 'application/json'); // Explicita que el tipo de archivo es Json
        res.send(data); //Envia la información dentro de cat.json.
    });
});

//Trae el listado de productos de una categoría.
app.get("/cats_products/:id.json", authMiddleware, (req, res) => {
    const { id } = req.params
    const filePath = path.join(__dirname, 'cats_products', `${id}.json`); //directorio del Json

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error reading the file");
        }

        res.setHeader('Content-Type', 'application/json'); // Explicita que el tipo de archivo es Json
        res.send(data); //Envia la información dentro de cat.json.
    });
});

//Trae un producto específico.
app.get("/products/:id.json", authMiddleware, (req, res) => {
    const { id } = req.params
    const filePath = path.join(__dirname, 'products', `${id}.json`); //directorio del Json

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error reading the file");
        }

        res.setHeader('Content-Type', 'application/json'); // Explicita que el tipo de archivo es Json
        res.send(data); //Envia la información dentro de cat.json.
    });
});

//Trae una lista de comentarios de cierto producto.
app.get("/products_comments/:id.json", authMiddleware, (req, res) => {
    const { id } = req.params
    const filePath = path.join(__dirname, 'products_comments', `${id}.json`); //directorio del Json

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error reading the file");
        }

        res.setHeader('Content-Type', 'application/json'); // Explicita que el tipo de archivo es Json
        res.send(data); //Envia la información dentro de cat.json.
    });
});

// Ruta para registrarse
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Valida el input
    if (!email || !password) {
        return res.status(400).json({ message: 'email and password are required' });
    }
    try {

        // Chequeo de usuario ya registrado
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'email already exists' });

        }

        // encripta la contraseña
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Inserta el nuevo usuario, y la contraseña encriptada
        await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hashedPassword]);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Ruta para logearse
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const result = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // Crea el token JWT con duración 12 horas
        const token = jwt.sign(
            { id: user.id, email: user.email },
            SECRET_KEY,
            { expiresIn: '12h' }
        );

        res.status(200).json({ message: 'Login successful', token: token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});




app.post('/cart', authMiddleware, async (req, res) => {
    const { email, product_id, count } = req.body;

    const query = `
        INSERT INTO cart (email, product_id, count)
        VALUES ($1, $2, $3)
        ON CONFLICT (email, product_id)
        DO UPDATE SET count = $3`;

    try {
        await pool.query(query, [email, product_id, count]);
        res.status(200).json({ message: 'Product added to cart' });
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).json({ error: 'Server error' });
    }
});


app.delete('/cart', authMiddleware, async (req, res) => {
    const { email, product_id } = req.body;

    const query = `
        DELETE FROM cart
        WHERE email = $1 AND product_id = $2`;

    await pool.query(query, [email, product_id])
        .then(result => {
            res.status(200).send('Product deleted from cart');
        })
        .catch(err => {
            console.error('Error executing query', err);
            res.status(500).send('Server error');
        });
});

app.post('/get_cart', authMiddleware, async (req, res) => {
    const { email, password } = req.body;

    // Valido que el usuario que requiere el carrito se encuentre registrado
    const result = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Obtengo los IDs guardados en el carrito del usuario, y su cantidad
    const cartResult = await pool.query(
        `SELECT product_id, count FROM cart WHERE email = $1`, [email]
    );
    
    // Inicializo el array con los datos finales del producto
    const finalCartItems = [];
    
    // itero por cada producto del carrito
    for (let i = 0; i < cartResult.rows.length; i++) {
        const { product_id, count } = cartResult.rows[i];
    
        // Obtengo el producto con su ID
        const productResult = await pool.query(
            `SELECT * FROM products WHERE id = $1`, [product_id]
        );
    
        if (productResult.rows.length > 0) {
            const product = productResult.rows[0];
    
            // Crea el objeto con los datos del producto
            const item = {
                id: product.id,
                name: product.name,
                currency: product.currency,
                description: product.description,
                cost: product.cost,
                image:product.image
            };
    
            //Agrega el producto al objeto que se devolverá
            finalCartItems.push({ item: item, quantity: count });
        }
    }
    return res.status(200).json((finalCartItems));
});



// inicia el servidor y muestra el puerto.
app.listen(3000, () => {
    console.log(`Servidor corriendo en http://localhost:3000`);
});
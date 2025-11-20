CREATE DATABASE ecommerce;


\c ecommerce;

-- Crea tabla para los usuarios
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    second_name VARCHAR(255),
    lastname VARCHAR(255),
    second_lastname VARCHAR(255),
    phone VARCHAR(255)
);

-- Crea tabla para los artículos
CREATE TABLE Category(
    catID SERIAL PRIMARY KEY,
    catName VARCHAR(255) NOT NULL,
    description TEXT,
    productCount INT DEFAULT 0,
    imgSrc VARCHAR(255)
);

-- Tabla principal de productos
CREATE TABLE Products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    cost DECIMAL(10, 2),
    currency CHAR(3),
    soldCount INT,
    image VARCHAR(255),
    catID INT,
    FOREIGN KEY (catID) REFERENCES Category(catID)
);

-- Tabla para los productos relacionados
CREATE TABLE Related_products (
    productId INT,
    relatedProductId INT,
    PRIMARY KEY (productId, relatedProductId),
    FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE,
    FOREIGN KEY (relatedProductId) REFERENCES Products(id) ON DELETE CASCADE
);

-- Crea tabla intermedia para la relación carrito-artículos
CREATE TABLE Cart (
    email VARCHAR(255) NOT NULL REFERENCES Users(email),
    product_id INT NOT NULL REFERENCES Products(id) ON DELETE CASCADE,
    count INT NOT NULL,
    CONSTRAINT "PK_Cart" PRIMARY KEY (email, product_id)
);


-- Crea tabla de comentarios
CREATE TABLE Products_comments (
    id SERIAL PRIMARY KEY,
    product INT NOT NULL REFERENCES Products(id),
    score INT NOT NULL CHECK (score BETWEEN 1 AND 5),
    description TEXT,
    email VARCHAR(255) NOT NULL REFERENCES Users(email),
    dateTime TIMESTAMP NOT NULL
);

-- Creo la función para actualizar el contador de productos en categorias cuando se inserta o elimina un producto
CREATE OR REPLACE FUNCTION update_product_count() 
RETURNS TRIGGER AS $$
BEGIN
    -- Si se inserta un producto, aumenta la cuenta de productos en la tabla Category
    IF TG_OP = 'INSERT' THEN
        UPDATE Category
        SET productCount = productCount + 1
        WHERE catID = NEW.catID;
    -- Si se elimina un producto, baja la cuenta de productos en la tabla Category
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE Category
        SET productCount = productCount - 1
        WHERE catID = OLD.catID;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Crea un evento para actualizar la cuenta de productos en la tabla Category al insertar o eliminar un producto
CREATE TRIGGER product_count_trigger
AFTER INSERT OR DELETE ON Products
FOR EACH ROW
EXECUTE FUNCTION update_product_count();


CREATE OR REPLACE FUNCTION delete_cart_if_count_zero() 
RETURNS TRIGGER AS $$
BEGIN
    -- Chequea si el count es actualizado a 0
    IF NEW.count = 0 THEN
        -- Borra la fila carrito si 
        DELETE FROM Cart WHERE email = NEW.email AND product_id = NEW.product_id;
        -- retorna null para evitar la actualización que establecería count en 0
        RETURN NULL;
    END IF;
    -- Si no se cumple la condición, retorna la fila actualizada
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- trigger para borrar el carrito si el count es 0
CREATE TRIGGER check_cart_count_zero
BEFORE UPDATE ON Cart
FOR EACH ROW
EXECUTE FUNCTION delete_cart_if_count_zero();



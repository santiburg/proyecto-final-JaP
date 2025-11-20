const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ecommerce',
    password: 'postgres',
    port: 5432
});

// Leer archivos
async function populateTableFromJSON(folderPath, processFn) {
    const files = fs.readdirSync(folderPath);
    for (const file of files) {
        const filePath = path.join(folderPath, file);
        if (path.extname(filePath) === '.json') {
            const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            await processFn(jsonData);
        }
    }
}

async function populateCategories() {
    console.log('Poblando tabla Category...');
    await populateTableFromJSON(
        path.join(__dirname, 'cats'),
        async (json) => {
            for (const category of json) {
                const query = `
                    INSERT INTO Category (catID, catName, description, imgSrc)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT DO NOTHING
                `;
                await pool.query(query, [category.id, category.name, category.description, category.imgSrc]);
            }
        }
    );
}

async function populateProducts() {
    console.log('Poblando tabla Products...');
    await populateTableFromJSON(
        path.join(__dirname, 'cats_products'),
        async (json) => {
            const { catID, products } = json;
            for (const product of products) {
                const query = `
                    INSERT INTO Products (id, name, description, cost, currency, soldCount, image, catID)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    ON CONFLICT DO NOTHING
                `;
                await pool.query(query, [
                    product.id,
                    product.name,
                    product.description,
                    product.cost,
                    product.currency,
                    product.soldCount,
                    product.image,
                    catID,
                ]);
            }
        }
    );
}

async function populateRelatedProducts() {
    console.log('Poblando tabla Related_products...');
    await populateTableFromJSON(
        path.join(__dirname, 'products'),
        async (json) => {
            const { id, relatedProducts } = json;
            for (const related of relatedProducts) {
                const query = `
                    INSERT INTO Related_products (productId, relatedProductId)
                    VALUES ($1, $2)
                    ON CONFLICT DO NOTHING
                `;
                await pool.query(query, [id, related.id]);
            }
        }
    );
}

(async () => {
    try {
        await populateCategories();
        await populateProducts();
        await populateRelatedProducts();
        console.log('Población completada exitosamente.');
    } catch (err) {
        console.error('Error durante la población:', err);
    } finally {
        await pool.end();
    }
})();

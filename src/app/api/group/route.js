import mysql from 'mysql2/promise';

const dbConfig = {
    host: process.env.dbHost,
    user: process.env.dbUser,
    password: process.env.dbPassword,
    database: process.env.dbDatabase,
};

export async function GET(req) {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT GroupID, GroupName FROM groups');
        await connection.end();
        return new Response(JSON.stringify(rows), { status: 200 });
    } catch (error) {
        console.error('Error fetching groups:', error);
        return new Response(JSON.stringify({ error: 'Error fetching groups' }), { status: 500 });
    }
}
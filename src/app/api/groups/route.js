import mysql from 'mysql2/promise';
import { cookies } from 'next/headers';

function isAdmin() {
    const cookieStore = cookies();
    const auth = cookieStore.get('admin_auth');
    return auth?.value === 'true';
}

const dbConfig = {
    host: '10.0.0.246',
    user: 'root',
    password: 'X36n80ac',
    database: 'my_project',
};

export async function GET() {
    if (!isAdmin()) {
        return new Response('Unauthorized', { status: 401 });
    }
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT * FROM groups');
    await conn.end();
    return Response.json(rows);
}

export async function POST(req) {
    if (!isAdmin()) {
        return new Response('Unauthorized', { status: 401 });
    }
    const data = await req.json();
    const { GroupID, GroupName } = data;

    if (!GroupID || !GroupName) {
        return new Response('Missing fields', { status: 400 });
    }

    const conn = await mysql.createConnection(dbConfig);
    await conn.execute('INSERT INTO groups (GroupID, GroupName) VALUES (?, ?)', [GroupID, GroupName]);
    await conn.end();

    return new Response('Group added', { status: 201 });
}

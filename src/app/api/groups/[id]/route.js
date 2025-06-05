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

export async function DELETE(req, { params }) {
    if (!isAdmin()) {
        return new Response('Unauthorized', { status: 401 });
    }
    const { id } = params;

    const conn = await mysql.createConnection(dbConfig);
    const [result] = await conn.execute('DELETE FROM groups WHERE GroupID = ?', [id]);
    await conn.end();

    if (result.affectedRows > 0) {
        return new Response('Group deleted', { status: 200 });
    } else {
        return new Response('Group not found', { status: 404 });
    }
}

export async function PUT(req, { params }) {
    if (!isAdmin()) {
        return new Response('Unauthorized', { status: 401 });
    }
    const { id } = params;
    const { GroupName } = await req.json();

    const conn = await mysql.createConnection(dbConfig);
    const [result] = await conn.execute(
        'UPDATE groups SET GroupName = ? WHERE GroupID = ?',
        [GroupName, id]
    );
    await conn.end();

    if (result.affectedRows > 0) {
        return new Response('Group updated', { status: 200 });
    } else {
        return new Response('Group not found', { status: 404 });
    }
}

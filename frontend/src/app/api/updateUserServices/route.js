import axios from 'axios';

const XSI_SERVER_HOST = process.env.XSI_SERVER_HOST;
const USERNAME = process.env.XSI_USERNAME;
const PASSWORD = process.env.XSI_PASSWORD;

const authHeader = 'Basic ' + Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

export async function PUT(req) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const service = searchParams.get('service');

    if (!userId || !service) {
        return new Response(JSON.stringify({ error: 'User ID and service name are required' }), { status: 400 });
    }

    try {
        const url = `https://${XSI_SERVER_HOST}/com.broadsoft.xsi-actions/v2.0/user/${userId}/services/${service}`;

        console.log('Making PUT request to XSI server to update service settings:', url);

        const body = await req.json(); // Parse the JSON body from the request

        const response = await axios.put(url, body, {
            headers: {
                Authorization: authHeader,
                'Content-Type': 'application/json',
            },
        });

        return new Response(JSON.stringify(response.data), { status: response.status });
    } catch (error) {
        console.error('Error updating service settings:', error);
        return new Response(JSON.stringify({ error: 'Error updating service settings' }), { status: 500 });
    }
}
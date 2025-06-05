// /api/callcenterProfile route using axios, matching serviceDetails format
import axios from 'axios';

const XSI_SERVER_HOST = process.env.XSI_SERVER_HOST;
const USERNAME = process.env.XSI_USERNAME;
const PASSWORD = process.env.XSI_PASSWORD;

const authHeader = 'Basic ' + Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const callcenterId = searchParams.get('callcenterId');

    if (!callcenterId) {
        return new Response(JSON.stringify({ error: 'Call Center ID is required' }), { status: 400 });
    }

    try {
        const url = `https://${XSI_SERVER_HOST}/com.broadsoft.xsi-actions/v2.0/callcenter/${encodeURIComponent(callcenterId)}/profile`;

        console.log('Making request to XSI server for Call Center profile:', url);

        const response = await axios.get(url, {
            headers: { Authorization: authHeader },
        });

        return new Response(JSON.stringify(response.data), { status: 200 });
    } catch (error) {
        console.error('Error fetching call center profile:', error);
        return new Response(JSON.stringify({ error: 'Error fetching call center profile' }), { status: 500 });
    }
}
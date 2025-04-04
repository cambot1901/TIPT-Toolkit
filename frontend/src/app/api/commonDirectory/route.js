import axios from 'axios';

const XSI_SERVER_HOST = 'xsi-actions.tipt.telstra.com';
const USER_ID = '0363248601@localmotorgroup.com.au';
const USERNAME = process.env.XSI_USERNAME;
const PASSWORD = process.env.XSI_PASSWORD;

const authHeader = 'Basic ' + Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

export async function GET(req) {
    const { searchParams } = new URL(req.url);

    try {
        const searchQuery = Object.fromEntries(searchParams.entries());
        const { name } = searchQuery; // Extract 'name' from the query parameters

        const url = `https://${XSI_SERVER_HOST}/com.broadsoft.xsi-actions/v2.0/user/${USER_ID}/directories/groupcommon`;

        console.log(`Fetching group common directory with name filter: ${name}`);

        const response = await axios.get(url, {
            headers: { Authorization: authHeader },
        });

        const data = response.data;

        // Extract the commonPhoneEntry array
        const entries = data?.GroupCommon?.commonPhoneEntry || [];

        // Ensure entries is an array (it might be a single object if there's only one entry)
        const entryArray = Array.isArray(entries) ? entries : [entries];

        // Convert the name filter into a regular expression
        const regex = new RegExp(name.replace(/\*/g, '.*'), 'i'); // Replace '*' with '.*' for wildcard matching

        // Filter the results based on the 'name' parameter using the regex
        const filteredResults = entryArray.filter((entry) =>
            regex.test(entry.name.$)
        );

        // Map the filtered results to the required structure
        const formattedResults = filteredResults.map((entry) => ({
            name: entry.name.$,
            number: entry.number.$,
        }));

        return new Response(JSON.stringify(formattedResults), { status: 200 });
    } catch (error) {
        console.error('Error fetching group common directory:', error);
        return new Response(JSON.stringify({ error: 'Error fetching group common directory' }), { status: 500 });
    }
}
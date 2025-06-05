import axios from 'axios';

const XSI_SERVER_HOST = process.env.XSI_SERVER_HOST;
const KEY_USER_ID = process.env.KEY_USER_ID;
const USERNAME = process.env.XSI_USERNAME;
const PASSWORD = process.env.XSI_PASSWORD;

const authHeader = 'Basic ' + Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

export async function GET(req) {
    const { searchParams } = new URL(req.url);

    try {
        const searchQuery = Object.fromEntries(searchParams.entries());
        const { firstName, groupId } = searchQuery; // Extract groupId from the query parameters

        let start = 1; // Start index for pagination
        const resultsPerPage = 50; // Number of records per request
        let totalAvailableRecords = 0; // Total records available
        let allRecords = []; // Array to store all fetched records

        do {
            // Construct the URL with pagination parameters
            const url = `https://${XSI_SERVER_HOST}/com.broadsoft.xsi-actions/v2.0/user/${KEY_USER_ID}/directories/enterprise`;

            console.log(`Fetching records from start=${start}, results=${resultsPerPage}, groupId=${groupId || 'none'}`);

            const response = await axios.get(url, {
                headers: { Authorization: authHeader },
                params: {
                    firstName,
                    groupId, // Pass groupId to the XSI server if it exists
                    start,
                    results: resultsPerPage,
                },
            });

            const data = response.data;

            // Extract the directory details and add them to the allRecords array
            const directoryDetails = data?.Enterprise?.enterpriseDirectory?.directoryDetails || [];
            allRecords = allRecords.concat(directoryDetails);

            // Update the totalAvailableRecords and increment the start index
            totalAvailableRecords = parseInt(data?.Enterprise?.totalAvailableRecords?.$ || '0', 10);
            start += resultsPerPage;
        } while (allRecords.length < totalAvailableRecords);

        // Return all the records as the response
        return new Response(JSON.stringify(allRecords), { status: 200 });
    } catch (error) {
        console.error('Error fetching user directory:', error);
        return new Response(JSON.stringify({ error: 'Error fetching user directory' }), { status: 500 });
    }
}
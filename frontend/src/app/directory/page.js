'use client'; // Required for client-side rendering in Next.js App Router

import { useEffect, useState } from 'react';
import '../styles/common.css'; // Import the shared CSS file

export default function Directory() {
    const [groups, setGroups] = useState([]); // State to store the groups
    const [selectedGroup, setSelectedGroup] = useState(''); // State for the selected group
    const [searchText, setSearchText] = useState(''); // State for the search text
    const [userResults, setUserResults] = useState([]); // State to store the API results
    const [isLoading, setIsLoading] = useState(false); // State to track loading status
    const [sortConfig, setSortConfig] = useState({ key: 'firstName', direction: 'asc' }); // State for sorting

    // Fetch groups from the /api/group endpoint
    useEffect(() => {
        async function fetchGroups() {
            try {
                const response = await fetch('/api/group');
                if (!response.ok) {
                    throw new Error('Failed to fetch groups');
                }
                const data = await response.json();
                setGroups(data); // Update the state with the fetched groups
            } catch (error) {
                console.error('Error fetching groups:', error);
            }
        }

        fetchGroups();
    }, []); // Empty dependency array ensures this runs only once

    // Handle the "Find" button click or Enter key press
    async function handleFind() {
        try {
            setIsLoading(true); // Show loading indicator
            const modifiedSearchText = `*${searchText}*`;
    
            // Build the query string with the groupId if a group is selected
            let userQueryString = `firstName=${modifiedSearchText}/i`;
            if (selectedGroup) {
                userQueryString += `&groupId=${selectedGroup}`;
            }
    
            // Perform both API calls
            const [userResponse, commonDirectoryResponse] = await Promise.all([
                fetch(`/api/user?${userQueryString}`),
                fetch(`/api/commonDirectory?name=${modifiedSearchText}`),
            ]);
    
            if (!userResponse.ok || !commonDirectoryResponse.ok) {
                throw new Error('Failed to fetch data from one or both APIs');
            }
    
            const userData = await userResponse.json();
            const commonDirectoryData = await commonDirectoryResponse.json();
    
            // Filter out rows containing 'Hunt Group', 'Auto Attendant', or 'Call Center' from user data
            const filteredUserData = userData.filter((entry) => {
                const fullName = `${entry.firstName?.$ || ''} ${entry.lastName?.$ || ''}`.toLowerCase();
                return !(
                    fullName.includes('hunt group') ||
                    fullName.includes('auto attendant') ||
                    fullName.includes('call center') ||
                    fullName.includes('broadworks anywhere') ||
                    fullName.includes('voice messaging group')
                );
            });
    
            // Map the user data to the desired structure
            const formattedUserData = filteredUserData.map((entry) => ({
                firstName: entry.firstName?.$ || '',
                lastName: entry.lastName?.$ || '',
                extension: entry.extension?.$ || '',
                number: entry.number?.$ || '',
                mobile: entry.additionalDetails?.mobile?.$ || 'N/A',
                email: entry.additionalDetails?.emailAddress?.$ || 'N/A',
                title: entry.additionalDetails?.title?.$ || 'N/A',
            }));
    
            // Map the common directory data to the same structure
            const formattedCommonDirectoryData = commonDirectoryData.map((entry) => ({
                firstName: entry.name || '', // Extract name from common directory data
                lastName: '', // No last name in common directory data
                extension: '', // No extension in common directory data
                number: entry.number || '',
                mobile: '', // No mobile in common directory data
                email: '', // No email in common directory data
                title: '', // No title in common directory data
            }));
    
            // Combine the results from both APIs
            const combinedResults = [...formattedUserData, ...formattedCommonDirectoryData];
    
            // Update the state with the combined results
            setUserResults(combinedResults);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false); // Hide loading indicator
        }
    }

    // Handle Enter key press in the search input
    function handleKeyPress(event) {
        if (event.key === 'Enter') {
            handleFind(); // Trigger search when Enter is pressed
        }
    }

    // Handle sorting
    function handleSort(key) {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    }

    // Sort the user results based on the current sort configuration
    const sortedResults = [...userResults].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    return (
        <div>
            <h1>Phone Directory</h1>

            {/* Filtering Block */}
            <div className="filter-block">
                <div className="filter-options">
                    {/* Search Input */}
                    <input
                        type="text"
                        placeholder="Search by first name..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)} // Update search text state
                        onKeyPress={handleKeyPress} // Handle Enter key press
                        className="input-text"
                    />

                    {/* Dropdown */}
                    <select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)} // Update selected group
                        className="dropdown"
                    >
                        <option value="">All Groups</option>
                        {groups.map((group) => (
                            <option key={group.GroupID} value={group.GroupID}>
                                {group.GroupName}
                            </option>
                        ))}
                    </select>

                    {/* Find Button */}
                    <button className="find-button" onClick={handleFind}>
                        Find
                    </button>
                </div>
            </div>

            {/* Loading Indicator */}
            {isLoading && (
                <div className="loading-indicator">
                    Loading...
                </div>
            )}

            {/* Results Section */}
            <div className="results-section">
                {sortedResults.length > 0 ? (
                    <table className="results-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('firstName')}>First Name</th>
                                <th onClick={() => handleSort('lastName')}>Last Name</th>
                                <th onClick={() => handleSort('extension')}>Extension</th>
                                <th onClick={() => handleSort('number')}>Number</th>
                                <th onClick={() => handleSort('mobile')}>Mobile</th>
                                <th onClick={() => handleSort('email')}>Email</th>
                                <th onClick={() => handleSort('title')}>Job Title</th>
                            </tr>
                        </thead>
                        <tbody>
    {sortedResults.map((user, index) => (
        <tr key={index}>
            <td>{user.firstName}</td>
            <td>{user.lastName}</td>
            <td>
                <a href={`tel:${user.extension}`} title="Click to dial">
                    {user.extension}
                </a>
            </td>
            <td>
                <a href={`tel:${user.number}`} title="Click to dial">
                    {user.number}
                </a>
            </td>
            <td>
                {user.mobile !== 'N/A' ? (
                    <a href={`tel:${user.mobile}`} title="Click to dial">
                        {user.mobile}
                    </a>
                ) : (
                    'N/A'
                )}
            </td>
            <td>
                {user.email !== 'N/A' ? (
                    <a href={`mailto:${user.email}`} title="Click to email">
                        {user.email}
                    </a>
                ) : (
                    'N/A'
                )}
            </td>
            <td>{user.title}</td>
        </tr>
    ))}
</tbody>
                    </table>
                ) : (
                    !isLoading && <p>No results found. Try searching for a user.</p>
                )}
            </div>
        </div>
    );
}
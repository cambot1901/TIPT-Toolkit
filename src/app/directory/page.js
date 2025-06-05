// Directory Page with Include Contact List Checkbox
'use client';

import { useEffect, useState } from 'react';
import '../styles/common.css';

export default function Directory() {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [searchText, setSearchText] = useState('');
    const [includeContactList, setIncludeContactList] = useState(true);
    const [userResults, setUserResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'firstName', direction: 'asc' });

    useEffect(() => {
        async function fetchGroups() {
            try {
                const response = await fetch('/api/group');
                const data = await response.json();
                setGroups(data);
            } catch (error) {
                console.error('Error fetching groups:', error);
            }
        }
        fetchGroups();
    }, []);

    async function handleFind() {
        try {
            setIsLoading(true);
            const modifiedSearchText = `*${searchText}*`;
            let userQueryString = `firstName=${modifiedSearchText}/i`;
            if (selectedGroup) userQueryString += `&groupId=${selectedGroup}`;

            const userResponse = await fetch(`/api/user?${userQueryString}`);
            const userData = await userResponse.json();

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

            const formattedUserData = filteredUserData.map((entry) => ({
                firstName: entry.firstName?.$ || '',
                lastName: entry.lastName?.$ || '',
                extension: entry.extension?.$ || '',
                number: entry.number?.$ || '',
                mobile: entry.additionalDetails?.mobile?.$ || 'N/A',
                email: entry.additionalDetails?.emailAddress?.$ || 'N/A',
                title: entry.additionalDetails?.title?.$ || 'N/A',
            }));

            let formattedCommonDirectoryData = [];
            if (includeContactList) {
                const commonDirectoryResponse = await fetch(`/api/commonDirectory?name=${modifiedSearchText}`);
                const commonDirectoryData = await commonDirectoryResponse.json();
                formattedCommonDirectoryData = commonDirectoryData.map((entry) => ({
                    firstName: entry.name || '',
                    lastName: '',
                    extension: '',
                    number: entry.number || '',
                    mobile: '',
                    email: '',
                    title: '',
                }));
            }

            const combinedResults = [...formattedUserData, ...formattedCommonDirectoryData];
            setUserResults(combinedResults);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    }

    function handleKeyPress(event) {
        if (event.key === 'Enter') handleFind();
    }

    function handleSort(key) {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    }

    const sortedResults = [...userResults].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    return (
        <div>
            <h1>Phone Directory</h1>

            <div className="filter-block">
                <div className="filter-options">
                    <input
                        type="text"
                        placeholder="Search by first name..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="input-text"
                    />
                    <select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className="dropdown"
                    >
                        <option value="">All Groups</option>
                        {groups.map((group) => (
                            <option key={group.GroupID} value={group.GroupID}>
                                {group.GroupName}
                            </option>
                        ))}
                    </select>
                    <label>
                        <input
                            type="checkbox"
                            checked={includeContactList}
                            onChange={(e) => setIncludeContactList(e.target.checked)}
                            style={{ marginLeft: '10px', marginRight: '5px' }}
                        />
                        Include Contact List
                    </label>
                    <button className="find-button" onClick={handleFind}>
                        Find
                    </button>
                </div>
            </div>

            {isLoading && <div className="loading-indicator">Loading...</div>}

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
                                    <td><a href={`tel:${user.extension}`}>{user.extension}</a></td>
                                    <td><a href={`tel:${user.number}`}>{user.number}</a></td>
                                    <td>{user.mobile !== 'N/A' ? <a href={`tel:${user.mobile}`}>{user.mobile}</a> : 'N/A'}</td>
                                    <td>{user.email !== 'N/A' ? <a href={`mailto:${user.email}`}>{user.email}</a> : 'N/A'}</td>
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

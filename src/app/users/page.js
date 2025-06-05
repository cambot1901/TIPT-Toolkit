// Users Page with Summaries, Tooltips, Registrations, and Call Center Support (Updated)
'use client';

import { useEffect, useState } from 'react';
import '../styles/common.css';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

export default function Users() {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [searchText, setSearchText] = useState('');
    const [userResults, setUserResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'firstName', direction: 'asc' });
    const [popupData, setPopupData] = useState(null);
    const [popupVisible, setPopupVisible] = useState(false);
    const router = useRouter();
    const [copiedUserId, setCopiedUserId] = useState(null);
    const [activePopover, setActivePopover] = useState(null);
    const [popoverForm, setPopoverForm] = useState({ active: false, forwardTo: '' });
    const [serviceTemplate, setServiceTemplate] = useState(null);
    const [confirmationMessage, setConfirmationMessage] = useState(null);

    useEffect(() => {
        const cookies = document.cookie.split(';').map(c => c.trim());
        const isAuthenticated = cookies.some(c => c === 'admin_auth=true');
        if (!isAuthenticated) {
            router.push('/');
        }
    }, []);

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

            const formattedUserData = userData.map((entry) => ({
                userId: entry.userId?.$ || '',
                extension: entry.extension?.$ || '',
                firstName: entry.firstName?.$ || '',
                lastName: entry.lastName?.$ || '',
                summary: []
            }));

            setUserResults(formattedUserData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchServiceSummaries() {
        const updatedResults = await Promise.all(userResults.map(async (user) => {
            try {
                const res = await fetch(`/api/userServices?userId=${encodeURIComponent(user.userId)}`);
                const json = await res.json();
                const services = json?.Services?.service || [];

                const serviceMap = {
                    'Call Forwarding Always': 'CFA',
                    'Call Forwarding Busy': 'CFB',
                    'Call Forwarding No Answer': 'CFNA',
                    'Call Forwarding Selective': 'CFS',
                    'Call Forwarding Not Reachable': 'CFNR',
                    'Do Not Disturb': 'DND'
                };

                const summaryItems = await Promise.all(
                    Object.entries(serviceMap).map(async ([name, label]) => {
                        const match = services.find(s => s.name?.$ === name);
                        if (match?.uri?.$) {
                            try {
                                const res = await fetch(`/api/serviceDetails?uri=${encodeURIComponent(match.uri.$)}`);
                                const detail = await res.json();
                                const active = detail?.[Object.keys(detail)[0]]?.active?.$ === 'true';
                                const forwardTo = detail?.[Object.keys(detail)[0]]?.forwardToPhoneNumber?.$;
                                return {
                                    label,
                                    active,
                                    forwardTo,
                                    uri: match.uri.$
                                };
                            } catch {
                                return null;
                            }
                        }
                        return null;
                    })
                );

                return { ...user, summary: summaryItems.filter(Boolean) };
            } catch (error) {
                return { ...user, summary: [] };
            }
        }));

        setUserResults(updatedResults);
    }

    async function handlePopoverClick(userId, item) {
        try {
            const res = await fetch(`/api/serviceDetails?uri=${encodeURIComponent(item.uri)}`);
            const detail = await res.json();
            const key = Object.keys(detail)[0];
            setServiceTemplate(detail);
            setActivePopover({ userId, label: item.label, uri: item.uri });
            setPopoverForm({
                active: detail[key]?.active?.$ === 'true',
                forwardTo: detail[key]?.forwardToPhoneNumber?.$ || ''
            });
        } catch (err) {
            console.error('Failed to load service detail:', err);
        }
    }

    async function handleServiceSave() {
        if (!activePopover || !serviceTemplate) return;

        const { service } = extractServiceInfo(activePopover.uri);
        const userId = activePopover.userId;

        const key = Object.keys(serviceTemplate)[0];
        const updated = { ...serviceTemplate };

        updated[key].active = { $: popoverForm.active.toString() };

        if (key !== 'DoNotDisturb') {
            if (popoverForm.active && popoverForm.forwardTo) {
                updated[key].forwardToPhoneNumber = { $: popoverForm.forwardTo };
            } else {
                delete updated[key].forwardToPhoneNumber;
            }
        }

        try {
            const res = await fetch(`/api/updateUserServices?userId=${encodeURIComponent(userId)}&service=${encodeURIComponent(service)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            });

            if (!res.ok) throw new Error('Failed to update service');

            setUserResults(prev => prev.map(user => {
                if (user.userId !== userId) return user;
                return {
                    ...user,
                    summary: user.summary.map(s =>
                        s.label === activePopover.label
                            ? { ...s, active: popoverForm.active, forwardTo: popoverForm.forwardTo }
                            : s
                    )
                };
            }));

            setConfirmationMessage('Service updated!');
            setTimeout(() => setConfirmationMessage(null), 2000);
            setActivePopover(null);
            setServiceTemplate(null);
        } catch (err) {
            console.error('Error updating service:', err);
            alert('Error updating service.');
        }
    }

    function extractServiceInfo(uri) {
        const parts = uri.split('/');
        const service = parts[parts.length - 1];
        return { service };
    }

    const sortedResults = [...userResults].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    return (
        <div>
            <h1>Users List</h1>
            
            <div className="filter-block">
                <div className="filter-options">
                    <input
                        type="text"
                        placeholder="Search by first name..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleFind()}
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
                    <button className="find-button" onClick={handleFind}>Find</button>
                    <button className="find-button" onClick={fetchServiceSummaries}>Get Service Status Summary</button>
                    {confirmationMessage && (
                <div style={{ color: 'green', marginBottom: '0.5rem', fontWeight: 'bold' }}>{confirmationMessage}</div>
            )}
                </div>
            </div>

            {isLoading && <div className="loading-indicator">Loading...</div>}

            <div className="results-section">
                {sortedResults.length > 0 ? (
                    <table className="results-table">
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Extension</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Summary</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedResults.map((user) => (
                                <tr key={user.userId}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            {user.userId}
                                            <button
                                                title="Copy User ID"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(user.userId).then(() => {
                                                        setCopiedUserId(user.userId);
                                                        setTimeout(() => setCopiedUserId(null), 2000);
                                                    });
                                                }}
                                                style={{ marginLeft: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                <FontAwesomeIcon icon={faCopy} style={{ color: '#888' }} />
                                            </button>
                                            {copiedUserId === user.userId && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#0a0' }}>Copied!</span>}
                                        </div>
                                    </td>
                                    <td>{user.extension}</td>
                                    <td>{user.firstName}</td>
                                    <td>{user.lastName}</td>
                                    <td>
                                        {user.summary.map((item) => (
                                            <span
                                                key={item.label}
                                                style={{
                                                    marginRight: '0.5rem',
                                                    color: item.active ? 'green' : 'gray',
                                                    fontWeight: item.active ? 'bold' : 'normal',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => handlePopoverClick(user.userId, item)}
                                            >
                                                {item.label}
                                            </span>
                                        ))}
                                        {activePopover?.userId === user.userId && (
                                            <div style={{ position: 'relative' }}>
                                                <div style={{ position: 'absolute', backgroundColor: '#fff', border: '1px solid #ccc', padding: '0.5rem', borderRadius: '6px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', zIndex: 100, minWidth: '220px', marginTop: '0.5rem' }}>
                                                    <div style={{ marginBottom: '0.5rem' }}>
                                                        <label>
                                                            <input
                                                                type="checkbox"
                                                                checked={popoverForm.active}
                                                                onChange={(e) => setPopoverForm(prev => ({ ...prev, active: e.target.checked }))}
                                                            /> Enable
                                                        </label>
                                                    </div>
                                                    {popoverForm.active && activePopover.label !== 'DND' && (
                                                        <div style={{ marginBottom: '0.5rem' }}>
                                                            <input
                                                                type="text"
                                                                placeholder="Forward to number"
                                                                value={popoverForm.forwardTo}
                                                                onChange={(e) => setPopoverForm(prev => ({ ...prev, forwardTo: e.target.value }))}
                                                                style={{ width: '100%' }}
                                                            />
                                                        </div>
                                                    )}
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                        <button onClick={handleServiceSave}>Save</button>
                                                        <button onClick={() => setActivePopover(null)}>Cancel</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </td>
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

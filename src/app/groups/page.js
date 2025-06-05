'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Plus, Save, X } from 'lucide-react';
import '../styles/common.css';

export default function GroupsPage() {
    const router = useRouter();

    // Redirect if not authenticated
    useEffect(() => {
        const cookies = document.cookie.split(';').map(c => c.trim());
        const isAuthenticated = cookies.some(c => c === 'admin_auth=true');

        if (!isAuthenticated) {
            router.push('/');
        }
    }, []);

    const [groups, setGroups] = useState([]);
    const [groupID, setGroupID] = useState('');
    const [groupName, setGroupName] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [editGroupID, setEditGroupID] = useState('');
    const [editGroupName, setEditGroupName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        setLoading(true);
        const res = await fetch('/api/groups');
        if (res.status === 401) {
            router.push('/');
            return;
        }
        const data = await res.json();
        setGroups(data);
        setLoading(false);
    };

    const addGroup = async () => {
        const res = await fetch('/api/groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ GroupID: groupID, GroupName: groupName })
        });

        if (res.ok) {
            setGroupID('');
            setGroupName('');
            fetchGroups();
        } else {
            alert('Failed to add group');
        }
    };

    const deleteGroup = async (id) => {
        const confirmed = window.confirm('Are you sure you want to delete this group?');
        if (!confirmed) return;

        const res = await fetch(`/api/groups/${id}`, { method: 'DELETE' });

        if (res.ok) {
            fetchGroups();
        } else {
            alert('Failed to delete group');
        }
    };

    const startEditing = (index) => {
        setEditingIndex(index);
        setEditGroupID(groups[index].GroupID);
        setEditGroupName(groups[index].GroupName);
    };

    const cancelEditing = () => {
        setEditingIndex(null);
        setEditGroupID('');
        setEditGroupName('');
    };

    const saveEdit = async () => {
        const res = await fetch(`/api/groups/${editGroupID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ GroupName: editGroupName })
        });

        if (res.ok) {
            cancelEditing();
            fetchGroups();
        } else {
            alert('Failed to update group');
        }
    };

    return (
        <div>
            <h1>Groups</h1>
            {loading ? (
                <p className="loading-indicator">Loading groups...</p>
            ) : (
                <table className="results-table">
                    <thead>
                        <tr>
                            <th>Group ID</th>
                            <th>Group Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groups.map((group, index) => (
                            <tr key={index}>
                                <td>{group.GroupID}</td>
                                <td>
                                    {editingIndex === index ? (
                                        <input
                                            type="text"
                                            value={editGroupName}
                                            onChange={(e) => setEditGroupName(e.target.value)}
                                            className="input-text"
                                        />
                                    ) : (
                                        group.GroupName
                                    )}
                                </td>
                                <td>
                                    {editingIndex === index ? (
                                        <>
                                            <button className="icon-button" title="Save" onClick={saveEdit}><Save size={16} /></button>
                                            <button className="icon-button" title="Cancel" onClick={cancelEditing}><X size={16} /></button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="icon-button" title="Edit" onClick={() => startEditing(index)}><Pencil size={16} /></button>
                                            <button className="icon-button" title="Delete" onClick={() => deleteGroup(group.GroupID)}><Trash2 size={16} /></button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td>
                                <input
                                    type="text"
                                    placeholder="Group ID"
                                    value={groupID}
                                    onChange={(e) => setGroupID(e.target.value)}
                                    className="input-text"
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    placeholder="Group Name"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="input-text"
                                />
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                <button className="icon-button" onClick={addGroup} title="Add"><Plus size={16} /></button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            )}
        </div>
    );
}

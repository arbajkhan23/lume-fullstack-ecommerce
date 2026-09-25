import React, { useCallback, useEffect, useState } from 'react';
import { Mail, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../layouts/AdminLayout';
import DataTable from '../../components/DataTable';
import api from '../../api/axios';

export default function ContactList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.get('/contact')
      .then((res) => setRows(res.data.data || []))
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (message) => {
    try {
      await api.patch(`/contact/${message._id}/read`);
      setRows((current) => current.map((row) => (
        row._id === message._id ? { ...row, isRead: true } : row
      )));
    } catch {
      toast.error('Unable to mark message as read');
    }
  };

  const filteredRows = rows.filter((row) => {
    const value = `${row.name} ${row.email} ${row.subject} ${row.message}`.toLowerCase();
    return value.includes(search.toLowerCase());
  });

  const columns = [
    { key: 'status', label: '', render: (row) => row.isRead ? <Check size={15} className="text-success" /> : <Mail size={15} className="text-accent" /> },
    { key: 'name', label: 'From', render: (row) => <div><p className="font-medium">{row.name}</p><p className="text-xs text-muted">{row.email}</p></div> },
    { key: 'subject', label: 'Subject' },
    { key: 'message', label: 'Message', render: (row) => <span className="text-muted line-clamp-2">{row.message}</span> },
    { key: 'date', label: 'Received', render: (row) => new Date(row.createdAt).toLocaleString() },
    { key: 'actions', label: '', render: (row) => !row.isRead && <button onClick={() => markRead(row)} className="btn-ghost !text-xs">Mark read</button> },
  ];

  return (
    <AdminLayout title="Contact Messages">
      <DataTable
        columns={columns}
        rows={filteredRows}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search messages…"
        emptyMessage="No contact messages found."
      />
    </AdminLayout>
  );
}

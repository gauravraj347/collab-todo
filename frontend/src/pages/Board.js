import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Board.css';

const API = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : '/api';

const STATUS = ['Todo', 'In Progress', 'Done'];

function getToken() {
  return localStorage.getItem('token');
}

function fetchWithAuth(url, opts = {}) {
  return fetch(url, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
}

export default function Board() {
  const username = localStorage.getItem('username');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  
  // Redirect to login if no token
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
  }, [token, navigate]);
  
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [actions, setActions] = useState([]);
  const [showLog, setShowLog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({});
  const [conflict, setConflict] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium' });
  const socketRef = useRef();
  const [loading, setLoading] = useState(true);
  
  // Socket.IO setup with error handling
  useEffect(() => {
    let socket;
    try {
      const io = require('socket.io-client');
      const socketUrl = process.env.REACT_APP_SOCKET_URL || '/';
      socket = io(socketUrl, { transports: ['websocket'] });
      socket.on('task:update', loadAll);
      socketRef.current = socket;
    } catch (error) {
      console.warn('Socket.IO not available:', error);
    }
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Load all data
  function loadAll() {
    setLoading(true);
    console.log('Loading data...');
    
    Promise.all([
      fetchWithAuth(`${API}/tasks`)
        .then(r => {
          console.log('Tasks response:', r.status);
          if (!r.ok) throw new Error(`Tasks: ${r.status}`);
          return r.json();
        }),
      fetchWithAuth(`${API}/users`)
        .then(r => {
          console.log('Users response:', r.status);
          if (!r.ok) throw new Error(`Users: ${r.status}`);
          return r.json();
        }),
      fetchWithAuth(`${API}/actions`)
        .then(r => {
          console.log('Actions response:', r.status);
          if (!r.ok) throw new Error(`Actions: ${r.status}`);
          return r.json();
        })
    ])
    .then(([tasksData, usersData, actionsData]) => {
      setTasks(tasksData);
      setUsers(usersData);
      setActions(actionsData);
      setLoading(false);
    })
    .catch(err => {
      console.error('Error loading data:', err);
      alert('Error loading data: ' + err.message);
      setLoading(false);
    });
  }
  
  useEffect(loadAll, []);

  function logout() {
    localStorage.clear();
    navigate('/login');
  }

  async function handleCreate(e) {
    e.preventDefault();
    const res = await fetchWithAuth(`${API}/tasks`, {
      method: 'POST',
      body: JSON.stringify(newTask),
    });
    if (res.ok) {
      setNewTask({ title: '', description: '', priority: 'Medium' });
      loadAll();
    } else {
      alert((await res.json()).message);
    }
  }

  function startEdit(task) {
    setEditing(task._id);
    setEditData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo?._id || task.assignedTo,
      version: task.version
    });
    setConflict(null);
  }

  function cancelEdit() {
    setEditing(null);
    setEditData({});
    setConflict(null);
  }

  async function handleEditSave() {
    const payload = {
      title: editData.title,
      description: editData.description,
      priority: editData.priority,
      status: editData.status,
      assignedTo: editData.assignedTo && editData.assignedTo !== "" ? editData.assignedTo : null,
      version: editData.version
    };
    const res = await fetchWithAuth(`${API}/tasks/${editing}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (res.status === 409) {
      const data = await res.json();
      setConflict(data);
      return;
    }
    if (res.ok) {
      cancelEdit();
      loadAll();
    } else {
      alert((await res.json()).message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this task?')) return;
    await fetchWithAuth(`${API}/tasks/${id}`, { method: 'DELETE' });
    loadAll();
  }

  async function handleSmartAssign(id) {
    await fetchWithAuth(`${API}/tasks/${id}/smart-assign`, { method: 'POST' });
    loadAll();
  }

  function onDragStart(e, task) {
    e.dataTransfer.setData('taskId', task._id);
  }
  
  async function onDrop(e, status) {
    const id = e.dataTransfer.getData('taskId');
    const task = tasks.find(t => t._id === id);
    if (task.status !== status) {
      await fetchWithAuth(`${API}/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: status,
          assignedTo: task.assignedTo?._id || task.assignedTo,
          version: task.version 
        }),
      });
      loadAll();
    }
  }

  function renderConflict() {
    if (!conflict) return null;
    return (
      <div className="conflict-modal">
        <h3>Conflict Detected</h3>
        <div className="conflict-versions">
          <div>
            <b>Server Version</b>
            <pre>{JSON.stringify(conflict.serverTask, null, 2)}</pre>
          </div>
          <div>
            <b>Your Version</b>
            <pre>{JSON.stringify(conflict.clientTask, null, 2)}</pre>
          </div>
        </div>
        <button onClick={() => {
          setEditData({
            title: conflict.serverTask.title,
            description: conflict.serverTask.description,
            priority: conflict.serverTask.priority,
            status: conflict.serverTask.status,
            assignedTo: conflict.serverTask.assignedTo,
            version: conflict.serverTask.version
          });
          setConflict(null);
        }}>Use Server Version</button>
        <button onClick={() => {
          setEditData({
            title: conflict.clientTask.title,
            description: conflict.clientTask.description,
            priority: conflict.clientTask.priority,
            status: conflict.clientTask.status,
            assignedTo: conflict.clientTask.assignedTo,
            version: conflict.clientTask.version
          });
          setConflict(null);
        }}>Keep My Version</button>
        <button onClick={cancelEdit}>Cancel</button>
      </div>
    );
  }

  function renderColumn(status) {
    return (
      <div
        key={status}
        className="board-column"
        onDragOver={e => e.preventDefault()}
        onDrop={e => onDrop(e, status)}
      >
        <h3>{status}</h3>
        {tasks.filter(t => t.status === status).map(task => (
          <div
            key={task._id}
            className={`task-card priority-${task.priority.toLowerCase()}`}
            draggable
            onDragStart={e => onDragStart(e, task)}
          >
            {editing === task._id ? (
              <div className="edit-task-form">
                <input value={editData.title} onChange={e => setEditData(d => ({ ...d, title: e.target.value }))} />
                <textarea value={editData.description} onChange={e => setEditData(d => ({ ...d, description: e.target.value }))} />
                <select value={editData.priority} onChange={e => setEditData(d => ({ ...d, priority: e.target.value }))}>
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
                <select value={editData.assignedTo?._id || editData.assignedTo || ''} onChange={e => setEditData(d => ({ ...d, assignedTo: e.target.value || null }))}>
                  <option value="">Unassigned</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.username}</option>)}
                </select>
                <button onClick={handleEditSave}>Save</button>
                <button onClick={cancelEdit}>Cancel</button>
              </div>
            ) : (
              <>
                <div className="task-content">
                  <div className="task-title">{task.title}</div>
                  {task.description && <div className="task-description">{task.description}</div>}
                  <div className="task-meta">
                    <span>Priority: {task.priority}</span>
                    <span>Assigned: {task.assignedTo?.username || 'Unassigned'}</span>
                  </div>
                </div>
                <div className="task-actions">
                  <button onClick={() => startEdit(task)}>Edit</button>
                  <button onClick={() => handleDelete(task._id)}>Delete</button>
                  <button onClick={() => handleSmartAssign(task._id)} className="smart-assign-btn">Smart Assign</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="board-root">
      <header>
        <h1>Collaborative To-Do Board</h1>
        <div>Welcome, <b>{username}</b>!</div>
        <button onClick={logout}>Logout</button>
        <button onClick={() => setShowLog(l => !l)}>{showLog ? 'Hide' : 'Show'} Activity Log</button>
      </header>
      <div className="board-main">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', fontSize: '1.2rem' }}>
            Loading board data...
          </div>
        ) : (
          <>
            <form className="new-task-form" onSubmit={handleCreate}>
              <input placeholder="Title" value={newTask.title} onChange={e => setNewTask(d => ({ ...d, title: e.target.value }))} required />
              <textarea placeholder="Description" value={newTask.description} onChange={e => setNewTask(d => ({ ...d, description: e.target.value }))} />
              <select value={newTask.priority} onChange={e => setNewTask(d => ({ ...d, priority: e.target.value }))}>
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
              <button type="submit">Add Task</button>
            </form>
            <div className="board-columns">
              {STATUS.map(renderColumn)}
            </div>
            {renderConflict()}
            {showLog && (
              <div className="activity-log-panel">
                <h3>Last 20 Actions</h3>
                <ul>
                  {actions.map(a => (
                    <li key={a._id} className={`log-item log-${a.action}`}>
                      <span className="log-main">
                        <b>{capitalize(a.action)}</b> by <span className="log-user">{a.user?.username || 'unknown'}</span> on <span className="log-task">{a.task?.title || 'task'}</span>
                        <br />
                        <span className="log-time">{new Date(a.createdAt).toLocaleString()}</span>
                        {a.details && <div className="log-details">{a.details}</div>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

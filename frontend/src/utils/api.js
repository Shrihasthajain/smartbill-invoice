import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

export const getItems = () => API.get('/items');
export const createItem = (data) => API.post('/items', data);
export const updateItem = (id, data) => API.put(`/items/${id}`, data);
export const deleteItem = (id) => API.delete(`/items/${id}`);

export const getInvoices = () => API.get('/invoices');
export const getInvoice = (id) => API.get(`/invoices/${id}`);
export const createInvoice = (data) => API.post('/invoices', data);
export const downloadPDF = (id) => `http://localhost:5000/api/invoices/${id}/pdf`;

export default API;
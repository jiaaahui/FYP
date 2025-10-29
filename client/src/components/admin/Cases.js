import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, User, FileText, Calendar } from 'lucide-react';
import {
    getAllCases,
    getAllEmployees,
    updateCases
} from "../../services/informationService";

export default function Cases() {
    const [cases, setCases] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedCases, setSelectedCases] = useState(null);

    // Load data from Firebase
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [fetchedcases, fetchedEmployees] = await Promise.all([
                    getAllCases(),
                    getAllEmployees()
                ]);
                setCases(fetchedcases);
                setEmployees(fetchedEmployees);
            } catch (error) {
                console.error('Error loading data:', error);
            }
            setLoading(false);
        };
        loadData();
    }, []);

    const getEmployeeName = (employeeId) => {
        const employee = employees.find(emp => emp.EmployeeID === employeeId);
        return employee ? employee.name : 'Unknown Employee';
    };

    const updateCasesStatus = async (CasesId, newStatus) => {
        try {
            await updateCases(CasesId, { Status: newStatus });
            setCases(prevcases =>
                prevcases.map(Cases =>
                    Cases.CasesID === CasesId
                        ? { ...Cases, Status: newStatus }
                        : Cases
                )
            );
            if (selectedCases && selectedCases.CasesID === CasesId) {
                setSelectedCases(null);
            }
        } catch (error) {
            console.error('Error updating Cases status:', error);
        }
    };

    const filteredCases = cases.filter(cases => {
        if (filter === 'all') return true;
        return Cases.Status === filter;
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'resolved': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
            default: return <AlertTriangle className="w-4 h-4 text-red-600" />;
        }
    };

    const formatDate = (dateCasesed) => {
        if (!dateCasesed) return '';

        if (dateCasesed && typeof dateCasesed.toDate === "function") {
            const d = dateCasesed.toDate();
            return d.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        }

        return String(dateCasesed);
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading Cases...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-2 lg:px-2 py-2">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-3">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pending Issues</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {cases.filter(r => r.Status === 'pending').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Resolved Issues</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {cases.filter(r => r.Status === 'resolved').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total </p>
                                <p className="text-2xl font-bold text-gray-900">{cases.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            {[
                                { key: 'all', label: 'All Cases' },
                                { key: 'pending', label: 'Pending' },
                                { key: 'resolved', label: 'Resolved' }
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilter(tab.key)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${filter === tab.key
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Cases Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        #
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Employee
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Issue Content
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date Casesed
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCases.map((Cases, idx) => (
                                    <tr key={Cases.CasesID} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {idx + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <User className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-900">{getEmployeeName(Cases.EmployeeID)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs truncate">
                                                {Cases.Content}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {getStatusIcon(Cases.Status)}
                                                <span className="ml-2 text-sm text-gray-900 capitalize">{Cases.Status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {formatDate(Cases.DateCasesed)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => setSelectedCases(Cases)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                View
                                            </button>
                                            {Cases.Status === 'pending' && (
                                                <button
                                                    onClick={() => updateCasesStatus(Cases.CasesID, 'resolved')}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Mark Resolved
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {filteredCases.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No Cases found for the selected filter.</p>
                    </div>
                )}
            </div>

            {/* Cases Detail Modal */}
            {selectedCases && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Cases Details</h3>
                                <button
                                    onClick={() => setSelectedCases(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Don't show Cases ID */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Employee</label>
                                    <p className="mt-1 text-sm text-gray-900">{getEmployeeName(selectedCases.EmployeeID)}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Issue Description</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedCases.Content}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <div className="flex items-center mt-1">
                                        {getStatusIcon(selectedCases.Status)}
                                        <span className="ml-2 text-sm text-gray-900 capitalize">{selectedCases.Status}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date Casesed</label>
                                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedCases.DateCasesed)}</p>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setSelectedCases(null)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                >
                                    Close
                                </button>
                                {selectedCases.Status === 'pending' && (
                                    <button
                                        onClick={() => updateCasesStatus(selectedCases.CasesID, 'resolved')}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        Mark as Resolved
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const DataTable = ({ columns, data, onEdit, onDelete }) => {
    return (
        <div className="w-full overflow-hidden bg-gray-900 border border-purple-500/20 rounded-xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-purple-900/20 border-b border-purple-500/20">
                            {columns.map((col, index) => (
                                <th key={index} className="p-4 text-sm font-semibold text-purple-200 uppercase tracking-wider">
                                    {col.header}
                                </th>
                            ))}
                            <th className="p-4 text-sm font-semibold text-purple-200 uppercase tracking-wider text-right">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/10">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="p-8 text-center text-gray-400">
                                    No data available.
                                </td>
                            </tr>
                        ) : (
                            data.map((item, rowIndex) => (
                                <tr key={item.id || rowIndex} className="hover:bg-purple-500/5 transition-colors">
                                    {columns.map((col, colIndex) => (
                                        <td key={colIndex} className="p-4 text-gray-300">
                                            {col.render ? col.render(item) : item[col.accessor]}
                                        </td>
                                    ))}
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => onEdit(item)}
                                                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <FiEdit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(item)}
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;

import React, { useEffect, useState } from 'react';
import {
    FiClipboard,
    FiBox,
    FiTag,
    FiMoreHorizontal
} from 'react-icons/fi';

const StatCard = ({ label, value, subValue, icon: Icon }) => (
    <div className="bg-[#111] p-6 rounded-xl border border-[#222] relative group hover:border-purple-500 transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[#1a1a1a] rounded-lg text-white group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Icon size={20} />
            </div>
        </div>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</h3>
        {subValue && <p className="text-xs font-medium text-gray-400">{subValue}</p>}
    </div>
);

const SummaryWidget = ({ title, value, label1, label2, color1, color2 }) => (
    <div className="bg-[#111] p-6 rounded-xl border border-[#222] h-full flex flex-col justify-between">
        <div>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2">{title}</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        </div>

        <div className="space-y-4 mt-6">
            <div className="h-px bg-[#222] w-full"></div>
            <div>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2">{label1}</p>
                <h3 className="text-2xl font-bold text-white tracking-tight">{label2}</h3>
            </div>
            <div className="flex items-center gap-4 text-xs mt-4">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 ${color1} rounded-sm`}></span>
                    <span className="text-gray-400 uppercase font-bold tracking-wider">Sold</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 ${color2} rounded-sm`}></span>
                    <span className="text-gray-400 uppercase font-bold tracking-wider">Remaining</span>
                </div>
            </div>

            <div className="flex h-2 rounded-full overflow-hidden mt-2 bg-[#1a1a1a]">
                <div className={`w-2/3 ${color1}`}></div>
                <div className={`w-1/3 ${color2}`}></div>
            </div>
        </div>
    </div>
);

const ChartBar = ({ height, label, isHighlighted }) => (
    <div className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
        {isHighlighted && (
            <div className="mb-1 px-2 py-1 bg-purple-600 text-white text-[10px] font-bold rounded shadow-lg transform -translate-y-1">
                65 leads
            </div>
        )}
        <div className="w-full h-40 relative flex items-end justify-center">
            {/* Track */}
            <div className="absolute inset-x-2 bottom-0 top-0 bg-[#151515] rounded-t-sm group-hover:bg-[#1a1a1a] transition-colors"></div>
            {/* Bar */}
            <div
                className={`w-[60%] z-10 rounded-t-sm transition-all duration-500 ${isHighlighted ? 'bg-purple-600' : 'bg-[#333] group-hover:bg-[#555]'}`}
                style={{ height: height }}
            ></div>
        </div>
        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{label}</span>
    </div>
);

const AdminDashboard = () => {
    return (
        <div className="grid grid-cols-12 gap-8 h-full">
            {/* Left Column (8 cols) */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">

                {/* Top Row Stats */}
                <div className="grid grid-cols-3 gap-6">
                    <StatCard
                        label="Active Students"
                        value="2,543"
                        subValue="+12% this month"
                        icon={FiClipboard}
                    />
                    <StatCard
                        label="Workshops Held"
                        value="128"
                        subValue="28 upcoming"
                        icon={FiBox}
                    />
                    <StatCard
                        label="Avg. Price"
                        value="$42"
                        icon={FiTag}
                        subValue="Per enrollment"
                    />
                </div>

                {/* Middle Row: Status Units */}
                <div className="bg-[#111] p-8 rounded-xl border border-[#222]">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-bold text-white">Course Completion Status</h3>
                        <FiMoreHorizontal className="text-gray-600 cursor-pointer hover:text-white" />
                    </div>

                    <div className="flex justify-between text-center divide-x divide-[#222] mb-8">
                        <div className="px-4 flex-1 text-left">
                            <h4 className="text-2xl font-bold text-white">18</h4>
                            <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-wider">Available</p>
                        </div>
                        <div className="px-4 flex-1 text-left pl-8">
                            <h4 className="text-2xl font-bold text-white">21</h4>
                            <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-wider">Reserved</p>
                        </div>
                        <div className="px-4 flex-1 text-left pl-8">
                            <h4 className="text-2xl font-bold text-white">11</h4>
                            <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-wider">Offered</p>
                        </div>
                        <div className="px-4 flex-1 text-left pl-8">
                            <h4 className="text-2xl font-bold text-white">28</h4>
                            <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-wider">Sold</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex h-12 w-full rounded-lg overflow-hidden gap-1 p-1 bg-[#0a0a0a] border border-[#222]">
                        <div className="h-full w-[20%] bg-purple-600 rounded-sm"></div>
                        <div className="h-full w-[30%] bg-[#777] rounded-sm"></div>
                        <div className="h-full w-[15%] bg-[#333] rounded-sm"></div>
                        <div className="h-full w-[35%] bg-[#1a1a1a] rounded-sm"></div>
                    </div>
                </div>

                {/* Bottom Row: Chart */}
                <div className="bg-[#111] p-8 rounded-xl border border-[#222] flex-1 min-h-[300px]">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-bold text-white">Total Leads by Day</h3>
                        <div className="flex gap-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 cursor-pointer hover:text-white">Canada</span>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 cursor-pointer hover:text-white">This month</span>
                        </div>
                    </div>

                    <div className="flex items-end gap-2 h-44 w-full px-2">
                        <div className="flex flex-col justify-between h-full text-[10px] font-bold text-gray-600 py-2 pr-4 text-right">
                            <span>100</span>
                            <span>80</span>
                            <span>60</span>
                            <span>40</span>
                            <span>20</span>
                            <span>0</span>
                        </div>
                        {/* Simulated Data */}
                        {['1 May', '3 May', '5 May', '7 May', '9 May', '11 May', '13 May', '15 May', '17 May'].map((date, i) => (
                            <React.Fragment key={i}>
                                <ChartBar height={`${Math.random() * 60 + 20}%`} label={date} isHighlighted={i === 5} />
                                <ChartBar height={`${Math.random() * 60 + 20}%`} label="" />
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column (4 cols) */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                <SummaryWidget
                    title="Remaining Units"
                    value="18"
                    label1="Total Amount"
                    label2="CA$11,273,000"
                    color1="bg-[#333]"
                    color2="bg-purple-600"
                />
                <div className="bg-[#111] p-6 rounded-xl border border-[#222] flex-1">
                    <h3 className="text-lg font-bold text-white mb-6">Quick Stats</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#1a1a1a] transition-colors cursor-pointer group border border-transparent hover:border-[#222]">
                                <div className="w-10 h-10 rounded bg-[#1a1a1a] group-hover:bg-purple-600 flex items-center justify-center transition-colors">
                                    <FiTag size={16} className="text-gray-500 group-hover:text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">New Enrollment</p>
                                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">2 minutes ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

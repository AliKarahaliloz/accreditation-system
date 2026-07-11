"use client";

import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { CriterionTreeResponse } from '../types/criterion';
import { ChevronRight, ChevronDown, FolderTree } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import clsx from 'clsx';

const TreeNode = ({ node, level = 0 }: { node: CriterionTreeResponse, level?: number }) => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const hasChildren = node.subCriteria && node.subCriteria.length > 0;
    
    const isActive = pathname === `/dashboard/criteria/${node.code}`;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasChildren && !isOpen) {
            setIsOpen(true);
        }
        router.push(`/dashboard/criteria/${node.code}`);
    };

    return (
        <div className="flex flex-col w-full">
            <div 
                className={clsx(
                    "flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer transition-all duration-200 text-sm",
                    isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                onClick={handleClick}
            >
                {hasChildren ? (
                    <button 
                        onClick={handleToggle} 
                        className={clsx(
                            "p-0.5 rounded transition-colors",
                            isActive ? "hover:bg-blue-700 text-blue-100" : "hover:bg-slate-700 text-slate-400"
                        )}
                    >
                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                ) : (
                    <span className="w-4" />
                )}
                
                <span className="truncate w-full pr-2 text-[13px]" title={`${node.code} - ${node.title}`}>
                    <span className={clsx("font-mono mr-1.5 font-bold", isActive ? "text-blue-200" : "text-slate-400")}>{node.code}</span>
                    {node.title}
                </span>
            </div>
            
            {isOpen && hasChildren && (
                <div className="flex flex-col mt-0.5">
                    {node.subCriteria.map(subNode => (
                        <TreeNode key={subNode.id} node={subNode} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function SidebarCriteriaTree() {
    const [tree, setTree] = useState<CriterionTreeResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTree = async () => {
            try {
                const response = await api.get('/api/v1/criteria/tree');
                setTree(response.data);
            } catch (error) {
                console.error("Ölçütler yüklenirken hata:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTree();
    }, []);

    if (loading) {
        return <div className="px-4 py-8 flex justify-center"><div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
    }

    if (tree.length === 0) {
        return null;
    }

    return (
        <div className="mt-6 mb-2 flex flex-col overflow-hidden">
            <div className="px-5 mb-3 flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <FolderTree size={14} />
                MEDEK ÖLÇÜTLERİ
            </div>
            <div className="px-2 flex flex-col w-full overflow-hidden">
                {tree.map(node => (
                    <TreeNode key={node.id} node={node} />
                ))}
            </div>
        </div>
    );
}

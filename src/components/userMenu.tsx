import React from 'react';
import { useMainStore } from '../store/main';

const UserMenu: React.FC = () => {
    const { userInfo } = useMainStore();

    return (
        <div className="flex items-center justify-between p-4 bg-gray-100">
            <span className="font-semibold text-purple">{userInfo.username}</span>
            <a 
                className="bg-red text-white px-2 py-1 rounded-sm" 
                href="https://www.test.odoo.com/web/session/logout" 
                target="_blank" 
                rel="noopener noreferrer"
            >
                Log out
            </a>
        </div>
    );
};

export default UserMenu;
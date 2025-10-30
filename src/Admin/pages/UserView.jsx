import React, { useEffect, useState } from 'react';
import { Card } from 'antd';
import UsersTable from '../component/UserTable';
import { getUsers } from '../api/db';


export default function UsersView() {
    const [users, setUsers] = useState([]);
    useEffect(() => { async function load(){ 
        const u = await getUsers(); setUsers(u);
    } load(); }, []);
    return (
        <section>
            <h2>Users</h2>
            <Card>
                <UsersTable users={users} />
            </Card>
        </section>
    );
}